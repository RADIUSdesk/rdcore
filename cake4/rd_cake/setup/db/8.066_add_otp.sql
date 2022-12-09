drop procedure if exists add_otp;

delimiter //
create procedure add_otp()
begin

if not exists (select * from information_schema.columns
    where column_name = 'reg_otp_sms' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `reg_otp_sms` tinyint(1) NOT NULL DEFAULT '0';
end if;


if not exists (select * from information_schema.columns
    where column_name = 'reg_otp_email' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `reg_otp_email` tinyint(1) NOT NULL DEFAULT '0';
end if;


if not exists (select * from information_schema.columns
    where table_name = 'permenent_user_otps' and table_schema = 'rd') then
	CREATE TABLE `permanent_user_otps` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `permanent_user_id` int(11) NOT NULL,
      `status` enum('otp_awaiting','otp_confirmed') DEFAULT 'otp_awaiting',
      `value` varchar(255) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;


end//

delimiter ;
call add_otp;


