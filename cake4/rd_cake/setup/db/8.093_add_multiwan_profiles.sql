drop procedure if exists multi_wan_profiles;

delimiter //
create procedure multi_wan_profiles()
begin

if not exists (select * from information_schema.columns
    where table_name = 'multi_wan_profiles' and table_schema = 'rd') then
     CREATE TABLE `multi_wan_profiles` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `cloud_id` int(11) DEFAULT NULL,
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

<<<<<<< Updated upstream
=======

if not exists (select * from information_schema.columns
    where table_name = 'mwan_interfaces' and table_schema = 'rd') then
     CREATE TABLE `mwan_interfaces` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `multi_wan_profile_id` int(11) DEFAULT NULL,
        `name` char(64) NOT NULL,
        `type` enum('ethernet','lte','wifi') DEFAULT 'ethernet',
        `apply_sqm_profile` tinyint(1) NOT NULL DEFAULT 0,
        `sqm_profile_id` int(11) NOT NULL DEFAULT '0',
        `metric` int(11) NOT NULL DEFAULT '1',
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns where column_name = 'multi_wan_profile_id' and table_name = 'aps' and table_schema = 'rd') then
	alter table aps add column multi_wan_profile_id int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns where column_name = 'multi_wan_profile_id' and table_name = 'aps' and table_schema = 'rd') then
	alter table nodes add column multi_wan_profile_id int(11) DEFAULT NULL;
end if;

alter table aps modify column gateway enum('none','lan','3g','wifi','wifi_static','wifi_ppp','wifi_pppoe','wan_static','wan_ppp','wan_pppoe','mwan') DEFAULT 'none';

ALTER TABLE nodes modify column gateway enum('none','lan','3g','wifi','wifi_static','wifi_ppp','wifi_pppoe','wan_static','wan_ppp','wan_pppoe', 'mwan') DEFAULT 'none';

if not exists (select * from information_schema.columns
    where table_name = 'mwan_interface_settings' and table_schema = 'rd') then
     CREATE TABLE `mwan_interface_settings` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `mwan_interface_id` int(11) DEFAULT NULL,
        `grouping` varchar(25) DEFAULT NULL,
        `type` enum('option','list') DEFAULT 'option',
        `name` varchar(25) DEFAULT NULL,
        `value` varchar(40) DEFAULT NULL,
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;


>>>>>>> Stashed changes
end//

delimiter ;
call multi_wan_profiles;


