drop procedure if exists add_fup_vlan;

delimiter //
create procedure add_fup_vlan()
begin

if not exists (select * from information_schema.columns
    where column_name = 'vlan' and table_name = 'profile_fup_components' and table_schema = 'rd') then
    alter table profile_fup_components add column `vlan` int(5) NULL DEFAULT NULL;
end if;


if not exists (select * from information_schema.columns
    where column_name = 'operator_name' and table_name = 'radacct' and table_schema = 'rd') then
    alter table radacct add column `operator_name` varchar(32) NOT NULL DEFAULT '';
end if;


end//

delimiter ;
call add_fup_vlan;
