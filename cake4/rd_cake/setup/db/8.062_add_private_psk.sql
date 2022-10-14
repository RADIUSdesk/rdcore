drop procedure if exists add_private_psk;

delimiter //
create procedure add_private_psk()
begin


if not exists (select * from information_schema.columns
    where column_name = 'vlan_enable' and table_name = 'ap_profile_settings' and table_schema = 'rd') then
    alter table ap_profile_settings add column `vlan_enable` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan_range_or_list' and table_name = 'ap_profile_settings' and table_schema = 'rd') then
    alter table ap_profile_settings add column `vlan_range_or_list` enum('range','list') DEFAULT 'range';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan_start' and table_name = 'ap_profile_settings' and table_schema = 'rd') then
    alter table ap_profile_settings add column `vlan_start` int(10) NOT NULL DEFAULT '100';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan_end' and table_name = 'ap_profile_settings' and table_schema = 'rd') then
    alter table ap_profile_settings add column `vlan_end` int(10) NOT NULL DEFAULT '101';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan_list' and table_name = 'ap_profile_settings' and table_schema = 'rd') then
    alter table ap_profile_settings add column `vlan_list` varchar(255) NOT NULL DEFAULT '100';
end if;


end//

delimiter ;
call add_private_psk;

