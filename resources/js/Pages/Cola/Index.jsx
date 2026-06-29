import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ListOrdered, Ticket } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import Pagination from '@/Components/Pagination';
import RelativeTime from '@/Components/RelativeTime';

const priorityBadgeMap = {
    critica: 'danger',
    alta: 'orange',
    media: 'warning',
    baja: 'secondary',
    sin_definir: 'gray',
};

const statusBadgeMap = {
    abierto: 'default',
    en_proceso: 'orange',
    pendiente_informacion: 'warning',
    resuelto: 'success',
    cerrado: 'gray',
};

export default function Index({ tickets, sort: currentSort, dir: currentDir }) {
    function handleSort(col) {
        const newDir = currentSort === col && currentDir === 'asc' ? 'desc' : 'asc';
        router.get(route('cola.index'), { sort: col, dir: newDir }, { preserveState: true, replace: true });
    }

    function SortHeader({ col, children }) {
        const isActive = currentSort === col;
        return (
            <th
                className="px-5 py-3 font-medium cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort(col)}
            >
                <span className="inline-flex items-center gap-1">
                    {children}
                    {isActive && (
                        <span className="text-azul-institucional">
                            {currentDir === 'asc' ? '↑' : '↓'}
                        </span>
                    )}
                </span>
            </th>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <ListOrdered className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Mi Bandeja de Entrada</h2>
                </div>
            }
        >
            <Head title="Mi Bandeja de Entrada" />

            <div className="rounded-lg border border-gris-borde bg-white overflow-hidden">
                {tickets.data?.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide bg-gris-fondo">
                                        <SortHeader col="code">Código</SortHeader>
                                        <SortHeader col="title">Título</SortHeader>
                                        <SortHeader col="priority">Prioridad</SortHeader>
                                        <SortHeader col="status">Estado</SortHeader>
                                        <SortHeader col="creator_name">Solicitante</SortHeader>
                                        <SortHeader col="sla_resolution_deadline">Vencimiento</SortHeader>
                                        <SortHeader col="entry_date">Ingreso</SortHeader>
                                        <th className="px-5 py-3 font-medium">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gris-borde">
                                    {tickets.data.map(t => (
                                        <tr key={t.id} onClick={() => router.visit(route('tickets.show', t.id))} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                            <td className="px-5 py-3">
                                                <span className="font-mono text-xs text-azul-institucional font-medium">{t.code}</span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-900 max-w-[200px] truncate">{t.title}</td>
                                            <td className="px-5 py-3">
                                                <Badge variant={priorityBadgeMap[t.priority] || 'default'}>{t.priority_label}</Badge>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge variant={statusBadgeMap[t.status] || 'default'}>{t.status_label}</Badge>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600 text-xs">{t.creator_name}</td>
                                            <td className="px-5 py-3">
                                                <RelativeTime deadline={t.sla_deadline_raw} entryDate={t.entry_date_raw} compact />
                                            </td>
                                            <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{t.entry_date}</td>
                                            <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                                                <Link href={route('tickets.show', t.id)}>
                                                    <Button variant="outline" size="sm" className="text-xs">
                                                        <Ticket className="h-3 w-3 mr-1" />
                                                        Atender
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
                        <ListOrdered className="h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Cola vacía</h3>
                        <p className="text-xs text-gray-400 max-w-xs">
                            No tienes tickets activos asignados.
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
