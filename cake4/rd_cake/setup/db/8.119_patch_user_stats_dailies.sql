DELIMITER $$

CREATE PROCEDURE PatchUserStatsDailies()
BEGIN

    -- =========================================================================
    -- PART 2: TABLE 'user_stats_dailies' MIGRATIONS
    -- =========================================================================

    -- 1. Rename column and convert type from TIMESTAMP to DATETIME
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND column_name = 'timestamp'
    ) THEN
        ALTER TABLE user_stats_dailies CHANGE timestamp created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- 2. Drop legacy indexes if they still exist under the old names
    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND index_name = 'usd_realm_timestamp') THEN
        ALTER TABLE user_stats_dailies DROP INDEX usd_realm_timestamp;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND index_name = 'usd_username_timestamp') THEN
        ALTER TABLE user_stats_dailies DROP INDEX usd_username_timestamp;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND index_name = 'usd_nasidentifier_timestamp') THEN
        ALTER TABLE user_stats_dailies DROP INDEX usd_nasidentifier_timestamp;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND index_name = 'usd_callingstationid_timestamp') THEN
        ALTER TABLE user_stats_dailies DROP INDEX usd_callingstationid_timestamp;
    END IF;

    -- 3. Idempotent Primary Key Update for 'user_stats_dailies' (Preparing for future partitioning)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.key_column_usage 
        WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' 
          AND constraint_name = 'PRIMARY' AND column_name = 'created'
    ) THEN
        -- Re-specifying 'id' with its properties keeps the auto_increment engine stable
        ALTER TABLE user_stats_dailies MODIFY id INT(11) NOT NULL AUTO_INCREMENT, DROP PRIMARY KEY, ADD PRIMARY KEY (id, created);
    END IF;

    -- 4. Create the new composite indexes matching the 'created' column name
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND index_name = 'usd_realm_created') THEN
        ALTER TABLE user_stats_dailies ADD INDEX usd_realm_created (realm, created);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND index_name = 'usd_username_created') THEN
        ALTER TABLE user_stats_dailies ADD INDEX usd_username_created (username, created);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND index_name = 'usd_nasidentifier_created') THEN
        ALTER TABLE user_stats_dailies ADD INDEX usd_nasidentifier_created (nasidentifier, created);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats_dailies' AND index_name = 'usd_callingstationid_created') THEN
        ALTER TABLE user_stats_dailies ADD INDEX usd_callingstationid_created (callingstationid, created);
    END IF;
    

END$$

DELIMITER ;

-- Run it and clean up
CALL PatchUserStatsDailies();
DROP PROCEDURE IF EXISTS PatchUserStatsDailies;
