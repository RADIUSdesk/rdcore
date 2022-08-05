drop procedure if exists add_lost_pwd_method;

delimiter //
create procedure add_lost_pwd_method()
begin

if exists (select * from information_schema.columns
    where column_name = 'ctc_require_phone' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details drop column ctc_require_phone, drop column ctc_resupply_phone_interval,drop column ctc_require_dn,drop column ctc_resupply_dn_interval,drop column ctc_phone_opt_in, drop column ctc_phone_opt_in_txt,drop column ctc_email_opt_in,drop column ctc_email_opt_in_txt;  
end if;


if not exists (select * from information_schema.columns
    where column_name = 'lost_password_method' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `lost_password_method` enum('email','sms') DEFAULT 'email';
end if;


end//

delimiter ;
call add_lost_pwd_method;

