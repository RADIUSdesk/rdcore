drop procedure if exists add_mac_address_field;

delimiter //
create procedure add_mac_address_field()
begin

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'permanent_users'
          AND column_name = 'mac_address'
    ) THEN
        ALTER TABLE permanent_users
            ADD COLUMN mac_address VARCHAR(100) NOT NULL DEFAULT '',
            ADD INDEX idx_permanent_users_mac_address (mac_address);
            
        CREATE INDEX idx_perm_users_expiry ON permanent_users (admin_state, `to_date`);
    END IF;

end//

delimiter ;
call add_mac_address_field;

