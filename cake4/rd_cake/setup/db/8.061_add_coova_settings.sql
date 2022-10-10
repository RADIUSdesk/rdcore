drop procedure if exists add_coova_settings;

delimiter //
create procedure add_coova_settings()
begin


if not exists (select * from information_schema.columns
    where column_name = 'chilli_json_unavailable' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `chilli_json_unavailable` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'chilli_use_chap' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `chilli_use_chap` tinyint(1) NOT NULL DEFAULT '0';
end if;


end//

delimiter ;
call add_coova_settings;

