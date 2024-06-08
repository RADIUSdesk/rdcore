drop procedure if exists add_session_limit_field;

delimiter //
create procedure add_session_limit_field()
begin

if not exists (select * from information_schema.columns
    where column_name = 'session_limit' and table_name = 'permanent_users' and table_schema = 'rd') then
    alter table permanent_users add column `session_limit` int(4) NOT NULL DEFAULT 0;
end if;


end//

delimiter ;
call add_session_limit_field;

