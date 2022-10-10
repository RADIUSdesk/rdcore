drop procedure if exists add_dynamic_detail_ctcs;

delimiter //
create procedure add_dynamic_detail_ctcs()
begin

if not exists (select * from information_schema.columns
    where table_name = 'dynamic_detail_ctcs' and table_schema = 'rd') then	
    CREATE TABLE IF NOT EXISTS `dynamic_detail_ctcs` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `dynamic_detail_id` int(11) DEFAULT NULL,
        `connect_check` tinyint(1) NOT NULL DEFAULT 0,
        `connect_username` char(50) NOT NULL DEFAULT '',
        `connect_suffix` char(50) NOT NULL DEFAULT 'nasid',
        `connect_delay` int(3) NOT NULL DEFAULT 0,
        `connect_only` tinyint(1) NOT NULL DEFAULT 0,
        `cust_info_check` tinyint(1) NOT NULL DEFAULT 0,
        `ci_resupply_interval` int(4) NOT NULL DEFAULT 0,
        `ci_first_name` tinyint(1) NOT NULL DEFAULT 0,
        `ci_first_name_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_last_name` tinyint(1) NOT NULL DEFAULT 0,
        `ci_last_name_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_email` tinyint(1) NOT NULL DEFAULT 0,
        `ci_email_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_email_opt_in` tinyint(1) NOT NULL DEFAULT 0,
        `ci_email_opt_in_txt` char(50) NOT NULL DEFAULT 'Send Promotional Email',
        `ci_gender` tinyint(1) NOT NULL DEFAULT 0,
        `ci_gender_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_birthday` tinyint(1) NOT NULL DEFAULT 0,
        `ci_birthday_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_company` tinyint(1) NOT NULL DEFAULT 0,
        `ci_company_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_address` tinyint(1) NOT NULL DEFAULT 0,
        `ci_address_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_city` tinyint(1) NOT NULL DEFAULT 0,
        `ci_city_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_country` tinyint(1) NOT NULL DEFAULT 0,
        `ci_country_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_phone` tinyint(1) NOT NULL DEFAULT 0,
        `ci_phone_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_phone_opt_in` tinyint(1) NOT NULL DEFAULT 0,
        `ci_phone_opt_in_txt` char(50) NOT NULL DEFAULT 'Send Promotional SMS',
        `ci_room` tinyint(1) NOT NULL DEFAULT 0,
        `ci_room_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_custom1` tinyint(1) NOT NULL DEFAULT 0,
        `ci_custom1_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_custom1_txt` char(50) NOT NULL DEFAULT 'Custom One',
        `ci_custom2` tinyint(1) NOT NULL DEFAULT 0,
        `ci_custom2_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_custom2_txt` char(50) NOT NULL DEFAULT 'Custom Two',
        `ci_custom3` tinyint(1) NOT NULL DEFAULT 0,
        `ci_custom3_required` tinyint(1) NOT NULL DEFAULT 0,
        `ci_custom3_txt` char(50) NOT NULL DEFAULT 'Custom Three',
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT 1 DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where column_name = 'first_name' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `first_name` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'last_name' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `last_name` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'gender' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `gender` enum('male','female','not_recorded') DEFAULT 'not_recorded';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'birthday' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `birthday` datetime DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'company' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `company` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'address' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `address` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'city' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `city` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'country' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `country` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'room' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `room` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'custom1' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `custom1` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'custom2' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `custom2` char(50) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'custom3' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `custom3` char(50) NOT NULL DEFAULT '';
end if;


end//

delimiter ;
call add_dynamic_detail_ctcs;

