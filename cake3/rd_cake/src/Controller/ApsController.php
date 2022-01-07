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

    public function initialize()
    {
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('UnknownAps');
        $this->loadModel('Users');
        $this->loadModel('Nas');
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
        
        $this->loadComponent('ApHelper');
        
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'Aps'
        ]);
        
    }
    
    public function getConfigForAp(){

        if(null !== $this->request->getQuery('mac')){

            $mac  = $this->request->getQuery('mac');
           // $mac    = 'AC-86-74-10-03-10'; //manual override
           //Make sure the MAC is in captials
            $mac  = strtoupper($mac);

            $q_r = $this->{$this->main_model}->find()->where(['Aps.mac' => $mac])->first();

            if($q_r){
             //   print_r($q_r);
                $ap_profile_id  = $q_r->ap_profile_id;
                $this->ApId     = $q_r->id;
                $this->Mac      = $mac;
				$this->Hardware	= $q_r->hardware;

                $query = $this->{$this->main_model}->find()->contain([
                    'ApProfiles' => [
                        'Aps',
                        'ApProfileEntries',
                        'ApProfileSettings',
                        'ApProfileSpecifics',
                        'ApProfileExits' => [
                            'ApProfileExitApProfileEntries',
                            'ApProfileExitCaptivePortals',
                        ],
                    ]
                ]);
                $ap_profile = $query->where(['ApProfiles.id' => $ap_profile_id,'Aps.mac' =>$mac])->first();

                $ap_profile['ApsDetail'] = $q_r;
               //// print_r($ap_profile);
				//Update the last_contact field
				$data = [];
				$data['id'] 			        = $this->ApId;
				$data['config_fetched']	        = date("Y-m-d H:i:s", time());
				$data['last_contact_from_ip']   = $this->request->clientIp();

				$apEntity = $this->{$this->main_model}->newEntity($data);
                $this->{$this->main_model}->save($apEntity);

                $json = $this->_build_json($ap_profile);
                $this->set([
                    'config_settings'   => $json['config_settings'],
                    'timestamp'         => $json['timestamp'],
                    'success' => true,
                    '_serialize' => ['config_settings','success','timestamp']
                ]);

            }else{
                //Write this to an "unknown nodes" table....
				$ip 					        = $this->request->clientIp();
				$data 					        = [];
				$data['mac'] 			        = $mac;
				$data['last_contact_from_ip']   = $ip;
				$data['last_contact']	        = date("Y-m-d H:i:s", time());

				if(null !== $this->request->getQuery('name')){
				    $data['name'] = $this->request->getQuery('name');
				}

				if(null !== $this->request->getQuery('token_key')){
				    $this->loadModel('FirmwareKeys');

				    $token_key = $this->request->getQuery('token_key');

				    $q_fk = $this->FirmwareKeys->find()->where(['FirmwareKeys.token_key'=> $token_key])->first();
				    if($q_fk){
				        $data['firmware_key_id']   = $q_fk->id;
				    }
				}

				$unk_q_r = $this->UnknownAps->find()->where(['UnknownAps.mac' => $mac])->first();

				$include_new_server  = false;
				$include_new_mode    = false;

				if($unk_q_r){
					$id         = $unk_q_r->id;
                    $new_server = $unk_q_r->new_server;
                    if($new_server != ''){
                        $data['new_server_status'] = 'fetched';
                        $include_new_server = true;
                    }
                    if(($unk_q_r->new_mode !== null)&&($unk_q_r->new_mode_status !== 'fetched')){
                        $data['new_mode_status'] = 'fetched';
                        $include_new_mode = true;
                    } 
                    
					$data['id'] = $id;
                    $unkwnEntity = $this->UnknownAps->newEntity($data);
                    $this->UnknownAps->save($unkwnEntity);
				}else{
					$data['vendor']  = $this->MacVendors->vendorFor($mac);
                    $unkwnEntity = $this->UnknownAps->newEntity($data);
                    $this->UnknownAps->save($unkwnEntity);
				}

                if(($include_new_server)||($include_new_mode)){
		            $fb             = [];
		            $fb['success']  = false;
		            $serialize      = ['success'];
		            
		            if($include_new_server){
		                $fb['new_server'] = $new_server;
		                $fb['new_server_protocol'] = $unk_q_r->new_server_protocol;
		                array_push($serialize,'new_server','new_server_protocol');
		            }
		              
		            if($include_new_mode){
		                $fb['new_mode'] = $unk_q_r->new_mode;
		                array_push($serialize,'new_mode');
		            }
		            $fb['_serialize'] = $serialize;
		        
		            $this->set($fb);
		            
                }else{
                     $this->set([
                        'error' => "MAC Address: ".$mac." not attaced to any AP Profile on the system",
                        'success' => false,
                        '_serialize' => ['error','success']
                    ]);
                }
            }
        }else{
             $this->set([
                'error' => "MAC Address of node not specified",
                'success' => false,
                '_serialize' => ['error','success']
            ]);
        }
    }

     //This we can just accept... i think
    public function redirectUnknown(){
        $data = $this->request->getData();
        $data['new_server_status'] = 'awaiting';
        $unkwnEntity = $this->UnknownAps->newEntity($data);
        if ($this->UnknownAps->save($unkwnEntity)) {
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }else{
            $message = __('Could not update item');
            $this->JsonErrors->entityErros(unkwnEntity,$message);
        }
    }
    
    public function changeApMode(){
        $data = $this->request->getData();
        $data['new_mode_status'] = 'awaiting';
        $unkwnEntity = $this->UnknownAps->newEntity($data);
        if ($this->UnknownAps->save($unkwnEntity)) {
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }else{
            $message = __('Could not update item');
            $this->JsonErrors->entityErros(unkwnEntity,$message);
        }
    }

    //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];

        $query = $this->{$this->main_model}->find();
        
        $this->CommonQuery->build_ap_lists_query($query, $user, [
            'ApProfiles'    => ['Users'],
            'ApActions'     => ['sort' => ['ApActions.id' => 'DESC']],
            'OpenvpnServerClients',
            'ApUptmHistories',
            'ApConnectionSettings'
        ]); //AP QUERY is sort of different in a way
        
        
        //$this->_build_common_query($query, $user);

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

                $owner_id       = $i->ap_profile->user_id;
                $owner_tree     = $this->_find_parents($owner_id);
                $action_flags   = $this->Aa->get_action_flags($owner_id, $user);

                //----
                //Some defaults:
                $country_code   = '';
                $country_name  = '';
                $city           = '';
                $postal_code    = '';
                $state_name     = '';
                $state_code     = '';

                if($i->last_contact_from_ip != ''){
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
                }

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
                    $mao['config_fetched_human']  = $config_fetched;
                }else{
                    $last_config = strtotime($config_fetched);
                    if ($last_config+$dead_after <= time()) {
                        $config_state = 'down';
                    } else {
                        $config_state = 'up';
                    }

                    $mao['config_fetched_human'] = $this->TimeCalculations->time_elapsed_string($config_fetched);
                }

                $mao['config_state']    = $config_state;
                $ap_id                      = $i->id;
                $modified 	                = $this->_get_timespan(); //Default will be an hour

                $q_e = $this->ApProfileEntries->find()->where(['ApProfileEntries.ap_profile_id' => $ap_profile_id])->all();

                $entries_list = [];

                $q_s = $this->ApStations->find()->contain(['ApProfileEntries'])->distinct(['mac'])
                    ->where([
                        'ApStations.ap_id'       => $ap_id,
                        'ApStations.modified >='   => $modified
                    ])
                    ->all();

                $array_ssids = [];
                if($q_e){
                    foreach($q_e as $e){
                        $name = $e->name;
                        array_push($array_ssids, ['name' => $name,'users' => 0]);
                    }
                }

                $ssid_devices = [];
                if($q_s){
                    foreach($q_s as $s){
                        $mac = $s->mac;
                        $name  = $s->ap_profile_entry->name;
                        if(array_key_exists($name,$ssid_devices)){
                            $ssid_devices["$name"] =  $ssid_devices["$name"] + 1;
                        }else{
                            $ssid_devices["$name"] = 1;
                        }
                    }
                }

                if(count($array_ssids) > 0 && count($ssid_devices) > 0){
                    $c = 0;
                    foreach($array_ssids as $ssid){
                        $n = $ssid['name'];
                        if(array_key_exists($n,$ssid_devices)){
                            $users = $ssid_devices["$n"];
                            $array_ssids[$c] = ['name' => $n,'users' => $users];
                        }
                        $c++;
                    }
                }

                //Get the newest visitor
                $q_mac = $this->ApStations->find()->where(['ApStations.ap_id' => $ap_id])->order(['ApStations.created' => 'desc'])->first();

                $newest_vendor  = "N/A";
                $newest_time    = "N/A";
                $newest_station = "N/A";
                if($q_mac){

                    $newest_vendor  = $q_mac->vendor;
                    $newest_time    = $this->TimeCalculations->time_elapsed_string($q_mac->modified);
                    $newest_station = $q_mac->mac;
                }

                //Get data usage
                $q_t = $this->ApStations->find()->select([
                    'tx_bytes' => 'SUM(ApStations.tx_bytes)',
                    'rx_bytes' => 'SUM(ApStations.rx_bytes)'
                ])->where([
                    'ApStations.ap_id'         => $ap_id,
                    'ApStations.modified >='   => $modified
                ])->first();

                $data_past_hour = '0kb';
                if($q_t){
                    $t_bytes    = $q_t->tx_bytes;
                    $r_bytes    = $q_t->rx_bytes;
                    $data_past_hour = $this->Formatter->formatted_bytes(($t_bytes+$r_bytes));
                }

                //Merge the last command (if present)
                if(count($i->ap_actions) > 0){
                    $last_action = $i->ap_actions[0];
                    //Add it to the list....
                    if(isset($last_action['command'])){
                        $mao['last_cmd'] = $last_action['command'];
                    }
                    if(isset($last_action['status'])){
                        $mao['last_cmd_status'] = $last_action['status'];
                    }
                }

