import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { ClipboardList, FileText, Table2, Search, Download, FileSpreadsheet, Database, LayoutTemplate } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';

const SOURCES = [
    { value: '', label: 'Seleccionar origen...' },
    { value: 'tickets', label: 'Tickets' },
    { value: 'equipments', label: 'Equipos (Inventario)' },
    { value: 'users', label: 'Usuarios' },
    { value: 'categories', label: 'Categorías' },
    { value: 'departments', label: 'Departamentos' },
];

const SOURCE_LABELS = {
    tickets: 'Tickets',
    equipments: 'Equipos',
    users: 'Usuarios',
    categories: 'Categorías',
    departments: 'Departamentos',
};

const GROUP_BY_OPTIONS_BY_SOURCE = {
    tickets: [
        { value: 'none', label: 'Ninguno' },
        { value: 'department', label: 'Departamento' },
        { value: 'category', label: 'Categoría' },
        { value: 'priority', label: 'Prioridad' },
        { value: 'status', label: 'Estado' },
        { value: 'resolution', label: 'Resolución (SLA)' },
        { value: 'assigned', label: 'Técnico' },
    ],
    equipments: [
        { value: 'none', label: 'Ninguno' },
        { value: 'brand', label: 'Marca' },
        { value: 'ram', label: 'Memoria RAM' },
        { value: 'storage', label: 'Almacenamiento' },
        { value: 'department', label: 'Departamento' },
    ],
    users: [
        { value: 'none', label: 'Ninguno' },
        { value: 'role', label: 'Rol' },
        { value: 'department', label: 'Departamento' },
        { value: 'is_active', label: 'Estado' },
    ],
    departments: [
        { value: 'none', label: 'Ninguno' },
        { value: 'has_head', label: 'Tiene Jefe' },
    ],
    categories: [{ value: 'none', label: 'Ninguno' }],
    '': [{ value: 'none', label: 'Ninguno' }],
};

const DEFAULT_GROUP_BY_OPTIONS = [{ value: 'none', label: 'Ninguno' }];

