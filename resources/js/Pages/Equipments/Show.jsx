import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Monitor, Cpu, HardDrive, FileText, Barcode } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

export default function Show({ equipment }) {
    const reports = equipment.intervention_reports ?? [];

    return (
        <AuthenticatedLayout
            header={
                <Link
                    href={route('equipments.index')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="truncate">Inventario de Equipos</span>
                </Link>
            }
        >
            <Head title={equipment.sku} />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-azul-institucional" />
                        Detalles del Equipo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="rounded-md bg-gris-fondo p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                <Barcode className="h-3.5 w-3.5" />
                                SKU
                            </div>
                            <p className="text-sm font-mono font-medium text-azul-institucional">{equipment.sku}</p>
                        </div>
                        <div className="rounded-md bg-gris-fondo p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                <Monitor className="h-3.5 w-3.5" />
                                Marca
                            </div>
                            <p className="text-sm font-medium text-gray-900">{equipment.brand || '—'}</p>
                        </div>
                        <div className="rounded-md bg-gris-fondo p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                <Monitor className="h-3.5 w-3.5" />
                                Modelo
                            </div>
                            <p className="text-sm font-medium text-gray-900">{equipment.model || '—'}</p>
                        </div>
                        <div className="rounded-md bg-gris-fondo p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                <Cpu className="h-3.5 w-3.5" />
                                Procesador
                            </div>
                            <p className="text-sm font-medium text-gray-900">{equipment.processor || '—'}</p>
                        </div>
                        <div className="rounded-md bg-gris-fondo p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                <Cpu className="h-3.5 w-3.5" />
                                Memoria RAM
                            </div>
                            <p className="text-sm font-medium text-gray-900">{equipment.ram_memory || '—'}</p>
                        </div>
                        <div className="rounded-md bg-gris-fondo p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                <HardDrive className="h-3.5 w-3.5" />
                                Disco de Almacenamiento
                            </div>
                            <p className="text-sm font-medium text-gray-900">{equipment.storage_disk || '—'}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-azul-institucional" />
                        Historial de Informes ({reports.length})
                    </h3>
                    {reports.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No hay informes de retiro para este equipo.</p>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            {reports.map(report => (
                                <div key={report.id} className="py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-1">
                                                <Link
                                                    href={route('tickets.show', report.ticket?.id)}
                                                    className="font-medium text-azul-institucional hover:underline"
                                                >
                                                    {report.ticket?.code}
                                                </Link>
                                                <span className="text-gray-400">
                                                    {new Date(report.created_at).toLocaleDateString('es-VE', {
                                                        day: 'numeric', month: 'long', year: 'numeric',
                                                    })}
                                                </span>
                                                <Badge variant={report.ticket?.category?.name ? 'secondary' : 'ghost'} className="text-[10px]">
                                                    {report.ticket?.status_label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                                                {report.diagnostic}
                                            </p>
                                            {report.ticket?.assigned && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Técnico: {report.ticket.assigned.full_name ?? report.ticket.assigned.name}
                                                </p>
                                            )}
                                        </div>
                                        <a
                                            href={route('intervention-reports.pdf', report.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0"
                                        >
                                            <Button size="sm" variant="outline">
                                                <FileText className="h-4 w-4" />
                                                PDF
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
