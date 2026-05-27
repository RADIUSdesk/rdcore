drop procedure if exists add_audit_logs;

delimiter //
create procedure add_audit_logs()
begin

if not exists (select * from information_schema.columns
    where table_name = 'audit_logs' and table_schema = DATABASE()) then
    
    CREATE TABLE audit_logs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NULL,
        actor_type VARCHAR(50) DEFAULT 'admin',
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100) NULL,
        entity_id VARCHAR(64) NULL,
        changes JSON NULL,
        url TEXT,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_action (action),
        INDEX idx_entity (entity, entity_id),
        INDEX idx_user (user_id),
        INDEX idx_created (created)
    );  
    
end if;

end//

delimiter ;
call add_audit_logs;
