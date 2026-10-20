<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = ['name', 'sector', 'size', 'workers', 'region'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function diagnoses()
    {
        return $this->hasMany(Diagnosis::class);
    }

    public function actions()
    {
        return $this->hasMany(PlanAction::class);
    }

    public function goals()
    {
        return $this->belongsToMany(PathGoal::class, 'company_goal');
    }
}
