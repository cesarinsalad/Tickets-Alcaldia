import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { confirmAction } from '@/lib/sweet-alert';

const priorityLabels = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
};

export default function Index({ configs, workStart, workEnd, workDays, dayOptions }) {
    const [form, setForm] = useState({
        configs: configs.map(c => ({ ...c })),
        work_start: workStart,
        work_end: workEnd,
        work_days: workDays.split(','),
    });
    const [processing, setProcessing] = useState(false);

    function handleConfigChange(priority, field, value) {
        setForm(f => ({
            ...f,
            configs: f.configs.map(c =>
                c.priority === priority ? { ...c, [field]: parseInt(value) || 0 } : c
            ),
        }));
    }

    function toggleDay(day) {
        setForm(f => ({
            ...f,
            work_days: f.work_days.includes(day)
                ? f.work_days.filter(d => d !== day)
                : [...f.work_days, day],
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.put(route('sla.update'), form, {
            onFinish: () => setProcessing(false),
        });
    }

    async function handleReset() {
        const result = await confirmAction({
            title: '¿Restablecer valores predeterminados?',
            text: 'Se perderán los cambios actuales y se restaurarán los valores originales del sistema.',
            confirmText: 'Sí, restablecer',
        });
        if (result.isConfirmed) {
            router.post(route('sla.reset'));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Tiempos de Respuesta</h2>
                </div>
            }
        >
            <Head title="Tiempos de Respuesta" />

            <div className="">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Límites por Prioridad
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gris-borde text-left text-xs text-gray-500 uppercase tracking-wide">
                                            <th className="px-4 py-2 font-medium">Prioridad</th>
                                            <th className="px-4 py-2 font-medium">Respuesta (min)</th>
                                            <th className="px-4 py-2 font-medium">Resolución (h)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.configs.map(c => (
                                            <tr key={c.priority} className="border-b border-gris-borde">
                                                <td className="px-4 py-3 text-gray-900 font-medium">{priorityLabels[c.priority]}</td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={c.response_minutes}
                                                        onChange={e => handleConfigChange(c.priority, 'response_minutes', e.target.value)}
                                                        className="w-28"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={c.resolution_hours}
                                                        onChange={e => handleConfigChange(c.priority, 'resolution_hours', e.target.value)}
                                                        className="w-28"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Horario Laboral</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-md">
                                <div>
                                    <Label htmlFor="work_start">Desde</Label>
                                    <Input
                                        id="work_start"
                                        type="time"
                                        value={form.work_start}
                                        onChange={e => setForm(f => ({ ...f, work_start: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="work_end">Hasta</Label>
                                    <Input
                                        id="work_end"
                                        type="time"
                                        value={form.work_end}
                                        onChange={e => setForm(f => ({ ...f, work_end: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 block">Días laborables</Label>
                            <div className="flex flex-wrap gap-2">
                                {dayOptions.map(d => (
                                    <label
                                        key={d.value}
                                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                                            form.work_days.includes(d.value)
                                                ? 'border-azul-institucional bg-azul-institucional text-white'
                                                : 'border-gris-borde bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.work_days.includes(d.value)}
                                            onChange={() => toggleDay(d.value)}
                                            className="sr-only"
                                        />
                                        {d.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleReset}>
                                <RotateCcw className="h-4 w-4" />
                                Restablecer Predeterminados
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
