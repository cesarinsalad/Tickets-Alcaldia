<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RendimientoController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->filled('date_from')
            ? Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->startOfMonth();
        $dateTo = $request->filled('date_to')
            ? Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfMonth();

        $ticketQuery = Ticket::query()->whereBetween('entry_date', [$dateFrom, $dateTo]);
        $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

        // --- KPIs (same as admin dashboard) ---
        $activeTickets = (clone $ticketQuery)
            ->whereIn('status', [TicketStatus::Abierto, TicketStatus::EnProceso])
            ->count();

        $resolvedInPeriod = Ticket::whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
            ->whereBetween('exit_date', [$dateFrom, $dateTo])
            ->count();

        $withinSla = Ticket::whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
            ->whereBetween('exit_date', [$dateFrom, $dateTo])
            ->whereColumn('exit_date', '<=', 'sla_resolution_deadline')
            ->count();

        $slaPct = $resolvedInPeriod > 0 ? round(($withinSla / $resolvedInPeriod) * 100) : null;

        $techniciansOverdue = (clone $ticketQuery)
            ->whereIn('status', array_map(fn ($s) => $s->value, $activeStatuses))
            ->whereNotNull('sla_resolution_deadline')
            ->where('sla_resolution_deadline', '<', now())
            ->distinct('assigned_id')
            ->count('assigned_id');

        // --- MTTR (Mean Time to Resolution) in hours ---
        $mttr = Ticket::whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
            ->whereBetween('exit_date', [$dateFrom, $dateTo])
            ->whereNotNull('entry_date')
            ->whereNotNull('exit_date')
            ->selectRaw('ROUND(AVG(EXTRACT(EPOCH FROM (exit_date - entry_date))) / 3600.0, 1) as avg_hours')
            ->value('avg_hours');

        $mttr = $mttr !== null ? (float) $mttr : null;

        // --- Trend Data (Created vs Resolved) ---
        $trendGranularity = $request->input('trend_granularity', 'weeks');

        $trendConfig = match ($trendGranularity) {
            'days' => ['trunc' => 'day', 'period' => 'P30D'],
            'months' => ['trunc' => 'month', 'period' => 'P12M'],
            default => ['trunc' => 'week', 'period' => 'P84D'],
        };

        $trendStart = now()->sub(new \DateInterval($trendConfig['period']));

        $created = Ticket::where('entry_date', '>=', $trendStart)
            ->selectRaw("DATE_TRUNC('{$trendConfig['trunc']}', entry_date)::date as period, count(*) as count")
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('count', 'period');

        $resolved = Ticket::whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
            ->where('exit_date', '>=', $trendStart)
            ->selectRaw("DATE_TRUNC('{$trendConfig['trunc']}', exit_date)::date as period, count(*) as count")
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('count', 'period');

        $periodKeys = [];
        $cursor = $trendStart->copy();
        while ($cursor->lte(now())) {
            match ($trendGranularity) {
                'days' => $cursor->startOfDay(),
                'months' => $cursor->startOfMonth(),
                default => $cursor->startOfWeek(),
            };
            $periodKeys[] = $cursor->format('Y-m-d');
            match ($trendGranularity) {
                'days' => $cursor->addDay(),
                'months' => $cursor->addMonth(),
                default => $cursor->addWeek(),
            };
        }

        $trendData = collect($periodKeys)->map(function ($period) use ($created, $resolved) {
            return [
                'date' => Carbon::parse($period)->format('d/m'),
                'created' => (int) ($created[$period] ?? 0),
                'resolved' => (int) ($resolved[$period] ?? 0),
            ];
        })->values();

        // --- Technician Workload (moved from admin dashboards) ---
        $technicians = User::role('tecnico')
            ->where('is_active', true)
            ->withCount(['assignedTickets as active_count' => fn ($q) => $q->whereIn('status', $activeStatuses)])
            ->withCount(['assignedTickets as resolved_on_time' => fn ($q) => $q
                ->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                ->whereBetween('exit_date', [$dateFrom, $dateTo])
                ->whereColumn('exit_date', '<=', 'sla_resolution_deadline')
            ])
            ->withCount(['assignedTickets as resolved_overdue' => fn ($q) => $q
                ->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                ->whereBetween('exit_date', [$dateFrom, $dateTo])
                ->whereNotNull('sla_resolution_deadline')
                ->whereColumn('exit_date', '>', 'sla_resolution_deadline')
            ])
            ->orderByDesc('active_count')
            ->get();

        $technicianIds = $technicians->pluck('id');

        $priorityBreakdowns = DB::table('tickets')
            ->whereIn('assigned_id', $technicianIds)
            ->whereIn('status', $activeStatuses)
            ->selectRaw('assigned_id, priority, count(*) as count')
            ->groupBy('assigned_id', 'priority')
            ->get()
            ->groupBy('assigned_id');

        $technicianWorkload = $technicians->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->full_name,
            'department' => $u->department?->name,
            'active_count' => (int) $u->active_count,
            'priority_breakdown' => $priorityBreakdowns->get($u->id, collect())->pluck('count', 'priority')->toArray(),
            'resolved_on_time' => (int) $u->resolved_on_time,
            'resolved_overdue' => (int) $u->resolved_overdue,
        ]);

        return Inertia::render('Rendimiento/Index', [
            'kpis' => [
                'active_tickets' => $activeTickets,
                'resolved_this_month' => $resolvedInPeriod,
                'sla_pct' => $slaPct,
                'technicians_overdue' => $techniciansOverdue,
            ],
            'mttr' => $mttr,
            'trendData' => $trendData,
            'trendGranularity' => $trendGranularity,
            'technicianWorkload' => $technicianWorkload,
            'dateFrom' => $dateFrom->toDateString(),
            'dateTo' => $dateTo->toDateString(),
        ]);
    }
}
