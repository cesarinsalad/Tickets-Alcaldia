import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, MoreHorizontal, Shield, Check, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { useState } from 'react';

const roleLabels = {
    super_admin: 'Super Admin',
    admin_departamento: 'Admin Departamento',
    tecnico: 'Técnico',
    solicitante: 'Solicitante',
};

export default function Index({ users, departments }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Usuarios</h2>
                    <Link href={route('users.create')}>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Nuevo Usuario
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Usuarios" />

            <div className="rounded-lg border border-gris-borde bg-white">
                {users.data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Shield className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No hay usuarios</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gris-borde">
                        <div className="hidden sm:grid sm:grid-cols-6 gap-4 p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <div className="col-span-2">Usuario</div>
                            <div>Rol</div>
                            <div>Departamento</div>
                            <div>Estado</div>
                            <div>Acciones</div>
                        </div>
                        {users.data.map(user => (
                            <div key={user.id} className="grid grid-cols-1 sm:grid-cols-6 gap-2 sm:gap-4 p-4 items-center hover:bg-gris-fondo">
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-gray-900">{user.full_name ?? user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                    {user.phone_number && <p className="text-xs text-gray-400">{user.phone_number}</p>}
                                </div>
                                <div>
                                    {user.roles?.map(role => (
                                        <Badge key={role.id ?? role.name} variant="secondary" className="text-xs">
                                            {roleLabels[role.name] || role.name}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {user.department?.name || '—'}
                                </div>
                                <div>
                                    {user.is_active ? (
                                        <Badge variant="success" className="text-xs"><Check className="h-3 w-3" /> Activo</Badge>
                                    ) : (
                                        <Badge variant="danger" className="text-xs"><X className="h-3 w-3" /> Inactivo</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Link href={route('users.edit', user.id)}>
                                        <Button variant="ghost" size="sm">Editar</Button>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (confirm('¿Cambiar estado del usuario?')) {
                                                router.post(route('users.toggle', user.id), {}, {
                                                    preserveState: false,
                                                    replace: false,
                                                });
                                            }
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                                    >
                                        {user.is_active ? 'Desactivar' : 'Activar'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('¿Restablecer contraseña? Se generará una nueva.')) {
                                                router.post(route('users.reset-password', user.id), {}, {
                                                    onSuccess: (page) => {
                                                        alert('Nueva contraseña: ' + page.props.flash?.new_password);
                                                    }
                                                });
                                            }
                                        }}
                                        className="text-xs text-azul-institucional hover:underline px-2 py-1"
                                    >
                                        Resetear Contraseña
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {users.meta && users.meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {users.meta.links.map((link, i) => (
                        <button
                            key={i}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            disabled={!link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1 text-sm rounded-md border border-gris-borde ${
                                link.active
                                    ? 'bg-azul-institucional text-white border-azul-institucional'
                                    : link.url
                                    ? 'bg-white text-gray-700 hover:bg-gris-fondo'
                                    : 'text-gray-400 cursor-not-allowed'
                            }`}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
