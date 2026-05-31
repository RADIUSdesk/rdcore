DROP PROCEDURE IF EXISTS improve_alerts;

DELIMITER //

CREATE PROCEDURE improve_alerts()
BEGIN

IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'alerts'
      AND column_name = 'category'
) THEN

    ALTER TABLE alerts
        ADD COLUMN category ENUM('alert','event','info') DEFAULT 'alert' AFTER id;

END IF;
    
END//

DELIMITER ;

CALL improve_alerts();

