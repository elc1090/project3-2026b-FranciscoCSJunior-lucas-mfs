<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['sdgs' => 'array'];

    public function recommendation()
    {
        return $this->hasOne(Recommendation::class);
    }
}
