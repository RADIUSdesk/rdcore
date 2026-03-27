drop procedure if exists add_radacct_triggers;

delimiter //
create procedure add_radacct_triggers()
begin

    if not exists (select * from information_schema.columns
        where column_name = 'created' and table_name = 'user_stats' and table_schema = DATABASE()) then
        ALTER TABLE user_stats ADD COLUMN created TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    end if;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'idx_radacct_id') THEN
        CREATE INDEX idx_radacct_id ON user_stats (radacct_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_stats' AND index_name = 'idx_radacct_timestamp') THEN
        CREATE INDEX idx_radacct_timestamp ON user_stats (radacct_id, timestamp);
    END IF;

end//

delimiter ;

call add_radacct_triggers;

DROP TRIGGER IF EXISTS manage_user_stats_after_insert;

-- Check if the 'manage_user_stats_after_insert' trigger exists, and create it if it doesn't
DELIMITER //

CREATE TRIGGER manage_user_stats_after_insert
AFTER INSERT ON radacct
FOR EACH ROW
proc: BEGIN
    DECLARE latest_user_stats_id INT DEFAULT NULL;
    DECLARE creation_time_difference INT DEFAULT NULL;

    DECLARE total_input BIGINT DEFAULT 0;
    DECLARE total_output BIGINT DEFAULT 0;

    DECLARE delta_input BIGINT DEFAULT 0;
    DECLARE delta_output BIGINT DEFAULT 0;

    DECLARE stats_interval INT DEFAULT 30;


    -- 1. Ignore invalid incoming values early
    IF NEW.acctinputoctets <= 0 OR NEW.acctoutputoctets <= 0 THEN
        LEAVE proc;
    END IF;

    -- 2. Get latest stats row
    SELECT id, TIMESTAMPDIFF(MINUTE, created, NOW())
    INTO latest_user_stats_id, creation_time_difference
    FROM user_stats
    WHERE radacct_id = NEW.radacctid
    ORDER BY timestamp DESC
    LIMIT 1;

    -- 3. Get current totals (ONLY ONCE)
    SELECT 
        COALESCE(SUM(acctinputoctets), 0),
        COALESCE(SUM(acctoutputoctets), 0)
    INTO total_input, total_output
    FROM user_stats
    WHERE radacct_id = NEW.radacctid;

    -- 4. Compute deltas
    SET delta_input  = NEW.acctinputoctets  - total_input;
    SET delta_output = NEW.acctoutputoctets - total_output;

    -- 5. Reject zero or negative deltas (CRITICAL)
    IF delta_input <= 0 OR delta_output <= 0 THEN
        LEAVE proc;
    END IF;

    -- 6. No existing row → INSERT
    IF latest_user_stats_id IS NULL THEN
        
        INSERT INTO user_stats (
            radacct_id,
            username,
            realm,
            nasipaddress,
            nasidentifier,
            framedipaddress,
            callingstationid,
            timestamp,
            created,
            acctinputoctets,
            acctoutputoctets
        )
        VALUES (
            NEW.radacctid,
            NEW.username,
            NEW.realm,
            NEW.nasipaddress,
            NEW.nasidentifier,
            NEW.framedipaddress,
            NEW.callingstationid,
            NOW(),
            NOW(),
            delta_input,
            delta_output
        );

    -- 7. Within interval → UPDATE existing bucket
    ELSEIF creation_time_difference <= stats_interval THEN
        
        UPDATE user_stats
        SET 
            acctinputoctets = acctinputoctets + delta_input,
            acctoutputoctets = acctoutputoctets + delta_output,
            timestamp = NOW()
        WHERE id = latest_user_stats_id;

    -- 8. Outside interval → INSERT new bucket
    ELSE
        
        INSERT INTO user_stats (
            radacct_id,
            username,
            realm,
            nasipaddress,
            nasidentifier,
            framedipaddress,
            callingstationid,
            timestamp,
            created,
            acctinputoctets,
            acctoutputoctets
        )
        VALUES (
            NEW.radacctid,
            NEW.username,
            NEW.realm,
            NEW.nasipaddress,
            NEW.nasidentifier,
            NEW.framedipaddress,
            NEW.callingstationid,
            NOW(),
            NOW(),
            delta_input,
            delta_output
        );

    END IF;
    
END //

DELIMITER ;


DROP TRIGGER IF EXISTS manage_user_stats_after_update;

-- Check if the 'manage_user_stats_after_update' trigger exists, and create it if it doesn't
DELIMITER //

CREATE TRIGGER manage_user_stats_after_update
AFTER UPDATE ON radacct
FOR EACH ROW
proc: BEGIN

    DECLARE latest_user_stats_id INT DEFAULT NULL;
    DECLARE creation_time_difference INT DEFAULT NULL;

    DECLARE total_input BIGINT DEFAULT 0;
    DECLARE total_output BIGINT DEFAULT 0;

    DECLARE delta_input BIGINT DEFAULT 0;
    DECLARE delta_output BIGINT DEFAULT 0;

    DECLARE stats_interval INT DEFAULT 30;
    
    -- AA. History logging (unchanged, but safe)
    IF OLD.acctstoptime IS NULL AND NEW.acctstoptime IS NOT NULL THEN
        
        INSERT INTO radacct_history 
        SELECT * FROM radacct WHERE radacctid = NEW.radacctid;

    END IF;
    
    -- 1. Ignore invalid incoming values early
    IF NEW.acctinputoctets <= 0 OR NEW.acctoutputoctets <= 0 THEN
        LEAVE proc;
    END IF;

    -- 2. Get latest stats row
    SELECT id, TIMESTAMPDIFF(MINUTE, created, NOW())
    INTO latest_user_stats_id, creation_time_difference
    FROM user_stats
    WHERE radacct_id = NEW.radacctid
    ORDER BY timestamp DESC
    LIMIT 1;

    -- 3. Get current totals (ONLY ONCE)
    SELECT 
        COALESCE(SUM(acctinputoctets), 0),
        COALESCE(SUM(acctoutputoctets), 0)
    INTO total_input, total_output
    FROM user_stats
    WHERE radacct_id = NEW.radacctid;

    -- 4. Compute deltas
    SET delta_input  = NEW.acctinputoctets  - total_input;
    SET delta_output = NEW.acctoutputoctets - total_output;

    -- 5. Reject zero or negative deltas (CRITICAL FIX)
    IF delta_input <= 0 OR delta_output <= 0 THEN
        LEAVE proc;
    END IF;

    -- 6. No existing row → INSERT
    IF latest_user_stats_id IS NULL THEN
        
        INSERT INTO user_stats (
            radacct_id,
            username,
            realm,
            nasipaddress,
            nasidentifier,
            framedipaddress,
            callingstationid,
            timestamp,
            created,
            acctinputoctets,
            acctoutputoctets
        )
        VALUES (
            NEW.radacctid,
            NEW.username,
            NEW.realm,
            NEW.nasipaddress,
            NEW.nasidentifier,
            NEW.framedipaddress,
            NEW.callingstationid,
            NOW(),
            NOW(),
            delta_input,
            delta_output
        );

    -- 7. Within interval → UPDATE
    ELSEIF creation_time_difference <= stats_interval THEN
        
        UPDATE user_stats
        SET 
            acctinputoctets = acctinputoctets + delta_input,
            acctoutputoctets = acctoutputoctets + delta_output,
            timestamp = NOW()
        WHERE id = latest_user_stats_id;

    -- 8. Outside interval → INSERT new bucket
    ELSE
        
        INSERT INTO user_stats (
            radacct_id,
            username,
            realm,
            nasipaddress,
            nasidentifier,
            framedipaddress,
            callingstationid,
            timestamp,
            created,
            acctinputoctets,
            acctoutputoctets
        )
        VALUES (
            NEW.radacctid,
            NEW.username,
            NEW.realm,
            NEW.nasipaddress,
            NEW.nasidentifier,
            NEW.framedipaddress,
            NEW.callingstationid,
            NOW(),
            NOW(),
            delta_input,
            delta_output
        );

    END IF;    

END //
