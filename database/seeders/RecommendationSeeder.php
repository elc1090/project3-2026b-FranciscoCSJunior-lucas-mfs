<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Recommendation;
use Illuminate\Database\Seeder;

class RecommendationSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = json_decode(file_get_contents(database_path('data/catalog.json')), true, 512, JSON_THROW_ON_ERROR);
        foreach ($catalog['recommendations'] as $row) {
            $fields = [];
            foreach ($row as $field => $value) {
                if ($field === 'id') {
                    continue;
                }
                if ($field === 'questionId') {
                    $fields['question_id'] = Question::where('code', $value)->firstOrFail()->id;

                    continue;
                }
                if (is_array($value) && isset($value['es'])) {
                    $fields[$field.'_es'] = $value['es'];
                    $fields[$field.'_pt'] = $value['pt'];
                } else {
                    $fields[$field] = $value;
                }
            }
            Recommendation::updateOrCreate(['code' => $row['id']], $fields);
        }
    }
}
