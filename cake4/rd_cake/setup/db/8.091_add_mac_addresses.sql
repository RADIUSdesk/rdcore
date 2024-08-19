drop procedure if exists add_mac_addresses;

delimiter //
create procedure add_mac_addresses()
begin

if not exists (select * from information_schema.columns
    where table_name = 'mac_addresses' and table_schema = 'rd') then

    CREATE TABLE `mac_addresses` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `mac` VARCHAR(17) UNIQUE NOT NULL,
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE INDEX idx_mac_unique (mac)
    );

end if;

if exists (select * from information_schema.columns
    where column_name = 'mac' and table_name = 'node_stations' and table_schema = 'rd') then
        ALTER TABLE node_stations DROP COLUMN mac, ADD COLUMN mac_address_id INT;
        CREATE INDEX idx_node_mac_address_id ON node_stations (mac_address_id);
end if;

if exists (select * from information_schema.columns
    where column_name = 'mac' and table_name = 'ap_stations' and table_schema = 'rd') then
        ALTER TABLE ap_stations DROP COLUMN mac, ADD COLUMN mac_address_id INT;
        CREATE INDEX idx_ap_mac_address_id ON ap_stations (mac_address_id);
end if;

if exists (select * from information_schema.columns
    where column_name = 'client_mac_id' and table_name = 'mac_actions' and table_schema = 'rd') then
        ALTER TABLE mac_actions DROP COLUMN client_mac_id, ADD COLUMN mac_address_id INT;
        CREATE INDEX idx_mac_actions_mac_address_id ON mac_actions (mac_address_id);
end if;

if exists (select * from information_schema.columns
    where column_name = 'mac' and table_name = 'mac_aliases' and table_schema = 'rd') then
        ALTER TABLE mac_aliases DROP COLUMN mac, ADD COLUMN mac_address_id INT;
        CREATE INDEX idx_mac_aliases_mac_address_id ON mac_aliases (mac_address_id);
end if;


end//

delimiter ;
call add_mac_addresses

