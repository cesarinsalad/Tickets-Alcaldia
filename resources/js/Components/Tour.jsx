import { driver } from 'driver.js';
import { router } from '@inertiajs/react';

const TOUR_KEY = 'sistema_tickets_tour';

const PAGE_ROUTES = {
    dashboard: { route: 'dashboard', label: 'Dashboard' },
    bandeja: { route: 'bandeja.index', label: 'Bandeja de Entrada' },
    tickets_index: { route: 'tickets.index', label: 'Lista de Tickets' },
    tickets_create: { route: 'tickets.create', label: 'Crear Ticket' },
    cola: { route: 'cola.index', label: 'Bandeja del Técnico' },
    mis_tickets: { route: 'mis-tickets.index', label: 'Mis Tickets' },
    equipments: { route: 'equipments.index', label: 'Equipos' },
    articles: { route: 'articles.index', label: 'Base de Conocimiento' },
    users: { route: 'users.index', label: 'Usuarios' },
    categories: { route: 'categories.index', label: 'Categorías' },
    departments: { route: 'departments.index', label: 'Departamentos' },
    roles: { route: 'roles.index', label: 'Roles y Permisos' },
    sla: { route: 'sla.index', label: 'Tiempos de Respuesta' },
    rendimiento: { route: 'rendimiento.index', label: 'Rendimiento' },
    reportes: { route: 'reportes.index', label: 'Reportes' },
};

const ALL_PAGES = [
    'dashboard',
    'bandeja',
    'tickets_index',
    'tickets_create',
    'equipments',
    'articles',
    'users',
    'categories',
    'departments',
    'roles',
    'sla',
    'rendimiento',
    'reportes',
];

