drop procedure if exists add_ppsk_vlan_user_reg;

delimiter //
create procedure add_ppsk_vlan_user_reg()
begin

if not exists (select * from information_schema.columns
    where column_name = 'reg_rb_vlan' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `reg_rb_vlan` enum('no_vlan','pre_select','next_available') DEFAULT 'no_vlan';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'realm_vlan_id' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `realm_vlan_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'reg_ppsk' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `reg_ppsk` tinyint(1) NOT NULL DEFAULT '0';
end if;

end//

delimiter ;
call add_ppsk_vlan_user_reg;