/*
                //List any OpenVPN connections
                if(count($i->openvpn_server_clients) > 0){
                    $iopenvpn_list = [];
                    $OpenvpnServerLookup = [];
                    foreach($i->openvpn_server_clients as $vpn){
                        //Do a lookup to save Query time
                        $s_id = $vpn->openvpn_server_id;
                        if(!isset($OpenvpnServerLookup[$s_id])){
                            $q_s                = $this->OpenvpnServers->find()->where(['OpenvpnServers.id' => $vpn->openvpn_server_id])->first();
                            $vpn_name           = $q_s->name;
                            $vpn_description    = $q_s->description;
                            $l_array = ['name' => $vpn_name, 'description' => $vpn_description];
                            $OpenvpnServerLookup[$s_id] = $l_array;
                        }else{
                            $vpn_name           = $OpenvpnServerLookup[$s_id]['name'];
                            $vpn_description    = $OpenvpnServerLookup[$s_id]['description'];
                        }

                        $last_contact_to_server  = $vpn->last_contact_to_server;
                        if($last_contact_to_server != null){
                            $lc_human           = $this->TimeCalculations->time_elapsed_string($last_contact_to_server);
                        }else{
                            $lc_human = 'never';
                        }
                        $vpn_state              = $vpn['state'];
                        array_push($mao['openvpn_list'], [
                            'name'          => $vpn_name,
                            'description'   => $vpn_description,
                            'lc_human'      => $lc_human,
                            'state'         => $vpn_state
                        ]);
                    }
                }*/
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
					    $diff_rem = $diff % 10; // Minimum bar is 20 minutes
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
			    
			    $mao['dayuptimehist'] = $hist_day;
			    $mao['uptimhistpct'] = $hist_pct;

                $mao['update']      = $action_flags['update'];
                $mao['delete'] 	    = $action_flags['delete'];
                $mao['owner'] 	    = $owner_tree;
                $mao['id']  = $i->id;
                $mao['ap_profile']  = $i->ap_profile->name;

                $mao['last_contact_human']  = $this->TimeCalculations->time_elapsed_string($i->last_contact);
                $mao['state']               = $state;
                $mao['data_past_hour']      = $data_past_hour;
                $mao['newest_station']      = $newest_station;
                $mao['newest_time']         = $newest_time;
                $mao['newest_vendor']       = $newest_vendor;
                $mao['ssids']               = $array_ssids;
                
                $gateway = 'no';
                if(($i->gateway == 'lan')||($i->gateway == '3g')||($i->gateway == 'wifi')){           
                 $gateway = 'yes';      
                }
                $mao['gateway'] = $gateway;
                
                if (array_key_exists($hw_id,$hardware)){             
                    $mao['hw_human']   = $hardware["$hw_id"]['name'];  //Human name for Hardware
                    $mao['hw_photo']   = $hardware["$hw_id"]['photo_file_name'];  //Human name for Hardware
                }

                $mao['country_code']        = $country_code;
                $mao['country_name']        = $country_name;
                $mao['city']                = $city;
                $mao['postal_code']         = $postal_code;
                
                //wbw detail
                if($i->ap_connection_settings){   
                    $mao['wbw_active'] = false;
                    foreach($i->ap_connection_settings as $ncs){
                        if($ncs->grouping == 'wbw_info'){
                        
                            if($ncs->name == 'signal'){
                                $mao['wbw_last_contact_human']     = $this->TimeCalculations->time_elapsed_string($ncs->modified);
                            }
                            $wbw_name = 'wbw_'.$ncs->name;
                            $mao[$wbw_name] = $ncs->value;
                        }
                        if($ncs->grouping == 'wbw_setting'){
                            $mao['wbw_active'] = true;
                        }
                    }
                    
                    if($mao['wbw_signal']){       
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
                        $mao['wbw_signal_bar'] = $signal_bar;
                    } 
                    $mao['wbw_tx_rate'] = round($i->{'wbw_tx_rate'}/1000 ,1);
                    $mao['wbw_rx_rate'] = round($i->{'wbw_rx_rate'}/1000 ,1); 
                    $mao['wbw_expected_throughput'] = round($i->{'wbw_expected_throughput'}/1000 ,1);                
                }

                unset($mao->ap_actions);
                unset($mao->openvpn_server_clients);

                array_push($items,$mao);
            }
        }

        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
    }
    
    private function _find_parents($id){

        $q_r        = $this->Users->find('path', ['for' => $id]);
        $path_string= '';
        if($q_r){
            foreach($q_r as $line_num => $i){
                $username       = $i->username;
                if($line_num == 0){
                    $path_string    = $username;
                }else{
                    $path_string    = $path_string.' -> '.$username;
                }
            }
            if($line_num > 0){
                return $username." (".$path_string.")";
            }else{
                return $username;
            }
        }else{
            return __("orphaned");
        }
    }


    //___________________ AP Settings and related functions _________________
    private function  _build_json($ap_profile){

        //Basic structure
        $json = [];
        $json['timestamp']                      = 1; //FIXME replace with the last change timestamp
        $json['config_settings']                = [];
        $json['config_settings']['wireless']    = [];
        $json['config_settings']['network']     = [];
		$json['config_settings']['system']		= [];

        //============ Network ================
        $net_return         = $this->_build_network($ap_profile);
        $json_network       = $net_return[0];
        $json['config_settings']['network'] = $json_network;

        //=========== Wireless ===================
        $entry_data         = $net_return[1];
        $json_wireless      = $this->_build_wireless($ap_profile,$entry_data);
        $json['config_settings']['wireless'] = $json_wireless;

        //========== Gateway  ======
        $json['config_settings']['gateways']        = $net_return[2]; //Gateways
        $json['config_settings']['captive_portals'] = $net_return[3]; //Captive portals

        $openvpn_bridges                            = $this->_build_openvpn_bridges($net_return[4]);
        $json['config_settings']['openvpn_bridges'] = $openvpn_bridges; //Openvpn Bridges

		//======== System related settings ======
		$system_data 		= $this->_build_system($ap_profile);
		$json['config_settings']['system'] = $system_data;

        return $json;
    }

     private function _build_openvpn_bridges($openvpn_list){
        $openvpn_bridges = [];
        foreach($openvpn_list as $o){

            $br                 = [];
            $br['interface']    = $o['interface'];
            $br['up']           = "ap_".$this->Mac."\n".md5("ap_".$this->Mac)."\n";
            $br['ca']           = $o['ca_crt'];
            $br['vpn_gateway_address'] = $o['vpn_gateway_address'];
            $br['vpn_client_id'] = $o['vpn_client_id'];

            Configure::load('OpenvpnClientPresets');
            $config_file    = Configure::read('OpenvpnClientPresets.'.$o['config_preset']); //Read the defaults

            $config_file['remote']  = $o['ip_address'].' '.$o['port'];
            $config_file['up']      = '"/etc/openvpn/up.sh br-'.$o['interface'].'"';
            $config_file['proto']   = $o['protocol'];
            $config_file['ca']      = '/etc/openvpn/'.$o['interface'].'_ca.crt';
            $config_file['auth_user_pass'] = '/etc/openvpn/'.$o['interface'].'_up';
            $br['config_file']      = $config_file;
            array_push($openvpn_bridges,$br);
        }
        return $openvpn_bridges;
    }

    private function _build_system($ap_profile){
        //print_r($ap_profile);
		//Get the root password
		//print_r($ap_profile);
		$default_data = $this->_getDefaultSettings();
		$ss = [];
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->password_hash != ''){
            $ss['password_hash'] 		= $ap_profile->ap_profile->ap_profile_setting->password_hash;
            $ss['heartbeat_dead_after']	= $ap_profile->ap_profile->ap_profile_setting->heartbeat_dead_after;
        }else{
            $ss['password_hash'] 		= $default_data['password_hash'];
            $ss['heartbeat_dead_after']	= $default_data['heartbeat_dead_after'];
        }

        //Timezone
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->tz_value != ''){
            $ss['timezone']             = $ap_profile->ap_profile->ap_profile_setting->tz_value;
        } else {
            $ss['timezone']             = $default_data['tz_value'];
        }

	    //Syslog Server 1
	    if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->syslog1_ip != ''){
		    $ss['syslog1_ip'] = $ap_profile->ap_profile->ap_profile_setting->syslog1_ip;
                    $ss['syslog1_port'] = $ap_profile->ap_profile->ap_profile_setting->syslog1_port;
	    }else{
		    $ss['syslog1_ip'] = isset($default_data['syslog1_ip']) ? $default_data['syslog1_ip'] : '';
		    $ss['syslog1_port'] = isset($default_data['syslog1_port']) ? $default_data['syslog1_port'] : '';
	    }

	    //Syslog Server 2
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->syslog2_ip != ''){
                $ss['syslog2_ip'] =$ap_profile->ap_profile->ap_profile_setting->syslog2_ip;
                $ss['syslog2_port'] = $ap_profile->ap_profile->ap_profile_setting->syslog2_port;
        }else{
            $ss['syslog2_ip'] = isset($default_data['syslog2_ip']) ? $default_data['syslog2_ip'] : '';
            $ss['syslog2_port'] = isset($default_data['syslog2_port']) ? $default_data['syslog2_port'] : '';
        }

	    //Syslog Server 3
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->syslog3_ip != ''){
                $ss['syslog3_ip'] = $ap_profile->ap_profile->ap_profile_setting->syslog3_ip;
                $ss['syslog3_port'] = $ap_profile->ap_profile->ap_profile_setting->syslog3_port;
        }else{
            $ss['syslog3_ip'] = isset($default_data['syslog3_ip']) ? $default_data['syslog3_ip'] : '';
            $ss['syslog3_port'] = isset($default_data['syslog3_port']) ? $default_data['syslog3_port'] : '';
        }

        //Gateway specifics
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->gw_dhcp_timeout != ''){
            $ss['gw_dhcp_timeout']          = $ap_profile->ap_profile->ap_profile_setting->gw_dhcp_timeout;
            $ss['gw_use_previous']          = $ap_profile->ap_profile->ap_profile_setting->gw_use_previous;
            $ss['gw_auto_reboot']           = $ap_profile->ap_profile->ap_profile_setting->gw_auto_reboot;
            $ss['gw_auto_reboot_time']      = $ap_profile->ap_profile->ap_profile_setting->gw_auto_reboot_time;
        } else{
            $ss['gw_dhcp_timeout']          = $default_data['gw_dhcp_timeout'];
            $ss['gw_use_previous']          = $default_data['gw_use_previous'];
            $ss['gw_auto_reboot']           = $default_data['gw_auto_reboot'];
            $ss['gw_auto_reboot_time']      = $default_data['gw_auto_reboot_time'];
        }

        $ss['hostname'] = $ap_profile->name;

		return $ss;
	}
	
	 private function _getDefaultSettings(){
    
        Configure::load('ApProfiles'); 
        $data  = Configure::read('common_ap_settings'); //Read the defaults

        $this->loadModel('UserSettings');   
        $q_r = $this->{'UserSettings'}->find()->where(['user_id' => -1])->all();
        if($q_r){
            foreach($q_r as $s){
                //ALL Captive Portal Related default settings will be 'cp_<whatever>'
                if(preg_match('/^cp_/',$s->name)){
                    $name           = preg_replace('/^cp_/', '', $s->name);
                    $data[$name]    = $s->value;     
                }
                if($s->name == 'password'){
                    $data[]         = $s->value;
                    $data['password_hash']  = $this->_make_linux_password($s->value);   
                }
                
                if($s->name == 'country'){
                    $data[$s->name]  = $s->value;
                } 
                if($s->name == 'heartbeat_dead_after'){
                    $data[$s->name]  = $s->value;
                } 
                if($s->name == 'timezone'){
                    $data[$s->name]  = $s->value;
                    $ent_tz = $this->{'Timezones'}->find()->where(['Timezones.id' => $s->value])->first();
                    if($ent_tz){
                        $data['tz_name'] = $ent_tz->name;
                        $data['tz_value']= $ent_tz->value;
                    }
                } 
            }
        }
        return $data;
    }

    private function _build_network($ap_profile){

        $network 				= [];
        $nat_data				= [];
        $captive_portal_data 	= [];
        $openvpn_bridge_data    = [];
		$include_lan_dhcp 		= true;
		
        //-> loopback if
        array_push( $network,
            [
                "interface"    => "loopback",
                "options"   => [
                    "ifname"        => "lo",
                    "proto"         => "static",
                    "ipaddr"        => "127.0.0.1",
                    "netmask"       => "255.0.0.0"
               ]
            ]);

        $br_int = $this->_wan_for($this->Hardware);

		if($include_lan_dhcp){
		    if($this->request->getQuery('zzversion') !== null){ //For now we just check for its presence
		
		        array_push( $network,
		            [
		                "interface"    => "lan",
		                "options"   => [
		                     "ipv6"          => '1',
		                    "ifname"        => "$br_int", 
		                    "type"          => "bridge"
		               ]
		       	]);
		       	  	
		       	array_push( $network,
		            [
		                "interface"    => "lan_4",
		                "options"   => [
		                    "ifname"        => "@lan",
		                    "proto"         => "dhcp"

		               ]
		       	]);
		       	
		       	array_push( $network,
		            [
		                "interface"    => "lan_6",
		                "options"   => [
		                    "ifname"        => "@lan",
		                    "proto"         => 'dhcpv6',
                            "ifname"        => '@lan',
                            "reqaddress"    => 'try',
                            "reqprefix"     => 'auto'

		               ]
		       	]);
		       		
		    }else{
		        array_push( $network,
		            [
		                "interface"    => "lan",
		                "options"   => [
		                    "ifname"        => "$br_int",
		                    "type"          => "bridge",
		                    "proto"         => "dhcp"
		               ]
		       	]);
		    }    	
		}

        //Now we will loop all the defined exits **that has entries assigned** to them and add them as bridges as we loop.
        //The members of these bridges will be determined by which entries are assigned to them and specified
        //in the wireless configuration file

        $start_number = 0;

        //We create a data structure which will be used to add the entry points and bridge them with
        //The correct network defined here
        $entry_point_data = [];

       /// print_r($ap_profile['ApProfileExit']);

        //Add the auto-attach entry points
        foreach($ap_profile->ap_profile->ap_profile_exits as $ap_profile_e){

            $has_entries_attached   = false;
            $if_name                = 'ex_'.$this->_number_to_word($start_number);
            $exit_id                = $ap_profile_e->id;
            $type                   = $ap_profile_e->type;
            $vlan                   = $ap_profile_e->vlan;

            //This is used to fetch info eventually about the entry points
            if(count($ap_profile_e->ap_profile_exit_ap_profile_entries) > 0){
                $has_entries_attached = true;
                foreach($ap_profile_e->ap_profile_exit_ap_profile_entries as $entry){
                    if($type == 'bridge'){ //The gateway needs the entry points to be bridged to the LAN
                        array_push($entry_point_data, ['network' => 'lan','entry_id' => $entry->ap_profile_entry_id]);
                    }else{
                        array_push($entry_point_data, ['network' => $if_name,'entry_id' => $entry->ap_profile_entry_id]);
                    }
                }
            }

            if($type == 'tagged_bridge_l3'){
                $has_entries_attached = true;
            }

            if($has_entries_attached == true){

            //print_r($ap_profile_e);

                $captive_portal_count = 1;

                if($type == 'tagged_bridge'){

				    $interfaces =  $br_int.'.'.$vlan; //only one

                    array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                "ifname"    => $interfaces,
                                "type"      => "bridge"
                        ]]
                    );
                    $start_number++;
                    continue;   //We don't care about the other if's
                }

                if($type == 'nat'){
                    $interfaces =  "nat.".$start_number;
                    array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                "ifname"    => $interfaces,
                                "type"      => "bridge",
                                'ipaddr'    =>  "10.200.".(100+$start_number).".1",
                                'netmask'   =>  "255.255.255.0",
                                'proto'     => 'static'
                        ]]
                    );

                    //Push the nat data
                    array_push($nat_data,$if_name);
                    $start_number++;
                    continue; //We dont care about the other if's
                }

                if($type=='bridge'){
                /*
                    $current_interfaces = $network[1]['options']['ifname'];
                    $interfaces =  "bridge0.".$start_number;
                    $network[1]['options']['ifname'] = $current_interfaces." ".$interfaces;

                    $start_number++;
                   */
                    continue; //We dont care about the other if's
                }

                if($type == 'captive_portal'){

                    $eth_one_bridge = false;
                    foreach($ap_profile_e->ap_profile_exit_ap_profile_entries as $cp_ent){
                        if($cp_ent->ap_profile_entry_id == 0){
                            $eth_one_bridge = true;
                            break;
                        }
                    }

                    //---WIP Start---
                    if($ap_profile_e->ap_profile_exit_captive_portal->dnsdesk == true){
                        $if_ip      = "10.$captive_portal_count.0.2";
                    }
                    $captive_portal_count++; //Up it for the next one
                    //---WIP END---

                    $a = $ap_profile_e->ap_profile_exit_captive_portal;
                    $a['hslan_if']      = 'br-'.$if_name;
                    $a['network']       = $if_name;

                    //---WIP Start---
                    if($ap_profile_e->ap_profile_exit_captive_portal->dnsdesk == true){
                        $a['dns1']      = $if_ip;
                        //Also sent along the upstream DNS Server to use
                        $a['upstream_dns1'] = Configure::read('dnsfilter.dns1'); //Read the defaults
                        $a['upstream_dns2'] = Configure::read('dnsfilter.dns2'); //Read the defaults
                    }
                    //---WIP END---


                    //Generate the NAS ID                  
                    $ap_profile_name    = preg_replace('/\s+/', '_', $ap_profile->ap_profile->name);
                    $ap_dev_name        = preg_replace('/\s+/', '_', $ap_profile->name);
                    $a['radius_nasid']  = $ap_profile_name.'_'.$ap_dev_name.'_cp_'.$ap_profile_e->ap_profile_exit_captive_portal->ap_profile_exit_id;
                    array_push($captive_portal_data,$a);

                    if($ap_profile_e->ap_profile_exit_captive_portal->dnsdesk == true){
                        $options_cp = [
                            "type"      => "bridge",
                            "proto"     => "none",
                            "ipaddr"    => "$if_ip",
                            "netmask"   => "255.255.255.0",
                            "proto"     => "static"
                        ];
                    }else{
                        $options_cp = [
                             "type"      => "bridge",
                             "proto"     => "none"
                        ];
                    }

                    if($eth_one_bridge == true){
                        $options_cp["ifname"] = $this->_lan_for($this->Hardware);
                    }

                    array_push($network,["interface" => "$if_name","options"=> $options_cp]);
                    $start_number++;
                    continue; //We dont care about the other if's
                }


                //___ OpenVPN Bride ________
                if($type == 'openvpn_bridge'){
                    $this->loadModel('OpenvpnServerClients');

                    $q_c = $this->OpenvpnServerClients->find()->where([
                        'OpenvpnServerClients.ap_profile_id'         => $ap_profile_e->ap_profile_id,
                        'OpenvpnServerClients.ap_profile_exit_id'    => $ap_profile_e->id,
                        'OpenvpnServerClients.ap_id'                 => $this->ApId,
                    ])->first();

                    if($q_c){
                        $a              = $q_c;
                        $a['bridge']    = 'br-'.$if_name;
                        $a['interface'] = $if_name;

                        //Get the info for the OpenvpnServer
                        $q_s = $this->OpenvpnServers->find()->where(['OpenvpnServers.id' => $q_c->openvpn_server_id])->first();

                        $a['protocol']  = $q_s->protocol;
                        $a['ip_address']= $q_s->ip_address;
                        $a['port']      = $q_s->port;
                        $a['vpn_mask']  = $q_s->vpn_mask;
                        $a['ca_crt']    = $q_s->ca_crt;

                        $a['config_preset']         = $q_s->config_preset;
                        $a['vpn_gateway_address']   = $q_s->vpn_gateway_address;
                        $a['vpn_client_id']         = $q_c->id;

                        array_push($openvpn_bridge_data,$a);

                        array_push($network,
                            [
                                "interface"    => "$if_name",
                                "options"   => [
                                    "type"      => "bridge",
                                    'ipaddr'    => $q_c->ip_address,
                                    'netmask'   => $a['vpn_mask'],
                                    'proto'     => 'static'

                                ]]
                        );
                        $start_number++;
                        continue; //We dont care about the other if's
                    }
                }


                 //____ LAYER 3 Tagged Bridge ____
                if($type == 'tagged_bridge_l3'){

                    $interfaces     = $br_int.'.'.$ap_profile_e['vlan'];  //We only do eth0
                    $exit_point_id  = $ap_profile_e['id'];

                    $this->l3_vlans[$exit_point_id] = $if_name;
                    if($ap_profile_e['proto'] == 'dhcp'){
                         array_push($network,
                            [
                                "interface"    => "$if_name",
                                "options"   => [
                                    'ifname'    => $br_int,
                                    'type'      => '8021q',
                                    'proto'     => 'dhcp',
                                    'vid'       => $ap_profile_e['vlan']
                            ]]
                        );
                    }
                    if($ap_profile_e['proto'] == 'static'){
                        $options = [
                            'ifname'    => $br_int,
                            'type'      => '8021q',
                            'proto'     => $ap_profile_e['proto'],
                            'ipaddr'    => $ap_profile_e['ipaddr'],
                            'netmask'   => $ap_profile_e['netmask'],
                            'gateway'   => $ap_profile_e['gateway'],
                            'vid'       => $ap_profile_e['vlan']
                        ];
                        $lists = [];
                        if($ap_profile_e['dns_2'] != ''){
                            array_push($lists,['dns'=> $ap_profile_e['dns_2']]);
                        }
                        if($ap_profile_e['dns_1'] != ''){
                            array_push($lists,['dns'=> $ap_profile_e['dns_1']]);
                        }

                        array_push($network,
                            [
                                "interface" => "$if_name",
                                "options"   => $options,
                                "lists"     => $lists
                        ]);
                    }

                }

            }
        }

        //Captive Portal layer2 VLAN upstream enhancement
        $cp_counter = 0;
        foreach($captive_portal_data as $cpd){
            if($cpd['ap_profile_exit_upstream_id'] == 0){
                $captive_portal_data[$cp_counter]['hswan_if'] = 'br-lan';
            }else{
                $captive_portal_data[$cp_counter]['hswan_if'] = $this->l3_vlans[$cpd['ap_profile_exit_upstream_id']];
            }
            $cp_counter++;
        }
        return [$network,$entry_point_data,$nat_data,$captive_portal_data,$openvpn_bridge_data];
    }

    private function _build_wireless($ap_profile,$entry_point_data){

        //print_r($entry_point_data);

        //First get the WiFi settings wether default or specific
        $this->_setWiFiSettings();
        
		//Determine the radio count and configure accordingly
        $radios = 0;
	    $q_e = $this->{'Hardwares'}->find()
		    ->where(['Hardwares.fw_id' => $this->Hardware,'Hardwares.for_ap' => true])
		    ->first();
	    if($q_e){
	        $radios = $q_e->radio_count;
	    }
	    
        $wireless = $this->_build_radio_wireless($ap_profile,$entry_point_data,$radios);
		return $wireless;
    }
    
     private function _setWiFiSettings(){
    
        //Get the basics regardless and then do overrides
        $radio_fields = [
            'disabled','hwmode','htmode','txpower','include_beacon_int','beacon_int',
            'include_distance','distance','ht_capab'
        ];
        $model  = $this->Hardware;
        $q_e    = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
        if($q_e){
            foreach($q_e->hardware_radios as $hr){    
                $radio_number   = $hr->radio_number;
                $prefix = 'radio'.$radio_number.'_';
                $ht_capab = [];
                foreach($radio_fields as $fr){ 
                    if($fr == 'hwmode'){
                        if($hr->{"$fr"} == '11ac'){
                            $this->RadioSettings[$radio_number]["$prefix$fr"] = '11a';
                        }else{
                            $this->RadioSettings[$radio_number]["$prefix$fr"] = $hr->{"$fr"};
                        }                                                      
                    }elseif($fr == 'ht_capab'){
                        if($hr->{"$fr"} !== ''){
                            $pieces = explode("\n", $hr->{"$fr"});
                            if(count($pieces)>0){
                                foreach($pieces as $p){
                                    array_push($ht_capab,$p);
                                }
                            }else{
                                array_push($ht_capab,$hr->{"$fr"}); //Single value
                            }
                        }
                    }else{
                        $this->RadioSettings[$radio_number]["$prefix$fr"] = $hr->{"$fr"};
                    }
                }
                $this->RadioSettings[$radio_number]["$prefix".'ht_capab'] = $ht_capab;
            }
        }
          
        $q_r = $this->{$this->main_model}->find()->contain(['ApWifiSettings'])->where(['Aps.id' => $this->ApId])->first();
        //There seems to be specific settings for the node
        if($q_r){ 
            if(count($q_r->ap_wifi_settings) > 0){
                foreach($q_r->ap_wifi_settings as $i){
                    $name  = $i['name'];
                    $value = $i['value'];
                    //Small fix to make boolean from string....
                    if($value == 'false'){
                        $value = false;
                    }
                    if($value == 'true'){
                        $value = true;
                    }
                    if($value == 'on'){
                        $value = true;
                    }
                    if(preg_match('/^radio0_/',$name)){
                        $radio_number = 0;
                    }
                    if(preg_match('/^radio1_/',$name)){
                        $radio_number = 1;
                    }
                    if(preg_match('/^radio2_/',$name)){
                        $radio_number = 2;
                    }
                    $this->RadioSettings[$radio_number][$name] = $value;
                }
            }
        }
    }
    
    private function _build_radio_wireless($ap_profile,$entry_point_data,$radio_count){
    
        $wireless   = [];
        
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->country != ''){
            $country  = $ap_profile->ap_profile->ap_profile_setting->country;
        }else{
            Configure::load('ApProfiles');
            $data       = Configure::read('common_ap_settings'); //Read the defaults
            $country    = $data['country'];
        }
        
        for ($x = 0; $x < $radio_count; $x++) {
        
            if($this->RadioSettings[$x]['radio'.$x.'_hwmode'] == '11g'){
                $channel = intval($this->RadioSettings[$x]['radio'.$x.'_channel_two']);
                if($channel == 0){
		            $channel = 'auto';
		        }	
            }
                
            if(($this->RadioSettings[$x]['radio'.$x.'_hwmode'] == '11a')||($this->RadioSettings[$x]['radio'.$x.'_hwmode'] == '11a_ac')){
                $channel    = intval($this->RadioSettings[$x]['radio'.$x.'_channel_five']);
                if($channel == 0){
		            $channel = 'auto';
		        }	
            }
                
            $hwmode = $this->RadioSettings[$x]['radio'.$x.'_hwmode'];
            
            if($this->RadioSettings[$x]['radio'.$x.'_hwmode'] == '11a_ac'){    
                $hwmode  = '11a';
            }
            
            $radio_capab = [];
            //Somehow the read thing reads double..
            $allready_there = [];
            foreach($this->RadioSettings[$x]['radio'.$x.'_ht_capab'] as $c){
                if(!in_array($c,$allready_there)){
                    array_push($allready_there,$c);
                    array_push($radio_capab, ['name'    => 'ht_capab', 'value'  => $c]);
                }
            }
            
            
            $options_array = [
                'channel'       => $channel,
                'disabled'      => intval($this->RadioSettings[$x]['radio'.$x.'_disabled']),
                'hwmode'        => $hwmode,
                'htmode'        => $this->RadioSettings[$x]['radio'.$x.'_htmode'],
                'country'       => $country,
                'txpower'       => intval($this->RadioSettings[$x]['radio'.$x.'_txpower'])
            ];
            

            //For now we have these binary options that we obity if not specified
            if(isset($this->RadioSettings[$x]['radio'.$x.'_include_distance'])){
                if($this->RadioSettings[$x]['radio'.$x.'_include_distance']){
                    $options_array['distance'] = intval($this->RadioSettings[$x]['radio'.$x.'_distance']);
                }
            }
            
            if(isset($this->RadioSettings[$x]['radio'.$x.'_include_beacon_int'])){
                if($this->RadioSettings[$x]['radio'.$x.'_include_beacon_int']){
                    $options_array['beacon_int'] = intval($this->RadioSettings[$x]['radio'.$x.'_beacon_int']);
                }
            }
            
            if(isset($this->RadioSettings[$x]['radio'.$x.'_noscan'])){
                if($this->RadioSettings[$x]['radio'.$x.'_noscan']){
                    $options_array['noscan'] = intval($this->RadioSettings[$x]['radio'.$x.'_noscan']);
                }
            }
             
            array_push( $wireless,
                [
                    "wifi-device"   => "radio".$x,
                    "options"       => $options_array,
                    'lists'         => $radio_capab
          	]);
        }
               
        $start_number = 0;

		//____ ENTRY POINTS ____
        //Check if we need to add this wireless VAP
        foreach($ap_profile->ap_profile->ap_profile_entries as $ap_profile_e){
            $entry_id   = $ap_profile_e->id;
            //Check if it is assigned to an exit point
            foreach($entry_point_data as $epd){
                if($epd['entry_id'] == $entry_id){ //We found our man :-) This means the Entry has been 'connected' to an exit point
      
                    //Loop through all the radios
                    for ($y = 0; $y < $radio_count; $y++){
                    
                        $hwmode     = $wireless[$y]['options']['hwmode'];
                        $channel    = $wireless[$y]['options']['channel'];
                        $band       = 'two'; //Default is 2.4G
                        if($hwmode == '11a'){
                            $band = 'five'; 
                        }
                        
                        if(($ap_profile_e->frequency_band == 'five_upper')||($ap_profile_e->frequency_band == 'five_lower')){      
                            if($band == 'five'){ //This is actually a 5G radio now see if we need t o foce a match based on the channel
                                if(($channel <= 48)&&($ap_profile_e->frequency_band == 'five_lower')){   
                                    $band = 'five_lower'; //We can enable it based on the channel setting of the radio
                                }
                                 
                                if(($channel >= 149)&&($ap_profile_e->frequency_band == 'five_upper')){   
                                    $band = 'five_upper'; //We can enable it based on the channel setting of the radio
                                } 
                            }  
                        }
                        
                        
                        if(($ap_profile_e->frequency_band == 'both')||($ap_profile_e->frequency_band == $band)){
                            $if_name    = $this->_number_to_word($start_number);
                            $base_array = [
                                "device"        => "radio".$y,
                                "ifname"        => "$if_name"."0",
                                "mode"          => "ap",
                                "network"       => $epd['network'],
                                "encryption"    => $ap_profile_e->encryption,
                                "ssid"          => $ap_profile_e->name,
                                "key"           => $ap_profile_e->special_key,
                                "hidden"        => $ap_profile_e->hidden,
                                "isolate"       => $ap_profile_e->isolate,
                                "auth_server"   => $ap_profile_e->auth_server,
                                "auth_secret"   => $ap_profile_e->auth_secret,
                                "disabled"      => $this->RadioSettings[$y]['radio'.$y.'_disabled']
                            ];
                            
                            if($ap_profile_e->chk_maxassoc){
                                $base_array['maxassoc'] = $ap_profile_e->maxassoc;
                            }

                            if($ap_profile_e->encryption == 'wpa2'){
                                 $base_array['nasid'] = $ap_profile_e->nasid;
                            }

                            if($ap_profile_e->accounting){
                                $base_array['acct_server']	= $ap_profile_e->auth_server;
                                $base_array['acct_secret']	= $ap_profile_e->auth_secret;
                            }

                            if($ap_profile_e->macfilter != 'disable'){
                                $this->loadModel('Devices');

                                $base_array['macfilter']    = $ap_profile_e->macfilter;
                                //Replace later
                                $pu_id      = $ap_profile_e->permanent_user_id;
                                $q_d        = $this->Devices->find()->where(['Devices.permanent_user_id' => $pu_id])->all();
                                $mac_list   = [];
                                foreach($q_d as $device){
                                    $mac = $device->name;
                                    $mac = str_replace('-',':',$mac);
                                    array_push($mac_list,$mac);
                                }
                                if(count($mac_list)>0){
                                    $base_array['maclist'] = implode(" ",$mac_list);
                                }
                            }

                            array_push( $wireless,
                                [
                                    "wifi-iface"=> "$if_name",
                                    "options"   => $base_array
                                ]
                            );
                            $start_number++;
                        }
                    }
                    break; //No need to loop further
                }    
            }
        }            	
        return $wireless;  
    }
    

    private function _number_to_word($number) {
        $dictionary  = [
            0                   => 'zero',
            1                   => 'one',
            2                   => 'two',
            3                   => 'three',
            4                   => 'four',
            5                   => 'five',
            6                   => 'six',
            7                   => 'seven',
            8                   => 'eight',
            9                   => 'nine',
            10                  => 'ten',
            11                  => 'eleven',
            12                  => 'twelve',
            13                  => 'thirteen',
            14                  => 'fourteen',
            15                  => 'fifteen',
            16                  => 'sixteen',
            17                  => 'seventeen',
            18                  => 'eighteen',
            19                  => 'nineteen',
            20                  => 'twenty'
        ];
        return($dictionary[$number]);
    }

    private function _wan_for($hw){
		$return_val = 'eth0'; //some default	
		$q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hw, 'Hardwares.for_ap' => true])->first();
		if($q_e){
		    $return_val = $q_e->wan;   
		}
		return $return_val;
	}
	
	private function _lan_for($hw){
	    $return_val = 'eth1'; //some default	
		$q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hw, 'Hardwares.for_ap' => true])->first();
		if($q_e){
		    $return_val = $q_e->lan;   
		}
		return $return_val;
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

}
