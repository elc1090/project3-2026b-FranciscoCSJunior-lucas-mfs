<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/companies', [AdminController::class, 'companies'])->name('companies.index');
    Route::get('/companies/{company}', [AdminController::class, 'company'])->name('companies.show');
    Route::get('/users', [AdminController::class, 'users'])->name('users.index');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
    Route::patch('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::put('/users/{user}/password', [AdminController::class, 'password'])->name('users.password');
});
