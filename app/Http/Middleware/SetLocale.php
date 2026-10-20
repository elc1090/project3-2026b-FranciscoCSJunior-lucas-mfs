<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        App::setLocale($request->cookie('locale') === 'pt' ? 'pt_BR' : 'es');

        return $next($request);
    }
}
