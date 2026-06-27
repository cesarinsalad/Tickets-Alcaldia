import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Monitor, ChevronDown, ChevronUp, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';

export default function Index({ equipment, filters, totalCount, highRecurrenceCount }) {
    const { auth } = usePage().props;
    const [expanded, setExpanded] = useState({});

    function toggleExpand(id) {
        setExpanded(e => ({ ...e, [id]: !e[id] }));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <Monitor className="h-6 w-6 text-azul-institucional shrink-0" />
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 truncate">Registro de Equipos</h2>
                    </div>
                </div>
            }
        >
            <Head title="Registro de Equipos" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => router.get(route('equipments.index'), {}, { preserveState: true, replace: true })}
                    className="group text-left rounded-lg border border-gris-borde border-l-4 border-l-azul-institucional bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipos registrados</p>
                        <Monitor className="h-5 w-5 text-azul-institucional" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{totalCount}</p>
                    <p className="mt-0.5 text-xs text-gray-400 leading-tight">Total de equipos en el inventario</p>
                    <p className="mt-1 text-xs text-azul-institucional opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Ver más &rarr;
                    </p>
                </button>
                <button
                    onClick={() => {
                        if (filters?.recurrence) {
                            router.get(route('equipments.index'), { search: filters?.search || undefined }, { preserveState: true, replace: true });
                        } else {
                            router.get(route('equipments.index'), { search: filters?.search || undefined, recurrence: 1 }, { preserveState: true, replace: true });
                        }
                    }}
                    className="group text-left rounded-lg border border-gris-borde border-l-4 border-l-orange-500 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alta recurrencia</p>
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{highRecurrenceCount}</p>
                    <p className="mt-0.5 text-xs text-gray-400 leading-tight">Equipos con 2 o más retiros este mes</p>
                    <p className="mt-1 text-xs text-azul-institucional opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        {filters?.recurrence ? 'Quitar filtro →' : 'Ver más →'}
                    </p>
                </button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Buscar por SKU, marca o modelo..."
                        defaultValue={filters?.search || ''}
                        onChange={e => {
                            const val = e.target.value;
                            if (val.length >= 2 || val.length === 0) {
                                router.get(route('equipments.index'), {
                                    search: val || undefined,
                                    recurrence: filters?.recurrence || undefined,
                                }, {
                                    preserveState: true,
                                    replace: true,
                                });
                            }
                        }}
                        className="pl-10 h-12 text-base"
                    />
                    {(filters?.search || filters?.recurrence) && (
                        <button
                            onClick={() => router.get(route('equipments.index'), {}, { preserveState: true, replace: true })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-azul-institucional hover:underline"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {equipment.data.length === 0 ? (
                <div className="rounded-lg border border-gris-borde bg-white py-16 text-center">
                    <Monitor className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-500">No hay equipos registrados</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {filters?.search
                            ? `Sin resultados para "${filters.search}".`
                            : 'Los equipos aparecerán aquí cuando generes informes de retiro.'}
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-gris-borde bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gris-fondo border-b border-gris-borde">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Modelo</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Procesador</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">RAM</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Disco</th>
                                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Informes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {equipment.data.map(eq => {
                                    const lastReport = eq.intervention_reports?.[0];
                                    return [
                                        <tr
                                            key={eq.id}
                                            className={`cursor-pointer hover:bg-gris-fondo transition-colors ${expanded[eq.id] ? 'bg-blue-50/30' : ''}`}
                                            onClick={() => toggleExpand(eq.id)}
                                        >
                                            <td className="px-5 py-3 font-mono text-xs text-azul-institucional font-medium">{eq.sku}</td>
                                            <td className="px-5 py-3 text-gray-900">{eq.brand || '—'}</td>
                                            <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{eq.model || '—'}</td>
                                            <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">{eq.processor || '—'}</td>
                                            <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">{eq.ram_memory || '—'}</td>
                                            <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">{eq.storage_disk || '—'}</td>
                                            <td className="px-5 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Badge variant={eq.intervention_reports_count > 0 ? 'default' : 'secondary'}>
                                                        {eq.intervention_reports_count}
                                                    </Badge>
                                                    {expanded[eq.id] ? (
                                                        <ChevronUp className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>,
                                        expanded[eq.id] && lastReport && (
                                            <tr key={`${eq.id}-report`} className="bg-gray-50/50">
                                                <td colSpan={7} className="px-5 py-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Ultimo informe
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-10 gap-y-1 text-sm mb-2">
                                                        <span>
                                                            <span className="text-gray-400">Ticket:</span>{' '}
                                                            <Link
                                                                href={route('tickets.show', lastReport.ticket?.id)}
                                                                className="text-azul-institucional hover:underline font-medium"
                                                            >
                                                                {lastReport.ticket?.code}
                                                            </Link>
                                                        </span>
                                                        <span>
                                                            <span className="text-gray-400">Fecha:</span>{' '}
                                                            {new Date(lastReport.created_at).toLocaleDateString('es-VE')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="flex-1 text-sm text-gray-700 line-clamp-3">
                                                            {lastReport.diagnostic}
                                                        </p>
                                                        <Button size="sm" variant="outline" asChild onClick={e => e.stopPropagation()}>
                                                            <a
                                                                href={route('intervention-reports.pdf', lastReport.id)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                Ver PDF
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    ].filter(Boolean);
                                })}
                            </tbody>
                        </table>
                    </div>

                    {equipment.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-gris-borde">
                            {equipment.links?.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
