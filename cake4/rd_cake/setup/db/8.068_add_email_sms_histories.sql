drop procedure if exists add_email_sms_histories;

delimiter //
create procedure add_email_sms_histories()
begin


if not exists (select * from information_schema.columns
    where table_name = 'email_histories' and table_schema = 'rd') then
	CREATE TABLE `email_histories` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `cloud_id` int(11) NOT NULL,
      `recipient` varchar(100) DEFAULT NULL,
      `reason` varchar(25) DEFAULT NULL,
      `message` varchar(255) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'sms_histories' and table_schema = 'rd') then
	CREATE TABLE `sms_histories` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `cloud_id` int(11) NOT NULL,
      `recipient` varchar(100) DEFAULT NULL,
      `reason` varchar(25) DEFAULT NULL,
      `message` varchar(255) DEFAULT NULL,
      `sms_provider` int(2) DEFAULT '1',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;


end//

delimiter ;
call add_email_sms_histories;


