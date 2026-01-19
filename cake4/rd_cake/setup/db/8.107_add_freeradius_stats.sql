drop procedure if exists add_freeradius_stats;

delimiter //
create procedure add_freeradius_stats()
begin

if not exists (select * from information_schema.columns
    where table_name = 'freeradius_instances' and table_schema = DATABASE()) then
    
        CREATE TABLE `freeradius_instances` (
          `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          `tag` VARCHAR(64) DEFAULT NULL,          -- e.g. hostname / role / cloud tag
          `server` VARCHAR(128) NOT NULL,          -- "127.0.0.1:18121"

          -- FreeRADIUS status times
          `stats_start_time` DATETIME DEFAULT NULL, -- FreeRADIUS-Stats-Start-Time
          `stats_hup_time`   DATETIME DEFAULT NULL, -- FreeRADIUS-Stats-HUP-Time

          -- ===== AUTH totals (Access + Auth) =====
          `total_access_requests`      BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Access-Requests
          `total_access_accepts`       BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Access-Accepts
          `total_access_rejects`       BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Access-Rejects
          `total_access_challenges`    BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Access-Challenges
          `total_auth_responses`       BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Auth-Responses
          `auth_duplicate_requests`    BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Auth-Duplicate-Requests
          `auth_malformed_requests`    BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Auth-Malformed-Requests
          `auth_invalid_requests`      BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Auth-Invalid-Requests
          `auth_dropped_requests`      BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Auth-Dropped-Requests
          `auth_unknown_types`         BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Auth-Unknown-Types
          `auth_conflicts`             BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Auth-Conflicts

          -- ===== ACCOUNTING totals =====
          `total_acct_requests`        BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Accounting-Requests
          `total_acct_responses`       BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Accounting-Responses
          `acct_duplicate_requests`    BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Acct-Duplicate-Requests
          `acct_malformed_requests`    BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Acct-Malformed-Requests
          `acct_invalid_requests`      BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Acct-Invalid-Requests
          `acct_dropped_requests`      BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Acct-Dropped-Requests
          `acct_unknown_types`         BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Acct-Unknown-Types
          `acct_conflicts`             BIGINT UNSIGNED DEFAULT 0,  -- FreeRADIUS-Total-Acct-Conflicts

          -- ===== USTH (queues/pps/threads) =====
          `queue_len_internal`         INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Queue-Len-Internal
          `queue_len_proxy`            INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Queue-Len-Proxy
          `queue_len_auth`             INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Queue-Len-Auth
          `queue_len_acct`             INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Queue-Len-Acct
          `queue_len_detail`           INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Queue-Len-Detail

          `queue_pps_in`               INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Queue-PPS-In
          `queue_pps_out`              INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Queue-PPS-Out

          `threads_active`             INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Stats-Threads-Active
          `threads_total`              INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Stats-Threads-Total
          `threads_max`                INT UNSIGNED DEFAULT 0,     -- FreeRADIUS-Stats-Threads-Max
          `created`                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `modified`                   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'freeradius_stats' and table_schema = DATABASE()) then
    
        CREATE TABLE `freeradius_stats` (
          `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          `tag` VARCHAR(64) DEFAULT NULL,
          `access_requests`      BIGINT UNSIGNED DEFAULT 0, 
          `access_accepts`       BIGINT UNSIGNED DEFAULT 0,
          `access_rejects`       BIGINT UNSIGNED DEFAULT 0, 
          `access_challenges`    BIGINT UNSIGNED DEFAULT 0, 
          `auth_responses`       BIGINT UNSIGNED DEFAULT 0,
          `acct_requests`        BIGINT UNSIGNED DEFAULT 0, 
          `acct_responses`       BIGINT UNSIGNED DEFAULT 0, 
          `created`              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `modified`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        
        CREATE INDEX idx_freeradius_stats_tag_created ON freeradius_stats (tag, created);
        CREATE INDEX idx_freeradius_stats_created ON freeradius_stats (created);


end if;


end//

delimiter ;
call add_freeradius_stats;
