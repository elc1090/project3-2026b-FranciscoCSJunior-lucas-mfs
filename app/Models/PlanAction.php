<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanAction extends Model
{
    protected $guarded = ['id'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function recommendation()
    {
        return $this->belongsTo(Recommendation::class);
    }
}
