import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, FolderTree, TrendingUp, CircleOff, Ticket } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { showValidationErrors, confirmAction } from '@/lib/sweet-alert';
import Pagination from '@/Components/Pagination';

function CategoryModal({ mode, category, onClose }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        name: isEdit ? (category?.name || '') : '',
        description: isEdit ? (category?.description || '') : '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        if (isEdit) {
            router.put(route('categories.update', category.id), form, {
                onError: (err) => { setErrors(err); showValidationErrors(err); setProcessing(false); },
                onSuccess: () => { setProcessing(false); onClose(); router.reload(); },
            });
        } else {
            router.post(route('categories.store'), form, {
                onError: (err) => { setErrors(err); showValidationErrors(err); setProcessing(false); },
                onSuccess: () => { setProcessing(false); onClose(); router.reload(); },
            });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="cat_name">Nombre</Label>
                        <Input id="cat_name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="cat_description">Descripción</Label>
                        <textarea
                            id="cat_description"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="mt-1 flex min-h-20 w-full rounded-md border border-gris-borde bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azul-institucional"
                            placeholder="Contexto para el técnico..."
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar Cambios' : 'Crear Categoría')}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Index({ categories, filters, totalCount, unusedCount, mostUsedName, mostUsedCount }) {
    const [search, setSearch] = useState(filters.search || '');
    const [modal, setModal] = useState(null);

    function handleSearch(e) {
        e.preventDefault();
        const params = { ...filters, search };
        const clean = {};
        Object.entries(params).forEach(([k, v]) => { if (v) clean[k] = v; });
        router.get(route('categories.index'), clean, { preserveState: true, replace: true });
    }

    async function handleDelete(id) {
        const result = await confirmAction({
            title: '¿Eliminar esta categoría?',
            confirmText: 'Eliminar',
        });
        if (result.isConfirmed) {
            router.delete(route('categories.destroy', id));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <FolderTree className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Categorías</h2>
                </div>
            }
            actions={
                <Button size="sm" onClick={() => setModal('create')}>
                    <Plus className="h-4 w-4" />
                    Nueva Categoría
                </Button>
            }
        >
            <Head title="Categorías" />

            {modal && (
                <CategoryModal
                    mode={modal === 'create' ? 'create' : 'edit'}
                    category={modal !== 'create' ? modal : null}
                    onClose={() => setModal(null)}
                />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border border-gris-borde border-l-4 border-l-azul-institucional bg-white p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total categorías</p>
                        <FolderTree className="h-5 w-5 text-azul-institucional" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{totalCount}</p>
                    <p className="mt-0.5 text-xs text-gray-400 leading-tight">Categorías registradas en el sistema</p>
                </div>
                <div className="rounded-lg border border-gris-borde border-l-4 border-l-verde-exito bg-white p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Más usada</p>
                        <TrendingUp className="h-5 w-5 text-verde-exito" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-900 truncate">{mostUsedName ?? '—'}</p>
                    <p className="mt-0.5 text-xs text-gray-400 leading-tight">{mostUsedCount > 0 ? `${mostUsedCount} tickets` : 'Sin datos'}</p>
                </div>
                <div className="rounded-lg border border-gris-borde border-l-4 border-l-gray-400 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sin uso</p>
                        <CircleOff className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{unusedCount}</p>
                    <p className="mt-0.5 text-xs text-gray-400 leading-tight">Categorías sin tickets asociados</p>
                </div>
            </div>

            <div className="space-y-4">
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
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                                        {cat.description && (
                                            <p className="text-xs text-gray-500 truncate">{cat.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default" className="text-xs gap-1">
                                                <Ticket className="h-3 w-3" />
                                                {cat.tickets_count}
                                            </Badge>
                                            {cat.active_tickets_count > 0 ? (
                                                <Badge variant="warning" className="text-xs">
                                                    {cat.active_tickets_count} activos
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">
                                                    0 activos
                                                </Badge>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setModal(cat)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
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
