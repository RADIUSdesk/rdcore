drop procedure if exists add_admin_permissions;

delimiter //
create procedure add_admin_permissions()
begin

if not exists (select * from information_schema.columns
    where column_name = 'permissions' and table_name = 'cloud_admins' and table_schema = 'rd') then
    alter table cloud_admins add column `permissions` enum('admin','view','granular') DEFAULT 'admin';
end if;


end//

delimiter ;
call add_admin_permissions;

