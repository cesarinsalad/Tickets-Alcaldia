import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';
import WysiwygEditor from '@/Components/WysiwygEditor';

function ArticleForm({ article, categories }) {
    const isEdit = !!article;
    const [title, setTitle] = useState(article?.title || '');
    const [content, setContent] = useState(article?.content || '');
    const [selectedCategories, setSelectedCategories] = useState(article?.category_ids || []);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function toggleCategory(id) {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    }

    function handleFileChange(e) {
        setFiles(Array.from(e.target.files));
    }

    function removeFile(index) {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        selectedCategories.forEach(id => formData.append('categories[]', id));
        files.forEach(f => formData.append('attachments[]', f));

        if (isEdit) {
            formData.append('_method', 'PUT');
        }

        const url = isEdit
            ? route('articles.update', article.slug)
            : route('articles.store');

        router.post(url, formData, {
            onError: (err) => { setErrors(err); setProcessing(false); },
            onSuccess: () => { setProcessing(false); },
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href={route('articles.index')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-4 w-4" />
                            Base de Conocimiento
                        </a>
                        <span className="text-gray-300">/</span>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEdit ? 'Editar Artículo' : 'Nuevo Artículo'}
                        </h2>
                    </div>
                    <Button type="submit" form="article-form" disabled={processing}>
                        <Save className="h-4 w-4" />
                        {processing ? 'Guardando...' : 'Guardar Borrador'}
                    </Button>
                </div>
            }
        >
            <Head title={isEdit ? 'Editar Artículo' : 'Nuevo Artículo'} />

            <div className="max-w-3xl mx-auto">
                <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Título del artículo"
                            className="mt-1"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div>
                        <Label>Categorías</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {categories.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => toggleCategory(c.id)}
                                >
                                    <Badge variant={selectedCategories.includes(c.id) ? 'default' : 'outline'}>
                                        {c.name}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                        <InputError message={errors.categories} />
                    </div>

                    <div>
                        <Label>Contenido</Label>
                        <div className="mt-1 bg-white rounded-md border border-gris-borde">
                            <WysiwygEditor value={content} onChange={setContent} />
                        </div>
                        <InputError message={errors.content} />
                    </div>

                    <div>
                        <Label>Archivos adjuntos</Label>
                        <div className="mt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gris-borde rounded-md p-4">
                                <Upload className="h-4 w-4" />
                                Cargar imágenes o PDFs (máx. 10MB)
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {files.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {files.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Upload className="h-3 w-3" />
                                            {f.name}
                                            <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <InputError message={errors.attachments} />
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

export default function Create({ categories }) {
    return <ArticleForm categories={categories} />;
}

export { ArticleForm };
