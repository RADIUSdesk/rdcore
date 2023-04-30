drop procedure if exists add_firewall_profiles;

delimiter //
create procedure add_firewall_profiles()
begin


if not exists (select * from information_schema.columns
    where table_name = 'firewall_profiles' and table_schema = 'rd') then

        CREATE TABLE `firewall_profiles` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `name` char(64) DEFAULT NULL,
          `cloud_id` int(11) DEFAULT NULL,
          `created` datetime NOT NULL,
          `modified` datetime NOT NULL,
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'firewall_profile_entries' and table_schema = 'rd') then
	
    CREATE TABLE `firewall_profile_entries` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `firewall_profile_id` int(11) DEFAULT NULL,
      `action` enum('block','allow','limit') DEFAULT 'block',
      `category` enum('app','app_group','domain','ip_address','region','internet','local_network') DEFAULT 'domain',
      `domain` varchar(100) DEFAULT NULL,
      `ip_address` varchar(100) DEFAULT NULL,
      `schedule` enum('always','every_day','every_week','one_time','custom') DEFAULT 'always',
      `mo` tinyint(1) NOT NULL DEFAULT 0,
      `tu` tinyint(1) NOT NULL DEFAULT 0,
      `we` tinyint(1) NOT NULL DEFAULT 0,
      `th` tinyint(1) NOT NULL DEFAULT 0,
      `fr` tinyint(1) NOT NULL DEFAULT 0,
      `sa` tinyint(1) NOT NULL DEFAULT 0,
      `su` tinyint(1) NOT NULL DEFAULT 0,
      `start_time` int(10) NOT NULL DEFAULT 0,
      `end_time` int(10) NOT NULL DEFAULT 0,
      `one_time_date` datetime DEFAULT NULL,
      `bw_up` int(11) DEFAULT NULL,
      `bw_down` int(11) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'firewall_apps' and table_schema = 'rd') then	
    CREATE TABLE `firewall_apps` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` char(16) DEFAULT NULL,
        `cloud_id` int(11) DEFAULT NULL,
        `fa_code` char(64) DEFAULT '&#xf085;',
        `elements` text NOT NULL DEFAULT '',
        `comment` varchar(100) NOT NULL DEFAULT '',
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'firewall_profile_entry_firewall_apps' and table_schema = 'rd') then
    CREATE TABLE `firewall_profile_entry_firewall_apps` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `firewall_profile_entry_id` int(11) NOT NULL,
      `firewall_app_id` int(11) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where column_name = 'apply_firewall_profile' and table_name = 'ap_profile_exits' and table_schema = 'rd') then
    alter table ap_profile_exits add column `apply_firewall_profile` tinyint(1) NOT NULL DEFAULT 0;
    alter table ap_profile_exits add column `firewall_profile_id` int(11) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'apply_firewall_profile' and table_name = 'mesh_exits' and table_schema = 'rd') then
    alter table mesh_exits add column `apply_firewall_profile` tinyint(1) NOT NULL DEFAULT 0;
    alter table mesh_exits add column `firewall_profile_id` int(11) NOT NULL DEFAULT '0';
end if;


end//

delimiter ;
call add_firewall_profiles;


