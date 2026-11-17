<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Diagnosis;
use App\Models\IsoRequirement;
use App\Models\Question;

/**
 * Monta um resumo dos dados da empresa, pede ao Gemini recomendações personalizadas
 * e devolve o resultado já validado: ['summary' => string, 'actions' => [...]].
 *
 * O nome da empresa e os dados do usuário não são enviados: só setor, porte, região e os números.
 */
class SustainabilityAdvisor
{
    private const ANSWERS = ['never', 'sometimes', 'often', 'always'];

    public function __construct(private GeminiClient $gemini, private DiagnosisScoring $scoring, private CarbonFootprint $carbon) {}

    public function enabled(): bool
    {
        return $this->gemini->enabled();
    }

    public function advise(Company $company, Diagnosis $diagnosis, string $locale): array
    {
        $language = $locale === 'es' ? 'Chilean Spanish' : 'Brazilian Portuguese';
        $system = <<<TEXT
        You are a sustainability consultant for small and medium-sized enterprises (SMEs) in Chile and Brazil.
        You receive the results of a self-assessment diagnosis and other indicators of one company.
        Write a short summary of the company's situation and 3 to 5 concrete, low-cost actions, prioritising the weakest areas.
        Each action must fit the company's sector and size, be doable in the next 3 months, and start with a verb.
        Do not invent numbers, certifications, laws or facts about the company that are not in the data.
        Write everything in {$language}, in plain language for a business owner. Summary: at most 3 sentences.
        TEXT;
        $input = json_encode($this->context($company, $diagnosis, $locale), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return $this->validated($this->gemini->generateJson($system, "Company data:\n".$input, $this->schema()));
    }

    private function context(Company $company, Diagnosis $diagnosis, string $locale): array
    {
        $answers = $diagnosis->answers()->with('question')->get()->mapWithKeys(fn ($a) => [$a->question->code => $a->value])->all();
        $questions = Question::orderBy('id')->get()->filter(fn ($q) => ! $q->sector || $q->sector === $company->sector);
        $result = $this->scoring->calculate($questions, $answers);
        $records = $company->carbonRecords()->orderByDesc('period')->limit(2)->get();
        $latest = $records->first();

        return [
            'company' => ['sector' => $company->sector, 'size' => $company->size, 'workers' => $company->workers, 'region' => $company->region],
            'diagnosisDate' => $diagnosis->created_at->toDateString(),
            'scoresOutOf100' => ['total' => $result['totalScore']['percent'], 'byArea' => $result['scores']],
            'weakPractices' => $questions
                ->filter(fn ($q) => ($answers[$q->code] ?? 0) <= 1)
                ->map(fn ($q) => ['area' => $q->group ?? $q->dimension, 'practice' => $q->{'text_'.$locale}, 'answer' => self::ANSWERS[$answers[$q->code] ?? 0]])
                ->values()->all(),
            'carbonFootprint' => $latest ? [
                'month' => $latest->period->format('Y-m'),
                'kgCo2eBySource' => $this->carbon->calculate($latest)['emissions'],
                'totalKgCo2e' => $this->carbon->calculate($latest)['total'],
                'previousMonthTotalKgCo2e' => $records->count() > 1 ? $this->carbon->calculate($records->last())['total'] : null,
            ] : 'not measured yet',
            'iso14001' => ['requirementsMet' => $company->isoRequirements()->count(), 'requirementsTotal' => IsoRequirement::count()],
            'actionPlan' => $company->actions()->with('recommendation')->get()
                ->map(fn ($a) => ['action' => $a->recommendation->{'title_'.$locale}, 'status' => $a->status])->all(),
        ];
    }

    private function schema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'summary' => ['type' => 'string'],
                'actions' => [
                    'type' => 'array',
                    'minItems' => 3,
                    'maxItems' => 5,
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'area' => ['type' => 'string', 'enum' => DiagnosisScoring::AREAS],
                            'title' => ['type' => 'string'],
                            'description' => ['type' => 'string'],
                            'firstStep' => ['type' => 'string'],
                        ],
                        'required' => ['area', 'title', 'description', 'firstStep'],
                    ],
                ],
            ],
            'required' => ['summary', 'actions'],
        ];
    }

    /** Confere a resposta antes de salvar: a IA pode errar o formato mesmo com o schema. */
    private function validated(array $data): array
    {
        $text = fn ($value, int $max) => is_string($value) ? mb_substr(trim($value), 0, $max) : '';
        $actions = collect($data['actions'] ?? [])
            ->filter(fn ($a) => is_array($a) && in_array($a['area'] ?? null, DiagnosisScoring::AREAS, true))
            ->map(fn ($a) => ['area' => $a['area'], 'title' => $text($a['title'] ?? null, 200),
                'description' => $text($a['description'] ?? null, 1000), 'firstStep' => $text($a['firstStep'] ?? null, 500)])
            ->filter(fn ($a) => $a['title'] !== '')
            ->take(5)->values()->all();
        $summary = $text($data['summary'] ?? null, 1500);
        if ($summary === '' || ! $actions) {
            throw new GeminiException('failed', 'Gemini response missing summary or actions.');
        }

        return ['summary' => $summary, 'actions' => $actions];
    }
}
