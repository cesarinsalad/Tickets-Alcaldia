#!/bin/sh
set -e

# Wait for PostgreSQL to accept connections
echo "Esperando que PostgreSQL esté listo..."
until php -r "
try {
    \$dsn = 'pgsql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE');
    \$db = new PDO(\$dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
" > /dev/null 2>&1; do
    echo "La base de datos aún no está lista, reintentando en 2 segundos..."
    sleep 2
done

echo "¡Base de datos conectada correctamente!"

# Run migrations and seeding
LOCK_FILE="/var/www/html/storage/app/db_seeded.lock"
if [ ! -f "$LOCK_FILE" ]; then
    echo "Primer inicio: Ejecutando migraciones y poblando base de datos con datos de demo..."
    php artisan migrate:fresh --seed --force
    touch "$LOCK_FILE"
    chown www-data:www-data "$LOCK_FILE"
    echo "¡Base de datos inicializada y poblada correctamente!"
else
    echo "La base de datos ya ha sido poblada anteriormente. Ejecutando migraciones pendientes..."
    php artisan migrate --force
fi

# Execute the container's main command
exec "$@"
