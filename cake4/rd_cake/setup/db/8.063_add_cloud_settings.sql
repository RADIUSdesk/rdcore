drop procedure if exists add_cloud_settings;

delimiter //
create procedure add_cloud_settings()
begin

if not exists (select * from information_schema.columns
    where table_name = 'cloud_settings' and table_schema = 'rd') then
	CREATE TABLE `cloud_settings` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `cloud_id` int(11) NOT NULL,
      `name` varchar(255) NOT NULL,
      `value` varchar(255) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_cloud_settings_cloud_id` (`cloud_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

end//

delimiter ;
call add_cloud_settings;

