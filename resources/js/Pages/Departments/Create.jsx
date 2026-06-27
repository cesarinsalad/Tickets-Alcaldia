import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { showValidationErrors } from '@/lib/sweet-alert';

export default function Create() {
    const [form, setForm] = useState({ name: '', physical_address: '' });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.post(route('departments.store'), form, {
            onError: (err) => { setErrors(err); showValidationErrors(err); setProcessing(false); },
            onSuccess: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-900">Nuevo Departamento</h2>}
        >
            <Head title="Nuevo Departamento" />

            <div className="max-w-xl">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
                            <InputError message={errors.name} />
                        </div>
                        <div>
                            <Label htmlFor="physical_address">Dirección Física</Label>
                            <Input id="physical_address" value={form.physical_address} onChange={e => setForm(f => ({ ...f, physical_address: e.target.value }))} className="mt-1" />
                            <InputError message={errors.physical_address} />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creando...' : 'Crear Departamento'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit(route('departments.index'))}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
