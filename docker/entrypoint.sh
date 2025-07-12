#!/bin/bash

# Fix permissions for mounted volumes
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/tmp
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/logs
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/realms
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/dynamic_details
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/dynamic_photos
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/access_providers
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/hardwares
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/files/imagecache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
