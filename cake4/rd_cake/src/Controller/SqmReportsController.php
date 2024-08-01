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


    protected  $mode = 'ap';
     protected $time_zone    = 'UTC'; //Default for timezone
    
    public function initialize():void{
        parent::initialize();
        
        $this->loadModel('ApSqmStats');
        $this->loadModel('Aps');
        $this->loadModel('NodeSqmStats');
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
    
        $data           = [];
        $ap_id          = $ap_profile->id;
 
        foreach ($ap_profile->ap_profile->ap_profile_exits as $apProfileExit) {
        
            $hasEntriesAttached = false;
            $type               = $apProfileExit->type;
            $notVlan            = true;

            if (count($apProfileExit->ap_profile_exit_ap_profile_entries) > 0) {
                $hasEntriesAttached = true;
            }

            if (($hasEntriesAttached || (($apProfileExit->vlan > 0) && ($apProfileExit->type === 'nat')))&&($apProfileExit->sqm_profile)) {           
                
                $span = 'hour';
                if($span == 'hour'){
                    $stats = $this->_getHourlyData($ap_id,$apProfileExit->id);
                    $apProfileExit->graph_items     = $stats['items'];
                    $apProfileExit->totals          = $stats['totals'];
                }
                $data[] = $apProfileExit;             
            }         
        }       
        return $data;
     
    }
    
    private function _getHourlyData($ap_id,$ap_profile_exit_id){    
  
        $items          = [];
        $start          = 0;
        $ft_now         = FrozenTime::now();
        $hour_end       = $ft_now;   
        $slot_start     = $ft_now->subHour(1); 
        
        $bytes_t        = 0;
        $packets_t      = 0;
        $drops_t        = 0;
        $overlimits_t   = 0;
           
        while($slot_start < $hour_end){
            $slot_start_h_m = $slot_start->i18nFormat("E\nHH:mm",$this->time_zone);
            $slot_end       = $slot_start->addMinute(10)->subSecond(1);  
            $where          = ['ApSqmStats.ap_id' => $ap_id,'ApSqmStats.ap_profile_exit_id' => $ap_profile_exit_id];
            array_push($where, ["modified >=" => $slot_start]);
            array_push($where, ["modified <=" => $slot_end]);   
            $slot_start     = $slot_start->addMinute(10); 
            $q_r            = $this->{'ApSqmStats'}->find()->where($where)->first();

            if($q_r){
                $q_r->id = $start;
                $q_r->slot_start_txt = $slot_start_h_m;
                $q_r->time_unit = $slot_start_h_m;
                
                $bytes_t     = $bytes_t + $q_r->bytes;
                $packets_t   = $packets_t + $q_r->packets;
                $drops_t     = $drops_t + $q_r->drops;
                $overlimits_t     = $overlimits_t + $q_r->overlimits;
                
                array_push($items, $q_r);
            }
            $start++;
        }
        return(['items' => $items, 'totals' => ['bytes' => $bytes_t,'packets' => $packets_t, 'drops' => $drops_t,'overlimits' => $overlimits_t]]);
  
    }
        
}

?>
