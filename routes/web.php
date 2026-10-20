<?php

use App\Http\Controllers\SustainabilityController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');
Route::middleware('auth')->group(function () {
    foreach (['dashboard', 'company', 'diagnosis', 'results', 'path', 'plan', 'tracking', 'explore'] as $page) {
        Route::get($page, [SustainabilityController::class, 'show'])->name($page);
    }
    Route::put('company', [SustainabilityController::class, 'updateCompany'])->name('company.update');
    Route::post('diagnosis', [SustainabilityController::class, 'storeDiagnosis'])->name('diagnosis.store');
    Route::post('plan', [SustainabilityController::class, 'storeAction'])->name('plan.store');
    Route::patch('plan/{action}', [SustainabilityController::class, 'updateAction'])->name('plan.update');
    Route::delete('plan/{action}', [SustainabilityController::class, 'destroyAction'])->name('plan.destroy');
    Route::post('goals/{goal:code}/toggle', [SustainabilityController::class, 'toggleGoal'])->name('goals.toggle');
});
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
