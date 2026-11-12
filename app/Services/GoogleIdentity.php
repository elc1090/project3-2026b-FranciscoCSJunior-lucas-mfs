<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Google\Auth\AccessToken;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleIdentity
{
    public function enabled(): bool
    {
        return filled(config('services.google.client_id')) && filled(config('services.google.client_secret'));
    }

    public function redirectUri(): string
    {
        return config('services.google.redirect') ?: route('google.callback');
    }

    public function authorizationUrl(string $state, string $nonce, string $verifier): string
    {
        return 'https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => $this->redirectUri(),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'nonce' => $nonce,
            'code_challenge' => rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '='),
            'code_challenge_method' => 'S256',
            'prompt' => 'select_account',
        ]);
    }

    public function authenticate(string $code, string $nonce, string $verifier): array
    {
        $response = Http::asForm()->timeout(15)->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => $this->redirectUri(),
            'grant_type' => 'authorization_code',
            'code' => $code,
            'code_verifier' => $verifier,
        ])->throw();

        $idToken = $response->json('id_token');
        if (! is_string($idToken) || $idToken === '') {
            throw new RuntimeException('Missing Google identity token.');
        }

        // The Google library validates the signature, expiry, issuer and audience.
        // Use Laravel's HTTP client so network behavior can be tested without Google credentials.
        $verifierClient = new AccessToken(fn ($request) => Http::timeout(15)->get((string) $request->getUri())->throw()->toPsrResponse());
        // Allow small differences between Google's clock and the application's.
        // Restore the library setting so other JWT consumers are unaffected.
        $previousLeeway = JWT::$leeway;
        JWT::$leeway = 30;
        try {
            $claims = $verifierClient->verify($idToken, ['audience' => config('services.google.client_id'), 'throwException' => true]);
        } finally {
            JWT::$leeway = $previousLeeway;
        }

        if (! is_array($claims) || ! is_numeric($claims['exp'] ?? null) || $claims['exp'] <= now()->timestamp
            || ! isset($claims['nonce']) || ! is_string($claims['nonce'])
            || ! hash_equals($nonce, $claims['nonce']) || ($claims['email_verified'] ?? false) !== true
            || ! is_string($claims['sub'] ?? null) || $claims['sub'] === '' || strlen($claims['sub']) > 255
            || ! is_string($claims['email'] ?? null) || strlen($claims['email']) > 255
            || ! filter_var($claims['email'], FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Invalid Google identity claims.');
        }

        return $claims;
    }
}
