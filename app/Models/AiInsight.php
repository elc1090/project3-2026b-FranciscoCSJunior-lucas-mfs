<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiInsight extends Model
{
    protected $fillable = ['diagnosis_id', 'locale', 'content'];

    protected function casts(): array
    {
        return ['content' => 'array'];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
