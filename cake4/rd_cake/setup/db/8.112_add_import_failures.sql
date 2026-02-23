DROP PROCEDURE IF EXISTS add_import_failures;

DELIMITER //

CREATE PROCEDURE add_import_failures()
BEGIN

IF NOT EXISTS (
    SELECT *
    FROM information_schema.tables
    WHERE table_name = 'import_failures'
      AND table_schema = DATABASE()
) THEN

    CREATE TABLE import_failures (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        cloud_id INT NULL,
        model VARCHAR(100) NOT NULL,
        csv_row INT NULL,
        identifier VARCHAR(255) NULL,
        error_type VARCHAR(50) NOT NULL,
        error_message TEXT NULL,
        payload TEXT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cloud_id (cloud_id),
        INDEX idx_model (model),
        INDEX idx_identifier (identifier)
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci;

END IF;

END//

DELIMITER ;

CALL add_import_failures();

