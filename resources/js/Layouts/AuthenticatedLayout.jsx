import { Link, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Menu, X, Monitor, Ticket, Users, FolderTree, LayoutDashboard, Building2, Shield, Clock, BookOpen, User, LogOut, PieChart, TrendingUp, ClipboardList } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/Components/ui/tooltip';
import { toastSuccess, toastError, showPasswordAlert } from '@/lib/sweet-alert';

function useFlash() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (!flash) return;

        if (flash.new_password) {
            showPasswordAlert(flash.new_password);
        }

        if (flash.flashType) {
            if (flash.flashType === 'success' && flash.flashMessage) {
                toastSuccess(flash.flashMessage);
            } else if (flash.flashType === 'error' && flash.flashMessage) {
                toastError(flash.flashMessage);
            }
        } else {
            if (flash.success) {
                toastSuccess(flash.success);
            }
            if (flash.error) {
                toastError(flash.error);
            }
        }
    }, [flash]);
}

export default function AuthenticatedLayout({ header, actions, children }) {
    const { auth } = usePage().props;
    useFlash();
    const user = auth?.user;
    const unreadCount = auth?.unread_notifications ?? 0;
    const latestNotifications = auth?.latest_notifications ?? [];
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const saved = localStorage.getItem('sidebar_expanded');
        return saved !== null ? saved === 'true' : true;
    });
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const notifRef = useRef(null);
    const userRef = useRef(null);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 768) {
                setSidebarExpanded(false);
            } else {
                const saved = localStorage.getItem('sidebar_expanded');
                if (saved !== null) {
                    setSidebarExpanded(saved === 'true');
                }
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        function handleClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleNotifClick(notif) {
        setNotifOpen(false);

        if (notif.read_at) {
            router.visit(notif.ticket_id ? route('tickets.show', notif.ticket_id) : route('notifications.index'));
            return;
        }

        router.post(route('notifications.read', notif.id), {}, {
            onFinish: () => router.visit(notif.ticket_id ? route('tickets.show', notif.ticket_id) : route('notifications.index')),
        });
    }

    function closeMobileSidebar() {
        setMobileSidebarOpen(false);
    }

    const navItems = [];

    const can = (perm) => auth.all_permissions?.includes?.(perm);

    navItems.push({ href: route('dashboard'), label: 'Dashboard', icon: LayoutDashboard, active: route().current('dashboard') });
    navItems.push({ href: route('tickets.index'), label: 'Tickets', icon: Ticket, active: route().current('tickets.*') });
    if (can('ver articulos')) {
        navItems.push({ href: route('articles.index'), label: 'Base de Conocimiento', icon: BookOpen, active: route().current('articles.*') });
    }
    if (can('ver equipos')) {
        navItems.push({ href: route('equipments.index'), label: 'Equipos', icon: Monitor, active: route().current('equipments.*') });
    }
    if (can('gestionar usuarios')) {
        navItems.push({ href: route('users.index'), label: 'Usuarios', icon: Users, active: route().current('users.*') });
    }
    if (can('gestionar categorias')) {
        navItems.push({ href: route('categories.index'), label: 'Categorías', icon: FolderTree, active: route().current('categories.*') });
    }
    if (can('gestionar departamentos')) {
        navItems.push({ href: route('departments.index'), label: 'Departamentos', icon: Building2, active: route().current('departments.*') });
    }
    if (can('gestionar roles')) {
        navItems.push({ href: route('roles.index'), label: 'Roles y Permisos', icon: Shield, active: route().current('roles.*') });
    }
    if (can('gestionar sla')) {
        navItems.push({ href: route('sla.index'), label: 'Tiempos de Respuesta', icon: Clock, active: route().current('sla.*') });
    }
    if (can('ver metricas')) {
        navItems.push({ href: route('metricas.index'), label: 'Métricas', icon: PieChart, active: route().current('metricas.*') });
    }
    if (can('ver rendimiento')) {
        navItems.push({ href: route('rendimiento.index'), label: 'Rendimiento', icon: TrendingUp, active: route().current('rendimiento.*') });
    }
    if (can('ver reportes administrativos')) {
        navItems.push({ href: route('reportes.index'), label: 'Reportes', icon: ClipboardList, active: route().current('reportes.*') });
    }

    const sidebarContent = (
        <div className="flex h-full flex-col">
            <div className="flex items-center h-14 px-3 border-b border-white/10 shrink-0">
                {sidebarExpanded && (
                    <span className="font-semibold text-sm truncate">Sistema de Tickets</span>
                )}
                <button
                    onClick={() => {
                        const next = !sidebarExpanded;
                        setSidebarExpanded(next);
                        localStorage.setItem('sidebar_expanded', next);
                    }}
                    className="hidden md:flex items-center justify-center ml-auto p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
                >
                    {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <button
                    onClick={closeMobileSidebar}
                    className="md:hidden ml-auto p-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                <TooltipProvider delayDuration={300}>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const link = (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileSidebar}
                                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                                    item.active
                                        ? 'bg-white/15 text-white'
                                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                } ${!sidebarExpanded ? 'justify-center px-2' : ''}`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {sidebarExpanded && <span className="truncate">{item.label}</span>}
                            </Link>
                        );

                        if (!sidebarExpanded) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>
                                        {link}
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return link;
                    })}
                </TooltipProvider>
            </nav>

            <div className="border-t border-white/10 shrink-0">
                <Link
                    href={route('profile.edit')}
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors ${!sidebarExpanded ? 'justify-center px-2' : ''}`}
                >
                    <User className="h-5 w-5 shrink-0" />
                    {sidebarExpanded && (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{user.full_name ?? user.name}</p>
                            <p className="text-xs text-blue-200 truncate">{auth.role_label}</p>
                        </div>
                    )}
                </Link>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    onClick={closeMobileSidebar}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors ${!sidebarExpanded ? 'justify-center px-2' : ''}`}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {sidebarExpanded && <span>Cerrar sesión</span>}
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gris-fondo">
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 h-full bg-azul-institucional text-white transition-all duration-200 flex flex-col
                    ${sidebarExpanded ? 'w-64' : 'w-16'}
                    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0`}
            >
                {sidebarContent}
            </aside>

            <div
                className={`transition-all duration-200
                    ${sidebarExpanded ? 'md:ml-64' : 'md:ml-16'}
                    ml-0`}
            >
                <header className="sticky top-0 z-30 h-14 bg-white border-b border-gris-borde flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                            className="md:hidden p-1.5 -ml-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
                        >
                            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                        {header && (
                            <div className="min-w-0 flex-1">
                                {header}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {actions && (
                            <>
                                <span className="text-gray-200 select-none text-lg font-light">|</span>
                                <div className="flex items-center gap-2">
                                    {actions}
                                </div>
                                <span className="text-gray-200 select-none text-lg font-light">|</span>
                            </>
                        )}
                        <div ref={notifRef} className="relative">
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
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
                                    <div className="max-h-80 overflow-y-auto p-2">
                                        {latestNotifications.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">No hay notificaciones nuevas</p>
                                        ) : (
                                            latestNotifications.map(notif => (
                                                <button
                                                    key={notif.id}
                                                    type="button"
                                                    onClick={() => handleNotifClick(notif)}
                                                    className={`block w-full text-left rounded-sm px-3 py-2 text-sm hover:bg-gray-100 ${
                                                        !notif.read_at ? 'bg-blue-50/50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${!notif.read_at ? 'text-azul-institucional' : 'text-gray-400'}`} />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 truncate">{notif.title}</p>
                                                            <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {new Date(notif.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div ref={userRef} className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <span className="hidden sm:inline truncate">{user.full_name ?? user.name}</span>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-56 rounded-md border border-gris-borde bg-white shadow-lg z-50">
                                    <div className="px-3 py-2 border-b border-gris-borde">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.full_name ?? user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="px-3 py-2 border-b border-gris-borde text-xs space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <Shield className="h-3 w-3 text-gray-400" />
                                            <span>{auth.role_label}</span>
                                        </div>
                                        {auth.department_name && (
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <Building2 className="h-3 w-3 text-gray-400" />
                                                <span className="truncate">{auth.department_name}</span>
                                            </div>
                                        )}
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
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
