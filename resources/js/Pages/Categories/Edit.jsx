import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { showValidationErrors } from '@/lib/sweet-alert';

export default function Edit({ category }) {
    const [form, setForm] = useState({
        name: category.name || '',
        description: category.description || '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.put(route('categories.update', category.id), form, {
            onError: (err) => { setErrors(err); showValidationErrors(err); setProcessing(false); },
            onSuccess: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-900">Editar Categoría</h2>}
        >
            <Head title="Editar Categoría" />

            <div className="max-w-xl">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit(route('categories.index'))}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
