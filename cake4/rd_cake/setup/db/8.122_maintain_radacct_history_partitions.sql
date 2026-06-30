DELIMITER $$

CREATE OR REPLACE PROCEDURE maintain_radacct_history_partitions(
    IN p_keep_months INT,
    IN p_future_months INT
)
BEGIN
    DECLARE v_month DATE;
    DECLARE v_boundary DATE;
    DECLARE v_part_name VARCHAR(20);
    DECLARE v_exists INT;
    DECLARE v_sql TEXT;
  
    SET v_month = DATE_FORMAT(CURDATE(), '%Y-%m-01');

    create_loop:
    WHILE p_future_months >= 0 DO

        SET v_part_name = DATE_FORMAT(v_month,'p%Y_%m');

        SELECT COUNT(*)
          INTO v_exists
          FROM information_schema.PARTITIONS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'radacct_history'
           AND PARTITION_NAME = v_part_name;

        IF v_exists = 0 THEN

            SET v_boundary = DATE_ADD(v_month, INTERVAL 1 MONTH);

            SET v_sql = CONCAT(
                'ALTER TABLE radacct_history ',
                'REORGANIZE PARTITION p_future INTO (',
                'PARTITION ', v_part_name,
                ' VALUES LESS THAN (''', v_boundary, '''),',
                'PARTITION p_future VALUES LESS THAN (MAXVALUE)',
                ')'
            );

            PREPARE stmt FROM v_sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

        END IF;

        SET v_month = DATE_ADD(v_month, INTERVAL 1 MONTH);

        SET p_future_months = p_future_months - 1;

    END WHILE;

    SET v_month = DATE_FORMAT(
        DATE_SUB(CURDATE(), INTERVAL p_keep_months MONTH),
        '%Y-%m-01'
    );

    SET v_part_name = DATE_FORMAT(v_month,'p%Y_%m');

    SELECT COUNT(*)
      INTO v_exists
      FROM information_schema.PARTITIONS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME='radacct_history'
       AND PARTITION_NAME=v_part_name;

    IF v_exists = 1 THEN

        SET v_sql = CONCAT(
            'ALTER TABLE radacct_history DROP PARTITION ',
            v_part_name
        );

        PREPARE stmt FROM v_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    END IF;

END$$

DELIMITER ;

call maintain_radacct_history_partitions(12,3);


CREATE EVENT IF NOT EXISTS ev_radacct_history_partition_maintenance
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE,'00:15:00')
DO
CALL maintain_radacct_history_partitions(
    12,     -- keep last 12 months
    3       -- always keep 3 months ahead
);
