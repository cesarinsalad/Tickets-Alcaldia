<div align="center">
  <h1>Sistema de Tickets</h1>
  <p>Sistema de gestión de incidencias técnicas para entes gubernamentales</p>
  <p>
    <a href="#características">Características</a> •
    <a href="#stack-tecnológico">Stack</a> •
    <a href="#roles-y-permisos">Roles</a> •
    <a href="#instalación">Instalación</a> •
    <a href="#uso">Uso</a>
  </p>
</div>

---

Sistema web para la gestión de tickets de soporte técnico diseñado para una alcaldía. Permite a empleados municipales reportar incidencias técnicas, a técnicos dar seguimiento, y a administradores supervisar los tiempos de respuesta y resolución.

## Características

- **Creación de tickets** con prioridad, categoría y foto adjunta.
- **Máquina de estados** con 5 estados: `Abierto → En Proceso → Pendiente de Info → Resuelto → Cerrado`.
- **SLA (Acuerdo de Nivel de Servicio)** con cálculo basado en horas laborables (lun–vie 08:00–15:00).
  - Límites por prioridad: Crítica (1h), Alta (4h), Media (24h), Baja (72h).
- **Notificaciones** automáticas al crear, asignar o cambiar estado de un ticket.
- **Panel de control** con KPIs, gráficos y cola de trabajo por rol.
- **Generación de PDFs**: reporte de ticket y constancia de satisfacción.
- **Roles y permisos** con 5 niveles de acceso.
- **Interfaz en español**, zona horaria `America/Caracas`.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Laravel 13 + PHP 8.3 |
| **Frontend** | React 18 + Inertia.js 2 + Tailwind CSS 4 |
| **Base de datos** | PostgreSQL 16 (o SQLite en desarrollo) |
| **Autenticación** | Laravel Breeze + Sanctum |
| **Roles** | Spatie Laravel Permission |
| **PDF** | barryvdh/laravel-dompdf |
| **Gráficos** | Recharts |
| **UI** | Radix UI + Lucide Icons + Shadcn/ui |
| **Testing** | Pest PHP |

## Roles y Permisos

| Rol | Descripción | Permisos clave |
|-----|------------|----------------|
| **Solicitante** | Empleado municipal | Crear tickets, ver sus tickets, cerrar resueltos, generar constancia |
| **Técnico** | Soporte técnico | Ver tickets asignados, transicionar estados, comentar (público e interno) |
| **Admin Departamento** | Jefe de departamento | Ver tickets de su depto, cerrar tickets propios, ver usuarios |
| **Admin Tickets** | Coordinador de Informática | Ver todos los tickets, asignar técnicos, cambiar prioridad, notas internas, ver usuarios (solo lectura) |
| **Super Admin** | Administrador general | CRUD completo de usuarios, categorías, departamentos; todos los permisos anteriores |

## Estados del Ticket

```
Abierto ──────────► En Proceso ────────► Resuelto ────────► Cerrado
     │                    │                                   │
     └──► Pendiente de   └► Pendiente de                      └──► Abierto
          Info             Info                                   (reapertura)
```

## Instalación

### Requisitos

- PHP 8.3+
- Composer
- Node.js 20+
- PostgreSQL 16 (o SQLite para desarrollo local)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repositorio> sistema-tickets
cd Tickets-Alcaldia

# 2. Instalar dependencias PHP
composer install

# 3. Instalar dependencias JavaScript
npm install

# 4. Copiar y configurar variables de entorno
cp .env.example .env
php artisan key:generate
```

Editar `.env`:

```env
APP_NAME="Sistema de Tickets"
APP_LOCALE=es
APP_TIMEZONE=America/Caracas

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sistema_tickets
DB_USERNAME=postgres
DB_PASSWORD=tu_password
```
*Para desarrollo con SQLite, dejar `DB_CONNECTION=sqlite` y crear `database/database.sqlite`.*

```bash
# 5. Ejecutar migraciones
php artisan migrate

# 6. Poblar la base de datos con datos de demostración
php artisan db:seed

# 7. Compilar assets frontend
npm run build

# 8. Iniciar servidor de desarrollo
php artisan serve
```

### Usuario administrador por defecto

| Email | Contraseña |
|-------|-----------|
| admin@alcaldia.gob.ve | admin123 |

### Datos de demostración

El seeder `DemoDataSeeder` genera:
- **10 departamentos** (Informática, Recursos Humanos, Contraloría, etc.)
- **10 categorías** (Hardware, Software, Red, etc.)
- **~50 usuarios** con roles distribuidos
- **105 tickets** con estados, prioridades y fechas variadas
- **Comentarios** y **notificaciones** asociadas
- El resto de usuarios del seeder tienen como contraseña *password*
