##############################
# Stage 1 - Build Frontend
##############################
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy only the frontend assets (adjust as needed)
COPY ./rd /app/rd

# Build frontend (adjust if needed)
WORKDIR /app/rd
RUN npm install && npm run build

##############################
# Stage 2 - Main Application
##############################
FROM jtreminio/php:8.1

ARG radiusdesk_volume

# Install required packages
RUN apt-get update && \
    apt-get install -y \
        language-pack-en-base \
        nginx \
        libdatetime-perl \
        freeradius freeradius-mysql \
        supervisor \
    && rm -rf /var/lib/apt/lists/*

# Nginx and MySQL config
COPY ./docker/default /etc/nginx/sites-enabled/
COPY ./docker/disable_strict_mode.cnf /etc/mysql/conf.d/

# Copy application files
COPY ./AmpConf /var/www/rdcore/AmpConf
COPY ./cake4 /var/www/rdcore/cake4
COPY ./login /var/www/rdcore/login
COPY ./rd /var/www/rdcore/rd

# Copy compiled frontend from builder stage
COPY --from=frontend-builder /app/rd/build/production/Rd/ /var/www/html/

# Create symbolic links and set permissions
RUN mkdir -p /var/www/html && \
    ln -s /var/www/rdcore/rd /var/www/html/rd && \
    ln -s /var/www/rdcore/cake4 /var/www/html/cake4 && \
    ln -s /var/www/rdcore/cake4 /var/www/html/cake3 && \
    ln -s /var/www/rdcore/login /var/www/html/login && \
    ln -s /var/www/rdcore/AmpConf/build/production/AmpConf /var/www/html/conf_dev && \
    ln -s /var/www/rdcore/login/rd_client/build/production/AmpConf /var/www/html/usage && \
    ln -s /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting /var/www/html/reporting && \
    mkdir -p \
        /var/www/html/cake4/rd_cake/logs \
        /var/www/html/cake4/rd_cake/webroot/files/imagecache \
        /var/www/html/cake4/rd_cake/tmp && \
    chown -R www-data:www-data \
        /var/www/html/cake4/rd_cake/tmp \
        /var/www/html/cake4/rd_cake/logs \
        /var/www/html/cake4/rd_cake/webroot/img/realms \
        /var/www/html/cake4/rd_cake/webroot/img/dynamic_details \
        /var/www/html/cake4/rd_cake/webroot/img/dynamic_photos \
        /var/www/html/cake4/rd_cake/webroot/img/access_providers \
        /var/www/html/cake4/rd_cake/webroot/img/hardwares \
        /var/www/html/cake4/rd_cake/webroot/files/imagecache

# PHP environment variables
ENV PHP_INI_SCAN_DIR=:/p/gd \
    PHP.cgi.fix_pathinfo=1 \
    PHP_SELF=/index.php

# Setup cron jobs
RUN cp /var/www/html/cake4/rd_cake/setup/cron/cron4 /etc/cron.d/ && \
    chmod 0644 /etc/cron.d/cron4 && \
    crontab /etc/cron.d/cron4

# Setup FreeRADIUS
RUN mkdir -p /var/log/php-fpm /var/run/freeradius && \
    chown freerad:freerad /var/run/freeradius && \
    mv /etc/freeradius /etc/freeradius.orig && \
    mkdir -p /etc/freeradius && \
    tar xzf /var/www/html/cake4/rd_cake/setup/radius/freeradius-3-radiusdesk.tar.gz --one-top-level=/etc/freeradius/ && \
    mv /etc/freeradius/freeradius /etc/freeradius/3.0 && \
    chown -R freerad:freerad /etc/freeradius/3.0/

COPY ./docker/freeradius.service /lib/systemd/system/

# Supervisor and PHP configuration
COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./docker/php.ini /etc/php/php.ini

# Fix DB connection strings
RUN sed -i "s/'host' => 'localhost'/'host' => 'rdmariadb'/g" /var/www/html/cake4/rd_cake/config/app_local.php && \
    find /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting/ -type f -name "*.php" -exec sed -i "s/\$servername = \"localhost\";/\$servername = \"rdmariadb\";/g" {} \; && \
    sed -i 's/server = "localhost"/server = "rdmariadb"/g' /etc/freeradius/3.0/mods-available/sql

    
# Expose services
EXPOSE 80/tcp
EXPOSE 1812/udp
EXPOSE 1813/udp

# Startup command
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]