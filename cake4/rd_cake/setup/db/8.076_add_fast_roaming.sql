drop procedure if exists add_fast_roaming;

delimiter //
create procedure add_fast_roaming()
begin

if not exists (select * from information_schema.columns
    where column_name = 'ieee802r' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `ieee802r` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'mobility_domain' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `mobility_domain` varchar(4) NOT NULL DEFAULT 'abba';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ft_over_ds' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `ft_over_ds` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ft_pskgenerate_local' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `ft_pskgenerate_local` tinyint(1) NOT NULL DEFAULT '1';
end if;


if not exists (select * from information_schema.columns
    where column_name = 'ieee802r' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `ieee802r` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'mobility_domain' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `mobility_domain` varchar(4) NOT NULL DEFAULT 'abba';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ft_over_ds' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `ft_over_ds` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ft_pskgenerate_local' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `ft_pskgenerate_local` tinyint(1) NOT NULL DEFAULT '1';
end if;


end//

delimiter ;
call add_fast_roaming;

