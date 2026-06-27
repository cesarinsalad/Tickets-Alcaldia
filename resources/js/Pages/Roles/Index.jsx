import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Plus, X, Shield, Ticket, Users, FileText, FolderTree, BookOpen, Monitor, Circle, ArrowLeft, Save, Building2, Clock, Key } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import { Select } from '@/Components/ui/select';
import { showValidationErrors, confirmAction } from '@/lib/sweet-alert';

const moduleMeta = {
    tickets:        { label: 'Tickets',    icon: Ticket },
    usuarios:       { label: 'Usuarios',   icon: Users },
    reportes:       { label: 'Reportes',   icon: FileText },
    categorias:     { label: 'Categorías', icon: FolderTree },
    departamentos:  { label: 'Departamentos', icon: Building2 },
    sla:            { label: 'SLA',             icon: Clock },
    knowledge:      { label: 'Base de Conocimiento', icon: BookOpen },
    equipos:        { label: 'Equipos',        icon: Monitor },
    roles:          { label: 'Roles',          icon: Key },
    otros:          { label: 'Sin módulo',     icon: Circle },
};

function ModuleCard({ moduleKey, label, icon: Icon, total, assigned, onClick }) {
    const allOn = assigned === total && total > 0;
    const none = assigned === 0;

    return (
        <button
            className={`rounded-lg border p-5 text-left transition-all hover:shadow-md ${
                allOn ? 'border-verde-exito bg-verde-exito-light' :
                none ? 'border-gris-borde bg-white' :
                'border-amber-400 bg-amber-50'
            }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-md bg-azul-institucional/10 text-azul-institucional">
                    <Icon className="h-5 w-5" />
                </div>
                <Badge variant={allOn ? 'success' : none ? 'secondary' : 'warning'}>
                    {assigned}/{total}
                </Badge>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
            <p className="text-xs text-gray-400 mt-1">{total} permiso{total !== 1 ? 's' : ''}</p>
        </button>
    );
}

function RoleModal({ onClose, roles, rolePerms }) {
    const [name, setName] = useState('');
    const [template, setTemplate] = useState(
        roles.filter(r => r.dashboard_template)[0]?.dashboard_template || '',
    );
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        const perms = Array.from(rolePerms[template] || []);
        router.post(route('roles.store'), { name, permissions: perms, dashboard_template: template }, {
            onError: (err) => { setErrors(err); showValidationErrors(err); setProcessing(false); },
            onSuccess: () => onClose(),
        });
    }

    const templatePreviewPerms = template ? (rolePerms[template]?.size || 0) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Nuevo Rol</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="role_name">Nombre del rol</Label>
                        <Input
                            id="role_name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej: editor_reportes"
                            className="mt-1"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="role_template">Plantilla (dashboard + permisos)</Label>
                        <select
                            id="role_template"
                            value={template}
                            onChange={e => setTemplate(e.target.value)}
                            className="mt-1 w-full rounded-md border border-gris-borde px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-azul-institucional focus:border-transparent"
                        >
                            {roles.filter(r => r.dashboard_template).map(r => (
                                <option key={r.id} value={r.dashboard_template}>{r.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            Heredará {templatePreviewPerms} permisos y el dashboard de este rol.
                        </p>
                        {errors.dashboard_template && <p className="text-xs text-red-600 mt-1">{errors.dashboard_template}</p>}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creando...' : 'Crear Rol'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Index({ roles, allPermissions }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [selectedRole, setSelectedRole] = useState(roles[0]?.name || '');
    const [selectedModule, setSelectedModule] = useState(null);
    const [rolePerms, setRolePerms] = useState(() => {
        const m = {};
        roles.forEach(r => { m[r.name] = new Set(r.permissions); });
        return m;
    });
    const [showModal, setShowModal] = useState(false);

    const groupedPermissions = useMemo(() => {
        const grouped = {};
        allPermissions.forEach(p => {
            const key = p.module || 'otros';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(p);
        });
        return grouped;
    }, [allPermissions]);

    const currentRole = roles.find(r => r.name === selectedRole);
    const currentPerms = rolePerms[selectedRole] || new Set();
    const baseRoles = ['super_admin', 'admin_tickets', 'admin_departamento', 'tecnico', 'solicitante'];

    function handleToggle(permName) {
        setRolePerms(prev => {
            const updated = new Set(prev[selectedRole]);
            if (updated.has(permName)) {
                updated.delete(permName);
            } else {
                updated.add(permName);
            }
            return { ...prev, [selectedRole]: updated };
        });
    }

    function handleSave() {
        const perms = Array.from(currentPerms);
        router.put(route('roles.update', currentRole.id), {
            name: currentRole.name,
            permissions: perms,
        });
    }

    async function handleDeleteRole(role) {
        const result = await confirmAction({
            title: `¿Eliminar el rol "${role.label}"?`,
            confirmText: 'Eliminar',
        });
        if (result.isConfirmed) {
            router.delete(route('roles.destroy', role.id));
        }
    }

    function handleChangeRole(name) {
        setSelectedRole(name);
        setSelectedModule(null);
    }

    const moduleList = Object.keys(groupedPermissions);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-azul-institucional" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Roles y Permisos</h2>
                            <p className="text-sm text-gray-500">Gestión de acceso por módulos</p>
                        </div>
                    </div>
                    <Button size="sm" onClick={() => setShowModal(true)}>
                        <Plus className="h-4 w-4" />
                        Nuevo Rol
                    </Button>
                </div>
            }
        >
            <Head title="Roles y Permisos" />

            {showModal && <RoleModal onClose={() => setShowModal(false)} roles={roles} rolePerms={rolePerms} />}

            <div className="mb-6">
                <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Seleccionar rol
                </Label>
                <Select
                    value={selectedRole}
                    onChange={e => handleChangeRole(e.target.value)}
                    className="w-full sm:w-64 border-2 border-gris-borde"
                >
                    {[...roles]
                        .sort((a, b) => a.label.localeCompare(b.label, 'es'))
                        .map(role => (
                            <option key={role.name} value={role.name}>{role.label}</option>
                        ))}
                </Select>
            </div>

            {selectedModule ? (
                <div className="rounded-lg border border-gris-borde bg-white p-6 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const Icon = moduleMeta[selectedModule]?.icon || Circle;
                                    return <Icon className="h-5 w-5 text-azul-institucional" />;
                                })()}
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {moduleMeta[selectedModule]?.label || selectedModule}
                                </h3>
                            </div>
                        </div>
                        <Badge variant="outline">{currentRole?.label}</Badge>
                    </div>

                    <div className="space-y-1">
                        {groupedPermissions[selectedModule]?.map(p => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-sm text-gray-700">{p.name}</span>
                                <Switch
                                    checked={currentPerms.has(p.name)}
                                    onCheckedChange={() => handleToggle(p.name)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-gris-borde">
                        <Button variant="outline" size="sm" onClick={() => setSelectedModule(null)}>
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moduleList.map(mkey => {
                        const meta = moduleMeta[mkey] || moduleMeta.otros;
                        const total = groupedPermissions[mkey].length;
                        const assigned = groupedPermissions[mkey].filter(p => currentPerms.has(p.name)).length;
                        return (
                            <ModuleCard
                                key={mkey}
                                moduleKey={mkey}
                                label={meta.label}
                                icon={meta.icon}
                                total={total}
                                assigned={assigned}
                                onClick={() => setSelectedModule(mkey)}
                            />
                        );
                    })}
                </div>
            )}

            <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Roles del sistema</h3>
                <div className="rounded-lg border border-gris-borde bg-white overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-fondo border-b border-gris-borde">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gris-borde">
                            {roles.map(role => (
                                <tr key={role.id} className="hover:bg-gris-fondo transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{role.label}</span>
                                            {baseRoles.includes(role.name) && (
                                                <Badge variant="secondary" className="text-[10px]">Base</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 text-xs">
                                        {role.permissions_count} permisos
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        {!baseRoles.includes(role.name) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleDeleteRole(role)}
                                            >
                                                Eliminar
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
