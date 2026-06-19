import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Ticket, FileText } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';

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

    function reportUrl() {
        const clean = activeFilters();
        delete clean.per_page;
        return route('tickets.report.index', clean);
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Tickets</h2>
                    <div className="flex items-center gap-2">
                        <a href={reportUrl()} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                                Generar Reporte
                            </Button>
                        </a>
                        <a href={route('tickets.create')}>
                            <Button size="sm">
                                <Plus className="h-4 w-4" />
                                Nuevo Ticket
                            </Button>
                        </a>
                    </div>
                </div>
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
                            {filters.status || filters.priority || filters.category || filters.department || filters.search || filters.date_from || filters.date_to ? (
                                <Button type="button" variant="ghost" size="sm" onClick={() => router.get(route('tickets.index'))}>
                                    Limpiar filtros
                                </Button>
                            ) : null}
                        </div>
                    </form>
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
                                    <th className="px-4 py-3 font-medium">Código</th>
                                    <th className="px-4 py-3 font-medium">Título</th>
                                    <th className="px-4 py-3 font-medium hidden md:table-cell">Solicitante</th>
                                    <th className="px-4 py-3 font-medium hidden md:table-cell">Categoría</th>
                                    <th className="px-4 py-3 font-medium">Prioridad</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Asignado</th>
                                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Fecha</th>
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
                                            <Badge variant={priorityColors[ticket.priority] || 'default'}>
                                                {priorityLabels[ticket.priority] || ticket.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={statusColors[ticket.status] || 'default'}>
                                                {statusLabels[ticket.status] || ticket.status}
                                            </Badge>
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
