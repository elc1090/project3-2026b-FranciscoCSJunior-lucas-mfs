<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carbon_records', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->date('period');
            $t->decimal('electricity_kwh', 14, 2)->default(0);
            $t->decimal('natural_gas_m3', 14, 2)->default(0);
            $t->decimal('lpg_kg', 14, 2)->default(0);
            $t->decimal('diesel_l', 14, 2)->default(0);
            $t->decimal('gasoline_l', 14, 2)->default(0);
            $t->timestamps();
            $t->unique(['company_id', 'period']);
        });
        Schema::create('iso_requirements', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('clause');
            $t->string('title_es');
            $t->string('title_pt');
            $t->text('description_es');
            $t->text('description_pt');
            $t->timestamps();
        });
        Schema::create('company_iso_requirement', function (Blueprint $t) {
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->foreignId('iso_requirement_id')->constrained()->cascadeOnDelete();
            $t->primary(['company_id', 'iso_requirement_id']);
        });
    }

    public function down(): void
    {
        foreach (['company_iso_requirement', 'iso_requirements', 'carbon_records'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
