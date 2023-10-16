drop procedure if exists add_accel_ppp;

delimiter //
create procedure add_accel_ppp()
begin

if not exists (select * from information_schema.columns
    where table_name = 'accel_servers' and table_schema = 'rd') then
	CREATE TABLE `accel_servers` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `cloud_id` int(11) NOT NULL,
      `name` varchar(255) NOT NULL,
      `mac` varchar(255) NOT NULL,
      `server_type` enum('standalone','mesh','ap_profile') DEFAULT 'standalone',
      `config_fetched` datetime DEFAULT NULL,
      `last_contact` datetime DEFAULT NULL,
      `last_contact_from_ip` varchar(30) NOT NULL DEFAULT '',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'accel_stats' and table_schema = 'rd') then
	CREATE TABLE `accel_stats` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `accel_server_id` int(11) NOT NULL,
      `version` varchar(255) NOT NULL,
      `uptime` varchar(255) NOT NULL,
      `cpu` varchar(255) NOT NULL,
      `mem` varchar(255) NOT NULL,
      `core` text NOT NULL,
      `sessions_active` int(11) NOT NULL,
      `sessions` text NOT NULL,
      `pppoe` text NOT NULL,
      `radius1` text NOT NULL,
      `radius2` text NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

end//

delimiter ;
call add_accel_ppp;
