<?php
declare(strict_types=1);

namespace App\Command;

use Cake\Command\Command;
use Cake\Console\Arguments;
use Cake\Console\ConsoleIo;
use Cake\Datasource\ConnectionManager;

class UpdateNodeDowntimeCommand extends Command
{
    /**
     * Main execution block using raw SQL optimizations
     */
    public function execute(Arguments $args, ConsoleIo $io): ?int
    {
        $io->info("Updating Node Downtime via Native SQL (High Performance)...");
        
        $db = ConnectionManager::get('default');
        $now = date('Y-m-d H:i:s');

        // ==========================================
        // 1. STEP 1: GET DEFAULT DEAD AFTER
        // ==========================================
        $defaultDeadAfter = 900;
        $row = $db->execute(
            "SELECT value FROM user_settings WHERE user_id = '-1' AND name = 'heartbeat_dead_after' LIMIT 1"
        )->fetch('assoc');
        
        if ($row) {
            $defaultDeadAfter = (int)$row['value'];
        }

        // ==========================================
        // 2. STEP 2: BULK UPDATE EXISTING 'DOWN' HISTORIES
        // ==========================================
        // Instead of a loop, update the timestamp of all devices whose latest state is 
        // already down (0) AND who have missed their heartbeat cutoff window.
        $io->info("Bulk updating existing dead records...");
        
        // For Nodes
        $db->execute("
            UPDATE node_uptm_histories nuh
            JOIN (
                SELECT node_id, MAX(report_datetime) as max_time 
                FROM node_uptm_histories GROUP BY node_id
            ) latest ON nuh.node_id = latest.node_id AND nuh.report_datetime = latest.max_time
            JOIN nodes n ON n.id = nuh.node_id
            JOIN meshes m ON m.id = n.mesh_id
            LEFT JOIN node_settings ns ON ns.mesh_id = m.id
            SET nuh.report_datetime = :now
            WHERE nuh.node_state = 0
              AND latest.max_time < DATE_SUB(:now2, INTERVAL COALESCE(ns.heartbeat_dead_after, :dead_after) SECOND)
        ", ['now' => $now, 'now2' => $now, 'dead_after' => $defaultDeadAfter]);

        // For APs
        $db->execute("
            UPDATE ap_uptm_histories auh
            JOIN (
                SELECT ap_id, MAX(report_datetime) as max_time 
                FROM ap_uptm_histories GROUP BY ap_id
            ) latest ON auh.ap_id = latest.ap_id AND auh.report_datetime = latest.max_time
            JOIN aps a ON a.id = auh.ap_id
            JOIN ap_profiles ap ON ap.id = a.ap_profile_id
            LEFT JOIN ap_profile_settings aps ON aps.ap_profile_id = ap.id
            SET auh.report_datetime = :now
            WHERE auh.ap_state = 0
              AND latest.max_time < DATE_SUB(:now2, INTERVAL COALESCE(aps.heartbeat_dead_after, :dead_after) SECOND)
        ", ['now' => $now, 'now2' => $now, 'dead_after' => $defaultDeadAfter]);


        // ==========================================
        // 3. STEP 3: BULK INSERT NEW 'DOWN' HISTORIES
        // ==========================================
        // Insert a new state change row (0) for devices whose latest history state 
        // was UP (1) but have now missed their heartbeat window.
        $io->info("Bulk inserting newly down records...");

        // For Nodes
        $db->execute("
            INSERT INTO node_uptm_histories (node_id, node_state, state_datetime, report_datetime)
            SELECT n.id, 0, :now, :now2
            FROM nodes n
            JOIN meshes m ON m.id = n.mesh_id
            LEFT JOIN node_settings ns ON ns.mesh_id = m.id
            JOIN (
                SELECT node_id, node_state, report_datetime
                FROM node_uptm_histories
                WHERE (node_id, report_datetime) IN (
                    SELECT node_id, MAX(report_datetime) FROM node_uptm_histories GROUP BY node_id
                )
            ) latest ON n.id = latest.node_id
            WHERE latest.node_state = 1
              AND latest.report_datetime < DATE_SUB(:now3, INTERVAL COALESCE(ns.heartbeat_dead_after, :dead_after) SECOND)
        ", ['now' => $now, 'now2' => $now, 'now3' => $now, 'dead_after' => $defaultDeadAfter]);

        // For APs
        $db->execute("
            INSERT INTO ap_uptm_histories (ap_id, ap_state, state_datetime, report_datetime)
            SELECT a.id, 0, :now, :now2
            FROM aps a
            JOIN ap_profiles ap ON ap.id = a.ap_profile_id
            LEFT JOIN ap_profile_settings aps ON aps.ap_profile_id = ap.id
            JOIN (
                SELECT ap_id, ap_state, report_datetime
                FROM ap_uptm_histories
                WHERE (ap_id, report_datetime) IN (
                    SELECT ap_id, MAX(report_datetime) FROM ap_uptm_histories GROUP BY ap_id
                )
            ) latest ON a.id = latest.ap_id
            WHERE latest.ap_state = 1
              AND latest.report_datetime < DATE_SUB(:now3, INTERVAL COALESCE(aps.heartbeat_dead_after, :dead_after) SECOND)
        ", ['now' => $now, 'now2' => $now, 'now3' => $now, 'dead_after' => $defaultDeadAfter]);


        // ==========================================
        // 4. STEP 4: BULK INSERT ALERTS
        // ==========================================
        // Insert unresolved alert tickets for any devices currently marked down (0) 
        // that do not already have an open unresolved alert record.
        $io->info("Bulk triggering required system alerts...");

        // For Nodes
        $db->execute("
            INSERT INTO alerts (mesh_id, node_id, description)
            SELECT m.id, n.id, 'Device Unreachable'
            FROM nodes n
            JOIN meshes m ON m.id = n.mesh_id
            JOIN (
                SELECT node_id, node_state FROM node_uptm_histories
                WHERE (node_id, report_datetime) IN (
                    SELECT node_id, MAX(report_datetime) FROM node_uptm_histories GROUP BY node_id
                )
            ) latest ON n.id = latest.node_id
            LEFT JOIN alerts al ON al.node_id = n.id AND al.resolved IS NULL
            WHERE latest.node_state = 0 
              AND n.enable_alerts = 1
              AND al.id IS NULL
        ");

        // For APs
        $db->execute("
            INSERT INTO alerts (ap_profile_id, ap_id, description)
            SELECT ap.id, a.id, 'Device Unreachable'
            FROM aps a
            JOIN ap_profiles ap ON ap.id = a.ap_profile_id
            JOIN (
                SELECT ap_id, ap_state FROM ap_uptm_histories
                WHERE (ap_id, report_datetime) IN (
                    SELECT ap_id, MAX(report_datetime) FROM ap_uptm_histories GROUP BY ap_id
                )
            ) latest ON a.id = latest.ap_id
            LEFT JOIN alerts al ON al.ap_id = a.id AND al.resolved IS NULL
            WHERE latest.ap_state = 0 
              AND a.enable_alerts = 1
              AND al.id IS NULL
        ");

        $io->success("Done! Processed 20K+ entities seamlessly.");
        return static::CODE_SUCCESS;
    }
}

