FROM jtreminio/php:8.1
    # We start with a nice php docker container that has all plugins we need including fpm and cli

    # Arguments we can take
    ARG radiusdesk_volume

    ## Install all software required

    # Sets up Nginx and required language pack
    RUN apt-get update
    RUN apt-get -y install language-pack-en-base
    RUN apt-get -y install nginx

    # Install Freeradius
    RUN apt-get -y install libdatetime-perl
    RUN apt-get -y install  freeradius freeradius-mysql

     # Install supervisord to start up all services - as docker only allows one process to start up
    RUN apt-get install -y supervisor

    # Install subversion to get java library
    RUN apt-get install -y subversion 

    # Prepare all directories
    COPY ./docker/default /etc/nginx/sites-enabled/
    COPY ./docker/disable_strict_mode.cnf /etc/mysql/conf.d/

    # Copy all files from the host to the container
    COPY ./AmpConf /var/www/rdcore/AmpConf
    COPY ./cake4 /var/www/rdcore/cake4
    COPY ./login /var/www/rdcore/login
    COPY ./rd /var/www/rdcore/rd

    RUN mkdir -p /var/www/html
    RUN ln -s /var/www/rdcore/rd /var/www/html/rd
    RUN ln -s /var/www/rdcore/cake4 /var/www/html/cake4
    #If backward compatibility is required for older firmware of MESHdesk
    RUN ln -s /var/www/rdcore/cake4 /var/www/html/cake3
    RUN ln -s /var/www/rdcore/login /var/www/html/login
    RUN ln -s /var/www/rdcore/AmpConf/build/production/AmpConf /var/www/html/conf_dev
    RUN ln -s /var/www/rdcore/login/rd_client/build/production/AmpConf /var/www/html/usage
    RUN ln -s /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting /var/www/html/reporting
    
    # Create requried directories
    RUN mkdir -p /var/www/html/cake4/rd_cake/logs
    RUN mkdir -p /var/www/html/cake4/rd_cake/webroot/files/imagecache
    RUN mkdir -p /var/www/html/cake4/rd_cake/tmp
    
    # Set permissions
    RUN chown -R www-data. /var/www/html/cake4/rd_cake/tmp
    RUN chown -R www-data. /var/www/html/cake4/rd_cake/logs
    RUN chown -R www-data. /var/www/html/cake4/rd_cake/webroot/img/realms
    RUN chown -R www-data. /var/www/html/cake4/rd_cake/webroot/img/dynamic_details
    RUN chown -R www-data. /var/www/html/cake4/rd_cake/webroot/img/dynamic_photos
    RUN chown -R www-data. /var/www/html/cake4/rd_cake/webroot/img/access_providers
    RUN chown -R www-data. /var/www/html/cake4/rd_cake/webroot/img/hardwares
    RUN chown -R www-data. /var/www/html/cake4/rd_cake/webroot/files/imagecache
    
    ## Setup environment variables 

    # PHP environment - these are unique to the Docker hub image jtreminio/php
    ENV PHP_INI_SCAN_DIR=:/p/gd
    ENV PHP.cgi.fix_pathinfo=1
    ENV PHP_SELF=/index.php


    ## General startup script with database init and freeradius start
    #COPY ./startup.sh /

    # Setup Cron jobs
    RUN cp /var/www/html/cake4/rd_cake/setup/cron/cron4 /etc/cron.d/
    RUN chmod 0644 /etc/cron.d/cron4
    RUN crontab /etc/cron.d/cron4

    # configure php-fpm
    RUN mkdir -p /var/log/php-fpm

    ## configure freeradius
  
    # Sets up Nginx with php-fpm and required php plugins

    RUN mv /etc/freeradius /etc/freeradius.orig
    RUN mkdir -p /etc/freeradius
    RUN tar xzf /var/www/html/cake4/rd_cake/setup/radius/freeradius-3-radiusdesk.tar.gz --one-top-level=/etc/freeradius/
    RUN mv /etc/freeradius/freeradius /etc/freeradius/3.0
    RUN chown -R freerad. /etc/freeradius/3.0/

    #RUN mkdir -p  /var/log/freeradius
    RUN mkdir -p /var/run/freeradius
    RUN chown freerad. /var/run/freeradius

    COPY ./docker/freeradius.service /lib/systemd/system/

    ## cleanup
    RUN rm -rf /var/lib/apt/lists/*

    # supervisord allows multiple processes to be started with a single process
    COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

    # Copy php settings
    COPY ./docker/php.ini /etc/php/php.ini

    # Fix the configs to point to external database
    RUN sed  -i  "s/'host' => 'localhost'/'host' => 'rdmariadb'/g" /var/www/html/cake4/rd_cake/config/app_local.php
    RUN sed  -i  "s/\$servername = \"localhost\";/\$servername = \"rdmariadb\";/g"  /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting/reporting.php
    RUN sed  -i  "s/\$servername = \"localhost\";/\$servername = \"rdmariadb\";/g"  /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting/flows_wip.php
    RUN sed  -i  "s/\$servername = \"localhost\";/\$servername = \"rdmariadb\";/g"  /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting/process_flows.php
    RUN sed  -i  "s/\$servername = \"localhost\";/\$servername = \"rdmariadb\";/g"  /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting/process_report.php
    RUN sed  -i  "s/\$servername = \"localhost\";/\$servername = \"rdmariadb\";/g"  /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting/reporting_wip.php 
    RUN sed  -i  "s/\$servername = \"localhost\";/\$servername = \"rdmariadb\";/g"  /var/www/rdcore/cake4/rd_cake/setup/scripts/reporting/send_remote_syslog.php

    # Fix the Freeradius config to point to our new database
    RUN sed  -i 's/server = \"localhost\"/server = \"rdmariadb\"/g'  /etc/freeradius/3.0/mods-available/sql

    # Copy files from production to root www
    RUN cp -R /var/www/html/rd/build/production/Rd/* /var/www/html/

    # entrypoint run script when container starts - ignores what is in command
    ENTRYPOINT /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

    # Only expose radiusdesk web front end to Teaefik and Freeradius UDP ports that bypass traefik
    EXPOSE 80/tcp
    EXPOSE 1812/udp
    EXPOSE 1813/udp



