<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('auth_provider', 16)->default('local');
            $table->string('google_subject')->nullable()->unique();
            $table->string('password')->nullable()->change();
            $table->string('course', 120)->nullable();
            $table->string('city', 120)->nullable();
            $table->string('interests', 1000)->nullable();
            $table->text('presentation')->nullable();
            $table->dropUnique(['email']);
            $table->unique(['email', 'auth_provider']);
        });
    }

    public function down(): void
    {
        // Rolling back would merge identities with the same e-mail and discard
        // profile information. Refuse that destructive rollback explicitly.
        throw new RuntimeException('Restore a reviewed backup to remove Google identities safely.');
    }
};
