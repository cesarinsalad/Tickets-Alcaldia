import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

const baseRoles = ['super_admin', 'admin_tickets', 'admin_departamento', 'tecnico', 'solicitante'];

function RoleModal({ onClose }) {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.post(route('roles.store'), { name, permissions: [] }, {
            onError: (err) => { setErrors(err); setProcessing(false); },
            onSuccess: () => { setProcessing(false); onClose(); },
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Nuevo Rol</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="role_name">Nombre del rol</Label>
                        <Input id="role_name" value={name} onChange={e => setName(e.target.value)} className="mt-1" placeholder="Ej: auditor" />
                        <InputError message={errors.name} />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Creando...' : 'Crear Rol'}</Button>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Index({ roles, allPermissions }) {
    const [showRoleModal, setShowRoleModal] = useState(false);

    const [matrix, setMatrix] = useState(() => {
        const m = {};
        roles.forEach(r => {
            m[r.name] = {};
            allPermissions.forEach(p => {
                m[r.name][p.name] = r.permissions.includes(p.name);
            });
        });
        return m;
    });

    function toggle(roleName, permName) {
        setMatrix(prev => ({
            ...prev,
            [roleName]: {
                ...prev[roleName],
                [permName]: !prev[roleName][permName],
            },
        }));
    }

    function handleSave() {
        const payload = {};
        Object.entries(matrix).forEach(([roleName, perms]) => {
            payload[roleName] = Object.entries(perms).filter(([, v]) => v).map(([k]) => k);
        });
        router.put(route('roles.permissions.sync'), { roles: payload });
    }

    function handleDeleteRole(role) {
        if (confirm(`¿Eliminar el rol "${role.label}"?`)) {
            router.delete(route('roles.destroy', role.id));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Roles y Permisos</h2>
                    <Button size="sm" onClick={() => setShowRoleModal(true)}>
                        <Plus className="h-4 w-4" />
                        Nuevo Rol
                    </Button>
                </div>
            }
        >
            <Head title="Roles y Permisos" />

            {showRoleModal && <RoleModal onClose={() => setShowRoleModal(false)} />}

            <div className="">
                <div className="rounded-lg border border-gris-borde bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gris-borde bg-gray-50">
                                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-48">
                                    Permiso \ Rol
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[100px]">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span>{role.label}</span>
                                            {role.is_base ? (
                                                <Badge variant="secondary" className="text-[10px] px-1">Base</Badge>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }}
                                                    className="text-xs text-gray-400 hover:text-red-500"
                                                    title="Eliminar rol"
                                                >
                                                    eliminar
                                                </button>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gris-borde">
                            {allPermissions.map(perm => (
                                <tr key={perm.id} className="hover:bg-gray-50/50">
                                    <td className="sticky left-0 bg-white px-4 py-2.5 text-sm font-medium text-gray-800">{perm.name}</td>
                                    {roles.map(role => (
                                        <td key={role.id} className="px-3 py-2.5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={matrix[role.name]?.[perm.name] || false}
                                                onChange={() => toggle(role.name, perm.name)}
                                                className="h-4 w-4 rounded border-gray-300 text-azul-institucional focus:ring-azul-institucional cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <Button onClick={handleSave}>
                        <RotateCcw className="h-4 w-4" />
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
