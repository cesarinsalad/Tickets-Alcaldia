import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import { showValidationErrors } from '@/lib/sweet-alert';
import { Users } from 'lucide-react';

export default function Edit({ user, departments, roles }) {
    const [values, setValues] = useState({
        name: user.name || '',
        last_name: user.last_name || '',
        position: user.position || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        department_id: user.department_id || '',
        role: user.roles?.[0]?.name || 'solicitante',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleChange(e) {
        setValues(v => ({ ...v, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.put(route('users.update', user.id), values, {
            onError: (err) => { setErrors(err); showValidationErrors(err); setProcessing(false); },
            onSuccess: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <Users className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Editar Usuario</h2>
                </div>
            }
        >
            <Head title="Editar Usuario" />

            <div className="">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" name="name" value={values.name} onChange={handleChange} className="mt-1" />
                                <InputError message={errors.name} />
                            </div>
                            <div>
                                <Label htmlFor="last_name">Apellido</Label>
                                <Input id="last_name" name="last_name" value={values.last_name} onChange={handleChange} className="mt-1" />
                                <InputError message={errors.last_name} />
                            </div>
                            <div>
                                <Label htmlFor="position">Cargo</Label>
                                <Input id="position" name="position" value={values.position} onChange={handleChange} className="mt-1" placeholder="Ej: Jefe de Servicios Públicos" />
                                <InputError message={errors.position} />
                            </div>
                            <div>
                                <Label htmlFor="phone_number">Teléfono</Label>
                                <Input id="phone_number" name="phone_number" value={values.phone_number} onChange={handleChange} className="mt-1" />
                                <InputError message={errors.phone_number} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" name="email" value={values.email} onChange={handleChange} className="mt-1" />
                            <InputError message={errors.email} />
                        </div>
                        <div>
                            <Label htmlFor="department_id">Departamento</Label>
                            <Select id="department_id" name="department_id" value={values.department_id} onChange={handleChange} className="mt-1">
                                <option value="">Seleccionar departamento</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </Select>
                            <InputError message={errors.department_id} />
                        </div>
                        <div>
                            <Label htmlFor="role">Rol</Label>
                            <Select id="role" name="role" value={values.role} onChange={handleChange} className="mt-1">
                                {Object.entries(roles).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </Select>
                            <InputError message={errors.role} />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit(route('users.index'))}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
