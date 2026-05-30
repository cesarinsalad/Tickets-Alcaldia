import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

export default function Index({ categories }) {
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [errors, setErrors] = useState({});

    function startEdit(cat) {
        setEditingId(cat?.id || null);
        setForm({ name: cat?.name || '', description: cat?.description || '' });
        setErrors({});
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (editingId) {
            router.put(route('categories.update', editingId), form, {
                onError: setErrors,
                onSuccess: () => { setEditingId(null); setForm({ name: '', estimated_hours: '' }); },
            });
        } else {
            router.post(route('categories.store'), form, {
                onError: setErrors,
                onSuccess: () => { setForm({ name: '', estimated_hours: '' }); },
            });
        }
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar esta categoría?')) {
            router.delete(route('categories.destroy', id));
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-900">Categorías</h2>}
        >
            <Head title="Categorías" />

            <div className="max-w-2xl space-y-6">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                        {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
                                <InputError message={errors.name} />
                            </div>
                            <div>
                                <Label htmlFor="description">Descripción</Label>
                                <textarea
                                    id="description"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="mt-1 flex min-h-20 w-full rounded-md border border-gris-borde bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azul-institucional"
                                    placeholder="Contexto para el técnico..."
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="submit" size="sm">
                                {editingId ? 'Actualizar' : 'Crear'}
                            </Button>
                            {editingId && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(null)}>
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="rounded-lg border border-gris-borde bg-white">
                    {categories.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No hay categorías configuradas.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                                        {cat.description && (
                                            <p className="text-xs text-gray-500">{cat.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>
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
            </div>
        </AuthenticatedLayout>
    );
}
