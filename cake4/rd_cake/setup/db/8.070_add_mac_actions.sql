drop procedure if exists add_mac_actions;

delimiter //
create procedure add_mac_actions()
begin

if not exists (select * from information_schema.columns
    where table_name = 'mac_actions' and table_schema = 'rd') then
    CREATE TABLE `mac_actions` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `cloud_id` int(11) DEFAULT NULL,
      `mesh_id` int(11) DEFAULT NULL,
      `ap_profile_id` int(11) DEFAULT NULL,
      `client_mac_id` int(11) DEFAULT NULL,
      `action` enum('block','limit') DEFAULT 'block',
      `bw_up` int(11) DEFAULT NULL,
      `bw_down` int(11) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'client_macs' and table_schema = 'rd') then
	CREATE TABLE `client_macs` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `mac` varchar(17) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;

end//

delimiter ;
call add_mac_actions;


