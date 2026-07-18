# Sistema de Tickets — Documentación Técnica

Documentación técnica del sistema de gestión de tickets de la Alcaldía.

---

## 1. Índice

1. [Índice](#1-índice)
2. [Stack Tecnológico](#2-stack-tecnológico)
   - 2.1 [Características clave de la versión del stack](#21-características-clave-de-la-versión-del-stack)
3. [Mapa de archivos del proyecto](#3-mapa-de-archivos-del-proyecto)
4. [Base de Datos — Tablas y Migraciones](#4-base-de-datos--tablas-y-migraciones)
   - 4.1 [Relaciones entre Modelos](#41-relaciones-entre-modelos)
5. [Arquitectura de Roles y Permisos (RBAC)](#5-arquitectura-de-roles-y-permisos-rbac)
   - 5.1 [Definición de Roles y Permisos](#51-definición-de-roles-y-permisos)
   - 5.2 [Protección de Rutas (backend)](#52-protección-de-rutas-backend)
   - 5.3 [Transmisión del Rol al Frontend](#53-transmisión-del-rol-al-frontend)
   - 5.4 [Uso del Rol en React](#54-uso-del-rol-en-react)
6. [Documentación por Módulo](#6-documentación-por-módulo)
7. [Lógica de Sincronización de Datos](#7-lógica-de-sincronización-de-datos)
   - 7.1 [Regla de Negocio Oficial](#71-regla-de-negocio-oficial)
   - 7.2 [Capa 1 — Backend](#72-capa-1--backend)
   - 7.3 [Capa 2 — Frontend](#73-capa-2--frontend)
8. [Comandos de Instalación y Configuración](#8-comandos-de-instalación-y-configuración)
9. [Tabla de Referencia Rápida](#9-tabla-de-referencia-rápida)
10. [Resumen por Rol — Matriz de Permisos](#10-resumen-por-rol--matriz-de-permisos)

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Backend | Laravel | 13.8 (PHP 8.3) |
| Frontend | React + Inertia.js | 18.2 / 2.0 |
| Estilos | Tailwind CSS + Radix UI | 4.0 |
| Base de datos | PostgreSQL | 16 |
| ORM / Auth | Laravel Sanctum | 4.0 |
| Roles y Permisos | Spatie Laravel Permission | 7.4 |
| PDF | barryvdh/laravel-dompdf | 3.1 |
| Importación/Exportación | maatwebsite/excel | 3.1 |
| Bridge PHP↔JS | tightenco/ziggy | 2.0 |
| Rich Text | react-quill-new | 3.8 |
| Gráficos | Recharts | 3.8 |
| Iconos | lucide-react | 0.400 |
| Modales/Tour | sweetalert2, driver.js | 11 / 1.6 |
| Testing | Pest + Pest Laravel Plugin | 4.7 / 4.1 |
| Build | Vite | 8.0 |
| Contenedores | Docker (Apache + postgres:16-alpine) | — |

Zona horaria: `America/Caracas`. Locale: `es` (Español).

### 2.1 Características clave de la versión del stack

- **Laravel 13.8 sobre PHP 8.3**: habilita atributos `#[Fillable]` y `#[Hidden]` en los modelos Eloquent (ver `app/Models/User.php:16-17`), tipado estricto y enums nativos. PHP 8.3 permite `readonly` properties y tipos de intersección.
- **Inertia.js 2.0**: protocolo moderno sin API REST; los controladores devuelven `Inertia::render('Page', props)` y los componentes React consumen los props directamente. El adaptador `inertia-laravel 2.0` reemplaza la necesidad de un cliente HTTP tradicional.
- **React 18.2**: renderizado concurrente; el `AuthenticatedLayout.jsx` aprovecha `useState`, `useRef` y `useEffect` con closures estables.
- **Tailwind CSS 4.0**: el motor se integra vía `@tailwindcss/vite` (no requiere PostCSS). La paleta institucional está definida en `resources/css/app.css` mediante la directiva `@theme` con variables CSS (`--color-azul-institucional`, etc.).
- **Radix UI**: primitivas accesibles sin estilos (`@radix-ui/react-dialog`, `react-dropdown-menu`, `react-tooltip`, `react-toast`, `react-select`, etc.) — el estilo lo provee Tailwind.
- **PostgreSQL 16**: aprovecha `EXTRACT(EPOCH FROM ...)` y funciones de fecha nativas para el cálculo de SLA (ver `DashboardController.php:487`). La búsqueda de la base de conocimiento usa `plainto_tsquery('spanish', term)` sobre una columna `fts_vector`.
- **Spatie Laravel Permission 7.4**: cachea permisos en memoria; el sistema lo invalida manualmente con `app()[PermissionRegistrar::class]->forgetCachedPermissions()` tras cada `syncPermissions` (ver `RolePermissionController.php:67, 86, 158`).
- **DOMPDF 3.1**: usado para reportes y constancias de satisfacción en `resources/views/pdf/`.
- **Vite 8.0**: build ultra-rápido del frontend; alias `@` → `resources/js` configurado en `vite.config.js:17` y `jsconfig.json:5`.
- **Docker multi-stage**: el `Dockerfile` compila assets con `node:20-alpine` y luego se apoya en `php:8.3-apache` para producción, reduciendo el tamaño de la imagen final.

---

## 3. Mapa de archivos del proyecto

```
.
├── app/
│   ├── Enums/
│   │   ├── ArticleStatus.php
│   │   ├── TicketPriority.php
│   │   └── TicketStatus.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                       (Breeze: login, registro, password reset, verificación email)
│   │   │   ├── ArticleController.php       (Base de conocimiento — CRUD + búsqueda full-text)
│   │   │   ├── CategoryController.php      (CRUD de categorías)
│   │   │   ├── CommentController.php       (Comentarios sobre tickets, con foto opcional)
│   │   │   ├── DashboardController.php     (5 variantes de dashboard por rol)
│   │   │   ├── DepartmentController.php    (CRUD de departamentos)
│   │   │   ├── InterventionReportController.php (Equipos + reportes de intervención + PDF)
│   │   │   ├── NotificationController.php  (Listado y marcado de notificaciones)
│   │   │   ├── ProfileController.php       (Perfil del usuario)
│   │   │   ├── ReportController.php        (PDF de ticket + constancia de satisfacción)
│   │   │   ├── ReportTemplateController.php (Plantillas de reportes administrativos)
│   │   │   ├── ReportesController.php      (Reportes administrativos + export PDF/Excel)
│   │   │   ├── RendimientoController.php   (Métricas de rendimiento por técnico)
│   │   │   ├── RolePermissionController.php (Gestión de roles, permisos, sync masivo)
│   │   │   ├── SlaConfigurationController.php (Configuración de SLA por prioridad)
│   │   │   ├── TicketController.php        (CRUD tickets + assign/transition/changePriority/changeCategory/edit)
│   │   │   └── UserManagementController.php (CRUD usuarios + reset password + toggle activo)
│   │   │
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php   (Comparte auth/permisos/flash a React)
│   │   │
│   │   └── Requests/
│   │       ├── Auth/LoginRequest.php
│   │       ├── ProfileUpdateRequest.php
│   │       ├── StoreArticleRequest.php
│   │       └── UpdateArticleRequest.php
│   │
│   ├── Models/
│   │   ├── Article.php
│   │   ├── ArticleAttachment.php
│   │   ├── Category.php
│   │   ├── Comment.php
│   │   ├── Department.php
│   │   ├── Equipment.php
│   │   ├── InterventionReport.php
│   │   ├── Notification.php
│   │   ├── Setting.php
│   │   ├── SlaConfiguration.php
│   │   ├── Ticket.php
│   │   └── User.php
│   │
│   ├── Policies/
│   │   ├── ArticlePolicy.php
│   │   └── TicketPolicy.php
│   │
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   │
│   └── Services/
│       ├── SlaCalculator.php              (Cálculo de SLA con horario laboral)
│       └── TicketStateManager.php         (Máquina de estados de tickets)
│
├── bootstrap/                              (Bootstrap de Laravel + service providers)
├── config/                                 (Configuraciones: app, auth, permission, dompdf, etc.)
├── database/
│   ├── factories/
│   ├── migrations/                         (30 archivos, ver sección 4)
│   ├── seeders/
│   │   ├── AdminSeeder.php
│   │   ├── ArticleSeeder.php
│   │   ├── DatabaseSeeder.php
│   │   ├── DemoDataSeeder.php
│   │   ├── RoleSeeder.php
│   │   └── SlaConfigurationSeeder.php
│   └── database.sqlite                     (Fallback dev)
│
├── lang/                                   (i18n: en/, es/)
├── public/                                 (Web root + assets compilados en build/)
├── resources/
│   ├── css/
│   │   └── app.css                         (Tailwind entrypoint + @theme con colores institucionales)
│   │
│   ├── js/
│   │   ├── app.jsx                         (Bootstrap Inertia + SSR)
│   │   ├── Components/                     (UI primitives + helpers: Modal, Pagination, charts, etc.)
│   │   ├── Layouts/
│   │   │   ├── AuthenticatedLayout.jsx     (Sidebar + header)
│   │   │   └── GuestLayout.jsx
│   │   ├── lib/
│   │   │   ├── sweet-alert.js
│   │   │   └── utils.js                    (cn() — clsx + tailwind-merge)
│   │   └── Pages/
│   │       ├── Auth/                       (Login, Register, ForgotPassword, ResetPassword, etc.)
│   │       ├── Categories/                 (Index, Create, Edit)
│   │       ├── Departments/                (Index, Create, Edit)
│   │       ├── Dashboard.jsx
│   │       ├── Equipments/                 (Index, Show)
│   │       ├── Knowledge/                  (Index, Create, Edit, Show)
│   │       ├── Notifications/Index.jsx
│   │       ├── Profile/                    (Edit + Partials)
│   │       ├── Roles/Index.jsx
│   │       ├── Sla/Index.jsx
│   │       ├── Tickets/                    (Index, Create, Show)
│   │       ├── Users/                      (Index, Create, Edit)
│   │       └── Welcome.jsx
│   │
│   └── views/
│       ├── app.blade.php                   (Root Blade)
│       └── pdf/
│           ├── intervention-report.blade.php
│           ├── satisfaction-receipt.blade.php
│           ├── ticket-report.blade.php
│           └── tickets-list.blade.php
│
├── routes/
│   ├── auth.php                            (Guest + auth)
│   ├── console.php
│   └── web.php                             (Rutas autenticadas)
│
├── storage/                                (cache, sessions, logs, uploads)
├── tests/                                  (Pest: Feature + Unit)
│
├── composer.json
├── package.json
├── vite.config.js
├── tailwind.config.js
├── jsconfig.json
├── docker-compose.yml
├── Dockerfile
├── docker-entrypoint.sh
└── phpunit.xml
```

---

## 4. Base de Datos — Tablas y Migraciones

### Migraciones (orden cronológico)

| # | Migración | Tabla(s) afectada(s) |
|---|---|---|
| 1 | `0001_01_01_000000_create_users_table` | `users`, `password_reset_tokens`, `sessions` |
| 2 | `0001_01_01_000001_create_cache_table` | `cache`, `cache_locks` |
| 3 | `0001_01_01_000002_create_jobs_table` | `jobs`, `job_batches`, `failed_jobs` |
| 4 | `2026_05_29_205244_create_permission_tables` | `permissions`, `roles`, `model_has_permissions`, `model_has_roles`, `role_has_permissions` |
| 5 | `2026_05_29_210437_create_departments_table` | `departments` |
| 6 | `2026_05_29_210438_create_categories_table` | `categories` |
| 7 | `2026_05_29_210439_add_fields_to_users_table` | + `last_name`, `phone_number`, `department_id`, `is_active` en `users` |
| 8 | `2026_05_29_210440_create_tickets_table` | `tickets`, `ticket_sequences` |
| 9 | `2026_05_29_210441_create_comments_table` | `comments` |
| 10 | `2026_05_29_210442_create_notifications_table` | `notifications` |
| 11 | `2026_05_29_211506_add_sla_deadlines_to_tickets_table` | + `sla_response_deadline`, `sla_resolution_deadline` en `tickets` |
| 12 | `2026_05_30_102408_replace_head_of_area_with_foreign_key_in_departments` | `head_of_area_id` FK en `departments` |
| 13 | `2026_06_09_083448_make_category_id_nullable_on_tickets` | `category_id` → nullable |
| 14 | `2026_06_09_091614_add_position_to_users` | + `position` en `users` |
| 15 | `2026_06_09_093549_add_photo_path_to_comments` | + `photo_path` en `comments` |
| 16 | `2026_06_09_095912_create_settings_table` | `settings` (key-value) |
| 17 | `2026_06_09_095912_create_sla_configurations_table` | `sla_configurations` |
| 18 | `2026_06_09_111114_create_knowledge_articles_table` | `knowledge_articles` |
| 19 | `2026_06_20_000000_add_tracking_timestamps_to_tickets_table` | + `responded_at`, `in_progress_at`, `resolved_at` en `tickets` |
| 20 | `2026_06_20_000001_extend_knowledge_articles_table` | + `fts_vector`, otros campos en `knowledge_articles` |
| 21 | `2026_06_20_000002_create_article_category_table` | `article_category` (pivot) |
| 22 | `2026_06_20_000003_create_article_attachments_table` | `article_attachments` |
| 23 | `2026_06_20_000004_create_equipment_table` | `equipment` |
| 24 | `2026_06_20_000005_create_intervention_reports_table` | `intervention_reports` |
| 25 | `2026_06_20_000006_add_module_to_permissions_table` | + `module` en `permissions` |
| 26 | `2026_06_20_000007_add_dashboard_template_to_roles_table` | + `dashboard_template` en `roles` |
| 27 | `2026_06_27_000001_add_admin_sections_permissions` | Permisos adicionales |
| 28 | `2026_06_28_000001_add_department_id_to_equipment_table` | + `department_id` en `equipment` |
| 29 | `2026_06_28_000001_remove_orphan_metricas_permission` | Limpieza de permiso huérfano |
| 30 | `2026_06_29_000002_recreate_report_templates_table` | `report_templates` |

### Tablas de dominio — columnas clave

#### `users`
`id`, `name`, `last_name`, `email`, `phone_number`, `password`, `position`, `department_id` (FK), `is_active`, `email_verified_at`, `remember_token`, timestamps, soft delete.

#### `departments`
`id`, `name`, `physical_address`, `head_of_area_id` (FK → users), timestamps, soft delete.

#### `categories`
`id`, `name`, `description`, timestamps.

#### `tickets`
`id`, `code` (formato `TKT-YYYY-NNNN`), `title`, `description`, `priority` (enum), `status` (enum), `creator_id` (FK), `assigned_id` (FK nullable), `category_id` (FK nullable), `photo_path`, `entry_date`, `exit_date`, `responded_at`, `in_progress_at`, `resolved_at`, `sla_response_deadline`, `sla_resolution_deadline`, timestamps, soft delete.

#### `ticket_sequences`
`year`, `last_sequence` — usado por `Ticket::generateCode()` con `lockForUpdate()` para generación atómica de códigos anuales.

#### `comments`
`id`, `ticket_id` (FK), `user_id` (FK), `body` (text), `photo_path` (nullable), `is_internal` (boolean), timestamps.

#### `notifications`
`id`, `user_id` (FK), `ticket_id` (FK nullable), `type`, `title`, `message`, `read_at` (nullable), timestamps.

#### `sla_configurations`
`id`, `priority` (string), `response_minutes` (int), `resolution_hours` (int).

#### `settings`
`id`, `key`, `value`, timestamps. Acceso estático: `Setting::get(key, default)` y `Setting::set(key, value)`.

#### `equipment`
`id`, `sku`, `brand`, `model`, `processor`, `ram_memory`, `storage_disk`, `department_id` (FK), timestamps.

#### `intervention_reports`
`id`, `ticket_id` (FK), `equipment_id` (FK), `diagnostic` (text), timestamps.

#### `knowledge_articles`
`id`, `title`, `slug`, `content`, `status` (enum: draft/published), `author_id` (FK → users), `fts_vector` (PostgreSQL full-text), timestamps.

#### `article_attachments`
`id`, `article_id` (FK), `filename`, `path`, `mime_type`, `size`.

#### `article_category` (pivot)
`article_id`, `category_id`.

#### `report_templates`
Configuración de plantillas de reportes administrativos.

### 4.1 Relaciones entre Modelos

```
User
 ├─ belongsTo Department
 ├─ hasMany Ticket (creator_id)
 ├─ hasMany Ticket (assigned_id)
 ├─ hasMany Comment
 ├─ hasMany Notification
 └─ hasMany roles (Spatie) → hasMany permissions

Ticket (core)
 ├─ belongsTo User (creator_id)
 ├─ belongsTo User (assigned_id)
 ├─ belongsTo Category
 ├─ hasMany Comment
 ├─ hasMany Notification
 ├─ hasMany InterventionReport
 └─ hasOne creator.department (vía User)

Comment
 ├─ belongsTo Ticket
 └─ belongsTo User

Category
 ├─ hasMany Ticket
 └─ belongsToMany Article (pivot: article_category)

Department
 ├─ hasMany User
 └─ belongsTo User (head_of_area_id)

Equipment
 ├─ belongsTo Department
 └─ hasMany InterventionReport

InterventionReport
 ├─ belongsTo Ticket
 └─ belongsTo Equipment

Article
 ├─ belongsTo User (author_id)
 ├─ belongsToMany Category (pivot: article_category)
 └─ hasMany ArticleAttachment

ArticleAttachment
 └─ belongsTo Article

Notification
 ├─ belongsTo User
 └─ belongsTo Ticket

SlaConfiguration → tabla independiente (lookup por priority)
Setting → tabla independiente (key-value)
```

Resumen de tipos de relación:

| Modelo | Relación | Modelo relacionado | FK |
|---|---|---|---|
| User | belongsTo | Department | `department_id` |
| User | hasMany | Ticket (creados) | `creator_id` |
| User | hasMany | Ticket (asignados) | `assigned_id` |
| User | hasMany | Comment | `user_id` |
| User | hasMany | Notification | `user_id` |
| Ticket | belongsTo | User (creator) | `creator_id` |
| Ticket | belongsTo | User (assigned) | `assigned_id` |
| Ticket | belongsTo | Category | `category_id` |
| Ticket | hasMany | Comment | `ticket_id` |
| Ticket | hasMany | Notification | `ticket_id` |
| Ticket | hasMany | InterventionReport | `ticket_id` |
| Comment | belongsTo | Ticket, User | `ticket_id`, `user_id` |
| Department | hasMany | User | `department_id` |
| Department | belongsTo | User (head) | `head_of_area_id` |
| Equipment | belongsTo | Department | `department_id` |
| Equipment | hasMany | InterventionReport | `equipment_id` |
| InterventionReport | belongsTo | Ticket, Equipment | `ticket_id`, `equipment_id` |
| Article | belongsTo | User (author) | `author_id` |
| Article | belongsToMany | Category | pivot `article_category` |
| Article | hasMany | ArticleAttachment | `article_id` |
| Notification | belongsTo | User, Ticket | `user_id`, `ticket_id` |

---

## 5. Arquitectura de Roles y Permisos (RBAC)

El sistema implementa RBAC con **Spatie Laravel Permission 7.4**. La columna `roles.dashboard_template` determina qué variante de dashboard se renderiza para el usuario.

### 5.1 Definición de Roles y Permisos

#### Roles base (5)

| Nombre interno | Etiqueta pública | Dashboard |
|---|---|---|
| `solicitante` | Solicitante | `solicitante` |
| `tecnico` | Técnico | `tecnico` |
| `admin_departamento` | Administrador de Departamento | `admin_departamento` |
| `admin_tickets` | Administrador de Tickets | `admin_tickets` |
| `super_admin` | Super Administrador | `super_admin` |

#### Permisos del sistema (20)

Agrupados por módulo (campo `permissions.module`):

| Módulo | Permisos |
|---|---|
| `tickets` | `crear ticket`, `gestionar ticket`, `asignar ticket`, `ver todos los tickets`, `ver tickets de direccion`, `ver tickets asignados` |
| `usuarios` | `gestionar usuarios` |
| `categorias` | `gestionar categorias` |
| `departamentos` | `gestionar departamentos` |
| `reportes` | `generar reportes` |
| `equipos` | `ver equipos`, `gestionar equipos` |
| `knowledge` | `ver articulos`, `crear articulos`, `publicar articulos`, `eliminar articulos` |
| `roles` | `gestionar roles` |
| `sla` | `gestionar sla` |
| `rendimiento` | `ver rendimiento` |
| `reportes_admin` | `ver reportes administrativos` |

La asignación rol→permiso se define en `database/seeders/RoleSeeder.php:59-107`. Ver la matriz completa en la [sección 10](#10-resumen-por-rol--matriz-de-permisos).

#### Métodos de gestión

`RolePermissionController` expone:

- `index` — listar roles con sus permisos y permisos globales.
- `store` / `update` — crear/actualizar roles; llama a `forgetCachedPermissions()` para invalidar la cache de Spatie.
- `destroy` — no permite eliminar roles base (`super_admin`, `admin_tickets`, `admin_departamento`, `tecnico`, `solicitante`).
- `storePermission` / `destroyPermission` — CRUD de permisos personalizados.
- `batchSync` — sincronización masiva de permisos por rol en una sola petición.

### 5.2 Protección de Rutas (backend)

Las rutas siguen tres patrones (`routes/web.php`):

**Patrón 1 — autenticación + verificación de email:**
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});
```

**Patrón 2 — middleware de permiso único:**
```php
Route::middleware(['permission:gestionar roles'])->group(function () {
    Route::resource('roles', RolePermissionController::class);
});
```

**Patrón 3 — múltiples permisos (OR lógico):**
```php
Route::middleware(['permission:ver equipos|gestionar equipos'])->group(function () {
    Route::get('/equipments', [InterventionReportController::class, 'index']);
});
```

**Patrón defensivo en controladores** (doble verificación):
```php
public function index()
{
    if (! request()->user()->hasPermissionTo('gestionar roles')) {
        abort(403);
    }
}
```

También se usan **Policies** (`app/Policies/ArticlePolicy.php`, `TicketPolicy.php`) que el `TicketController` invoca vía `Gate::authorize('assign', $ticket)`.

### 5.3 Transmisión del Rol al Frontend

El middleware `HandleInertiaRequests::share()` (en `app/Http/Middleware/HandleInertiaRequests.php`) inyecta en cada respuesta Inertia el siguiente bloque `auth`:

```php
[
    'user'                 => $user (con roles.permissions eager-loaded + department + full_name),
    'unread_notifications' => int,
    'latest_notifications' => Collection (últimas 3 con relación ticket),
    'role_label'           => string (etiqueta en español),
    'department_name'      => string|null,
    'all_permissions'      => array<string> (nombres de permisos, deduplicados),
]
```

Más el bloque `flash`:
```php
[
    'success'      => string|null,
    'error'        => string|null,
    'new_password' => string|null (contraseña temporal tras reset),
]
```

La transformación de `role_name` → etiqueta se hace en el propio middleware con un `match()` (líneas 28-34).

### 5.4 Uso del Rol en React

**Acceso al usuario autenticado en cualquier componente:**
```jsx
import { usePage } from '@inertiajs/react';

const { auth } = usePage().props;
const user = auth.user;
```

**Helper `can(perm)` para chequeo de permisos** (usado en `AuthenticatedLayout.jsx:96`):
```jsx
const can = (perm) => auth.all_permissions?.includes?.(perm);

if (can('gestionar roles')) {
    navItems.push({ href: route('roles.index'), label: 'Roles y Permisos' });
}
```

**Chequeo por nombre de rol** (para branching mayor):
```jsx
const isSuperAdmin = auth.user?.roles?.some(r => r.name === 'super_admin');
const isTecnico = auth.user?.roles?.some(r => r.name === 'tecnico');
```

**Consumo de `flash`:**
```jsx
const { flash } = usePage().props;
useEffect(() => {
    if (flash?.success) toastSuccess(flash.success);
    if (flash?.error) toastError(flash.error);
    if (flash?.new_password) showPasswordAlert(flash.new_password);
}, [flash]);
```

**Acceso a props de páginas:** cada `Inertia::render('Page', props)` se recibe como argumento de la función del componente (p. ej. `function Index({ users, roles, filters })`).

---

## 6. Documentación por Módulo

| Módulo | Rutas (nombre → URL) | Permiso requerido | Controlador | Página Inertia |
|---|---|---|---|---|
| **Auth** | `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `confirm-password`, `logout` | (guest/auth mixto) | `Auth/*Controller` | `Pages/Auth/*` |
| **Dashboard** | `dashboard` → `GET /dashboard` | (todos autenticados; varía por `dashboard_template`) | `DashboardController` | `Pages/Dashboard.jsx` |
| **Tickets — lista/filtro** | `tickets.index` → `GET /tickets` | (mixto: filtrado por `visibleTo`) | `TicketController::index` | `Pages/Tickets/Index.jsx` |
| **Tickets — crear** | `tickets.store` → `POST /tickets` | (autenticado) | `TicketController::store` | `Pages/Tickets/Create.jsx` |
| **Tickets — ver** | `tickets.show` → `GET /tickets/{ticket}` | (filtrado por `visibleTo`) | `TicketController::show` | `Pages/Tickets/Show.jsx` |
| **Tickets — eliminar** | `tickets.destroy` → `DELETE /tickets/{ticket}` | (mixto) | `TicketController::destroy` | — |
| **Tickets — comentar** | `tickets.comments.store` → `POST /tickets/{ticket}/comments` | (autenticado) | `CommentController::store` | (form en `Show.jsx`) |
| **Tickets — asignar** | `tickets.assign` → `POST /tickets/{ticket}/assign` | (Gate `assign`) | `TicketController::assign` | (form en `Show.jsx`) |
| **Tickets — transición** | `tickets.transition` → `POST /tickets/{ticket}/transition` | (validado en `TicketStateManager`) | `TicketController::transition` | (form en `Show.jsx`) |
| **Tickets — cambiar prioridad** | `tickets.change-priority` → `POST /tickets/{ticket}/change-priority` | (mixto) | `TicketController::changePriority` | (form en `Show.jsx`) |
| **Tickets — cambiar categoría** | `tickets.change-category` → `POST /tickets/{ticket}/change-category` | (mixto) | `TicketController::changeCategory` | (form en `Show.jsx`) |
| **Tickets — editar** | `tickets.edit` → `POST /tickets/{ticket}/edit` | (mixto) | `TicketController::editTicket` | (form en `Show.jsx`) |
| **Bandeja (admin_tickets)** | `bandeja.index` → `GET /bandeja` | `super_admin` o `admin_tickets` (vista) | `TicketController::bandeja` | — |
| **Cola (tecnico)** | `cola.index` → `GET /cola` | `tecnico` | `TicketController::cola` | — |
| **Mis Tickets** | `mis-tickets.index` → `GET /mis-tickets` | `tecnico` | `TicketController::misTickets` | — |
| **Reportes PDF** | `tickets.report.index` → `GET /tickets/report`<br>`tickets.report` → `GET /tickets/{ticket}/report`<br>`tickets.receipt` → `GET /tickets/{ticket}/receipt` | `generar reportes` | `ReportController` | (descarga directa) |
| **Usuarios** | `users.index/create/store/edit/update/destroy`, `users.toggle` → `POST /users/{user}/toggle` | `gestionar usuarios` | `UserManagementController` | `Pages/Users/Index.jsx`, `Create.jsx`, `Edit.jsx` |
| **Categorías** | `categories.index/create/store/edit/update/destroy` | `gestionar categorias` | `CategoryController` | `Pages/Categories/Index.jsx`, `Create.jsx`, `Edit.jsx` |
| **Departamentos** | `departments.index/create/store/edit/update/destroy` | `gestionar departamentos` | `DepartmentController` | `Pages/Departments/Index.jsx`, `Create.jsx`, `Edit.jsx` |
| **SLA** | `sla.index` → `GET /sla`<br>`sla.update` → `PUT /sla`<br>`sla.reset` → `POST /sla/reset` | `gestionar sla` | `SlaConfigurationController` | `Pages/Sla/Index.jsx` |
| **Roles y Permisos** | `roles.index/store/update/destroy`, `permissions.store/destroy`, `roles.permissions.sync` | `gestionar roles` | `RolePermissionController` | `Pages/Roles/Index.jsx` |
| **Equipos** | `equipments.index` → `GET /equipments`<br>`equipments.show` → `GET /equipments/{equipment}/detail`<br>`equipments.lookup` → `GET /equipments/{sku}`<br>`equipments.update` → `PATCH /equipments/{equipment}` | `ver equipos` (lectura)<br>`gestionar equipos` (modificación) | `InterventionReportController` | `Pages/Equipments/Index.jsx`, `Show.jsx` |
| **Reportes de Intervención** | `tickets.intervention-report.generate` → `POST /tickets/{ticket}/intervention-report`<br>`intervention-reports.pdf` → `GET /intervention-reports/{report}/pdf` | `gestionar equipos` | `InterventionReportController` | — |
| **Base de Conocimiento (KB)** | `articles.index` → `GET /kb`<br>`articles.search` → `GET /kb/search`<br>`articles.create` → `GET /kb/create`<br>`articles.store` → `POST /kb`<br>`articles.show` → `GET /kb/{slug}`<br>`articles.edit` → `GET /kb/{slug}/edit`<br>`articles.update` → `PUT /kb/{slug}`<br>`articles.destroy` → `DELETE /kb/{slug}`<br>`articles.publish` → `PUT /kb/{slug}/publish` | `ver articulos` (lectura)<br>`crear articulos` (crear/editar)<br>`publicar articulos` (publicar)<br>`eliminar articulos` (eliminar) | `ArticleController` | `Pages/Knowledge/Index.jsx`, `Create.jsx`, `Edit.jsx`, `Show.jsx` |
| **Notificaciones** | `notifications.index` → `GET /notifications`<br>`notifications.read` → `POST /notifications/{notification}/read`<br>`notifications.read-all` → `POST /notifications/read-all` | (todos autenticados) | `NotificationController` | `Pages/Notifications/Index.jsx` |
| **Rendimiento** | `rendimiento.index` → `GET /rendimiento` | `ver rendimiento` | `RendimientoController` | — |
| **Reportes Administrativos** | `reportes.index` → `GET /reportes`<br>`reportes.export-pdf` → `GET /reportes/export-pdf`<br>`reportes.export-excel` → `GET /reportes/export-excel`<br>`report-templates.store/update/destroy` | `ver reportes administrativos` | `ReportesController`, `ReportTemplateController` | — |
| **Perfil** | `profile.edit/update/destroy` | (todos autenticados) | `ProfileController` | `Pages/Profile/Edit.jsx` |

---

## 7. Lógica de Sincronización de Datos

### 7.1 Regla de Negocio Oficial

El sistema mantiene **tres vectores de sincronización** que garantizan consistencia entre la base de datos, la sesión autenticada y la UI renderizada en React:

1. **Visibilidad de tickets por rol** — cada consulta de tickets se filtra según el rol del usuario autenticado (`scopeVisibleTo` en el modelo `Ticket`).
2. **Notificaciones en cascada** — toda acción que afecta a un ticket (crear, asignar, transicionar, comentar) dispara notificaciones in-app a los usuarios relevantes, que se inyectan en el menú de campana del layout autenticado.
3. **Dashboard reactivo al `dashboard_template`** — la variante de dashboard que ve cada usuario depende del campo `roles.dashboard_template`, propagado desde el backend hasta la página Inertia.

### 7.2 Capa 1 — Backend

#### Visibilidad de tickets (`app/Models/Ticket.php:76-98`)

```php
public function scopeVisibleTo($query, User $user): void
{
    if ($user->hasAnyRole(['super_admin', 'admin_tickets'])) {
        return; // ven todo
    }

    if ($user->hasRole('admin_departamento')) {
        $query->whereHas('creator', fn ($q) => $q->where('department_id', $user->department_id));
        return;
    }

    if ($user->hasRole('tecnico')) {
        $query->where(fn ($q) => $q->where('assigned_id', $user->id)->orWhere('creator_id', $user->id));
        return;
    }

    $query->where('creator_id', $user->id); // solicitante: sólo los propios
}
```

Cualquier consulta de tickets debe encadenar `->visibleTo($user)` para aplicar la regla.

#### Propagación de auth al frontend (`HandleInertiaRequests.php:23-47`)

```php
$user->load(['roles.permissions', 'department']);
$user->append('full_name');

$auth = [
    'user'                 => $user,
    'unread_notifications' => $user->notifications()->unread()->count(),
    'latest_notifications' => $user->notifications()->with('ticket')->latest()->take(3)->get(),
    'role_label'           => $roleLabels[$user->roles->first()?->name] ?? $user->roles->first()?->name,
    'department_name'      => $user->department?->name,
    'all_permissions'      => $user->roles->flatMap(fn ($r) => $r->permissions->pluck('name'))->unique()->values(),
];
```

#### Invalidación de cache de permisos

Cada vez que se modifican roles/permisos, el sistema invalida explícitamente la cache de Spatie:

```php
app()[Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
```

(ver `RolePermissionController.php:67, 86, 158`).

#### Configuración dinámica consumida por backend

`Setting::get(key, default)` provee parámetros dinámicos a `SlaCalculator`:

| Key | Default | Uso |
|---|---|---|
| `work_start` | `08:00` | Hora de inicio de jornada laboral |
| `work_end` | `15:00` | Hora de fin de jornada laboral |
| `work_days` | `monday,tuesday,wednesday,thursday,friday` | Días laborables |

#### Notificaciones en cascada

| Evento | Destinatario(s) | Origen |
|---|---|---|
| Ticket creado | Admins tickets / super admin | `TicketController::store` (línea 259) |
| Ticket asignado | Técnico asignado | `TicketController::assign` (línea 385) |
| Ticket transicionado | Creador del ticket | `TicketController::transition` (línea 420) |
| Comentario nuevo (no interno) | Creador + técnico asignado (si no es el autor) | `CommentController::store` (líneas 39, 49) |

El conteo de no leídas y las últimas 3 se inyectan automáticamente en cada request a través del middleware Inertia.

#### Máquina de estados

`TicketStateManager::transition()` valida la transición contra la matriz permitida en `TicketStatus::allowedTransitions()` y los permisos del usuario antes de actualizar el estado y los timestamps (`in_progress_at`, `resolved_at`, `exit_date`).

### 7.3 Capa 2 — Frontend

#### Consumo del contexto de autenticación

En `AuthenticatedLayout.jsx`:

```jsx
const { auth } = usePage().props;
const user = auth?.user;
const unreadCount = auth?.unread_notifications ?? 0;
const latestNotifications = auth?.latest_notifications ?? [];
const can = (perm) => auth.all_permissions?.includes?.(perm);
```

#### Renderizado condicional de menú

Los items del sidebar se agregan en función de permisos o rol:

```jsx
if (can('ver articulos'))      navItems.push({ href: route('articles.index'), label: 'Base de Conocimiento', icon: BookOpen });
if (can('ver equipos'))         navItems.push({ href: route('equipments.index'), label: 'Equipos', icon: Monitor });
if (can('gestionar usuarios'))  navItems.push({ href: route('users.index'), label: 'Usuarios', icon: Users });
if (can('gestionar roles'))     navItems.push({ href: route('roles.index'), label: 'Roles y Permisos', icon: Shield });
if (can('gestionar sla'))       navItems.push({ href: route('sla.index'), label: 'Tiempos de Respuesta', icon: Clock });
if (can('ver rendimiento'))     navItems.push({ href: route('rendimiento.index'), label: 'Rendimiento', icon: TrendingUp });
if (can('ver reportes administrativos')) {
    navItems.push({ href: route('reportes.index'), label: 'Reportes', icon: ClipboardList });
}
```

Y por nombre de rol:

```jsx
const isAdminOrSuper = auth.user?.roles?.some(r => ['super_admin', 'admin_tickets'].includes(r.name));
const isTecnico = auth.user?.roles?.some(r => r.name === 'tecnico');
```

#### Reactividad a `flash`

```jsx
function useFlash() {
    const { flash } = usePage().props;
    useEffect(() => {
        if (flash.new_password) showPasswordAlert(flash.new_password);
        if (flash.success)      toastSuccess(flash.success);
        if (flash.error)        toastError(flash.error);
    }, [flash]);
}
```

#### Persistencia local

El estado de la barra lateral se persiste en `localStorage`:

```jsx
const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar_expanded');
    return saved !== null ? saved === 'true' : true;
});
```

#### Patrón de uso de `usePage`

| Necesidad | Acceso |
|---|---|
| Datos de página (props del `Inertia::render`) | Argumentos de la función componente, o `usePage().props` |
| Usuario autenticado | `usePage().props.auth.user` |
| Permiso específico | `auth.all_permissions?.includes(perm)` o helper `can()` |
| Etiqueta de rol | `auth.role_label` |
| Departamento | `auth.department_name` |
| Notificaciones | `auth.unread_notifications`, `auth.latest_notifications` |
| Mensajes flash | `usePage().props.flash` |
| Generación de URL de ruta | `route('nombre.ruta', params)` (vía Ziggy) |

---

## 8. Comandos de Instalación y Configuración

### Opción 1 — Docker (recomendada)

```bash
git clone <repositorio> sistema-tickets
cd sistema-tickets
cp .env.example .env
docker compose up --build -d
```

- Aplicación disponible en `http://localhost:8000`.
- PostgreSQL expuesto en `localhost:5433`.
- El entrypoint ejecuta `migrate:fresh --seed` la primera vez y `migrate` en arranques posteriores.

Para resetear datos demo:
```bash
docker compose exec app php artisan migrate:fresh --seed
```

Para actualizar tras `git pull`:
```bash
docker compose up -d --build
```

### Opción 2 — Manual

Requisitos: PHP 8.3+, Composer, Node.js 20+, PostgreSQL 16 (o SQLite).

```bash
git clone <repositorio> sistema-tickets
cd sistema-tickets
composer install
npm install
cp .env.example .env
php artisan key:generate

# Editar .env: DB_CONNECTION=pgsql, DB_HOST=127.0.0.1, DB_DATABASE=sistema_tickets, DB_USERNAME, DB_PASSWORD

php artisan migrate
php artisan db:seed
npm run build
php artisan serve
```

### Desarrollo con hot-reload

```bash
composer dev
```

Levanta concurrentemente: `php artisan serve`, `queue:listen`, `pail`, `vite dev` (definido en `composer.json:51-54`).

### Credenciales seed

| Email | Contraseña |
|---|---|
| `admin@alcaldia.gob.ve` | `admin123` |

El resto de usuarios del seeder de demo tienen contraseña `password`.

### Comandos útiles adicionales

```bash
php artisan optimize:clear           # Limpia caches de config, rutas y vistas
php artisan test                      # Ejecuta suite Pest
php artisan route:list                # Lista todas las rutas
php artisan tinker                    # Consola interactiva
./vendor/bin/pint                     # Formatea el código PHP
```

---

## 9. Tabla de Referencia Rápida

| Necesito… | Ir a… |
|---|---|
| Lógica de transición de estado | `app/Services/TicketStateManager.php` |
| Cálculo de SLA con horario laboral | `app/Services/SlaCalculator.php` |
| Modelo principal de tickets + `scopeVisibleTo` | `app/Models/Ticket.php` |
| Generación de códigos `TKT-YYYY-NNNN` | `app/Models/Ticket.php::generateCode()` |
| Relación usuario ↔ roles ↔ permisos | `app/Models/User.php` + `vendor/spatie/laravel-permission` |
| Inyección de `auth` y `flash` al frontend | `app/Http/Middleware/HandleInertiaRequests.php` |
| Definición de roles y permisos base | `database/seeders/RoleSeeder.php` |
| Gestión de roles desde la UI | `app/Http/Controllers/RolePermissionController.php` + `resources/js/Pages/Roles/Index.jsx` |
| Plantillas PDF (ticket, constancia, intervención, lista) | `resources/views/pdf/*.blade.php` |
| Layout autenticado (sidebar, header, notificaciones) | `resources/js/Layouts/AuthenticatedLayout.jsx` |
| Renderizar variante de dashboard por rol | `app/Http/Controllers/DashboardController.php` (5 ramas por `usesDashboard()`) |
| Definición de colores institucionales | `resources/css/app.css` (directiva `@theme`) |
| Catálogo de rutas y permisos | `routes/web.php` |
| Catálogo de migraciones | `database/migrations/` |
| Configuración de entorno | `.env.example` |
| Configuración de Docker | `docker-compose.yml`, `Dockerfile`, `docker-entrypoint.sh` |
| Dependencias PHP | `composer.json` |
| Dependencias JS | `package.json` |
| Alias de paths JS | `vite.config.js` y `jsconfig.json` |
| Política de autorización de tickets | `app/Policies/TicketPolicy.php` |
| Política de artículos | `app/Policies/ArticlePolicy.php` |
| Helpers UI (alert, toast) | `resources/js/lib/sweet-alert.js` |
| Tour guiado del sistema | `resources/js/Components/Tour.jsx` |

---

## 10. Resumen por Rol — Matriz de Permisos

Leyenda: `✓` = permiso asignado en `RoleSeeder.php`. Los espacios en blanco indican permiso no asignado. El permiso `ver tickets de direccion` se aplica implícitamente vía `scopeVisibleTo` para `admin_departamento`.

| Permiso | solicitante | tecnico | admin_departamento | admin_tickets | super_admin |
|---|:-:|:-:|:-:|:-:|:-:|
| `crear ticket` | ✓ |  |  | ✓ | ✓ |
| `gestionar ticket` |  | ✓ |  | ✓ | ✓ |
| `asignar ticket` |  |  |  | ✓ | ✓ |
| `ver todos los tickets` |  |  |  | ✓ | ✓ |
| `ver tickets de direccion` |  |  | (vía scope) |  |  |
| `ver tickets asignados` |  | ✓ |  |  |  |
| `gestionar usuarios` |  |  |  |  | ✓ |
| `gestionar categorias` |  |  |  |  | ✓ |
| `gestionar departamentos` |  |  |  |  | ✓ |
| `generar reportes` |  | ✓ |  | ✓ | ✓ |
| `ver equipos` |  | ✓ |  | ✓ | ✓ |
| `gestionar equipos` |  | ✓ |  | ✓ | ✓ |
| `ver articulos` |  | ✓ |  | ✓ | ✓ |
| `crear articulos` |  | ✓ |  | ✓ | ✓ |
| `publicar articulos` |  |  |  | ✓ | ✓ |
| `eliminar articulos` |  |  |  |  | ✓ |
| `gestionar roles` |  |  |  |  | ✓ |
| `gestionar sla` |  |  |  |  | ✓ |
| `ver rendimiento` |  |  |  | ✓ | ✓ |
| `ver reportes administrativos` |  |  |  | ✓ | ✓ |

### Capacidades por rol (resumen funcional)

#### Solicitante
- Crear tickets propios.
- Ver únicamente los tickets que ha creado (`scopeVisibleTo`).
- Cerrar un ticket propio cuando está en estado `Resuelto`.
- Reabrir (`Cerrado → Abierto`) un ticket propio.
- Consultar la base de conocimiento (si la organización lo permite, vía módulo `knowledge`).

#### Técnico
- Ver tickets asignados a él o creados por él.
- Transicionar sus tickets a `En Proceso`, `Pendiente de Información` o `Resuelto`.
- Comentar con notas públicas o internas (`is_internal`).
- Generar PDF de ticket.
- Acceder al inventario de equipos y reportes de intervención.
- Crear y editar artículos de la base de conocimiento.

#### Administrador de Departamento
- Ver tickets cuyo creador pertenece a su departamento.
- Cerrar tickets propios cuando están en `Resuelto`.
- Reportes filtrados a su departamento en el dashboard.
- Sin permisos administrativos globales (usuarios, categorías, etc.).

#### Administrador de Tickets
- Ver todos los tickets del sistema.
- Asignar técnicos, cambiar prioridad y categoría.
- Transicionar cualquier ticket sin restricción de asignación.
- Ver rendimiento agregado de técnicos.
- Ver reportes administrativos.
- Publicar artículos de la base de conocimiento.

#### Super Administrador
- Acceso completo: CRUD de usuarios, categorías, departamentos, SLA, roles, permisos.
- Todas las capacidades de los demás roles.
- Único rol con permiso `eliminar articulos` y `gestionar roles`.
