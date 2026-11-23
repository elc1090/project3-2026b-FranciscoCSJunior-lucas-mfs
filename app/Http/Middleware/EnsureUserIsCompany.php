<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsCompany
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()?->isAdmin()) {
            abort_unless($request->isMethod('GET') || $request->isMethod('HEAD'), 403);

            return to_route('admin.dashboard');
        }

        return $next($request);
    }
}
