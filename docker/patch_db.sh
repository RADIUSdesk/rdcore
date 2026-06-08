#!/bin/bash

set -xu

source ./.env

echo Radiusdesk DB Patcher
echo ---------------------------------------
echo

cp rdcore/cake4/rd_cake/setup/db/* $RADIUSDESK_VOLUME/db_startup/db_patches
cp startup.sh $RADIUSDESK_VOLUME/db_startup || exit 1

echo Patching database for Radiusdesk ...
docker exec -u 0 -it radiusdesk-mariadb /tmp/startup.sh || exit 1

echo
echo All done!
