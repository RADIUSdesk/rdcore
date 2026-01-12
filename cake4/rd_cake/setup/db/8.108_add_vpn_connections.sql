drop procedure if exists add_vpn_connections;

delimiter //
create procedure add_vpn_connections()
begin

if not exists (select * from information_schema.columns
    where table_name = 'ap_vpn_connections' and table_schema = DATABASE()) then
	CREATE TABLE `ap_vpn_connections` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `ap_id` int(11) NOT NULL,
      `name` CHAR(128) NOT NULL,
      `vpn_type` enum('ipsec','ovpn','wg','zt') DEFAULT 'wg',
      `wg_private_key` CHAR(44) NOT NULL DEFAULT '',
      `wg_public_key` CHAR(44) NOT NULL DEFAULT '',
      `wg_address` CHAR(100) NOT NULL DEFAULT '',
      `wg_endpoint` CHAR(44) NOT NULL DEFAULT '',
      `wg_port` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
      `wg_extras` CHAR(100) NOT NULL DEFAULT '',
      `ovpn_server` CHAR(44) NOT NULL DEFAULT '',
      `ovpn_port` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
      `ovpn_ca` TEXT NOT NULL DEFAULT '',
      `ovpn_cert` TEXT NOT NULL DEFAULT '',
      `ovpn_key` TEXT NOT NULL DEFAULT '',
      `ovpn_tls` enum('none','tls-auth','tls-crypt','tls-crypt-v2') DEFAULT 'none',
      `ovpn_tls_value` TEXT NOT NULL DEFAULT '',
      `ipsec_server` CHAR(44) NOT NULL DEFAULT '',
      `ipsec_server_id` CHAR(200) NOT NULL DEFAULT '',
      `ipsec_if_id` INT NOT NULL DEFAULT 0,
      `ipsec_xfrm_ip` CHAR(30) NOT NULL DEFAULT '',
      `ipsec_xfrm_gw` CHAR(30) NOT NULL DEFAULT '',
      `ipsec_ca` TEXT NOT NULL DEFAULT '',
      `ipsec_cert` TEXT NOT NULL DEFAULT '',
      `ipsec_key` TEXT NOT NULL DEFAULT '',
      `ipsec_client_id` CHAR(200) NOT NULL DEFAULT '',
      `ipsec_proposals` CHAR(200) NOT NULL DEFAULT '',
      `ipsec_esp_proposals` CHAR(200) NOT NULL DEFAULT '',
      `zt_network_id` CHAR(50) NOT NULL DEFAULT '',
      `zt_ifname` CHAR(50) NOT NULL DEFAULT '',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'node_vpn_connections' and table_schema = DATABASE()) then
	CREATE TABLE `node_vpn_connections` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `node_id` int(11) NOT NULL,
      `name` CHAR(128) NOT NULL,
      `vpn_type` enum('ipsec','ovpn','wg','zt') DEFAULT 'wg',
      `wg_private_key` CHAR(44) NOT NULL DEFAULT '',
      `wg_public_key` CHAR(44) NOT NULL DEFAULT '',
      `wg_address` CHAR(100) NOT NULL DEFAULT '',
      `wg_endpoint` CHAR(44) NOT NULL DEFAULT '',
      `wg_port` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
      `wg_extras` CHAR(100) NOT NULL DEFAULT '',
      `ovpn_server` CHAR(44) NOT NULL DEFAULT '',
      `ovpn_port` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
      `ovpn_ca` TEXT NOT NULL DEFAULT '',
      `ovpn_cert` TEXT NOT NULL DEFAULT '',
      `ovpn_key` TEXT NOT NULL DEFAULT '',
      `ovpn_tls` enum('none','tls-auth','tls-crypt','tls-crypt-v2') DEFAULT 'none',
      `ovpn_tls_value` TEXT NOT NULL DEFAULT '',
      `ipsec_server` CHAR(44) NOT NULL DEFAULT '',
      `ipsec_server_id` CHAR(200) NOT NULL DEFAULT '',
      `ipsec_if_id` INT NOT NULL DEFAULT 0,
      `ipsec_xfrm_ip` CHAR(30) NOT NULL DEFAULT '',
      `ipsec_xfrm_gw` CHAR(30) NOT NULL DEFAULT '',
      `ipsec_ca` TEXT NOT NULL DEFAULT '',
      `ipsec_cert` TEXT NOT NULL DEFAULT '',
      `ipsec_key` TEXT NOT NULL DEFAULT '',
      `ipsec_client_id` CHAR(200) NOT NULL DEFAULT '',
      `ipsec_proposals` CHAR(200) NOT NULL DEFAULT '',
      `ipsec_esp_proposals` CHAR(200) NOT NULL DEFAULT '',
      `zt_network_id` CHAR(50) NOT NULL DEFAULT '',
      `zt_ifname` CHAR(50) NOT NULL DEFAULT '',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;


