<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportTemplate extends Model
{
    protected $table = 'report_templates';

    protected $fillable = ['name', 'source', 'filters', 'created_by'];

    protected $casts = [
        'filters' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->created_by === $user->id;
    }
}
