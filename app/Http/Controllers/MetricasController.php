<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MetricasController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $dateFrom = $request->filled('date_from')
            ? Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->startOfMonth();
        $dateTo = $request->filled('date_to')
            ? Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfMonth();

        $ticketQuery = Ticket::query()->whereBetween('entry_date', [$dateFrom, $dateTo]);

        // --- KPIs (same as super_admin / admin_tickets dashboard) ---
        $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

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

        // --- Priority Distribution (Donut Chart) ---
        $priorityColors = [
            'critica' => '#991B1B',
            'alta' => '#EA580C',
            'media' => '#CA8A04',
            'baja' => '#64748B',
            'sin_definir' => '#94A3B8',
        ];

        $priorityDistribution = (clone $ticketQuery)
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get()
            ->sortBy(fn ($r) => array_search($r->priority->value, array_keys($priorityColors)) !== false
                ? array_search($r->priority->value, array_keys($priorityColors))
                : 99)
            ->map(fn ($r) => [
                'name' => $r->priority->label(),
                'value' => $r->priority->value,
                'count' => (int) $r->count,
                'color' => $priorityColors[$r->priority->value] ?? '#94A3B8',
            ])
            ->values();

        // --- Top 5 Problematic Equipment ---
        $topEquipment = DB::table('intervention_reports')
            ->join('equipment', 'intervention_reports.equipment_id', '=', 'equipment.id')
            ->select('equipment.sku', 'equipment.brand', 'equipment.model', DB::raw('count(*) as count'))
            ->groupBy('equipment.id', 'equipment.sku', 'equipment.brand', 'equipment.model')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // --- Technician Resolution Chart (stacked bar) ---
        $technicianChart = User::role('tecnico')
            ->where('is_active', true)
            ->withCount(['assignedTickets as resolved_on_time' => function ($q) use ($dateFrom, $dateTo) {
                $q->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                    ->whereBetween('exit_date', [$dateFrom, $dateTo])
                    ->whereColumn('exit_date', '<=', 'sla_resolution_deadline');
            }])
            ->withCount(['assignedTickets as resolved_overdue' => function ($q) use ($dateFrom, $dateTo) {
                $q->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                    ->whereBetween('exit_date', [$dateFrom, $dateTo])
                    ->whereNotNull('sla_resolution_deadline')
                    ->whereColumn('exit_date', '>', 'sla_resolution_deadline');
            }])
            ->get()
            ->filter(fn ($u) => $u->resolved_on_time > 0 || $u->resolved_overdue > 0)
            ->map(fn ($u) => [
                'name' => $u->full_name,
                'on_time' => (int) $u->resolved_on_time,
                'overdue' => (int) $u->resolved_overdue,
            ])
            ->values();

        // --- Existing: Top Departments ---
        $topDepartments = DB::table('tickets')
            ->join('users', 'tickets.creator_id', '=', 'users.id')
            ->join('departments', 'users.department_id', '=', 'departments.id')
            ->select('departments.id', 'departments.name', DB::raw('count(*) as count'))
            ->whereNull('tickets.deleted_at')
            ->whereNull('users.deleted_at')
            ->whereNull('departments.deleted_at')
            ->whereBetween('tickets.entry_date', [$dateFrom, $dateTo])
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('count')
            ->take(5)
            ->get();

        // --- Existing: Category Distribution ---
        $categoryDistribution = Category::select('id', 'name')
            ->withCount(['tickets' => function ($q) use ($dateFrom, $dateTo) {
                $q->whereNull('tickets.deleted_at')
                  ->whereBetween('entry_date', [$dateFrom, $dateTo]);
            }])
            ->orderByDesc('tickets_count')
            ->get()
            ->filter(fn ($c) => $c->tickets_count > 0)
            ->values()
            ->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'count' => $c->tickets_count]);

        return Inertia::render('Metricas/Index', [
            'kpis' => [
                'active_tickets' => $activeTickets,
                'resolved_this_month' => $resolvedInPeriod,
                'sla_pct' => $slaPct,
                'technicians_overdue' => $techniciansOverdue,
            ],
            'priorityDistribution' => $priorityDistribution,
            'topEquipment' => $topEquipment,
            'technicianChart' => $technicianChart,
            'topDepartments' => $topDepartments,
            'categoryDistribution' => $categoryDistribution,
            'dateFrom' => $dateFrom->toDateString(),
            'dateTo' => $dateTo->toDateString(),
        ]);
    }
}
