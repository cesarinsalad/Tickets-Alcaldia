import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Ticket, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import Pagination from '@/Components/Pagination';

const priorityBadgeMap = {
    critica: 'danger',
    alta: 'orange',
    media: 'warning',
    baja: 'secondary',
    sin_definir: 'gray',
};

export default function Index({ tickets, departments, filters }) {
    const [departmentId, setDepartmentId] = useState(filters?.department_id || '');

    function applyFilter() {
        router.get(route('bandeja.index'), {
            department_id: departmentId || undefined,
        }, { preserveState: true, replace: true });
    }

    function clearFilter() {
        setDepartmentId('');
        router.get(route('bandeja.index'), {}, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <Inbox className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Bandeja de Entrada</h2>
                </div>
            }
            actions={
                <div className="flex items-center gap-2">
                    <Select
                        value={departmentId}
                        onChange={e => setDepartmentId(e.target.value)}
                        className="w-44 text-xs"
                    >
                        <option value="">Todos los departamentos</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </Select>
                    <Button size="sm" variant="outline" onClick={applyFilter}>
                        <Search className="h-3.5 w-3.5" />
                    </Button>
                    {departmentId && (
                        <Button size="sm" variant="ghost" onClick={clearFilter}>
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Bandeja de Entrada" />

            <div className="rounded-lg border border-gris-borde bg-white overflow-hidden">
                {tickets.data?.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide bg-gris-fondo">
                                        <th className="px-5 py-3 font-medium">Código</th>
                                        <th className="px-5 py-3 font-medium">Título</th>
                                        <th className="px-5 py-3 font-medium">Solicitante</th>
                                        <th className="px-5 py-3 font-medium">Departamento</th>
                                        <th className="px-5 py-3 font-medium">Prioridad</th>
                                        <th className="px-5 py-3 font-medium">Categoría</th>
                                        <th className="px-5 py-3 font-medium">Ingreso</th>
                                        <th className="px-5 py-3 font-medium">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gris-borde">
                                    {tickets.data.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-mono text-xs text-azul-institucional font-medium">{t.code}</span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-900 max-w-[220px] truncate">{t.title}</td>
                                            <td className="px-5 py-3 text-gray-600">{t.creator_name}</td>
                                            <td className="px-5 py-3 text-gray-600">{t.department}</td>
                                            <td className="px-5 py-3">
                                                <Badge variant={priorityBadgeMap[t.priority] || 'default'}>
                                                    {t.priority_label}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">{t.category || '—'}</td>
                                            <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{t.entry_date}</td>
                                            <td className="px-5 py-3">
                                                <Link href={route('tickets.show', t.id)}>
                                                    <Button variant="outline" size="sm" className="text-xs">
                                                        <Ticket className="h-3 w-3 mr-1" />
                                                        Asignar
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {tickets.links && tickets.links.length > 3 && (
                            <div className="px-5 py-3 border-t border-gris-borde">
                                <Pagination
                                    links={tickets.links}
                                    total={tickets.total}
                                    perPage={tickets.per_page || 10}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Inbox className="h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Bandeja vacía</h3>
                        <p className="text-xs text-gray-400 max-w-xs">
                            No hay tickets nuevos pendientes de asignación.
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
