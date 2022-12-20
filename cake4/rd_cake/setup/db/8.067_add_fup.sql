drop procedure if exists add_fup;

delimiter //
create procedure add_fup()
begin


if not exists (select * from information_schema.columns
    where table_name = 'profile_fup_components' and table_schema = 'rd') then
	CREATE TABLE `profile_fup_components` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `profile_id` int(11) NOT NULL,
      `name` varchar(255) NOT NULL,
      `if_condition` enum('day_usage','week_usage','month_usage','time_of_day') DEFAULT 'day_usage',
      `time_start` varchar(255)  DEFAULT NULL,
      `time_end` varchar(255) DEFAULT NULL,
      `data_amount`  int(10) DEFAULT NULL,
      `data_unit` enum('mb','gb') DEFAULT 'mb',
      `action` enum('increase_speed','decrease_speed','block') DEFAULT 'block',
      `action_amount` int(10) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

end//

delimiter ;
call add_fup;


