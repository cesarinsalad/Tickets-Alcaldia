import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Filter, Ticket } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';

const statusColors = {
    abierto: 'blue',
    en_proceso: 'orange',
    pendiente_informacion: 'yellow',
    resuelto: 'green',
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
    baja: 'secondary',
    media: 'warning',
    alta: 'orange',
    critica: 'danger',
};

const priorityLabels = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

export default function Index({ tickets, filters, categories, departments, users }) {
    const [search, setSearch] = useState(filters.search || '');

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Tickets</h2>
                    <Link href={route('tickets.create')}>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Nuevo Ticket
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Tickets" />

            <div className="space-y-4">
                <div className="rounded-lg border border-gris-borde bg-white p-4">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Buscar por título, descripción o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Select
                            className="w-full sm:w-40"
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
                            className="w-full sm:w-40"
                            value={filters.priority || ''}
                            onChange={e => applyFilters({ priority: e.target.value })}
                        >
                            <option value="">Todas las prioridades</option>
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                            <option value="critica">Crítica</option>
                        </Select>
                        <Select
                            className="w-full sm:w-40"
                            value={filters.category || ''}
                            onChange={e => applyFilters({ category: e.target.value })}
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>
                        {filters.status || filters.priority || filters.category || filters.search ? (
                            <Button type="button" variant="ghost" size="sm" onClick={() => router.get(route('tickets.index'))}>
                                Limpiar filtros
                            </Button>
                        ) : null}
                    </form>
                </div>

                <div className="rounded-lg border border-gris-borde bg-white">
                    {tickets.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Ticket className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No se encontraron tickets</p>
                            <p className="text-sm mt-1">Crea un nuevo ticket o ajusta los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            {tickets.data.map(ticket => (
                                <Link
                                    key={ticket.id}
                                    href={route('tickets.show', ticket.id)}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gris-fondo transition-colors gap-2"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-mono text-gray-500">{ticket.code}</span>
                                            <Badge variant={statusColors[ticket.status] || 'default'}>
                                                {statusLabels[ticket.status] || ticket.status}
                                            </Badge>
                                            <Badge variant={priorityColors[ticket.priority] || 'default'}>
                                                {priorityLabels[ticket.priority] || ticket.priority}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>{ticket.creator?.full_name ?? ticket.creator?.name}</span>
                                            {ticket.department && <span>{ticket.department.name}</span>}
                                            <span>{new Date(ticket.entry_date).toLocaleDateString('es-VE')}</span>
                                        </div>
                                    </div>
                                    {ticket.assigned && (
                                        <span className="text-xs text-gray-500">
                                            Asignado a: {ticket.assigned.full_name ?? ticket.assigned.name}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
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
