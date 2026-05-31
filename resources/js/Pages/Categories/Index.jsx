import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import Pagination from '@/Components/Pagination';

export default function Index({ categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e) {
        e.preventDefault();
        const params = { ...filters, search };
        const clean = {};
        Object.entries(params).forEach(([k, v]) => { if (v) clean[k] = v; });
        router.get(route('categories.index'), clean, { preserveState: true, replace: true });
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar esta categoría?')) {
            router.delete(route('categories.destroy', id));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Categorías</h2>
                    <Link href={route('categories.create')}>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Nueva Categoría
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Categorías" />

            <div className="max-w-3xl space-y-4">
                <div className="rounded-lg border border-gris-borde bg-white p-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Buscar por nombre de categoría..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="sm">Buscar</Button>
                        {filters.search && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); router.get(route('categories.index')); }}>
                                Limpiar
                            </Button>
                        )}
                    </form>
                </div>

                <div className="rounded-lg border border-gris-borde bg-white">
                    {categories.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <p className="text-lg font-medium">No hay categorías</p>
                            <p className="text-sm mt-1">Crea la primera categoría para comenzar.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            {categories.data.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                                        {cat.description && (
                                            <p className="text-xs text-gray-500">{cat.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link href={route('categories.edit', cat.id)}>
                                            <Button variant="ghost" size="sm">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Pagination
                    links={categories.links}
                    perPage={filters.per_page || 10}
                    total={categories.total}
                    onPerPageChange={(val) => {
                        router.get(route('categories.index'), { ...filters, per_page: val }, { preserveState: true, replace: true });
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
}
