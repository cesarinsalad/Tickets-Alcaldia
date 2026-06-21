<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    protected $table = 'equipment';

    protected $fillable = ['sku', 'brand', 'model', 'processor', 'ram_memory', 'storage_disk'];

    public function interventionReports(): HasMany
    {
        return $this->hasMany(InterventionReport::class);
    }
}
