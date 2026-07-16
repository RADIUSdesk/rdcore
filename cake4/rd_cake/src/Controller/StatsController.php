<?php
// src/Controller/StatsController.php

namespace App\Controller;

use App\Controller\AppController;
use Cake\ORM\TableRegistry;


class StatsController extends AppController{

    public function initialize(): void{
        parent::initialize();
        $this->Authentication->allowUnauthenticated(['usersByCloud','usersByCloudSummary','renewalsByCloud']); 
    }
    
     /**
     * Get user renewals per cloud
     * 
     * @return void
     */
     
    public function renewalsByCloud(){
    
        $permanentUsersTable    = TableRegistry::getTableLocator()->get('PermanentUsers');
        $cloudsTable            = TableRegistry::getTableLocator()->get('Clouds'); 
        
        $span   = 1; //Default is the last day
        $q_span = $this->request->getQuery('span');      
        if($q_span){
            $span = $q_span;
        }  
             
        // Get all clouds with their names
        $clouds = $cloudsTable->find()
            ->select(['id', 'name'])
            ->toArray();
             
        $cloud_data = [];
        foreach($clouds as $cloud){
            $cloud_data[$cloud->id] = [
                'name' => $cloud->name,
                'span' => intval($span),
                'cloud_id'  => $cloud->id,
                'renewals'  => 0,
                'total_expired_gap_days' => 0,
                'total_effective_days'   => 0,
                'avg_expired_gap_days'   => 0,
                'avg_effective_days'     => 0,
                'on_time_count'          => 0,
                'late_15_days_count'     => 0,
                'late_60_days_count'     => 0
            ];
        }
        
        $topUpTransactions = TableRegistry::getTableLocator()->get('TopUpTransactions');
        $stats7d = $topUpTransactions->getRenewalStatsByCloud($span);

        // Loop through results
        foreach ($stats7d as $stat) {
            $cloud_data[$stat->cloud_id]['renewals'] = $stat->renewals_count;
            $cloud_data[$stat->cloud_id]['total_expired_gap_days'] = $stat->total_expired_gap_days;
            $cloud_data[$stat->cloud_id]['total_effective_days'] = $stat->total_effective_days;
            $cloud_data[$stat->cloud_id]['avg_expired_gap_days'] = $stat->avg_expired_gap_days;
            $cloud_data[$stat->cloud_id]['avg_effective_days'] = $stat->avg_effective_days;
            $cloud_data[$stat->cloud_id]['on_time_count'] = $stat->on_time_count;
            $cloud_data[$stat->cloud_id]['late_15_days_count'] = $stat->late_15_days_count;
            $cloud_data[$stat->cloud_id]['late_60_days_count'] = $stat->late_60_days_count;            
        }
       
        $response = [
            'success'   => true,
            'data'      => $cloud_data
        ];
    
        $this->set('response', $response);
        $this->set('_serialize', ['response']);
        $this->viewBuilder()->setOption('serialize', true); 
    
    }

    /**
     * Get user statistics per cloud
     * 
     * @return void
     */
    public function usersByCloud(){
     
        $permanentUsersTable = TableRegistry::getTableLocator()->get('PermanentUsers');
        $cloudsTable = TableRegistry::getTableLocator()->get('Clouds');
        
        // Define all possible admin states
        $adminStates = ['active', 'suspended', 'terminated', 'pending', 'expired', 'trial', 'locked'];
        
        // Get all clouds with their names
        $clouds = $cloudsTable->find()
            ->select(['id', 'name'])
            ->toArray();
        
        // Get user counts per cloud and admin_state
        $userStats = $permanentUsersTable->find()
            ->select([
                'cloud_id' => 'PermanentUsers.cloud_id',
                'admin_state' => 'PermanentUsers.admin_state',
                'count' => $permanentUsersTable->find()->func()->count('PermanentUsers.id')
            ])
            ->group(['PermanentUsers.cloud_id', 'PermanentUsers.admin_state'])
            ->order(['PermanentUsers.cloud_id' => 'ASC'])
            ->toArray();
        
        // Build response with cloud names
        $stats = [];
        foreach ($clouds as $cloud) {
            $stats[$cloud->id] = [
                'cloud_id' => $cloud->id,
                'cloud_name' => $cloud->name,
                'totals' => array_fill_keys($adminStates, 0),
                'total_users' => 0
            ];
        }
        
        // Fill in the counts
        foreach ($userStats as $row) {
            if (isset($stats[$row->cloud_id])) {
                $stats[$row->cloud_id]['totals'][$row->admin_state] = $row->count;
                $stats[$row->cloud_id]['total_users'] += $row->count;
            }
        }
        
        // Convert to indexed array and sort by cloud_name
        $stats = array_values($stats);
        usort($stats, function($a, $b) {
            return strcmp($a['cloud_name'], $b['cloud_name']);
        });
        
        $response = [
            'success' => true,
            'data' => $stats,
            'total_clouds' => count($stats),
            'total_users' => array_sum(array_column($stats, 'total_users'))
        ];
        
        $this->set('response', $response);
        $this->set('_serialize', ['response']);
         $this->viewBuilder()->setOption('serialize', true); 
    }

