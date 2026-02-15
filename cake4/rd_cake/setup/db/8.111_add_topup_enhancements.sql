drop procedure if exists add_topup_enhancements;

delimiter //
create procedure add_topup_enhancements()
begin

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'top_up_transactions'
          AND column_name = 'applied_days'
    ) THEN
        ALTER TABLE top_up_transactions 
            ADD COLUMN applied_days int(11) NULL AFTER new_value,
            ADD COLUMN expired_gap_days int(11) NULL AFTER applied_days;
    END IF;

end//

delimiter ;
call add_topup_enhancements;

