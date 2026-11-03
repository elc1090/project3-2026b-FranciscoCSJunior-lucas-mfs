<?php

namespace Database\Seeders;

use App\Models\IsoRequirement;
use Illuminate\Database\Seeder;

class IsoRequirementSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = json_decode(file_get_contents(database_path('data/catalog.json')), true, 512, JSON_THROW_ON_ERROR);
        foreach ($catalog['isoRequirements'] as $row) {
            IsoRequirement::updateOrCreate(['code' => $row['id']], [
                'clause' => $row['clause'],
                'title_es' => $row['title']['es'],
                'title_pt' => $row['title']['pt'],
                'description_es' => $row['description']['es'],
                'description_pt' => $row['description']['pt'],
            ]);
        }
    }
}
