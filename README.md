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

Puedes inicializar y ejecutar este proyecto de dos maneras: usando **Docker** (recomendado para un despliegue rápido y demo) o de forma **Manual**.

### Opción 1: Con Docker (Recomendado)

Requiere tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/) (en Windows/Mac) o Docker Engine en Linux.

1. **Clonar el repositorio:**
   ```bash
   git clone <repositorio> sistema-tickets
   cd sistema-tickets
   ```

2. **Configurar el entorno:**
   ```bash
   cp .env.example .env
   # (Opcional) Abre .env y configura contraseñas más seguras
   ```

3. **Levantar los contenedores:**
   ```bash
   docker compose up --build -d
   ```
   *Esto descargará las imágenes oficiales, instalará las dependencias (PHP y Node), compilará el frontend y levantará la base de datos PostgreSQL.*

4. **¡Listo!**
   - El sistema estará disponible en [http://localhost:8000](http://localhost:8000)
   - La base de datos (PostgreSQL) está expuesta en el puerto `5433` de tu máquina (usuario: el que definiste en `.env`, password: el que definiste en `.env`).

> **Nota sobre los datos de demo:** Durante el primer inicio, el contenedor ejecutará automáticamente las migraciones y poblará la base de datos con información de prueba. Si en el futuro deseas limpiar la base de datos y volver a generar los datos desde cero, ejecuta:
> `docker compose exec app php artisan migrate:fresh --seed`

### Actualizar el código en Producción (Docker)

Cuando se suban nuevas actualizaciones o correcciones de código al repositorio, los pasos para aplicar estos cambios en el servidor donde está desplegado el sistema son:

1. **Descargar los últimos cambios:**
   ```bash
   git pull
   ```

2. **Reconstruir y actualizar el contenedor:**
   ```bash
   docker compose up -d --build
   ```

**¿Qué hace este comando?**
- Construye nuevamente la imagen de la aplicación (`app`) incrustando el código fuente más reciente.
- Instala cualquier dependencia nueva y recompila el frontend (React/Vite).
- Al arrancar, el contenedor ejecuta automáticamente las migraciones pendientes en la base de datos (gracias al script interno `docker-entrypoint.sh`).
- Reemplaza el contenedor viejo por el nuevo **sin borrar ni afectar los datos** almacenados en PostgreSQL.

---

### Opción 2: Instalación Manual

**Requisitos:** PHP 8.3+, Composer, Node.js 20+, PostgreSQL 16 (o SQLite para desarrollo local).

1. **Clonar el repositorio:**
   ```bash
   git clone <repositorio> sistema-tickets
   cd sistema-tickets
   ```

2. **Instalar dependencias:**
   ```bash
   composer install
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Edita `.env` para configurar tu conexión a la base de datos:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=sistema_tickets
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password
   ```
   *(Para usar SQLite, deja `DB_CONNECTION=sqlite` y crea el archivo `database/database.sqlite`).*

4. **Ejecutar migraciones y poblar base de datos:**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Compilar assets e iniciar servidor:**
   ```bash
   npm run build
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
