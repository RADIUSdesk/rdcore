drop procedure if exists add_mwan_interface_changes;

delimiter //
create procedure add_mwan_interface_changes()
begin

if not exists (select * from information_schema.columns
    where table_name = 'mwan_interface_changes' and table_schema = DATABASE()) then
	CREATE TABLE mwan_interface_changes (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      ap_id INT NULL,
      node_id INT NULL,
      mwan_interface_id INT NULL,
      up tinyint(1) NOT NULL DEFAULT 1,
      tracking enum('active', 'paused', 'disabled', 'unknown') DEFAULT 'unknown',
      status enum('offline','online','disabled', 'disconnecting','connecting') DEFAULT 'offline',
      created DATETIME DEFAULT CURRENT_TIMESTAMP,
      modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

end if;

end//

delimiter ;
call add_mwan_interface_changes;
