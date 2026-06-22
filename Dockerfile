# --- Etapa de compilación del frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# --- Etapa de ejecución de la aplicación ---
FROM php:8.3-apache

WORKDIR /var/www/html

# Instalar dependencias del sistema y extensiones de PHP necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql zip gd opcache \
    && rm -rf /var/lib/apt/lists/*

# Configurar el Document Root de Apache a la carpeta public de Laravel
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Habilitar mod_rewrite de Apache para Laravel
RUN a2enmod rewrite

# Copiar Composer desde la imagen oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar el código del proyecto
COPY . .

# Copiar los assets compilados por Vite en la etapa anterior
COPY --from=frontend-builder /app/public/build ./public/build

# Instalar las dependencias de Composer optimizando
RUN composer install --optimize-autoloader --no-interaction

# Asignar permisos correctos a las carpetas de almacenamiento y caché de Laravel
RUN chown -R www-data:www-data storage bootstrap/cache

# Configuración básica de OPcache
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=2'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
} > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Exponer el puerto 80
EXPOSE 80

# Definir el script de entrada y el comando por defecto
ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]
CMD ["apache2-foreground"]
