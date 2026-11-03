<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarbonRecord extends Model
{
    protected $fillable = ['period', 'electricity_kwh', 'natural_gas_m3', 'lpg_kg', 'diesel_l', 'gasoline_l'];

    protected function casts(): array
    {
        return [
            'period' => 'date',
            'electricity_kwh' => 'float',
            'natural_gas_m3' => 'float',
            'lpg_kg' => 'float',
            'diesel_l' => 'float',
            'gasoline_l' => 'float',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
