<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 29/July/2024
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class SqmReportsController extends AppController {


    protected $mode         = 'ap';
    protected $time_zone    = 'UTC'; //Default for timezone
    protected $span         = 'hour';
    
    protected $fields       = [
        't_bytes'       => 'sum(bytes)',
        't_packets'     => 'sum(packets)',
        't_drops'       => 'sum(drops)',
        't_limits'      => 'sum(overlimits)'
    ];
    
    public function initialize():void{
        parent::initialize();
        
        $this->loadModel('ApSqmStats');
        $this->loadModel('Aps');
        $this->loadModel('NodeSqmStats');
        $this->loadModel('Timezones');
        
        $this->loadComponent('Aa');
        $this->loadComponent('JsonErrors');
    }
 
                   
  	public function indexDataView(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $data   = [];        
        $ap_id  = $this->request->getQuery('ap_id');
        $this->_setTimeZone();
              
        if($ap_id){
        
            $ap_profile = $this->{'Aps'}->find()
                ->contain([
                    'ApProfiles' => [
                        'ApProfileExits' => [
                            'fields'    => ['ApProfileExits.id','ApProfileExits.ap_profile_id','ApProfileExits.type','ApProfileExits.vlan'],
                            'ApProfileExitApProfileEntries' => [
                                'ApProfileEntries' => [
                                    'fields' => ['ApProfileEntries.id', 'ApProfileEntries.name']
                                ],
                            ],
                            'SqmProfiles' => [
                                'fields' => ['SqmProfiles.id', 'SqmProfiles.name', 'SqmProfiles.upload', 'SqmProfiles.download' ]
                            ]
                        ]
                    ]
                ])
                ->where(['Aps.id' =>$ap_id])
                ->first();       
            $data = $this->buildApReport($ap_profile);         
        
        }
   
        //___ FINAL PART ___
        $this->set([
            'items'         => $data,
            'success'       => true,
            'totalCount'    => 0
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
    private function buildApReport($ap_profile){
    
        $data   = [];
        $ap_id  = $ap_profile->id;
        if($this->request->getQuery('span')){
            $this->span = $this->request->getQuery('span');
        }
 
        foreach ($ap_profile->ap_profile->ap_profile_exits as $apProfileExit) {
        
            $hasEntriesAttached = false;
            $type               = $apProfileExit->type;
            $notVlan            = true;
                            
            
            if (count($apProfileExit->ap_profile_exit_ap_profile_entries) > 0) {
                $hasEntriesAttached = true;
                
                //-- Look for internal VLANs --
                foreach($apProfileExit->ap_profile_exit_ap_profile_entries as $entry){                
                    if(preg_match('/^-9/',$entry->ap_profile_entry_id)){ 	
		            	$dynamicVlan   = $entry->ap_profile_entry_id;
		            	$dynamicVlan   = str_replace("-9","",$dynamicVlan);
		            	$apProfileExit->vlan =  (int)$dynamicVlan;
		            	$apProfileExit->vlan_internal = true;        
		            }		                                             
                }                              
            }

            if (($hasEntriesAttached || (($apProfileExit->vlan > 0) && ($apProfileExit->type === 'nat')))&&($apProfileExit->sqm_profile)) {
            
            
                $apProfileExit->sqm_profile->upload_suffix = 'Kbit/s';
                $apProfileExit->sqm_profile->download_suffix   = 'Kbit/s';
                
                if($apProfileExit->sqm_profile->upload > 1023){
                    $apProfileExit->sqm_profile->upload = $apProfileExit->sqm_profile->upload / 1024;
                    $apProfileExit->sqm_profile->upload_suffix = 'Mbit/s';
                }
                
                if($apProfileExit->sqm_profile->download > 1023){
                    $apProfileExit->sqm_profile->download = $apProfileExit->sqm_profile->download / 1024;
                    $apProfileExit->sqm_profile->download_suffix = 'Mbit/s';
                }  
                       
                
                $apProfileExit->totals   = []; //Default empty
                if($this->span == 'hour'){
                    $stats = $this->_getHourlyData($ap_id,$apProfileExit->id);
                    $apProfileExit->graph_items     = $stats['items'];
                    $apProfileExit->totals          = $stats['totals'];
                } 
                
                if($this->span == 'day'){
                    $stats = $this->_getDailyData($ap_id,$apProfileExit->id);
                    $apProfileExit->graph_items     = $stats['items'];
                    $apProfileExit->totals          = $stats['totals'];
                }
                
                if($this->span == 'week'){
                    $stats = $this->_getWeeklyData($ap_id,$apProfileExit->id);
                    $apProfileExit->graph_items     = $stats['items'];
                    $apProfileExit->totals          = $stats['totals'];
                }     
                            
                $data[] = $apProfileExit;             
            }         
        }       
        return $data;
     
    }
    
    private function _getData($apId, $apProfileExitId, $interval, $duration){
        $items = [];
        $start = 1;
        $currentTime = FrozenTime::now();
        $slotStart = $currentTime->subHours($duration);

        $totalBytes = 0;
        $totalPackets = 0;
        $totalDrops = 0;
        $totalOverlimits = 0;

        while ($slotStart < $currentTime) {
            $slotEnd = $slotStart->copy()->addMinutes($interval)->subSecond(1);
            $formattedSlotStart = $slotStart->i18nFormat("E\nHH:mm", $this->time_zone);

            $whereConditions = [
                'ApSqmStats.ap_id' => $apId,
                'ApSqmStats.ap_profile_exit_id' => $apProfileExitId,
                'modified >=' => $slotStart,
                'modified <=' => $slotEnd
            ];

            $query = $this->{'ApSqmStats'}->find();
            $result = $query->select([
                'bytes'         => $query->func()->sum('bytes'),
                'packets'       => $query->func()->sum('packets'),
                'drops'         => $query->func()->sum('drops'),
                'overlimits'    => $query->func()->sum('overlimits'),
                'backlog'       => $query->func()->max('backlog'),
                'qlen'          => $query->func()->max('qlen'),
                'memory_used'   => $query->func()->max('memory_used'),
                'peak_delay_us' => $query->func()->max('peak_delay_us'),
                'avg_delay_us'  => $query->func()->max('avg_delay_us'),
                'base_delay_us' => $query->func()->max('base_delay_us'),
                'way_misses'    => $query->func()->max('way_misses'),
                'way_indirect_hits' => $query->func()->max('way_indirect_hits')
            ])->where($whereConditions)->first();

            if ($result) {
                $result->id = $start;
                $result->slot_start_txt = $formattedSlotStart;
                $result->time_unit = $formattedSlotStart;

                // Define the list of properties to cast to integers
                $propertiesToCast = [
                    'bytes', 'packets', 'drops', 'overlimits', 
                    'backlog', 'qlen', 'memory_used', 
                    'peak_delay_us', 'avg_delay_us', 'base_delay_us',
                    'way_misses', 'way_indirect_hits'
                ];

                // Cast each property to an integer
                foreach ($propertiesToCast as $property) {
                    $result->{$property} = (int)$result->{$property};
                }
                
                $result->processed = $result->packets - $result->drops;

                $totalBytes += $result->bytes;
                $totalPackets += $result->packets;
                $totalDrops += $result->drops;
                $totalOverlimits += $result->overlimits;

                $items[] = $result;
            }

            $slotStart = $slotStart->addMinutes($interval);
            $start++;
        }

        return [
            'items' => $items,
            'totals' => [
                'bytes'     => $totalBytes,
                'packets'   => $totalPackets,
                'drops'     => $totalDrops,
                'processed' => $totalPackets - $totalDrops,
                'overlimits'=> $totalOverlimits
            ]
        ];
    }
    
    private function _getHourlyData($apId, $apProfileExitId){

        return $this->_getData($apId, $apProfileExitId, 10, 1);
    }

    private function _getDailyData($apId, $apProfileExitId){

        return $this->_getData($apId, $apProfileExitId, 60, 24);
    }
    
    private function _getWeeklyData($apId, $apProfileExitId){
        // One week duration in hours (7 days * 24 hours)
        $duration = 7 * 24;
        // Interval for weekly data in minutes (24 hours)
        $interval = 24*60;
        return $this->_getData($apId, $apProfileExitId, $interval, $duration);
    }  
        
    private function _setTimezone(){ 
        //New way of doing things by including the timezone_id
        if($this->request->getQuery('timezone_id') != null){
            $tz_id = $this->request->getQuery('timezone_id');
            $ent = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
            if($ent){
                $this->time_zone = $ent->name;
            }
        }
    }
        
}

?>
