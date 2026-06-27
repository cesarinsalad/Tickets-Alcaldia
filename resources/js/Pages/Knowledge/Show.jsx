import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, CheckCircle, FileText, Download, Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { confirmAction } from '@/lib/sweet-alert';

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function Show({ article, canEdit, canPublish, canDelete }) {
    function handlePublish() {
        router.put(route('articles.publish', article.slug), {}, {
            onSuccess: () => { },
        });
    }

    async function handleDelete() {
        const result = await confirmAction({
            title: '¿Eliminar este artículo?',
            text: 'Esta acción es permanente y no se puede deshacer.',
            confirmText: 'Eliminar',
        });
        if (result.isConfirmed) {
            router.delete(route('articles.destroy', article.slug));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <Link
                        href={route('articles.index')}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Base de Conocimiento
                    </Link>
                    <div className="flex items-center gap-2">
                        {canPublish && (
                            <Button size="sm" onClick={handlePublish}>
                                <CheckCircle className="h-4 w-4" />
                                Publicar
                            </Button>
                        )}
                        {canEdit && (
                            <Link href={route('articles.edit', article.slug)}>
                                <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
                                    Editar
                                </Button>
                            </Link>
                        )}
                        {canDelete && (
                            <Button variant="destructive" size="sm" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={article.title} />

            <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    {article.categories?.map(c => (
                        <Link key={c.id} href={route('articles.index', { category: c.id })}>
                            <Badge variant="outline">{c.name}</Badge>
                        </Link>
                    ))}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gris-borde">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>{article.author}</span>
                    </div>
                    <span>Actualizado el {article.updated_at}</span>
                </div>

                <div
                    className="prose prose-gray max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {article.attachments?.length > 0 && (
                    <div className="border-t border-gris-borde pt-6 mt-8">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            Archivos adjuntos
                        </h3>
                        <div className="space-y-2">
                            {article.attachments.map(att => (
                                <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-lg border border-gris-borde p-3 hover:bg-gris-fondo transition-colors"
                                >
                                    <Download className="h-5 w-5 text-gray-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{att.filename}</p>
                                        <p className="text-xs text-gray-400">{formatFileSize(att.size)}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
