import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Building } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import Pagination from '@/Components/Pagination';

export default function Index({ departments, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e) {
        e.preventDefault();
        const params = { ...filters, search };
        const clean = {};
        Object.entries(params).forEach(([k, v]) => { if (v) clean[k] = v; });
        router.get(route('departments.index'), clean, { preserveState: true, replace: true });
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar este departamento?')) {
            router.delete(route('departments.destroy', id));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Departamentos</h2>
                    <Link href={route('departments.create')}>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Nuevo Departamento
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Departamentos" />

            <div className="space-y-4">
                <div className="rounded-lg border border-gris-borde bg-white p-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Buscar por nombre de departamento..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="sm">Buscar</Button>
                        {filters.search && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); router.get(route('departments.index')); }}>
                                Limpiar
                            </Button>
                        )}
                    </form>
                </div>

                <div className="rounded-lg border border-gris-borde bg-white">
                    {departments.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Building className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No hay departamentos</p>
                            <p className="text-sm mt-1">Crea el primer departamento para comenzar.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            <div className="hidden sm:grid sm:grid-cols-5 gap-4 p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                <div className="col-span-2">Nombre</div>
                                <div>Jefe</div>
                                <div>Dirección</div>
                                <div>Acciones</div>
                            </div>
                            {departments.data.map(dept => (
                                <div key={dept.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 p-4 items-center hover:bg-gris-fondo">
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                                        <p className="text-xs text-gray-400">{dept.users_count} usuario(s)</p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {(dept.head_of_area?.full_name ?? dept.head_of_area?.name) || '—'}
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">
                                        {dept.physical_address || '—'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link href={route('departments.edit', dept.id)}>
                                            <Button variant="ghost" size="sm">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Pagination
                    links={departments.links}
                    perPage={filters.per_page || 10}
                    total={departments.total}
                    onPerPageChange={(val) => {
                        router.get(route('departments.index'), { ...filters, per_page: val }, { preserveState: true, replace: true });
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
}
