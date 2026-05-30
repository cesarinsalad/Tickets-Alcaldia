import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

export default function Create({ departments, roles }) {
    const [values, setValues] = useState({
        name: '',
        last_name: '',
        email: '',
        phone_number: '',
        department_id: '',
        role: 'solicitante',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleChange(e) {
        setValues(v => ({ ...v, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.post(route('users.store'), values, {
            onError: (err) => { setErrors(err); setProcessing(false); },
            onSuccess: (page) => {
                setProcessing(false);
                if (page.props.flash?.new_password) {
                    alert('Usuario creado. Contraseña temporal: ' + page.props.flash.new_password);
                }
            },
        });
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-900">Nuevo Usuario</h2>}
        >
            <Head title="Nuevo Usuario" />

            <div className="max-w-xl">
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
                        </div>
                        <div>
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" name="email" value={values.email} onChange={handleChange} className="mt-1" />
                            <InputError message={errors.email} />
                        </div>
                        <div>
                            <Label htmlFor="phone_number">Teléfono</Label>
                            <Input id="phone_number" name="phone_number" value={values.phone_number} onChange={handleChange} className="mt-1" />
                            <InputError message={errors.phone_number} />
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
                                {processing ? 'Creando...' : 'Crear Usuario'}
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
