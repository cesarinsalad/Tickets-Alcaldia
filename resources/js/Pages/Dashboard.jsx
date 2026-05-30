import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Ticket, Clock, CheckCircle, AlertTriangle, Circle, Plus } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

function KpiCard({ icon: Icon, label, value, color, href }) {
    const colors = {
        blue: 'border-l-azul-institucional bg-blue-50/50',
        orange: 'border-l-amber-500 bg-amber-50/50',
        yellow: 'border-l-yellow-500 bg-yellow-50/50',
        green: 'border-l-verde-exito bg-green-50/50',
        red: 'border-l-rojo-urgencia bg-red-50/50',
        gray: 'border-l-gray-400 bg-gray-50/50',
    };

    const content = (
        <div className={`rounded-lg border border-gris-borde border-l-4 bg-white p-4 ${colors[color] || ''}`}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );

    if (href) return <Link href={href}>{content}</Link>;
    return content;
}

export default function Dashboard({ stats, unreadNotifications }) {
    const { kpis, role, slaOverdue } = stats;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
                    <Link href={route('tickets.create')}>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Nuevo Ticket
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpis.open !== undefined && (
                        <KpiCard icon={Circle} label="Abiertos" value={kpis.open} color="blue" href={route('tickets.index', { status: 'abierto' })} />
                    )}
                    {kpis.in_process !== undefined && (
                        <KpiCard icon={Clock} label="En Proceso" value={kpis.in_process} color="orange" href={route('tickets.index', { status: 'en_proceso' })} />
                    )}
                    {kpis.pending_info !== undefined && (
                        <KpiCard icon={AlertTriangle} label="Pendientes de Info" value={kpis.pending_info} color="yellow" href={route('tickets.index', { status: 'pendiente_informacion' })} />
                    )}
                    {kpis.resolved !== undefined && (
                        <KpiCard icon={CheckCircle} label="Resueltos" value={kpis.resolved} color="green" href={route('tickets.index', { status: 'resuelto' })} />
                    )}
                    {kpis.closed !== undefined && (
                        <KpiCard icon={CheckCircle} label="Cerrados" value={kpis.closed} color="gray" href={route('tickets.index', { status: 'cerrado' })} />
                    )}
                    {kpis.resolved_today !== undefined && (
                        <KpiCard icon={CheckCircle} label="Resueltos Hoy" value={kpis.resolved_today} color="green" />
                    )}
                    {kpis.sla_overdue !== undefined && (
                        <KpiCard icon={AlertTriangle} label="SLA Vencidos" value={kpis.sla_overdue} color="red" href={route('tickets.index', { sla_overdue: 1 })} />
                    )}
                    {kpis.total !== undefined && (
                        <KpiCard icon={Ticket} label="Total" value={kpis.total} color="blue" />
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-gris-borde bg-white p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceso rápido</h3>
                        <div className="space-y-2">
                            <Link href={route('tickets.create')} className="flex items-center gap-2 rounded-md border border-gris-borde p-3 text-sm text-gray-700 hover:bg-gris-fondo transition-colors">
                                <Plus className="h-4 w-4 text-azul-institucional" />
                                Crear nuevo ticket
                            </Link>
                            <Link href={route('tickets.index')} className="flex items-center gap-2 rounded-md border border-gris-borde p-3 text-sm text-gray-700 hover:bg-gris-fondo transition-colors">
                                <Ticket className="h-4 w-4 text-azul-institucional" />
                                Ver todos los tickets
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gris-borde bg-white p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>Rol actual: <Badge variant="secondary">{role}</Badge></p>
                            {unreadNotifications > 0 && (
                                <p className="text-amarillo-advertencia">
                                    Tienes {unreadNotifications} notificaciones sin leer.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
