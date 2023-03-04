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


if not exists (select * from information_schema.columns
    where column_name = 'vlan_enable' and table_name = 'node_settings' and table_schema = 'rd') then
    alter table node_settings add column `vlan_enable` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan_range_or_list' and table_name = 'node_settings' and table_schema = 'rd') then
    alter table node_settings add column `vlan_range_or_list` enum('range','list') DEFAULT 'range';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan_start' and table_name = 'node_settings' and table_schema = 'rd') then
    alter table node_settings add column `vlan_start` int(10) NOT NULL DEFAULT '100';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan_end' and table_name = 'node_settings' and table_schema = 'rd') then
    alter table node_settings add column `vlan_end` int(10) NOT NULL DEFAULT '101';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'vlan_list' and table_name = 'node_settings' and table_schema = 'rd') then
    alter table node_settings add column `vlan_list` varchar(255) NOT NULL DEFAULT '100';
end if;


alter table ap_profile_entries modify `encryption` enum('none','wep','psk','psk2','wpa','wpa2','ppsk') DEFAULT 'none';
alter table mesh_entries modify `encryption` enum('none','wep','psk','psk2','wpa','wpa2','ppsk') DEFAULT 'none';

if not exists (select * from information_schema.columns
    where column_name = 'default_vlan' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `default_vlan` int(10) NOT NULL DEFAULT '100';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'default_key' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `default_key` varchar(255) NOT NULL DEFAULT '12345678';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'default_vlan' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `default_vlan` int(10) NOT NULL DEFAULT '100';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'default_key' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `default_key` varchar(255) NOT NULL DEFAULT '12345678';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'default_vlan' and table_name = 'dynamic_clients' and table_schema = 'rd') then
    alter table dynamic_clients add column `default_vlan` int(10) NOT NULL DEFAULT '100';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'default_key' and table_name = 'dynamic_clients' and table_schema = 'rd') then
    alter table dynamic_clients add column `default_key` varchar(255) NOT NULL DEFAULT '12345678';
end if;

if not exists (select * from information_schema.columns
    where table_name = 'dynamic_client_macs' and table_schema = 'rd') then
	CREATE TABLE `dynamic_client_macs` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `dynamic_client_id` int(11) DEFAULT NULL,
      `client_mac_id` int(11) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`),
      CONSTRAINT dc_mac UNIQUE (dynamic_client_id,client_mac_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;



end//

delimiter ;
call add_private_psk;

