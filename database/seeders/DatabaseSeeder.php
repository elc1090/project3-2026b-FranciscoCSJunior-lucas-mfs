<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AdminSeeder::class);
        $this->call([QuestionSeeder::class, RecommendationSeeder::class, PathGoalSeeder::class, SdgSeeder::class, IsoRequirementSeeder::class]);
    }
}
