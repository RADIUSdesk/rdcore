drop procedure if exists add_legacy_wifi_support;

delimiter //
create procedure add_legacy_wifi_support()
begin

alter table hardware_radios modify `mode` enum('a','g','n','ac','ax') DEFAULT 'n';

end//

delimiter ;
call add_legacy_wifi_support;

