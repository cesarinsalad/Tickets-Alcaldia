import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Ticket, FileText, AlertOctagon, AlertTriangle, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import RelativeTime from '@/Components/RelativeTime';

const statusColors = {
    abierto: 'default',
    en_proceso: 'orange',
    pendiente_informacion: 'warning',
    resuelto: 'success',
    cerrado: 'gray',
};

const statusLabels = {
    abierto: 'Abierto',
    en_proceso: 'En Proceso',
    pendiente_informacion: 'Pendiente de Info',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
};

const priorityColors = {
    sin_definir: 'gray',
    baja: 'secondary',
    media: 'orange',
    alta: 'danger',
    critica: 'danger',
};

const priorityLabels = {
    sin_definir: 'Sin definir',
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

export default function Index({ tickets, filters, categories, departments, users }) {
    const [search, setSearch] = useState(filters.search || '');
    const { auth } = usePage().props;
    const canFilterAll = auth.user?.roles?.some(r => ['super_admin', 'admin_tickets', 'tecnico'].includes(r.name));

    function activeFilters() {
        const clean = {};
        Object.entries({ ...filters, search }).forEach(([k, v]) => { if (v) clean[k] = v; });
        return clean;
    }

    function applyFilters(overrides = {}) {
        const params = { ...filters, ...overrides };
        const clean = {};
        Object.entries(params).forEach(([k, v]) => { if (v) clean[k] = v; });
        router.get(route('tickets.index'), clean, { preserveState: true, replace: true });
    }

    function handleSearch(e) {
        e.preventDefault();
        applyFilters({ search });
    }

    function handleSort(col) {
        const newDir = filters.sort === col && filters.dir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: col, dir: newDir });
    }

    function SortIcon({ col }) {
        if (filters.sort !== col) return null;
        return filters.dir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />;
    }

    function SortHeader({ col, children, className = '' }) {
        return (
            <th className={`px-4 py-3 font-medium cursor-pointer select-none hover:text-gray-700 ${className}`} onClick={() => handleSort(col)}>
                {children}
                <SortIcon col={col} />
            </th>
        );
    }

    function reportUrl() {
        const clean = activeFilters();
        delete clean.per_page;
        return route('tickets.report.index', clean);
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <Ticket className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Tickets</h2>
                </div>
            }
            actions={
                <>
                    {canFilterAll && (
                    <a href={reportUrl()} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                            Generar Reporte
                        </Button>
                    </a>
                    )}
                    <a href={route('tickets.create')}>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Nuevo Ticket
                        </Button>
                    </a>
                </>
            }
        >
            <Head title="Tickets" />

            <div className="space-y-4">
                <div className="rounded-lg border border-gris-borde bg-white p-4">
                    <form onSubmit={handleSearch} className="space-y-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Buscar por título, descripción o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Select
                                className="flex-1 min-w-[120px]"
                                value={filters.status || ''}
                                onChange={e => applyFilters({ status: e.target.value })}
                            >
                                <option value="">Todos los estados</option>
                                <option value="abierto">Abierto</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="pendiente_informacion">Pendiente de Info</option>
                                <option value="resuelto">Resuelto</option>
                                <option value="cerrado">Cerrado</option>
                            </Select>
                            <Select
                                className="flex-1 min-w-[120px]"
                                value={filters.priority || ''}
                                onChange={e => applyFilters({ priority: e.target.value })}
                            >
                                <option value="">Todas las prioridades</option>
                                <option value="sin_definir">Sin definir</option>
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </Select>
                            {canFilterAll && (
                            <Select
                                className="flex-1 min-w-[140px]"
                                value={filters.category || ''}
                                onChange={e => applyFilters({ category: e.target.value })}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                            )}
                            {canFilterAll && (
                            <Select
                                className="flex-1 min-w-[140px]"
                                value={filters.department || ''}
                                onChange={e => applyFilters({ department: e.target.value })}
                            >
                                <option value="">Todos los departamentos</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </Select>
                            )}
                            <Input
                                type="date"
                                className="w-[140px]"
                                value={filters.date_from || ''}
                                onChange={e => applyFilters({ date_from: e.target.value })}
                            />
                            <Input
                                type="date"
                                className="w-[140px]"
                                value={filters.date_to || ''}
                                onChange={e => applyFilters({ date_to: e.target.value })}
                            />
                            {filters.overdue || filters.critical_overdue || filters.sla || filters.status || filters.priority || filters.category || filters.department || filters.search || filters.date_from || filters.date_to ? (
                                <Button type="button" variant="ghost" size="sm" onClick={() => router.get(route('tickets.index'))}>
                                    Limpiar filtros
                                </Button>
                            ) : null}
                        </div>
                    </form>
                    {filters.overdue && (
                        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 mt-3 text-sm text-red-800">
                            <AlertOctagon className="h-4 w-4 text-red-600 shrink-0" />
                            <span>Mostrando <strong>tickets vencidos</strong> — Tiempo establecido de resolución superado. Ordenados por técnico asignado.</span>
                        </div>
                    )}
                    {filters.sla === 'missed' && (
                        <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-4 py-2.5 mt-3 text-sm text-orange-800">
                            <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                            <span>Mostrando tickets que <strong>NO fueron resueltos</strong> dentro de su plazo de resolución.</span>
                        </div>
                    )}
                    {filters.status === 'abierto,en_proceso' && (
                        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2.5 mt-3 text-sm text-blue-800">
                            <Ticket className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>Mostrando tickets <strong>abiertos y en proceso</strong> en el periodo seleccionado.</span>
                        </div>
                    )}
                    {(filters.status === 'resuelto' || filters.status === 'resuelto,cerrado') && filters.date_from && !filters.sla && (
                        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2.5 mt-3 text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                            <span>Mostrando tickets <strong>resueltos y cerrados</strong> en el período seleccionado.</span>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-gris-borde bg-white overflow-x-auto">
                    {tickets.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Ticket className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No se encontraron tickets</p>
                            <p className="text-sm mt-1">Crea un nuevo ticket o ajusta los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <SortHeader col="code">Código</SortHeader>
                                    <SortHeader col="title">Título</SortHeader>
                                    <SortHeader col="creator" className="hidden md:table-cell">Solicitante</SortHeader>
                                    <SortHeader col="category" className="hidden md:table-cell">Categoría</SortHeader>
                                    <SortHeader col="priority">Prioridad</SortHeader>
                                    <SortHeader col="status">Estado</SortHeader>
                                    <SortHeader col="response" className="hidden md:table-cell">Resolución</SortHeader>
                                    <SortHeader col="assigned" className="hidden lg:table-cell">Asignado</SortHeader>
                                    <SortHeader col="entry_date" className="hidden lg:table-cell">Fecha</SortHeader>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {tickets.data.map(ticket => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => router.visit(route('tickets.show', ticket.id))}
                                        className="hover:bg-gris-fondo transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-azul-institucional">{ticket.code}</td>
                                        <td className="px-4 py-3 text-gray-900 max-w-[180px] truncate">{ticket.title}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{ticket.creator?.full_name ?? ticket.creator?.name}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{ticket.category?.name || '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={priorityColors[ticket.priority] || 'default'} className="text-[12px] px-1.5 leading-tight">
                                                {priorityLabels[ticket.priority] || ticket.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={statusColors[ticket.status] || 'default'} className="text-[12px] px-1.5 leading-tight">
                                                {statusLabels[ticket.status] || ticket.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {ticket.status === 'resuelto' || ticket.status === 'cerrado' ? (
                                                ticket.sla_resolution_deadline ? (
                                                    new Date(ticket.exit_date) <= new Date(ticket.sla_resolution_deadline) ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                                                            <CheckCircle className="h-3 w-3" /> A tiempo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                                                            <AlertTriangle className="h-3 w-3" /> Tardío
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )
                                            ) : (
                                                <span className="text-xs"><RelativeTime deadline={ticket.sla_resolution_deadline} compact /></span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs hidden lg:table-cell">
                                            {(ticket.assigned?.full_name ?? ticket.assigned?.name) || 'Sin asignar'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                                            {new Date(ticket.entry_date).toLocaleDateString('es-VE')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination
                    links={tickets.links}
                    perPage={filters.per_page || 10}
                    total={tickets.total}
                    onPerPageChange={(val) => applyFilters({ per_page: val })}
                />
            </div>
        </AuthenticatedLayout>
    );
}
