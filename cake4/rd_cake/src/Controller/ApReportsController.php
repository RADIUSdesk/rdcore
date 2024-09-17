<?php

namespace App\Controller;

use Cake\Core\Configure;

class ApReportsController extends AppController {

     private $rebootFlag = false;
     private $timespan   = 'hour';   
     protected $fields   = [
        'tx_bytes'      => 'SUM(tx_bytes)',
        'rx_bytes'      => 'SUM(rx_bytes)',
        'signal_avg'    => 'AVG(signal_avg)'
    ];
   
    public function initialize() : void{

        parent::initialize();
        $this->loadModel('Aps');
        $this->loadModel('ApProfiles');
        $this->loadModel('ApLoads');
        $this->loadModel('ApStations');
        $this->loadModel('ApStationHourlies');
        $this->loadModel('ApSystems');
        $this->loadModel('ApProfileEntries');
        $this->loadModel('ApProfileSettings');
        $this->loadModel('ApActions');
        $this->loadModel('ApProfileExits');
        $this->loadModel('ApProfileSettings');
		$this->loadModel('ApUptmHistories');	
		$this->loadModel('MacActions');
        $this->loadModel('MacAddresses');
		
		$this->loadModel('Hardwares');
		$this->loadModel('MacAliases');         
		
        $this->loadComponent('Aa');
        $this->loadComponent('MacVendors');
        $this->loadComponent('Formatter');
        $this->loadComponent('TimeCalculations');
    }
	 
