drop procedure if exists add_cell_density;

delimiter //
create procedure add_cell_density()
begin

if not exists (select * from information_schema.columns
    where column_name = 'cell_density' and table_name = 'hardware_radios' and table_schema = 'rd') then
    alter table hardware_radios add column `cell_density` enum('0','1','2','3') DEFAULT '0';
end if;

end//

delimiter ;
call add_cell_density;

