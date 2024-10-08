drop procedure if exists multi_wan_profiles;

delimiter //
create procedure multi_wan_profiles()
begin

if not exists (select * from information_schema.columns
    where table_name = 'multi_wan_profiles' and table_schema = 'rd') then
     CREATE TABLE `multi_wan_profiles` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `cloud_id` int(11) DEFAULT NULL,
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

end//

delimiter ;
call multi_wan_profiles;


