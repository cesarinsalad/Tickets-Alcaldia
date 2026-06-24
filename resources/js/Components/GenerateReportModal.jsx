import { useState } from 'react';
import { Search, X, Wrench, Loader2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}

export default function GenerateReportModal({ ticket, onClose }) {
    const [sku, setSku] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [processor, setProcessor] = useState('');
    const [ramMemory, setRamMemory] = useState('');
    const [storageDisk, setStorageDisk] = useState('');
    const [diagnostic, setDiagnostic] = useState('');
    const [searching, setSearching] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    async function lookupEquipment() {
        if (!sku.trim()) return;
        setSearching(true);
        setNotFound(false);

        try {
            const res = await fetch(`/equipments/${encodeURIComponent(sku.trim())}`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setBrand(data.brand || '');
                    setModel(data.model || '');
                    setProcessor(data.processor || '');
                    setRamMemory(data.ram_memory || '');
                    setStorageDisk(data.storage_disk || '');
                    setNotFound(false);
                } else {
                    setNotFound(true);
                }
            } else {
                setNotFound(true);
            }
        } catch {
            setNotFound(true);
        } finally {
            setSearching(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('sku', sku);
        formData.append('brand', brand);
        formData.append('model', model);
        formData.append('processor', processor);
        formData.append('ram_memory', ramMemory);
        formData.append('storage_disk', storageDisk);
        formData.append('diagnostic', diagnostic);

        try {
            const xsrfToken = getCookie('XSRF-TOKEN');

            const res = await fetch(
                route('tickets.intervention-report.generate', ticket.id),
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
                    },
                }
            );

            if (!res.ok) {
                if (res.status === 422) {
                    const data = await res.json();
                    setErrors(data.errors || {});
                }
                setProcessing(false);
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `informe-retiro-${ticket.code}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setProcessing(false);
            onClose();
        } catch {
            setProcessing(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-azul-institucional" />
                        <h2 className="text-lg font-semibold text-gray-900">Informe de Retiro de Equipo</h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="ir_sku">Codigo de Bienes (SKU)</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                id="ir_sku"
                                value={sku}
                                onChange={e => { setSku(e.target.value); setNotFound(false); }}
                                onBlur={lookupEquipment}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), lookupEquipment())}
                                placeholder="Ej: SKU-001234"
                                className="flex-1"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={lookupEquipment} disabled={searching}>
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                Buscar
                            </Button>
                        </div>
                        {notFound && (
                            <p className="text-xs text-amber-600 mt-1">Equipo no encontrado. Complete los datos manualmente.</p>
                        )}
                        <InputError message={errors.sku} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="ir_brand">Marca</Label>
                            <Input id="ir_brand" value={brand} onChange={e => setBrand(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="ir_model">Modelo</Label>
                            <Input id="ir_model" value={model} onChange={e => setModel(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="ir_processor">Procesador</Label>
                            <Input id="ir_processor" value={processor} onChange={e => setProcessor(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="ir_ram">Memoria RAM</Label>
                            <Input id="ir_ram" value={ramMemory} onChange={e => setRamMemory(e.target.value)} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="ir_disk">Disco de Almacenamiento</Label>
                            <Input id="ir_disk" value={storageDisk} onChange={e => setStorageDisk(e.target.value)} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="ir_diagnostic">Observaciones</Label>
                        <Textarea
                            id="ir_diagnostic"
                            value={diagnostic}
                            onChange={e => setDiagnostic(e.target.value)}
                            rows={5}
                            className="mt-1"
                            placeholder="Describa el estado del equipo..."
                        />
                        <InputError message={errors.diagnostic} />
                    </div>

                    <div className="text-xs text-gray-400 bg-gris-fondo rounded-md p-3">
                        <p className="font-medium text-gray-500 mb-1">Ticket: {ticket.code} &mdash; {ticket.title}</p>
                        <p>Asignado a: {(ticket.assigned?.full_name ?? ticket.assigned?.name) || 'Sin asignar'}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                'Generar PDF'
                            )}
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
