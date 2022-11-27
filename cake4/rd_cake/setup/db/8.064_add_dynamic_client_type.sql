drop procedure if exists add_dynamic_client_type;

delimiter //
create procedure add_dynamic_client_type()
begin


if not exists (select * from information_schema.columns
    where column_name = 'type' and table_name = 'dynamic_clients' and table_schema = 'rd') then
    alter table dynamic_clients add column `type` varchar(30) NULL DEFAULT 'other';
end if;


end//

delimiter ;
call add_dynamic_client_type;

