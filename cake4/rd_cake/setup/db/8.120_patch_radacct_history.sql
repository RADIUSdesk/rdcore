DELIMITER $$

CREATE PROCEDURE PatchRadacctHistory()
BEGIN
   
    -- 1. Idempotent Primary Key Update
    -- Check if 'acctstarttime' is already part of the primary key. If not, swap the PK.
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.key_column_usage 
        WHERE table_schema = DATABASE() 
          AND table_name = 'radacct_history' 
          AND constraint_name = 'PRIMARY' 
          AND column_name = 'acctstarttime'
    ) THEN
        ALTER TABLE radacct_history DROP PRIMARY KEY, ADD PRIMARY KEY (radacctid, acctstarttime);
    END IF;
    
    
    -- 2. Idempotent Partitioning Application
    -- Only partition the table if it is not already partitioned.
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.partitions 
        WHERE table_schema = DATABASE() 
          AND table_name = 'radacct_history' 
          AND partition_name IS NOT NULL
    ) THEN
        -- Corrected partition syntax with unique names matching the date bounds
        ALTER TABLE radacct_history
        PARTITION BY RANGE COLUMNS(acctstarttime)
        (
            PARTITION p_before_2026 VALUES LESS THAN ('2026-01-01'),
            PARTITION p2026_01     VALUES LESS THAN ('2026-02-01'),
            PARTITION p2026_02     VALUES LESS THAN ('2026-03-01'),
            PARTITION p2026_03     VALUES LESS THAN ('2026-04-01'),
            PARTITION p2026_04     VALUES LESS THAN ('2026-05-01'),
            PARTITION p2026_05     VALUES LESS THAN ('2026-06-01'),
            PARTITION p2026_06     VALUES LESS THAN ('2026-07-01'),
            PARTITION p2026_07     VALUES LESS THAN ('2026-08-01'),
            PARTITION p2026_08     VALUES LESS THAN ('2026-09-01'),
            PARTITION p2026_09     VALUES LESS THAN ('2026-10-01'),
            PARTITION p_future     VALUES LESS THAN (MAXVALUE)
        );
    END IF;
    
END$$

DELIMITER ;

-- Run it and clean up
CALL PatchRadacctHistory();
DROP PROCEDURE IF EXISTS PatchRadacctHistory;