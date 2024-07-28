drop procedure if exists add_sqm_profiles;

delimiter //
create procedure add_sqm_profiles()
begin

if not exists (select * from information_schema.columns
    where table_name = 'sqm_profiles' and table_schema = 'rd') then
     CREATE TABLE `sqm_profiles` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `cloud_id` int(11) DEFAULT NULL,
        `upload` int(11) NOT NULL DEFAULT 2032,
        `download` int(11) NOT NULL DEFAULT 14698,
        `linklayer` ENUM('none','ethernet','atm') NOT NULL DEFAULT 'none',
        `overhead` INT NOT NULL,
        `tcMTU` INT NOT NULL,
        `tcTSIZE` INT NOT NULL,
        `tcMPU` INT NOT NULL,
        `ilimit` INT NOT NULL,
        `elimit` INT NOT NULL,
        `itarget` VARCHAR(10) NOT NULL,
        `etarget` VARCHAR(10) NOT NULL,
        `ingress_ecn` ENUM('ECN','NOECN') NOT NULL DEFAULT 'ECN',
        `egress_ecn` ENUM('ECN','NOECN') NOT NULL DEFAULT 'ECN',
        `target` VARCHAR(10) NOT NULL,
        `squash_dscp` BOOLEAN NOT NULL DEFAULT 1,
        `squash_ingress` BOOLEAN NOT NULL DEFAULT 1,
        `qdisc` ENUM('fq_codel','efq_codel','nfq_codel', 'sfq', 'codel', 'ns2_codel', 'pie', 'cake') NOT NULL DEFAULT 'fq_codel',
        `script` ENUM('simple.qos', 'simplest.qos', 'layer_cake.qos', 'piece_of_cake.qos', 'simplest_tbf.qos') NOT NULL DEFAULT 'simple.qos',
        `iqdisc_opts` TEXT,
        `eqdisc_opts` TEXT,
        `qdisc_advanced` BOOLEAN NOT NULL DEFAULT 0,
        `qdisc_really_advanced` BOOLEAN NOT NULL DEFAULT 0,
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where column_name = 'apply_sqm_profile' and table_name = 'ap_profile_exits' and table_schema = 'rd') then
    alter table ap_profile_exits add column `apply_sqm_profile` tinyint(1) NOT NULL DEFAULT 0;
    alter table ap_profile_exits add column `sqm_profile_id` int(11) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'apply_sqm_profile' and table_name = 'mesh_exits' and table_schema = 'rd') then
    alter table mesh_exits add column `apply_sqm_profile` tinyint(1) NOT NULL DEFAULT 0;
    alter table mesh_exits add column `sqm_profile_id` int(11) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where table_name = 'sqm_stats' and table_schema = 'rd') then
     CREATE TABLE `sqm_stats` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `ap_profile_exit_id` int(11) DEFAULT NULL,
        `mesh_exit_id` int(11) DEFAULT NULL,
        `bytes` BIGINT NOT NULL,
        `packets` BIGINT NOT NULL,
        `drops` BIGINT NOT NULL,
        `overlimits` BIGINT NOT NULL,
        `backlog` BIGINT NOT NULL,
        `qlen` BIGINT NOT NULL,
        `memory_used` BIGINT NOT NULL,
        `peak_delay_us` BIGINT NOT NULL,
        `avg_delay_us` BIGINT NOT NULL,
        `base_delay_us` BIGINT NOT NULL,
        `way_misses` BIGINT NOT NULL,
        `way_indirect_hits` BIGINT NOT NULL,
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
     PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

end//

delimiter ;
call add_sqm_profiles