    /**
     * Format the statistics data
     * 
     * @param array $results Query results
     * @param array $adminStates All possible admin states
     * @return array Formatted stats
     */
    private function formatStats($results, $adminStates){
        $stats = [];
        
        // Group by cloud_id
        $grouped = [];
        foreach ($results as $row) {
            $cloudId = $row->cloud_id;
            if (!isset($grouped[$cloudId])) {
                $grouped[$cloudId] = [
                    'cloud_id' => $cloudId,
                    'totals' => array_fill_keys($adminStates, 0),
                    'total_users' => 0
                ];
            }
            $grouped[$cloudId]['totals'][$row->admin_state] = $row->count;
            $grouped[$cloudId]['total_users'] += $row->count;
        }
        
        // Convert to indexed array and ensure all states are present
        foreach ($grouped as $cloudId => $data) {
            // Ensure all admin states exist with default 0
            foreach ($adminStates as $state) {
                if (!isset($data['totals'][$state])) {
                    $data['totals'][$state] = 0;
                }
            }
            
            // Sort totals by admin_state
            ksort($data['totals']);
            
            $stats[] = $data;
        }
        
        return $stats;
    }
    
    /**
     * Get stats with additional summary information
     */
    public function usersByCloudSummary(){
           
        $permanentUsersTable = TableRegistry::getTableLocator()->get('PermanentUsers');
        $cloudsTable = TableRegistry::getTableLocator()->get('Clouds');
        $adminStates = ['active', 'suspended', 'terminated', 'pending', 'expired', 'trial', 'locked'];
        
        // Get all active clouds
        $clouds = $cloudsTable->find()
            ->select(['id', 'name'])
            ->toArray();
        
        // Get user counts
        $userStats = $permanentUsersTable->find()
            ->select([
                'cloud_id' => 'PermanentUsers.cloud_id',
                'admin_state' => 'PermanentUsers.admin_state',
                'count' => $permanentUsersTable->find()->func()->count('PermanentUsers.id')
            ])
            ->group(['PermanentUsers.cloud_id', 'PermanentUsers.admin_state'])
            ->toArray();
        
        // Build stats
        $stats = [];
        $globalTotals = array_fill_keys($adminStates, 0);
        $globalTotalUsers = 0;
        
        foreach ($clouds as $cloud) {
            $cloudTotals = array_fill_keys($adminStates, 0);
            $cloudTotalUsers = 0;
            
            foreach ($userStats as $row) {
                if ($row->cloud_id == $cloud->id) {
                    $cloudTotals[$row->admin_state] = $row->count;
                    $cloudTotalUsers += $row->count;
                }
            }
            
            // Update global totals
            foreach ($adminStates as $state) {
                $globalTotals[$state] += $cloudTotals[$state];
            }
            $globalTotalUsers += $cloudTotalUsers;
            
            $stats[] = [
                'cloud_id' => $cloud->id,
                'cloud_name' => $cloud->name,
                'totals' => $cloudTotals,
                'total_users' => $cloudTotalUsers,
                'percentage' => $globalTotalUsers > 0 
                    ? round(($cloudTotalUsers / $globalTotalUsers) * 100, 2) 
                    : 0
            ];
        }
        
        // Sort by total_users descending
        usort($stats, function($a, $b) {
            return $b['total_users'] - $a['total_users'];
        });
        
        $response = [
            'success' => true,
            'data' => $stats,
            'summary' => [
                'total_clouds' => count($stats),
                'global_totals' => $globalTotals,
                'global_total_users' => $globalTotalUsers
            ]
        ];
        
        $this->set('response', $response);
        $this->set('_serialize', ['response']);
        $this->viewBuilder()->setOption('serialize', true); 
    }

}
