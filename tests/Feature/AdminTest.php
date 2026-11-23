<?php

namespace Tests\Feature;

use App\Models\IsoRequirement;
use App\Models\Question;
use App\Models\Recommendation;
use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['admin.email' => null]);
        $this->seed();
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_access_boundaries(): void
    {
        $user = User::factory()->create();
        $company = $user->company()->create(['name' => 'Company']);
        foreach (['/admin', '/admin/companies', '/admin/companies/'.$company->id, '/admin/users'] as $url) {
            $this->get($url)->assertRedirect('/login');
            $this->actingAs($user)->get($url)->assertForbidden();
            auth()->logout();
        }
        $this->actingAs($user)->post('/admin/users')->assertForbidden();
        $this->patch('/admin/users/'.$user->id)->assertForbidden();
        $this->put('/admin/users/'.$user->id.'/password')->assertForbidden();
        $admin = $this->admin();
        $this->actingAs($admin)->get('/dashboard')->assertRedirect('/admin');
        $this->post('/diagnosis')->assertForbidden();
        $this->put('/company')->assertForbidden();
        $this->assertNull($admin->company);
    }

    public function test_scores_and_read_only_detail_match_company_pages(): void
    {
        $owner = User::factory()->create();
        $company = $owner->company()->create(['name' => 'Food', 'sector' => 'food']);
        $answers = Question::whereNull('sector')->orWhere('sector', 'food')->pluck('code')->mapWithKeys(fn ($code) => [$code => 3])->all();
        $this->actingAs($owner)->post('/diagnosis', ['answers' => $answers])->assertRedirect('/results');
        $props = $this->get('/results')->viewData('page')['props'];
        $admin = $this->admin();
        $hidden = $admin->company()->create(['name' => 'Hidden']);
        $this->actingAs($admin)->get('/admin')->assertInertia(fn (Assert $p) => $p->component('admin/dashboard')
            ->where('stats.companies', 1)->where('stats.diagnosedCompanies', 1)->where('stats.averageScore', 100)
            ->where('stats.admins', 1)->where('stats.companyUsers', 1)->where('averageScores.social', 100)
            ->where('companiesBySector.food', 1)->has('recentCompanies', 1));
        $this->get('/admin/companies')->assertInertia(fn (Assert $p) => $p->has('companies', 1)->where('companies.0.totalScore', 100));
        $this->get('/admin/companies/'.$company->id)->assertInertia(fn (Assert $p) => $p->component('admin/company')
            ->where('scores', $props['scores'])->where('totalScore', $props['totalScore'])->where('companyId', $company->id));
        $this->get('/admin/companies/'.$hidden->id)->assertNotFound();
        $this->assertFalse($admin->can('update', $company));
        $this->assertTrue($admin->can('view', $company));
        $this->get('/admin/users')->assertInertia(fn (Assert $p) => $p->has('users', 2));
    }

    public function test_users_roles_passwords_and_session_revocation(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)->post('/admin/users', ['name' => 'New', 'email' => 'new@example.test', 'role' => 'company', 'companyName' => 'NewCo', 'password' => 'temporary123'])->assertSessionHasNoErrors();
        $new = User::where('email', 'new@example.test')->firstOrFail();
        $this->assertTrue($new->must_change_password);
        $this->assertTrue(Hash::check('temporary123', $new->password));
        $this->assertSame('NewCo', $new->company->name);
        $this->post('/admin/users', ['name' => 'Duplicate', 'email' => $new->email, 'role' => 'admin', 'password' => 'temporary123'])->assertSessionHasErrors('email');
        $this->patch('/admin/users/'.$admin->id, ['role' => 'company'])->assertSessionHasErrors('role');
        $this->patch('/admin/users/'.$new->id, ['role' => 'admin'])->assertSessionHasNoErrors();
        $this->assertTrue($new->fresh()->isAdmin());
        $this->assertNotNull($new->fresh()->company);
        $this->patch('/admin/users/'.$new->id, ['role' => 'company'])->assertSessionHasNoErrors();
        DB::table('sessions')->insert(['id' => 'test-session', 'user_id' => $new->id, 'payload' => '', 'last_activity' => time()]);
        $this->put('/admin/users/'.$new->id.'/password', ['password' => 'replacement123'])->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('sessions', ['id' => 'test-session']);
        $this->assertTrue(Hash::check('replacement123', $new->fresh()->password));
        $google = User::factory()->create(['auth_provider' => 'google', 'password' => null, 'google_subject' => 'subject']);
        $this->put('/admin/users/'.$google->id.'/password', ['password' => 'replacement123'])->assertSessionHasErrors('password');
        $this->actingAs($new->fresh())->put('/settings/password', ['current_password' => 'replacement123', 'password' => 'permanent123', 'password_confirmation' => 'permanent123'])->assertSessionHasNoErrors();
        $this->assertFalse($new->fresh()->must_change_password);
    }

    public function test_seeder_and_admin_login(): void
    {
        config(['admin.email' => 'admin@example.test', 'admin.name' => 'Admin', 'admin.password' => 'temporary123']);
        $this->seed(AdminSeeder::class);
        $admin = User::where('email', 'admin@example.test')->firstOrFail();
        $hash = $admin->password;
        config(['admin.password' => 'different123']);
        $this->seed(AdminSeeder::class);
        $this->assertSame($hash, $admin->fresh()->password);
        $this->assertTrue($admin->isAdmin());
        $this->assertNull($admin->company);
        $this->post('/login', ['email' => $admin->email, 'password' => 'temporary123'])->assertRedirect('/admin');
        $this->assertNotNull($admin->fresh()->last_login_at);
        $admin->update(['role' => 'company', 'must_change_password' => false]);
        $this->seed(AdminSeeder::class);
        $this->assertTrue($admin->fresh()->isAdmin());
        $this->assertFalse($admin->fresh()->must_change_password);
        $this->assertSame($hash, $admin->fresh()->password);
    }

    public function test_aggregates_use_only_latest_diagnoses_and_latest_carbon_period(): void
    {
        $owner = User::factory()->create();
        $company = $owner->company()->create(['name' => 'One', 'sector' => 'food']);
        $codes = Question::whereNull('sector')->orWhere('sector', 'food')->pluck('code');
        $this->actingAs($owner)->post('/diagnosis', ['answers' => $codes->mapWithKeys(fn ($c) => [$c => 3])->all()]);
        $this->post('/diagnosis', ['answers' => $codes->mapWithKeys(fn ($c) => [$c => 0])->all()]);
        $company->carbonRecords()->create(['period' => '2026-01-01', 'diesel_l' => 10]);
        $company->carbonRecords()->create(['period' => '2025-12-01', 'diesel_l' => 100]);
        $company->isoRequirements()->attach(IsoRequirement::first()->id);
        $company->actions()->create(['recommendation_id' => Recommendation::first()->id, 'status' => 'done']);
        $other = User::factory()->create();
        $other->company()->create(['name' => 'Two', 'sector' => 'food']);
        $this->actingAs($other)->post('/diagnosis', ['answers' => $codes->mapWithKeys(fn ($c) => [$c => 1])->all()]);
        $this->actingAs($this->admin())->get('/admin')->assertInertia(fn (Assert $p) => $p
            ->where('stats.averageScore', 17)->where('averageScores.environmental', 17)->where('stats.diagnosedCompanies', 2));
        $this->get('/admin/companies')->assertInertia(fn (Assert $p) => $p
            ->where('companies.1.totalScore', 0)->where('companies.1.carbonLastMonth.period', '2026-01')
            ->where('companies.1.carbonLastMonth.total', 26.8)->where('companies.1.isoDone', 1)
            ->where('companies.1.isoTotal', 16)->where('companies.1.planDone', 1)->where('companies.1.planTotal', 1));
    }

    public function test_empty_dashboard_has_null_averages_and_registration_cannot_assign_admin(): void
    {
        $this->actingAs($this->admin())->get('/admin')->assertInertia(fn (Assert $p) => $p
            ->where('stats.averageScore', null)->where('averageScores', null)->where('stats.companies', 0));
        $this->post('/logout');
        $this->post('/register', ['name' => 'Public', 'email' => 'public@example.test', 'password' => 'password123',
            'password_confirmation' => 'password123', 'role' => 'admin', 'must_change_password' => true]);
        $user = User::where('email', 'public@example.test')->firstOrFail();
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->must_change_password);
    }
}
