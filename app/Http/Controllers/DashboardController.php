<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $kpis = [];
        $extra = [];

        if ($user->hasRole('solicitante')) {
            $baseQuery = Ticket::query()->visibleTo($user);
            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

            $kpis = [
                'abiertos' => (clone $baseQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $baseQuery)->where('status', TicketStatus::EnProceso)->count(),
                'resueltos' => (clone $baseQuery)->where('status', TicketStatus::Resuelto)->count(),
            ];

            $myActiveTickets = (clone $baseQuery)
                ->whereIn('status', $activeStatuses)
                ->with(['category'])
                ->latest()
                ->take(15)
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'priority' => $t->priority->value,
                    'priority_label' => $t->priority->label(),
                    'category' => $t->category?->name,
                    'entry_date' => $t->entry_date?->format('d/m/Y H:i'),
                ]);

            $pendingReceipt = (clone $baseQuery)
                ->where('status', TicketStatus::Resuelto)
                ->with(['assigned', 'category'])
                ->latest('exit_date')
                ->take(10)
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'assigned_name' => $t->assigned?->full_name,
                    'exit_date' => $t->exit_date?->format('d/m/Y H:i'),
                ]);

            $extra = [
                'is_solicitante' => true,
                'my_active_tickets' => $myActiveTickets,
                'pending_receipt' => $pendingReceipt,
            ];
        } elseif ($user->hasRole('tecnico')) {
            $baseQuery = Ticket::query()->visibleTo($user);
            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];
            $activeStatusValues = array_map(fn($s) => $s->value, $activeStatuses);

            $kpis = [
                'abiertos_asignados' => (clone $baseQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $baseQuery)->where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => (clone $baseQuery)->where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos_hoy' => (clone $baseQuery)
                    ->where('status', TicketStatus::Resuelto)
                    ->whereDate('exit_date', today())
                    ->count(),
            ];

            $assignedQuery = Ticket::where('assigned_id', $user->id);

            $slaAtRisk = (clone $assignedQuery)
                ->whereIn('status', $activeStatuses)
                ->whereNotNull('sla_resolution_deadline')
                ->where('sla_resolution_deadline', '>', now())
                ->whereRaw("EXTRACT(EPOCH FROM (sla_resolution_deadline - NOW())) / GREATEST(EXTRACT(EPOCH FROM (sla_resolution_deadline - entry_date)), 1) <= 0.25")
                ->count();

            $slaExpired = (clone $assignedQuery)
                ->whereIn('status', $activeStatuses)
                ->whereNotNull('sla_resolution_deadline')
                ->where('sla_resolution_deadline', '<', now())
                ->count();

            $myQueue = (clone $assignedQuery)
                ->whereIn('status', $activeStatuses)
                ->with(['category', 'creator.department'])
                ->orderBy('sla_resolution_deadline')
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'priority' => $t->priority->value,
                    'priority_label' => $t->priority->label(),
                    'creator_name' => $t->creator->full_name,
                    'department' => $t->creator->department?->name,
                    'category' => $t->category?->name,
                    'sla_deadline' => $t->sla_resolution_deadline?->format('d/m/Y H:i'),
                    'sla_deadline_raw' => $t->sla_resolution_deadline?->toIso8601String(),
                    'entry_date_raw' => $t->entry_date?->toIso8601String(),
                    'entry_date' => $t->entry_date?->format('d/m/Y H:i'),
                ]);

            $recentlyClosed = (clone $assignedQuery)
                ->whereIn('status', [TicketStatus::Resuelto, TicketStatus::Cerrado])
                ->latest('exit_date')
                ->take(10)
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'exit_date' => $t->exit_date?->format('d/m/Y H:i'),
                    'priority' => $t->priority->value,
                    'priority_label' => $t->priority->label(),
                ]);

            $extra = [
                'is_tecnico' => true,
                'sla_at_risk' => $slaAtRisk,
                'sla_expired' => $slaExpired,
                'my_queue' => $myQueue,
                'recently_closed' => $recentlyClosed,
            ];
        } elseif ($user->hasRole('admin_departamento')) {
            $baseQuery = Ticket::query()->visibleTo($user);
            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

            $kpis = [
                'abiertos' => (clone $baseQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $baseQuery)->where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => (clone $baseQuery)->where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos' => (clone $baseQuery)->where('status', TicketStatus::Resuelto)->count(),
                'cerrados' => (clone $baseQuery)->where('status', TicketStatus::Cerrado)->count(),
            ];

            $totalResolved = (clone $baseQuery)->where('status', TicketStatus::Resuelto)
                ->whereNotNull('exit_date')
                ->whereNotNull('entry_date');

            $avgWait = (clone $totalResolved)
                ->selectRaw('AVG(EXTRACT(EPOCH FROM (exit_date - entry_date)) / 3600) as avg_hours')
                ->first()
                ->avg_hours;

            $activeList = (clone $baseQuery)
                ->whereIn('status', $activeStatuses)
                ->with(['category', 'creator'])
                ->latest()
                ->take(20)
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'priority' => $t->priority->value,
                    'priority_label' => $t->priority->label(),
                    'creator_name' => $t->creator->full_name,
                    'category' => $t->category?->name,
                    'entry_date' => $t->entry_date?->format('d/m/Y H:i'),
                ]);

            $totalDepartment = (clone $baseQuery)->count();

            $extra = [
                'is_admin_dept' => true,
                'total_department_tickets' => $totalDepartment,
                'avg_wait_hours' => $avgWait ? round((float) $avgWait, 1) : null,
                'dept_active_tickets' => $activeList,
            ];
        } elseif ($user->hasRole('admin_tickets')) {
            $kpis = [
                'abiertos' => Ticket::where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => Ticket::where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => Ticket::where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos' => Ticket::where('status', TicketStatus::Resuelto)->count(),
                'cerrados' => Ticket::where('status', TicketStatus::Cerrado)->count(),
                'resueltos_hoy' => Ticket::where('status', TicketStatus::Resuelto)
                    ->whereDate('exit_date', today())
                    ->count(),
            ];

            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

            $extra = [
                'is_admin_tickets' => true,
                'unassigned_tickets' => Ticket::whereIn('status', $activeStatuses)->whereNull('assigned_id')->count(),
                'sla_expired' => Ticket::whereIn('status', $activeStatuses)
                    ->whereNotNull('sla_resolution_deadline')
                    ->where('sla_resolution_deadline', '<', now())
                    ->count(),
                'sla_at_risk' => Ticket::whereIn('status', $activeStatuses)
                    ->whereNotNull('sla_resolution_deadline')
                    ->where('sla_resolution_deadline', '>', now())
                    ->whereRaw("EXTRACT(EPOCH FROM (sla_resolution_deadline - NOW())) / GREATEST(EXTRACT(EPOCH FROM (sla_resolution_deadline - entry_date)), 1) <= 0.25")
                    ->count(),
                'new_tickets' => Ticket::with(['creator.department', 'category'])
                    ->where('status', TicketStatus::Abierto)
                    ->latest()
                    ->take(10)
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'code' => $t->code,
                        'title' => $t->title,
                        'priority' => $t->priority->value,
                        'priority_label' => $t->priority->label(),
                        'creator_name' => $t->creator->full_name,
                        'department' => $t->creator->department?->name,
                        'category' => $t->category?->name,
                        'entry_date' => $t->entry_date?->format('d/m/Y H:i'),
                    ]),
                'technician_workload' => User::role('tecnico')
                    ->where('is_active', true)
                    ->withCount(['assignedTickets' => function ($q) use ($activeStatuses) {
                        $q->whereIn('status', $activeStatuses);
                    }])
                    ->orderByDesc('assigned_tickets_count')
                    ->get()
                    ->map(fn($u) => [
                        'id' => $u->id,
                        'name' => $u->full_name,
                        'department' => $u->department?->name,
                        'tickets_count' => $u->assigned_tickets_count,
                    ]),
            ];
        } elseif ($user->hasRole('super_admin')) {
            $kpis = [
                'abiertos' => Ticket::where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => Ticket::where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => Ticket::where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos' => Ticket::where('status', TicketStatus::Resuelto)->count(),
                'cerrados' => Ticket::where('status', TicketStatus::Cerrado)->count(),
                'resueltos_hoy' => Ticket::where('status', TicketStatus::Resuelto)
                    ->whereDate('exit_date', today())
                    ->count(),
            ];

            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

            $resolvedThisMonth = Ticket::where('status', TicketStatus::Resuelto)
                ->whereMonth('exit_date', now()->month)
                ->whereYear('exit_date', now()->year)
                ->count();

            $withinSla = Ticket::where('status', TicketStatus::Resuelto)
                ->whereMonth('exit_date', now()->month)
                ->whereYear('exit_date', now()->year)
                ->whereColumn('exit_date', '<=', 'sla_resolution_deadline')
                ->count();

            $topDepartments = DB::table('tickets')
                ->join('users', 'tickets.creator_id', '=', 'users.id')
                ->join('departments', 'users.department_id', '=', 'departments.id')
                ->select('departments.id', 'departments.name', DB::raw('count(*) as count'))
                ->whereNull('tickets.deleted_at')
                ->whereNull('users.deleted_at')
                ->whereNull('departments.deleted_at')
                ->whereIn('tickets.status', array_map(fn($s) => $s->value, $activeStatuses))
                ->groupBy('departments.id', 'departments.name')
                ->orderByDesc('count')
                ->take(5)
                ->get();

            $categoryDistribution = Category::select('id', 'name')
                ->withCount(['tickets' => function ($q) {
                    $q->whereNull('tickets.deleted_at');
                }])
                ->orderByDesc('tickets_count')
                ->get()
                ->filter(fn($c) => $c->tickets_count > 0)
                ->values()
                ->map(fn($c) => ['name' => $c->name, 'count' => $c->tickets_count]);

            $criticalExpired = Ticket::with(['creator.department', 'category', 'assigned'])
                ->whereIn('status', $activeStatuses)
                ->where(function ($q) {
                    $q->where('priority', TicketPriority::Critica)
                        ->orWhere(function ($q2) {
                            $q2->whereNotNull('sla_resolution_deadline')
                                ->where('sla_resolution_deadline', '<', now());
                        });
                })
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'priority' => $t->priority->value,
                    'priority_label' => $t->priority->label(),
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'department' => $t->creator?->department?->name,
                    'assigned' => $t->assigned?->full_name,
                    'category' => $t->category?->name,
                    'entry_date' => $t->entry_date?->format('d/m/Y H:i'),
                    'sla_deadline' => $t->sla_resolution_deadline?->format('d/m/Y H:i'),
                    'sla_deadline_raw' => $t->sla_resolution_deadline?->toIso8601String(),
                    'entry_date_raw' => $t->entry_date?->toIso8601String(),
                ]);

            $extra = [
                'is_superadmin' => true,
                'active_tickets' => Ticket::whereIn('status', $activeStatuses)->count(),
                'resolved_this_month' => $resolvedThisMonth,
                'sla_pct' => $resolvedThisMonth > 0 ? round(($withinSla / $resolvedThisMonth) * 100) : 100,
                'active_technicians' => User::role('tecnico')->where('is_active', true)->count(),
                'top_departments' => $topDepartments,
                'category_distribution' => $categoryDistribution,
                'critical_expired' => $criticalExpired,
            ];
        }

        $unreadNotifications = $user->notifications()->unread()->count();

        $role = $user->roles->first()?->name ?? 'solicitante';
        $roleLabels = [
            'solicitante' => 'Solicitante',
            'tecnico' => 'Técnico',
            'admin_departamento' => 'Administrador de Departamento',
            'admin_tickets' => 'Administrador de Tickets',
            'super_admin' => 'Super Administrador',
        ];

        $normalizedKpis = [
            'open' => $kpis['abiertos'] ?? $kpis['abiertos_asignados'] ?? 0,
            'in_process' => $kpis['en_proceso'] ?? 0,
            'pending_info' => $kpis['pendiente_informacion'] ?? null,
            'resolved' => $kpis['resueltos'] ?? null,
            'closed' => $kpis['cerrados'] ?? null,
            'resolved_today' => $kpis['resueltos_hoy'] ?? null,
            'total' => array_sum($kpis),
        ];

        return Inertia::render('Dashboard', [
            'stats' => array_merge([
                'kpis' => $normalizedKpis,
                'role' => $roleLabels[$role] ?? $role,
                'user_department' => $user->department?->name,
            ], $extra),
            'unreadNotifications' => $unreadNotifications,
        ]);
    }
}
