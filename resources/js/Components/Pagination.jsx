import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export default function Pagination({ links, perPage, total, onPerPageChange }) {
    const pages = links?.filter(l => l.label !== '&laquo; Anterior' && l.label !== '&laquo; Previous' && l.label !== 'Siguiente &raquo;' && l.label !== 'Next &raquo;') || [];
    const currentPage = pages.findIndex(l => l.active);

    function visiblePages() {
        const total = pages.length;
        if (total <= 7) return pages.map((_, i) => i);

        const result = [];
        result.push(0);

        const start = Math.max(1, currentPage - 2);
        const end = Math.min(total - 2, currentPage + 2);

        if (start > 1) result.push('...');
        for (let i = start; i <= end; i++) result.push(i);
        if (end < total - 2) result.push('...');

        result.push(total - 1);
        return result;
    }

    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Mostrar</span>
                <select
                    value={String(perPage || '10')}
                    onChange={e => onPerPageChange(e.target.value)}
                    className="w-20 rounded-md border border-gris-borde bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-azul-institucional"
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <span>por página — {total} resultados</span>
            </div>
            {links && links.length > 3 && (
                <div className="flex items-center gap-1">
                    {(() => {
                        const prev = links[0];
                        return (
                            <button
                                onClick={() => prev.url && router.get(prev.url, {}, { preserveState: true })}
                                disabled={!prev.url}
                                className={`flex items-center justify-center w-8 h-8 rounded-md border border-gris-borde text-sm transition-colors ${
                                    prev.url
                                        ? 'bg-white text-gray-700 hover:bg-gris-fondo'
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        );
                    })()}

                    {visiblePages().map((item, i) => {
                        if (item === '...') {
                            return (
                                <span key={`ellipsis-${i}`} className="flex items-center justify-center w-8 h-8 text-gray-400">
                                    <MoreHorizontal className="h-4 w-4" />
                                </span>
                            );
                        }

                        const link = pages[item];
                        if (!link) return null;

                        return (
                            <button
                                key={item}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                disabled={!link.url}
                                className={`flex items-center justify-center min-w-[2rem] h-8 rounded-md border border-gris-borde text-sm transition-colors ${
                                    link.active
                                        ? 'bg-azul-institucional text-white border-azul-institucional'
                                        : link.url
                                        ? 'bg-white text-gray-700 hover:bg-gris-fondo'
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                            >
                                {link.label}
                            </button>
                        );
                    })}

                    {(() => {
                        const next = links[links.length - 1];
                        return (
                            <button
                                onClick={() => next.url && router.get(next.url, {}, { preserveState: true })}
                                disabled={!next.url}
                                className={`flex items-center justify-center w-8 h-8 rounded-md border border-gris-borde text-sm transition-colors ${
                                    next.url
                                        ? 'bg-white text-gray-700 hover:bg-gris-fondo'
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
