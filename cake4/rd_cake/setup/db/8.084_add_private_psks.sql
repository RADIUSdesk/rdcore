drop procedure if exists add_private_psks;

delimiter //
create procedure add_private_psks()
begin

if not exists (select * from information_schema.columns
    where table_name = 'private_psks' and table_schema = 'rd') then
     CREATE TABLE `private_psks` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(255) NOT NULL,
      `cloud_id` int(11) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'private_psk_entries' and table_schema = 'rd') then
     CREATE TABLE `private_psk_entries` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `private_psk_id` int(11) DEFAULT NULL,
      `name` varchar(255) NOT NULL DEFAULT '',
      `vlan` int(5) NOT NULL DEFAULT 0,
      `active`tinyint(1) NOT NULL DEFAULT 1,
      `comment` varchar(255) NOT NULL DEFAULT '',
      `mac` varchar(17) NOT NULL DEFAULT '',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;


end//

delimiter ;
call add_private_psks;