function getPageSteps(page) {
    const common = [];

    switch (page) {
        case 'dashboard':
            return [
                {
                    popover: {
                        title: 'Bienvenido al Sistema de Tickets',
                        description: 'Este tour te guiará por todas las funcionalidades del sistema de gestión de tickets de la Alcaldía. Haz clic en "Siguiente" para comenzar.',
                        side: 'bottom', align: 'center',
                    },
                },
                {
                    element: 'aside nav',
                    popover: {
                        title: 'Barra de Navegación',
                        description: 'Desde aquí puedes acceder a todas las secciones del sistema: Dashboard, Tickets, Equipos, Usuarios, Reportes y más.',
                        side: 'right',
                    },
                },
                {
                    element: '.grid.grid-cols-1.gap-4.sm\\:grid-cols-2.lg\\:grid-cols-4',
                    popover: {
                        title: 'KPIs del Dashboard',
                        description: 'Estos indicadores muestran el estado actual del sistema: tickets abiertos, en proceso, cerrados este mes y vencidos. Haz clic en cualquiera para filtrar.',
                        side: 'bottom',
                    },
                },
                {
                    element: '.lg\\:col-span-2',
                    popover: {
                        title: 'Distribución por Estado',
                        description: 'Gráfica de barras que muestra la distribución de tickets por estado a lo largo del tiempo. Usa el selector para cambiar entre semana, mes, 3 meses o año.',
                        side: 'left',
                    },
                },
                {
                    element: '.rounded-lg.border.border-gris-borde.bg-white.p-5:last-of-type',
                    popover: {
                        title: 'Distribución por Prioridad',
                        description: 'Barras de progreso que muestran el porcentaje de tickets por prioridad (Crítica, Alta, Media, Baja). También tiene selector de período.',
                        side: 'left',
                    },
                },
            ];

        case 'bandeja':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Bandeja de Entrada',
                        description: 'Aquí ves todos los tickets nuevos (estado "Abierto") que necesitan ser asignados a un técnico. Haz clic en "Asignar" para atender un ticket.',
                        side: 'bottom',
                    },
                },
                {
                    element: 'select',
                    popover: {
                        title: 'Filtro por Departamento',
                        description: 'Puedes filtrar la bandeja por departamento para ver solo los tickets de una dirección específica.',
                        side: 'bottom',
                    },
                },
            ];

        case 'tickets_index':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Lista de Tickets',
                        description: 'Vista completa de todos los tickets del sistema. Puedes buscar, filtrar por estado, prioridad, departamento y más usando los campos superiores.',
                        side: 'bottom',
                    },
                },
                {
                    element: 'a[href*="tickets/create"]',
                    popover: {
                        title: 'Crear Ticket',
                        description: 'Haz clic aquí para crear un nuevo ticket de soporte. Los solicitantes pueden reportar incidencias técnicas.',
                        side: 'left',
                    },
                },
                {
                    element: 'a[href*="tickets/report"]',
                    popover: {
                        title: 'Generar Reporte',
                        description: 'Exporta la lista actual de tickets a Excel con los filtros aplicados. Ideal para generar informes.',
                        side: 'left',
                    },
                },
            ];

        case 'tickets_create':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Crear Nuevo Ticket',
                        description: 'Completa este formulario para registrar una nueva incidencia. Todos los campos son importantes para una correcta gestión.',
                        side: 'bottom',
                    },
                },
                {
                    element: 'select',
                    popover: {
                        title: 'Prioridad y Categoría',
                        description: 'Selecciona la prioridad (Crítica, Alta, Media, Baja) y la categoría del ticket. Esto determina los tiempos de respuesta SLA.',
                        side: 'top',
                    },
                },
            ];

        case 'equipments':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Inventario de Equipos',
                        description: 'Registro de todos los equipos informáticos de la Alcaldía. Cada equipo tiene un SKU único, marca, modelo y especificaciones técnicas.',
                        side: 'bottom',
                    },
                },
                {
                    element: 'table.w-full',
                    popover: {
                        title: 'Tabla de Equipos',
                        description: 'Lista completa del inventario de equipos. Puedes ordenar por SKU, marca, modelo, RAM, almacenamiento, departamento o cantidad de intervenciones. Haz clic en cualquier fila para ver el detalle del equipo.',
                        side: 'top',
                    },
                },
            ];

        case 'articles':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Base de Conocimiento',
                        description: 'Artículos y guías técnicas para ayudar a los técnicos a consultar soluciones o protocolos para problemas comunes.',
                        side: 'bottom',
                    },
                },
                {
                    element: 'a[href*="/kb/create"]',
                    popover: {
                        title: 'Crear Artículo',
                        description: 'Redacta nuevos artículos para la base de conocimiento. Puedes usar el editor de texto enriquecido para dar formato.',
                        side: 'left',
                    },
                },
            ];

        case 'users':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Gestión de Usuarios',
                        description: 'Administra todos los usuarios del sistema. Puedes crear, editar, activar/desactivar usuarios y asignarles roles.',
                        side: 'bottom',
                    },
                },
                {
                    element: 'table',
                    popover: {
                        title: 'Lista de Usuarios',
                        description: 'Cada fila muestra un usuario con su nombre, rol, departamento y estado. Usa los botones para editar o desactivar.',
                        side: 'top',
                    },
                },
            ];

        case 'categories':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Gestión de Categorías',
                        description: 'Define las categorías de tickets (Soporte Técnico, Infraestructura, Administrativo, etc.). Cada categoría puede tener un tiempo estimado de resolución.',
                        side: 'bottom',
                    },
                },
            ];

        case 'departments':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Gestión de Departamentos',
                        description: 'Administra las direcciones y departamentos de la Alcaldía. Cada usuario pertenece a un departamento.',
                        side: 'bottom',
                    },
                },
            ];

        case 'roles':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Roles y Permisos',
                        description: 'Sistema de control de acceso basado en roles (RBAC). Aquí defines qué puede hacer cada rol en el sistema.',
                        side: 'bottom',
                    },
                },
                {
                    element: 'select',
                    popover: {
                        title: 'Seleccionar Rol',
                        description: 'Elige un rol para ver y modificar sus permisos. Los roles base (Super Admin, Admin Tickets, etc.) tienen permisos predefinidos.',
                        side: 'bottom',
                    },
                },
                {
                    element: '.rounded-lg.border.border-gris-borde.bg-white.p-6',
                    popover: {
                        title: 'Módulos de Permisos',
                        description: 'Cada tarjeta representa un módulo del sistema. Activa o desactiva permisos específicos para cada rol usando los interruptores.',
                        side: 'top',
                    },
                },
            ];

        case 'sla':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Tiempos de Respuesta (SLA)',
                        description: 'Configura los tiempos máximos de respuesta y resolución para cada nivel de prioridad. Los tickets que excedan estos tiempos se marcarán como vencidos.',
                        side: 'bottom',
                    },
                },
            ];

        case 'rendimiento':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Rendimiento del Equipo',
                        description: 'Métricas de productividad del equipo de soporte. Aquí encuentras KPIs de tickets, carga de trabajo por técnico, tendencias de creación vs resolución y tickets vencidos.',
                        side: 'bottom',
                    },
                },
                {
                    element: '.lg\\:grid-cols-4',
                    popover: {
                        title: 'KPIs de Rendimiento',
                        description: 'Cuatro indicadores clave: tickets activos y en proceso, resueltos y cerrados, porcentaje de cumplimiento de SLA, y cantidad de técnicos con tickets vencidos. Usa los filtros de fecha superiores para ajustar el período.',
                        side: 'bottom',
                    },
                },
                {
                    element: '.border-red-200',
                    popover: {
                        title: 'Tickets Vencidos',
                        description: 'Lista de tickets críticos o con SLA vencido. Cada fila muestra código, título, prioridad, estado, departamento, técnico asignado y tiempo de vencimiento. Haz clic en cualquier fila para ir al detalle del ticket.',
                        side: 'top',
                    },
                },
                {
                    element: '.border-gris-borde.bg-white.p-5:has(table)',
                    popover: {
                        title: 'Carga de Trabajo del Equipo',
                        description: 'Distribución de tickets activos por técnico, con desglose por prioridad (Crítica, Alta, Media, Baja) y tickets cerrados en el período. Útil para balancear la carga y detectar técnicos sobrecargados.',
                        side: 'top',
                    },
                },
                {
                    element: '.recharts-wrapper',
                    popover: {
                        title: 'Tendencia Creados vs Resueltos',
                        description: 'Gráfica que muestra la evolución de tickets creados y resueltos a lo largo del tiempo. Usa el selector superior para cambiar entre vista por días, semanas o meses. Ideal para identificar tendencias estacionales.',
                        side: 'top',
                    },
                },
            ];

        case 'reportes':
            return [
                {
                    element: 'h2',
                    popover: {
                        title: 'Reportes',
                        description: 'Genera reportes personalizados de tickets o equipos. Sigue los 4 pasos: origen, plantillas, filtros y acciones.',
                        side: 'bottom',
                    },
                },
                {
                    element: '.lg\\:col-span-4 select',
                    popover: {
                        title: 'Paso 1: Origen de Datos',
                        description: 'Selecciona si quieres un reporte de Tickets o de Equipos (Inventario).',
                        side: 'right',
                    },
                },
                {
                    element: '.lg\\:col-span-8',
                    popover: {
                        title: 'Vista Previa',
                        description: 'Después de aplicar filtros, aquí verás una vista previa de los resultados antes de exportar a Excel.',
                        side: 'left',
                    },
                },
            ];

        default:
            return [
                {
                    popover: {
                        title: 'Tour del Sistema',
                        description: 'Sección en desarrollo. Continúa explorando el sistema.',
                    },
                },
            ];
    }
}

