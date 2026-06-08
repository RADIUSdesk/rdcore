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


echo UPDATE PATCHED DATABASE TABLES

#Apply all patches in numerical order, excluding rd.sql and rd.min.sql
for patch in /tmp/db_patches/*.sql; do
  filename=$(basename "$patch")

  #Skip rd.sql and rd.min.sql
  if [[ "$filename" == "rd.sql" || "$filename" == "rd.min.sql" ]]; then
    echo "Skipping: $filename"
    continue
  fi

  if [ -f "$patch" ]; then
    echo "Applying patch: $filename"
    mariadb -u root rd < "$patch"
  fi
done

echo COMPLETED UPDATING PATCHED DATABASE TABLES ...
