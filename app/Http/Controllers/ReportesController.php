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
        'frecuencia_fallas' => [
            'label' => 'Frecuencia de Fallas',
            'source' => 'categories',
            'filters' => [],
        ],
        'carga_soporte' => [
            'label' => 'Carga de Soporte Departamental',
            'source' => 'departments',
            'filters' => [],
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
        'categories' => [
            ['key' => 'name', 'label' => 'Categoría'],
            ['key' => 'total_tickets', 'label' => 'Total Tickets'],
            ['key' => 'tickets_in_period', 'label' => 'Tickets en Período'],
        ],
        'departments' => [
            ['key' => 'name', 'label' => 'Departamento'],
            ['key' => 'physical_address', 'label' => 'Dirección'],
            ['key' => 'head_name', 'label' => 'Jefe de Área'],
            ['key' => 'users_count', 'label' => 'Total Usuarios'],
            ['key' => 'tickets_count', 'label' => 'Total Tickets'],
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

        $rows = null;
        $columns = [];

        if ($source) {
            $columns = self::COLUMNS[$source] ?? [];

            $query = match ($source) {
                'tickets' => $this->buildTicketQuery($request, $filters),
                'equipments' => $this->buildEquipmentQuery($request, $filters),
                'users' => $this->buildUserQuery($request, $filters),
                'categories' => $this->buildCategoryQuery($request, $filters),
                'departments' => $this->buildDepartmentQuery($request, $filters),
                default => null,
            };

            if ($query) {
                $rows = $query->paginate(15)->withQueryString();
            }
        }

        return Inertia::render('Reportes/Index', [
            'source' => $source,
            'template' => $template,
            'filters' => $filters,
            'columns' => $columns,
            'rows' => $rows,
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
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ]);
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
            'categories' => $this->buildCategoryQuery($request, $filters),
            'departments' => $this->buildDepartmentQuery($request, $filters),
            default => abort(400),
        };

        $rows = $query->get();
        $totalRows = $rows->count();
        $totalPages = (int) ceil($totalRows / 35);

        $sourceLabels = [
            'tickets' => 'Tickets',
            'equipments' => 'Equipos',
            'users' => 'Usuarios',
            'categories' => 'Categorías',
            'departments' => 'Departamentos',
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
            'rows' => $rows,
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
            'categories' => $this->buildCategoryQuery($request, $filters),
            'departments' => $this->buildDepartmentQuery($request, $filters),
            default => abort(400),
        };

        $rows = $query->get();

        $sourceLabels = [
            'tickets' => 'Tickets',
            'equipments' => 'Equipos',
            'users' => 'Usuarios',
            'categories' => 'Categorías',
            'departments' => 'Departamentos',
        ];
        $title = 'Reporte de ' . ($sourceLabels[$source] ?? $source);

        return Excel::download(
            new ReportesExport($rows, $columns, $source, $title),
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
            $filters['assigned_id'] = $request->input('assigned_id');
        } elseif ($sourceParam === 'equipments') {
            $filters['brand'] = $request->input('brand');
            $filters['ram_max'] = $request->input('ram_max');
            $filters['disk_type'] = $request->input('disk_type');
            $filters['sku'] = $request->input('sku');
        } elseif ($sourceParam === 'users') {
            $filters['role'] = $request->input('role');
            $filters['department_id'] = $request->input('department_id');
            $filters['is_active'] = $request->input('is_active');
        } elseif ($sourceParam === 'categories') {
            // date_from/to already captured
        } elseif ($sourceParam === 'departments') {
            $filters['has_head'] = $request->input('has_head');
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
            } elseif ($templateKey === 'frecuencia_fallas') {
                if (empty($filters['date_from'])) {
                    $filters['date_from'] = now()->subMonths(6)->startOfMonth()->toDateString();
                }
                if (empty($filters['date_to'])) {
                    $filters['date_to'] = now()->toDateString();
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

        if (! empty($filters['assigned_id'])) {
            $query->where('assigned_id', $filters['assigned_id']);
        }

        return $query->orderBy('created_at', 'desc');
    }

    private function buildEquipmentQuery(Request $request, array $filters)
    {
        $query = Equipment::query()
            ->withCount('interventionReports as interventions_count');

        if (! empty($filters['brand'])) {
            $query->where('brand', 'ilike', '%' . $filters['brand'] . '%');
        }

        if (isset($filters['ram_max']) && $filters['ram_max'] !== '' && $filters['ram_max'] !== null) {
            $query->where('ram_memory', '<', (int) $filters['ram_max']);
        }

        if (! empty($filters['disk_type'])) {
            $query->where('storage_disk', 'ilike', '%' . $filters['disk_type'] . '%');
        }

        if (! empty($filters['sku'])) {
            $query->where('sku', 'ilike', '%' . $filters['sku'] . '%');
        }

        return $query->orderBy('interventions_count', 'desc');
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

    private function buildCategoryQuery(Request $request, array $filters)
    {
        $query = Category::query()->withCount('tickets as total_tickets');

        if (! empty($filters['date_from']) || ! empty($filters['date_to'])) {
            $query->withCount(['tickets as tickets_in_period' => function ($q) use ($filters) {
                if (! empty($filters['date_from'])) {
                    $q->whereDate('entry_date', '>=', $filters['date_from']);
                }
                if (! empty($filters['date_to'])) {
                    $q->whereDate('entry_date', '<=', $filters['date_to']);
                }
            }]);
        } else {
            $query->withCount(['tickets as tickets_in_period' => function ($q) {
                $q->whereBetween('entry_date', [now()->subMonths(6), now()]);
            }]);
        }

        return $query->orderByDesc('total_tickets');
    }

    private function buildDepartmentQuery(Request $request, array $filters)
    {
        $query = Department::query()
            ->with('headOfArea')
            ->withCount('users')
            ->withCount(['users as tickets_count' => function ($q) {
                $q->join('tickets', 'users.id', '=', 'tickets.creator_id')
                    ->whereNull('tickets.deleted_at');
            }]);

        if (isset($filters['has_head']) && $filters['has_head'] !== '' && $filters['has_head'] !== null) {
            $hasHead = filter_var($filters['has_head'], FILTER_VALIDATE_BOOLEAN);
            if ($hasHead) {
                $query->whereNotNull('head_of_area_id');
            } else {
                $query->whereNull('head_of_area_id');
            }
        }

        return $query->orderBy('name');
    }

    private function filterLabel(string $key, mixed $value): ?string
    {
        return match ($key) {
            'status' => 'Estado: <strong>' . e($value) . '</strong>',
            'priority' => 'Prioridad: <strong>' . e($value) . '</strong>',
            'department_id' => 'Departamento: <strong>' . e(Department::find($value)?->name ?? $value) . '</strong>',
            'assigned_id' => 'Técnico: <strong>' . e(User::find($value)?->full_name ?? $value) . '</strong>',
            'brand' => 'Marca: <strong>' . e($value) . '</strong>',
            'ram_max' => 'RAM máx: <strong>' . e((string) $value) . ' GB</strong>',
            'disk_type' => 'Disco: <strong>' . e($value) . '</strong>',
            'sku' => 'SKU: <strong>' . e($value) . '</strong>',
            'role' => 'Rol: <strong>' . e($value) . '</strong>',
            'is_active' => 'Estado: <strong>' . (filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'Activo' : 'Inactivo') . '</strong>',
            'has_head' => 'Jefe asignado: <strong>' . (filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'Sí' : 'No') . '</strong>',
            'date_from', 'date_to', 'source', 'template' => null,
            default => null,
        };
    }
}
