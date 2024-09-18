drop procedure if exists add_station_hourlies;

delimiter //
create procedure add_station_hourlies()
begin


if exists (select * from information_schema.columns
    where column_name = 'authenticated' and table_name = 'ap_stations' and table_schema = 'rd') then
    drop table `ap_stations`;
    CREATE TABLE `ap_stations` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `ap_id` int(11) DEFAULT NULL,
      `ap_profile_entry_id` int(11) DEFAULT NULL,
      `mac_address_id` int(11) DEFAULT NULL,
      `radio_number` tinyint(3) NOT NULL DEFAULT 0,
      `frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
      `tx_bytes` bigint(20) NOT NULL,
      `rx_bytes` bigint(20) NOT NULL,
      `tx_packets` bigint(20) NOT NULL,
      `rx_packets` bigint(20) NOT NULL,
      `tx_bitrate` int(11) NOT NULL,
      `rx_bitrate` int(11) NOT NULL,
      `tx_failed` int(11) NOT NULL,
      `tx_retries` int(11) NOT NULL,
      `signal_now` int(11) NOT NULL,
      `signal_avg` int(11) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_ap_stations_ap_id` (`ap_id`),
      KEY `idx_ap_stations_ap_profile_entry_id` (`ap_profile_entry_id`),
      KEY `idx_ap_stations_modified` (`modified`),
      KEY `idx_ap_mac_address_id` (`mac_address_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
end if;

if exists (select * from information_schema.columns
    where column_name = 'authenticated' and table_name = 'node_stations' and table_schema = 'rd') then
    drop table `node_stations`;
    CREATE TABLE `node_stations` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `node_id` int(11) DEFAULT NULL,
      `mesh_entry_id` int(11) DEFAULT NULL,
      `mac_address_id` int(11) DEFAULT NULL,
      `radio_number` tinyint(3) NOT NULL DEFAULT 0,
      `frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
      `tx_bytes` bigint(20) NOT NULL,
      `rx_bytes` bigint(20) NOT NULL,
      `tx_packets` bigint(20) NOT NULL,
      `rx_packets` bigint(20) NOT NULL,
      `tx_bitrate` int(11) NOT NULL,
      `rx_bitrate` int(11) NOT NULL,
      `tx_failed` int(11) NOT NULL,
      `tx_retries` int(11) NOT NULL,
      `signal_now` int(11) NOT NULL,
      `signal_avg` int(11) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_node_stations_node_id` (`node_id`),
      KEY `idx_node_stations_mesh_entry_id` (`mesh_entry_id`),
      KEY `idx_node_stations_modified` (`modified`),
      KEY `idx_node_mac_address_id` (`mac_address_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

end if;


if not exists (select * from information_schema.columns
    where table_name = 'node_station_hourlies' and table_schema = 'rd') then
    CREATE TABLE `node_station_hourlies` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `node_id` int(11) DEFAULT NULL,
      `mesh_entry_id` int(11) DEFAULT NULL,
      `mac_address_id` int(11) DEFAULT NULL,
      `radio_number` tinyint(3) NOT NULL DEFAULT 0,
      `frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
      `tx_bytes` bigint(20) NOT NULL,
      `rx_bytes` bigint(20) NOT NULL,
      `tx_packets` bigint(20) NOT NULL,
      `rx_packets` bigint(20) NOT NULL,
      `signal_avg` int(11) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (id),
        UNIQUE KEY (node_id, mesh_entry_id, mac_address_id, radio_number, frequency_band, created),
        KEY idx_node_station_hourlies_mac_address_id (mac_address_id),
        KEY idx_node_station_hourlies_frequency_band (frequency_band),
        KEY idx_node_station_hourlies_date (created)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'ap_station_hourlies' and table_schema = 'rd') then
    CREATE TABLE `ap_station_hourlies` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `ap_id` int(11) DEFAULT NULL,
      `ap_profile_entry_id` int(11) DEFAULT NULL,
      `mac_address_id` int(11) DEFAULT NULL,
      `radio_number` tinyint(3) NOT NULL DEFAULT 0,
      `frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
      `tx_bytes` bigint(20) NOT NULL,
      `rx_bytes` bigint(20) NOT NULL,
      `tx_packets` bigint(20) NOT NULL,
      `rx_packets` bigint(20) NOT NULL,
      `signal_avg` int(11) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (id),
        UNIQUE KEY (ap_id, ap_profile_entry_id, mac_address_id, radio_number, frequency_band, created),
        KEY idx_ap_station_hourlies_mac_address_id (mac_address_id),
        KEY idx_ap_station_hourlies_frequency_band (frequency_band),
        KEY idx_ap_station_hourlies_date (created)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

end if;

end//

delimiter ;
call add_station_hourlies;

DELIMITER //

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS aggregate_ap_stations_hourly
ON SCHEDULE EVERY 1 HOUR
STARTS '2024-09-10 00:00:00'
DO
BEGIN
    INSERT INTO ap_station_hourlies (
        ap_id,
        ap_profile_entry_id,
        mac_address_id,
        radio_number,
        frequency_band,
        tx_bytes,
        rx_bytes,
        tx_packets,
        rx_packets,
        signal_avg,
        created,
        modified
    )
    SELECT
        ap_id,
        ap_profile_entry_id,
        mac_address_id,
        radio_number,
        frequency_band,
        SUM(tx_bytes),
        SUM(rx_bytes),
        SUM(tx_packets),
        SUM(rx_packets),
        AVG(signal_avg),
        DATE_FORMAT(NOW() - INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00') AS created,
        DATE_FORMAT(NOW() - INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00') AS modified
    FROM
        ap_stations
    WHERE
        created >= NOW() - INTERVAL 1 HOUR
    GROUP BY
        ap_id,
        ap_profile_entry_id,
        mac_address_id,
        radio_number,
        frequency_band;

    -- Delete ap_stations older than 1 hour
    DELETE FROM ap_stations
    WHERE created < NOW() - INTERVAL 1 HOUR;

     -- Delete ap_station_hourlies older than 8 days
    DELETE FROM ap_station_hourlies
    WHERE created < CURDATE() - INTERVAL 8 DAY;

END//

DELIMITER ;

DELIMITER //

CREATE EVENT IF NOT EXISTS aggregate_node_stations_hourly
ON SCHEDULE EVERY 1 HOUR
STARTS '2024-09-10 00:00:00'
DO
BEGIN
    INSERT INTO node_station_hourlies (
        node_id,
        mesh_entry_id,
        mac_address_id,
        radio_number,
        frequency_band,
        tx_bytes,
        rx_bytes,
        tx_packets,
        rx_packets,
        signal_avg,
        created,
        modified
    )
    SELECT
        node_id,
        mesh_entry_id,
        mac_address_id,
        radio_number,
        frequency_band,
        SUM(tx_bytes),
        SUM(rx_bytes),
        SUM(tx_packets),
        SUM(rx_packets),
        AVG(signal_avg),
        DATE_FORMAT(NOW() - INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00') AS created,
        DATE_FORMAT(NOW() - INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00') AS modified
    FROM
        node_stations
    WHERE
       created >= NOW() - INTERVAL 1 HOUR
    GROUP BY
        node_id,
        mesh_entry_id,
        mac_address_id,
        radio_number,
        frequency_band;

    -- Delete node_stations older than 1 hour
    DELETE FROM node_stations
    WHERE created < NOW() - INTERVAL 1 HOUR;

    -- Delete node_station_hourlies older than 8 days
    DELETE FROM node_station_hourlies
    WHERE created < CURDATE() - INTERVAL 8 DAY;
END//

DELIMITER ;
