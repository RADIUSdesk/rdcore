#!/bin/bash

FLAG="/firstboot.log"

if [[ ! -f $FLAG ]]; then
   #Put here your initialization sentences
   sleep 10

   # /proc/1/fd/1 sends output to docker logs
   #echo BUILDING RD DATABASE ...| tee /proc/1/fd/1  /var/log/init.log 
   echo BUILDING RD DATABASE ...

   # configure database
   echo -- CONFIGURE TIME ZONES
   mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root  mysql

   sleep 10
   echo -- CONFIGURE PRIVELEGES
   mysql -u root < /tmp/db_priveleges.sql

   sleep 2
   echo -- IMPORT RADIUSDESK TABLES
   # Populate database
   mysql -u root rd < /tmp/rd.sql
   #the next line creates an empty file so it won't run the next boot
   touch "$FLAG"

   #echo COMPLETED DATABASE BUILD ...| tee /proc/1/fd/1 /var/log/init.log 
   echo COMPLETED DATABASE BUILD ...
fi