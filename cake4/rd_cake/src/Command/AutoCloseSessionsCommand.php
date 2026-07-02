<?php

//cd /var/www/html/cake4/rd_cake && bin/cake auto_close_sessions

declare(strict_types=1);

namespace App\Command;

use Cake\Command\Command;
use Cake\Console\Arguments;
use Cake\Console\ConsoleIo;
use Cake\Datasource\ConnectionManager;

class AutoCloseSessionsCommand extends Command
{
    public function execute(Arguments $args, ConsoleIo $io): ?int
    {
        $io->out('<comment>==============================</comment>');
        $io->out('<comment>---Stale Session Checking-----</comment>');
        $io->out('<comment>-------RADIUSdesk 2026--------</comment>');
        $io->out('<comment>______________________________</comment>');

        $db = ConnectionManager::get('default');

        // ==========================================
        // 1. OPTIMIZATION FOR NAS DEVICES
        // ==========================================
        $io->out("<info>AutoClose::Processing Stale NAS Sessions via JOIN...</info>");
        
        // This single query replaces the entire foreach loop for NAS devices.
        // It updates rows only if they match the specific dead time interval per NAS.
        $nasRowsAffected = $db->execute("
            UPDATE radacct r
            JOIN nas n ON (r.nasipaddress = n.nasname OR r.nasidentifier = n.nasidentifier)
            SET r.acctstoptime = r.acctupdatetime, 
                r.acctterminatecause = 'Clear-Stale-Session'
            WHERE n.session_auto_close = '1'
              AND r.acctstoptime IS NULL
              AND r.acctupdatetime < NOW() - INTERVAL n.session_dead_time SECOND
        ")->rowCount();

        $io->out("<info>AutoClose::Closed $nasRowsAffected stale NAS sessions.</info>");

        // ==========================================
        // 2. OPTIMIZATION FOR DYNAMIC CLIENTS
        // ==========================================
        $io->out("<info>AutoClose::Processing Stale DynamicClient Sessions via JOIN...</info>");

        // This handles all dynamic client sessions in one single sweep.
        $dcRowsAffected = $db->execute("
            UPDATE radacct r
            JOIN dynamic_clients dc ON (
                (dc.nasidentifier != '' AND r.nasidentifier = dc.nasidentifier) OR 
                (dc.calledstationid != '' AND r.calledstationid = dc.calledstationid)
            )
            SET r.acctstoptime = r.acctupdatetime, 
                r.acctterminatecause = 'Clear-Stale-Session'
            WHERE dc.session_auto_close = '1'
              AND r.acctstoptime IS NULL
              AND r.acctupdatetime < NOW() - INTERVAL dc.session_dead_time SECOND
        ")->rowCount();

        $io->out("<info>AutoClose::Closed $dcRowsAffected stale DynamicClient sessions.</info>");

        $io->out("<success>AutoClose Tasks finished successfully.</success>");
        return static::CODE_SUCCESS;
    }
}
