import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Shield, Check, X, Trash2, Pencil, Key, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import Pagination from '@/Components/Pagination';
import { confirmAction, showPasswordAlert } from '@/lib/sweet-alert';

const roleLabels = {
    super_admin: 'Super Admin',
    admin_departamento: 'Admin Departamento',
    admin_tickets: 'Admin Tickets',
    tecnico: 'Técnico',
    solicitante: 'Solicitante',
};

export default function Index({ users, departments, roles, filters }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user;
    const isSuperAdmin = currentUser?.roles?.some(r => r.name === 'super_admin');
    const [search, setSearch] = useState(filters.search || '');

    function applyFilters(overrides = {}) {
        const params = { ...filters, ...overrides };
        const clean = {};
        Object.entries(params).forEach(([k, v]) => { if (v) clean[k] = v; });
        router.get(route('users.index'), clean, { preserveState: true, replace: true });
    }

    function handleSearch(e) {
        e.preventDefault();
        applyFilters({ search });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Usuarios</h2>
                    {isSuperAdmin && (
                        <Link href={route('users.create')}>
                            <Button size="sm">
                                <Plus className="h-4 w-4" />
                                Nuevo Usuario
                            </Button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Usuarios" />

            <div className="space-y-4">
                <div className="rounded-lg border border-gris-borde bg-white p-4">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Buscar por nombre, apellido o email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Select
                            className="w-full sm:w-40"
                            value={filters.role || ''}
                            onChange={e => applyFilters({ role: e.target.value })}
                        >
                            <option value="">Todos los roles</option>
                            {roles.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </Select>
                        <Select
                            className="w-full sm:w-44"
                            value={filters.department || ''}
                            onChange={e => applyFilters({ department: e.target.value })}
                        >
                            <option value="">Todos los departamentos</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </Select>
                        <Select
                            className="w-full sm:w-36"
                            value={filters.status || ''}
                            onChange={e => applyFilters({ status: e.target.value })}
                        >
                            <option value="">Todos los estados</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </Select>
                        {Object.keys(filters).some(k => k !== 'per_page' && filters[k]) && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => router.get(route('users.index'))}>
                                Limpiar filtros
                            </Button>
                        )}
                    </form>
                </div>

                <div className="rounded-lg border border-gris-borde bg-white">
                    {users.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Shield className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No se encontraron usuarios</p>
                            <p className="text-sm mt-1">Ajusta los filtros de búsqueda o crea un nuevo usuario.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            <div className="hidden sm:grid sm:grid-cols-7 gap-4 p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                <div className="col-span-2">Usuario</div>
                                <div>Cargo</div>
                                <div>Rol</div>
                                <div>Departamento</div>
                                <div>Estado</div>
                                <div>Acciones</div>
                            </div>
                            {users.data.map(user => (
                                <div key={user.id} className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-4 p-4 items-center hover:bg-gris-fondo">
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium text-gray-900">{user.full_name ?? user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        {user.phone_number && <p className="text-xs text-gray-400">{user.phone_number}</p>}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {user.position || '—'}
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
                                    <div className="flex items-center gap-0.5 justify-end">
                                        {isSuperAdmin && (
                                            <>
                                                <Link href={route('users.edit', user.id)}>
                                                    <Button variant="ghost" size="icon-sm" title="Editar">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                                <button
                                                    onClick={async () => {
                                                        const result = await confirmAction({
                                                            title: '¿Cambiar estado del usuario?',
                                                            text: user.is_active ? 'El usuario será desactivado.' : 'El usuario será activado.',
                                                            icon: 'question',
                                                            confirmText: 'Sí, cambiar',
                                                        });
                                                        if (result.isConfirmed) {
                                                            router.post(route('users.toggle', user.id), {}, {
                                                                preserveState: false,
                                                                replace: false,
                                                            });
                                                        }
                                                    }}
                                                    title={user.is_active ? 'Desactivar' : 'Activar'}
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    {user.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const result = await confirmAction({
                                                            title: '¿Restablecer contraseña?',
                                                            text: 'Se generará una nueva contraseña temporal para el usuario.',
                                                            icon: 'question',
                                                            confirmText: 'Sí, restablecer',
                                                        });
                                                        if (result.isConfirmed) {
                                                            router.post(route('users.reset-password', user.id), {}, {
                                                                onSuccess: (page) => {
                                                                    showPasswordAlert(page.props.flash?.new_password);
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    title="Restablecer contraseña"
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-azul-institucional hover:bg-blue-50 transition-colors"
                                                >
                                                    <Key className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const result = await confirmAction({
                                                            title: '¿Eliminar este usuario?',
                                                            text: 'Esta acción es permanente y no se puede deshacer.',
                                                            confirmText: 'Eliminar',
                                                        });
                                                        if (result.isConfirmed) {
                                                            router.delete(route('users.destroy', user.id), {
                                                                preserveState: false,
                                                                replace: false,
                                                            });
                                                        }
                                                    }}
                                                    title="Eliminar"
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Pagination
                    links={users.links}
                    perPage={filters.per_page || 10}
                    total={users.total}
                    onPerPageChange={(val) => applyFilters({ per_page: val })}
                />
            </div>
        </AuthenticatedLayout>
    );
}
