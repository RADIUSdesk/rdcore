drop procedure if exists add_isp_specifics;

delimiter //
create procedure add_isp_specifics()
begin

if not exists (select * from information_schema.columns
    where table_name = 'isp_specifics' and table_schema = 'rd') then
    CREATE TABLE `isp_specifics` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `cloud_id` int(11) DEFAULT NULL,
      `name` varchar(40) DEFAULT NULL,
      `region` varchar(40) DEFAULT NULL,
      `field1` varchar(40) DEFAULT NULL,
      `field2` varchar(40) DEFAULT NULL,
      `field3` varchar(40) DEFAULT NULL,
      `field4` varchar(40) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

end if;

end//

delimiter ;
call add_isp_specifics;


