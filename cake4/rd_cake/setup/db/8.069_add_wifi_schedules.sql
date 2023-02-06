drop procedure if exists add_wifi_schedules;

delimiter //
create procedure add_wifi_schedules()
begin


if not exists (select * from information_schema.columns
    where table_name = 'mesh_entry_schedules' and table_schema = 'rd') then
    CREATE TABLE `mesh_entry_schedules` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `mesh_entry_id` int(11) DEFAULT NULL,
      `action` enum('off','on') DEFAULT 'off',
      `mo` tinyint(1) NOT NULL DEFAULT 0,
      `tu` tinyint(1) NOT NULL DEFAULT 0,
      `we` tinyint(1) NOT NULL DEFAULT 0,
      `th` tinyint(1) NOT NULL DEFAULT 0,
      `fr` tinyint(1) NOT NULL DEFAULT 0,
      `sa` tinyint(1) NOT NULL DEFAULT 0,
      `su` tinyint(1) NOT NULL DEFAULT 0,
      `event_time` varchar(10) NOT NULL DEFAULT '',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'ap_profile_entry_schedules' and table_schema = 'rd') then
	CREATE TABLE `ap_profile_entry_schedules` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `ap_profile_entry_id` int(11) DEFAULT NULL,
      `action` enum('off','on') DEFAULT 'off',
      `mo` tinyint(1) NOT NULL DEFAULT 0,
      `tu` tinyint(1) NOT NULL DEFAULT 0,
      `we` tinyint(1) NOT NULL DEFAULT 0,
      `th` tinyint(1) NOT NULL DEFAULT 0,
      `fr` tinyint(1) NOT NULL DEFAULT 0,
      `sa` tinyint(1) NOT NULL DEFAULT 0,
      `su` tinyint(1) NOT NULL DEFAULT 0,
      `event_time` varchar(10) NOT NULL DEFAULT '',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;


end//

delimiter ;
call add_wifi_schedules;


