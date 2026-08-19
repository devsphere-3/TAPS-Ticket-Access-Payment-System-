#!/bin/bash

# Install composer dependencies
composer install --optimize-autoloader --no-dev --no-interaction

# Copy env example jika .env belum ada
if [ ! -f .env ]; then
  cp .env.example .env
fi

# Generate app key
php artisan key:generate --force

# Cache config untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache
