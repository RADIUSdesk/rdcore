drop procedure if exists add_apdesk_enhancements;

delimiter //
create procedure add_apdesk_enhancements()
begin


if not exists (select * from information_schema.columns
    where column_name = 'apply_to_all' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `apply_to_all` tinyint(1) NOT NULL DEFAULT '1';
end if;


if not exists (select * from information_schema.columns
    where table_name = 'ap_ap_profile_entries' and table_schema = 'rd') then
    CREATE TABLE `ap_ap_profile_entries` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `ap_id` int(11) NOT NULL,
      `ap_profile_entry_id` int(11) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_ap_ap_profile_entries_ap_id` (`ap_id`),
      KEY `idx_ap_ap_profile_entries_ap_profile_entry_id` (`ap_profile_entry_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

end if;

end//

delimiter ;
call add_apdesk_enhancements;
