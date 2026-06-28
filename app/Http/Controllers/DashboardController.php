<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
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

        $kpis = [];
        $extra = [];

        if ($user->usesDashboard('solicitante')) {
            $baseQuery = Ticket::query()->visibleTo($user);
            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

            $activePaginator = (clone $baseQuery)
                ->whereIn('status', $activeStatuses)
                ->with(['category'])
                ->latest()
                ->paginate(5, ['*'], 'active_page')
                ->withQueryString();

            $myActiveTickets = [
                'data' => $activePaginator->getCollection()->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'priority' => $t->priority->value,
                    'priority_label' => $t->priority->label(),
                    'category' => $t->category?->name,
                    'entry_date' => $t->entry_date?->format('d/m/Y H:i'),
                ])->values()->toArray(),
                'links' => $activePaginator->toArray()['links'] ?? [],
                'total' => $activePaginator->total(),
                'per_page' => $activePaginator->perPage(),
            ];

            $historyPaginator = (clone $baseQuery)
                ->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                ->with(['assigned'])
                ->latest('exit_date')
                ->paginate(5, ['*'], 'history_page')
                ->withQueryString();

            $myHistory = [
                'data' => $historyPaginator->getCollection()->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'assigned_name' => $t->assigned?->full_name,
                    'exit_date' => $t->exit_date?->format('d/m/Y H:i'),
                ])->values()->toArray(),
                'links' => $historyPaginator->toArray()['links'] ?? [],
                'total' => $historyPaginator->total(),
                'per_page' => $historyPaginator->perPage(),
            ];

            $extra = [
                'is_solicitante' => true,
                'my_active_tickets' => $myActiveTickets,
                'my_history_tickets' => $myHistory,
                'progress_pct' => (function () use ($baseQuery) {
                    $total = (clone $baseQuery)->count();
                    $resolved = (clone $baseQuery)->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])->count();
                    return $total > 0 ? round(($resolved / $total) * 100) : 0;
                })(),
            ];
        } elseif ($user->usesDashboard('tecnico')) {
            $baseQuery = Ticket::query()->visibleTo($user);
            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];
            $activeStatusValues = array_map(fn($s) => $s->value, $activeStatuses);

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

            $queueSort = $request->input('queue_sort', 'sla_resolution_deadline');
            $queueDir = $request->input('queue_dir', 'asc');
            $queueAllowedSorts = ['code', 'title', 'creator_name', 'priority', 'status', 'sla_resolution_deadline', 'entry_date'];
            if (!in_array($queueSort, $queueAllowedSorts)) $queueSort = 'sla_resolution_deadline';
            if (!in_array($queueDir, ['asc', 'desc'])) $queueDir = 'asc';

            $queuePaginator = (clone $assignedQuery)
                ->whereIn('status', $activeStatuses)
                ->with(['creator.department'])
                ->when($queueSort === 'creator_name', function ($q) use ($queueDir) {
                    $q->leftJoin('users as queue_creator_users', 'tickets.creator_id', '=', 'queue_creator_users.id')
                        ->reorder('queue_creator_users.name', $queueDir)
                        ->select('tickets.*');
                }, function ($q) use ($queueSort, $queueDir) {
                    $q->reorder($queueSort, $queueDir);
                })
                ->paginate(5, ['*'], 'queue_page')
                ->withQueryString();

            $myQueue = [
                'data' => $queuePaginator->getCollection()->map(fn($t) => [
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
                ])->values()->toArray(),
                'links' => $queuePaginator->toArray()['links'] ?? [],
                'total' => $queuePaginator->total(),
                'per_page' => $queuePaginator->perPage(),
            ];

            $closedPaginator = (clone $assignedQuery)
                ->whereIn('status', [TicketStatus::Resuelto, TicketStatus::Cerrado])
                ->latest('exit_date')
                ->paginate(5, ['*'], 'closed_page')
                ->withQueryString();

            $recentlyClosed = [
                'data' => $closedPaginator->getCollection()->map(fn($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'exit_date' => $t->exit_date?->format('d/m/Y H:i'),
                    'priority' => $t->priority->value,
                    'priority_label' => $t->priority->label(),
                ])->values()->toArray(),
                'links' => $closedPaginator->toArray()['links'] ?? [],
                'total' => $closedPaginator->total(),
                'per_page' => $closedPaginator->perPage(),
            ];

            $extra = [
                'is_tecnico' => true,
                'sla_at_risk' => $slaAtRisk,
                'sla_expired' => $slaExpired,
                'my_queue' => $myQueue,
                'recently_closed' => $recentlyClosed,
                'queue_sort' => $queueSort,
                'queue_dir' => $queueDir,
                'pending_info_count' => (clone $assignedQuery)
                    ->where('status', TicketStatus::PendienteInformacion->value)
                    ->count(),
                'queue_status_breakdown' => [
                    ['name' => 'Abiertos', 'count' => (clone $assignedQuery)->where('status', TicketStatus::Abierto->value)->count()],
                    ['name' => 'En Proceso', 'count' => (clone $assignedQuery)->where('status', TicketStatus::EnProceso->value)->count()],
                    ['name' => 'Pendiente Info', 'count' => (clone $assignedQuery)->where('status', TicketStatus::PendienteInformacion->value)->count()],
                ],
                'progress_pct' => (function () use ($assignedQuery) {
                    $total = (clone $assignedQuery)->count();
                    $resolved = (clone $assignedQuery)->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])->count();
                    return $total > 0 ? round(($resolved / $total) * 100) : 0;
                })(),
            ];
        } elseif ($user->usesDashboard('admin_departamento')) {
            $baseQuery = Ticket::query()->visibleTo($user)->whereBetween('entry_date', [$dateFrom, $dateTo]);
            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

            $kpis = [
                'abiertos' => (clone $baseQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $baseQuery)->where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => (clone $baseQuery)->where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos' => (clone $baseQuery)->where('status', TicketStatus::Resuelto)->count(),
                'cerrados' => (clone $baseQuery)->where('status', TicketStatus::Cerrado)->count(),
            ];

            $activePaginator = Ticket::query()
                ->visibleTo($user)
                ->whereIn('status', $activeStatuses)
                ->with(['category', 'creator'])
                ->latest()
                ->paginate(5, ['*'], 'dept_active_page')
                ->withQueryString();

            $activeList = [
                'data' => $activePaginator->getCollection()->map(fn($t) => [
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
                ])->values()->toArray(),
                'links' => $activePaginator->toArray()['links'] ?? [],
                'total' => $activePaginator->total(),
                'per_page' => $activePaginator->perPage(),
            ];

            $totalDepartment = (clone $baseQuery)->count();

            $topEmployees = User::where('department_id', $user->department_id)
                ->where('is_active', true)
                ->withCount(['createdTickets' => fn($q) => $q
                    ->whereBetween('entry_date', [$dateFrom, $dateTo])
                    ->whereNull('deleted_at')
                ])
                ->orderByDesc('created_tickets_count')
                ->take(5)
                ->get()
                ->filter(fn($u) => $u->created_tickets_count > 0)
                ->values()
                ->map(fn($u) => ['id' => $u->id, 'name' => $u->full_name, 'count' => $u->created_tickets_count]);

            $extra = [
                'is_admin_dept' => true,
                'total_department_tickets' => $totalDepartment,
                'resolved_in_period' => Ticket::query()
                    ->visibleTo($user)
                    ->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                    ->whereBetween('exit_date', [$dateFrom, $dateTo])
                    ->count(),
                'dept_active_tickets' => $activeList,
                'employees_with_active' => User::where('department_id', $user->department_id)
                    ->where('is_active', true)
                    ->whereHas('createdTickets', fn($q) => $q
                        ->whereIn('status', [TicketStatus::Abierto->value, TicketStatus::EnProceso->value, TicketStatus::PendienteInformacion->value])
                    )
                    ->count(),
                'top_employees' => $topEmployees,
            ];
        } elseif ($user->usesDashboard('admin_tickets')) {
            $ticketQuery = Ticket::query()->whereBetween('entry_date', [$dateFrom, $dateTo]);
            $kpis = [
                'abiertos' => (clone $ticketQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $ticketQuery)->where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => (clone $ticketQuery)->where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos' => (clone $ticketQuery)->where('status', TicketStatus::Resuelto)->count(),
                'cerrados' => (clone $ticketQuery)->where('status', TicketStatus::Cerrado)->count(),
                'resueltos_hoy' => (clone $ticketQuery)->where('status', TicketStatus::Resuelto)
                    ->whereDate('exit_date', today())
                    ->count(),
            ];

            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

            $criticalSort = $request->input('critical_sort', 'entry_date');
            $criticalDir = $request->input('critical_dir', 'desc');
            $allowedSorts = ['code', 'title', 'priority', 'status', 'entry_date', 'sla_resolution_deadline', 'assigned', 'department'];

            if (! in_array($criticalSort, $allowedSorts)) {
                $criticalSort = 'entry_date';
            }
            if (! in_array($criticalDir, ['asc', 'desc'])) {
                $criticalDir = 'desc';
            }

            $criticalSortMap = [
                'priority' => 'priority',
                'status' => 'status',
                'entry_date' => 'entry_date',
                'sla_resolution_deadline' => 'sla_resolution_deadline',
                'code' => 'code',
                'title' => 'title',
            ];

            $criticalPaginator = (clone $ticketQuery)->with(['creator.department', 'category', 'assigned'])
                ->whereIn('status', $activeStatuses)
                ->where(function ($q) {
                    $q->where('priority', TicketPriority::Critica)
                        ->orWhere(function ($q2) {
                            $q2->whereNotNull('sla_resolution_deadline')
                                ->where('sla_resolution_deadline', '<', now());
                        });
                })
                ->when($criticalSort === 'assigned', function ($q) use ($criticalDir) {
                    $q->leftJoin('users as assigned_users', 'tickets.assigned_id', '=', 'assigned_users.id')
                        ->orderBy('assigned_users.name', $criticalDir)
                        ->select('tickets.*');
                }, function ($q) use ($criticalSortMap, $criticalSort, $criticalDir) {
                    if ($criticalSort === 'department') {
                        $q->leftJoin('users as creator_users', 'tickets.creator_id', '=', 'creator_users.id')
                            ->leftJoin('departments', 'creator_users.department_id', '=', 'departments.id')
                            ->orderBy('departments.name', $criticalDir)
                            ->select('tickets.*');
                    } else {
                        $q->orderBy($criticalSortMap[$criticalSort] ?? 'entry_date', $criticalDir);
                    }
                })
                ->paginate(10, ['*'], 'critical_page')
                ->withQueryString();

            $criticalExpired = [
                'data' => $criticalPaginator->getCollection()->map(fn($t) => [
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
                ])->values()->toArray(),
                'links' => $criticalPaginator->toArray()['links'] ?? [],
                'total' => $criticalPaginator->total(),
                'per_page' => $criticalPaginator->perPage(),
            ];

            $resolvedInPeriod = Ticket::whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                ->whereBetween('exit_date', [$dateFrom, $dateTo])
                ->count();

            $withinSla = Ticket::whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                ->whereBetween('exit_date', [$dateFrom, $dateTo])
                ->whereColumn('exit_date', '<=', 'sla_resolution_deadline')
                ->count();

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

            $categoryDistribution = Category::select('id', 'name')
                ->withCount(['tickets' => function ($q) use ($dateFrom, $dateTo) {
                    $q->whereNull('tickets.deleted_at')
                      ->whereBetween('entry_date', [$dateFrom, $dateTo]);
                }])
                ->orderByDesc('tickets_count')
                ->get()
                ->filter(fn($c) => $c->tickets_count > 0)
                ->values()
                ->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'count' => $c->tickets_count]);

            $extra = [
                'is_admin_tickets' => true,
                'active_tickets' => (clone $ticketQuery)->whereIn('status', [TicketStatus::Abierto, TicketStatus::EnProceso])->count(),
                'resolved_this_month' => $resolvedInPeriod,
                'sla_pct' => $resolvedInPeriod > 0 ? round(($withinSla / $resolvedInPeriod) * 100) : null,
                'technicians_overdue' => (clone $ticketQuery)
                    ->whereIn('status', array_map(fn($s) => $s->value, $activeStatuses))
                    ->whereNotNull('sla_resolution_deadline')
                    ->where('sla_resolution_deadline', '<', now())
                    ->distinct('assigned_id')
                    ->count('assigned_id'),
                'unassigned_tickets' => (clone $ticketQuery)->whereIn('status', $activeStatuses)->whereNull('assigned_id')->count(),
                'sla_expired' => (clone $ticketQuery)->whereIn('status', $activeStatuses)
                    ->whereNotNull('sla_resolution_deadline')
                    ->where('sla_resolution_deadline', '<', now())
                    ->count(),
                'sla_at_risk' => (clone $ticketQuery)->whereIn('status', $activeStatuses)
                    ->whereNotNull('sla_resolution_deadline')
                    ->where('sla_resolution_deadline', '>', now())
                    ->whereRaw("EXTRACT(EPOCH FROM (sla_resolution_deadline - NOW())) / GREATEST(EXTRACT(EPOCH FROM (sla_resolution_deadline - entry_date)), 1) <= 0.25")
                    ->count(),
                'new_tickets' => (function () use ($request) {
                    $paginator = Ticket::with(['creator.department', 'category'])
                        ->visibleTo($request->user())
                        ->where('status', TicketStatus::Abierto)
                        ->latest()
                        ->paginate(10)
                        ->withQueryString();

                    return [
                        'data' => $paginator->getCollection()->map(fn($t) => [
                            'id' => $t->id,
                            'code' => $t->code,
                            'title' => $t->title,
                            'priority' => $t->priority->value,
                            'priority_label' => $t->priority->label(),
                            'creator_name' => $t->creator->full_name,
                            'department' => $t->creator->department?->name,
                            'category' => $t->category?->name,
                            'entry_date' => $t->entry_date?->format('d/m/Y H:i'),
                        ])->values()->toArray(),
                        'links' => $paginator->toArray()['links'] ?? [],
                        'total' => $paginator->total(),
                        'per_page' => $paginator->perPage(),
                    ];
                })(),
                'critical_expired' => $criticalExpired,
                'critical_sort' => $criticalSort,
                'critical_dir' => $criticalDir,
                'top_departments' => $topDepartments,
                'category_distribution' => $categoryDistribution,
            ];
        } elseif ($user->usesDashboard('super_admin')) {
            $ticketQuery = Ticket::query()->whereBetween('entry_date', [$dateFrom, $dateTo]);
            $kpis = [
                'abiertos' => (clone $ticketQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $ticketQuery)->where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => (clone $ticketQuery)->where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos' => (clone $ticketQuery)->where('status', TicketStatus::Resuelto)->count(),
                'cerrados' => (clone $ticketQuery)->where('status', TicketStatus::Cerrado)->count(),
                'resueltos_hoy' => (clone $ticketQuery)->where('status', TicketStatus::Resuelto)
                    ->whereDate('exit_date', today())
                    ->count(),
            ];

            $activeStatuses = [TicketStatus::Abierto, TicketStatus::EnProceso, TicketStatus::PendienteInformacion];

            $resolvedInPeriod = Ticket::whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                ->whereBetween('exit_date', [$dateFrom, $dateTo])
                ->count();

            $withinSla = Ticket::whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                ->whereBetween('exit_date', [$dateFrom, $dateTo])
                ->whereColumn('exit_date', '<=', 'sla_resolution_deadline')
                ->count();

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

            $categoryDistribution = Category::select('id', 'name')
                ->withCount(['tickets' => function ($q) use ($dateFrom, $dateTo) {
                    $q->whereNull('tickets.deleted_at')
                      ->whereBetween('entry_date', [$dateFrom, $dateTo]);
                }])
                ->orderByDesc('tickets_count')
                ->get()
                ->filter(fn($c) => $c->tickets_count > 0)
                ->values()
                ->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'count' => $c->tickets_count]);

            $criticalSort = $request->input('critical_sort', 'entry_date');
            $criticalDir = $request->input('critical_dir', 'desc');
            $allowedSorts = ['code', 'title', 'priority', 'status', 'entry_date', 'sla_resolution_deadline', 'assigned', 'department'];

            if (! in_array($criticalSort, $allowedSorts)) {
                $criticalSort = 'entry_date';
            }
            if (! in_array($criticalDir, ['asc', 'desc'])) {
                $criticalDir = 'desc';
            }

            $criticalSortMap = [
                'priority' => 'priority',
                'status' => 'status',
                'entry_date' => 'entry_date',
                'sla_resolution_deadline' => 'sla_resolution_deadline',
                'code' => 'code',
                'title' => 'title',
            ];

            $criticalPaginator = (clone $ticketQuery)->with(['creator.department', 'category', 'assigned'])
                ->whereIn('status', $activeStatuses)
                ->where(function ($q) {
                    $q->where('priority', TicketPriority::Critica)
                        ->orWhere(function ($q2) {
                            $q2->whereNotNull('sla_resolution_deadline')
                                ->where('sla_resolution_deadline', '<', now());
                        });
                })
                ->when($criticalSort === 'assigned', function ($q) use ($criticalDir) {
                    $q->leftJoin('users as assigned_users', 'tickets.assigned_id', '=', 'assigned_users.id')
                        ->orderBy('assigned_users.name', $criticalDir)
                        ->select('tickets.*');
                }, function ($q) use ($criticalSortMap, $criticalSort, $criticalDir) {
                    if ($criticalSort === 'department') {
                        $q->leftJoin('users as creator_users', 'tickets.creator_id', '=', 'creator_users.id')
                            ->leftJoin('departments', 'creator_users.department_id', '=', 'departments.id')
                            ->orderBy('departments.name', $criticalDir)
                            ->select('tickets.*');
                    } else {
                        $q->orderBy($criticalSortMap[$criticalSort] ?? 'entry_date', $criticalDir);
                    }
                })
                ->paginate(10, ['*'], 'critical_page')
                ->withQueryString();

            $criticalExpired = [
                'data' => $criticalPaginator->getCollection()->map(fn($t) => [
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
                ])->values()->toArray(),
                'links' => $criticalPaginator->toArray()['links'] ?? [],
                'total' => $criticalPaginator->total(),
                'per_page' => $criticalPaginator->perPage(),
            ];

            $extra = [
                'is_superadmin' => true,
                'active_tickets' => (clone $ticketQuery)->whereIn('status', [TicketStatus::Abierto, TicketStatus::EnProceso])->count(),
                'resolved_this_month' => $resolvedInPeriod,
                'sla_pct' => $resolvedInPeriod > 0 ? round(($withinSla / $resolvedInPeriod) * 100) : null,
                'technicians_overdue' => (clone $ticketQuery)
                    ->whereIn('status', array_map(fn($s) => $s->value, $activeStatuses))
                    ->whereNotNull('sla_resolution_deadline')
                    ->where('sla_resolution_deadline', '<', now())
                    ->distinct('assigned_id')
                    ->count('assigned_id'),
                'top_departments' => $topDepartments,
                'category_distribution' => $categoryDistribution,
                'critical_expired' => $criticalExpired,
                'critical_sort' => $criticalSort,
                'critical_dir' => $criticalDir,
                'new_tickets' => (function () use ($request) {
                    $paginator = Ticket::with(['creator.department', 'category'])
                        ->visibleTo($request->user())
                        ->where('status', TicketStatus::Abierto)
                        ->latest()
                        ->paginate(10)
                        ->withQueryString();

                    return [
                        'data' => $paginator->getCollection()->map(fn($t) => [
                            'id' => $t->id,
                            'code' => $t->code,
                            'title' => $t->title,
                            'priority' => $t->priority->value,
                            'priority_label' => $t->priority->label(),
                            'creator_name' => $t->creator->full_name,
                            'department' => $t->creator->department?->name,
                            'category' => $t->category?->name,
                            'entry_date' => $t->entry_date?->format('d/m/Y H:i'),
                        ])->values()->toArray(),
                        'links' => $paginator->toArray()['links'] ?? [],
                        'total' => $paginator->total(),
                        'per_page' => $paginator->perPage(),
                    ];
                })(),
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
                'date_from' => $dateFrom->toDateString(),
                'date_to' => $dateTo->toDateString(),
            ], $extra),
            'unreadNotifications' => $unreadNotifications,
        ]);
    }
}
