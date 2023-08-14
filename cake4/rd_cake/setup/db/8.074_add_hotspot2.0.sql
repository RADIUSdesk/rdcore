drop procedure if exists add_hotspot2;

delimiter //
create procedure add_hotspot2()
begin


if not exists (select * from information_schema.columns
    where column_name = 'hotspot2_enable' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `hotspot2_enable` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'hotspot2_profile_id' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `hotspot2_profile_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'hotspot2_enable' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `hotspot2_enable` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'hotspot2_profile_id' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `hotspot2_profile_id` int(11) DEFAULT NULL;
end if;


end//

delimiter ;
call add_hotspot2;

