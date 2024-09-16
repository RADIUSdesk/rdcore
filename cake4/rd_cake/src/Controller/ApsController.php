<?php

namespace App\Controller;

use Cake\Core\Configure;
use GeoIp2\Database\Reader;

class ApsController extends AppController {

    public $main_model        = 'Aps';
    public $base     = "Access Providers/Controllers/Aps/";

    protected $ApId     = '';
	protected $Hardware = 'creatcomm_ta8h'; //Some default value
	protected $Power	= '10'; //Some default
    protected $RadioSettings = [];

    protected $special_mac = "30-B5-C2-B3-80-B1"; //hack

    protected $l3_vlans = []; //Layer three VLAN interfaces

    public function initialize():void
    {
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('UnknownAps');
        $this->loadModel('Users');
        $this->loadModel('ApProfileSettings');
        $this->loadModel('ApStations');
        $this->loadModel('ApProfiles');
        $this->loadModel('OpenvpnServers');
        $this->loadModel('ApProfileEntries');
        
        $this->loadModel('Hardwares');

        $this->loadComponent('MacVendors');
        $this->loadComponent('Aa');
        $this->loadComponent('Formatter');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('GridFilter');
           
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'Aps'
        ]);       
        $this->loadComponent('LteHelper');       
    }
      
     public function exportCsv(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_q 		= $this->request->getQuery();
        $cloud_id 	= $req_q['cloud_id'];              
        $query 		= $this->{$this->main_model}->find();           
        //$this->CommonQueryFlat->build_cloud_query($query,$cloud_id);
        
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,[
            'ApProfiles'    => ['Clouds'],
            'ApActions'     => ['sort' => ['ApActions.id' => 'DESC']],
            'OpenvpnServerClients',
            'ApUptmHistories',
            'ApConnectionSettings'
        ],'Aps');
        
            
        $q_r    	= $query->all();

        //Headings
        $heading_line   = [];
            
        if(isset($req_q['columns'])){
            $columns = json_decode($req_q['columns']);
            foreach($columns as $c){
                array_push($heading_line,$c->name);
            }
        }
        
        $data = [
            $heading_line
        ];

        foreach($q_r as $i){
            $columns    = [];
            $csv_line   = [];
            if(isset($req_q['columns'])){
                $columns = json_decode($req_q['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                 
                    if($column_name == 'ap_profile'){
                        array_push($csv_line,$i->{$column_name}->name);  
                    }else{
                        array_push($csv_line,$i->{$column_name});  
                    }
                }
                array_push($data,$csv_line);
            }
        }
         
        $this->setResponse($this->getResponse()->withDownload('AccessPoints.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set([
            'data' => $data
        ]);         
        $this->viewBuilder()->setOption('serialize', true);
                  
    } 
    
    

    //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        
        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
       	$query 	  = $this->{$this->main_model}->find();
       	
       	
       	if((isset($req_q['zero_flag']))&&($req_q['zero_flag']=='true')){      	
       		 $this->set([
		        'items' 	=> [], //$items,
		        'success' 	=> true,
		        'totalCount' => 0,           
        	]);
        	$this->viewBuilder()->setOption('serialize', true);      	
       		return;     	
       	}
       	
       	
       	$this->CommonQueryFlat->build_cloud_query($query,$cloud_id,[
            'ApProfiles'    => ['Clouds'],
            'ApActions'     => ['sort' => ['ApActions.id' => 'DESC']],
            'OpenvpnServerClients',
            'ApUptmHistories',
            'ApConnectionSettings',
            'ApStaticEntryOverrides'
        ],'Aps');

        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        if(null !== $this->request->getQuery('limit')){
            $limit  = $this->request->getQuery('limit');
            $page   = $this->request->getQuery('page');
            $offset = $this->request->getQuery('start');
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items  = [];
        //Create a hardware lookup for proper names of hardware
	    $hardware = $this->_make_hardware_lookup();

        $geo_data   = Configure::read('paths.geo_data');
        $reader     = new Reader($geo_data);

        if($q_r){
            foreach($q_r as $i){
                $mao = $i;
                //----
                //Some defaults:
                $country_code   = '';
                $country_name  = '';
                $city           = '';
                $postal_code    = '';
                $state_name     = '';
                $state_code     = '';
                $entry_point_lookup = [];

             /*   if($i->last_contact_from_ip != ''){
                    try {
                        $location = $reader->city($i->last_contact_from_ip);
                    } catch (\Exception $e) {
                        //Do Nothing
                    }
                }

                if(! empty($location)){
                    if($location->country->isoCode != ''){
                        $country_code = $location->country->isoCode;
                    }
                    if($location->country->name != ''){
                        $country_name = $location->country->name;
                    }
                    if($location->city->name != ''){
                        $city = $location->city->name;
                    }
                    if($location->postal->code != ''){
                        $postal_code = $location->postal->code;
                    }
                    if($location->mostSpecificSubdivision->name != ''){
                        $state_name = $location->mostSpecificSubdivision->name;
                    }
                    if($location->mostSpecificSubdivision->isoCode != ''){
                        $state_code = $location->mostSpecificSubdivision->isoCode;
                    }
                }*/

                //----
                $hw_id 		    = $i->hardware;
                $hw_human       = $hardware["$hw_id"]['name'];  //Human name for Hardware
                $hw_photo       = $hardware["$hw_id"]['photo_file_name'];  //Photo
                $ap_profile_id  = $i->ap_profile->id;

                $l_contact      = $i->last_contact;
                $config_fetched = $i->config_fetched;

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

                if($config_fetched == null){
                    $config_state                       = 'never';
                    $mao->{'config_fetched_human'}  = $config_fetched;
                }else{
                    $last_config = strtotime($config_fetched);
                    if ($last_config+$dead_after <= time()) {
                        $config_state = 'down';
                    } else {
                        $config_state = 'up';
                    }

                    $mao->{'config_fetched_human'} = $this->TimeCalculations->time_elapsed_string($config_fetched);
                }

                $mao->{'config_state'}    = $config_state;
                $ap_id                  = $i->id;
                $modified 	            = $this->_get_timespan(); //Default will be an hour

                $q_e = $this->ApProfileEntries->find()->where(['ApProfileEntries.ap_profile_id' => $ap_profile_id])->all();
                   
                //Build a lookup table for overrides
                $override_table = [];
                foreach($i->ap_static_entry_overrides as $override){               
                    if($override->item == 'ssid'){
                        $override_table[$override->ap_profile_entry_id] =  $override->value;  
                    }               
                }

                $mao->{'override_flag'} = false;
                $array_ssids = [];
                if($q_e){
                    foreach($q_e as $e){
                        $name = $e->name;
                        if(isset($override_table[$e->id])){
                            $name = $override_table[$e->id];
                            $mao->{'override_flag'} = true;
                        }                       
                        array_push($array_ssids, ['name' => $name,'users' => 0]);
                    }
                }
                
                
                //Merge the last command (if present)
                if(count($i->ap_actions) > 0){
                    $last_action = $i->ap_actions[0];
                    //Add it to the list....
                    if(isset($last_action['command'])){
                        $mao->{'last_cmd'} = $last_action['command'];
                    }
                    if(isset($last_action['status'])){
                        $mao->{'last_cmd_status'} = $last_action['status'];
                    }
                }

                //print_r($i);

                // Uptime Visualization
			    $hist_pct       = [];
			    $hist_day       = [];
			    $current_time   = time();
			    // Subtract 24 hours
			    $twentyfour_time = $current_time - (1440*60);
			    $node_up_mins   = 0;
			    $node_dwn_mins  = 0;
			    $subtract_bar   = false;
			    $bar_start      = true;
			    if (count($i->ap_uptm_histories)>0) {
				    $nuh_cnt = count($i->ap_uptm_histories);
				    for ( $nuh = 0; $nuh < $nuh_cnt; $nuh++ ) {
					    $ap_state     =  $i->ap_uptm_histories[$nuh]['ap_state'];
					    $rpt_date       = strtotime($i->ap_uptm_histories[$nuh]['report_datetime']);
					    $state_date     = strtotime($i->ap_uptm_histories[$nuh]['state_datetime']);
					    if ($nuh == 0) { // First one
						    $diff =  ($rpt_date - $twentyfour_time)/60;
					    }
					    if ( ($nuh != 0) && ($nuh == ($nuh_cnt - 1)) ) { // last One
						    $diff = ($current_time - $state_date)/60;
					    } 
					    if ( ($nuh > 0) && ( $nuh < ($nuh_cnt - 1) ) ){ // middle times
						    $diff = ($rpt_date - $state_date)/60;
					    }
					    // Add up totals for pie
					    if ( $ap_state == 1) {
						    $node_up_mins = $node_up_mins + $diff;
					    } else {
						    $node_dwn_mins = $node_dwn_mins + $diff;
					    }
					    // Figure how many 'bars' for diff
					    $diff_rem = ((int) $diff) % 10; // Minimum bar is 20 minutes
					    $diff_slice = $diff / 10;
					    //printf('$ap_state: %d, $diff: %f</br>', $ap_state,$diff);
					    if ( $diff_rem >= 5 ) {
						    $bar_cnt = round($diff_slice, 0, PHP_ROUND_HALF_UP);
					    } else {
						    $bar_cnt = round($diff_slice, 0, PHP_ROUND_HALF_DOWN);
					    }
					    if ($subtract_bar == true) {
						    $bar_cnt = $bar_cnt - 1;
						    $subtract_bar = false;
					    }
					    if ( $bar_cnt == 0 ) {
						    $bar_cnt = 1;
						    $subtract_bar = true;
					    }
					    //array_push($hist_day,$diff);
					    if ($bar_start == true) {
						    array_push($hist_day,0);
						    $bar_start = false;
					    }
					    for ( $dh = 0; $dh < $bar_cnt; $dh++ ) {
						    if ( $ap_state == 0) {
							    array_push($hist_day,-10);
						    } else {
							    array_push($hist_day,10);
						    }
					    }
				    }
				    array_push($hist_day,0);
				    array_push($hist_pct,$node_up_mins);
				    array_push($hist_pct,$node_dwn_mins);
			    } else {
				    if ( $config_state == 'up' ) {
					    array_push($hist_pct,1440);
					    array_push($hist_pct,0);
				    } else {
					    array_push($hist_pct,0);
					    array_push($hist_pct,1440);
				    }
				    $bar_cnt = 142;
				    array_push($hist_day,0);
				    for ($dh = 0; $dh < $bar_cnt; $dh++) {
					    if ( $config_state == 'up' ) {
						    array_push($hist_day,10);
					    } else {
						    array_push($hist_day,-10);
					    }
				    }
				    array_push($hist_day,0);
			    }
			    
			    $mao->{'dayuptimehist'} = $hist_day;
			    $mao->{'uptimhistpct'} 	= $hist_pct;

                $mao->{'update'}     	= true;
                $mao->{'delete'} 	    = true;
                $mao->{'id'}  		= $i->id;
                $mao->{'ap_profile'}  = $i->ap_profile->name;

                $mao->{'last_contact_human'}  = $this->TimeCalculations->time_elapsed_string($i->last_contact);
                $mao->{'state'}               = $state;
                $mao->{'ssids'}               = $array_ssids;
                
                $gateway = 'no';
                if(($i->gateway == 'lan')||($i->gateway == '3g')||($i->gateway == 'wifi')){           
                 $gateway = 'yes';      
                }
                $mao->{'gateway'} = $gateway;
                
                if (array_key_exists($hw_id,$hardware)){             
                    $mao->{'hw_human'}   = $hardware["$hw_id"]['name'];  //Human name for Hardware
                    $mao->{'hw_photo'}   = $hardware["$hw_id"]['photo_file_name'];  //Human name for Hardware
                }

                $mao->{'country_code'}      = $country_code;
                $mao->{'country_name'}        = $country_name;
                $mao->{'city'}                = $city;
                $mao->{'postal_code'}         = $postal_code;
                
                //wbw detail
                if($i->ap_connection_settings){   
                    $mao->{'wbw_active'} = false;
                    $mao->{'qmi_active'} = false;
                    foreach($i->ap_connection_settings as $ncs){
                    
                    	//-wbw-
                        if($ncs->grouping == 'wbw_info'){
                        
                            if($ncs->name == 'signal'){
                                $mao->{'wbw_last_contact_human'}     = $this->TimeCalculations->time_elapsed_string($ncs->modified);
                            }
                            $wbw_name = 'wbw_'.$ncs->name;
                            $mao->{$wbw_name} = $ncs->value;
                        }
                        if($ncs->grouping == 'wbw_setting'){
                            $mao->{'wbw_active'} = true;
                        }
                        
                        //-qmi-signal
		                if($ncs->grouping == 'qmi_info_signal'){                    
		                	if($ncs->name == 'type'){
		                        $mao->{'qmi_last_contact_human'}     = $this->TimeCalculations->time_elapsed_string($ncs->modified);
		                    }                    
		                	$qmi_name = 'qmi_'.$ncs->name;
		                    $mao->{$qmi_name} = $ncs->value;                    
		                }
		                if($ncs->grouping == 'qmi_setting'){
		                    $mao->{'qmi_active'} = true;
		                }
		                
		                //-qmi-system
		                if($ncs->grouping == 'qmi_info_system'){ 
		                	//We only care for mcc and mnc for now                   
		                	if(str_contains($ncs->name ,':mcc')){
		                		$qmi_name = 'qmi_mcc';
		                		$mao->{$qmi_name} = $ncs->value;
		                	}  
		                	if(str_contains($ncs->name ,':mnc')){
		                		$qmi_name = 'qmi_mnc';
		                		$mao->{$qmi_name} = $ncs->value;
		                	}                                      
		                }                                                            
                    }
                    
                    if($mao->{'wbw_signal'}){       
                        if ($i->{'wbw_signal'} < -95) {
                            $signal_bar = 0.01;
                        }
                        if (($i->{'wbw_signal'} >= -95)&($i->{'wbw_signal'} <= -35)) {
                                $p_val = 95-(abs($i->{'wbw_signal'}));
                                $signal_bar = round($p_val/60, 1);
                        }
                        if ($i->{'wbw_signal'} > -35) {
                            $signal_bar = 1;
                        }
                        $mao->{'wbw_signal_bar'} = $signal_bar;
                        
                        $mao->{'wbw_tx_rate'} = round($i->{'wbw_tx_rate'}/1000 ,1);
                    	$mao->{'wbw_rx_rate'} = round($i->{'wbw_rx_rate'}/1000 ,1); 
                    	$mao->{'wbw_expected_throughput'} = round($i->{'wbw_expected_throughput'}/1000 ,1);   
                    } 
                    
                    //-- LTE things --
		            if($mao->{'qmi_rssi'}){ 
				        $this->LteHelper->getMobileProvider($mao); 
				        $this->LteHelper->getRssiGui($mao);
				        $this->LteHelper->getRsrpGui($mao);
				        $this->LteHelper->getRsrqGui($mao);
				        $this->LteHelper->getSnrGui($mao);
				  	}                            
                }

                unset($mao->ap_actions);
                unset($mao->openvpn_server_clients);
                unset($mao->ap_connection_settings); //Remove the list (not needed)

                array_push($items,$mao);
            }
        }

        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            'metaData'		=> [
            	'total'	=> $total
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function getInfo(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];       
        $req_q      = $this->request->getQuery();      
       	$cloud_id   = $req_q['cloud_id'];
        $modified   = $this->_get_timespan(); //Default will be an hour     
        $apId       = $this->request->getQuery('apId');         
        $info       = $this->_getInfo($modified,$apId); 
        $this->set([
            'data'          => $info,
            'success'       => true,
        ]); 
        $this->viewBuilder()->setOption('serialize', true);    
    }

	private function _get_dead_after($ap_profile_id){
		Configure::load('ApProfiles');
		$data 		= Configure::read('common_ap_settings'); //Read the defaults
		$dead_after	= $data['heartbeat_dead_after'];
		$n_s = $this->ApProfileSettings->find()->where(['ApProfileSettings.ap_profile_id' => $ap_profile_id])->first();
        if($n_s){
            $dead_after = $n_s->heartbeat_dead_after;
        }
		return $dead_after;
	}

	private function _make_hardware_lookup(){
	    $hardware = [];
	    $q_e = $this->{'Hardwares'}->find()->where(['Hardwares.for_ap' => true])->all();
	    
	    foreach($q_e as $e){ 
            $id     = $e->fw_id;
            $name   = $e->name;
            $hardware["$id"] = ['name'=>$name,'photo_file_name' =>$e->photo_file_name];  
        }
		return $hardware;
	}

	private function _get_timespan(){

		$hour   = (60*60);
        $day    = $hour*24;
        $week   = $day*7;

		$timespan = 'hour';  //Default
        if(null !== $this->request->getQuery('timespan')){
            $timespan = $this->request->getQuery('timespan');
        }

        if($timespan == 'hour'){
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$hour);
        }

        if($timespan == 'day'){
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$day);
        }

        if($timespan == 'week'){
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$week);
        }
		return $modified;
	}
	
	private function _getInfo($modified,$ap_id){
	
	    $data = [];
	    $ap = $this->Aps->find()
	            ->contain(['ApStaticEntryOverrides'])
	            ->where(['id' => $ap_id])
	            ->first();
	            
	    //---------------------------------------
	    //---- General info on the Access Point--
	    //---------------------------------------
	    if(!$ap){
	        return $data;
	    }

   	    $data['name']       = $ap->name;
   	    $hw_id              = $ap->hardware;
   	    $hardware           = $this->_make_hardware_lookup();
   	    $data['hw_human']   = $hardware["$hw_id"]['name'];  //Human name for Hardware
        $data['hw_photo']   = $hardware["$hw_id"]['photo_file_name'];  //Human name for Hardware
        $data['lan_ip']     = $ap->lan_ip;
        $data['lan_gw']     = $ap->lan_gw;
        $data['lan_proto']  = $ap->lan_proto; 
        $data['last_contact_from_ip']  =  $ap->last_contact_from_ip;
        
        $l_contact          = $ap->last_contact;
        //Get the 'dead_after' value
        $dead_after = $this->_get_dead_after($ap->ap_profile_id);
        if($l_contact == null){
            $data['state'] = 'never';
        }else{
            $last_timestamp = strtotime($l_contact);
            if($last_timestamp+$dead_after <= time()){
                $data['state'] = 'down';
            }else{
                $data['state'] = 'up';
            }
        }           
        $data['last_contact_human']  = $this->TimeCalculations->time_elapsed_string($ap->last_contact); 
        
        $entries_list = [];

        $q_s = $this->ApStations->find()->contain(['ApProfileEntries'])->distinct(['mac_address_id'])
            ->where([
                'ApStations.ap_id'       => $ap_id,
                'ApStations.modified >='   => $modified
            ])
            ->all();
         
                    
        //Build a lookup table for overrides
        $override_table = [];
        foreach($ap->ap_static_entry_overrides as $override){               
            if($override->item == 'ssid'){
                $override_table[$override->ap_profile_entry_id] =  $override->value;  
            }               
        }
        
        $apProfileEntries   = $this->ApProfileEntries->find()->where(['ApProfileEntries.ap_profile_id' => $ap->ap_profile_id])->all();
        $array_ssids        = [];
        
        if($apProfileEntries){
            foreach($apProfileEntries as $e){
                $name = $e->name;
                if(isset($override_table[$e->id])){
                    $name = $override_table[$e->id];
                }
                //--Get the total users and data per SSID---  
                $ud = $this->getEntryUsersAndData($name,$ap_id,$modified,$e->id);            
                $array_ssids[] = $ud;
            }
        }
                        
        $data['ssids'] = $array_ssids;      
        
        //------------------------------        
        //--Get the most recent client--
        //------------------------------
        $apStation = $this->ApStations->find()
            ->where(['ApStations.ap_id' => $ap_id])
            ->order(['ApStations.created' => 'desc'])
            ->select([
                'mac_address_id',
                'mac'   => 'MacAddresses.mac',
                'modified'
            ])
            ->contain(['MacAddresses'])
            ->first();

        $data['newest_vendor']  = "N/A";
        $data['newest_time']    = "N/A";
        $data['newest_station'] = "N/A";
        if($apStation){
            $data['newest_vendor']  = $this->_lookup_vendor($apStation->mac);
            $data['newest_time']    = $this->TimeCalculations->time_elapsed_string($apStation->modified);
            $data['newest_station'] = $apStation->mac;
        }          
        
        //---------------------------
        //----Get data usage---------
        //---------------------------
        $q_t = $this->ApStations->find()->select([
            'tx_bytes' => 'SUM(ApStations.tx_bytes)',
            'rx_bytes' => 'SUM(ApStations.rx_bytes)'
        ])->where([
            'ApStations.ap_id'         => $ap_id,
            'ApStations.modified >='   => $modified
        ])->first();

        $data['data_past_hour'] = '0kb';
        if($q_t){
            $t_bytes    = $q_t->tx_bytes;
            $r_bytes    = $q_t->rx_bytes;
            $data['data_past_hour'] = $this->Formatter->formatted_bytes(($t_bytes+$r_bytes));
        }
        
        return $data;	
	}
	
	 private function _lookup_vendor($mac){
        //Convert the MAC to be in the same format as the file
        $vendor_file        = APP."StaticData".DS."mac_lookup.txt";
        $this->vendor_list  = file($vendor_file);
        $mac    = strtoupper($mac);
        $pieces = explode(":", $mac);

        $big_match      = $pieces[0].":".$pieces[1].":".$pieces[2].":".$pieces[3].":".$pieces[4];
        $small_match    = $pieces[0].":".$pieces[1].":".$pieces[2];
        $lines          = $this->vendor_list;

        $big_match_found = false;
        foreach ($lines as $i) {
            if (preg_match("/^$big_match/", $i)) {
                $big_match_found = true;
                //Transform this line
                $vendor = preg_replace("/$big_match\s?/", "", $i);
                $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                $vendor = rtrim($vendor);
                return $vendor;
            }
        }
       
        if (!$big_match_found) {
            foreach ($lines as $i) {
                if (preg_match("/^$small_match/", $i)) {
                    //Transform this line
                    $vendor = preg_replace("/$small_match\s?/", "", $i);
                    $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                    $vendor = rtrim($vendor);
                    return $vendor;
                }
            }
        }
        $vendor = "Unkown";
    }
       
    private function getEntryUsersAndData($name,$ap_id,$modified,$entry_id){
    
        $q      = $this->ApStations->find();
        $query  = $this->ApStations->find()
            ->contain(['ApProfileEntries'])
            ->where([
                'ApStations.ap_id'        => $ap_id,
                'ApStations.modified >='  => $modified,
                'ApStations.ap_profile_entry_id' => $entry_id
            ])
            ->select([
                'distinct_mac_count' => $q->func()->count('DISTINCT ApStations.mac_address_id'), // Count of distinct MACs
                'total_tx_bytes'     => $q->func()->sum('ApStations.tx_bytes'),                 // Sum of tx_bytes
                'total_rx_bytes'     => $q->func()->sum('ApStations.rx_bytes')                  // Sum of rx_bytes
            ])
            ->first();
        return [
            'name'      => $name,
            'users'     => $query->distinct_mac_count,
            'data'      => $this->Formatter->formatted_bytes($query->total_tx_bytes + $query->total_rx_bytes)  
        ];   
    }

}