function navigateToPage(pageKey) {
    const page = PAGE_ROUTES[pageKey];
    if (!page) return;

    const tourState = JSON.parse(sessionStorage.getItem(TOUR_KEY) || '{}');
    tourState.nextPage = pageKey;
    sessionStorage.setItem(TOUR_KEY, JSON.stringify(tourState));

    router.visit(route(page.route), {
        onFinish: () => startPageTour(pageKey),
    });
}

let currentDriver = null;

function applyLabels(steps) {
    return steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const popover = step.popover || {};
        return {
            ...step,
            popover: {
                ...popover,
                nextBtnText: isLast ? undefined : (popover.nextBtnText || 'Siguiente'),
                prevBtnText: 'Anterior',
                doneBtnText: 'Finalizar',
            },
        };
    });
}

function startPageTour(pageKey) {
    const rawSteps = getPageSteps(pageKey);
    const steps = applyLabels(rawSteps);

    if (!steps || steps.length === 0) {
        const idx = ALL_PAGES.indexOf(pageKey);
        if (idx >= 0 && idx < ALL_PAGES.length - 1) {
            navigateToPage(ALL_PAGES[idx + 1]);
        }
        return;
    }

    if (currentDriver) {
        currentDriver.destroy();
    }

    const pageIndex = ALL_PAGES.indexOf(pageKey);
    let stepCounter = 0;

    currentDriver = driver({
        animate: true,
        overlayColor: 'black',
        showProgress: true,
        progressText: `Paso {{current}} de {{total}} · ${PAGE_ROUTES[pageKey]?.label || ''}`,
        steps,
        onNextClick: (element, step, options) => {
            stepCounter++;
            options.driver.moveNext();
        },
        onPrevClick: (element, step, options) => {
            stepCounter = Math.max(0, stepCounter - 1);
            options.driver.movePrevious();
        },
        onDoneClick: () => {
            stepCounter = steps.length - 1;

            const tourState = JSON.parse(sessionStorage.getItem(TOUR_KEY) || '{}');
            tourState.completedPages = tourState.completedPages || [];
            tourState.completedPages.push(pageKey);
            sessionStorage.setItem(TOUR_KEY, JSON.stringify(tourState));

            if (pageIndex >= 0 && pageIndex < ALL_PAGES.length - 1) {
                currentDriver?.destroy();
                navigateToPage(ALL_PAGES[pageIndex + 1]);
                return;
            }

            currentDriver?.destroy();
            currentDriver = null;
            sessionStorage.removeItem(TOUR_KEY);
        },
        onCloseClick: () => {
            currentDriver?.destroy();
            currentDriver = null;
            sessionStorage.removeItem(TOUR_KEY);
        },
        onDestroyed: () => {
            currentDriver = null;
        },
    });

    currentDriver.drive();
}

export function startFullTour() {
    sessionStorage.setItem(TOUR_KEY, JSON.stringify({ started: true, completedPages: [] }));
    startPageTour(ALL_PAGES[0]);
}

export function resumeTour() {
    const tourState = JSON.parse(sessionStorage.getItem(TOUR_KEY) || '{}');
    if (!tourState.started) return;

    const nextPage = tourState.nextPage || ALL_PAGES[0];
    startPageTour(nextPage);
}
