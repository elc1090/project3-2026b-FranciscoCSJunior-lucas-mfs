<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// A raiz leva direto ao sistema: logado → Início; não logado → login (middleware auth).
Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Páginas do SOSTENPYME. Por enquanto só renderizam o frontend (dados de demonstração);
    // substituir por controllers que enviam os dados da empresa do usuário autenticado.
    Route::inertia('company', 'company')->name('company');
    Route::inertia('diagnosis', 'diagnosis')->name('diagnosis');
    Route::inertia('results', 'results')->name('results');
    Route::inertia('path', 'path')->name('path');
    Route::inertia('plan', 'plan')->name('plan');
    Route::inertia('tracking', 'tracking')->name('tracking');
    Route::inertia('explore', 'explore')->name('explore');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
