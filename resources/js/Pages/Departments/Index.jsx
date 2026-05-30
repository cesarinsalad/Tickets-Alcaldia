import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Trash2, Building } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

export default function Index({ departments, availableAdmins }) {
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', physical_address: '', head_of_area_id: '' });
    const [errors, setErrors] = useState({});

    function startEdit(dept) {
        setEditingId(dept?.id || null);
        setForm({
            name: dept?.name || '',
            physical_address: dept?.physical_address || '',
            head_of_area_id: dept?.head_of_area_id?.toString() || '',
        });
        setErrors({});
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (editingId) {
            router.put(route('departments.update', editingId), form, {
                onError: setErrors,
                onSuccess: () => { setEditingId(null); setForm({ name: '', physical_address: '', head_of_area_id: '' }); },
            });
        } else {
            router.post(route('departments.store'), form, {
                onError: setErrors,
                onSuccess: () => setForm({ name: '', physical_address: '', head_of_area_id: '' }),
            });
        }
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar este departamento?')) {
            router.delete(route('departments.destroy', id));
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-900">Departamentos</h2>}
        >
            <Head title="Departamentos" />

            <div className="max-w-3xl space-y-6">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                        {editingId ? 'Editar Departamento' : 'Nuevo Departamento'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            {editingId && (
                                <div>
                                    <Label htmlFor="head_of_area_id">Jefe de Área (Administrador de Departamento)</Label>
                                    <Select id="head_of_area_id" value={form.head_of_area_id} onChange={e => setForm(f => ({ ...f, head_of_area_id: e.target.value }))} className="mt-1">
                                        <option value="">Sin asignar</option>
                                        {availableAdmins.map(u => (
                                            <option key={u.id} value={u.id}>{u.full_name ?? u.name}</option>
                                        ))}
                                    </Select>
                                    <InputError message={errors.head_of_area_id} />
                                </div>
                            )}
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
                    {departments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Building className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No hay departamentos</p>
                            <p className="text-sm mt-1">Crea el primer departamento para comenzar.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            {departments.map(dept => (
                                <div key={dept.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                                        <p className="text-xs text-gray-500">Jefe: {(dept.head_of_area?.full_name ?? dept.head_of_area?.name) || 'Sin asignar'}</p>
                                        {dept.physical_address && (
                                            <p className="text-xs text-gray-400">{dept.physical_address}</p>
                                        )}
                                        {dept.users_count !== undefined && (
                                            <p className="text-xs text-gray-400">{dept.users_count} usuario(s)</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => startEdit(dept)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
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
