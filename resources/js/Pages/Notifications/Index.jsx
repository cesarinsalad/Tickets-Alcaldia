import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Index({ notifications }) {
    function markAllRead() {
        router.post(route('notifications.read-all'));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
                    <Button variant="outline" size="sm" onClick={markAllRead}>
                        <CheckCheck className="h-4 w-4" />
                        Marcar todas como leídas
                    </Button>
                </div>
            }
        >
            <Head title="Notificaciones" />

            <div className="max-w-2xl">
                {notifications.data.length === 0 ? (
                    <div className="rounded-lg border border-gris-borde bg-white p-12 text-center text-gray-500">
                        <BellOff className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No hay notificaciones</p>
                    </div>
                ) : (
                    <div className="rounded-lg border border-gris-borde bg-white divide-y divide-gris-borde">
                        {notifications.data.map(notif => (
                            <div key={notif.id} className={`flex items-start gap-3 p-4 ${!notif.read_at ? 'bg-blue-50/50' : ''}`}>
                                <Bell className={`h-5 w-5 mt-0.5 ${!notif.read_at ? 'text-azul-institucional' : 'text-gray-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                        {!notif.read_at && (
                                            <span className="h-2 w-2 rounded-full bg-azul-institucional" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString('es-VE')}</p>
                                </div>
                                {notif.ticket_id && (
                                    <Link href={route('tickets.show', notif.ticket_id)} className="text-xs text-azul-institucional hover:underline whitespace-nowrap">
                                        Ver ticket
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {notifications.meta && notifications.meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {notifications.meta.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 text-sm rounded-md border border-gris-borde ${
                                    link.active
                                        ? 'bg-azul-institucional text-white border-azul-institucional'
                                        : link.url
                                        ? 'bg-white text-gray-700 hover:bg-gris-fondo'
                                        : 'text-gray-400 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