if not exists (select * from information_schema.columns
    where table_name = 'ap_vpn_sessions' and table_schema = DATABASE()) then
	CREATE TABLE `ap_vpn_sessions` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `ap_vpn_connection_id` int(11) NOT NULL,
      `starttime` datetime DEFAULT NULL,
      `stoptime`  datetime DEFAULT NULL,
      `sessiontime` int(12) unsigned DEFAULT NULL,
      `rx_bytes` bigint(20) unsigned NOT NULL DEFAULT 0,
      `tx_bytes` bigint(20) unsigned NOT NULL DEFAULT 0,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
end if;

if not exists (select * from information_schema.columns
    where table_name = 'ap_vpn_stats' and table_schema = DATABASE()) then
    CREATE TABLE ap_vpn_stats (
            id int(11) NOT NULL AUTO_INCREMENT,
            ap_vpn_connection_id int(11) DEFAULT NULL,
            tx_bytes BIGINT NOT NULL,           -- Raw transmitted bytes from the device
            rx_bytes BIGINT NOT NULL,           -- Raw received bytes from the device
            created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        );
end if;

if not exists (select * from information_schema.columns
    where table_name = 'ap_vpn_connection_ap_profile_exits' and table_schema = DATABASE()) then
    CREATE TABLE ap_vpn_connection_ap_profile_exits (
            id int(11) NOT NULL AUTO_INCREMENT,
            ap_vpn_connection_id int(11) DEFAULT NULL,
            ap_profile_exit_id int(11) DEFAULT NULL,
            created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        );
end if;

if not exists (select * from information_schema.columns
    where table_name = 'ap_vpn_connection_mac_addresses' and table_schema = DATABASE()) then
    CREATE TABLE ap_vpn_connection_mac_addresses (
            id int(11) NOT NULL AUTO_INCREMENT,
            ap_vpn_connection_id int(11) DEFAULT NULL,
            mac_address_id int(11) DEFAULT NULL,
            created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        );
end if;


if not exists (select * from information_schema.columns
    where table_name = 'node_vpn_sessions' and table_schema = DATABASE()) then
	CREATE TABLE `node_vpn_sessions` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `node_vpn_connection_id` int(11) NOT NULL,
      `starttime` datetime DEFAULT NULL,
      `stoptime`  datetime DEFAULT NULL,
      `sessiontime` int(12) unsigned DEFAULT NULL,
      `rx_bytes` bigint(20) unsigned NOT NULL DEFAULT 0,
      `tx_bytes` bigint(20) unsigned NOT NULL DEFAULT 0,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
end if;

if not exists (select * from information_schema.columns
    where table_name = 'node_vpn_stats' and table_schema = DATABASE()) then
    CREATE TABLE node_vpn_stats (
            id int(11) NOT NULL AUTO_INCREMENT,
            ap_vpn_connection_id int(11) DEFAULT NULL,
            tx_bytes BIGINT NOT NULL,           -- Raw transmitted bytes from the device
            rx_bytes BIGINT NOT NULL,           -- Raw received bytes from the device
            created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        );
end if;

if not exists (select * from information_schema.columns
    where table_name = 'node_vpn_connection_mesh_exits' and table_schema = DATABASE()) then
    CREATE TABLE node_vpn_connection_mesh_exits (
            id int(11) NOT NULL AUTO_INCREMENT,
            node_vpn_connection_id int(11) DEFAULT NULL,
            mesh_exit_id int(11) DEFAULT NULL,
            created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        );
end if;

