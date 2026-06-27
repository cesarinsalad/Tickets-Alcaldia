import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';

export default function Index() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <ClipboardList className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Reportes</h2>
                </div>
            }
        >
            <Head title="Reportes" />
            <div className="rounded-lg border border-gris-borde bg-white p-6">
                <p className="text-sm text-gray-500">Sección en desarrollo.</p>
            </div>
        </AuthenticatedLayout>
    );
}
