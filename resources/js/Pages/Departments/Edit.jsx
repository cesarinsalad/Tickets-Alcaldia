import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

export default function Edit({ department, availableAdmins }) {
    const [form, setForm] = useState({
        name: department.name || '',
        physical_address: department.physical_address || '',
        head_of_area_id: department.head_of_area_id?.toString() || '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.put(route('departments.update', department.id), form, {
            onError: (err) => { setErrors(err); setProcessing(false); },
            onSuccess: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-900">Editar Departamento</h2>}
        >
            <Head title="Editar Departamento" />

            <div className="max-w-xl">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
                            <InputError message={errors.name} />
                        </div>
                        <div>
                            <Label htmlFor="head_of_area_id">Jefe de Área</Label>
                            <Select id="head_of_area_id" value={form.head_of_area_id} onChange={e => setForm(f => ({ ...f, head_of_area_id: e.target.value }))} className="mt-1">
                                <option value="">Sin asignar</option>
                                {availableAdmins.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name ?? u.name}</option>
                                ))}
                            </Select>
                            <InputError message={errors.head_of_area_id} />
                        </div>
                        <div>
                            <Label htmlFor="physical_address">Dirección Física</Label>
                            <Input id="physical_address" value={form.physical_address} onChange={e => setForm(f => ({ ...f, physical_address: e.target.value }))} className="mt-1" />
                            <InputError message={errors.physical_address} />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
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