export default function Index({
    source: initialSource, template: initialTemplate,
    filters: initialFilters, columns, rows,
    groupSubtotals, groupBy: initialGroupBy,
    templates, departments, technicians, equipmentBrands, roles, categories,
    dateFrom, dateTo,
}) {
    const [source, setSource] = useState(initialSource || '');
    const [template, setTemplate] = useState(initialTemplate || '');
    const [from, setFrom] = useState(initialFilters?.date_from || dateFrom || '');
    const [to, setTo] = useState(initialFilters?.date_to || dateTo || '');
    const [status, setStatus] = useState(initialFilters?.status || '');
    const [priority, setPriority] = useState(initialFilters?.priority || '');
    const [departmentId, setDepartmentId] = useState(initialFilters?.department_id || '');
    const [categoryId, setCategoryId] = useState(initialFilters?.category_id || '');
    const [assignedId, setAssignedId] = useState(initialFilters?.assigned_id || '');
    const [resolution, setResolution] = useState(initialFilters?.resolution || '');
    const [groupBy, setGroupBy] = useState(initialFilters?.group_by || 'none');
    const [brand, setBrand] = useState(initialFilters?.brand || '');
    const [ramMax, setRamMax] = useState(initialFilters?.ram_max ?? '');
    const [diskType, setDiskType] = useState(initialFilters?.disk_type || '');
    const [sku, setSku] = useState(initialFilters?.sku || '');
    const [roleFilter, setRoleFilter] = useState(initialFilters?.role || '');
    const [isActive, setIsActive] = useState(initialFilters?.is_active ?? '');
    const [hasHead, setHasHead] = useState(initialFilters?.has_head ?? '');

    const groupByOptions = useMemo(
        () => GROUP_BY_OPTIONS_BY_SOURCE[source] || DEFAULT_GROUP_BY_OPTIONS,
        [source]
    );

    useEffect(() => {
        const valid = groupByOptions.some(o => o.value === groupBy);
        if (!valid) {
            setGroupBy('none');
        }
    }, [groupByOptions, groupBy]);

    const activeFilters = useMemo(() => {
        const f = { source: source || undefined, template: template || undefined };
        if (from) f.date_from = from;
        if (to) f.date_to = to;

        if (source === 'tickets') {
            if (status) f.status = status;
            if (priority) f.priority = priority;
            if (departmentId) f.department_id = departmentId;
            if (categoryId) f.category_id = categoryId;
            if (assignedId) f.assigned_id = assignedId;
            if (resolution) f.resolution = resolution;
            if (groupBy && groupBy !== 'none') f.group_by = groupBy;
        } else if (source === 'equipments') {
            if (brand) f.brand = brand;
            if (ramMax) f.ram_max = ramMax;
            if (diskType) f.disk_type = diskType;
            if (sku) f.sku = sku;
            if (groupBy && groupBy !== 'none') f.group_by = groupBy;
        } else if (source === 'users') {
            if (roleFilter) f.role = roleFilter;
            if (departmentId) f.department_id = departmentId;
            if (isActive !== '') f.is_active = isActive;
            if (groupBy && groupBy !== 'none') f.group_by = groupBy;
        } else if (source === 'departments') {
            if (hasHead !== '') f.has_head = hasHead;
            if (groupBy && groupBy !== 'none') f.group_by = groupBy;
        }

        return f;
    }, [source, template, from, to, status, priority, departmentId, categoryId, assignedId, resolution, groupBy, brand, ramMax, diskType, sku, roleFilter, isActive, hasHead]);

    function handleSourceChange(newSource) {
        setSource(newSource);
        setTemplate('');
        setStatus('');
        setPriority('');
        setDepartmentId('');
        setCategoryId('');
        setAssignedId('');
        setResolution('');
        setGroupBy('none');
        setBrand('');
        setRamMax('');
        setDiskType('');
        setSku('');
        setRoleFilter('');
        setIsActive('');
        setHasHead('');
    }

    function handleTemplateClick(tpl) {
        setSource(tpl.source);
        setTemplate(tpl.key);
        setStatus('');
        setPriority('');
        setDepartmentId('');
        setCategoryId('');
        setAssignedId('');
        setResolution('');
        setGroupBy('none');
        setBrand('');
        setRamMax('');
        setDiskType('');
        setSku('');
        setRoleFilter('');
        setIsActive('');
        setHasHead('');
        setFrom('');
        setTo('');

        const f = { ...tpl.filters };
        if (f.status) setStatus(f.status);
        if (f.priority) setPriority(f.priority);
        if (f.department_id) setDepartmentId(f.department_id);
        if (f.assigned_id) setAssignedId(f.assigned_id);
        if (f.brand) setBrand(f.brand);
        if (f.ram_max !== undefined) setRamMax(f.ram_max);
        if (f.disk_type) setDiskType(f.disk_type);
        if (f.sku) setSku(f.sku);
        if (f.role) setRoleFilter(f.role);
    }

    function handlePreview() {
        router.get(route('reportes.index'), activeFilters, { preserveState: true, replace: true });
    }

    function handleExportPdf() {
        const params = new URLSearchParams(activeFilters).toString();
        window.open(route('reportes.export-pdf') + '?' + params, '_blank');
    }

    function handleExportExcel() {
        const params = new URLSearchParams(activeFilters).toString();
        window.open(route('reportes.export-excel') + '?' + params, '_blank');
    }

    const showPreview = rows && rows.data && rows.data.length > 0;
    const exportDisabled = !source;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <ClipboardList className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Reportes</h2>
                </div>
            }
        >
            <Head title="Reportes" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* LEFT PANEL: Configuration */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Step 1: Source */}
                    <div className="rounded-lg border border-gris-borde bg-white p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Database className="h-3.5 w-3.5" /> Paso 1: Origen de Datos
                        </p>
                        <Select
                            value={source}
                            onChange={e => handleSourceChange(e.target.value)}
                            className="w-full text-sm"
                        >
                            {SOURCES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Step 2: Templates */}
                    <div className="rounded-lg border border-gris-borde bg-white p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <LayoutTemplate className="h-3.5 w-3.5" /> Paso 2: Plantillas
                        </p>
                        {source ? (
                            <div className="space-y-2">
                                {templates
                                    .filter(tpl => tpl.source === source)
                                    .map(tpl => (
                                        <button
                                            key={tpl.key}
                                            onClick={() => handleTemplateClick(tpl)}
                                            className={`w-full text-left text-xs px-3 py-2 rounded-md border transition-colors ${
                                                template === tpl.key
                                                    ? 'border-azul-institucional bg-blue-50 text-azul-institucional font-medium'
                                                    : 'border-gris-borde hover:border-azul-institucional/50 text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {tpl.label}
                                        </button>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 py-2">Selecciona un origen de datos para ver las plantillas.</p>
                        )}
                    </div>

                    {/* Step 3: Dynamic Filters */}
                    <div className="rounded-lg border border-gris-borde bg-white p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Search className="h-3.5 w-3.5" /> Paso 3: Filtros
                        </p>

                        {!source ? (
                            <p className="text-xs text-gray-400 py-2">Selecciona un origen de datos para ver los filtros disponibles.</p>
                        ) : (
                            <>
                            {source === 'tickets' && (
                                <div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="text-xs text-gray-500 mb-1 block">Rango de Fechas</label>
                                            <div className="flex items-center gap-2">
                                                <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="flex-1 text-xs" />
                                                <span className="text-gray-400 text-xs">—</span>
                                                <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="flex-1 text-xs" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Departamento</label>
                                            <Select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="w-full text-xs">
                                                <option value="">Todos</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
                                            <Select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full text-xs">
                                                <option value="">Todas</option>
                                                {categories?.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                                            <Select value={status} onChange={e => setStatus(e.target.value)} className="w-full text-xs">
                                                <option value="">Todos</option>
                                                <option value="abierto,en_proceso">Pendientes</option>
                                                <option value="resuelto,cerrado">Cerrados</option>
                                                <option value="abierto">Abierto</option>
                                                <option value="en_proceso">En Proceso</option>
                                                <option value="pendiente_informacion">Pendiente de Info</option>
                                                <option value="resuelto">Resuelto</option>
                                                <option value="cerrado">Cerrado</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Prioridad</label>
                                            <Select value={priority} onChange={e => setPriority(e.target.value)} className="w-full text-xs">
                                                <option value="">Todas</option>
                                                <option value="critica">Crítica</option>
                                                <option value="alta">Alta</option>
                                                <option value="media">Media</option>
                                                <option value="baja">Baja</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Técnico Asignado</label>
                                            <Select value={assignedId} onChange={e => setAssignedId(e.target.value)} className="w-full text-xs">
                                                <option value="">Todos</option>
                                                {technicians.map(t => (
                                                    <option key={t.id} value={t.id}>{t.full_name}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Resolución</label>
                                            <Select value={resolution} onChange={e => setResolution(e.target.value)} className="w-full text-xs">
                                                <option value="">Todas</option>
                                                <option value="on_time">A tiempo</option>
                                                <option value="overdue">Vencidos</option>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gris-borde">
                                        <label className="text-xs text-gray-500 mb-1 block">Agrupar por</label>
                                        <Select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="w-full text-xs">
                                            {groupByOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {source === 'equipments' && (
                                <div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Rango de Fechas de Intervención</label>
                                            <div className="flex items-center gap-2">
                                                <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="flex-1 text-xs" />
                                                <span className="text-gray-400 text-xs">—</span>
                                                <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="flex-1 text-xs" />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">Filtra los equipos que tuvieron informes de intervención entre estas fechas.</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Marca</label>
                                            <Select value={brand} onChange={e => setBrand(e.target.value)} className="w-full text-xs">
                                                <option value="">Todas</option>
                                                {equipmentBrands.map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">RAM menor a (GB)</label>
                                            <Input type="number" placeholder="Ej: 8" value={ramMax} onChange={e => setRamMax(e.target.value)} className="w-full text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Tipo de Disco</label>
                                            <Select value={diskType} onChange={e => setDiskType(e.target.value)} className="w-full text-xs">
                                                <option value="">Todos</option>
                                                <option value="HDD">HDD</option>
                                                <option value="SSD">SSD</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">SKU / Código de Bienes</label>
                                            <Input type="text" placeholder="Buscar por SKU..." value={sku} onChange={e => setSku(e.target.value)} className="w-full text-xs" />
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gris-borde">
                                        <label className="text-xs text-gray-500 mb-1 block">Agrupar por</label>
                                        <Select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="w-full text-xs">
                                            {groupByOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {source === 'users' && (
                                <div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Rol</label>
                                            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full text-xs">
                                                <option value="">Todos</option>
                                                {roles.map(r => (
                                                    <option key={r} value={r}>{r === 'solicitante' ? 'Solicitante' : r === 'tecnico' ? 'Técnico' : r === 'admin_departamento' ? 'Admin Departamento' : r === 'admin_tickets' ? 'Admin Tickets' : r === 'super_admin' ? 'Super Admin' : r}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Departamento</label>
                                            <Select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="w-full text-xs">
                                                <option value="">Todos</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                                            <Select value={isActive} onChange={e => setIsActive(e.target.value)} className="w-full text-xs">
                                                <option value="">Todos</option>
                                                <option value="1">Activo</option>
                                                <option value="0">Inactivo</option>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gris-borde">
                                        <label className="text-xs text-gray-500 mb-1 block">Agrupar por</label>
                                        <Select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="w-full text-xs">
                                            {groupByOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {source === 'categories' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Rango de Fechas de Uso</label>
                                        <div className="flex items-center gap-2">
                                            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="flex-1 text-xs" />
                                            <span className="text-gray-400 text-xs">—</span>
                                            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="flex-1 text-xs" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {source === 'departments' && (
                                <div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Tiene Jefe Asignado</label>
                                            <Select value={hasHead} onChange={e => setHasHead(e.target.value)} className="w-full text-xs">
                                                <option value="">Todos</option>
                                                <option value="1">Sí</option>
                                                <option value="0">No</option>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gris-borde">
                                        <label className="text-xs text-gray-500 mb-1 block">Agrupar por</label>
                                        <Select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="w-full text-xs">
                                            {groupByOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            )}
                            </>
                        )}
                    </div>

                    {/* Step 4: Actions */}
                    <div className="rounded-lg border border-gris-borde bg-white p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Download className="h-3.5 w-3.5" /> Paso 4: Acciones
                        </p>
                        <Button
                            onClick={handlePreview}
                            disabled={!source}
                            className="w-full"
                            size="sm"
                        >
                            <Search className="h-4 w-4 mr-1.5" />
                            Vista Previa
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={handleExportPdf}
                                disabled={exportDisabled}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                PDF
                            </Button>
                            <Button
                                onClick={handleExportExcel}
                                disabled={exportDisabled}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <FileSpreadsheet className="h-4 w-4 mr-1" />
                                Excel
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Preview */}
                <div className="lg:col-span-8">
                    {!showPreview ? (
                        <div className="rounded-xl border border-gris-borde bg-white shadow-sm p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <Table2 className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-1">Sin datos para mostrar</h3>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Selecciona un origen de datos, aplica los filtros que necesites y haz clic en <strong>Vista Previa</strong> para ver los resultados aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gris-borde bg-white shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-gris-borde bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Table2 className="h-4 w-4 text-azul-institucional" />
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                        Vista Previa — {SOURCE_LABELS[source] || source}
                                    </h3>
                                </div>
                                {rows.total > 0 && (
                                    <span className="text-xs text-gray-500">{rows.total} registros encontrados</span>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                            {columns.map(col => (
                                                <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gris-borde">
                                        {(() => {
                                            const isGrouped = groupBy && groupBy !== 'none' && (source === 'tickets' || source === 'equipments');
                                            const groupKeyOf = (row) => {
                                                if (!isGrouped) return null;
                                                switch (groupBy) {
                                                    case 'department': return row.department_name ?? '—';
                                                    case 'category': return row.category_name ?? '—';
                                                    case 'priority': return row.priority_label ?? '—';
                                                    case 'status': return row.status_label ?? '—';
                                                    case 'resolution': return row.sla_status ?? '—';
                                                    case 'assigned': return row.assigned_name ?? '—';
                                                    case 'brand': return row.brand ?? '—';
                                                    case 'ram': return row.ram_memory ?? '—';
                                                    case 'storage': return row.storage_disk ?? '—';
                                                    case 'model': return row.model ?? '—';
                                                    default: return '—';
                                                }
                                            };

                                            const elements = [];
                                            let lastGroup = null;
                                            let lastGroupIndex = -1;
                                            rows.data.forEach((row, i) => {
                                                const currentGroup = groupKeyOf(row);
                                                if (isGrouped && currentGroup !== lastGroup) {
                                                    if (lastGroup !== null) {
                                                        const sub = groupSubtotals?.[lastGroup] || { total: 0, on_time: 0, overdue: 0, pending: 0, resolved: 0 };
                                                        elements.push(
                                                            <tr key={`sub-${lastGroupIndex}`} className="bg-gray-50 text-xs">
                                                                <td colSpan={columns.length} className="px-4 py-1.5 italic text-gray-600">
                                                                    <span className="font-semibold">Subtotal {lastGroup}:</span>
                                                                    <span className="ml-3">{sub.total} {source === 'tickets' ? 'ticket(s)' : 'equipo(s)'}</span>
                                                                    {source === 'tickets' ? (
                                                                        <>
                                                                            {sub.on_time > 0 && <span className="ml-2 text-green-700">{sub.on_time} a tiempo</span>}
                                                                            {sub.overdue > 0 && <span className="ml-2 text-red-700">{sub.overdue} vencidos</span>}
                                                                            {sub.pending > 0 && <span className="ml-2 text-gray-600">{sub.pending} pendientes</span>}
                                                                        </>
                                                                    ) : (
                                                                        (sub.interventions || 0) > 0 && <span className="ml-2 text-azul-institucional">{sub.interventions} intervenciones</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                    lastGroup = currentGroup;
                                                    lastGroupIndex = i;
                                                    const totalForGroup = groupSubtotals?.[currentGroup]?.total ?? '?';
                                                    elements.push(
                                                        <tr key={`grp-${i}`} className="bg-blue-50">
                                                            <td colSpan={columns.length} className="px-4 py-2 text-xs font-semibold text-blue-900">
                                                                <span className="inline-flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                                                                    {currentGroup}
                                                                    <span className="text-gray-500 font-normal">({totalForGroup} ticket{totalForGroup === 1 ? '' : 's'})</span>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                elements.push(
                                                    <tr key={row.id || `row-${i}`} className="hover:bg-gris-fondo transition-colors">
                                                        {columns.map(col => {
                                                            const value = row[col.key] ?? '—';
                                                            const fmt = col.format;
                                                            if (fmt === 'boolean') {
                                                                return (
                                                                    <td key={col.key} className="px-4 py-2.5 text-xs">
                                                                        {value ? (
                                                                            <span className="inline-flex items-center gap-1 text-green-700">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Sí
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1 text-gray-400">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> No
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            }
                                                            return (
                                                                <td key={col.key} className="px-4 py-2.5 text-xs text-gray-700 whitespace-nowrap max-w-[180px] truncate">
                                                                    {value === '—' ? <span className="text-gray-400">—</span> : value}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            });

                                            if (isGrouped && lastGroup !== null) {
                                                const sub = groupSubtotals?.[lastGroup] || { total: 0, on_time: 0, overdue: 0, pending: 0, resolved: 0 };
                                                elements.push(
                                                    <tr key={`sub-${lastGroupIndex}-end`} className="bg-gray-50 text-xs">
                                                        <td colSpan={columns.length} className="px-4 py-1.5 italic text-gray-600">
                                                            <span className="font-semibold">Subtotal {lastGroup}:</span>
                                                            <span className="ml-3">{sub.total} {source === 'tickets' ? 'ticket(s)' : 'equipo(s)'}</span>
                                                            {source === 'tickets' ? (
                                                                <>
                                                                    {sub.on_time > 0 && <span className="ml-2 text-green-700">{sub.on_time} a tiempo</span>}
                                                                    {sub.overdue > 0 && <span className="ml-2 text-red-700">{sub.overdue} vencidos</span>}
                                                                    {sub.pending > 0 && <span className="ml-2 text-gray-600">{sub.pending} pendientes</span>}
                                                                </>
                                                            ) : (
                                                                (sub.interventions || 0) > 0 && <span className="ml-2 text-azul-institucional">{sub.interventions} intervenciones</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return elements;
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            {rows.links && rows.links.length > 3 && (
                                <div className="px-5 py-3 border-t border-gris-borde">
                                    <Pagination
                                        links={rows.links}
                                        total={rows.total}
                                        perPage={rows.per_page || 15}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
