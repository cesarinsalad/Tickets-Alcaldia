import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, BookOpen, FileText, ArrowUpRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';

function ArticleCard({ article, isDraftView }) {
    return (
        <Link
            href={route('articles.show', article.slug)}
            className="block rounded-lg border border-gris-borde bg-white p-5 hover:shadow-md hover:border-azul-institucional/30 transition-all group"
        >
            <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-md bg-azul-institucional/10 text-azul-institucional">
                    <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-azul-institucional transition-colors line-clamp-2">
                            {article.title}
                        </h3>
                        {isDraftView && (
                            <Badge variant="warning" className="shrink-0 text-[10px]">Borrador</Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-2">
                        {article.categories?.map(c => (
                            <Badge key={c.id} variant="secondary" className="text-[10px]">{c.name}</Badge>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {article.author?.full_name ?? article.author?.name} &middot; Actualizado {new Date(article.updated_at).toLocaleDateString('es-VE')}
                    </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-azul-institucional transition-colors shrink-0" />
            </div>
        </Link>
    );
}

export default function Index({ articles, categories, filters }) {
    const { auth } = usePage().props;
    const tab = filters?.status || 'published';
    const [search, setSearch] = useState(filters?.search || '');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    function navigate(params) {
        router.get(route('articles.index'), { ...filters, ...params }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    }

    const debouncedSearch = useCallback(() => {
        if (search.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        navigate({ search, category: filters?.category });
    }, [search, filters?.category, filters?.status]);

    useEffect(() => {
        const timer = setTimeout(debouncedSearch, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const selectedCategory = filters?.category ? parseInt(filters.category) : null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-azul-institucional" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Base de Conocimiento</h2>
                            <p className="text-sm text-gray-500">Protocolos, procedimientos y guías de resolución</p>
                        </div>
                    </div>
                    <Link href={route('articles.create')}>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Nuevo Artículo
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Base de Conocimiento" />

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Buscar protocolos y procedimientos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>
            </div>

            <div className="flex items-center gap-1 mb-4 border-b border-gris-borde">
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        tab === 'published' ? 'border-azul-institucional text-azul-institucional' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => navigate({ status: 'published', category: undefined })}
                >
                    Publicados
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        tab === 'draft' ? 'border-azul-institucional text-azul-institucional' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => navigate({ status: 'draft', category: undefined })}
                >
                    Borradores
                </button>
            </div>

            {tab === 'published' && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <Button
                        variant={!selectedCategory ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => navigate({ category: undefined })}
                    >
                        Todas
                    </Button>
                    {categories.map(c => (
                        <Button
                            key={c.id}
                            variant={selectedCategory === c.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => navigate({ category: c.id })}
                        >
                            {c.name}
                        </Button>
                    ))}
                </div>
            )}

            {isSearching ? (
                <div className="py-12 text-center text-gray-500">
                    <Search className="mx-auto h-8 w-8 text-gray-300 animate-pulse mb-3" />
                    <p className="text-sm">Buscando...</p>
                </div>
            ) : articles.data.length === 0 ? (
                <div className="rounded-lg border border-gris-borde bg-white py-16 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-500">
                        {search ? 'Sin resultados' : tab === 'draft' ? 'No hay borradores' : 'No hay artículos publicados'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {search
                            ? `No se encontraron artículos para "${search}".`
                            : tab === 'draft'
                                ? 'Los borradores que escribas aparecerán aquí.'
                                : 'Crea el primer artículo de la base de conocimiento.'}
                    </p>
                    {!search && (
                        <Link href={route('articles.create')} className="inline-block mt-4">
                            <Button size="sm">
                                <Plus className="h-4 w-4" />
                                {tab === 'draft' ? 'Crear Borrador' : 'Crear Artículo'}
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {articles.data.map(article => (
                            <ArticleCard key={article.slug} article={article} isDraftView={tab === 'draft'} />
                        ))}
                    </div>
                    {articles.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            {articles.links?.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </AuthenticatedLayout>
    );
}
