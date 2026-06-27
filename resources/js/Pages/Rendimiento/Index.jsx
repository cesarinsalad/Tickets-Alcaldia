import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';

export default function Index() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3 min-w-0">
                    <TrendingUp className="h-6 w-6 text-azul-institucional shrink-0" />
                    <h2 className="text-xl font-semibold text-gray-900 truncate">Rendimiento</h2>
                </div>
            }
        >
            <Head title="Rendimiento" />
            <div className="rounded-lg border border-gris-borde bg-white p-6">
                <p className="text-sm text-gray-500">Sección en desarrollo.</p>
            </div>
        </AuthenticatedLayout>
    );
}
