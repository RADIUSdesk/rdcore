drop procedure if exists add_opt_in_for_ctc;

delimiter //
create procedure add_opt_in_for_ctc()
begin


if not exists (select * from information_schema.columns
    where column_name = 'ctc_phone_opt_in' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `ctc_phone_opt_in` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ctc_phone_opt_in_txt' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `ctc_phone_opt_in_txt` varchar(200) NOT NULL DEFAULT 'Send Promotional SMS';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ctc_email_opt_in' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `ctc_email_opt_in` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ctc_email_opt_in_txt' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `ctc_email_opt_in_txt` varchar(200) NOT NULL DEFAULT 'Send Promotional Email';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'phone_opt_in' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `phone_opt_in` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'email_opt_in' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `email_opt_in` tinyint(1) NOT NULL DEFAULT '0';
end if;


end//

delimiter ;
call add_opt_in_for_ctc;

