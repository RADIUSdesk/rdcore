DROP PROCEDURE IF EXISTS add_columns_to_hardware;

DELIMITER //

CREATE PROCEDURE add_columns_to_hardware()
BEGIN

IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'hardwares'
      AND column_name = 'lan_2'
) THEN
    ALTER TABLE hardwares
        MODIFY COLUMN lan VARCHAR(50),
        ADD COLUMN lan_2 VARCHAR(50) NULL AFTER lan,
        ADD COLUMN lan_3 VARCHAR(50) NULL AFTER lan_2,
        ADD COLUMN lan_4 VARCHAR(50) NULL AFTER lan_3,
        ADD COLUMN add_swconfig tinyint(1) NOT NULL DEFAULT 0 AFTER lan_4,
        ADD COLUMN swconfig TEXT NULL AFTER add_swconfig;
END IF;
    
END//

DELIMITER ;

CALL add_columns_to_hardware();

