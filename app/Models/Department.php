<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'physical_address', 'head_of_area_id'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function headOfArea(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_of_area_id');
    }
}
