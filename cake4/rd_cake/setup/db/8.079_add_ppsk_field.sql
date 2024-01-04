drop procedure if exists add_ppsk_field;

delimiter //
create procedure add_ppsk_field()
begin

if not exists (select * from information_schema.columns
    where column_name = 'ppsk' and table_name = 'permanent_users' and table_schema = 'rd') then
    alter table permanent_users add column `ppsk` varchar(100) NOT NULL DEFAULT '';
end if;

end//

delimiter ;
call add_ppsk_field;

