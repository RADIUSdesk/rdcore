drop procedure if exists update_node_neighbors;

delimiter //
create procedure update_node_neighbors()
begin

if not exists (select * from information_schema.columns
    where column_name = 'algo' and table_name = 'node_neighbors' and table_schema = 'rd') then
    alter table node_neighbors add column `algo` enum('BATMAN_IV','BATMAN_V') DEFAULT 'BATMAN_V';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'tq' and table_name = 'node_neighbors' and table_schema = 'rd') then
    alter table node_neighbors add column `tq` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'tp' and table_name = 'node_neighbors' and table_schema = 'rd') then
    alter table node_neighbors add column `tp` int(11) DEFAULT NULL;
end if;

end//

delimiter ;
call update_node_neighbors;

