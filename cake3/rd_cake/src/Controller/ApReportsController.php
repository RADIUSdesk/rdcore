<?php

namespace App\Controller;

use Cake\Core\Configure;

class ApReportsController extends AppController {

    public $main_model  = 'ApReports';
    
    private $rebootFlag = false;  
    
     protected $fields   = [
        'tx_bytes' => 'SUM(ApStations.tx_bytes)',
        'rx_bytes' => 'SUM(ApStations.rx_bytes)',
        'signal_avg' => 'AVG(ApStations.signal_avg)',
    ];

    public function initialize()
    {
        parent::initialize();
        $this->loadModel('Aps');
        $this->loadModel('ApProfiles');
        $this->loadModel('ApLoads');
        $this->loadModel('ApStations');
        $this->loadModel('ApSystems');
        $this->loadModel('ApProfileEntries');
        $this->loadModel('ApSettings');
        $this->loadModel('ApActions');
        $this->loadModel('ApProfileExits');
        $this->loadModel('ApProfileSettings');
		$this->loadModel('ApUptmHistories');
		
		$this->loadModel('Hardwares');         


        $this->loadComponent('Aa');
        $this->loadComponent('MacVendors');
        $this->loadComponent('Formatter');
        $this->loadComponent('TimeCalculations');
    }
	
    public function submitReport(){

        //Source the vendors file and keep in memory
        $vendor_file        = APP."..".DS."setup".DS."scripts".DS."mac_lookup.txt";

        $this->vendor_list  = file($vendor_file);

        $this->log('Got a new report submission', 'debug');
        $fb = $this->_new_report();

		//Handy for debug to see what has been submitted
        //file_put_contents('/tmp/ap_report.txt', print_r($this->request->getData(), true));
        $this->set(array(
            'items'         => $fb,
            'reboot_flag'   => $this->rebootFlag,
            'success'       => true,
            '_serialize' => ['items', 'success','reboot_flag']
        ));
    }
    
    //______ AP View ______________
       
