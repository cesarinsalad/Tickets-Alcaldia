import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

function ArticleModal({ mode, article, onClose }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        title: isEdit ? (article?.title || '') : '',
        content: isEdit ? (article?.content || '') : '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        if (isEdit) {
            router.put(route('knowledge.update', article.id), form, {
                onError: (err) => { setErrors(err); setProcessing(false); },
                onSuccess: () => { setProcessing(false); onClose(); },
            });
        } else {
            router.post(route('knowledge.store'), form, {
                onError: (err) => { setErrors(err); setProcessing(false); },
                onSuccess: () => { setProcessing(false); onClose(); },
            });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isEdit ? 'Editar Artículo' : 'Nuevo Artículo'}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="kb_title">Título</Label>
                        <Input id="kb_title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" />
                        <InputError message={errors.title} />
                    </div>
                    <div>
                        <Label htmlFor="kb_content">Contenido</Label>
                        <Textarea
                            id="kb_content"
                            value={form.content}
                            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            rows={12}
                            className="mt-1"
                            placeholder="Describe el protocolo o procedimiento..."
                        />
                        <InputError message={errors.content} />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar Cambios' : 'Crear Artículo')}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Index({ articles }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const canEdit = user?.roles?.some(r => ['super_admin', 'admin_tickets', 'tecnico'].includes(r.name));
    const [modal, setModal] = useState(null);
    const [expanded, setExpanded] = useState({});

    function toggleExpand(id) {
        setExpanded(e => ({ ...e, [id]: !e[id] }));
    }

    function handleDelete(article) {
        if (confirm('¿Eliminar este artículo?')) {
            router.delete(route('knowledge.destroy', article.id));
        }
    }

    function canManage(article) {
        if (user?.roles?.some(r => ['super_admin', 'admin_tickets'].includes(r.name))) return true;
        return article.user_id === user?.id;
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Base de Conocimiento</h2>
                    {canEdit && (
                        <Button size="sm" onClick={() => setModal('create')}>
                            <Plus className="h-4 w-4" />
                            Nuevo Artículo
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Base de Conocimiento" />

            {modal && (
                <ArticleModal
                    mode={modal === 'create' ? 'create' : 'edit'}
                    article={modal !== 'create' ? modal : null}
                    onClose={() => setModal(null)}
                />
            )}

            <div className="">
                <div className="rounded-lg border border-gris-borde bg-white">
                    {articles.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No hay artículos</p>
                            <p className="text-sm mt-1">Crea el primer protocolo o procedimiento.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gris-borde">
                            {articles.map(article => (
                                <div key={article.id} className="p-4 hover:bg-gris-fondo transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => toggleExpand(article.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {expanded[article.id] ? (
                                                    <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                                                )}
                                                <h3 className="text-sm font-medium text-gray-900">{article.title}</h3>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {article.author} &middot; {article.created_at}
                                            </p>
                                        </div>
                                        {canManage(article) && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button variant="ghost" size="sm" onClick={() => setModal(article)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(article)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {expanded[article.id] && (
                                        <div className="mt-3 pl-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {article.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
