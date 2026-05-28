<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 26/Nov/2024
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Database\Expression\IdentifierExpression;


use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;
use Cake\Chronos\ChronosInterval;

use App\Model\Entity\QmiInfoEntity;

class WanReportsController extends AppController {


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
        $this->loadModel('Timezones');
        $this->loadModel('WanWifiStats');
        $this->loadModel('WanLteStats');
        $this->loadModel('WanTrafficStats');
        $this->loadModel('WanMwanStatus');
        $this->loadModel('Aps');
        $this->loadComponent('Aa');
        $this->loadComponent('JsonErrors');
        $this->loadComponent('LteHelper');
        $this->loadComponent('WifiHelper');
    }
 
                   
  	public function indexDataView(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $data           = [];
        $mwanStatusData = [];        
        $ap_id  = $this->request->getQuery('ap_id');
        $this->_setTimeZone();
        
        if($this->request->getQuery('span')){
            $this->span = $this->request->getQuery('span');
        }
              
        if($ap_id){
        
            $ap_profile = $this->{'Aps'}->find()
                ->contain([
                    'MultiWanProfiles' => [
                        'MwanInterfaces' => ['SqmProfiles']
                    ],
                    'WanMwan3Status'
                ])
                ->where(['Aps.id' =>$ap_id])
                ->first();
            
            
            if($ap_profile->wan_mwan3_status){
                $mwanStatus     = $ap_profile->wan_mwan3_status;
                $mwanStatusData = json_decode($mwanStatus->mwan3_status);
                //print_r($mwanStatusData->policies->ipv4);
            }
            
            //Try and determine the current interfaces that is in use
            $ifInUse = [];            
            if($mwanStatusData){
                foreach ($mwanStatusData->policies as $policy) {
                    foreach ($policy as $key => $value) {
                        if (is_array($value)) { // Check if the value is an array
                            foreach ($value as $failOver) {
                                if (isset($failOver->interface, $failOver->percent)) {
                                    $ifInUse[$failOver->interface] = $failOver->percent;
                                }
                            }
                        }
                    }
                }       
            }
                                                  
            if($ap_profile->multi_wan_profile){            
                foreach($ap_profile->multi_wan_profile->mwan_interfaces as $mwanInterface){ 
                 
                    if (isset($mwanStatusData->interfaces)){
                        if(isset($mwanStatusData->interfaces->{'mw'.$mwanInterface->id})){
                        
                            $mwanStatusData->interfaces->{'mw'.$mwanInterface->id}->name = $mwanInterface->name;
                        
                            $lteData = [];
                            $wifiData = [];
                        
                            //We assume there should be some traffic stats for this interface
                            if($this->span == 'small'){
                                $stats = $this->_get15MinData($ap_id, $mwanInterface->id);
                                if($mwanInterface->type == 'lte'){
                                    $lteData = $this->_get15MinLte($ap_id, $mwanInterface->id);
                                }
                                if($mwanInterface->type == 'wifi'){
                                    $wifiData = $this->_get15MinWifi($ap_id, $mwanInterface->id);
                                }
                            }
                            
                            if($this->span == 'medium'){
                                $stats = $this->_get30MinData($ap_id, $mwanInterface->id);
                                if($mwanInterface->type == 'lte'){
                                    $lteData = $this->_get30MinLte($ap_id, $mwanInterface->id);
                                }
                                if($mwanInterface->type == 'wifi'){
                                    $wifiData = $this->_get30MinWifi($ap_id, $mwanInterface->id);
                                }
                            }
                            
                            if($this->span == 'large'){
                                $stats = $this->_get60MinData($ap_id, $mwanInterface->id);
                                if($mwanInterface->type == 'lte'){
                                    $lteData = $this->_get60MinLte($ap_id, $mwanInterface->id);
                                }
                                if($mwanInterface->type == 'wifi'){
                                    $wifiData = $this->_get60MinWifi($ap_id, $mwanInterface->id);
                                }
                            }
                            
                            //See if it is currenlty active
                            if(isset($ifInUse['mw'.$mwanInterface->id])){
                                $mwanInterface->traffic_percent = $ifInUse['mw'.$mwanInterface->id];
                            }
                            
                                                                                                                                  
                            $mwanI= (object) array_merge($mwanInterface->toArray(), (array) $mwanStatusData->interfaces->{'mw'.$mwanInterface->id});
                            //$mwanInterface = (object) ($mwanInterface + $mwanStatusData->interfaces->{'mw'.$mwanInterface->id});
                            $mwanI->graph_traffic_items = $stats['items'];
                            $mwanI->traffic_totals      = $stats['totals']; 
                            $mwanI->ipv4_address        = $stats['ipv4_address'];
                            $mwanI->ipv6_address        = $stats['ipv6_address'];                            
                            $mwanI->graph_lte_items     = $lteData;
                            $mwanI->graph_wifi_items    = $wifiData;
                            $mwanI->lte_first_signal    = reset($lteData); //set the first one in the row
                            $mwanI->wifi_first_signal   = reset($wifiData); //set the first one in the row
                        }
                    }                                                    
                    $data[] = $mwanI;            
                } 
            }               
                      
        }
   
        //___ FINAL PART ___
        $this->set([
            'items'         => $data,
            'metaData'      => $mwanStatusData,
            'success'       => true
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
        
    private function _getTrafficData($apId, $mwanInterfaceId, $interval, $duration){
        $items          = [];
        $start          = 1;
        $currentTime    = FrozenTime::now();
        $slotStart      = $currentTime->subMinutes($duration);

        $dataTotal      = 0;
        $dataIn         = 0;
        $dataOut        = 0;
        $totalPackets   = 0;
        $ipv4_address   ='';
        $ipv6_address   ='';
 
        while ($slotStart < $currentTime) {
            $slotEnd = $slotStart->copy()->addMinutes($interval)->subSecond(1);
            $formattedSlotStart = $slotStart->i18nFormat("E\nHH:mm", $this->time_zone);

            $whereConditions = [
                'WanTrafficStats.ap_id' => $apId,
                'WanTrafficStats.mwan_interface_id' => $mwanInterfaceId,
                'modified >=' => $slotStart,
                'modified <=' => $slotEnd
            ];

            $query = $this->{'WanTrafficStats'}->find();
            $result = $query->select([
                'delta_tx_bytes'    => $query->func()->sum('delta_tx_bytes'),
                'delta_rx_bytes'    => $query->func()->sum('delta_rx_bytes'),
                'delta_tx_packets'  => $query->func()->sum('delta_tx_packets'),
                'delta_rx_packets'  => $query->func()->sum('delta_rx_packets'),
                'ipv4_address',
                'ipv6_address'
               
            ])->where($whereConditions)->first();

            if ($result) {
                $result->id = $start;
                $result->slot_start_txt = $formattedSlotStart;
                $result->time_unit      = $formattedSlotStart;

                // Define the list of properties to cast to integers
                $propertiesToCast = [
                    'delta_tx_bytes', 'delta_rx_bytes', 'delta_tx_packets', 'delta_rx_packets'
                ];

                // Cast each property to an integer
                foreach ($propertiesToCast as $property) {
                    $result->{$property} = (int)$result->{$property};
                }
                
                $dataIn         += $result->delta_rx_bytes;
                $dataOut        += $result->delta_tx_bytes;
                $dataTotal      += ($result->delta_tx_bytes+$result->delta_rx_bytes);
                $totalPackets   += ($result->delta_tx_packets+$result->delta_tx_packets);
                $items[]        = $result;
                
                if($result->ipv4_address){
                    $ipv4_address = $result->ipv4_address;
                }
                if($result->ipv6_address){
                    $ipv6_address = $result->ipv6_address;
                }
                
            }

            $slotStart = $slotStart->addMinutes($interval);
            $start++;
        }

        return [
            'items' => $items,
            'totals' => [
                'data_total'=> $dataTotal,
                'data_in'   => $dataIn,
                'data_out'  => $dataOut,
                'packets'   => $totalPackets,
                'span'      => $duration
            ],
            'ipv4_address'  => $ipv4_address,
            'ipv6_address'  => $ipv6_address
        ];
    }
    
    private function _getLteData($apId, $mwanInterfaceId, $interval, $duration){
        $items          = [];
        $start          = 1;
        $currentTime    = FrozenTime::now();
        $slotStart      = $currentTime->subMinutes($duration);

        while ($slotStart < $currentTime) {
            $slotEnd = $slotStart->copy()->addMinutes($interval)->subSecond(1);
            $formattedSlotStart = $slotStart->i18nFormat("E\nHH:mm", $this->time_zone);

            $whereConditions = [
                'WanLteStats.ap_id' => $apId,
                'WanLteStats.mwan_interface_id' => $mwanInterfaceId,
                'modified >=' => $slotStart,
                'modified <=' => $slotEnd
            ];

            $query = $this->{'WanLteStats'}->find();
            $result = $query->select([
                'mcc',
                'mnc',
                'type',
                'rsrp'  => $query->func()->avg('rsrp'),
                'rsrq'  => $query->func()->avg('rsrq'),
                'rssi'  => $query->func()->avg('rssi'),
                'snr'   => $query->func()->avg('snr'),              
            ])->where($whereConditions)->first();

            if ($result) {
                $result->id = $start;
                $result->slot_start_txt = $formattedSlotStart;
                $result->time_unit      = $formattedSlotStart;

                // Define the list of properties to cast to integers
                $propertiesToCast = [
                    'rsrp', 'rsrq', 'rssi', 'snr'
                ];

                // Cast each property to an integer
                foreach ($propertiesToCast as $property) {
                    $result->{$property} = (int)$result->{$property};
                }
                
                
                // Create a new entity instance
                $guiEntity = new QmiInfoEntity([
                    'qmi_type'  => $result->type,
                    'qmi_rssi'  => $result->rssi,
                    'qmi_rsrp'  => $result->rsrp,
                    'qmi_rsrq'  => $result->rsrq,
                    'qmi_snr'   => $result->snr,
                    'qmi_mcc'   => $result->mcc,
                    'qmi_mnc'   => $result->mnc
                ]);
                
                
                $this->LteHelper->getMobileProvider($guiEntity);
                $this->LteHelper->getRssiGui($guiEntity);
                $this->LteHelper->getRsrpGui($guiEntity);
                $this->LteHelper->getRsrqGui($guiEntity);
                $this->LteHelper->getSnrGui($guiEntity);                           
                $result->gui    = $guiEntity;
                
                $items[]        = $result;
            }

            $slotStart = $slotStart->addMinutes($interval);
            $start++;
        }
        
        return $items;  
    }
    
    private function _getWifiData($apId, $mwanInterfaceId, $interval, $duration){
        $items          = [];
        $start          = 1;
        $currentTime    = FrozenTime::now();
        $slotStart      = $currentTime->subMinutes($duration);

        while ($slotStart < $currentTime) {
            $slotEnd = $slotStart->copy()->addMinutes($interval)->subSecond(1);
            $formattedSlotStart = $slotStart->i18nFormat("E\nHH:mm", $this->time_zone);

            $whereConditions = [
                'WanWifiStats.ap_id' => $apId,
                'WanWifiStats.mwan_interface_id' => $mwanInterfaceId,
                'modified >=' => $slotStart,
                'modified <=' => $slotEnd
            ];

            $query = $this->{'WanWifiStats'}->find();
            $result = $query->select([
                'ssid',
                'channel',
                'rx_packets'    => $query->func()->max('rx_packets'),
                'tx_packets'    => $query->func()->max('tx_packets'),
                '`signal`'      => $query->func()->avg('`signal`'), // IdentifierExpression
                'bitrate'       => $query->func()->avg('bitrate'),
                'txpower'       => $query->func()->avg('txpower'),
                'tx_rate'       => $query->func()->avg('tx_rate'),
                'quality'       => $query->func()->avg('quality'),
                'rx_rate'       => $query->func()->avg('rx_rate'),
                'noise'         => $query->func()->avg('noise')          
            ])->where($whereConditions)->first();
            

            if ($result) {
                $result->id = $start;
                $result->slot_start_txt = $formattedSlotStart;
                $result->time_unit      = $formattedSlotStart;

                // Define the list of properties to cast to integers
                $propertiesToCast = [
                    'rx_packets', 'tx_packets', 'signal', 'bitrate', 'txpower', 'tx_rate', 'quality', 'rx_rate', 'noise'
                ];

                // Cast each property to an integer
                foreach ($propertiesToCast as $property) {
                    $result->{$property} = (int)$result->{$property};
                }
                
                $this->WifiHelper->getNoiseGui($result);
                $this->WifiHelper->getSignalGui($result);
                $this->WifiHelper->getQualityGui($result);
                
                if($result->tx_rate > 0){
                    $result->tx_rate = round($result->tx_rate/1000 ,1);
                }
                
                if($result->rx_rate > 0){
                    $result->rx_rate = round($result->rx_rate/1000 ,1);
                }
                                              
                $items[]        = $result;
            }

            $slotStart = $slotStart->addMinutes($interval);
            $start++;
        }
        
        return $items;  
    }
    
    
    //--Data--
    private function _get15MinData($apId, $mwanInterfaceId){
        return $this->_getTrafficData($apId, $mwanInterfaceId, 1, 15);
    }
    private function _get30MinData($apId, $mwanInterfaceId){
        return $this->_getTrafficData($apId, $mwanInterfaceId, 2, 30);
    }    
    private function _get60MinData($apId, $mwanInterfaceId){    
        return $this->_getTrafficData($apId, $mwanInterfaceId, 3, 60);
    }
    
    //--LTE--
    private function _get15MinLte($apId, $mwanInterfaceId){
        return $this->_getLteData($apId, $mwanInterfaceId, 1, 15);
    }
    private function _get30MinLte($apId, $mwanInterfaceId){
        return $this->_getLteData($apId, $mwanInterfaceId, 2, 30);
    }    
    private function _get60MinLte($apId, $mwanInterfaceId){    
        return $this->_getLteData($apId, $mwanInterfaceId, 3, 60);
    }
    
    //--WIFI-- 
    private function _get15MinWifi($apId, $mwanInterfaceId){
        return $this->_getWifiData($apId, $mwanInterfaceId, 1, 15);
    }
    private function _get30MinWifi($apId, $mwanInterfaceId){
        return $this->_getWifiData($apId, $mwanInterfaceId, 2, 30);
    }    
    private function _get60MinWifi($apId, $mwanInterfaceId){    
        return $this->_getWifiData($apId, $mwanInterfaceId, 3, 60);
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
