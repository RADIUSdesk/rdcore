#!/bin/bash

set -xu

docker network create --attachable -d bridge radiusdesk-bridge || exit 1

source ./.env

echo Radiusdesk 2-docker system builder v1.0
echo ---------------------------------------
echo
echo Special shout out to:
echo - Dirk van der Walt for building this brilliant software and helping debug the dockers
echo - Enock Mbewe for building the first docker version and showing the way with supervisord
echo - Keegan White for all the work on traefik and improving the iNethi architecture
echo
echo Starting Build ....
echo
echo Copying database files to volume mounts for MariaDB ...
mkdir  -p /mnt/data/radiusdesk || exit 1
mkdir  -p /mnt/data/radiusdesk/db_startup || exit 1
mkdir  -p /mnt/data/radiusdesk/db_conf || exit 1
chmod -R 777 /mnt/data/radiusdesk || exit 1
chmod -R 777 /mnt/data/radiusdesk/db_startup || exit 1
chmod -R 777 /mnt/data/radiusdesk/db_conf || exit 1

if [ -d "rdcore" ]
then
    echo "Directory rdcore exists."
else
    git clone https://github.com/RADIUSdesk/rdcore || exit 1
fi

cp rdcore/cake4/rd_cake/setup/db/rd.sql $RADIUSDESK_VOLUME/db_startup || exit 1
cp db_priveleges.sql $RADIUSDESK_VOLUME/db_startup || exit 1
cp startup.sh $RADIUSDESK_VOLUME/db_startup || exit 1
cp my_custom.cnf $RADIUSDESK_VOLUME/db_conf || exit 1

echo
echo Building docker database container ...
#docker-compose config
docker compose up -d rdmariadb || exit 1

echo
echo Waiting for MariaDB to come up ...
sleep 60

echo Creating database for Radiusdesk ...
# Build daatabase
docker exec -u 0 -it radiusdesk-mariadb /tmp/startup.sh || exit 1
echo
echo Building Radiusdesk container with nginx, php-fpm and freeradius ...

docker compose build || exit 1
docker compose up -d radiusdesk || exit 1

echo
echo All done!
