<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private string $privateKey = '';

    private array $publicKey;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.google.client_id' => 'test-client.apps.googleusercontent.com', 'services.google.client_secret' => 'test-only-secret',
            'services.google.redirect' => 'http://localhost:8000/auth/google/callback']);
        Http::preventStrayRequests();
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $this->privateKey);
        $details = openssl_pkey_get_details($key);
        $encode = fn ($value) => rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
        $this->publicKey = ['kty' => 'RSA', 'kid' => 'testing-key', 'alg' => 'RS256', 'use' => 'sig',
            'n' => $encode($details['rsa']['n']), 'e' => $encode($details['rsa']['e'])];
    }

    private function flow(): array
    {
        return ['state' => 'state-for-this-session', 'nonce' => 'nonce-for-this-session', 'verifier' => str_repeat('v', 96),
            'expires_at' => now()->addMinutes(10)->timestamp];
    }

    private function mockIdentity(array $changes = [], ?string $signingKey = null): void
    {
        $claims = array_merge(['iss' => 'https://accounts.google.com', 'aud' => config('services.google.client_id'),
            'sub' => 'google-subject-123', 'email' => 'student@example.test', 'email_verified' => true,
            'name' => 'Google Student', 'nonce' => $this->flow()['nonce'], 'iat' => time() - 5, 'exp' => time() + 3600], $changes);
        $token = JWT::encode($claims, $signingKey ?? $this->privateKey, 'RS256', 'testing-key');
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['id_token' => $token, 'access_token' => 'not-stored']),
            'https://www.googleapis.com/oauth2/v3/certs' => Http::response(['keys' => [$this->publicKey]], 200, ['Cache-Control' => 'max-age=3600']),
        ]);
    }

    private function completeGoogleLogin()
    {
        return $this->withSession(['google_login' => $this->flow()])->get('/auth/google/callback?state=state-for-this-session&code=test-code');
    }

    public function test_google_is_optional_and_never_exposes_the_client_secret(): void
    {
        $this->get('/login')->assertInertia(fn (Assert $page) => $page->where('googleLoginEnabled', true)->missing('client_secret'));
        config(['services.google.client_secret' => null]);
        $this->get('/login')->assertInertia(fn (Assert $page) => $page->where('googleLoginEnabled', false));
        $this->get('/auth/google')->assertRedirect('/login')->assertSessionHasErrors('google');
        Http::assertNothingSent();
    }

    public function test_redirect_uses_state_nonce_pkce_and_only_basic_scopes(): void
    {
        $response = $this->get('/auth/google');
        $url = parse_url($response->headers->get('Location'));
        $this->assertSame('accounts.google.com', $url['host']);
        parse_str($url['query'], $query);
        $flow = session('google_login');
        $this->assertSame($flow['state'], $query['state']);
        $this->assertSame($flow['nonce'], $query['nonce']);
        $this->assertSame('S256', $query['code_challenge_method']);
        $this->assertSame(rtrim(strtr(base64_encode(hash('sha256', $flow['verifier'], true)), '+/', '-_'), '='), $query['code_challenge']);
        $this->assertSame('openid email profile', $query['scope']);
        $this->assertSame(config('services.google.redirect'), $query['redirect_uri']);
        $this->assertArrayNotHasKey('client_secret', $query);
    }

    public function test_callback_without_state_or_with_a_wrong_or_expired_state_cannot_log_in(): void
    {
        $this->get('/auth/google/callback?code=test')->assertRedirect('/login')->assertSessionHasErrors('google');
        $this->withSession(['google_login' => $this->flow()])->get('/auth/google/callback?state=wrong&code=test')->assertSessionHasErrors('google');
        $this->withSession(['google_login' => [...$this->flow(), 'expires_at' => time() - 60]])
            ->get('/auth/google/callback?state=state-for-this-session&code=test')->assertSessionHasErrors('google');
        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
        Http::assertNothingSent();
    }

    public function test_cancellation_consumes_the_flow_without_creating_an_account(): void
    {
        $this->withSession(['google_login' => $this->flow()])->get('/auth/google/callback?state=state-for-this-session&error=access_denied')
            ->assertRedirect('/login')->assertSessionHasErrors('google')->assertSessionMissing('google_login');
        $this->assertDatabaseCount('users', 0);
        Http::assertNothingSent();
    }

    public function test_valid_signed_google_identity_creates_an_account_and_company_and_regenerates_the_session(): void
    {
        $this->mockIdentity();
        $this->get('/login');
        $oldId = session()->getId();
        $this->completeGoogleLogin()->assertRedirect('/settings/profile')->assertSessionHasNoErrors()->assertSessionMissing('google_login');
        $user = User::firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertNotSame($oldId, session()->getId());
        $this->assertSame('google', $user->auth_provider);
        $this->assertNull($user->password);
        $this->assertNotNull($user->email_verified_at);
        $this->assertSame('Google Student', $user->company->name);
        $this->assertArrayNotHasKey('google_subject', $user->toArray());
        Http::assertSent(fn ($request) => $request->url() === 'https://oauth2.googleapis.com/token'
            && $request['code_verifier'] === $this->flow()['verifier'] && $request['client_secret'] === 'test-only-secret');
    }

    public static function invalidClaims(): array
    {
        return [
            'nonce' => [['nonce' => 'wrong']],
            'audience' => [['aud' => 'another-client']],
            'issuer' => [['iss' => 'https://attacker.example']],
            'expired' => [['exp' => time() - 120]],
            'unverified email' => [['email_verified' => false]],
            'missing subject' => [['sub' => '']],
            'invalid email' => [['email' => 'invalid']],
            'future issuance beyond tolerance' => [['iat' => time() + 120]],
            'recently expired' => [['exp' => time() - 5]],
        ];
    }

    #[DataProvider('invalidClaims')]
    public function test_invalid_token_claims_are_rejected(array $changes): void
    {
        $this->mockIdentity($changes);
        $this->completeGoogleLogin()->assertRedirect('/login')->assertSessionHasErrors('google');
        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_a_token_signed_with_another_key_is_rejected(): void
    {
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $differentKey);
        $this->mockIdentity([], $differentKey);
        $this->completeGoogleLogin()->assertRedirect('/login')->assertSessionHasErrors('google');
        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_small_clock_difference_is_allowed_without_changing_global_jwt_settings(): void
    {
        $previousLeeway = JWT::$leeway;
        $this->mockIdentity(['iat' => time() + 10]);
        $this->completeGoogleLogin()->assertRedirect('/settings/profile')->assertSessionHasNoErrors();
        $this->assertAuthenticated();
        $this->assertSame($previousLeeway, JWT::$leeway);
    }

    public function test_local_and_google_accounts_with_the_same_email_have_separate_data(): void
    {
        $local = User::factory()->create(['email' => 'student@example.test']);
        $local->company()->create(['name' => 'Local business']);
        $this->mockIdentity();
        $this->completeGoogleLogin()->assertSessionHasNoErrors();
        $google = User::where('auth_provider', 'google')->firstOrFail();
        $this->assertNotSame($local->id, $google->id);
        $this->assertNotSame($local->company->id, $google->company->id);
        $this->get('/company')->assertInertia(fn (Assert $page) => $page->where('company.name', 'Google Student'));
        $this->post('/logout')->assertRedirect('/');
        $this->post('/login', ['email' => $local->email, 'password' => 'password'])->assertSessionHasNoErrors();
        $this->assertAuthenticatedAs($local);
    }

    public function test_local_registration_is_allowed_when_only_a_google_account_has_that_email(): void
    {
        User::factory()->create(['email' => 'student@example.test', 'auth_provider' => 'google', 'google_subject' => 'existing-sub', 'password' => null]);
        $this->post('/register', ['name' => 'Local Student', 'email' => 'student@example.test', 'password' => 'password', 'password_confirmation' => 'password'])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseCount('users', 2);
        $this->assertSame('local', auth()->user()->auth_provider);
    }

    public function test_profile_persists_across_google_logins_and_ignores_client_identity_fields(): void
    {
        $this->mockIdentity();
        $this->completeGoogleLogin()->assertSessionHasNoErrors();
        $id = auth()->id();
        $this->patch('/settings/profile', ['name' => 'My chosen name', 'email' => 'student@example.test', 'course' => 'Sistemas de Informação',
            'city' => 'Santa Maria', 'interests' => 'Sustentabilidade', 'presentation' => 'Meu perfil', 'google_subject' => 'attacker', 'auth_provider' => 'local'])
            ->assertSessionHasNoErrors();
        $this->post('/logout');
        $this->mockIdentity();
        $this->completeGoogleLogin()->assertRedirect('/dashboard')->assertSessionHasNoErrors();
        $this->assertSame($id, auth()->id());
        $this->assertSame('My chosen name', auth()->user()->name);
        $this->assertSame('Santa Maria', auth()->user()->city);
        $this->assertSame('google-subject-123', auth()->user()->google_subject);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('companies', 1);
    }

    public function test_google_email_and_password_cannot_be_changed_through_local_forms(): void
    {
        $user = User::factory()->create(['auth_provider' => 'google', 'google_subject' => 'sub-1', 'password' => null]);
        $this->actingAs($user)->patch('/settings/profile', ['name' => 'Name', 'email' => 'changed@example.test'])->assertSessionHasErrors('email');
        $this->get('/settings/password')->assertForbidden();
        $this->get('/confirm-password')->assertForbidden();
        $this->post('/confirm-password', ['password' => 'password'])->assertForbidden();
        $this->put('/settings/password', ['password' => 'password123', 'password_confirmation' => 'password123'])->assertForbidden();
        Notification::fake();
        $this->post('/logout');
        $this->post('/forgot-password', ['email' => $user->email])->assertSessionHasNoErrors();
        Notification::assertNothingSent();
        $token = Password::createToken($user);
        $this->post('/reset-password', ['email' => $user->email, 'token' => $token, 'password' => 'password123', 'password_confirmation' => 'password123'])
            ->assertSessionHasErrors('email');
        $this->assertNull($user->fresh()->password);
    }

    public function test_google_account_deletion_requires_recent_google_authentication_and_email_confirmation(): void
    {
        $user = User::factory()->create(['auth_provider' => 'google', 'google_subject' => 'sub-1', 'password' => null]);
        $user->company()->create(['name' => 'Test company']);
        $this->actingAs($user)->delete('/settings/profile', ['confirmation_email' => $user->email])->assertSessionHasErrors('confirmation_email');
        $this->withSession(['google_authenticated_at' => now()->timestamp])->delete('/settings/profile', ['confirmation_email' => 'wrong@example.test'])
            ->assertSessionHasErrors('confirmation_email');
        $this->withSession(['google_authenticated_at' => now()->timestamp])->delete('/settings/profile', ['confirmation_email' => $user->email])->assertRedirect('/');
        $this->assertGuest();
        $this->assertDatabaseCount('companies', 0);
        $this->assertNull($user->fresh());
    }

    public function test_profile_requires_login_and_validates_the_extra_fields(): void
    {
        $this->get('/settings/profile')->assertRedirect('/login');
        $this->patch('/settings/profile', [])->assertRedirect('/login');
        $user = User::factory()->create();
        $this->actingAs($user)->patch('/settings/profile', ['name' => $user->name, 'email' => $user->email,
            'course' => '', 'city' => '', 'presentation' => str_repeat('x', 2001)])->assertSessionHasErrors(['course', 'city', 'presentation']);
    }

    public function test_callback_cannot_be_replayed_after_the_flow_is_consumed(): void
    {
        $this->mockIdentity(['nonce' => 'wrong']);
        $this->completeGoogleLogin()->assertSessionHasErrors('google');
        $this->get('/auth/google/callback?state=state-for-this-session&code=test-code')->assertSessionHasErrors('google');
        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }
}
