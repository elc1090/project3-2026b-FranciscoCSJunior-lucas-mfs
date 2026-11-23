<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = Str::lower(trim(config('admin.email') ?? ''));
        if ($email === '') {
            return;
        }
        DB::transaction(function () use ($email) {
            $user = User::where('auth_provider', 'local')->where('email', $email)->lockForUpdate()->first();
            if ($user) {
                $user->update(['role' => 'admin']);

                return;
            }
            $password = config('admin.password');
            if (! filter_var($email, FILTER_VALIDATE_EMAIL) || ! is_string($password) || strlen($password) < 8) {
                throw new RuntimeException('Configure a valid ADMIN_EMAIL and an ADMIN_PASSWORD with at least 8 characters before creating the first administrator.');
            }
            User::create(['name' => config('admin.name') ?: 'Admin', 'email' => $email,
                'password' => $password, 'auth_provider' => 'local', 'role' => 'admin', 'must_change_password' => true]);
        });
    }
}
