import { Link, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Menu, X, Ticket, Users, FolderTree, LayoutDashboard, Building2, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/Components/ui/dropdown';
import { Badge } from '@/Components/ui/badge';

function FlashMessages() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(true);

    if (!visible || (!flash?.success && !flash?.error)) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-md border p-4 shadow-lg ${
            flash.success ? 'bg-verde-exito-light border-verde-exito text-verde-exito' : 'bg-rojo-urgencia-light border-rojo-urgencia text-rojo-urgencia'
        }`}>
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{flash.success || flash.error}</p>
                <button onClick={() => setVisible(false)} className="shrink-0">
                    <XCircle className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const unreadCount = auth?.unread_notifications ?? 0;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const notifRef = useRef(null);
    const userRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const navItems = [];

    navItems.push({ href: route('dashboard'), label: 'Dashboard', icon: LayoutDashboard, active: route().current('dashboard') });
    navItems.push({ href: route('tickets.index'), label: 'Tickets', icon: Ticket, active: route().current('tickets.*') });

    if (user.roles?.some(r => ['super_admin', 'admin_departamento', 'admin_tickets'].includes(r.name))) {
        navItems.push({ href: route('users.index'), label: 'Usuarios', icon: Users, active: route().current('users.*') });
    }

    if (user.roles?.some(r => r.name === 'super_admin')) {
        navItems.push({ href: route('categories.index'), label: 'Categorías', icon: FolderTree, active: route().current('categories.*') });
        navItems.push({ href: route('departments.index'), label: 'Departamentos', icon: Building2, active: route().current('departments.*') });
    }

    return (
        <div className="min-h-screen bg-gris-fondo">
            <nav className="bg-azul-institucional text-white shadow-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        <div className="flex items-center">
                            <Link href={route('dashboard')} className="text-lg font-bold tracking-tight">
                                Sistema de Tickets
                            </Link>
                            <div className="hidden md:ml-8 md:flex md:space-x-1">
                                {navItems.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                                item.active
                                                    ? 'bg-white/15 text-white'
                                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div ref={notifRef} className="relative">
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="relative rounded-md p-1.5 text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rojo-urgencia text-[10px] font-bold text-white px-1">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {notifOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-80 rounded-md border border-gris-borde bg-white shadow-lg z-50">
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-gris-borde">
                                            <span className="text-sm font-medium text-gray-900">Notificaciones</span>
                                            <Link href={route('notifications.index')} className="text-xs text-azul-institucional hover:underline">
                                                Ver todas
                                            </Link>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto p-2">
                                            {unreadCount === 0 ? (
                                                <p className="text-sm text-gray-500 text-center py-4">No hay notificaciones nuevas</p>
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center py-4">{unreadCount} notificaciones sin leer</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div ref={userRef} className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <span className="hidden sm:inline">{user.full_name ?? user.name}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-gris-borde bg-white shadow-lg z-50">
                                        <div className="px-3 py-2 border-b border-gris-borde">
                                            <p className="text-sm font-medium text-gray-900">{user.full_name ?? user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link
                                                href={route('profile.edit')}
                                                className="block rounded-sm px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Perfil
                                            </Link>
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="block w-full text-left rounded-sm px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Cerrar sesión
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden rounded-md p-1.5 text-blue-100 hover:bg-white/10 hover:text-white"
                            >
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-white/10 px-4 py-2">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                                        item.active ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </nav>

            {header && (
                <header className="bg-white border-b border-gris-borde shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>

            <FlashMessages />
        </div>
    );
}
