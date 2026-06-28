import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { BarChart, BarChart3, FolderTree } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import SimpleBarChart from '@/Components/SimpleBarChart';
import SimpleDonutChart from '@/Components/SimpleDonutChart';

export default function Index({ topDepartments, categoryDistribution, dateFrom, dateTo }) {
    const [from, setFrom] = useState(dateFrom || '');
    const [to, setTo] = useState(dateTo || '');

    function applyDates() {
        router.get(route('metricas.index'), { date_from: from, date_to: to }, { preserveState: true, replace: true });
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
        </AuthenticatedLayout>
    );
}
