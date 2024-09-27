BEGIN;

-- First, ensure plpgsql is enabled
CREATE OR REPLACE FUNCTION manage_user_stats_after_insert() 
RETURNS TRIGGER AS $$
DECLARE
    latest_user_stats_id INTEGER;
    creation_time_difference INTERVAL;
    new_acctinputoctets BIGINT := 0;
    new_acctoutputoctets BIGINT := 0;
    stats_interval INTERVAL := '30 minutes';
BEGIN
    -- Calculate new data
    new_acctinputoctets := NEW.acctinputoctets;
    new_acctoutputoctets := NEW.acctoutputoctets;

    -- Find the latest entry in user_stats for the given radacct_id
    SELECT id, AGE(CURRENT_TIMESTAMP, created)
    INTO latest_user_stats_id, creation_time_difference
    FROM user_stats
    WHERE radacct_id = NEW.radacctid
    ORDER BY timestamp DESC
    LIMIT 1;

    -- There is no latest_user_stats, insert a new entry
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
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            new_acctinputoctets,
            new_acctoutputoctets
        );
    ELSEIF creation_time_difference <= stats_interval THEN
        -- Update the existing entry if it's within stats_interval
        UPDATE user_stats
        SET acctinputoctets = acctinputoctets + (new_acctinputoctets - (SELECT COALESCE(SUM(acctinputoctets), 0) FROM user_stats WHERE radacct_id = NEW.radacctid)),
            acctoutputoctets = acctoutputoctets + (new_acctoutputoctets - (SELECT COALESCE(SUM(acctoutputoctets), 0) FROM user_stats WHERE radacct_id = NEW.radacctid)),
            timestamp = CURRENT_TIMESTAMP
        WHERE id = latest_user_stats_id;
    ELSE
        -- If the interval is exceeded, insert a new entry
        new_acctinputoctets := new_acctinputoctets - (SELECT COALESCE(SUM(acctinputoctets), 0) FROM user_stats WHERE radacct_id = NEW.radacctid);
        new_acctoutputoctets := new_acctoutputoctets - (SELECT COALESCE(SUM(acctoutputoctets), 0) FROM user_stats WHERE radacct_id = NEW.radacctid);

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
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            new_acctinputoctets,
            new_acctoutputoctets
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Now create the trigger
CREATE TRIGGER manage_user_stats_after_insert
AFTER INSERT ON radacct
FOR EACH ROW
EXECUTE FUNCTION manage_user_stats_after_insert();


-- First, ensure plpgsql is enabled
CREATE OR REPLACE FUNCTION manage_user_stats_after_update() 
RETURNS TRIGGER AS $$
DECLARE
    latest_user_stats_id INTEGER;
    creation_time_difference INTERVAL;
    updated_acctinputoctets BIGINT := 0;
    updated_acctoutputoctets BIGINT := 0;
    stats_interval INTERVAL := '30 minutes';
BEGIN
    -- Calculate updated data
    updated_acctinputoctets := NEW.acctinputoctets;
    updated_acctoutputoctets := NEW.acctoutputoctets;

    -- Find the latest entry in user_stats for the given radacct_id
    SELECT id, AGE(CURRENT_TIMESTAMP, created)
    INTO latest_user_stats_id, creation_time_difference
    FROM user_stats
    WHERE radacct_id = NEW.radacctid
    ORDER BY timestamp DESC
    LIMIT 1;

    -- If no latest_user_stats entry exists, insert a new entry
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
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            updated_acctinputoctets,
            updated_acctoutputoctets
        );
    ELSEIF creation_time_difference <= stats_interval THEN
        -- Update the existing entry if it's within the stats_interval (30 minutes)
        UPDATE user_stats
        SET acctinputoctets = acctinputoctets + (updated_acctinputoctets - (SELECT COALESCE(SUM(acctinputoctets), 0) FROM user_stats WHERE radacct_id = NEW.radacctid)),
            acctoutputoctets = acctoutputoctets + (updated_acctoutputoctets - (SELECT COALESCE(SUM(acctoutputoctets), 0) FROM user_stats WHERE radacct_id = NEW.radacctid)),
            timestamp = CURRENT_TIMESTAMP
        WHERE id = latest_user_stats_id;
    ELSE
        -- If the interval is exceeded, insert a new entry
        updated_acctinputoctets := updated_acctinputoctets - (SELECT COALESCE(SUM(acctinputoctets), 0) FROM user_stats WHERE radacct_id = NEW.radacctid);
        updated_acctoutputoctets := updated_acctoutputoctets - (SELECT COALESCE(SUM(acctoutputoctets), 0) FROM user_stats WHERE radacct_id = NEW.radacctid);

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
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            updated_acctinputoctets,
            updated_acctoutputoctets
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Now create the trigger
CREATE TRIGGER manage_user_stats_after_update
AFTER UPDATE ON radacct
FOR EACH ROW
EXECUTE FUNCTION manage_user_stats_after_update();

COMMIT;
