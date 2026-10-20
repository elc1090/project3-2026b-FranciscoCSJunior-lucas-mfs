<?php

namespace Tests\Feature;

use App\Models\PathGoal;
use App\Models\Question;
use App\Models\User;
use App\Services\DiagnosisScoring;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SustainabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
    }

    private function account(): User
    {
        $user = User::factory()->create();
        $user->company()->create(['name' => 'Empresa', 'sector' => 'food']);

        return $user;
    }

    private function answers(int $value = 3): array
    {
        return Question::pluck('code')->mapWithKeys(fn ($code) => [$code => $value])->all();
    }

    public function test_catalog_seeders_are_complete_and_idempotent(): void
    {
        $this->seed();
        $this->assertDatabaseCount('questions', 22);
        $this->assertDatabaseCount('recommendations', 22);
        $this->assertDatabaseCount('path_goals', 12);
        $this->assertDatabaseCount('sdgs', 17);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_pages_require_authentication(): void
    {
        foreach (['dashboard', 'company', 'diagnosis', 'results', 'path', 'plan', 'tracking', 'explore'] as $page) {
            $this->get('/'.$page)->assertRedirect('/login');
        }
        $this->put('/company')->assertRedirect('/login');
        $this->post('/diagnosis')->assertRedirect('/login');
        $this->post('/plan')->assertRedirect('/login');
        $this->patch('/plan/1')->assertRedirect('/login');
        $this->delete('/plan/1')->assertRedirect('/login');
        $this->post('/goals/g1-env/toggle')->assertRedirect('/login');
    }

    public function test_company_update_ignores_client_ownership(): void
    {
        $user = $this->account();
        $other = $this->account();
        $this->actingAs($user)->put('/company', ['name' => 'Nova empresa', 'sector' => 'services', 'size' => 'small', 'workers' => 10,
            'region' => 'RS', 'user_id' => $other->id, 'company_id' => $other->company->id])->assertSessionHasNoErrors();
        $this->assertSame('Nova empresa', $user->company->fresh()->name);
        $this->assertSame('Empresa', $other->company->fresh()->name);
        $this->assertFalse(Gate::forUser($user)->allows('view', $other->company));
        $this->assertFalse(Gate::forUser($user)->allows('update', $other->company));
    }

    public function test_diagnosis_recalculates_scores_and_persists_history(): void
    {
        $user = $this->account();
        $answers = $this->answers();
        $answers['food-1'] = 0;
        $answers['food-2'] = 0;
        $this->actingAs($user)->post('/diagnosis', ['answers' => $answers, 'scores' => ['environmental' => 0]])->assertRedirect('/results');
        $this->assertDatabaseCount('answers', 22);
        $this->assertSame(100, $user->company->diagnoses()->first()->scores['environmental']);
        $this->post('/diagnosis', ['answers' => $this->answers(0)])->assertRedirect('/results');
        $this->assertDatabaseCount('diagnoses', 2);
        $this->get('/tracking')->assertInertia(fn (Assert $page) => $page->component('tracking')->has('history', 2)->where('scores.workers', 0)
            ->where('history.0.total', 100)->where('history.1.total', 0));
    }

    public function test_diagnosis_rejects_incomplete_unknown_and_out_of_range_answers(): void
    {
        $this->actingAs($this->account());
        $this->post('/diagnosis', ['answers' => ['env-1' => 4]])->assertSessionHasErrors('answers.env-1');
        $this->post('/diagnosis', ['answers' => [...$this->answers(), 'unknown' => 1]])->assertSessionHasErrors('answers');
        $this->assertDatabaseCount('diagnoses', 0);
    }

    public function test_sector_questions_are_required_only_for_the_current_sector(): void
    {
        $user = $this->account();
        $answers = $this->answers();
        unset($answers['food-1'], $answers['food-2']);
        $this->actingAs($user)->post('/diagnosis', ['answers' => $answers])->assertSessionHasErrors('answers.food-1');
        $user->company->update(['sector' => 'other']);
        $this->post('/diagnosis', ['answers' => $answers])->assertRedirect('/results');
        $this->assertDatabaseCount('answers', 20);
    }

    public function test_plan_is_private_and_duplicate_recommendations_are_idempotent(): void
    {
        $owner = $this->account();
        $other = $this->account();
        $this->actingAs($owner)->post('/plan', ['recommendationId' => 'r-env-1'])->assertSessionHasNoErrors();
        $this->post('/plan', ['recommendationId' => 'r-env-1']);
        $this->assertDatabaseCount('plan_actions', 1);
        $action = $owner->company->actions()->first();
        $this->actingAs($other)->patch('/plan/'.$action->id, ['status' => 'done'])->assertForbidden();
        $this->delete('/plan/'.$action->id)->assertForbidden();
        $this->get('/plan')->assertInertia(fn (Assert $page) => $page->has('plan', 0)->has('history', 0));
        $this->actingAs($owner)->patch('/plan/'.$action->id, ['status' => 'invalid'])->assertSessionHasErrors('status');
        $this->patch('/plan/'.$action->id, ['status' => 'done', 'dueDate' => '2026-11-30', 'owner' => 'Lucas'])->assertSessionHasNoErrors();
        $this->assertSame('done', $action->fresh()->status);
        $this->delete('/plan/'.$action->id)->assertRedirect();
        $this->assertDatabaseCount('plan_actions', 0);
    }

    public function test_goal_toggle_affects_only_current_company(): void
    {
        $user = $this->account();
        $other = $this->account();
        $goal = PathGoal::first();
        $this->actingAs($user)->post('/goals/'.$goal->code.'/toggle')->assertRedirect();
        $this->assertSame(1, $user->company->goals()->count());
        $this->assertSame(0, $other->company->goals()->count());
        $this->post('/goals/'.$goal->code.'/toggle');
        $this->assertSame(0, $user->company->goals()->count());
    }

    public function test_scoring_matches_social_groups_and_priority_order(): void
    {
        $answers = $this->answers(3);
        foreach (['soc-4', 'soc-5'] as $code) {
            $answers[$code] = 0;
        }
        $answers['gov-1'] = 1;
        $result = app(DiagnosisScoring::class)->calculate(Question::with('recommendation')->get(), $answers);
        $this->assertSame(100, $result['scores']['workers']);
        $this->assertSame(0, $result['scores']['community']);
        $this->assertSame(60, $result['dimensionScores']['social']);
        $this->assertSame(87, $result['totalScore']['percent']);
        $this->assertSame('community', $result['priorities'][0]['area']);
        $this->assertContains('r-soc-4', $result['priorities'][0]['recommendationIds']);
    }

    public function test_validation_uses_plaintext_locale_cookie(): void
    {
        $this->actingAs($this->account())->withUnencryptedCookie('locale', 'pt')->put('/company', [])->assertSessionHasErrors([
            'name' => 'O campo nome é obrigatório.',
        ]);
        $this->withUnencryptedCookie('locale', 'es')->put('/company', [])->assertSessionHasErrors([
            'name' => 'El campo nombre es obligatorio.',
        ]);
    }
}
