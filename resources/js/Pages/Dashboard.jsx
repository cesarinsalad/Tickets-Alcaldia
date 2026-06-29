import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Ticket, Clock, CheckCircle, AlertTriangle, Circle, Plus, TrendingUp, AlertOctagon, Building2, ChevronUp, ChevronDown, ArrowRight, Users, Layers, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import SimpleDonutChart from '@/Components/SimpleDonutChart';
import StackedBarChart from '@/Components/StackedBarChart';
import Pagination from '@/Components/Pagination';
import RelativeTime from '@/Components/RelativeTime';
import TimeProgressBar from '@/Components/TimeProgressBar';

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

const statusLabels = {
    abierto: 'Abierto',
    en_proceso: 'En Proceso',
    pendiente_informacion: 'Pendiente de Info',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
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

function SuperAdminDashboard({ kpis, extra }) {
    const [distributionRange, setDistributionRange] = useState(extra.distribution_range || 'last_month');
    const [priorityRange, setPriorityRange] = useState(extra.priority_range || 'last_month');

    function handleDistributionRangeChange(newRange) {
        setDistributionRange(newRange);
        router.get(route('dashboard'), {
            distribution_range: newRange,
            date_from: extra.date_from,
            date_to: extra.date_to,
        }, { preserveState: true, replace: true });
    }

    function handlePriorityRangeChange(newRange) {
        setPriorityRange(newRange);
        router.get(route('dashboard'), {
            priority_range: newRange,
            date_from: extra.date_from,
            date_to: extra.date_to,
        }, { preserveState: true, replace: true });
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={Ticket} label="Tickets Abiertos" value={extra.abiertos} color="blue" subtitle="Sin atender" href={route('tickets.index', { status: 'abierto' })} />
                <KpiCard icon={Clock} label="Tickets En Proceso" value={extra.en_proceso} color="orange" subtitle="Siendo atendidos" href={route('tickets.index', { status: 'en_proceso' })} />
                <KpiCard icon={CheckCircle} label="Tickets Cerrados" value={extra.cerrados_this_month} color="green" subtitle="Este mes" href={route('tickets.index', { status: 'cerrado', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={AlertOctagon} label="Tickets Vencidos" value={extra.sla_expired} color="red" subtitle="Con SLA vencido" href={route('tickets.index', { overdue: 1 })} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-lg border border-gris-borde bg-white p-5">
                    <StackedBarChart
                        data={extra.status_distribution}
                        xKey="period"
                        bars={[
                            { dataKey: 'abierto', name: 'Abierto', fill: '#1E3A5F' },
                            { dataKey: 'en_proceso', name: 'En Proceso', fill: '#EA580C' },
                            { dataKey: 'pendiente_informacion', name: 'Pendiente Info', fill: '#CA8A04' },
                            { dataKey: 'resuelto_cerrado', name: 'Resuelto+Cerrado', fill: '#166534' },
                        ]}
                        granularity={distributionRange}
                        onGranularityChange={handleDistributionRangeChange}
                    />
                </div>

                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Distribución por Prioridad</h3>
                        <select
                            value={priorityRange}
                            onChange={(e) => handlePriorityRangeChange(e.target.value)}
                            className="text-xs border border-gris-borde rounded px-2 py-1 bg-white text-gray-600 cursor-pointer"
                        >
                            <option value="last_week">Última semana</option>
                            <option value="last_month">Último mes</option>
                            <option value="last_3_months">Últimos 3 meses</option>
                            <option value="last_year">Último año</option>
                        </select>
                    </div>
                    {extra.priority_distribution?.length > 0 ? (
                        <div className="space-y-5">
                            {extra.priority_distribution.map(p => {
                                const barColors = {
                                    critica: 'bg-rojo-urgencia',
                                    alta: 'bg-amber-600',
                                    media: 'bg-yellow-600',
                                    baja: 'bg-azul-institucional',
                                };
                                return (
                                    <div key={p.priority}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-gray-600">{p.label}</span>
                                            <span className="text-xs font-semibold text-gray-700">{p.pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 ${barColors[p.priority] || 'bg-gray-400'}`}
                                                style={{ width: `${Math.max(p.pct, 2)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{p.count} ticket{p.count !== 1 ? 's' : ''}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">Sin datos este mes.</p>
                    )}
                </div>
            </div>

        </div>
    );
}

function AdminTicketsDashboard({ extra }) {
    const [distributionRange, setDistributionRange] = useState(extra.distribution_range || 'last_month');
    const [priorityRange, setPriorityRange] = useState(extra.priority_range || 'last_month');

    function handleDistributionRangeChange(newRange) {
        setDistributionRange(newRange);
        router.get(route('dashboard'), {
            distribution_range: newRange,
            date_from: extra.date_from,
            date_to: extra.date_to,
        }, { preserveState: true, replace: true });
    }

    function handlePriorityRangeChange(newRange) {
        setPriorityRange(newRange);
        router.get(route('dashboard'), {
            priority_range: newRange,
            date_from: extra.date_from,
            date_to: extra.date_to,
        }, { preserveState: true, replace: true });
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={Ticket} label="Tickets Abiertos" value={extra.abiertos} color="blue" subtitle="Sin atender" href={route('tickets.index', { status: 'abierto' })} />
                <KpiCard icon={Clock} label="Tickets En Proceso" value={extra.en_proceso} color="orange" subtitle="Siendo atendidos" href={route('tickets.index', { status: 'en_proceso' })} />
                <KpiCard icon={CheckCircle} label="Tickets Cerrados" value={extra.cerrados_this_month} color="green" subtitle="Este mes" href={route('tickets.index', { status: 'cerrado', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={AlertOctagon} label="Tickets Vencidos" value={extra.sla_expired} color="red" subtitle="Con SLA vencido" href={route('tickets.index', { overdue: 1 })} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-lg border border-gris-borde bg-white p-5">
                    <StackedBarChart
                        data={extra.status_distribution}
                        xKey="period"
                        bars={[
                            { dataKey: 'abierto', name: 'Abierto', fill: '#1E3A5F' },
                            { dataKey: 'en_proceso', name: 'En Proceso', fill: '#EA580C' },
                            { dataKey: 'pendiente_informacion', name: 'Pendiente Info', fill: '#CA8A04' },
                            { dataKey: 'resuelto_cerrado', name: 'Resuelto+Cerrado', fill: '#166534' },
                        ]}
                        granularity={distributionRange}
                        onGranularityChange={handleDistributionRangeChange}
                    />
                </div>

                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Distribución por Prioridad</h3>
                        <select
                            value={priorityRange}
                            onChange={(e) => handlePriorityRangeChange(e.target.value)}
                            className="text-xs border border-gris-borde rounded px-2 py-1 bg-white text-gray-600 cursor-pointer"
                        >
                            <option value="last_week">Última semana</option>
                            <option value="last_month">Último mes</option>
                            <option value="last_3_months">Últimos 3 meses</option>
                            <option value="last_year">Último año</option>
                        </select>
                    </div>
                    {extra.priority_distribution?.length > 0 ? (
                        <div className="space-y-5">
                            {extra.priority_distribution.map(p => {
                                const barColors = {
                                    critica: 'bg-rojo-urgencia',
                                    alta: 'bg-amber-600',
                                    media: 'bg-yellow-600',
                                    baja: 'bg-azul-institucional',
                                };
                                return (
                                    <div key={p.priority}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-gray-600">{p.label}</span>
                                            <span className="text-xs font-semibold text-gray-700">{p.pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 ${barColors[p.priority] || 'bg-gray-400'}`}
                                                style={{ width: `${Math.max(p.pct, 2)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{p.count} ticket{p.count !== 1 ? 's' : ''}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">Sin datos este mes.</p>
                    )}
                </div>
            </div>

        </div>
    );
}

function RoleDashboard({ kpis, role, unreadNotifications, userDepartment }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.open !== undefined && (
                    <KpiCard icon={Circle} label="Abiertos" value={kpis.open} color="blue" subtitle="Sin atención" href={route('tickets.index', { status: 'abierto' })} />
                )}
                {kpis.in_process !== undefined && (
                    <KpiCard icon={Clock} label="En Proceso" value={kpis.in_process} color="orange" subtitle="Siendo atendidos" href={route('tickets.index', { status: 'en_proceso' })} />
                )}
                {kpis.pending_info !== undefined && (
                    <KpiCard icon={AlertTriangle} label="Pendientes de Info" value={kpis.pending_info} color="yellow" subtitle="Requieren información del solicitante" href={route('tickets.index', { status: 'pendiente_informacion' })} />
                )}
                {kpis.resolved !== undefined && (
                    <KpiCard icon={CheckCircle} label="Resueltos" value={kpis.resolved} color="green" subtitle="Con solución aplicada" href={route('tickets.index', { status: 'resuelto' })} />
                )}
                {kpis.closed !== undefined && (
                    <KpiCard icon={CheckCircle} label="Cerrados" value={kpis.closed} color="gray" subtitle="Finalizados" href={route('tickets.index', { status: 'cerrado' })} />
                )}
                {kpis.resolved_today !== undefined && (
                    <KpiCard icon={CheckCircle} label="Resueltos Hoy" value={kpis.resolved_today} color="green" subtitle="Del día actual" href={route('tickets.index', { status: 'resuelto' })} />
                )}
                {kpis.total !== undefined && (
                    <KpiCard icon={Ticket} label="Total" value={kpis.total} color="blue" subtitle="Visibles según tu rol" href={route('tickets.index')} />
                )}
            </div>

        </div>
    );
}

const statusBadgeMap = {
    abierto: 'default',
    en_proceso: 'orange',
    pendiente_informacion: 'warning',
    resuelto: 'success',
    cerrado: 'gray',
};

const statusLabelMap = {
    abierto: 'Abierto',
    en_proceso: 'En Proceso',
    pendiente_informacion: 'Pendiente de Info',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
};

function TecnicoDashboard({ extra }) {
    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                        <TrendingUp className="h-4 w-4 text-azul-institucional" />
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Progreso Actual</h3>
                    </div>
                    <div className="flex flex-col items-center p-5">
                        <div className="relative w-24 h-24 mb-2">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 72 72">
                                <circle cx="36" cy="36" r="30" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                                <circle cx="36" cy="36" r="30" fill="none"
                                    stroke={extra.progress_pct >= 100 ? '#34d399' : extra.progress_pct >= 50 ? '#facc15' : '#f87171'}
                                    strokeWidth="6"
                                    strokeDasharray={2 * Math.PI * 30}
                                    strokeDashoffset={2 * Math.PI * 30 * (1 - extra.progress_pct / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">{extra.progress_pct}%</span>
                        </div>
                        <p className="text-sm text-slate-400 text-center mt-4 italic">
                            {extra.progress_pct >= 100 ? (
                                <span>¡Todos tus tickets han sido resueltos!</span>
                            ) : extra.progress_pct >= 50 ? (
                                <span>Más de la mitad de tus tickets han sido resueltos. ¡Buen progreso!</span>
                            ) : (
                                <span>Menos de la mitad de tus tickets han sido resueltos.</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                        <AlertTriangle className="h-4 w-4 text-azul-institucional" />
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Urgencias</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-5 pb-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-100 rounded-xl p-4">
                                <p className="text-4xl font-black text-center" style={{ color: '#c10005' }}>{extra.sla_expired}</p>
                                <p className="text-sm font-medium text-red-600 text-center mt-1">Vencidos</p>
                            </div>
                            <div className="bg-yellow-100 rounded-xl p-4">
                                <p className="text-4xl font-black text-center" style={{ color: '#f0b100' }}>{extra.sla_at_risk}</p>
                                <p className="text-sm font-medium text-yellow-600 text-center mt-1">En Riesgo</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                        <Layers className="h-4 w-4 text-azul-institucional" />
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Carga de Trabajo</h3>
                    </div>
                    <div className="p-5">
                        {(() => {
                            const breakdown = extra.queue_status_breakdown || [];
                            const total = breakdown.reduce((sum, item) => sum + (item.count || 0), 0);
                            const barColors = {
                                'Abiertos': 'bg-azul-institucional',
                                'En Proceso': 'bg-amber-600',
                                'Pendiente Info': 'bg-yellow-600',
                            };
                            return breakdown.map(item => {
                                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                                return (
                                    <div key={item.name} className="mb-4 last:mb-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-gray-600">{item.name}</span>
                                            <span className="text-xs font-semibold text-gray-700">{item.count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 ${barColors[item.name] || 'bg-gray-400'}`}
                                                style={{ width: `${Math.max(pct, 3)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

            </div>

        </div>
    );
}

function AdminDeptDashboard({ extra }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <KpiCard icon={Ticket} label="Tickets del Equipo" value={extra.total_department_tickets} color="blue" subtitle={`Creados en el período ${extra.date_from} - ${extra.date_to}`} href={route('tickets.index', { date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={CheckCircle} label="Tickets Resueltos" value={extra.resolved_in_period} color="green" subtitle={`En el período ${extra.date_from} - ${extra.date_to}`} href={route('tickets.index', { status: 'resuelto,cerrado', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={Circle} label="Tickets Activos" value={extra.dept_active_tickets.total} color="orange" subtitle="Todos los tickets sin resolver" href={route('tickets.index', { status: 'abierto,en_proceso,pendiente_informacion' })} />
                <KpiCard icon={Users} label="Empleados con Tickets Activos" value={extra.employees_with_active} color="blue" subtitle="Número de empleados con tickets sin resolver" href={route('tickets.index', { sort: 'creator', dir: 'asc', status: 'abierto,en_proceso,pendiente_informacion' })} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
                <div className="rounded-lg border border-gris-borde bg-white p-5 min-w-0 max-w-md">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Empleados con Mayor Demanda de Soporte</h3>
                    {extra.top_employees?.length > 0 ? (
                        <SimpleDonutChart data={extra.top_employees} onPieClick={(entry) => router.visit(route('tickets.index', { creator: entry.id, date_from: extra.date_from, date_to: extra.date_to }))} />
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                    )}
                </div>

                <div className="rounded-lg border border-gris-borde bg-white min-w-0">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                        <Ticket className="h-4 w-4 text-azul-institucional" />
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tickets Activos del Departamento</h3>
                    </div>
                    {extra.dept_active_tickets.data?.length > 0 ? (
                        <div className="grid grid-rows-[1fr_auto] h-[340px]">
                        <div className="overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-white">
                                    <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Título</th>
                                        <th className="px-4 py-3 font-medium">Solicitante</th>
                                        <th className="px-4 py-3 font-medium">Estado</th>
                                        <th className="px-4 py-3 font-medium">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gris-borde">
                                    {extra.dept_active_tickets.data.map(t => (
                                        <tr key={t.id} onClick={() => router.visit(route('tickets.show', t.id))} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                            <td className="px-4 py-3 text-gray-900 max-w-[180px] truncate">{t.title}</td>
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.creator_name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge variant={statusBadgeMap[t.status] || 'default'}>{t.status_label}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{t.entry_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                            <div className="px-4 py-3 border-t border-gris-borde">
                                <Pagination
                                    links={extra.dept_active_tickets.links}
                                    total={extra.dept_active_tickets.total}
                                    perPage={extra.dept_active_tickets.per_page || 5}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">No hay tickets activos en tu departamento.</p>
                    )}
                </div>
            </div>

        </div>
    );
}

const progressSteps = [
    { key: 'abierto', label: 'Abierto' },
    { key: 'en_proceso', label: 'En Proceso' },
    { key: 'pendiente_informacion', label: 'Pendiente de Info' },
];

function ProgressBar({ currentStatus }) {
    const currentIdx = progressSteps.findIndex(s => s.key === currentStatus);
    return (
        <div className="flex items-center gap-0 w-full mt-1">
            {progressSteps.map((step, i) => {
                const filled = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${
                                filled
                                    ? isCurrent
                                        ? 'bg-azul-institucional ring-2 ring-azul-institucional/30'
                                        : 'bg-azul-institucional'
                                    : 'bg-gray-200'
                            }`} />
                            <span className={`text-[10px] leading-tight ${
                                filled ? 'text-gray-700 font-medium' : 'text-gray-400'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {i < progressSteps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1.5 ${
                                i < currentIdx ? 'bg-azul-institucional' : 'bg-gray-200'
                            }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function SolicitanteDashboard({ extra }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <Link href={route('tickets.create')}>
                    <Button size="lg" className="px-8 py-6 text-base gap-3 shadow-md hover:shadow-lg transition-shadow">
                        <Plus className="h-6 w-6" />
                        Crear Nuevo Reporte de Incidencia
                    </Button>
                </Link>
            </div>

            {extra.my_active_tickets.data?.length > 0 ? (
                <div className="rounded-lg border border-gris-borde bg-white">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                        <Ticket className="h-4 w-4 text-azul-institucional" />
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Mis Tickets en Curso</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-medium">Código</th>
                                    <th className="px-4 py-3 font-medium">Título</th>
                                    <th className="px-4 py-3 font-medium hidden md:table-cell">Categoría</th>
                                    <th className="px-4 py-3 font-medium">Prioridad</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                    <th className="px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {extra.my_active_tickets.data.map(t => (
                                    <tr key={t.id} onClick={() => router.visit(route('tickets.show', t.id))} className="hover:bg-gris-fondo transition-colors cursor-pointer">
                                        <td className="px-4 py-3 font-mono text-xs text-azul-institucional">{t.code}</td>
                                        <td className="px-4 py-3 text-gray-900 max-w-[180px] truncate">{t.title}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{t.category || '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={priorityBadgeMap[t.priority] || 'default'}>{priorityLabels[t.priority] || t.priority}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={statusBadgeMap[t.status] || 'default'}>{t.status_label}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{t.entry_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {extra.my_active_tickets.links && extra.my_active_tickets.links.length > 3 && (
                        <div className="px-4 py-3 border-t border-gris-borde">
                            <Pagination
                                links={extra.my_active_tickets.links}
                                total={extra.my_active_tickets.total}
                                perPage={extra.my_active_tickets.per_page || 5}
                            />
                        </div>
                    )}
                </div>
            ) : null}

            {extra.my_history_tickets.data?.length > 0 ? (
                <div className="rounded-lg border border-gris-borde bg-white">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                        <CheckCircle className="h-4 w-4 text-verde-exito" />
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Historial de Tickets</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-medium">Código</th>
                                    <th className="px-4 py-3 font-medium">Título</th>
                                    <th className="px-4 py-3 font-medium hidden md:table-cell">Asignado</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                    <th className="px-4 py-3 font-medium hidden md:table-cell">Resolución</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {extra.my_history_tickets.data.map(t => (
                                    <tr key={t.id} onClick={() => router.visit(route('tickets.show', t.id))} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                        <td className="px-4 py-3 font-mono text-xs text-azul-institucional">{t.code}</td>
                                        <td className="px-4 py-3 text-gray-900 max-w-[180px] truncate">{t.title}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{t.assigned_name || '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={statusBadgeMap[t.status] || 'default'}>{t.status_label}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{t.exit_date || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {extra.my_history_tickets.links && extra.my_history_tickets.links.length > 3 && (
                        <div className="px-4 py-3 border-t border-gris-borde">
                            <Pagination
                                links={extra.my_history_tickets.links}
                                total={extra.my_history_tickets.total}
                                perPage={extra.my_history_tickets.per_page || 5}
                            />
                        </div>
                    )}
                </div>
            ) : null}

            {(!extra.my_active_tickets.data?.length && !extra.my_history_tickets.data?.length) && (
                <div className="rounded-lg border border-gris-borde bg-white p-12 text-center text-gray-500">
                    <CheckCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No tienes tickets</p>
                    <p className="text-sm mt-1">Si tienes un problema técnico, crea un nuevo reporte de incidencia.</p>
                </div>
            )}

        </div>
    );
}

export default function Dashboard({ stats, unreadNotifications }) {
    const { kpis, role, date_from, date_to } = stats;
    const [from, setFrom] = useState(date_from || '');
    const [to, setTo] = useState(date_to || '');

    function applyDates() {
        router.get(route('dashboard'), { date_from: from, date_to: to }, { preserveState: true, replace: true });
    }

    function clearDates() {
        setFrom('');
        setTo('');
        router.get(route('dashboard'), {}, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <LayoutDashboard className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Dashboard</h2>
                </div>
            }
            actions={!stats.is_solicitante && (
                <>
                    {stats.is_admin_dept && (
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
                    )}
                    <Link href={route('tickets.create')}>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Nuevo Ticket
                        </Button>
                    </Link>
                </>
            )}
        >
            <Head title="Dashboard" />

            {stats.is_superadmin ? (
                <SuperAdminDashboard
                    kpis={kpis}
                    extra={{ ...stats, unreadNotifications }}
                />
            ) : stats.is_admin_tickets ? (
                <AdminTicketsDashboard
                    extra={{ ...stats, unreadNotifications }}
                />
            ) : stats.is_admin_dept ? (
                <AdminDeptDashboard
                    extra={{ ...stats, unreadNotifications }}
                />
            ) : stats.is_tecnico ? (
                <TecnicoDashboard
                    extra={{ ...stats, unreadNotifications }}
                />
            ) : stats.is_solicitante ? (
                <SolicitanteDashboard
                    extra={{ ...stats, unreadNotifications }}
                />
            ) : (
                <RoleDashboard
                    kpis={kpis}
                    role={role}
                    unreadNotifications={unreadNotifications}
                    userDepartment={stats.user_department}
                />
            )}
        </AuthenticatedLayout>
    );
}