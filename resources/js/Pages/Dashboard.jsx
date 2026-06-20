import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Ticket, Clock, CheckCircle, AlertTriangle, Circle, Plus, TrendingUp, AlertOctagon, Building2, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import SimpleBarChart from '@/Components/SimpleBarChart';
import SimpleDonutChart from '@/Components/SimpleDonutChart';
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
    const crit = extra.critical_expired;
    const sort = extra.critical_sort || 'entry_date';
    const dir = extra.critical_dir || 'desc';

    function handleSort(col) {
        const newDir = sort === col && dir === 'asc' ? 'desc' : 'asc';
        router.get(route('dashboard'), {
            date_from: extra.date_from,
            date_to: extra.date_to,
            critical_sort: col,
            critical_dir: newDir,
            critical_page: 1,
        }, { preserveState: true, replace: true });
    }

    function SortIcon({ col }) {
        if (sort !== col) return null;
        return dir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />;
    }

    function SortHeader({ col, children }) {
        return (
            <th className="px-5 py-3 font-medium cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort(col)}>
                {children}
                <SortIcon col={col} />
            </th>
        );
    }
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={Ticket} label="Tickets Activos y En Proceso" value={extra.active_tickets} color="blue" subtitle="Tickets sin resolver en el período elegido" href={route('tickets.index', { status: 'abierto,en_proceso', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={CheckCircle} label="Tickets Resueltos y Cerrados" value={extra.resolved_this_month} color="green" subtitle="Tickets resueltos en el período elegido" href={route('tickets.index', { status: 'resuelto,cerrado', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={TrendingUp} label="Cumplimiento de tiempos" value={extra.sla_pct != null ? `${extra.sla_pct}%` : '—'} color="orange" subtitle="Tickets resueltos dentro del plazo establecido" href={route('tickets.index', { sla: 'missed', status: 'resuelto,cerrado', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={AlertOctagon} label="Técnicos con Tickets Vencidos" value={extra.technicians_overdue} color="red" subtitle="Cantidad de técnicos con tickets vencidos" href={route('tickets.index', { overdue: 1, date_from: extra.date_from, date_to: extra.date_to })} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Top 5 Departamentos con Más Solicitudes</h3>
                    {extra.top_departments.length > 0 ? (
                        <SimpleBarChart data={extra.top_departments} onBarClick={(entry) => router.visit(route('tickets.index', { department: entry.id, date_from: extra.date_from, date_to: extra.date_to }))} />
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                    )}
                </div>
                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Distribución por Categoría</h3>
                    {extra.category_distribution.length > 0 ? (
                        <SimpleDonutChart data={extra.category_distribution} onPieClick={(entry) => router.visit(route('tickets.index', { category: entry.id, date_from: extra.date_from, date_to: extra.date_to }))} />
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-gris-borde bg-white">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                    <Ticket className="h-4 w-4 text-azul-institucional" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Bandeja de Entrada</h3>
                </div>
                {extra.new_tickets?.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-5 py-3 font-medium">Código</th>
                                    <th className="px-5 py-3 font-medium">Título</th>
                                    <th className="px-5 py-3 font-medium">Solicitante</th>
                                    <th className="px-5 py-3 font-medium">Prioridad</th>
                                    <th className="px-5 py-3 font-medium">Categoría</th>
                                    <th className="px-5 py-3 font-medium">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {extra.new_tickets.data.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{t.code}</td>
                                        <td className="px-5 py-3 text-gray-900 max-w-[200px] truncate">{t.title}</td>
                                        <td className="px-5 py-3 text-gray-600">{t.creator_name}</td>
                                        <td className="px-5 py-3">
                                            <Badge variant={priorityBadgeMap[t.priority] || 'default'}>{t.priority_label}</Badge>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{t.category || '—'}</td>
                                        <td className="px-5 py-3">
                                            <Link href={route('tickets.show', t.id)}>
                                                <Button variant="outline" size="sm">
                                                    Asignar
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {extra.new_tickets.links && extra.new_tickets.links.length > 3 && (
                            <div className="px-5 py-3 border-t border-gris-borde">
                                <Pagination
                                    links={extra.new_tickets.links}
                                    total={extra.new_tickets.total}
                                    perPage={extra.new_tickets.per_page || 10}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No hay tickets nuevos pendientes de asignación.</p>
                )}
            </div>

            <div className="rounded-lg border border-gris-borde bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Carga de Trabajo del Equipo</h3>
                {extra.technician_workload?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 font-medium">Técnico</th>
                                    <th className="px-4 py-3 font-medium text-center">Tickets Activos</th>
                                    <th className="px-4 py-3 font-medium">Desglose de Tickets Activos</th>
                                    <th className="px-4 py-3 font-medium text-center">Tickets Cerrados ({extra.date_from} - {extra.date_to})</th>
                                    <th className="px-4 py-3 font-medium">Ver Tickets</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {extra.technician_workload.map(t => (
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
                                                    onClick={() => router.visit(route('tickets.index', { assigned: t.id, status: 'resuelto,cerrado', date_from: extra.date_from, date_to: extra.date_to }))}
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

            {crit.data?.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-white">
                    <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-red-100 bg-red-50/50">
                        <div className="flex items-center gap-2">
                            <AlertOctagon className="h-4 w-4 text-red-600" />
                            <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wide">Tickets Críticos / Vencidos</h3>
                        </div>
                        <Link href={route('tickets.index', { critical_overdue: 1, date_from: extra.date_from, date_to: extra.date_to })}>
                            <Button variant="ghost" size="sm" className="text-red-700 hover:text-red-900 hover:bg-red-100">
                                Ver todos
                                <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <SortHeader col="code">Código</SortHeader>
                                    <SortHeader col="title">Título</SortHeader>
                                    <SortHeader col="priority">Prioridad</SortHeader>
                                    <SortHeader col="status">Estado</SortHeader>
                                    <SortHeader col="department">Departamento</SortHeader>
                                    <SortHeader col="assigned">Asignado</SortHeader>
                                    <SortHeader col="sla_resolution_deadline">Vencimiento</SortHeader>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {crit.data.map(t => (
                                    <tr key={t.id} onClick={() => router.visit(route('tickets.show', t.id))} className="hover:bg-red-50/30 transition-colors cursor-pointer">
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-azul-institucional">{t.code}</span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-900 max-w-[200px] truncate">{t.title}</td>
                                        <td className="px-5 py-3">
                                            <Badge variant={priorityBadgeMap[t.priority] || 'default'}>{t.priority_label}</Badge>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{statusLabels[t.status] || t.status}</td>
                                        <td className="px-5 py-3 text-gray-600">{t.department || '—'}</td>
                                        <td className="px-5 py-3 text-gray-600">{t.assigned || '—'}</td>
                                        <td className="px-5 py-3"><RelativeTime deadline={t.sla_deadline_raw} entryDate={t.entry_date_raw} compact /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {crit.links && crit.links.length > 3 && (
                        <div className="px-5 py-3 border-t border-gris-borde">
                            <Pagination
                                links={crit.links}
                                total={crit.total}
                                perPage={crit.per_page || 10}
                            />
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}

function AdminTicketsDashboard({ extra }) {
    const crit = extra.critical_expired;
    const sort = extra.critical_sort || 'entry_date';
    const dir = extra.critical_dir || 'desc';

    function handleSort(col) {
        const newDir = sort === col && dir === 'asc' ? 'desc' : 'asc';
        router.get(route('dashboard'), {
            date_from: extra.date_from,
            date_to: extra.date_to,
            critical_sort: col,
            critical_dir: newDir,
            critical_page: 1,
        }, { preserveState: true, replace: true });
    }

    function SortIcon({ col }) {
        if (sort !== col) return null;
        return dir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />;
    }

    function SortHeader({ col, children, className = '' }) {
        return (
            <th className={`px-5 py-3 font-medium cursor-pointer select-none hover:text-gray-700 ${className}`} onClick={() => handleSort(col)}>
                {children}
                <SortIcon col={col} />
            </th>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard icon={Ticket} label="Activos" value={extra.active_tickets} color="blue" subtitle="Tickets sin resolver en el período elegido" href={route('tickets.index', { status: 'abierto,en_proceso', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={CheckCircle} label="Tickets Resueltos y Cerrados" value={extra.resolved_this_month} color="green" subtitle="Tickets resueltos en el período elegido" href={route('tickets.index', { status: 'resuelto,cerrado', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={TrendingUp} label="Cumplimiento de tiempos" value={extra.sla_pct != null ? `${extra.sla_pct}%` : '—'} color="orange" subtitle="Tickets resueltos dentro del plazo establecido" href={route('tickets.index', { sla: 'missed', status: 'resuelto,cerrado', date_from: extra.date_from, date_to: extra.date_to })} />
                <KpiCard icon={AlertOctagon} label="Técnicos con Tickets Vencidos" value={extra.technicians_overdue} color="red" subtitle="Cantidad de técnicos con tickets vencidos" href={route('tickets.index', { overdue: 1, date_from: extra.date_from, date_to: extra.date_to })} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Top 5 Departamentos con Más Solicitudes</h3>
                    {extra.top_departments?.length > 0 ? (
                        <SimpleBarChart data={extra.top_departments} onBarClick={(entry) => router.visit(route('tickets.index', { department: entry.id, date_from: extra.date_from, date_to: extra.date_to }))} />
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                    )}
                </div>
                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Distribución por Categoría</h3>
                    {extra.category_distribution?.length > 0 ? (
                        <SimpleDonutChart data={extra.category_distribution} onPieClick={(entry) => router.visit(route('tickets.index', { category: entry.id, date_from: extra.date_from, date_to: extra.date_to }))} />
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-gris-borde bg-white">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                    <Ticket className="h-4 w-4 text-azul-institucional" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Bandeja de Entrada</h3>
                </div>
                {extra.new_tickets.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-5 py-3 font-medium">Código</th>
                                    <th className="px-5 py-3 font-medium">Título</th>
                                    <th className="px-5 py-3 font-medium">Solicitante</th>
                                    <th className="px-5 py-3 font-medium">Prioridad</th>
                                    <th className="px-5 py-3 font-medium">Categoría</th>
                                    <th className="px-5 py-3 font-medium">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {extra.new_tickets.data.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{t.code}</td>
                                        <td className="px-5 py-3 text-gray-900 max-w-[200px] truncate">{t.title}</td>
                                        <td className="px-5 py-3 text-gray-600">{t.creator_name}</td>
                                        <td className="px-5 py-3">
                                            <Badge variant={priorityBadgeMap[t.priority] || 'default'}>{t.priority_label}</Badge>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{t.category || '—'}</td>
                                        <td className="px-5 py-3">
                                            <Link href={route('tickets.show', t.id)}>
                                                <Button variant="outline" size="sm">
                                                    Asignar
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {extra.new_tickets.links && extra.new_tickets.links.length > 3 && (
                            <div className="px-5 py-3 border-t border-gris-borde">
                                <Pagination
                                    links={extra.new_tickets.links}
                                    total={extra.new_tickets.total}
                                    perPage={extra.new_tickets.per_page || 10}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No hay tickets nuevos pendientes de asignación.</p>
                )}
            </div>

                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Carga de Trabajo del Equipo</h3>
                    {extra.technician_workload?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Técnico</th>
                                        <th className="px-4 py-3 font-medium text-center">Tickets Asignados</th>
                                        <th className="px-4 py-3 font-medium">Desglose de Tickets Asignados</th>
                                        <th className="px-4 py-3 font-medium text-center">Tickets Resueltos ({extra.date_from} - {extra.date_to})</th>
                                        <th className="px-4 py-3 font-medium">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gris-borde">
                                    {extra.technician_workload.map(t => (
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
                                                        onClick={() => router.visit(route('tickets.index', { assigned: t.id, status: 'resuelto,cerrado', date_from: extra.date_from, date_to: extra.date_to }))}
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

                {crit?.data?.length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-white">
                        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-red-100 bg-red-50/50">
                            <div className="flex items-center gap-2">
                                <AlertOctagon className="h-4 w-4 text-red-600" />
                                <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wide">Tickets Críticos / Vencidos</h3>
                            </div>
                            <Link href={route('tickets.index', { critical_overdue: 1, date_from: extra.date_from, date_to: extra.date_to })}>
                                <Button variant="ghost" size="sm" className="text-red-700 hover:text-red-900 hover:bg-red-100">
                                    Ver todos
                                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                        <SortHeader col="code">Código</SortHeader>
                                        <SortHeader col="title">Título</SortHeader>
                                        <SortHeader col="priority">Prioridad</SortHeader>
                                        <SortHeader col="status">Estado</SortHeader>
                                        <SortHeader col="department">Departamento</SortHeader>
                                        <SortHeader col="assigned">Asignado</SortHeader>
                                        <SortHeader col="sla_resolution_deadline">Vencimiento</SortHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gris-borde">
                                    {crit.data.map(t => (
                                        <tr key={t.id} onClick={() => router.visit(route('tickets.show', t.id))} className="hover:bg-red-50/30 transition-colors cursor-pointer">
                                            <td className="px-5 py-3">
                                                <span className="font-mono text-azul-institucional">{t.code}</span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-900 max-w-[200px] truncate">{t.title}</td>
                                            <td className="px-5 py-3">
                                                <Badge variant={priorityBadgeMap[t.priority] || 'default'}>{t.priority_label}</Badge>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">{statusLabels[t.status] || t.status}</td>
                                            <td className="px-5 py-3 text-gray-600">{t.department || '—'}</td>
                                            <td className="px-5 py-3 text-gray-600">{t.assigned || '—'}</td>
                                            <td className="px-5 py-3"><RelativeTime deadline={t.sla_deadline_raw} entryDate={t.entry_date_raw} compact /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {crit.links && crit.links.length > 3 && (
                            <div className="px-5 py-3 border-t border-gris-borde">
                                <Pagination
                                    links={crit.links}
                                    total={crit.total}
                                    perPage={crit.per_page || 10}
                                />
                            </div>
                        )}
                    </div>
                )}

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KpiCard icon={Clock} label="Tiempo ajustado" value={extra.sla_at_risk} color="yellow" subtitle="Tus tickets con menos del 30% restante" />
                <KpiCard icon={AlertTriangle} label="Vencidos" value={extra.sla_expired} color="red" subtitle="Tus tickets que superaron el plazo" href={route('tickets.index')} />
            </div>

            <div className="rounded-lg border border-gris-borde bg-white">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                    <Ticket className="h-4 w-4 text-azul-institucional" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Mi Cola de Trabajo</h3>
                </div>
                {extra.my_queue.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-5 py-3 font-medium">Código</th>
                                    <th className="px-5 py-3 font-medium">Título</th>
                                    <th className="px-5 py-3 font-medium">Solicitante</th>
                                    <th className="px-5 py-3 font-medium">Prioridad</th>
                                    <th className="px-5 py-3 font-medium">Estado</th>
                                    <th className="px-5 py-3 font-medium">Vencimiento</th>
                                    <th className="px-5 py-3 font-medium">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {extra.my_queue.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{t.code}</td>
                                        <td className="px-5 py-3 max-w-[180px]">
                                                <span className="text-gray-900 text-sm truncate block">{t.title}</span>
                                                <TimeProgressBar deadline={t.sla_deadline_raw} entryDate={t.entry_date_raw} />
                                            </td>
                                        <td className="px-5 py-3 text-gray-600">{t.creator_name}</td>
                                        <td className="px-5 py-3">
                                            <Badge variant={priorityBadgeMap[t.priority] || 'default'}>{t.priority_label}</Badge>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge variant={statusBadgeMap[t.status] || 'default'}>{t.status_label}</Badge>
                                        </td>
                                        <td className="px-5 py-3"><RelativeTime deadline={t.sla_deadline_raw} entryDate={t.entry_date_raw} compact /></td>
                                        <td className="px-5 py-3">
                                            <Link href={route('tickets.show', t.id)}>
                                                <Button variant="outline" size="sm">Transicionar</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No tienes tickets asignados.</p>
                )}
            </div>

            <div className="rounded-lg border border-gris-borde bg-white">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                    <CheckCircle className="h-4 w-4 text-verde-exito" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Cerrados Recientemente</h3>
                </div>
                {extra.recently_closed.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-5 py-3 font-medium">Código</th>
                                    <th className="px-5 py-3 font-medium">Título</th>
                                    <th className="px-5 py-3 font-medium">Prioridad</th>
                                    <th className="px-5 py-3 font-medium">Estado</th>
                                    <th className="px-5 py-3 font-medium">Fecha Resolución</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {extra.recently_closed.map(t => (
                                    <tr key={t.id} className="hover:bg-green-50/30 transition-colors">
                                        <td className="px-5 py-3">
                                            <Link href={route('tickets.show', t.id)} className="font-mono text-xs text-azul-institucional hover:underline">
                                                {t.code}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3 text-gray-900 max-w-[200px] truncate">{t.title}</td>
                                        <td className="px-5 py-3">
                                            <Badge variant={priorityBadgeMap[t.priority] || 'default'}>{t.priority_label}</Badge>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge variant="success">{t.status_label}</Badge>
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{t.exit_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No hay tickets cerrados recientemente.</p>
                )}
            </div>

        </div>
    );
}

function AdminDeptDashboard({ extra }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard icon={Ticket} label="Total Tickets del Equipo" value={extra.total_department_tickets} color="blue" subtitle="Creados por tu departamento" href={route('tickets.index')} />
                <KpiCard icon={Clock} label="Tiempo Promedio de Espera" value={extra.avg_wait_hours ? `${extra.avg_wait_hours}h` : '—'} color="orange" subtitle="Horas entre creación y cierre" />
                <KpiCard icon={CheckCircle} label="Tickets Activos" value={extra.dept_active_tickets.length} color="yellow" subtitle="Aún sin resolver en tu departamento" href={route('tickets.index')} />
            </div>

            <div className="rounded-lg border border-gris-borde bg-white">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gris-borde bg-gray-50/50">
                    <Ticket className="h-4 w-4 text-azul-institucional" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tickets Activos del Departamento</h3>
                </div>
                {extra.dept_active_tickets.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-5 py-3 font-medium">Código</th>
                                    <th className="px-5 py-3 font-medium">Título</th>
                                    <th className="px-5 py-3 font-medium">Solicitante</th>
                                    <th className="px-5 py-3 font-medium">Estado</th>
                                    <th className="px-5 py-3 font-medium">Categoría</th>
                                    <th className="px-5 py-3 font-medium">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {extra.dept_active_tickets.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <Link href={route('tickets.show', t.id)} className="font-mono text-xs text-azul-institucional hover:underline">
                                                {t.code}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3 text-gray-900 max-w-[200px] truncate">{t.title}</td>
                                        <td className="px-5 py-3 text-gray-600">{t.creator_name}</td>
                                        <td className="px-5 py-3">
                                            <Badge variant={statusBadgeMap[t.status] || 'default'}>{t.status_label}</Badge>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{t.category || '—'}</td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{t.entry_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No hay tickets activos en tu departamento.</p>
                )}
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

            {extra.my_active_tickets.length > 0 && (
                <div className="rounded-lg border border-gris-borde bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Mis Tickets en Curso</h3>
                    <div className="space-y-4">
                        {extra.my_active_tickets.map(t => (
                            <Link
                                key={t.id}
                                href={route('tickets.show', t.id)}
                                className="block rounded-md border border-gris-borde p-4 hover:border-azul-institucional hover:shadow-sm transition-all"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-mono text-gray-400">{t.code}</span>
                                            <span className="text-xs text-gray-400">{t.category}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 mt-0.5">{t.title}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{t.entry_date}</span>
                                </div>
                                <ProgressBar currentStatus={t.status} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {extra.pending_receipt.length > 0 && (
                <div className="rounded-lg border border-verde-exito/30 bg-white">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-verde-exito/20 bg-green-50/50">
                        <CheckCircle className="h-4 w-4 text-verde-exito" />
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Constancias Pendientes</h3>
                    </div>
                    <div className="divide-y divide-gris-borde">
                        {extra.pending_receipt.map(t => (
                            <div key={t.id} className="flex items-center justify-between px-5 py-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-gray-400">{t.code}</span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-verde-exito" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mt-0.5">{t.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Resuelto por: {t.assigned_name || '—'} &middot; {t.exit_date}
                                    </p>
                                </div>
                                <a href={route('tickets.receipt', t.id)} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="shrink-0">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Generar Constancia
                                    </Button>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {extra.my_active_tickets.length === 0 && extra.pending_receipt.length === 0 && (
                <div className="rounded-lg border border-gris-borde bg-white p-12 text-center text-gray-500">
                    <CheckCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No tienes tickets activos</p>
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
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
                    <div className="flex items-center gap-2">
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
                        <Link href={route('tickets.create')}>
                            <Button size="sm">
                                <Plus className="h-4 w-4" />
                                Nuevo Ticket
                            </Button>
                        </Link>
                    </div>
                </div>
            }
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