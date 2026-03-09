DROP PROCEDURE IF EXISTS add_client_id_columns;

DELIMITER //

CREATE PROCEDURE add_client_id_columns()
BEGIN

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

CALL add_client_id_columns();

