<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->string('sector')->default('other');
            $t->string('size')->default('micro');
            $t->unsignedInteger('workers')->default(0);
            $t->string('region')->default('');
            $t->timestamps();
        });
        Schema::create('questions', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('dimension');
            $t->string('group')->nullable();
            $t->string('sector')->nullable();
            $t->text('text_es');
            $t->text('text_pt');
            $t->json('sdgs');
            $t->timestamps();
        });
        Schema::create('recommendations', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->foreignId('question_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('title_es');
            $t->string('title_pt');
            $t->text('description_es');
            $t->text('description_pt');
            $t->timestamps();
        });
        Schema::create('path_goals', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->unsignedTinyInteger('level');
            $t->string('dimension');
            $t->string('title_es');
            $t->string('title_pt');
            $t->timestamps();
        });
        Schema::create('sdgs', function (Blueprint $t) {
            $t->unsignedTinyInteger('number')->primary();
            $t->string('title_es');
            $t->string('title_pt');
            $t->text('description_es');
            $t->text('description_pt');
            $t->timestamps();
        });
        Schema::create('diagnoses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->json('scores');
            $t->timestamps();
        });
        Schema::create('answers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('diagnosis_id')->constrained()->cascadeOnDelete();
            $t->foreignId('question_id')->constrained();
            $t->unsignedTinyInteger('value');
            $t->unique(['diagnosis_id', 'question_id']);
        });
        Schema::create('plan_actions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->foreignId('recommendation_id')->constrained();
            $t->string('owner')->default('');
            $t->date('due_date')->nullable();
            $t->string('indicator')->default('');
            $t->string('status')->default('pending');
            $t->timestamps();
            $t->unique(['company_id', 'recommendation_id']);
        });
        Schema::create('company_goal', function (Blueprint $t) {
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->foreignId('path_goal_id')->constrained()->cascadeOnDelete();
            $t->primary(['company_id', 'path_goal_id']);
        });
    }

    public function down(): void
    {
        foreach (['company_goal', 'plan_actions', 'answers', 'diagnoses', 'sdgs', 'path_goals', 'recommendations', 'questions', 'companies'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