if not exists (select * from information_schema.columns
    where table_name = 'node_vpn_connection_mac_addresses' and table_schema = DATABASE()) then
    CREATE TABLE node_vpn_connection_mac_addresses (
            id int(11) NOT NULL AUTO_INCREMENT,
            node_vpn_connection_id int(11) DEFAULT NULL,
            mac_address_id int(11) DEFAULT NULL,
            created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        );
end if;


end//

delimiter ;
call add_vpn_connections;

DELIMITER //

DROP TRIGGER IF EXISTS trg_ap_vpn_sessions_ai;
//
CREATE TRIGGER trg_ap_vpn_sessions_ai
AFTER INSERT ON ap_vpn_sessions
FOR EACH ROW
BEGIN
    IF NEW.ap_vpn_connection_id IS NOT NULL THEN
        INSERT INTO ap_vpn_stats (
            ap_vpn_connection_id,
            tx_bytes,
            rx_bytes
        ) VALUES (
            NEW.ap_vpn_connection_id,
            NEW.tx_bytes,
            NEW.rx_bytes
        );
    END IF;
END;
//

DELIMITER ;

DELIMITER //

DROP TRIGGER IF EXISTS trg_ap_vpn_sessions_au;
//
CREATE TRIGGER trg_ap_vpn_sessions_au
AFTER UPDATE ON ap_vpn_sessions
FOR EACH ROW
BEGIN
    DECLARE v_tx_delta BIGINT;
    DECLARE v_rx_delta BIGINT;

    -- Only interested if bytes changed at all
    IF (NEW.tx_bytes <> OLD.tx_bytes) OR (NEW.rx_bytes <> OLD.rx_bytes) THEN

        SET v_tx_delta = NEW.tx_bytes - OLD.tx_bytes;
        SET v_rx_delta = NEW.rx_bytes - OLD.rx_bytes;

        -- Avoid negative deltas; session resets are handled in PHP as new sessions
        IF v_tx_delta < 0 THEN
            SET v_tx_delta = 0;
        END IF;

        IF v_rx_delta < 0 THEN
            SET v_rx_delta = 0;
        END IF;

        INSERT INTO ap_vpn_stats (
            ap_vpn_connection_id,
            tx_bytes,
            rx_bytes
        ) VALUES (
            NEW.ap_vpn_connection_id,
            v_tx_delta,
            v_rx_delta
        );
    END IF;
END;
//

DELIMITER ;


DELIMITER //

DROP TRIGGER IF EXISTS trg_node_vpn_sessions_ai;
//
CREATE TRIGGER trg_node_vpn_sessions_ai
AFTER INSERT ON node_vpn_sessions
FOR EACH ROW
BEGIN
    IF NEW.node_vpn_connection_id IS NOT NULL THEN
        INSERT INTO node_vpn_stats (
            node_vpn_connection_id,
            tx_bytes,
            rx_bytes
        ) VALUES (
            NEW.node_vpn_connection_id,
            NEW.tx_bytes,
            NEW.rx_bytes
        );
    END IF;
END;
//

DELIMITER ;

DELIMITER //

DROP TRIGGER IF EXISTS trg_node_vpn_sessions_au;
//
CREATE TRIGGER trg_node_vpn_sessions_au
AFTER UPDATE ON node_vpn_sessions
FOR EACH ROW
BEGIN
    DECLARE v_tx_delta BIGINT;
    DECLARE v_rx_delta BIGINT;

    -- Only interested if bytes changed at all
    IF (NEW.tx_bytes <> OLD.tx_bytes) OR (NEW.rx_bytes <> OLD.rx_bytes) THEN

        SET v_tx_delta = NEW.tx_bytes - OLD.tx_bytes;
        SET v_rx_delta = NEW.rx_bytes - OLD.rx_bytes;

        -- Avoid negative deltas; session resets are handled in PHP as new sessions
        IF v_tx_delta < 0 THEN
            SET v_tx_delta = 0;
        END IF;

        IF v_rx_delta < 0 THEN
            SET v_rx_delta = 0;
        END IF;

        INSERT INTO node_vpn_stats (
            node_vpn_connection_id,
            tx_bytes,
            rx_bytes
        ) VALUES (
            NEW.node_vpn_connection_id,
            v_tx_delta,
            v_rx_delta
        );
    END IF;
END;
//

DELIMITER ;

