import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { TrendingUp, Ticket, CheckCircle, AlertOctagon, Clock, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import LineAreaChart from '@/Components/LineAreaChart';

const priorityBadgeMap = {
    critica: 'danger',
    alta: 'orange',
    media: 'warning',
    baja: 'secondary',
    sin_definir: 'gray',
};

const priorityLabels = {
    sin_definir: 'Sin definir',
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

function KpiCard({ icon: Icon, label, value, color, href, subtitle }) {
    const colors = {
        blue: 'border-l-azul-institucional bg-blue-50/50',
        orange: 'border-l-amber-500 bg-amber-50/50',
        yellow: 'border-l-yellow-500 bg-yellow-50/50',
        green: 'border-l-verde-exito bg-green-50/50',
        red: 'border-l-rojo-urgencia bg-red-50/50',
        gray: 'border-l-gray-400 bg-gray-50/50',
    };

    const content = (
        <div className={`rounded-lg border border-gris-borde border-l-4 bg-white p-4 ${colors[color] || ''} ${href ? 'group cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-gray-400 leading-tight">{subtitle}</p>}
            {href && (
                <p className="mt-1.5 text-xs text-azul-institucional opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Ver más &rarr;
                </p>
            )}
        </div>
    );

    if (href) return <Link href={href}>{content}</Link>;
    return content;
}

export default function Index({
    kpis, mttr, trendData, trendGranularity,
    technicianWorkload, dateFrom, dateTo,
}) {
    const [from, setFrom] = useState(dateFrom || '');
    const [to, setTo] = useState(dateTo || '');

    function applyDates() {
        router.get(route('rendimiento.index'), {
            date_from: from, date_to: to,
            trend_granularity: trendGranularity,
        }, { preserveState: true, replace: true });
    }

    function clearDates() {
        setFrom('');
        setTo('');
        router.get(route('rendimiento.index'), {
            trend_granularity: trendGranularity,
        }, { preserveState: true, replace: true });
    }

    function handleGranularityChange(newGranularity) {
        const extra = { trend_granularity: newGranularity };
        if (from) extra.date_from = from;
        if (to) extra.date_to = to;
        router.reload({
            only: ['trendData', 'trendGranularity'],
            data: extra,
        });
    }

    const mttrDisplay = mttr != null
        ? `${mttr} hrs`
        : '—';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <TrendingUp className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Rendimiento</h2>
                </div>
            }
            actions={
                <>
                    <Input
                        type="date"
                        value={from}
                        onChange={e => setFrom(e.target.value)}
                        className="w-36 text-sm"
                    />
                    <span className="text-gray-400 text-sm">—</span>
                    <Input
                        type="date"
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        className="w-36 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={applyDates}>
                        Aplicar
                    </Button>
                    {(from || to) && (
                        <Button size="sm" variant="ghost" onClick={clearDates}>
                            Limpiar
                        </Button>
                    )}
                </>
            }
        >
            <Head title="Rendimiento" />

            <div className="space-y-6">
                {/* ROW 1: KPIs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        icon={Ticket}
                        label="Tickets Activos y En Proceso"
                        value={kpis?.active_tickets ?? '—'}
                        color="blue"
                        subtitle="Tickets sin resolver en el período elegido"
                        href={route('tickets.index', { status: 'abierto,en_proceso', date_from: from || dateFrom, date_to: to || dateTo })}
                    />
                    <KpiCard
                        icon={CheckCircle}
                        label="Tickets Resueltos y Cerrados"
                        value={kpis?.resolved_this_month ?? '—'}
                        color="green"
                        subtitle="Tickets resueltos en el período elegido"
                        href={route('tickets.index', { status: 'resuelto,cerrado', date_from: from || dateFrom, date_to: to || dateTo })}
                    />
                    <KpiCard
                        icon={TrendingUp}
                        label="Tickets Resueltos a Tiempo"
                        value={kpis?.sla_pct != null ? `${kpis.sla_pct}%` : '—'}
                        color="orange"
                        subtitle="Porcentaje de tickets resueltos a tiempo"
                        href={route('tickets.index', { sla: 'missed', status: 'resuelto,cerrado', date_from: from || dateFrom, date_to: to || dateTo })}
                    />
                    <KpiCard
                        icon={AlertOctagon}
                        label="Técnicos con Tickets Vencidos"
                        value={kpis?.technicians_overdue ?? '—'}
                        color="red"
                        subtitle="Cantidad de técnicos con tickets vencidos"
                        href={route('tickets.index', { overdue: 1, date_from: from || dateFrom, date_to: to || dateTo })}
                    />
                </div>

                {/* ROW 2: MTTR */}
                <div className="rounded-lg border border-gris-borde bg-white p-6 flex flex-col items-center justify-center text-center">
                    <Clock className="h-8 w-8 text-azul-institucional mb-2" />
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">MTTR</p>
                    <p className="mt-2 text-4xl font-bold text-gray-900">{mttrDisplay}</p>
                    <p className="mt-1 text-xs text-gray-400">Tiempo medio de resolución en el período elegido</p>
                </div>

                {/* ROW 3: Trend Chart (Created vs Resolved) */}
                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <LineAreaChart
                        data={trendData}
                        granularity={trendGranularity}
                        onGranularityChange={handleGranularityChange}
                    />
                </div>

                {/* ROW 4: Technician Workload Table */}
                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide inline-flex items-center gap-2">
                        <Users className="h-4 w-4 text-azul-institucional" />
                        Carga de Trabajo del Equipo
                    </h3>
                    {technicianWorkload && technicianWorkload.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Técnico</th>
                                        <th className="px-4 py-3 font-medium text-center">Tickets Activos</th>
                                        <th className="px-4 py-3 font-medium">Desglose de Tickets Activos</th>
                                        <th className="px-4 py-3 font-medium text-center">Tickets Cerrados ({from || dateFrom} - {to || dateTo})</th>
                                        <th className="px-4 py-3 font-medium">Ver Tickets</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gris-borde">
                                    {technicianWorkload.map(t => (
                                        <tr key={t.id} className="hover:bg-gris-fondo transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-bold text-gray-900">{t.active_count}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="grid grid-cols-4 gap-1">
                                                    {['critica', 'alta', 'media', 'baja'].map(priority => {
                                                        const count = t.priority_breakdown?.[priority] ?? 0;
                                                        const variant = priorityBadgeMap[priority] || 'default';
                                                        return (
                                                            <Badge key={priority} variant={count > 0 ? variant : 'secondary'} className={`text-[10px] px-1 py-0 leading-tight justify-center ${count === 0 ? 'opacity-30' : ''}`}>
                                                                {priorityLabels[priority]} {count}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="inline-flex items-center justify-center gap-2 text-xs">
                                                    <span className={`font-medium inline-flex items-center gap-0.5 ${t.resolved_on_time > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                                        <CheckCircle className="h-3 w-3" /> {t.resolved_on_time} a tiempo
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className={`font-medium inline-flex items-center gap-0.5 ${t.resolved_overdue > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                                                        <AlertTriangle className="h-3 w-3" /> {t.resolved_overdue} vencidos
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[11px] px-2 py-0.5 h-auto"
                                                        onClick={() => router.visit(route('tickets.index', { assigned: t.id, status: 'abierto,en_proceso,pendiente_informacion' }))}
                                                    >
                                                        Activos
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[11px] px-2 py-0.5 h-auto"
                                                        onClick={() => router.visit(route('tickets.index', { assigned: t.id, status: 'resuelto,cerrado', date_from: from || dateFrom, date_to: to || dateTo }))}
                                                    >
                                                        Cerrados
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[11px] px-2 py-0.5 h-auto"
                                                        onClick={() => router.visit(route('tickets.index', { assigned: t.id }))}
                                                    >
                                                        Todos
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6">No hay técnicos registrados.</p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
