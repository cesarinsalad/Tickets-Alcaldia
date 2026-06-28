import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { BarChart, BarChart3, FolderTree, Ticket, CheckCircle, TrendingUp, AlertOctagon, Cpu } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import SimpleBarChart from '@/Components/SimpleBarChart';
import SimpleDonutChart from '@/Components/SimpleDonutChart';
import StackedBarChart from '@/Components/StackedBarChart';

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
    kpis, priorityDistribution,
    topEquipment, technicianChart,
    topDepartments, categoryDistribution, dateFrom, dateTo,
}) {
    const [from, setFrom] = useState(dateFrom || '');
    const [to, setTo] = useState(dateTo || '');

    function applyDates() {
        router.get(route('metricas.index'), {
            date_from: from, date_to: to,
        }, { preserveState: true, replace: true });
    }

    function clearDates() {
        setFrom('');
        setTo('');
        router.get(route('metricas.index'), {}, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <BarChart className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Métricas</h2>
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
            <Head title="Métricas" />

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
                        label="Cumplimiento de tiempos"
                        value={kpis?.sla_pct != null ? `${kpis.sla_pct}%` : '—'}
                        color="orange"
                        subtitle="Tickets resueltos dentro de su plazo establecido"
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

                {/* ROW 2: Priority Donut */}
                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide inline-flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-azul-institucional" />
                        Distribución por Prioridad
                    </h3>
                    {priorityDistribution && priorityDistribution.length > 0 ? (
                        <SimpleDonutChart
                            data={priorityDistribution}
                            colors={priorityDistribution.map((p) => p.color)}
                            onPieClick={(entry) => router.visit(route('tickets.index', {
                                priority: entry.value,
                                date_from: from || dateFrom,
                                date_to: to || dateTo,
                            }))}
                        />
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                    )}
                </div>

                {/* ROW 3: Technician Stacked Bar + Top 5 Equipment */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-gris-borde bg-white p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide inline-flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-azul-institucional" />
                            Tickets Resueltos por Técnico
                        </h3>
                        {technicianChart && technicianChart.length > 0 ? (
                            <StackedBarChart data={technicianChart} />
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                        )}
                    </div>
                    <div className="rounded-lg border border-gris-borde bg-white p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide inline-flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-azul-institucional" />
                            Top 5 Equipos Problemáticos
                        </h3>
                        {topEquipment && topEquipment.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                            <th className="px-3 py-2 font-medium">SKU</th>
                                            <th className="px-3 py-2 font-medium">Marca</th>
                                            <th className="px-3 py-2 font-medium">Modelo</th>
                                            <th className="px-3 py-2 font-medium text-center">Fallas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gris-borde">
                                        {topEquipment.map((eq, i) => (
                                            <tr key={eq.sku || i} className="hover:bg-gris-fondo transition-colors">
                                                <td className="px-3 py-2.5 font-mono text-xs text-azul-institucional">{eq.sku}</td>
                                                <td className="px-3 py-2.5 text-gray-700">{eq.brand || '—'}</td>
                                                <td className="px-3 py-2.5 text-gray-700">{eq.model || '—'}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rojo-urgencia-light text-rojo-urgencia text-xs font-bold">
                                                        {eq.count}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10">Sin datos de equipos</p>
                        )}
                    </div>
                </div>

                {/* ROW 4: Existing — Top Departments + Category Distribution */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-gris-borde bg-white p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide inline-flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-azul-institucional" />
                            Top 5 Departamentos con Más Solicitudes
                        </h3>
                        {topDepartments.length > 0 ? (
                            <SimpleBarChart
                                data={topDepartments}
                                onBarClick={(entry) => router.visit(route('tickets.index', {
                                    department: entry.id,
                                    date_from: from || dateFrom,
                                    date_to: to || dateTo,
                                }))}
                            />
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                        )}
                    </div>
                    <div className="rounded-lg border border-gris-borde bg-white p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide inline-flex items-center gap-2">
                            <FolderTree className="h-4 w-4 text-azul-institucional" />
                            Distribución por Categoría
                        </h3>
                        {categoryDistribution.length > 0 ? (
                            <SimpleDonutChart
                                data={categoryDistribution}
                                onPieClick={(entry) => router.visit(route('tickets.index', {
                                    category: entry.id,
                                    date_from: from || dateFrom,
                                    date_to: to || dateTo,
                                }))}
                            />
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
