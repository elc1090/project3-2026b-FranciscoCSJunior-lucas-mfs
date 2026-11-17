<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Última análise gerada pela IA para cada empresa, uma por idioma.
        Schema::create('ai_insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('diagnosis_id')->nullable()->constrained()->nullOnDelete();
            $table->string('locale', 2);
            $table->json('content');
            $table->timestamps();
            $table->unique(['company_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_insights');
    }
};
