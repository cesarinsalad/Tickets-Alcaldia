import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Monitor, ChevronUp, ChevronDown, AlertTriangle, Cpu, HardDrive, Building2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';

export default function Index({ equipment, filters, totalCount, highRecurrenceCount, bajaRamCount, hddCount }) {
    const { auth } = usePage().props;
    const sort = filters?.sort || '';
    const dir = filters?.dir || '';

    function handleSort(col) {
        const newDir = sort === col && dir === 'asc' ? 'desc' : 'asc';
        router.get(route('equipments.index'), {
            sort: col,
            dir: newDir,
            search: filters?.search || undefined,
            recurrence: filters?.recurrence || undefined,
            ram_lt: filters?.ram_lt || undefined,
            disk_hdd: filters?.disk_hdd || undefined,
        }, { preserveState: true, replace: true });
    }

    function SortIcon({ col }) {
        if (sort !== col) return null;
        return dir === 'asc'
            ? <ChevronUp className="h-3 w-3 inline ml-1" />
            : <ChevronDown className="h-3 w-3 inline ml-1" />;
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <Monitor className="h-6 w-6 text-azul-institucional shrink-0" />
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 truncate">Inventario de Equipos</h2>
                    </div>
                </div>
            }
        >
            <Head title="Inventario de Equipos" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                        const search = filters?.search || undefined;
                        if (filters?.recurrence) {
                            router.get(route('equipments.index'), { search }, { preserveState: true, replace: true });
                        } else {
                            router.get(route('equipments.index'), { search, recurrence: 1 }, { preserveState: true, replace: true });
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
                <button
                    onClick={() => {
                        const search = filters?.search || undefined;
                        if (filters?.ram_lt) {
                            router.get(route('equipments.index'), { search }, { preserveState: true, replace: true });
                        } else {
                            router.get(route('equipments.index'), { search, ram_lt: 1 }, { preserveState: true, replace: true });
                        }
                    }}
                    className="group text-left rounded-lg border border-gris-borde border-l-4 border-l-yellow-500 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Baja RAM</p>
                        <Cpu className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{bajaRamCount}</p>
                    <p className="mt-0.5 text-xs text-gray-400 leading-tight">Equipos con menos de 8GB de RAM</p>
                    <p className="mt-1 text-xs text-azul-institucional opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        {filters?.ram_lt ? 'Quitar filtro →' : 'Ver más →'}
                    </p>
                </button>
                <button
                    onClick={() => {
                        const search = filters?.search || undefined;
                        if (filters?.disk_hdd) {
                            router.get(route('equipments.index'), { search }, { preserveState: true, replace: true });
                        } else {
                            router.get(route('equipments.index'), { search, disk_hdd: 1 }, { preserveState: true, replace: true });
                        }
                    }}
                    className="group text-left rounded-lg border border-gris-borde border-l-4 border-l-amber-600 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Discos HDD</p>
                        <HardDrive className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{hddCount}</p>
                    <p className="mt-0.5 text-xs text-gray-400 leading-tight">Equipos con discos mecánicos</p>
                    <p className="mt-1 text-xs text-azul-institucional opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        {filters?.disk_hdd ? 'Quitar filtro →' : 'Ver más →'}
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
                                    ram_lt: filters?.ram_lt || undefined,
                                    disk_hdd: filters?.disk_hdd || undefined,
                                }, {
                                    preserveState: true,
                                    replace: true,
                                });
                            }
                        }}
                        className="pl-10 h-12 text-base"
                    />
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
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('sku')}>
                                        SKU <SortIcon col="sku" />
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('brand')}>
                                        Marca <SortIcon col="brand" />
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('model')}>
                                        Modelo <SortIcon col="model" />
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('processor')}>
                                        Procesador <SortIcon col="processor" />
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('ram_memory')}>
                                        RAM <SortIcon col="ram_memory" />
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('storage_disk')}>
                                        Disco <SortIcon col="storage_disk" />
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('department')}>
                                        Departamento <SortIcon col="department" />
                                    </th>
                                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('intervention_reports_count')}>
                                        Informes <SortIcon col="intervention_reports_count" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gris-borde">
                                {equipment.data.map(eq => (
                                    <tr
                                        key={eq.id}
                                        className="cursor-pointer hover:bg-gris-fondo transition-colors"
                                        onClick={() => router.visit(route('equipments.show', eq.id))}
                                    >
                                        <td className="px-5 py-3 font-mono text-xs text-azul-institucional font-medium">{eq.sku}</td>
                                        <td className="px-5 py-3 text-gray-900">{eq.brand || '—'}</td>
                                        <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{eq.model || '—'}</td>
                                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">{eq.processor || '—'}</td>
                                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">{eq.ram_memory || '—'}</td>
                                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">{eq.storage_disk || '—'}</td>
                                        <td className="px-5 py-3 text-gray-700">
                                            {eq.department?.name ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs">
                                                    <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate max-w-[180px]">{eq.department.name}</span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex items-center justify-center">
                                                <Badge variant={eq.intervention_reports_count > 0 ? 'default' : 'secondary'}>
                                                    {eq.intervention_reports_count}
                                                </Badge>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
