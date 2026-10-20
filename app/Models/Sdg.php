<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sdg extends Model
{
    protected $primaryKey = 'number';

    public $incrementing = false;

    protected $guarded = [];
}
