BEGIN;

CREATE OR REPLACE FUNCTION aggregate_ap_stations_hourly()
RETURNS VOID AS $$
BEGIN
    -- Insert aggregated data into ap_station_hourlies
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
        DATE_TRUNC('hour', CURRENT_TIMESTAMP - INTERVAL '1 hour') AS created,
        DATE_TRUNC('hour', CURRENT_TIMESTAMP - INTERVAL '1 hour') AS modified
    FROM
        ap_stations
    WHERE
        created >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
    GROUP BY
        ap_id,
        ap_profile_entry_id,
        mac_address_id,
        radio_number,
        frequency_band;

    -- Delete ap_stations older than 1 hour
    DELETE FROM ap_stations
    WHERE created < CURRENT_TIMESTAMP - INTERVAL '1 hour';

    -- Delete ap_station_hourlies older than 8 days
    DELETE FROM ap_station_hourlies
    WHERE created < CURRENT_DATE - INTERVAL '8 days';
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION aggregate_node_stations_hourly() 
RETURNS VOID AS $$
BEGIN
    -- Insert aggregated data into node_station_hourlies
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
        (NOW() - INTERVAL '1 HOUR')::timestamp AS created,
        (NOW() - INTERVAL '1 HOUR')::timestamp AS modified
    FROM
        node_stations
    WHERE
        created >= NOW() - INTERVAL '1 HOUR'
    GROUP BY
        node_id,
        mesh_entry_id,
        mac_address_id,
        radio_number,
        frequency_band;

    -- Delete node_stations older than 1 hour
    DELETE FROM node_stations
    WHERE created < NOW() - INTERVAL '1 HOUR';

    -- Delete node_station_hourlies older than 8 days
    DELETE FROM node_station_hourlies
    WHERE created < NOW() - INTERVAL '8 DAYS';
    
END;
$$ LANGUAGE plpgsql;

COMMIT;
