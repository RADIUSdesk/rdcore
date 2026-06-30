DELIMITER $$

CREATE PROCEDURE PatchUserStats()
BEGIN

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'idx_radacct_timestamp') THEN
        ALTER TABLE user_stats DROP INDEX idx_radacct_timestamp;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'idx_radacct_id') THEN
        ALTER TABLE user_stats DROP INDEX idx_radacct_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'idx_radacct_timestamp') THEN
        ALTER TABLE user_stats DROP INDEX idx_radacct_timestamp;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'us_callingstationid_timestamp') THEN
        ALTER TABLE user_stats DROP INDEX us_callingstationid_timestamp;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'us_nasidentifier_timestamp') THEN
        ALTER TABLE user_stats DROP INDEX us_nasidentifier_timestamp;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'us_username_timestamp') THEN
        ALTER TABLE user_stats DROP INDEX us_username_timestamp;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
          AND table_name = 'user_stats' 
          AND column_name = 'created'
          AND (data_type != 'datetime' OR is_nullable = 'YES')
    ) THEN
        -- This statement only executes if the column is not yet converted
        ALTER TABLE user_stats MODIFY created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;


    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'us_realm_timestamp') THEN
        ALTER TABLE user_stats DROP INDEX us_realm_timestamp;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'us_username_created') THEN
        CREATE INDEX us_username_created ON user_stats (username, created);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'us_realm_created') THEN
        CREATE INDEX us_realm_created ON user_stats (realm, created);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'us_nasidentifier_created') THEN
        CREATE INDEX us_nasidentifier_created ON user_stats (nasidentifier, created);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'us_nasipaddress_created') THEN
        CREATE INDEX us_nasipaddress_created ON user_stats (nasipaddress, created);
    END IF;
    
    
    -- 4. Idempotent Primary Key Update
    -- Check if 'created' is already part of the primary key. If not, swap the PK.
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.key_column_usage 
        WHERE table_schema = DATABASE() 
          AND table_name = 'user_stats' 
          AND constraint_name = 'PRIMARY' 
          AND column_name = 'created'
    ) THEN
        ALTER TABLE user_stats DROP PRIMARY KEY, ADD PRIMARY KEY (id, created);
    END IF;

    -- 5. Idempotent Partitioning Application
    -- Only partition the table if it is not already partitioned.
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.partitions 
        WHERE table_schema = DATABASE() 
          AND table_name = 'user_stats' 
          AND partition_name IS NOT NULL
    ) THEN
        -- Corrected partition syntax with unique names matching the date bounds
        ALTER TABLE user_stats
        PARTITION BY RANGE COLUMNS(created)
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
CALL PatchUserStats();
DROP PROCEDURE IF EXISTS PatchUserStats;
