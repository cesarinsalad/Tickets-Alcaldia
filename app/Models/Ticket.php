<?php

namespace App\Models;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'title', 'description', 'priority', 'status',
        'creator_id', 'assigned_id', 'category_id', 'photo_path',
        'entry_date', 'exit_date',
        'sla_response_deadline', 'sla_resolution_deadline',
    ];

    protected function casts(): array
    {
        return [
            'priority' => TicketPriority::class,
            'status' => TicketStatus::class,
            'entry_date' => 'datetime',
            'exit_date' => 'datetime',
            'sla_response_deadline' => 'datetime',
            'sla_resolution_deadline' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function assigned(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->orderBy('created_at');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function getDepartmentAttribute()
    {
        return $this->creator?->department;
    }

    public function scopeVisibleTo($query, User $user): void
    {
        if ($user->hasAnyRole(['super_admin', 'admin_tickets'])) {
            return;
        }

        if ($user->hasRole('admin_departamento')) {
            $query->whereHas('creator', function ($q) use ($user) {
                $q->where('department_id', $user->department_id);
            });
            return;
        }

        if ($user->hasRole('tecnico')) {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_id', $user->id)
                    ->orWhere('creator_id', $user->id);
            });
            return;
        }

        $query->where('creator_id', $user->id);
    }

    public static function generateCode(): string
    {
        $year = now()->year;

        $sequence = DB::transaction(function () use ($year) {
            $seq = DB::table('ticket_sequences')
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if ($seq) {
                DB::table('ticket_sequences')
                    ->where('year', $year)
                    ->update(['last_sequence' => $seq->last_sequence + 1]);

                return $seq->last_sequence + 1;
            }

            DB::table('ticket_sequences')->insert([
                'year' => $year,
                'last_sequence' => 1,
            ]);

            return 1;
        });

        return sprintf('TKT-%d-%04d', $year, $sequence);
    }
}
