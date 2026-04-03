FROM php:8.3-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    sqlite3 \
    && docker-php-ext-install zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install Laravel dependencies
RUN composer install --optimize-autoloader --no-dev

# Create the SQLite database file
RUN mkdir -p database && touch database/database.sqlite

# Start Laravel's built-in server, explicitly binding to Render's port
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
