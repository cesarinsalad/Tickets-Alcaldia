<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Exports\ReportesExport;
use App\Models\Category;
use App\Models\Department;
use App\Models\Equipment;
use App\Models\Ticket;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportesController extends Controller
{
    private const TEMPLATES = [
        'cierre_mes' => [
            'label' => 'Cierre de Mes Operativo',
            'source' => 'tickets',
            'filters' => ['status' => 'cerrado'],
        ],
        'obsolescencia' => [
            'label' => 'Reporte de Obsolescencia',
            'source' => 'equipments',
            'filters' => ['disk_type' => 'HDD', 'ram_max' => 8],
        ],
        'auditoria_accesos' => [
            'label' => 'Auditoría de Accesos',
            'source' => 'users',
            'filters' => ['role' => 'tecnico,admin_tickets,super_admin'],
        ],
    ];

    private const COLUMNS = [
        'tickets' => [
            ['key' => 'code', 'label' => 'Código'],
            ['key' => 'title', 'label' => 'Título'],
            ['key' => 'creator_name', 'label' => 'Solicitante'],
            ['key' => 'department_name', 'label' => 'Departamento'],
            ['key' => 'priority_label', 'label' => 'Prioridad', 'format' => 'badge'],
            ['key' => 'status_label', 'label' => 'Estado', 'format' => 'badge'],
            ['key' => 'assigned_name', 'label' => 'Técnico'],
            ['key' => 'entry_date', 'label' => 'Fecha Ingreso', 'format' => 'datetime'],
            ['key' => 'exit_date', 'label' => 'Fecha Egreso', 'format' => 'datetime'],
            ['key' => 'sla_status', 'label' => 'SLA'],
        ],
        'equipments' => [
            ['key' => 'sku', 'label' => 'SKU'],
            ['key' => 'brand', 'label' => 'Marca'],
            ['key' => 'model', 'label' => 'Modelo'],
            ['key' => 'processor', 'label' => 'Procesador'],
            ['key' => 'ram_memory', 'label' => 'RAM'],
            ['key' => 'storage_disk', 'label' => 'Disco'],
            ['key' => 'interventions_count', 'label' => 'Total Intervenciones'],
        ],
        'users' => [
            ['key' => 'full_name', 'label' => 'Nombre'],
            ['key' => 'email', 'label' => 'Email'],
            ['key' => 'phone_number', 'label' => 'Teléfono'],
            ['key' => 'role_label', 'label' => 'Rol'],
            ['key' => 'department_name', 'label' => 'Departamento'],
            ['key' => 'is_active', 'label' => 'Activo', 'format' => 'boolean'],
        ],
    ];

    public function index(Request $request)
    {
        $user = $request->user();
        $source = $request->input('source');
        $template = $request->input('template');

        $filters = $this->resolveFilters($request);

        $departments = Department::orderBy('name')->get(['id', 'name']);
        $technicians = User::role('tecnico')->where('is_active', true)->orderBy('name')->get(['id', 'name', 'last_name']);
        $equipmentBrands = Equipment::whereNotNull('brand')->distinct()->orderBy('brand')->pluck('brand');
        $roles = ['solicitante', 'tecnico', 'admin_departamento', 'admin_tickets', 'super_admin'];
        $categories = Category::orderBy('name')->get(['id', 'name']);

        $rows = null;
        $columns = [];
        $groupSubtotals = [];
        $groupBy = $filters['group_by'] ?? 'none';

        if ($source) {
            $columns = self::COLUMNS[$source] ?? [];

            $query = match ($source) {
                'tickets' => $this->buildTicketQuery($request, $filters),
                'equipments' => $this->buildEquipmentQuery($request, $filters),
                'users' => $this->buildUserQuery($request, $filters),
                default => null,
            };

            if ($query) {
                if ($source === 'tickets') {
                    $allRows = $query->get()->map(fn ($t) => $this->transformTicketRow($t));
                    $rows = $this->paginateCollection($allRows, 15, $request);
                    $groupSubtotals = $groupBy !== 'none'
                        ? $this->computeGroupSubtotals($allRows, $groupBy)
                        : [];
                } elseif ($source === 'equipments') {
                    $allRows = $query->get()->map(fn ($e) => $this->transformEquipmentRow($e));
                    $rows = $this->paginateCollection($allRows, 15, $request);
                    $groupSubtotals = $groupBy !== 'none'
                        ? $this->computeGroupSubtotals($allRows, $groupBy)
                        : [];
                } else {
                    $rows = $query->paginate(15)->withQueryString();
                }
            }
        }

        return Inertia::render('Reportes/Index', [
            'source' => $source,
            'template' => $template,
            'filters' => $filters,
            'columns' => $columns,
            'rows' => $rows,
            'groupSubtotals' => $groupSubtotals,
            'groupBy' => $groupBy,
            'templates' => collect(self::TEMPLATES)->map(fn ($t, $key) => [
                'key' => $key,
                'label' => $t['label'],
                'source' => $t['source'],
                'filters' => $t['filters'],
            ])->values(),
            'departments' => $departments,
            'technicians' => $technicians->map(fn ($u) => [
                'id' => $u->id,
                'full_name' => $u->full_name,
            ]),
            'equipmentBrands' => $equipmentBrands,
            'roles' => $roles,
            'categories' => $categories,
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ]);
    }

    private function transformTicketRow(Ticket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'code' => $ticket->code,
            'title' => $ticket->title,
            'creator_name' => $ticket->creator?->full_name ?? '—',
            'department_name' => $ticket->creator?->department?->name ?? '—',
            'category_name' => $ticket->category?->name ?? '—',
            'priority' => $ticket->priority->value,
            'priority_label' => $ticket->priority->label(),
            'status' => $ticket->status->value,
            'status_label' => $ticket->status->label(),
            'assigned_name' => $ticket->assigned?->full_name ?? 'Sin asignar',
            'entry_date' => $ticket->entry_date?->format('d/m/Y H:i'),
            'exit_date' => $ticket->exit_date?->format('d/m/Y H:i'),
            'sla_status' => $this->computeSlaStatus($ticket),
        ];
    }

    private function transformEquipmentRow(Equipment $equipment): array
    {
        return [
            'id' => $equipment->id,
            'sku' => $equipment->sku,
            'brand' => $equipment->brand ?? '—',
            'model' => $equipment->model ?? '—',
            'processor' => $equipment->processor ?? '—',
            'ram_memory' => $equipment->ram_memory ?? '—',
            'storage_disk' => $equipment->storage_disk ?? '—',
            'department_name' => $equipment->department?->name ?? '—',
            'interventions_count' => (int) $equipment->interventions_count,
        ];
    }

    private function computeSlaStatus(Ticket $ticket): string
    {
        $statusValue = $ticket->status->value;
        if (in_array($statusValue, ['resuelto', 'cerrado'], true)) {
            if ($ticket->exit_date && $ticket->sla_resolution_deadline) {
                return $ticket->exit_date <= $ticket->sla_resolution_deadline ? 'A tiempo' : 'Vencido';
            }
            return '—';
        }
        if ($ticket->sla_resolution_deadline && $ticket->sla_resolution_deadline < now()) {
            return 'Vencido';
        }
        return '—';
    }

    private function paginateCollection(\Illuminate\Support\Collection $collection, int $perPage, Request $request)
    {
        $page = (int) $request->input('page', 1);
        $total = $collection->count();
        $items = $collection->slice(($page - 1) * $perPage, $perPage)->values();

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );
    }

    public function exportPdf(Request $request)
    {
        $source = $request->input('source');
        $filters = $this->resolveFilters($request);

        if (! $source || ! isset(self::COLUMNS[$source])) {
            abort(400, 'Origen de datos no válido.');
        }

        $columns = self::COLUMNS[$source];

        $query = match ($source) {
            'tickets' => $this->buildTicketQuery($request, $filters),
            'equipments' => $this->buildEquipmentQuery($request, $filters),
            'users' => $this->buildUserQuery($request, $filters),
            default => abort(400),
        };

        $rows = match (true) {
            $source === 'tickets' => $query->get()->map(fn ($t) => $this->transformTicketRow($t)),
            $source === 'equipments' => $query->get()->map(fn ($e) => $this->transformEquipmentRow($e)),
            default => $query->get(),
        };
        $totalRows = $rows->count();
        $totalPages = (int) ceil($totalRows / 35);

        $groupBy = $filters['group_by'] ?? 'none';
        $groupSubtotals = (in_array($source, ['tickets', 'equipments'], true) && $groupBy !== 'none')
            ? $this->computeGroupSubtotals($rows, $groupBy)
            : [];
        $structuredRows = $this->buildStructuredRows($rows, $groupBy, $groupSubtotals);

        $sourceLabels = [
            'tickets' => 'Tickets',
            'equipments' => 'Equipos',
            'users' => 'Usuarios',
        ];

        $title = 'Reporte de ' . ($sourceLabels[$source] ?? $source);

        $filterParts = [];
        foreach ($filters as $key => $value) {
            if ($value !== null && $value !== '' && $value !== []) {
                $label = $this->filterLabel($key, $value);
                if ($label) {
                    $filterParts[] = $label;
                }
            }
        }
        $filtersSummary = ! empty($filterParts) ? implode(' &middot; ', $filterParts) : 'Ninguno';

        $pdf = Pdf::loadView('pdf.reportes', [
            'title' => $title,
            'generatedBy' => $request->user()->full_name,
            'filtersSummary' => $filtersSummary,
            'columns' => $columns,
            'rows' => $structuredRows,
            'groupBy' => $groupBy,
            'source' => $source,
            'totalRows' => $totalRows,
            'totalPages' => $totalPages,
        ]);

        $sourceKey = $source;
        return $pdf->download("reporte-{$sourceKey}-" . now()->format('Ymd-His') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        $source = $request->input('source');
        $filters = $this->resolveFilters($request);

        if (! $source || ! isset(self::COLUMNS[$source])) {
            abort(400, 'Origen de datos no válido.');
        }

        $columns = self::COLUMNS[$source];

        $query = match ($source) {
            'tickets' => $this->buildTicketQuery($request, $filters),
            'equipments' => $this->buildEquipmentQuery($request, $filters),
            'users' => $this->buildUserQuery($request, $filters),
            default => abort(400),
        };

        $rows = match (true) {
            $source === 'tickets' => $query->get()->map(fn ($t) => $this->transformTicketRow($t)),
            $source === 'equipments' => $query->get()->map(fn ($e) => $this->transformEquipmentRow($e)),
            default => $query->get(),
        };

        $groupBy = $filters['group_by'] ?? 'none';
        $groupSubtotals = (in_array($source, ['tickets', 'equipments'], true) && $groupBy !== 'none')
            ? $this->computeGroupSubtotals($rows, $groupBy)
            : [];
        $structuredRows = collect($this->buildStructuredRows($rows, $groupBy, $groupSubtotals));

        $sourceLabels = [
            'tickets' => 'Tickets',
            'equipments' => 'Equipos',
            'users' => 'Usuarios',
        ];
        $title = 'Reporte de ' . ($sourceLabels[$source] ?? $source);

        return Excel::download(
            new ReportesExport($structuredRows, $columns, $source, $title, $groupBy),
            "reporte-{$source}-" . now()->format('Ymd-His') . '.xlsx'
        );
    }

    private function resolveFilters(Request $request): array
    {
        $templateKey = $request->input('template');
        $sourceParam = $request->input('source');

        $filters = [
            'source' => $sourceParam,
            'template' => $templateKey,
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];

        if ($sourceParam === 'tickets') {
            $filters['status'] = $request->input('status');
            $filters['priority'] = $request->input('priority');
            $filters['department_id'] = $request->input('department_id');
            $filters['category_id'] = $request->input('category_id');
            $filters['assigned_id'] = $request->input('assigned_id');
            $filters['resolution'] = $request->input('resolution');
            $filters['group_by'] = $request->input('group_by') ?: 'none';
        } elseif ($sourceParam === 'equipments') {
            $filters['brand'] = $request->input('brand');
            $filters['ram_max'] = $request->input('ram_max');
            $filters['disk_type'] = $request->input('disk_type');
            $filters['sku'] = $request->input('sku');
            $filters['group_by'] = $request->input('group_by') ?: 'none';
        } elseif ($sourceParam === 'users') {
            $filters['role'] = $request->input('role');
            $filters['department_id'] = $request->input('department_id');
            $filters['is_active'] = $request->input('is_active');
            $filters['group_by'] = $request->input('group_by') ?: 'none';
        }

        if ($templateKey && isset(self::TEMPLATES[$templateKey])) {
            $preset = self::TEMPLATES[$templateKey];
            $filters['source'] = $preset['source'];

            foreach ($preset['filters'] as $key => $value) {
                if (! array_key_exists($key, $filters) || $filters[$key] === null) {
                    $filters[$key] = $value;
                }
            }

            if ($templateKey === 'cierre_mes') {
                if (empty($filters['date_from'])) {
                    $filters['date_from'] = now()->startOfMonth()->toDateString();
                }
                if (empty($filters['date_to'])) {
                    $filters['date_to'] = now()->endOfMonth()->toDateString();
                }
            }
        }

        return $filters;
    }

    private function buildTicketQuery(Request $request, array $filters)
    {
        $query = Ticket::query()->with(['creator.department', 'assigned', 'category']);

        if (! empty($filters['date_from'])) {
            $query->whereDate('entry_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('entry_date', '<=', $filters['date_to']);
        }

        if (! empty($filters['status'])) {
            $statuses = explode(',', $filters['status']);
            $query->whereIn('status', $statuses);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (! empty($filters['department_id'])) {
            $query->whereHas('creator', fn ($q) => $q->where('department_id', $filters['department_id']));
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['assigned_id'])) {
            $query->where('assigned_id', $filters['assigned_id']);
        }

        if (! empty($filters['resolution']) && $filters['resolution'] !== 'all') {
            if ($filters['resolution'] === 'on_time') {
                $query->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                    ->whereNotNull('exit_date')
                    ->whereNotNull('sla_resolution_deadline')
                    ->whereColumn('exit_date', '<=', 'sla_resolution_deadline');
            } elseif ($filters['resolution'] === 'overdue') {
                $query->where(function ($q) {
                    $q->where(function ($q2) {
                        $q2->whereIn('status', [TicketStatus::Resuelto->value, TicketStatus::Cerrado->value])
                            ->whereNotNull('exit_date')
                            ->whereNotNull('sla_resolution_deadline')
                            ->whereColumn('exit_date', '>', 'sla_resolution_deadline');
                    })->orWhere(function ($q2) {
                        $q2->whereIn('status', [TicketStatus::Abierto->value, TicketStatus::EnProceso->value, TicketStatus::PendienteInformacion->value])
                            ->whereNotNull('sla_resolution_deadline')
                            ->where('sla_resolution_deadline', '<', now());
                    });
                });
            }
        }

        // Ordering: by group_by first (if any), then by created_at
        $groupBy = $filters['group_by'] ?? 'none';
        if ($groupBy !== 'none' && $groupBy !== null) {
            $this->applyTicketGroupOrder($query, $groupBy);
        }

        return $query->orderBy('created_at', 'desc');
    }

    private function applyTicketGroupOrder($query, string $groupBy): void
    {
        switch ($groupBy) {
            case 'department':
                $query->leftJoin('users as creator_users', 'tickets.creator_id', '=', 'creator_users.id')
                    ->leftJoin('departments', 'creator_users.department_id', '=', 'departments.id')
                    ->orderBy('departments.name', 'asc')
                    ->orderBy('tickets.created_at', 'desc')
                    ->select('tickets.*');
                break;
            case 'category':
                $query->leftJoin('categories', 'tickets.category_id', '=', 'categories.id')
                    ->orderBy('categories.name', 'asc')
                    ->orderBy('tickets.created_at', 'desc')
                    ->select('tickets.*');
                break;
            case 'priority':
                $query->orderByRaw("CASE priority WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 WHEN 'sin_definir' THEN 5 ELSE 6 END")
                    ->orderBy('tickets.created_at', 'desc');
                break;
            case 'status':
                $query->orderByRaw("CASE status WHEN 'abierto' THEN 1 WHEN 'en_proceso' THEN 2 WHEN 'pendiente_informacion' THEN 3 WHEN 'resuelto' THEN 4 WHEN 'cerrado' THEN 5 ELSE 6 END")
                    ->orderBy('tickets.created_at', 'desc');
                break;
            case 'resolution':
                $query->orderByRaw("(CASE WHEN exit_date IS NOT NULL AND sla_resolution_deadline IS NOT NULL AND exit_date <= sla_resolution_deadline THEN 'a_tiempo' WHEN (status IN ('resuelto','cerrado') AND exit_date IS NOT NULL AND sla_resolution_deadline IS NOT NULL AND exit_date > sla_resolution_deadline) OR (status IN ('abierto','en_proceso','pendiente_informacion') AND sla_resolution_deadline IS NOT NULL AND sla_resolution_deadline < NOW()) THEN 'vencido' ELSE 'pendiente' END) ASC")
                    ->orderBy('tickets.created_at', 'desc');
                break;
            case 'assigned':
                $query->leftJoin('users as assigned_users', 'tickets.assigned_id', '=', 'assigned_users.id')
                    ->orderBy('assigned_users.name', 'asc')
                    ->orderBy('tickets.created_at', 'desc')
                    ->select('tickets.*');
                break;
        }
    }

    private function getGroupByOptions(?string $source): array
    {
        return match ($source) {
            'tickets' => [
                ['value' => 'none', 'label' => 'Ninguno'],
                ['value' => 'department', 'label' => 'Departamento'],
                ['value' => 'category', 'label' => 'Categoría'],
                ['value' => 'priority', 'label' => 'Prioridad'],
                ['value' => 'status', 'label' => 'Estado'],
                ['value' => 'resolution', 'label' => 'Resolución (SLA)'],
                ['value' => 'assigned', 'label' => 'Técnico'],
            ],
            'equipments' => [
                ['value' => 'none', 'label' => 'Ninguno'],
                ['value' => 'brand', 'label' => 'Marca'],
                ['value' => 'ram', 'label' => 'Memoria RAM'],
                ['value' => 'storage', 'label' => 'Almacenamiento'],
                ['value' => 'department', 'label' => 'Departamento'],
            ],
            'users' => [
                ['value' => 'none', 'label' => 'Ninguno'],
                ['value' => 'role', 'label' => 'Rol'],
                ['value' => 'department', 'label' => 'Departamento'],
                ['value' => 'is_active', 'label' => 'Estado'],
            ],
            'departments' => [
                ['value' => 'none', 'label' => 'Ninguno'],
            ],
            default => [['value' => 'none', 'label' => 'Ninguno']],
        };
    }

    private function buildGroupKeyForRow(array $row, string $groupBy): string
    {
        switch ($groupBy) {
            case 'department':
                return $row['department_name'] ?? 'Sin departamento';
            case 'category':
                return $row['category_name'] ?? 'Sin categoría';
            case 'priority':
                return $row['priority_label'] ?? 'Sin prioridad';
            case 'status':
                return $row['status_label'] ?? 'Sin estado';
            case 'resolution':
                return $row['sla_status'] ?? 'Sin resolución';
            case 'assigned':
                return $row['assigned_name'] ?? 'Sin asignar';
            case 'role':
                return $row['role_label'] ?? 'Sin rol';
            case 'is_active':
                return $row['is_active'] ? 'Activo' : 'Inactivo';
            case 'brand':
                return $row['brand'] ?? 'Sin marca';
            case 'ram':
                return $row['ram_memory'] ?? 'Sin RAM';
            case 'storage':
                return $row['storage_disk'] ?? 'Sin almacenamiento';
            case 'model':
                return $row['model'] ?? 'Sin modelo';
            default:
                return '—';
        }
    }

    private function computeGroupSubtotals($rows, string $groupBy): array
    {
        $subtotals = [];
        foreach ($rows as $row) {
            $key = $this->buildGroupKeyForRow(is_array($row) ? $row : (array) $row, $groupBy);
            if (! isset($subtotals[$key])) {
                $subtotals[$key] = [
                    'total' => 0,
                    'on_time' => 0,
                    'overdue' => 0,
                    'pending' => 0,
                    'resolved' => 0,
                    'closed' => 0,
                    'interventions' => 0,
                ];
            }
            $subtotals[$key]['total']++;
            $slaStatus = $row['sla_status'] ?? null;
            $status = $row['status'] ?? null;

            if (in_array($status, ['resuelto', 'cerrado'], true)) {
                $subtotals[$key]['resolved']++;
            } else {
                $subtotals[$key]['pending']++;
            }
            if ($slaStatus === 'A tiempo') $subtotals[$key]['on_time']++;
            if ($slaStatus === 'Vencido') $subtotals[$key]['overdue']++;
            if (isset($row['interventions_count'])) {
                $subtotals[$key]['interventions'] += (int) $row['interventions_count'];
            }
        }
        return $subtotals;
    }

    private function buildStructuredRows($rows, string $groupBy, array $groupSubtotals): array
    {
        if ($groupBy === 'none') {
            return $rows->map(fn ($r) => array_merge($r, ['_type' => 'ticket']))->all();
        }

        $structured = [];
        $currentGroup = null;
        $groupCount = 0;

        foreach ($rows as $row) {
            $groupKey = $this->buildGroupKeyForRow($row, $groupBy);

            if ($groupKey !== $currentGroup) {
                if ($currentGroup !== null) {
                    $sub = $groupSubtotals[$currentGroup] ?? ['total' => 0, 'on_time' => 0, 'overdue' => 0, 'pending' => 0];
                    $structured[] = [
                        '_type' => 'subtotal',
                        'group_label' => $currentGroup,
                        'total' => $sub['total'],
                        'on_time' => $sub['on_time'],
                        'overdue' => $sub['overdue'],
                        'pending' => $sub['pending'],
                    ];
                    $structured[] = ['_type' => 'group_spacer'];
                }
                $groupCount = 0;
                $structured[] = [
                    '_type' => 'group_header',
                    'group_label' => $groupKey,
                    'group_total' => 0,
                ];
                $currentGroup = $groupKey;
            }

            $structured[] = array_merge($row, ['_type' => 'ticket']);
            $groupCount++;
            // update the total in the most recent group header
            for ($i = count($structured) - 1; $i >= 0; $i--) {
                if (($structured[$i]['_type'] ?? null) === 'group_header' && ($structured[$i]['group_label'] ?? null) === $groupKey) {
                    $structured[$i]['group_total'] = $groupCount;
                    break;
                }
            }
        }

        // Close the last group
        if ($currentGroup !== null) {
            $sub = $groupSubtotals[$currentGroup] ?? ['total' => 0, 'on_time' => 0, 'overdue' => 0, 'pending' => 0];
            $structured[] = [
                '_type' => 'subtotal',
                'group_label' => $currentGroup,
                'total' => $sub['total'],
                'on_time' => $sub['on_time'],
                'overdue' => $sub['overdue'],
                'pending' => $sub['pending'],
            ];
        }

        return $structured;
    }

    private function buildEquipmentQuery(Request $request, array $filters)
    {
        $query = Equipment::query()
            ->with('department')
            ->withCount('interventionReports as interventions_count');

        if (! empty($filters['date_from']) || ! empty($filters['date_to'])) {
            $query->whereHas('interventionReports', function ($q) use ($filters) {
                if (! empty($filters['date_from'])) {
                    $q->whereDate('created_at', '>=', $filters['date_from']);
                }
                if (! empty($filters['date_to'])) {
                    $q->whereDate('created_at', '<=', $filters['date_to']);
                }
            });
        }

        if (! empty($filters['brand'])) {
            $query->where('brand', 'ilike', '%' . $filters['brand'] . '%');
        }

        if (isset($filters['ram_max']) && $filters['ram_max'] !== '' && $filters['ram_max'] !== null) {
            $ramLimit = (int) $filters['ram_max'];
            $query->whereRaw("ram_memory ~ '^\\d+GB'")
                  ->whereRaw("CAST(regexp_replace(ram_memory, '^(\\d+)GB.*$', '\\1') AS INTEGER) < ?", [$ramLimit]);
        }

        if (! empty($filters['disk_type'])) {
            $query->where('storage_disk', 'ilike', '%' . $filters['disk_type'] . '%');
        }

        if (! empty($filters['sku'])) {
            $query->where('sku', 'ilike', '%' . $filters['sku'] . '%');
        }

        $groupBy = $filters['group_by'] ?? 'none';
        if ($groupBy !== 'none' && $groupBy !== null) {
            switch ($groupBy) {
                case 'brand':
                    $query->orderBy('brand', 'asc')->orderBy('sku', 'asc');
                    break;
                case 'ram':
                    $query->orderBy('ram_memory', 'asc')->orderBy('sku', 'asc');
                    break;
                case 'storage':
                    $query->orderBy('storage_disk', 'asc')->orderBy('sku', 'asc');
                    break;
                case 'department':
                    $query->leftJoin('departments', 'equipment.department_id', '=', 'departments.id')
                        ->orderBy('departments.name', 'asc')
                        ->orderBy('sku', 'asc')
                        ->select('equipment.*');
                    break;
                default:
                    $query->orderBy('interventions_count', 'desc');
            }
        } else {
            $query->orderBy('interventions_count', 'desc');
        }

        return $query;
    }

    private function buildUserQuery(Request $request, array $filters)
    {
        $query = User::query()->with('department', 'roles');

        if (! empty($filters['role'])) {
            $roles = explode(',', $filters['role']);
            $query->role($roles);
        }

        if (! empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '' && $filters['is_active'] !== null) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('name');
    }

    private function filterLabel(string $key, mixed $value): ?string
    {
        return match ($key) {
            'status' => 'Estado: <strong>' . e($value) . '</strong>',
            'priority' => 'Prioridad: <strong>' . e($value) . '</strong>',
            'department_id' => 'Departamento: <strong>' . e(Department::find($value)?->name ?? $value) . '</strong>',
            'category_id' => 'Categoría: <strong>' . e(Category::find($value)?->name ?? $value) . '</strong>',
            'assigned_id' => 'Técnico: <strong>' . e(User::find($value)?->full_name ?? $value) . '</strong>',
            'resolution' => 'Resolución: <strong>' . ($value === 'on_time' ? 'A tiempo' : ($value === 'overdue' ? 'Vencidos' : $value)) . '</strong>',
            'group_by' => 'Agrupado por: <strong>' . e($this->getGroupByLabel($value)) . '</strong>',
            'brand' => 'Marca: <strong>' . e($value) . '</strong>',
            'ram_max' => 'RAM máx: <strong>' . e((string) $value) . ' GB</strong>',
            'disk_type' => 'Disco: <strong>' . e($value) . '</strong>',
            'sku' => 'SKU: <strong>' . e($value) . '</strong>',
            'role' => 'Rol: <strong>' . e($value) . '</strong>',
            'is_active' => 'Estado: <strong>' . (filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'Activo' : 'Inactivo') . '</strong>',
            'date_from', 'date_to', 'source', 'template' => null,
            default => null,
        };
    }

    private function getGroupByLabel(string $value): string
    {
        return match ($value) {
            'none' => 'Ninguno',
            'department' => 'Departamento',
            'category' => 'Categoría',
            'priority' => 'Prioridad',
            'status' => 'Estado',
            'resolution' => 'Resolución (SLA)',
            'assigned' => 'Técnico',
            'role' => 'Rol',
            'is_active' => 'Estado',
            'brand' => 'Marca',
            'model' => 'Modelo',
            default => $value,
        };
    }
}
