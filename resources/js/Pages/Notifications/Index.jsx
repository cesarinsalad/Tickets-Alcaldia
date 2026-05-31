import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import Pagination from '@/Components/Pagination';

export default function Index({ notifications }) {
    function markAllRead() {
        router.post(route('notifications.read-all'));
    }

    function handleNotifClick(notif) {
        if (notif.read_at) {
            if (notif.ticket_id) router.visit(route('tickets.show', notif.ticket_id));
            return;
        }

        router.post(route('notifications.read', notif.id), {}, {
            onFinish: () => notif.ticket_id && router.visit(route('tickets.show', notif.ticket_id)),
        });
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
                            <button
                                key={notif.id}
                                type="button"
                                onClick={() => handleNotifClick(notif)}
                                className={`flex items-start gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors ${!notif.read_at ? 'bg-blue-50/50' : ''}`}
                            >
                                <Bell className={`h-5 w-5 mt-0.5 shrink-0 ${!notif.read_at ? 'text-azul-institucional' : 'text-gray-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                        {!notif.read_at && (
                                            <span className="h-2 w-2 rounded-full bg-azul-institucional shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString('es-VE')}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <Pagination
                    links={notifications.links}
                    perPage={10}
                    total={notifications.total}
                    onPerPageChange={() => {}}
                />
            </div>
        </AuthenticatedLayout>
    );
}
