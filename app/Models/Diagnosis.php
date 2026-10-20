<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnosis extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['scores' => 'array'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
