import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

export default function Create({ categories, priorities }) {
    const [values, setValues] = useState({
        title: '',
        description: '',
        priority: '',
        category_id: '',
        photo: null,
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

    function handleChange(e) {
        const { name, value, files } = e.target;
        if (name === 'photo' && files?.length) {
            setValues(v => ({ ...v, photo: files[0] }));
            setPhotoPreview(URL.createObjectURL(files[0]));
        } else {
            setValues(v => ({ ...v, [name]: value }));
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('priority', values.priority);
        formData.append('category_id', values.category_id);
        if (values.photo) formData.append('photo', values.photo);

        router.post(route('tickets.store'), formData, {
            onError: (err) => { setErrors(err); setProcessing(false); },
            onSuccess: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-900">Nuevo Ticket</h2>}
        >
            <Head title="Nuevo Ticket" />

            <div className="max-w-2xl">
                <div className="rounded-lg border border-gris-borde bg-white p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                name="title"
                                value={values.title}
                                onChange={handleChange}
                                placeholder="Resumen del problema"
                                className="mt-1"
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={values.description}
                                onChange={handleChange}
                                placeholder="Describe el problema con detalle"
                                rows={5}
                                className="mt-1"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="priority">Prioridad</Label>
                                <Select
                                    id="priority"
                                    name="priority"
                                    value={values.priority}
                                    onChange={handleChange}
                                    className="mt-1"
                                >
                                    <option value="">Selecciona una prioridad</option>
                                    {priorities.map(p => (
                                        <option key={p.value} value={p.value}>
                                            {p.label} — {p.description}
                                        </option>
                                    ))}
                                </Select>
                                <InputError message={errors.priority} />
                            </div>

                            <div>
                                <Label htmlFor="category_id">Categoría</Label>
                                <Select
                                    id="category_id"
                                    name="category_id"
                                    value={values.category_id}
                                    onChange={handleChange}
                                    className="mt-1"
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </Select>
                                <InputError message={errors.category_id} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="photo">Evidencia Fotográfica</Label>
                            <Input
                                id="photo"
                                type="file"
                                name="photo"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleChange}
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Opcional. JPG, PNG o WebP. Máximo 5 MB.</p>
                            <InputError message={errors.photo} />
                            {photoPreview && (
                                <img src={photoPreview} alt="Vista previa" className="mt-2 max-h-48 rounded-md border border-gris-borde" />
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creando...' : 'Crear Ticket'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit(route('tickets.index'))}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
