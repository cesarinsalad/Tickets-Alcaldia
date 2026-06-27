import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Building, X, Building2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import { showValidationErrors, confirmAction } from '@/lib/sweet-alert';
import Pagination from '@/Components/Pagination';

function DepartmentModal({ mode, dept, availableAdmins, onClose }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        name: isEdit ? (dept?.name || '') : '',
        physical_address: isEdit ? (dept?.physical_address || '') : '',
        head_of_area_id: isEdit ? (dept?.head_of_area_id?.toString() || '') : '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        const payload = { ...form };
        if (!isEdit) delete payload.head_of_area_id;

        if (isEdit) {
            router.put(route('departments.update', dept.id), payload, {
                onError: (err) => { setErrors(err); showValidationErrors(err); setProcessing(false); },
                onSuccess: () => { setProcessing(false); onClose(); router.reload(); },
            });
        } else {
            router.post(route('departments.store'), payload, {
                onError: (err) => { setErrors(err); showValidationErrors(err); setProcessing(false); },
                onSuccess: () => { setProcessing(false); onClose(); router.reload(); },
            });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isEdit ? 'Editar Departamento' : 'Nuevo Departamento'}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="dept_name">Nombre</Label>
                        <Input id="dept_name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="dept_address">Dirección Física</Label>
                        <Input id="dept_address" value={form.physical_address} onChange={e => setForm(f => ({ ...f, physical_address: e.target.value }))} className="mt-1" />
                        <InputError message={errors.physical_address} />
                    </div>
                    {isEdit && (
                        <div>
                            <Label htmlFor="dept_head">Jefe de Área</Label>
                            <Select id="dept_head" value={form.head_of_area_id} onChange={e => setForm(f => ({ ...f, head_of_area_id: e.target.value }))} className="mt-1">
                                <option value="">Sin asignar</option>
                                {availableAdmins?.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name ?? u.name}</option>
                                ))}
                            </Select>
                            <InputError message={errors.head_of_area_id} />
                        </div>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar Cambios' : 'Crear Departamento')}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Index({ departments, filters, availableAdmins }) {
    const [search, setSearch] = useState(filters.search || '');
    const [modal, setModal] = useState(null);

    function handleSearch(e) {
        e.preventDefault();
        const params = { ...filters, search };
        const clean = {};
        Object.entries(params).forEach(([k, v]) => { if (v) clean[k] = v; });
        router.get(route('departments.index'), clean, { preserveState: true, replace: true });
    }

    async function handleDelete(id) {
        const result = await confirmAction({
            title: '¿Eliminar este departamento?',
            confirmText: 'Eliminar',
        });
        if (result.isConfirmed) {
            router.delete(route('departments.destroy', id));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <Building2 className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Departamentos</h2>
                </div>
            }
            actions={
                <Button size="sm" onClick={() => setModal('create')}>
                    <Plus className="h-4 w-4" />
                    Nuevo Departamento
                </Button>
            }
        >
            <Head title="Departamentos" />

            {modal && (
                <DepartmentModal
                    mode={modal === 'create' ? 'create' : 'edit'}
                    dept={modal !== 'create' ? modal : null}
                    availableAdmins={availableAdmins}
                    onClose={() => setModal(null)}
                />
            )}

            <div className="space-y-4">
                <div className="rounded-lg border border-gris-borde bg-white p-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Buscar por nombre de departamento..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="sm">Buscar</Button>
                        {filters.search && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); router.get(route('departments.index')); }}>
                                Limpiar
                            </Button>
                        )}
                    </form>
                </div>

                <div className="rounded-lg border border-gris-borde bg-white">
                    {departments.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Building className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No hay departamentos</p>
                            <p className="text-sm mt-1">Crea el primer departamento para comenzar.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            <div className="hidden sm:grid sm:grid-cols-5 gap-4 p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                <div className="col-span-2">Nombre</div>
                                <div>Jefe</div>
                                <div>Dirección</div>
                                <div>Acciones</div>
                            </div>
                            {departments.data.map(dept => (
                                <div key={dept.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 p-4 items-center hover:bg-gris-fondo">
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                                        <p className="text-xs text-gray-400">{dept.users_count} usuario(s)</p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {(dept.head_of_area?.full_name ?? dept.head_of_area?.name) || '—'}
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">
                                        {dept.physical_address || '—'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => setModal(dept)}>
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

                <Pagination
                    links={departments.links}
                    perPage={filters.per_page || 10}
                    total={departments.total}
                    onPerPageChange={(val) => {
                        router.get(route('departments.index'), { ...filters, per_page: val }, { preserveState: true, replace: true });
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
}
