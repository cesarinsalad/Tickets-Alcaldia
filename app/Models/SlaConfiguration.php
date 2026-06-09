<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlaConfiguration extends Model
{
    protected $fillable = ['priority', 'response_minutes', 'resolution_hours'];
}
