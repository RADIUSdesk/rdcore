drop procedure if exists update_radacct_ipv6;

delimiter //
create procedure update_radacct_ipv6()
begin


if not exists (select * from information_schema.columns
    where column_name = 'framedipv6address' and table_name = 'radacct' and table_schema = 'rd') then
    alter table radacct add column `framedipv6address` varchar(44) NOT NULL default '';
    alter table radacct add KEY framedipv6address (framedipv6address);
end if;

if not exists (select * from information_schema.columns
    where column_name = 'framedipv6prefix' and table_name = 'radacct' and table_schema = 'rd') then
    alter table radacct add column `framedipv6prefix` varchar(44) NOT NULL default '';
    alter table radacct add KEY framedipv6prefix (framedipv6prefix);
end if;

if not exists (select * from information_schema.columns
    where column_name = 'framedinterfaceid' and table_name = 'radacct' and table_schema = 'rd') then
    alter table radacct add column `framedinterfaceid` varchar(44) NOT NULL default '';
    alter table radacct add KEY framedinterfaceid (framedinterfaceid);
end if;

if not exists (select * from information_schema.columns
    where column_name = 'delegatedipv6prefix' and table_name = 'radacct' and table_schema = 'rd') then
    alter table radacct add column `delegatedipv6prefix` varchar(44) NOT NULL default '';
    alter table radacct add KEY delegatedipv6prefix (delegatedipv6prefix);
end if;


end//

delimiter ;
call update_radacct_ipv6;
