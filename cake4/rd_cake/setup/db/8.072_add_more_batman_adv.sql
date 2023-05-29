drop procedure if exists add_more_batman_adv;

delimiter //
create procedure add_more_batman_adv()
begin

if not exists (select * from information_schema.columns
    where column_name = 'routing_algo' and table_name = 'mesh_settings' and table_schema = 'rd') then
    alter table mesh_settings add `routing_algo` enum('BATMAN_IV','BATMAN_V') DEFAULT 'BATMAN_V';
end if;

end//

delimiter ;
call add_more_batman_adv;


