drop procedure if exists add_dynamic_client_nas_settings;

delimiter //
create procedure add_dynamic_client_nas_settings()
begin

if not exists (select * from information_schema.columns
    where table_name = 'dynamic_client_settings' and table_schema = 'rd') then
	CREATE TABLE `dynamic_client_settings` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `dynamic_client_id` int(11) NOT NULL,
      `name` varchar(255) NOT NULL,
      `value` varchar(255) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'na_settings' and table_schema = 'rd') then
	CREATE TABLE `na_settings` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `na_id` int(11) NOT NULL,
      `name` varchar(255) NOT NULL,
      `value` varchar(255) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

end//

delimiter ;
call add_dynamic_client_nas_settings;

