<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\IsoRequirement;
use App\Models\Question;
use App\Models\User;
use App\Services\CarbonFootprint;
use App\Services\DiagnosisScoring;
use App\Services\SustainabilityAdvisor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AdminController extends Controller
{
    private function companyRows()
    {
        $isoTotal = IsoRequirement::count();

        return Company::whereHas('user', fn ($q) => $q->where('role', 'company'))
            ->with(['user', 'diagnoses' => fn ($q) => $q->orderByDesc('id'), 'diagnoses.answers.question',
                'carbonRecords' => fn ($q) => $q->orderByDesc('period')])
            ->withCount(['isoRequirements', 'actions', 'actions as done_actions_count' => fn ($q) => $q->where('status', 'done')])
            ->orderByDesc('created_at')->orderByDesc('id')->get()->map(function ($company) use ($isoTotal) {
                $latest = $company->diagnoses->first();
                $general = $latest?->answers->filter(fn ($a) => $a->question->sector === null);
                $carbon = $company->carbonRecords->first();

                return [...$company->only('id', 'name', 'sector', 'size', 'workers', 'region'),
                    'owner' => $company->user->only('name', 'email'), 'createdAt' => $company->created_at->toDateString(),
                    'lastDiagnosisAt' => $latest?->created_at->toDateString(),
                    'totalScore' => $latest ? ($general->isEmpty() ? 0 : (int) round($general->sum('value') / ($general->count() * 3) * 100)) : null,
                    'scores' => $latest?->scores,
                    'carbonLastMonth' => $carbon ? ['period' => $carbon->period->format('Y-m'), 'total' => app(CarbonFootprint::class)->calculate($carbon)['total']] : null,
                    'isoDone' => $company->iso_requirements_count, 'isoTotal' => $isoTotal,
                    'planDone' => $company->done_actions_count, 'planTotal' => $company->actions_count];
            });
    }

    public function dashboard(DiagnosisScoring $scoring)
    {
        $rows = $this->companyRows();
        $questions = Question::with('recommendation')->get();
        $latest = Company::whereHas('user', fn ($q) => $q->where('role', 'company'))
            ->with(['diagnoses' => fn ($q) => $q->orderByDesc('id'), 'diagnoses.answers.question'])->get()
            ->map(fn ($c) => $c->diagnoses->first())->filter()->map(function ($d) use ($scoring, $questions) {
                $result = $scoring->calculate($questions, $d->answers->mapWithKeys(fn ($a) => [$a->question->code => $a->value])->all());

                return [...$result['dimensionScores'], 'workers' => $result['scores']['workers'], 'community' => $result['scores']['community']];
            });
        $average = $latest->isEmpty() ? null : collect(['environmental', 'social', 'economic', 'governance', 'workers', 'community'])
            ->mapWithKeys(fn ($key) => [$key => (int) round($latest->avg($key))])->all();

        return Inertia::render('admin/dashboard', [
            'stats' => ['companies' => $rows->count(), 'diagnosedCompanies' => $rows->whereNotNull('totalScore')->count(),
                'companyUsers' => User::where('role', 'company')->count(), 'admins' => User::where('role', 'admin')->count(),
                'averageScore' => $latest->isEmpty() ? null : (int) round($rows->whereNotNull('totalScore')->avg('totalScore'))],
            'averageScores' => $average, 'companiesBySector' => (object) $rows->countBy('sector')->all(),
            'recentCompanies' => $rows->take(5)->values()]);
    }

    public function companies()
    {
        return Inertia::render('admin/companies', ['companies' => $this->companyRows()]);
    }

    public function company(Company $company, SustainabilityController $sustainability, DiagnosisScoring $scoring, CarbonFootprint $carbon, SustainabilityAdvisor $advisor)
    {
        abort_unless($company->user?->role === 'company', 404);
        Gate::authorize('view', $company);

        return Inertia::render('admin/company', [...$sustainability->companyProps($company, $scoring, $carbon, $advisor),
            'companyId' => $company->id, 'owner' => [...$company->user->only('name', 'email'), 'lastLoginAt' => $company->user->last_login_at?->toDateString()]]);
    }

    public function users()
    {
        return Inertia::render('admin/users', ['users' => User::with('company')->orderByDesc('created_at')->orderByDesc('id')->get()->map(fn ($user) => [
            ...$user->only('id', 'name', 'email', 'role'), 'authProvider' => $user->auth_provider,
            'companyId' => $user->isAdmin() ? null : $user->company?->id,
            'companyName' => $user->isAdmin() ? null : $user->company?->name,
            'createdAt' => $user->created_at->toDateString(), 'lastLoginAt' => $user->last_login_at?->toDateString(),
            'mustChangePassword' => $user->must_change_password])]);
    }

    public function storeUser(Request $request)
    {
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);
        $data = $request->validate(['name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->where('auth_provider', 'local')],
            'role' => ['required', Rule::in(['company', 'admin'])], 'companyName' => ['required_if:role,company', 'nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8']]);
        DB::transaction(function () use ($data) {
            $user = User::create([...collect($data)->only('name', 'email', 'role', 'password')->all(), 'auth_provider' => 'local', 'must_change_password' => true]);
            if (! $user->isAdmin()) {
                $user->company()->create(['name' => $data['companyName']]);
            }
        });

        return back();
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate(['role' => ['required', Rule::in(['company', 'admin'])]]);
        DB::transaction(function () use ($request, $user, $data) {
            // Serialize role changes to protect the final administrator on PostgreSQL.
            $admins = User::where('role', 'admin')->orderBy('id')->lockForUpdate()->get();
            $target = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            if (($target->id === $request->user()->id && $data['role'] !== $target->role)
                || ($target->isAdmin() && $data['role'] !== 'admin' && $admins->count() <= 1)) {
                throw ValidationException::withMessages(['role' => __('admin.role_protected')]);
            }
            $target->update($data);
        });

        return back();
    }

    public function password(Request $request, User $user)
    {
        $data = $request->validate(['password' => ['required', 'string', 'min:8']]);
        if ($user->auth_provider !== 'local') {
            throw ValidationException::withMessages(['password' => __('admin.google_password')]);
        }
        DB::transaction(function () use ($user, $data) {
            $user->update(['password' => $data['password'], 'must_change_password' => true, 'remember_token' => Str::random(60)]);
            DB::table('sessions')->where('user_id', $user->id)->delete();
        });

        return back();
    }
}
