FROM jtreminio/php:8.1

ARG radiusdesk_volume

# Install dependencies and required packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        language-pack-en-base \
        nginx \
        libdatetime-perl \
        freeradius \
        freeradius-mysql \
        supervisor \
        subversion \
        cron \
        tar \
    && rm -rf /var/lib/apt/lists/*

# Create initial directories and set permissions
RUN mkdir -p /var/www/html \
    /var/www/html/cake4/rd_cake/logs \
    /var/www/html/cake4/rd_cake/webroot/files/imagecache \
    /var/www/html/cake4/rd_cake/tmp \
    /var/run/freeradius \
    /var/log/php-fpm && \
    chown -R www-data:www-data /var/www/html/cake4/rd_cake/tmp \
                               /var/www/html/cake4/rd_cake/logs \
                               /var/www/html/cake4/rd_cake/webroot/img/realms \
                               /var/www/html/cake4/rd_cake/webroot/img/dynamic_details \
                               /var/www/html/cake4/rd_cake/webroot/img/dynamic_photos \
                               /var/www/html/cake4/rd_cake/webroot/img/access_providers \
                               /var/www/html/cake4/rd_cake/webroot/img/hardwares \
                               /var/www/html/cake4/rd_cake/webroot/files/imagecache \
    && chown -R freerad:freerad /var/run/freeradius

# Copy configuration files and application source
COPY ./docker/default /etc/nginx/sites-enabled/
COPY ./docker/disable_strict_mode.cnf /etc/mysql/conf.d/
COPY ./ /var/www/rdcore
COPY ./docker/freeradius.service /lib/systemd/system/
COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./docker/php.ini /etc/php/php.ini

# Create symbolic links for app structure and compatibility
RUN ln -s /var/www/rdcore/rd /var/www/html/rd && \
    ln -s /var/www/rdcore/cake4 /var/www/html/cake4 && \
    ln -s /var/www/rdcore/cake4 /var/www/html/cake3 && \
    ln -s /var/www/rdcore/login /var/www/html/login && \
    ln -s /var/www/rdcore/AmpConf/build/production/AmpConf /var/www/html/conf_dev && \
    ln -s /var/www/rdcore/login/rd_client/build/production/AmpConf /var/www/html/usage && \
    ln -s /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting /var/www/html/reporting

# Setup cron jobs
RUN cp /var/www/html/cake4/rd_cake/setup/cron/cron4 /etc/cron.d/ && \
    chmod 0644 /etc/cron.d/cron4 && \
    crontab /etc/cron.d/cron4

# Configure FreeRADIUS
RUN mv /etc/freeradius /etc/freeradius.orig && \
    mkdir -p /etc/freeradius && \
    tar xzf /var/www/html/cake4/rd_cake/setup/radius/freeradius-3-radiusdesk.tar.gz --one-top-level=/etc/freeradius/ && \
    mv /etc/freeradius/freeradius /etc/freeradius/3.0 && \
    chown -R freerad:freerad /etc/freeradius/3.0/

# Replace default database host with external database hostname
RUN sed -i "s/'host' => 'localhost'/'host' => 'rdmariadb'/g" /var/www/html/cake4/rd_cake/config/app_local.php && \
    find /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting -type f -name "*.php" -exec sed -i "s/\$servername = \"localhost\";/\$servername = \"rdmariadb\";/g" {} + && \
    sed -i 's/server = "localhost"/server = "rdmariadb"/g' /etc/freeradius/3.0/mods-available/sql

# Copy frontend build to web root
RUN cp -R /var/www/html/rd/build/production/Rd/* /var/www/html/

# Set PHP environment variables
ENV PHP_INI_SCAN_DIR=:/p/gd \
    PHP.cgi.fix_pathinfo=1 \
    PHP_SELF=/index.php

# Expose web and RADIUS ports
EXPOSE 80/tcp 1812/udp 1813/udp

# Start all services via supervisord
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]