<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\PathGoal;
use App\Models\PlanAction;
use App\Models\Question;
use App\Models\Recommendation;
use App\Models\Sdg;
use App\Services\DiagnosisScoring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SustainabilityController extends Controller
{
    private function company(Request $request): Company
    {
        return $request->user()->company()->firstOrCreate([], ['name' => $request->user()->name]);
    }

    public function show(Request $request, DiagnosisScoring $scoring)
    {
        $company = $this->company($request);
        Gate::authorize('view', $company);
        $latest = $company->diagnoses()->latest('id')->first();
        $answers = $latest ? $latest->answers()->with('question')->get()->mapWithKeys(fn ($a) => [$a->question->code => $a->value])->all() : [];
        $questions = Question::with('recommendation')->orderBy('id')->get();
        $localized = fn ($row, $field) => ['es' => $row->{$field.'_es'}, 'pt' => $row->{$field.'_pt'}];

        return Inertia::render($request->route()->getName(), [
            'company' => $company->only('name', 'sector', 'size', 'workers', 'region'), 'answers' => (object) $answers,
            'plan' => $company->actions()->with('recommendation')->orderBy('id')->get()->map(fn ($a) => [
                'id' => (string) $a->id, 'recommendationId' => $a->recommendation->code, 'owner' => $a->owner,
                'dueDate' => $a->due_date ?? '', 'indicator' => $a->indicator, 'status' => $a->status]),
            'completedGoals' => $company->goals()->pluck('code'),
            'history' => $company->diagnoses()->with('answers.question')->orderBy('id')->get()->map(function ($d) {
                $general = $d->answers->filter(fn ($a) => $a->question->sector === null);

                return ['id' => (string) $d->id, 'date' => $d->created_at->toDateString(), 'scores' => $d->scores,
                    'total' => $general->isEmpty() ? 0 : (int) round($general->sum('value') / ($general->count() * 3) * 100)];
            }),
            'questions' => $questions->map(fn ($q) => array_filter(['id' => $q->code, 'dimension' => $q->dimension,
                'group' => $q->group, 'sector' => $q->sector, 'text' => $localized($q, 'text'), 'sdgs' => $q->sdgs], fn ($v) => $v !== null)),
            'recommendations' => Recommendation::with('question')->orderBy('id')->get()->map(fn ($r) => [
                'id' => $r->code, 'questionId' => $r->question->code, 'title' => $localized($r, 'title'), 'description' => $localized($r, 'description')]),
            'pathGoals' => PathGoal::orderBy('id')->get()->map(fn ($g) => ['id' => $g->code, 'level' => $g->level, 'dimension' => $g->dimension, 'title' => $localized($g, 'title')]),
            'sdgs' => Sdg::orderBy('number')->get()->map(fn ($s) => ['number' => $s->number, 'title' => $localized($s, 'title'), 'description' => $localized($s, 'description')]),
            ...$scoring->calculate($questions->filter(fn ($q) => ! $q->sector || $q->sector === $company->sector), $answers),
        ]);
    }

    public function updateCompany(Request $request)
    {
        $company = $this->company($request);
        Gate::authorize('update', $company);
        $company->update($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sector' => ['required', Rule::in(['food', 'retail', 'services', 'manufacturing', 'tourism', 'construction', 'other'])],
            'size' => ['required', Rule::in(['micro', 'small', 'medium'])],
            'workers' => ['required', 'integer', 'min:0', 'max:1000000'], 'region' => ['required', 'string', 'max:255'],
        ]));

        return back();
    }

    public function storeDiagnosis(Request $request, DiagnosisScoring $scoring)
    {
        $company = $this->company($request);
        Gate::authorize('update', $company);
        $questions = Question::with('recommendation')->where(fn ($q) => $q->whereNull('sector')->orWhere('sector', $company->sector))->orderBy('id')->get();
        abort_if($questions->whereNull('sector')->count() !== 20, 503, 'Catalog not initialized. Run database seeders.');
        $rules = ['answers' => ['required', 'array:'.$questions->pluck('code')->implode(',')]];
        foreach ($questions as $question) {
            $rules['answers.'.$question->code] = ['required', 'integer', 'between:0,3'];
        }
        $answers = $request->validate($rules)['answers'];
        DB::transaction(function () use ($company, $questions, $answers, $scoring) {
            $diagnosis = $company->diagnoses()->create(['scores' => $scoring->calculate($questions, $answers)['scores']]);
            foreach ($questions as $question) {
                $diagnosis->answers()->create(['question_id' => $question->id, 'value' => $answers[$question->code]]);
            }
        });

        return to_route('results');
    }

    public function storeAction(Request $request)
    {
        $company = $this->company($request);
        Gate::authorize('update', $company);
        $data = $request->validate(['recommendationId' => ['required', 'string', 'exists:recommendations,code']]);
        $recommendation = Recommendation::where('code', $data['recommendationId'])->firstOrFail();
        $company->actions()->firstOrCreate(['recommendation_id' => $recommendation->id]);

        return back();
    }

    public function updateAction(Request $request, PlanAction $action)
    {
        Gate::authorize('update', $action);
        $data = $request->validate([
            'owner' => ['sometimes', 'nullable', 'string', 'max:255'], 'dueDate' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'indicator' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'required', Rule::in(['pending', 'in_progress', 'done'])],
        ]);
        if (array_key_exists('dueDate', $data)) {
            $data['due_date'] = $data['dueDate'];
            unset($data['dueDate']);
        }
        foreach (['owner', 'indicator'] as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] ??= '';
            }
        }
        $action->update($data);

        return back();
    }

    public function destroyAction(PlanAction $action)
    {
        Gate::authorize('delete', $action);
        $action->delete();

        return back();
    }

    public function toggleGoal(Request $request, PathGoal $goal)
    {
        $company = $this->company($request);
        Gate::authorize('update', $company);
        DB::transaction(function () use ($company, $goal) {
            $company->newQuery()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $company->goals()->toggle($goal->id);
        });

        return back();
    }
}
