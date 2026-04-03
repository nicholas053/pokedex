#!/bin/sh
set -e

PORT="${PORT:-80}"

# Render (and similar platforms) route traffic to $PORT inside the container.
# Default php:8.3-apache listens on 80 only, which causes 502 from the edge proxy.
if grep -q '^Listen 80$' /etc/apache2/ports.conf 2>/dev/null; then
  sed -i "s/^Listen 80\$/Listen ${PORT}/" /etc/apache2/ports.conf
elif grep -q '^Listen 0.0.0.0:80$' /etc/apache2/ports.conf 2>/dev/null; then
  sed -i "s/^Listen 0.0.0.0:80\$/Listen 0.0.0.0:${PORT}/" /etc/apache2/ports.conf
else
  sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
fi

sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

cd /var/www/html
php artisan migrate --force --no-interaction

exec "$@"
