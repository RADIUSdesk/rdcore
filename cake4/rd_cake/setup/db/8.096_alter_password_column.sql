drop procedure if exists alter_password_column;

delimiter //
create procedure alter_password_column()
begin

    -- Check if the password column is not already VARCHAR(255)
    IF EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'password'
        AND DATA_TYPE = 'varchar'
        AND CHARACTER_MAXIMUM_LENGTH < 255
    ) THEN
        -- Alter the password column to VARCHAR(255)
        ALTER TABLE users
        MODIFY COLUMN password VARCHAR(255);
    END IF;
    
    -- Check if the password column is not already VARCHAR(255)
    IF EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'permanent_users'
        AND COLUMN_NAME = 'password'
        AND DATA_TYPE = 'varchar'
        AND CHARACTER_MAXIMUM_LENGTH < 255
    ) THEN
        -- Alter the password column to VARCHAR(255)
        ALTER TABLE permanent_users
        MODIFY COLUMN password VARCHAR(255);
    END IF;
    
    

end//

delimiter ;
call alter_password_column;
