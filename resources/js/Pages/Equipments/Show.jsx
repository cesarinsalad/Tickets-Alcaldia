import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Monitor, Cpu, HardDrive, FileText, Barcode, Pencil, Save, X, Building2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { showValidationErrors } from '@/lib/sweet-alert';

export default function Show({ equipment, departments = [], canManageEquipment = false }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const reports = equipment.intervention_reports ?? [];

    const [editing, setEditing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        brand: equipment.brand || '',
        model: equipment.model || '',
        processor: equipment.processor || '',
        ram_memory: equipment.ram_memory || '',
        storage_disk: equipment.storage_disk || '',
        department_id: equipment.department_id ? String(equipment.department_id) : '',
    });

    function handleChange(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    function handleCancel() {
        setForm({
            brand: equipment.brand || '',
            model: equipment.model || '',
            processor: equipment.processor || '',
            ram_memory: equipment.ram_memory || '',
            storage_disk: equipment.storage_disk || '',
            department_id: equipment.department_id ? String(equipment.department_id) : '',
        });
        setErrors({});
        setEditing(false);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        const payload = {
            brand: form.brand || null,
            model: form.model || null,
            processor: form.processor || null,
            ram_memory: form.ram_memory || null,
            storage_disk: form.storage_disk || null,
            department_id: form.department_id ? Number(form.department_id) : null,
        };

        router.patch(route('equipments.update', equipment.id), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(false);
                setErrors({});
            },
            onError: (err) => {
                setErrors(err);
                showValidationErrors(err);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4 min-w-0">
                    <Link
                        href={route('equipments.index')}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-4 w-4 shrink-0" />
                        <span className="truncate">Inventario de Equipos</span>
                    </Link>
                    {flash.success && (
                        <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
                            {flash.success}
                        </span>
                    )}
                </div>
            }
        >
            <Head title={equipment.sku} />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-azul-institucional" />
                            Detalles del Equipo
                        </h3>
                        {canManageEquipment && !editing && (
                            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                                <Pencil className="h-4 w-4 mr-1" />
                                Editar
                            </Button>
                        )}
                    </div>

                    {!editing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="rounded-md bg-gris-fondo p-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                    <Barcode className="h-3.5 w-3.5" />
                                    SKU
                                </div>
                                <p className="text-sm font-mono font-medium text-azul-institucional">{equipment.sku}</p>
                            </div>
                            <div className="rounded-md bg-gris-fondo p-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                    <Monitor className="h-3.5 w-3.5" />
                                    Marca
                                </div>
                                <p className="text-sm font-medium text-gray-900">{equipment.brand || '—'}</p>
                            </div>
                            <div className="rounded-md bg-gris-fondo p-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                    <Monitor className="h-3.5 w-3.5" />
                                    Modelo
                                </div>
                                <p className="text-sm font-medium text-gray-900">{equipment.model || '—'}</p>
                            </div>
                            <div className="rounded-md bg-gris-fondo p-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                    <Cpu className="h-3.5 w-3.5" />
                                    Procesador
                                </div>
                                <p className="text-sm font-medium text-gray-900">{equipment.processor || '—'}</p>
                            </div>
                            <div className="rounded-md bg-gris-fondo p-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                    <Cpu className="h-3.5 w-3.5" />
                                    Memoria RAM
                                </div>
                                <p className="text-sm font-medium text-gray-900">{equipment.ram_memory || '—'}</p>
                            </div>
                            <div className="rounded-md bg-gris-fondo p-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                    <HardDrive className="h-3.5 w-3.5" />
                                    Disco de Almacenamiento
                                </div>
                                <p className="text-sm font-medium text-gray-900">{equipment.storage_disk || '—'}</p>
                            </div>
                            <div className="rounded-md bg-gris-fondo p-3 sm:col-span-2 lg:col-span-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    Departamento
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {equipment.department?.name || <span className="text-gray-400">Sin asignar</span>}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Marca</label>
                                    <Input value={form.brand} onChange={e => handleChange('brand', e.target.value)} maxLength={20} className="text-sm" />
                                    {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Modelo</label>
                                    <Input value={form.model} onChange={e => handleChange('model', e.target.value)} maxLength={30} className="text-sm" />
                                    {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Procesador</label>
                                    <Input value={form.processor} onChange={e => handleChange('processor', e.target.value)} maxLength={35} className="text-sm" />
                                    {errors.processor && <p className="text-xs text-red-600 mt-1">{errors.processor}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Memoria RAM</label>
                                    <Input value={form.ram_memory} onChange={e => handleChange('ram_memory', e.target.value)} maxLength={100} className="text-sm" />
                                    {errors.ram_memory && <p className="text-xs text-red-600 mt-1">{errors.ram_memory}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs text-gray-500 mb-1 block">Disco de Almacenamiento</label>
                                    <Input value={form.storage_disk} onChange={e => handleChange('storage_disk', e.target.value)} maxLength={100} className="text-sm" />
                                    {errors.storage_disk && <p className="text-xs text-red-600 mt-1">{errors.storage_disk}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs text-gray-500 mb-1 block">Departamento</label>
                                    <div className="mt-2">
                                        <Select value={form.department_id} onChange={e => handleChange('department_id', e.target.value)} className="text-sm">
                                            <option value="">Sin asignar</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    {errors.department_id && <p className="text-xs text-red-600 mt-1">{errors.department_id}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <Button type="submit" size="sm" disabled={processing}>
                                    <Save className="h-4 w-4 mr-1" />
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={handleCancel} disabled={processing}>
                                    <X className="h-4 w-4 mr-1" />
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-azul-institucional" />
                        Historial de Informes ({reports.length})
                    </h3>
                    {reports.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No hay informes de retiro para este equipo.</p>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            {reports.map(report => (
                                <div key={report.id} className="py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-1">
                                                <Link
                                                    href={route('tickets.show', report.ticket?.id)}
                                                    className="font-medium text-azul-institucional hover:underline"
                                                >
                                                    {report.ticket?.code}
                                                </Link>
                                                <span className="text-gray-400">
                                                    {new Date(report.created_at).toLocaleDateString('es-VE', {
                                                        day: 'numeric', month: 'long', year: 'numeric',
                                                    })}
                                                </span>
                                                <Badge variant={report.ticket?.category?.name ? 'secondary' : 'ghost'} className="text-[10px]">
                                                    {report.ticket?.status_label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                                                {report.diagnostic}
                                            </p>
                                            {report.ticket?.assigned && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Técnico: {report.ticket.assigned.full_name ?? report.ticket.assigned.name}
                                                </p>
                                            )}
                                        </div>
                                        <a
                                            href={route('intervention-reports.pdf', report.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0"
                                        >
                                            <Button size="sm" variant="outline">
                                                <FileText className="h-4 w-4" />
                                                PDF
                                            </Button>
                                        </a>
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