    //Overview of Access Point Hardware and Firmware
    public function viewOverview(){
        $data = [];
        if($this->request->getQuery('ap_id')){

            $q_r = $this->Aps->find()->contain([
                'ApSystems',
                'ApLoads',
                'ApWifiSettings'
            ])->where(['Aps.id' => $this->request->getQuery('ap_id')])
                ->first();

            if($q_r){
                if(count($q_r->ap_systems) > 0){
                    $data['components'][0]['name'] = "Device";
                    $hardware_and_firmware = $this->_build_cpu_settings($q_r->ap_systems,0);
                    $data['components'][0]['items'] = $hardware_and_firmware;
                }

                if(isset($q_r->ap_load->load_1)){
                    $mem_and_system = [];
                    //Is this device up or down
                    $ap_profile_id  = $q_r->ap_profile_id;

                    $l_contact      = $q_r->last_contact;
                    //Get the 'dead_after' value
                    $dead_after = $this->_get_dead_after($ap_profile_id);
                    
                    if($l_contact == null){
                        $state = 'never';
                    }else{
                        $last_timestamp = strtotime($l_contact);
                        if($last_timestamp+$dead_after <= time()){
                            $state = 'down';
                        }else{
                            $state = 'up';
                        }
                    }

                    if($state == 'up'){
                        $lc = $this->TimeCalculations->time_elapsed_string($q_r->last_contact);
                        array_push($mem_and_system, ['description' => 'Last contact','value' => $lc,'style' => 'rdOk']);
                    }

                    if($state == 'down'){
                        $lc = $this->TimeCalculations->time_elapsed_string($q_r->last_contact);
                        array_push($mem_and_system, ['description' => 'Last contact','value' => $lc,'style' => 'rdWarn']);
                    }

                    if($state == 'never'){
                        array_push($mem_and_system, ['description' => 'Last contact','value' => "Never before",'style' => 'rdInfo']);
                    }

                    //Get the load Memory etc
                    $cpu_load   = $q_r->ap_load->load_2;
                    array_push($mem_and_system, ['description' => 'Load','value' => $cpu_load,'style' => 'rdInfo' ]);
                    $mem_total  = $this->Formatter->formatted_bytes($q_r->ap_load->mem_total);

                    $mem_free   = $this->Formatter->formatted_bytes($q_r->ap_load->mem_free);
                    array_push($mem_and_system, ['description' => 'Memory','value' => "Total $mem_total/Free $mem_free",'style' => 'rdInfo' ]);
                    $uptime     = $q_r->ap_load->uptime;
                    array_push($mem_and_system, ['description' => 'Uptime','value' => $uptime,'style' => 'rdInfo' ]);
                    $system_time= $q_r->ap_load->system_time;
                    array_push($mem_and_system, ['description' => 'System time','value' => $system_time,'style' => 'rdInfo' ]);
                    array_push($mem_and_system, ['description' => 'IP','value' => $q_r->last_contact_from_ip,'style' => 'rdInfo' ]);

                    $data['components'][1]['name'] = "System";
                    $data['components'][1]['items'] = $mem_and_system;
                }

                if(count($q_r->ap_wifi_settings) > 0){
                    $radio_zero_items = $this->_build_radio_settings($q_r->ap_wifi_settings,0);
                    if(count($radio_zero_items) > 0){
                        $data['components'][2]['name'] = "Radio 0";
                        $data['components'][2]['items'] = $radio_zero_items;
                    }

                    $radio_one_items = $this->_build_radio_settings($q_r->ap_wifi_settings,1);
                    if(count($radio_one_items) > 0){
                        $data['components'][3]['name'] = "Radio 1";
                        $data['components'][3]['items'] = $radio_one_items ;
                    }
                }
                $data['img']    = $q_r->hardware;
                $data['name']   = $q_r->name;
                $data['model']  = $q_r->mac;
                $data['hw_info']= [];
                $hw_info        = $this->_getHardwareDetail($q_r->hardware);
                if($hw_info){
                    $data['hw_info']['photo_file_name'] = $hw_info->photo_file_name;
                    $data['hw_info']['name']            = $hw_info->name;
                    $data['hw_info']['vendor']          = $hw_info->vendor;
                    $data['hw_info']['model']          = $hw_info->model;
                }
            }
        }
        $this->set([
            'data'   => $data,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
      
    
    //------- END AP View ---------------
    
    public function viewEntries(){

		$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

		if(null == $this->request->getQuery('ap_id')){
			$this->set([
		        'message'	=> ["message"	=>"AP ID (ap_id) missing"],
		        'success' => false
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);
			return;
		}
            
        $vendor_file        = APP."StaticData".DS."mac_lookup.txt";
        $this->vendor_list  = file($vendor_file);
        
        $items  	= [];
        $this->timespan   = $this->request->getQuery('timespan'); //hour, day or week
		$modified 	= $this->_get_timespan();
		$ap_id      = $this->request->getQuery('ap_id');
		
		$req_q      = $this->request->getQuery();
		$cloud_id 	= $req_q['cloud_id'];
		
		$id         = 1;

		$q_ap       = $this->Aps->find()->contain(['ApProfiles.ApProfileEntries'=>'ApProfileEntrySchedules'])->where(['Aps.id' => $ap_id])->first();

		if($q_ap){
		
            foreach($q_ap->ap_profile->ap_profile_entries as $apProfileEntry){

                $apProfileEntryId   = $apProfileEntry->id;
                $entryName          = $apProfileEntry->name;
                
		        if(count($apProfileEntry->ap_profile_entry_schedules) > 0){
		        	$entryName     = $apProfileEntry->name.' <i class="fa  fa-calendar" style="color:#1272c7"></i>';
		        }
		        
		        $apStations = $this->ApStations->find()
                    ->select([
                        'mac_address_id',
                        'mac'   => 'MacAddresses.mac'
                    ])
                    ->distinct(['mac_address_id'])
                    ->contain(['MacAddresses'])
                    ->where([
                        'ApStations.ap_profile_entry_id'=> $apProfileEntryId,
                        'ApStations.modified >='        => $modified
                    ])->all();
               
                $apStationLookup = [];  
                  
                foreach($apStations as $apStation){
                    $mac_id = $apStation->mac_address_id;
                    $apStationLookup[$mac_id] = $apStation->mac;
                }
                
                if($this->timespan !== 'hour'){
                     $apStationHourlies = $this->ApStationHourlies->find()
                        ->select([
                            'mac_address_id',
                            'mac'   => 'MacAddresses.mac'
                        ])
                        ->distinct(['mac_address_id'])
                        ->contain(['MacAddresses'])
                        ->where([
                            'ApStationHourlies.ap_profile_entry_id' => $apProfileEntryId,
                            'ApStationHourlies.modified >='   => $modified
                        ])->all();
                    foreach($apStationHourlies as $apStationHourly){
                        $mac_id = $apStationHourly->mac_address_id;
                        $apStationLookup[$mac_id] = $apStationHourly->mac;
                    }                       
                }

                if (count($apStationLookup) > 0 ) {
                    foreach ($apStationLookup as $mac_address_id => $mac) {
                    
                        //==Get the sum of Bytes and avg of signal using the raw data== (for timespan == 'hour' )
                        $t_bytes = 0;
                        $r_bytes = 0;
                        $q_t = $this->ApStations->find()
                            ->select($this->fields)
                            ->where([
                                'mac_address_id'      => $mac_address_id,
                                'ap_id'               => $ap_id,
                                'ap_profile_entry_id' => $apProfileEntryId,
                                'modified >='         => $modified
                            ])
                            ->first();                 
                            
                        if($q_t->signal_avg){

                            $t_bytes    = $t_bytes + $q_t->tx_bytes;
                            $r_bytes    = $r_bytes + $q_t->rx_bytes;
                            $signal_avg = round($q_t->signal_avg);
                            if ($signal_avg < -95) {
                                $signal_avg_bar = 0.01;
                            }
                            if (($signal_avg >= -95)&($signal_avg <= -35)) {
                                    $p_val = 95-(abs($signal_avg));
                                    $signal_avg_bar = round($p_val/60, 1);
                            }
                            if ($signal_avg > -35) {
                                $signal_avg_bar = 1;
                            }
                        }
                        
                        if($this->timespan !== 'hour'){
                            $q_t_h = $this->ApStationHourlies->find()
                                ->select($this->fields)
                                ->where([
                                    'mac_address_id'      => $mac_address_id,
                                    'ap_id'               => $ap_id,
                                    'ap_profile_entry_id' => $apProfileEntryId,
                                    'modified >='         => $modified
                                ])
                                ->first();
                                
                            if($q_t_h->signal_avg){
                            
                                $t_bytes    = $t_bytes + $q_t_h->tx_bytes;
                                $r_bytes    = $r_bytes + $q_t_h->rx_bytes;
                                //-- Here we use the older ones for average
                                $signal_avg = round($q_t_h->signal_avg);
                                if ($signal_avg < -95) {
                                    $signal_avg_bar = 0.01;
                                }
                                if (($signal_avg >= -95)&($signal_avg <= -35)) {
                                        $p_val = 95-(abs($signal_avg));
                                        $signal_avg_bar = round($p_val/60, 1);
                                }
                                if ($signal_avg > -35) {
                                    $signal_avg_bar = 1;
                                }
                                
                            }                  
                        }

	                	 $basic = [
                            'id'                => $id,
                            'name'              => $entryName,
                            'ap_profile_entry_id'=> $apProfileEntryId,
                            'mac'               => $mac,
                            'mac_address_id'    => $mac_address_id,
                            'vendor'            => $this->_lookup_vendor($mac),
                            'tx_bytes'          => $t_bytes,
                            'rx_bytes'          => $r_bytes,
                            'signal_avg'        => $signal_avg ,
                            'signal_avg_bar'    => $signal_avg_bar            
                        ];
                        	      	                		                	
	                	$dead_after = $this->_get_dead_after($q_ap->ap_profile_id);	                	
	                	$latestInfo = $this->_getLatsetApInfo($ap_id,$q_ap->ap_profile_id,$mac_address_id,$dead_after);                             
                        $basic      = (array_merge($basic,$latestInfo));
                        $mActions   = $this->_getMacActions($cloud_id,$q_ap->ap_profile_id,$mac_address_id);
                        $basic      = (array_merge($basic,$mActions));            
                        
                                                                              
                        array_push($items, $basic);
                        $id++;
                    }

                }else{
                    array_push($items, [
                        'id'                => $id,
                        'name'              => $entryName,
                        'ap_profile_entry_id'=> $apProfileEntryId,
                        'mac'               => 'N/A',
                        'tx_bytes'          => 0,
                        'rx_bytes'          => 0,
                        'signal_avg'        => null ,
                        'signal_bar'        => 'N/A' ,
                        'signal_avg_bar'    => 'N/A',
                        'signal_bar'        => 'N/A',
                        'signal'            => null,
                        'tx_bitrate'        => 0,
                        'rx_bitrate'        => 0,
                        'vendor'            => 'N/A'
                    ]);
                    $id++;
                }
            }
        }
		 
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }


    //---------- Private Functions --------------
	
    private function _format_mac($mac){
        return preg_replace('/:/', '-', $mac);
    }

    private function _mem_kb_to_bytes($kb_val){
        $kb = preg_replace('/\s*kb/i', "", $kb_val);
        return($kb * 1024);
    }

    private function _lookup_vendor($mac){
        //Convert the MAC to be in the same format as the file 
        $mac    = strtoupper($mac);
        $pieces = explode(":", $mac);

        $big_match      = $pieces[0].":".$pieces[1].":".$pieces[2].":".$pieces[3].":".$pieces[4];
        $small_match    = $pieces[0].":".$pieces[1].":".$pieces[2];
        $lines          = $this->vendor_list;

        $big_match_found = false;
        foreach($lines as $i){
            if(preg_match("/^$big_match/",$i)){
                $big_match_found = true;
                //Transform this line
                $vendor = preg_replace("/$big_match\s?/","",$i);
                $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                $vendor = rtrim($vendor);
                return $vendor;   
            }
        }
       
        if(!$big_match_found){
            foreach($lines as $i){
                if(preg_match("/^$small_match/",$i)){
                    //Transform this line
                    $vendor = preg_replace("/$small_match\s?/","",$i);
                    $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                    $vendor = rtrim($vendor);
                    return $vendor;
                }
            }
        }
        $vendor = "Unknown";
    }

	private function _get_dead_after($ap_profile_id){
    
		$this->loadModel('UserSettings');        
        $q_r   = $this->{'UserSettings'}->find()->where(['user_id' => -1,'name' => 'heartbeat_dead_after'])->first();
        if($q_r){
            $dead_after = $q_r->value;
        }
		$ap_s = $this->{'ApProfiles'}->find()->contain(['ApProfileSettings'])->where(['ApProfileSettings.ap_profile_id' => $ap_profile_id])->first();

		if($ap_s){
            $dead_after = $ap_s->ap_profile_setting->heartbeat_dead_after;
        }
		return $dead_after;
	}

	private function _get_timespan(){

		$hour   = (60*60);
        $day    = $hour*24;
        $week   = $day*7;

        $modified = date('Y-m-d H:i:s', time());

		$timespan = 'hour';  //Default
        if(null !== $this->request->getQuery('timespan')){
            $timespan = $this->request->getQuery('timespan');
        }

        if($timespan == 'hour'){
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$hour);
        }

        if($timespan == 'day'){
            //Get entries created modified during the past day
            $modified = date("Y-m-d H:i:s", time()-$day);
        }

        if($timespan == 'week'){
            //Get entries created modified during the past week
            $modified = date("Y-m-d H:i:s", time()-$week);
        }
		return $modified;
	}
	
    private function _build_cpu_settings($system_settings){
        $return_array = [];
        $find_these = [
            'cpu_model',
            'system_type',
            'machine',
            'DISTRIB_RELEASE',
            'DISTRIB_REVISION'
        ];
        
        foreach($system_settings as $i){
            $name = $i['name'];
            if (in_array($name, $find_these)) {
                $value = $i['value'];
                if($name ==  'cpu_model'){
                    array_push($return_array, ['description' => 'CPU Model','value' => $value,'style' => 'rdInfo']);
                }
                if($name ==  'system_type'){
                    array_push($return_array, ['description' => 'System','value' => $value,'style' => 'rdInfo']);
                }
                if($name ==  'machine'){
                    array_push($return_array, ['description' => 'Hardware','value' => $value,'style' => 'rdInfo']);
                }
                if($name ==  'DISTRIB_RELEASE'){
                    array_push($return_array, ['description' => 'Firmware','value' => $value,'style' => 'rdInfo']);
                }
                if($name ==  'DISTRIB_REVISION'){
                    array_push($return_array, ['description' => 'Revision','value' => $value,'style' => 'rdInfo']);
                }
            }
        }
        return $return_array;
    }
    
    private function _build_radio_settings($radio_data,$nr=0){
    
        $return_array = [];
    
        $find_these = [
            'radio'.$nr.'_band',
            'radio'.$nr.'_htmode',
            'radio'.$nr.'_txpower',
            'radio'.$nr.'_disabled',
            'radio'.$nr.'_channel_two',
            'radio'.$nr.'_channel_five'
        ];
    
        foreach($radio_data as $i){
            $name = $i['name'];
            if (in_array($name, $find_these)) {
                $value = $i['value'];
                //Band
                if($name ==  'radio'.$nr.'_band'){
                    if($value == '24'){
                        array_push($return_array, ['description' => 'Band','value' => '2.4G','style' => 'rdInfo' ]);
                    }
                     if($value == '5'){
                        array_push($return_array, ['description' => 'Band','value' => '5G','style' => 'rdInfo' ]);
                    }
                }
                //Enabled
                if($name ==  'radio'.$nr.'_disabled'){
                    if($value == '0'){
                        array_push($return_array, ['description' => 'Enabled','value' => 'Yes','style' => 'rdOk']);
                    }
                     if($value == '1'){
                        array_push($return_array, ['description' => 'Enabled','value' => 'No','style' => 'rdWarn']);
                    }
                }
                //HT-Mode
                if($name ==  'radio'.$nr.'_htmode'){
                    array_push($return_array, ['description' => 'HT-Mode','value' => $value,'style' => 'rdInfo']);
                }                
                //HT-Mode
                if($name ==  'radio'.$nr.'_txpower'){
                    array_push($return_array, ['description' => 'Power','value' => $value.'dBm','style' => 'rdInfo']);
                }               
                //Channel(2.4)
                if($name ==  'radio'.$nr.'_channel_two'){
                    array_push($return_array, ['description' => 'Channel','value' => $value,'style' => 'rdInfo']);
                }              
                //Channel(5)
                if($name ==  'radio'.$nr.'_channel_five'){
                    array_push($return_array, ['description' => 'Channel','value' => $value,'style' => 'rdInfo']);
                }   
            }
        }     
        return $return_array;
    }
    
    private function _getHardwareDetail($fw_id){
        $hw = false;
        $hw = $this->{'Hardwares'}->find()
		    ->where(['Hardwares.fw_id' => $fw_id,'Hardwares.for_ap' => true])
		    ->first();    
        return $hw;
    }
     
    private function _find_alias($mac_address_id){
    
    	$req_q    = $this->request->getQuery();    
       	$cloud_id = $req_q['cloud_id'];
      
        $alias = false;
        $qr = $this->{'MacAliases'}->find()->where(['MacAliases.mac_address_id' => $mac_address_id,'MacAliases.cloud_id'=> $cloud_id])->first();
        if($qr){
        	$alias = $qr->alias;
        } 
        return $alias;
    }
    
    //===============================
    //---- ACTIONS RELATED  --------
    //===============================
    
    private function _getMacActions($cloud_id, $ap_profile_id, $mac_id){
        $mActions = [
            'block_flag' => false,
            'limit_flag' => false,
            'firewall_flag' => false,
            'cloud_flag' => false,
            'bw_up' => '',
            'bw_down' => '',
            'fw_profile' => '',
            'alias' => $this->_find_alias($mac_id)
        ];

        $cloudAction = $this->_getCloudAction($cloud_id, $mac_id);
        if ($cloudAction) {
            $this->_applyCloudAction($mActions, $cloudAction);
        }

        $apProfileAction = $this->_getApProfileAction($ap_profile_id, $mac_id);
        if ($apProfileAction) {
            $this->_applyApProfileAction($mActions, $apProfileAction);
        }
        
        return $mActions;
    }

    private function _getCloudAction($cloud_id, $mac_id){

        return $this->{'MacActions'}->find()
            ->where(['MacActions.mac_address_id' => $mac_id, 'MacActions.cloud_id' => $cloud_id])
            ->contain(['FirewallProfiles'])
            ->first();
    }

    private function _getApProfileAction($ap_profile_id, $mac_id){

        return $this->{'MacActions'}->find()
            ->where(['MacActions.mac_address_id' => $mac_id, 'MacActions.ap_profile_id' => $ap_profile_id])
            ->contain(['FirewallProfiles'])
            ->first();
    }

    private function _applyCloudAction(&$mActions, $action){

        $mActions['cloud_flag'] = true;
        switch ($action->action) {
            case 'block':
                $mActions['block_flag'] = true;
                break;
            case 'limit':
                $this->_applyLimitAction($mActions, $action);
                break;
            case 'firewall':
                $mActions['firewall_flag'] = true;
                $mActions['fw_profile'] = $action->firewall_profile->name;
                break;
        }
    }

    private function _applyApProfileAction(&$mActions, $action){
    
        $mActions['cloud_flag'] = false;
        switch ($action->action) {
            case 'block':
                $mActions['block_flag'] = true;
                break;
            case 'limit':
                $this->_applyLimitAction($mActions, $action);
                break;
            case 'firewall':
                $mActions['firewall_flag'] = true;
                $mActions['fw_profile'] = $action->firewall_profile->name;
                break;
        }
    }

    private function _applyLimitAction(&$mActions, $action){

        $mActions['limit_flag'] = true;
        $mActions['bw_up'] = $this->_formatBandwidth($action->bw_up);
        $mActions['bw_down'] = $this->_formatBandwidth($action->bw_down);
    }

    private function _formatBandwidth($bandwidth){

        $bandwidth *= 8;
        $suffix = 'kbps';
        if ($bandwidth >= 1000) {
            $bandwidth /= 1000;
            $suffix = 'mbps';
        }
        return $bandwidth . ' ' . $suffix;
    }
    //---- END ACTIONS RELATED ----
    
    private function _getLatsetApInfo($apId,$ap_profile_id,$macAddressId,$dead_after){
    
         //Get the latest entry
        $lastCreated = $this->ApStations->find()->where([
            'mac_address_id' => $macAddressId,
            'ap_id'          => $apId
        ])->order(['created' => 'desc'])->first();

        $historical = false;          
        if(!$lastCreated){
            $historical = true;
            $lastCreated = $this->ApStationHourlies->find()->where([
                'mac_address_id'    => $macAddressId,
                'ap_id'             => $apId
            ])->order(['created'   => 'desc'])->first();     
        }
        
        if($historical){
            $signal = $lastCreated->signal_avg;
        }else{
            $signal = $lastCreated->signal_now;
        }      

        if ($signal < -95) {
            $signal_bar = 0.01;
        }
        if (($signal >= -95)&($signal <= -35)) {
                $p_val = 95-(abs($signal));
                $signal_bar = round($p_val/60, 1);
        }
        if ($signal > -35) {
            $signal_bar = 1;
        }
        
        $last_ap_profile_entry_id = $lastCreated->ap_profile_entry_id;
        
        $l_client_contact       = $lastCreated->modified;
        $l_client_contact_human = $this->TimeCalculations->time_elapsed_string($l_client_contact);
            
        $last_client_timestamp = strtotime($l_client_contact);
        if ($last_client_timestamp+$dead_after <= time()) {
            $client_state = 'down';
        } else {
            $client_state = 'up';
        }           
    
        return [
            'signal_bar'        => $signal_bar,
            'signal'            => $signal,
            'l_tx_bitrate'      => $lastCreated->tx_bitrate,
            'l_rx_bitrate'      => $lastCreated->rx_bitrate,
            'l_signal'          => $lastCreated->signal_now,
            'l_signal_avg'      => $lastCreated->signal_avg,
            'l_tx_failed'       => $lastCreated->tx_failed,
            'l_tx_retries'      => $lastCreated->tx_retries,
            'l_modified'        => $lastCreated->modified,
            'l_modified_human'  => $this->TimeCalculations->time_elapsed_string($lastCreated->modified),
            'l_tx_bytes'        => $lastCreated->tx_bytes,
            'l_rx_bytes'        => $lastCreated->rx_bytes,
            'client_state'      => $client_state       
        ];    
    } 
}
