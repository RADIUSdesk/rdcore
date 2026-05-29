DROP PROCEDURE IF EXISTS add_clients;

DELIMITER //

CREATE PROCEDURE add_clients()
BEGIN

IF NOT EXISTS (
    SELECT *
    FROM information_schema.tables
    WHERE table_name = 'clients'
      AND table_schema = DATABASE()
) THEN

    CREATE TABLE `clients` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `username` varchar(255) NOT NULL,
      `password` varchar(255) NOT NULL,
      `token` char(36) NOT NULL,
      `name` varchar(50) NOT NULL,
      `surname` varchar(50) NOT NULL,
      `address` varchar(255) NOT NULL,
      `phone` varchar(50) NOT NULL,
      `active` tinyint(1) NOT NULL DEFAULT 0,
      `created` datetime DEFAULT NULL,
      `modified` datetime DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    
END IF;

IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'aps'
      AND column_name = 'client_id'
) THEN
    ALTER TABLE aps
        ADD COLUMN client_id BIGINT UNSIGNED NULL AFTER admin_state;
END IF;

IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'nodes'
      AND column_name = 'client_id'
) THEN
    ALTER TABLE nodes
        ADD COLUMN client_id BIGINT UNSIGNED NULL AFTER admin_state;
END IF;


IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'permanent_users'
      AND column_name = 'client_id'
) THEN
    ALTER TABLE permanent_users
        ADD COLUMN client_id BIGINT UNSIGNED NULL AFTER mac_address ;
END IF;


END//

DELIMITER ;

CALL add_clients();
