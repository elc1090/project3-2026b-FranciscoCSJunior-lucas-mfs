<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\GoogleIdentity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request, GoogleIdentity $google): RedirectResponse
    {
        if (! $google->enabled()) {
            return to_route('login')->withErrors(['google' => __('google.unavailable')]);
        }

        $state = Str::random(64);
        $nonce = Str::random(64);
        $verifier = Str::random(96);
        $request->session()->put('google_login', ['state' => $state, 'nonce' => $nonce, 'verifier' => $verifier, 'expires_at' => now()->addMinutes(10)->timestamp]);

        return redirect()->away($google->authorizationUrl($state, $nonce, $verifier));
    }

    public function callback(Request $request, GoogleIdentity $google): RedirectResponse
    {
        $flow = $request->session()->pull('google_login');
        if (! $google->enabled() || ! is_array($flow) || ($flow['expires_at'] ?? 0) < now()->timestamp
            || ! is_string($request->query('state')) || ! hash_equals($flow['state'], $request->query('state'))) {
            return to_route('login')->withErrors(['google' => __('google.invalid_session')]);
        }

        if ($request->has('error')) {
            return to_route('login')->withErrors(['google' => __('google.cancelled')]);
        }
        if (! is_string($request->query('code')) || $request->query('code') === '' || strlen($request->query('code')) > 4096) {
            return to_route('login')->withErrors(['google' => __('google.failed')]);
        }

        $stage = 'identity';
        try {
            $claims = $google->authenticate($request->query('code'), $flow['nonce'], $flow['verifier']);
            $stage = 'account';
            $user = DB::transaction(function () use ($claims) {
                // Never merge accounts just because their e-mail addresses match.
                $user = User::firstOrCreate(['google_subject' => $claims['sub']], [
                    'auth_provider' => 'google',
                    'name' => Str::limit(is_string($claims['name'] ?? null) && filled($claims['name']) ? $claims['name'] : $claims['email'], 255, ''),
                    'email' => Str::lower($claims['email']),
                    'email_verified_at' => now(),
                    'password' => null,
                ]);
                if (! $user->isAdmin()) {
                    $user->company()->firstOrCreate([], ['name' => $user->name]);
                }

                return $user;
            });
        } catch (Throwable $exception) {
            // Do not log authorization codes, tokens, secrets or provider response bodies.
            Log::warning('Google login failed', [
                'stage' => $stage,
                'exception_type' => get_class($exception),
                'source' => basename($exception->getFile()),
                'line' => $exception->getLine(),
            ]);

            return to_route('login')->withErrors(['google' => __('google.failed')]);
        }

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put('google_authenticated_at', now()->timestamp);

        if ($user->isAdmin()) {
            return to_route('admin.dashboard');
        }

        return $user->course && $user->city ? redirect()->intended(route('dashboard', absolute: false)) : to_route('profile.edit');
    }
}