    //List of SSIDs (Entry Points) defined for Access Point
    public function viewEntryPoints(){
    
        $items = [['id' => 0,'name' => '(All)']];
    
        if(null !== $this->request->getQuery('ap_id')){

            $q_r = $this->Aps->find()->where(['Aps.id' => $this->request->getQuery('ap_id')])->first();

            if($q_r){
                $ap_profile_id = $q_r->ap_profile_id;

                $q_ent = $this->ApProfileEntries->find()->select(['ApProfileEntries.id', 'ApProfileEntries.name'])->where(['ApProfileEntries.ap_profile_id' => $ap_profile_id])->all();

                foreach($q_ent as $ent){
                    $id     = $ent->id;
                    $name   = $ent->name;
                    array_push($items, ['id' => $id,'name' => $name]);
                }
            }
         
        }
        $this->set([
            'items'   => $items,
            'success' => true,
            '_serialize' => ['items','success']
        ]);
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
            'success' => true,
            '_serialize' => ['data','success']
        ]);
    }
      
    //Chart for AccessPoint Data Usage
    public function viewDataUsage(){
    
        $ap_id      = $this->request->getQuery('ap_id');
        
        $items      = [];
        $totalIn    = 0;
        $totalOut   = 0;
        $totalInOut = 0;
         
        $time_span = 'hour';
        if(null !== $this->request->getQuery('timespan')){
            $time_span = $this->request->getQuery('timespan');
        }
        
        $ap_profile_entry_id = 0;
        if(null !== $this->request->getQuery('entry_id')){
            $ap_profile_entry_id = $this->request->getQuery('entry_id');
        }
        
        if($time_span == 'week'){
            $span       = 7;
            $unit       = 'days';
            $slot       = (60*60)*24;//A day
            $start_time = time();
        }
        
        if($time_span == 'day'){
            $span       = 24;
            $unit       = 'hours';
            $slot       = (60*60);//An hour
           // $start_time = strtotime("tomorrow", time()) - 1;
           //$start_time = time();
           $start_time  = mktime(date("H"), 0, 0);
        }
        
        if($time_span == 'hour'){
            $span       = 4;
            $unit       = 'quater_hours';
            $slot       = (60*15);//15 minutes
            $start_time = time();
            
        }
        
        $carry_overs = [];
        
        for ($x = 0; $x <= $span; $x++) {
                     
            if($time_span == 'week'){
                $beginOfPeriod  = strtotime("midnight", $start_time);
                $endOfPeriod    = strtotime("tomorrow", $beginOfPeriod) - 1;
                $unit           = "$x Day";
            }
            
            if($time_span == 'day'){
                $beginOfPeriod  = $start_time-$slot;
                $endOfPeriod    = $start_time;
                $unit           = "$x Hour";
            }
            
            if($time_span == 'hour'){
                $beginOfPeriod  = $start_time-$slot;
                $endOfPeriod    = $start_time;
                $unit           = ($x * 15)." Min";
            }
            
            $start_time     = $start_time - $slot;
            
            //print("=========\n");
            //print(date("Y-m-d H:i:s", $beginOfPeriod)." ".date("Y-m-d H:i:s", $endOfPeriod)."\n");
            
            $tx_bytes = 0;
            $rx_bytes = 0;
            
            foreach($carry_overs as $co){
                //print_r($co);
                if($co['started'] <= $beginOfPeriod){
                  //  print("Carry over taking place ...");
                    $tx_bytes = $tx_bytes + $co['tx_for_period'];
                    $rx_bytes = $rx_bytes + $co['rx_for_period'];
                }
            }

            $where = [
                'ApStations.ap_id'           => $ap_id,
                'ApStations.modified >='     => date("Y-m-d H:i:s", $beginOfPeriod),
                'ApStations.modified <='     => date("Y-m-d H:i:s", $endOfPeriod)
            ];
           
            if($ap_profile_entry_id != 0){
                array_push($where, ['ApStations.ap_profile_entry_id' => $ap_profile_entry_id]);
            }
           
            $q_s = $this->ApStations->find()->select([
                'ApStations.mac',
                'ApStations.tx_bytes',
                'ApStations.rx_bytes',
                'ApStations.created',
                'ApStations.modified'
            ])->where($where)->all();

            foreach($q_s as $i){
                //We need to determine if the created and modified stamps fall within this slot
                if(strtotime($i->created) >= $beginOfPeriod){
                   $tx_bytes = $tx_bytes +$i->tx_bytes;
                   $rx_bytes = $rx_bytes +$i->rx_bytes;
                   //print_r($i);
                }else{
                    //print("We need to work out a weight for the timespan\n");
                    //print_r($i);
                    $start  = strtotime($i->created);
                    $end    = strtotime($i->modified);
                    //get the bytes per second
                    $time_period = $end - $start;
                    $tx_per_second = ($i->tx_bytes) / $time_period;
                    $rx_per_second = ($i->rx_bytes) / $time_period;
                    //Now we know the bytes per second we can multiply it with the period in the slot we occupied
                    $slot_period   = $end - $beginOfPeriod;
                    
                    $tx_for_period = intval($tx_per_second * $slot_period);
                    $rx_for_period = intval($rx_per_second * $slot_period);
                    array_push($carry_overs, ['started' => $start,'tx_for_period' => $tx_for_period, 'rx_for_period' => $rx_for_period]);
                    $tx_bytes = $tx_bytes + $tx_for_period;
                    $rx_bytes = $rx_bytes + $rx_for_period;    
                }
            }
            array_push($items, ['id' => $x,'time_unit' => "$unit",'tx_bytes' => $tx_bytes,'rx_bytes' => $rx_bytes]);
            $totalIn    = $totalIn+$rx_bytes;
            $totalOut   = $totalOut+$tx_bytes;
            $totalInOut = $totalOut+($tx_bytes+$rx_bytes); 
        } 
        $this->set([
            'items'   => $items,
            'success' => true,
            'totalIn'   => $totalIn,
            'totalOut'  => $totalOut,
            'totalInOut'=> $totalInOut,
            '_serialize' => ['items','success','totalIn','totalOut','totalInOut']
        ]);
    }
    
    //Chart for AccessPiont Connected users
    public function viewConnectedUsers(){
    
        $totalUsers = 0;
        $items      = [];
        $ap_id      = $this->request->getQuery('ap_id');
        $time_span = 'hour';
        
        if(null !== $this->request->getQuery('timespan')){
            $time_span = $this->request->getQuery('timespan');
        }
        
        $ap_profile_entry_id = 0;
        if(null !== $this->request->getQuery('entry_id')){
            $ap_profile_entry_id = $this->request->getQuery('entry_id');
        }
        
        if($time_span == 'week'){
            $span       = 7;
            $unit       = 'days';
            $slot       = (60*60)*24;//A day
            $start_time = time();
        }
        
        if($time_span == 'day'){
            $span       = 24;
            $unit       = 'hours';
            $slot       = (60*60);//An hour
           // $start_time = strtotime("tomorrow", time()) - 1;
           //$start_time = time();
           $start_time  = mktime(date("H"), 0, 0);
        }
        
        if($time_span == 'hour'){
            $span       = 4;
            $unit       = 'quater_hours';
            $slot       = (60*15);//15 minutes
            $start_time = time();
            
        }
        
        $carry_overs = [];
        
        $master_mac_count = [];
        
        for ($x = 0; $x <= $span; $x++) {
                     
            if($time_span == 'week'){
                $beginOfPeriod  = strtotime("midnight", $start_time);
                $endOfPeriod    = strtotime("tomorrow", $beginOfPeriod) - 1;
                $unit           = "$x Day";
            }
            
            if($time_span == 'day'){
                $beginOfPeriod  = $start_time-$slot;
                $endOfPeriod    = $start_time;
                $unit           = "$x Hour";
            }
            
            if($time_span == 'hour'){
                $beginOfPeriod  = $start_time-$slot;
                $endOfPeriod    = $start_time;
                $unit           = ($x * 15)." Min";
            }
            
            $start_time     = $start_time - $slot;
            
           // print("=========\n");
          //  print(date("Y-m-d H:i:s", $beginOfPeriod)." ".date("Y-m-d H:i:s", $endOfPeriod)."\n");
            
            $mac_count = [];
            
            foreach($carry_overs as $co){
                //print_r($co);
                if($co['started'] <= $beginOfPeriod){
                  //  print("Carry over taking place ...");
                   $mac = $co['mac'];
                   $mac_count[$mac] = '';
                }
            }

            $where = [
                'ApStations.ap_id'           => $ap_id,
                'ApStations.modified >='     => date("Y-m-d H:i:s", $beginOfPeriod),
                'ApStations.modified <='     => date("Y-m-d H:i:s", $endOfPeriod)
            ];

            if($ap_profile_entry_id != 0){
                array_push($where, ['ApStations.ap_profile_entry_id' => $ap_profile_entry_id]);
            }

            $q_s = $this->ApStations->find()->select([
                'ApStations.mac',
                'ApStations.created',
                'ApStations.modified'
            ])->where($where)->all();

            foreach($q_s as $i){
                $mac                    = $i->mac;
                $mac_count[$mac]        = '';
                $master_mac_count[$mac] = '';
                if(strtotime($i->created) <= $beginOfPeriod){
                    $start  = strtotime($i->created);
                    array_push($carry_overs, ['started' => $start,'mac' => $mac]);
                }
            } 
            $users = count($mac_count);
            array_push($items, ['id' => $x,'time_unit' => "$unit",'users' => $users]);
            
                
        } 
        
        $totalUsers    = count($master_mac_count);
        
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalUsers'    => $totalUsers,
            '_serialize' => ['items','success','totalUsers']
        ]);
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
		        'success' => false,
		        '_serialize' => ['success','message']
		    ]);
			return;
		}

        $items  	= [];
		$modified 	= $this->_get_timespan();
		$ap_id      = $this->request->getQuery('ap_id');
		$id         = 1;

		$q_ap       = $this->Aps->find()->contain(['ApProfiles.ApProfileEntries'])->where(['Aps.id' => $ap_id])->first();

		if($q_ap){

            foreach($q_ap->ap_profile->ap_profile_entries as $entry){
            
                $ap_profile_entry_id = $entry->id;
                $entry_name          = $entry->name;
                
                $q_s = $this->{'ApStations'}->find()->select(['mac'])->distinct(['mac'])->where([
                    'ApStations.ap_id'               => $ap_id,
                    'ApStations.ap_profile_entry_id' => $ap_profile_entry_id,
                    'ApStations.modified >='         => $modified
                ])->all();

                if($q_s->count()>0){
                    foreach($q_s as $s){
                        $mac = $s->mac;
                        $q_t = $this->ApStations->find()->select($this->fields)->where([
                            'ApStations.mac'                 => $mac,
                            'ApStations.ap_id'               => $ap_id,
                            'ApStations.ap_profile_entry_id' => $ap_profile_entry_id,
                            'ApStations.modified >='         => $modified
                        ])->first();

                        $t_bytes    = $q_t->tx_bytes;
                        $r_bytes    = $q_t->rx_bytes;
                        $signal_avg = round($q_t->signal_avg);
                        if($signal_avg < -95){
                            $signal_avg_bar = 0.01;
                        }
                        if(($signal_avg >= -95)&($signal_avg <= -35)){
                            $p_val = 95-(abs($signal_avg));
                            $signal_avg_bar = round($p_val/60,1);
                        }
                        if($signal_avg > -35){
                            $signal_avg_bar = 1;
                        }

                        //Get the latest entry
                        $lastCreated = $this->ApStations->find()->where([
                            'ApStations.mac'                 => $mac,
                            'ApStations.ap_id'               => $ap_id,
                            'ApStations.ap_profile_entry_id' => $ap_profile_entry_id,
                        ])->order(['ApStations.created' => 'desc'])
                            ->first();

                        // print_r($lastCreated);

                        $signal = $lastCreated->signal_now;

                        if($signal < -95){
                            $signal_bar = 0.01;
                        }
                        if(($signal >= -95)&($signal <= -35)){
                            $p_val = 95-(abs($signal));
                            $signal_bar = round($p_val/60,1);
                        }
                        if($signal > -35){
                            $signal_bar = 1;
                        }

                        array_push($items, [
                            'id'                => $id,
                            'name'              => $entry_name,
                            'ap_profile_entry_id'=> $ap_profile_entry_id,
                            'mac'               => $mac,
                            'vendor'            => $lastCreated->vendor,
                            'tx_bytes'          => $t_bytes,
                            'rx_bytes'          => $r_bytes,
                            'signal_avg'        => $signal_avg ,
                            'signal_avg_bar'    => $signal_avg_bar,
                            'signal_bar'        => $signal_bar,
                            'signal'            => $signal,
                            'l_tx_bitrate'      => $lastCreated->tx_bitrate,
                            'l_rx_bitrate'      => $lastCreated->rx_bitrate,
                            'l_signal'          => $lastCreated->signal_now,
                            'l_signal_avg'      => $lastCreated->signal_avg,
                            'l_MFP'             => $lastCreated->MFP,
                            'l_tx_failed'       => $lastCreated->tx_failed,
                            'l_tx_retries'      => $lastCreated->tx_retries,
                            'l_modified'        => $lastCreated->modified,
                            'l_modified_human'  => $this->TimeCalculations->time_elapsed_string($lastCreated->modified),
                            'l_authenticated'   => $lastCreated->authenticated,
                            'l_authorized'      => $lastCreated->authorized,
                            'l_tx_bytes'        => $lastCreated->tx_bytes,
                            'l_rx_bytes'        => $lastCreated->rx_bytes
                        ]);
                        $id++;
                    }

                }else{
                    array_push($items, [
                        'id'                => $id,
                        'name'              => $entry_name,
                        'ap_profile_entry_id'=> $ap_profile_entry_id,
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
            'success' => true,
            '_serialize' => ['items','success']
        ]);
    }


    //---------- Private Functions --------------

    private function _new_report(){ 

        //FIXME Optimise the queries
            
         //--- Check if the 'network_info' array is in the data ----
        $this->log('AP: Checking for network_info in log', 'debug');

        $cdata = $this->request->getData();

        if(array_key_exists('network_info', $cdata)){
            $this->log('AP: Found network_info', 'debug');
            $ni = $cdata['network_info'];
            $id = $this->_format_mac($ni['eth0']);

            $this->log('AP: Locating the ap with MAC '.$id, 'debug');

            $q_r = $this->Aps->find()->where(['Aps.mac' => $id])->first();

            if($q_r){
                $ap_id          = $q_r->id;
                $ap_profile_id  = $q_r->ap_profile_id;

                $this->log('AP: The ap id of '.$id.' is '.$ap_id, 'debug');

                if(array_key_exists(0,$ni['radios'])){
                    $this->log('AP: First RADIO reported for '.$id.' is '.$ap_id, 'debug');
                $rad_zero_int = $ni['radios'][0]['interfaces'];
                $this->_do_radio_interfaces($ap_profile_id,$ap_id,$rad_zero_int);
                }

				//If it is a dual radio --- report on it also ----
				if(array_key_exists(1,$ni['radios'])){
					$this->log('AP: Second RADIO reported for '.$id.' is '.$ap_id, 'debug');

					$rad_one_int = $ni['radios'][1]['interfaces'];
					$this->_do_radio_interfaces($ap_profile_id,$ap_id,$rad_one_int);
				}
            }else{
                $this->log('AP: ap with MAC '.$id.' was not found', 'debug');
            }
        }
        
        //--- Check if the 'system_info' array is in the data ----
        $this->log('AP: Checking for system_info in log', 'debug');

        if(array_key_exists('system_info',$cdata)){
            $this->log('AP: Found system_info', 'debug');

            $ap_profile_id = false;
            $si = $cdata['system_info'];
            $id = $this->_format_mac($si['eth0']);
            $this->log('AP: Locating the node with MAC '.$id, 'debug');

            $q_r = $this->Aps->find()->where(['Aps.mac' => $id])->first();

            if($q_r){ 
                $ap_id          = $q_r->id;
                $ap_profile_id  = $q_r->ap_profile_id;
                $this->log('Ap: The ap id of '.$id.' is '.$ap_id, 'debug');

                $this->_do_ap_system_info($ap_id,$si['sys']);
                $this->_do_ap_load($ap_id,$si['sys']);
                $this->_update_last_contact($ap_id);
            }else{
                $this->log('AP: ap with MAC '.$id.' was not found', 'debug');
            }
        }
    
    
        $items = false;
		//--- Check if there are any lan_info items here
        $this->log('AP: Checking for lan_info in log', 'debug');

        if (array_key_exists('lan_info', $cdata)) {
            $this->log('Ap: Found lan_info', 'debug');
            $mac = $cdata['lan_info']['mac'];

            $q_r = $this->Aps->find()->where(['Aps.mac' => $mac])->first();


            if ($q_r) {
				//Do uptm history
				$this->_do_uptm_history($q_r);
                $ap_id    = $q_r->id;
                $lan_proto  = $cdata['lan_info']['lan_proto'];
                $lan_gw     = $cdata['lan_info']['lan_gw'];
                $lan_ip     = $cdata['lan_info']['lan_ip'];

                $d_lan      = [];
                $d_lan['lan_gw'] = $lan_gw;
                $d_lan['lan_ip'] = $lan_ip;
                $d_lan['lan_proto']  = $lan_proto;
                $d_lan['ap_profile_id'] = $q_r->ap_profile_id;
                
                $d_lan['last_contact']          = date("Y-m-d H:i:s", time());
                $d_lan['last_contact_from_ip']  = $this->request->clientIp();
              
                $this->{'Aps'}->patchEntity($q_r,$d_lan);
                $this->{'Aps'}->save($q_r);
                       
                //Check if there are commands waiting for it
                $q_a = $this->ApActions->find()->where(['ApActions.ap_id' => $ap_id,'ApActions.status' => 'awaiting'])->all();

				$items	= [];				
				foreach($q_a as $i){
					$action_id	= $i->id;
				    array_push($items,$action_id);
				}    
            }         
        }
			
		return $items;       
    }

    private function _do_radio_interfaces($ap_profile_id,$ap_id,$interfaces){

        foreach($interfaces as $i){
            if(count($i['stations']) > 0){
                //Try to find (if type=AP)the Entry ID of the Mesh
                if($i['type'] == 'AP'){
                    $q_r = $this->ApProfileEntries->find()->where([
                        'ApProfileEntries.name'           => $i['ssid'],
                        'ApProfileEntries.ap_profile_id'  => $ap_profile_id
                    ])->first();

                    if($q_r){
                        $entry_id = $q_r->id;
                        foreach($i['stations'] as $s){
                            $data = $this->_prep_station_data($s);
                            $data['ap_profile_entry_id']  = $entry_id;
                            $data['ap_id']        = $ap_id;
                            //--Check the last entry for this MAC
                            $q_mac = $this->ApStations->find()->where([
                                'ApStations.ap_profile_entry_id' => $entry_id,
                                'ApStations.ap_id'      => $ap_id,
                                'ApStations.mac'        => $data['mac'],
                            ])->order(['ApStations.created' => 'desc'])->first();

                            $new_flag = true;

                            if($q_mac){
                                $old_tx = $q_mac->tx_bytes;
                                $old_rx = $q_mac->rx_bytes;
                                if(($data['tx_bytes'] >= $old_tx)&($data['rx_bytes'] >= $old_rx)){
                                    $data['id'] =  $q_mac->id;
                                    $new_flag = false;   
                                }
                            }
                            
                            if ($new_flag) {
                                $e_new   = $this->{'ApStations'}->newEntity($data);
                                $this->{'ApStations'}->save($e_new);
                            }else{
                                $this->{'ApStations'}->patchEntity($q_mac,$data);
                                $this->{'ApStations'}->save($q_mac);
                            }
                        }
                    }      
                    
                }  
            }
        }
    }

    private function _do_ap_load($ap_id,$info){
        $this->log('AP: ====Doing the ap load info for===: '.$ap_id, 'debug');
        $mem_total  = $this->_mem_kb_to_bytes($info['memory']['total']);
        $mem_free   = $this->_mem_kb_to_bytes($info['memory']['free']);
        $u          = $info['uptime'];
        $time       = preg_replace('/\s+up.*/', "", $u);
        $load       = preg_replace('/.*.\s+load average:\s+/', "", $u);
        $loads      = explode(", ",$load);
        $up         = preg_replace('/.*\s+up\s+/', "", $u);
        $up         = preg_replace('/,\s*.*/', "", $up);
        $data       = array();
        $data['mem_total']  = $mem_total;
        $data['mem_free']   = $mem_free;
        $data['uptime']     = $up;
        $data['system_time']= $time;
        $data['load_1']     = $loads[0];
        $data['load_2']     = $loads[1];
        $data['load_3']     = $loads[2];
        $data['ap_id']      = $ap_id;


        $n_l = $this->ApLoads->find()->where(['ApLoads.ap_id' => $ap_id])->first();

        $new_flag = true;
        if($n_l){  
		    $data['id'] =  $n_l->id;
		    $new_flag 	= false;   
        }
        if ($new_flag) {
            $e_new   = $this->{'ApLoads'}->newEntity($data);
            $this->{'ApLoads'}->save($e_new);
        }else{
            $this->{'ApLoads'}->patchEntity($n_l,$data);
            $this->{'ApLoads'}->save($n_l);
        }        
    }

    private function _do_ap_system_info($ap_id,$info){
        $this->log('AP: Doing the system info for ap id: '.$ap_id, 'debug');

        $q_r = $this->{'ApSystems'}->find()->where(['ApSystems.ap_id' => $ap_id])->first();
        if(!$q_r){
            $this->log('AP: EMPTY ApSystem - Add first one', 'debug');
            $this->_new_ap_system($ap_id,$info);

        }else{
            $this->log('AP: ApSystem info exists - Update if needed', 'debug');
            //We will check the value of DISTRIB_REVISION
            $dist_rev = false;
            if(array_key_exists('release',$info)){ 
                $release_array = explode("\n",$info['release']);
                foreach($release_array as $r){  
                    $this->log("AP: There are ".$r, 'debug'); 
                    $r_entry    = explode('=',$r);
                    $elements   = count($r_entry);
                    if($elements == 2){
                        $value          = preg_replace('/"|\'/', "", $r_entry[1]);
                        if(preg_match('/DISTRIB_REVISION/',$r_entry[0])){
                            $dist_rev = $value;
                            $this->log('AP: Submitted DISTRIB_REVISION '.$dist_rev, 'debug');
                            break;
                        }                
                    }
                }
            }

            //Find the current  DISTRIB_REVISION
            $q_r = $this->ApSystems->find()->where([
                'ApSystems.ap_id'    => $ap_id,
                'ApSystems.name'     => 'DISTRIB_REVISION'
            ])->first();

            if($q_r){
                $current = $q_r->value;
                $this->log('AP: Current DISTRIB_REVISION '.$dist_rev, 'debug');
                if($current !== $dist_rev){
                    $this->log('AP: Change in DISTRIB_REVISION -> renew', 'debug');
                    $this->ApSystems->deleteAll(['ApSystems.id' => $ap_id]);
                    $this->_new_ap_system($ap_id,$info);
                }else{
                    $this->log('AP: DISTRIB_REVISION unchanged', 'debug');
                }
            }
        }
    }

    private function _new_ap_system($ap_id,$info){
        //--CPU Info--
        if(array_key_exists('cpu',$info)){
             $this->log('AP: Adding  CPU info', 'debug');
            foreach(array_keys($info['cpu']) as $key){
              //  $this->log('Adding first CPU info '.$key, 'debug');
                $d['category']  = 'cpu';
                $d['name']      = $key;
                $d['value']     = $info['cpu']["$key"];
                $d['ap_id']     = $ap_id;
                $apSystemEntity = $this->ApSystems->newEntity($d);
                $this->ApSystems->save($apSystemEntity);
            }
        }

        //--
        if(array_key_exists('release',$info)){ 
            $release_array = explode("\n",$info['release']);
            foreach($release_array as $r){  
               // $this->log("There are ".$r, 'debug'); 
                $r_entry    = explode('=',$r);
                $elements   = count($r_entry);
                if($elements == 2){
                   // $this->log('Adding  Release info '.$r, 'debug');
                    $value          = preg_replace('/"|\'/', "", $r_entry[1]);
                    $d['category']  = 'release';
                    $d['name']      = $r_entry[0];
                    $d['value']     = $value;
                    $d['ap_id']   = $ap_id;
                    $apSystemEntity = $this->ApSystems->newEntity($d);
                    $this->ApSystems->save($apSystemEntity);
                }
            }
        }           
    }
      
   
    private function _update_last_contact($ap_id){  
        $ent = $this->Aps->find()->where(['Aps.id' => $ap_id])->first();
        if($ent){
            $ent->last_contact = date("Y-m-d H:i:s", time());
            $ent->last_contact_from_ip = $this->request->clientIp();
            $this->Aps->save($ent);
        }
    }

    private function _do_uptm_history($entity){
        $ap_id        = $entity->id;
		
        $e_uptm = $this->{'ApUptmHistories'}->find()
                ->where([   
                'ApUptmHistories.ap_id' => $ap_id,
                ])
                ->order(['ApUptmHistories.report_datetime' => 'desc'])
                ->first();
                 
        if($e_uptm){
			// check to see if last node_state was up or down
			if ($e_uptm->ap_state == 1) { // UP
                $e_uptm->report_datetime = time();
                $this->{'ApUptmHistories'}->save($e_uptm); 
			} else { // DOWN
				$data                   = [];
				$data['ap_state']     = 1;
				$data['ap_id']        	= $ap_id; 
				$data['state_datetime'] = time();
				$data['report_datetime']= time();    
				$e_new                  = $this->{'ApUptmHistories'}->newEntity($data);    
				$this->{'ApUptmHistories'}->save($e_new); 		
			}
        } else {
                $data                   = [];
                $data['ap_state']     = 1;
                $data['ap_id']        = $ap_id; 
                $data['state_datetime'] = time();
                $data['report_datetime']= time();    
                $e_new                  = $this->{'ApUptmHistories'}->newEntity($data);    
                $this->{'ApUptmHistories'}->save($e_new); 
        }
        $this->UptmTimestamp = time();
    }
	
    private function _format_mac($mac){
        return preg_replace('/:/', '-', $mac);
    }

    private function _mem_kb_to_bytes($kb_val){
        $kb = preg_replace('/\s*kb/i', "", $kb_val);
        return($kb * 1024);
    }

    private function _prep_station_data($station_info){
    
        //Ath10K fix
        if(!array_key_exists('rx bitrate',$station_info)){
            $station_info['rx bitrate'] = "N/A";
        } 
    
        $data       = [];
        $tx_proc    = $station_info['tx bitrate'];
        $tx_bitrate = preg_replace('/\s+.*/','',$tx_proc);
        $tx_extra   = preg_replace('/.*\s+/','',$tx_proc);
        $rx_proc    = $station_info['rx bitrate'];
        $rx_bitrate = preg_replace('/\s+.*/','',$rx_proc);
        $rx_extra   = preg_replace('/.*\s+/','',$rx_proc);
        $incative   = preg_replace('/\s+ms.*/','',$station_info['inactive time']);
        $s          = preg_replace('/\s+\[.*/','',$station_info['signal']);
        $a          = preg_replace('/\s+\[.*/','',$station_info['avg']);

        $mac_formatted        = $this->_format_mac($station_info['mac']);

        $data['vendor']        = $this->MacVendors->vendorFor($mac_formatted);
        $data['mac']           = $mac_formatted;
        $data['tx_bytes']      = $station_info['tx bytes'];
        $data['rx_bytes']      = $station_info['rx bytes'];
        $data['tx_packets']    = $station_info['tx packets'];
        $data['rx_packets']    = $station_info['rx packets'];
        $data['tx_bitrate']    = $tx_bitrate;
        $data['rx_bitrate']    = $rx_bitrate;
        $data['tx_extra_info'] = $tx_extra;
        $data['rx_extra_info'] = $rx_extra;
        $data['authorized']    = $station_info['authorized'];
        $data['authenticated'] = $station_info['authenticated'];
        $data['tdls_peer']     = $station_info['TDLS peer'];
        $data['preamble']      = $station_info['preamble'];
        $data['tx_failed']     = $station_info['tx failed'];
        $data['tx_failed']     = $station_info['tx failed'];
        $data['inactive_time'] = $incative;
        $data['WMM_WME']       = $station_info['WMM/WME'];
        $data['tx_retries']    = $station_info['tx retries'];
        $data['MFP']           = $station_info['MFP'];
        $data['signal_now']    = $s;
        $data['signal_avg']    = $a;
        return $data;
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
}
