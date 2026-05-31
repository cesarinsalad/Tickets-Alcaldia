import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { ChevronDown } from 'lucide-react';
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
    const [categoryOpen, setCategoryOpen] = useState(false);
    const categoryRef = useRef(null);
    const [priorityOpen, setPriorityOpen] = useState(false);
    const priorityRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setCategoryOpen(false);
            }
            if (priorityRef.current && !priorityRef.current.contains(e.target)) {
                setPriorityOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCategory = categories.find(c => c.id === parseInt(values.category_id));
    const selectedPriority = priorities.find(p => p.value === values.priority);

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
                                <div className="relative mt-1" ref={priorityRef}>
                                    <button
                                        type="button"
                                        onClick={() => setPriorityOpen(!priorityOpen)}
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-gris-borde bg-white px-3 py-1 text-sm shadow-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azul-institucional"
                                    >
                                        <span className={values.priority ? 'text-gray-900' : 'text-gray-400'}>
                                            {selectedPriority?.label || 'Selecciona una prioridad'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>
                                    {priorityOpen && (
                                        <div className="absolute z-50 mt-1 w-full rounded-md border border-gris-borde bg-white p-1 shadow-md">
                                            {priorities.map(p => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setValues(v => ({ ...v, priority: p.value }));
                                                        setPriorityOpen(false);
                                                    }}
                                                    className={`w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-gray-100 ${
                                                        values.priority === p.value ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <span className="font-medium text-gray-900">{p.label}</span>
                                                    {p.description && (
                                                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{p.description}</p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.priority} />
                            </div>

                            <div>
                                <Label htmlFor="category_id">Categoría</Label>
                                <div className="relative mt-1" ref={categoryRef}>
                                    <button
                                        type="button"
                                        onClick={() => setCategoryOpen(!categoryOpen)}
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-gris-borde bg-white px-3 py-1 text-sm shadow-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azul-institucional"
                                    >
                                        <span className={values.category_id ? 'text-gray-900' : 'text-gray-400'}>
                                            {selectedCategory?.name || 'Selecciona una categoría'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>
                                    {categoryOpen && (
                                        <div className="absolute z-50 mt-1 w-full rounded-md border border-gris-borde bg-white p-1 shadow-md">
                                            {categories.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setValues(v => ({ ...v, category_id: String(c.id) }));
                                                        setCategoryOpen(false);
                                                    }}
                                                    className={`w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-gray-100 ${
                                                        values.category_id === String(c.id) ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <span className="font-medium text-gray-900">{c.name}</span>
                                                    {c.description && (
                                                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{c.description}</p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
