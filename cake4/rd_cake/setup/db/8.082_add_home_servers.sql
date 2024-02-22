drop procedure if exists add_home_servers;

delimiter //
create procedure add_home_servers()
begin


if not exists (select * from information_schema.columns
    where table_name = 'home_server_pools' and table_schema = 'rd') then
     CREATE TABLE `home_server_pools` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(255) NOT NULL,
      `type` enum('fail-over','load-balance','client-balance','client-port-balance','keyed-balance') DEFAULT 'fail-over',
      `cloud_id` int(11) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'home_servers' and table_schema = 'rd') then
     CREATE TABLE `home_servers` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `type` enum('auth','acct','auth+acct','coa') DEFAULT 'auth+acct',
      `ipaddr` varchar(255) NOT NULL DEFAULT '',
      `port` int(5) NOT NULL DEFAULT 1812,
      `secret` varchar(255) NOT NULL DEFAULT '',
      `response_window` int(5) NOT NULL DEFAULT 20,
      `zombie_period` int(5) NOT NULL DEFAULT 40,
      `revive_interval` int(5) NOT NULL DEFAULT 120,
      `home_server_pool_id` int(11) DEFAULT NULL,
      `accept_coa` tinyint(1) NOT NULL DEFAULT 1,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;


end//

delimiter ;
call add_home_servers;
