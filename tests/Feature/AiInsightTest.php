<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AiInsightTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
        config(['services.gemini.key' => 'test-key', 'services.gemini.model' => 'gemini-test']);
    }

    private function diagnosedUser(int $value = 1): User
    {
        $user = User::factory()->create();
        $user->company()->create(['name' => 'Padaria Secreta', 'sector' => 'food', 'size' => 'micro', 'workers' => 4, 'region' => 'Coquimbo']);
        $answers = Question::pluck('code')->mapWithKeys(fn ($code) => [$code => $value])->all();
        $this->actingAs($user)->post('/diagnosis', ['answers' => $answers])->assertRedirect('/results');

        return $user;
    }

    private function geminiReply(array $data, string $status = 'completed'): array
    {
        return ['id' => 'v1_x', 'object' => 'interaction', 'status' => $status,
            'steps' => [['type' => 'model_output', 'content' => [['type' => 'text', 'text' => json_encode($data)]]]]];
    }

    private function validInsight(): array
    {
        return ['summary' => 'Sua empresa vai bem na governança.', 'actions' => [
            ['area' => 'environmental', 'title' => 'Medir a energia', 'description' => 'Anotar o consumo.', 'firstStep' => 'Ler a conta de luz.'],
            ['area' => 'workers', 'title' => 'Ouvir a equipe', 'description' => 'Reunião mensal.', 'firstStep' => 'Marcar a data.'],
            ['area' => 'invented', 'title' => 'Área inválida', 'description' => 'x', 'firstStep' => 'x'],
        ]];
    }

    public function test_generates_and_stores_insight_without_sending_company_name(): void
    {
        Http::fake(['*/interactions' => Http::response($this->geminiReply($this->validInsight()))]);
        $user = $this->diagnosedUser();

        $this->post('/results/ai', ['locale' => 'pt'])->assertRedirect()->assertSessionHasNoErrors();

        Http::assertSent(function (HttpRequest $request) use ($user) {
            return $request->hasHeader('x-goog-api-key', 'test-key')
                && $request['model'] === 'gemini-test'
                && $request['store'] === false
                && str_contains($request['input'], 'Coquimbo')
                && ! str_contains($request->body(), 'Padaria Secreta')
                && ! str_contains($request->body(), $user->email);
        });
        $this->get('/results')->assertInertia(fn (Assert $page) => $page
            ->where('aiEnabled', true)
            ->where('aiInsights.pt.summary', 'Sua empresa vai bem na governança.')
            ->has('aiInsights.pt.actions', 2)
            ->where('aiInsights.pt.outdated', false)
            ->missing('aiInsights.es'));
    }

    public function test_new_diagnosis_marks_insight_as_outdated_and_regenerating_replaces_it(): void
    {
        Http::fake(['*/interactions' => Http::response($this->geminiReply($this->validInsight()))]);
        $user = $this->diagnosedUser();
        $this->post('/results/ai', ['locale' => 'es']);
        $this->post('/diagnosis', ['answers' => Question::pluck('code')->mapWithKeys(fn ($c) => [$c => 3])->all()]);
        $this->get('/results')->assertInertia(fn (Assert $page) => $page->where('aiInsights.es.outdated', true));

        $this->post('/results/ai', ['locale' => 'es']);
        $this->assertSame(1, $user->company->aiInsights()->count());
        $this->get('/results')->assertInertia(fn (Assert $page) => $page->where('aiInsights.es.outdated', false));
    }

    public function test_reports_errors_without_saving(): void
    {
        $this->diagnosedUser();
        Http::fake(['*/interactions' => Http::sequence()
            ->push(['error' => ['code' => 429]], 429)
            ->push($this->geminiReply(['summary' => '', 'actions' => []]))
            ->push('server error', 500)]);

        $this->post('/results/ai', ['locale' => 'pt'])->assertSessionHasErrors(['ai' => 'quota']);
        $this->post('/results/ai', ['locale' => 'pt'])->assertSessionHasErrors(['ai' => 'failed']);
        $this->post('/results/ai', ['locale' => 'pt'])->assertSessionHasErrors(['ai' => 'failed']);
        $this->post('/results/ai', ['locale' => 'en'])->assertSessionHasErrors('locale');
        $this->assertDatabaseCount('ai_insights', 0);
    }

    public function test_requires_key_diagnosis_and_respects_hourly_limit(): void
    {
        Http::fake(['*/interactions' => Http::response($this->geminiReply($this->validInsight()))]);
        $this->post('/results/ai', ['locale' => 'pt'])->assertRedirect('/login');

        $noDiagnosis = User::factory()->create();
        $this->actingAs($noDiagnosis)->post('/results/ai', ['locale' => 'pt'])->assertSessionHasErrors(['ai' => 'noDiagnosis']);

        $this->diagnosedUser();
        for ($i = 0; $i < 5; $i++) {
            $this->post('/results/ai', ['locale' => 'pt'])->assertSessionHasNoErrors();
        }
        $this->post('/results/ai', ['locale' => 'pt'])->assertSessionHasErrors(['ai' => 'tooMany']);
        Http::assertSentCount(5);

        config(['services.gemini.key' => null]);
        $this->post('/results/ai', ['locale' => 'pt'])->assertSessionHasErrors(['ai' => 'unavailable']);
        $this->get('/results')->assertInertia(fn (Assert $page) => $page->where('aiEnabled', false));
    }
}
