import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links, perPage, total, onPerPageChange }) {
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
                    {links.map((link, i) => {
                        if (i === 0) {
                            return (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`flex items-center justify-center w-8 h-8 rounded-md border border-gris-borde text-sm transition-colors ${
                                        link.url
                                            ? 'bg-white text-gray-700 hover:bg-gris-fondo'
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            );
                        }

                        if (i === links.length - 1) {
                            return (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`flex items-center justify-center w-8 h-8 rounded-md border border-gris-borde text-sm transition-colors ${
                                        link.url
                                            ? 'bg-white text-gray-700 hover:bg-gris-fondo'
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            );
                        }

                        return (
                            <button
                                key={i}
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
                </div>
            )}
        </div>
    );
}
