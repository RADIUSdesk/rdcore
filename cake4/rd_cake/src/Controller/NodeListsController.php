<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Hash;
use GeoIp2\Database\Reader;

use Cake\ORM\Query;
use Cake\Database\Expression\QueryExpression;

class NodeListsController extends AppController{
  
    public $base         	= "Access Providers/Controllers/NodeLists/";   
    protected $owner_tree   = [];
    protected $main_model   = 'Nodes';
    protected $dead_after   = 600; //Default
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Users');
        $this->loadModel('Meshes'); 
        $this->loadModel('Nodes'); 
        $this->loadModel('NodeSettings');
        $this->loadModel('NodeNeighbors');
        $this->loadModel('NodeUptmHistories');
        $this->loadModel('OpenvpnServers');
		$this->loadModel('OpenvpnServerClients');
		$this->loadModel('Timezones');
		$this->loadModel('Hardwares');
		
		$this->loadModel('MeshExitCaptivePortals');
        $this->loadModel('MeshExits');   
		
        //$this->loadModel('OpenvpnClients');
        $this->loadComponent('Aa');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'Nodes'
        ]);
                
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');      
        $this->loadComponent('LteHelper');
               
    }
    
     public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        Configure::load('MESHdesk'); 
        $m_providers   = Configure::read('MESHdesk.mobile_providers'); //Read the defaults
		
		$geo_data       = Configure::read('paths.geo_data');
        $reader         = new Reader($geo_data);
        $user_id        = $user['id'];
		$mesh_lookup    = [];
		$query          = $this->{$this->main_model}->find();
		$req_q    		= $this->request->getQuery();      
       	$cloud_id 		= $req_q['cloud_id'];
       	      	       	
       	if((isset($req_q['zero_flag']))&&($req_q['zero_flag']=='true')){      	
       		 $this->set([
		        'items' 	=> [], //$items,
		        'success' 	=> true,
		        'totalCount' => 0,           
        	]);
        	$this->viewBuilder()->setOption('serialize', true);      	
       		return;     	
       	}
						
        $this->CommonQueryFlat->build_cloud_query($query, $cloud_id, ['Meshes','NodeUptmHistories','NodeConnectionSettings']); //AP QUERY is sort of different in a way
                

        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
        if (isset($req_q['limit'])) {
            $limit 	= $req_q['limit'];
            $page 	= $req_q['page'];
            $offset = $req_q['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);
        
        $total = $query->count();
        $q_r = $query->all();
        		
	    $hardware = $this->_make_hardware_lookup();

        $items = [];

        foreach ($q_r as $i) {
			
			// Get GeoCode for ip
			try {
                $record         = $reader->city($i->last_contact_from_ip);
            } catch (\Exception $e) {
                //Do Nothing
            }
            
            
            $country_code   = '';
            $country_name   = '';
            $city           = '';
            $postal_code    = '';
            $state_name     = '';
            $state_code     = '';
                 
            if(!empty($record)){
                $city           = $record->city->name;
                $postal_code    = $record->postal->code;
                $country_name   = $record->country->name;
                $country_code   = $record->country->isoCode;
                $state_name     = $record->mostSpecificSubdivision->name;
                $state_code     = $record->mostSpecificSubdivision->isoCode;
            }
            
            //wbw detail
            if($i->node_connection_settings){   
                $i->{'wbw_active'} = false;
                $i->{'qmi_active'} = false;
                foreach($i->node_connection_settings as $ncs){
                	//-wbw-
                    if($ncs->grouping == 'wbw_info'){                    
                        if($ncs->name == 'signal'){
                            $i->wbw_last_contact_human     = $this->TimeCalculations->time_elapsed_string($ncs->modified);
                        }
                        $wbw_name = 'wbw_'.$ncs->name;
                        $i->{$wbw_name} = $ncs->value;
                    }
                    if($ncs->grouping == 'wbw_setting'){
                        $i->{'wbw_active'} = true;
                    }
                    
                    //-qmi-signal
                    if($ncs->grouping == 'qmi_info_signal'){                    
                    	if($ncs->name == 'type'){
                            $i->qmi_last_contact_human     = $this->TimeCalculations->time_elapsed_string($ncs->modified);
                        }                    
                    	$qmi_name = 'qmi_'.$ncs->name;
                        $i->{$qmi_name} = $ncs->value;                    
                    }
                    if($ncs->grouping == 'qmi_setting'){
                        $i->{'qmi_active'} = true;
                    }
                    
                    //-qmi-system
                    if($ncs->grouping == 'qmi_info_system'){ 
                    	//We only care for mcc and mnc for now                   
                    	if(str_contains($ncs->name ,':mcc')){
                    		$qmi_name = 'qmi_mcc';
                    		$i->{$qmi_name} = $ncs->value;
                    	}  
                    	if(str_contains($ncs->name ,':mnc')){
                    		$qmi_name = 'qmi_mnc';
                    		$i->{$qmi_name} = $ncs->value;
                    	}                                      
                    }            
                }
                
                //--We got all our values - now we can do some more processing
                //-- WBW things --
                if($i->{'wbw_signal'}){       
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
                    $i->{'wbw_signal_bar'} = $signal_bar;
                    
                    $i->{'wbw_tx_rate'} = round($i->{'wbw_tx_rate'}/1000 ,1);
                	$i->{'wbw_rx_rate'} = round($i->{'wbw_rx_rate'}/1000 ,1); 
                	$i->{'wbw_expected_throughput'} = round($i->{'wbw_expected_throughput'}/1000 ,1);    
                                        
                } 
                
                //-- LTE things --
                if($i->{'qmi_rssi'}){ 
		            $this->LteHelper->getMobileProvider($i); 
		            $this->LteHelper->getRssiGui($i);
		            $this->LteHelper->getRsrpGui($i);
		            $this->LteHelper->getRsrqGui($i);
		            $this->LteHelper->getSnrGui($i);
		      	}
                                     	              	                                                           
            }
            
            unset($i->node_connection_settings); //Remove the list (not needed)
                      
            $i->country_code   = $country_code;
		    $i->country_name   = $country_name;
		    $i->city           = $city;
		    $i->postal_code    = $postal_code;

			$mesh_id = $i->mesh_id;
			
            //Get the 'dead_after' value
			$dead_after = $this->_get_dead_after($mesh_id);

            $l_contact      = $i->last_contact;
            $config_fetched = $i->config_fetched;

            //Find the dead time (only once)
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
                $i->config_fetched_human  = $config_fetched;
            }else{
                $last_config = strtotime($config_fetched);
                if ($last_config+$dead_after <= time()) {
                    $config_state = 'down';
                } else {
                    $config_state = 'up';
                }
            
                $i->config_fetched_human = $this->TimeCalculations->time_elapsed_string($config_fetched);
            }

            $i->config_state     = $config_state;

						
			$gateway = 'no';
            if(($i->gateway == 'lan')||($i->gateway == '3g')||($i->gateway == 'wifi')){           
                $gateway = 'yes';      
            }
            $i->gateway = $gateway;
			
			
			if($i->last_contact_from_ip !== ''){
			
			}

			if($gateway == 'yes'){
			    //See if there are any Openvpn connections
			    //$this->OpenvpnServerClients->contain('OpenvpnServers');
			    $q_vpn = $this->OpenvpnServerClients->find()->contain('OpenvpnServers')->where(['OpenvpnServerClients.mesh_id' => $mesh_id]);
			    if($q_vpn){
			        if(!isset($mesh_lookup[$mesh_id])){ //This will ensure we only to it once per mesh :-)
			            $i->openvpn_list = array();
			            foreach($q_vpn as $vpn){
			                $vpn_name           = $vpn['name']; 
			                $vpn_description    = $vpn['description'];
			                $last_contact_to_server  = $vpn['last_contact_to_server'];
			                if($last_contact_to_server != null){
			                    $lc_human           = $this->TimeCalculations->time_elapsed_string($last_contact_to_server);
			                }else{
			                    $lc_human = 'never';
			                }
			                $vpn_state              = $vpn['state'];
			                array_push($i->openvpn_list, array(
			                    'name'          => $vpn_name,
			                    'description'   => $vpn_description,
			                    'lc_human'      => $lc_human,
			                    'state'         => $vpn_state
			                ));
			            }
			            //print_r($q_vpn);
			            $mesh_lookup[$mesh_id] = true;
			        }
			    }
			}
			
			if($i->last_contact == null){
                $i->last_contact_human     = 'never';
            }else{
                $i->last_contact_human     = $this->TimeCalculations->time_elapsed_string($i->last_contact);
            }
            $hw_id                      = $i->hardware;
            
            if (array_key_exists($hw_id,$hardware)){
                $i->hw_human  	= $hardware["$hw_id"]['name'];  //Human name for Hardware
                $i->hw_photo  	= $hardware["$hw_id"]['photo'];  //Human name for Hardware
            }

			$i->state   = $state;
			$i->update  = true;
            $i->delete  = true;
			$i->mesh    = $i['mesh']['name'];
			// Get ready
			$this_data  = $i;
			//die(var_dump($i));

			// Uptime Visualization
			$this_data['uptimhist'] = $i['NodeUptmHistories'];
			$hist_pct = array();
			$hist_day = array();
			// Replace with get now() in real data scenario
			//$current_time = strtotime( '01/17/2018 09:30:00' );
			$current_time = time();
			// Subtract 24 hours
			$twentyfour_time = $current_time - (1440*60);
			$node_up_mins = 0;
			$node_dwn_mins = 0;
			$subtract_bar = false;
			$bar_start = true;
			if ( count($i['node_uptm_histories'])>0 ) {
				$nuh_cnt = count( $i['node_uptm_histories'] );
				for ( $nuh = 0; $nuh < $nuh_cnt; $nuh++ ) {
					$node_state =  $i['node_uptm_histories'][$nuh]['node_state'];
					$rpt_date = strtotime($i['node_uptm_histories'][$nuh]['report_datetime']);
					$state_date = strtotime($i['node_uptm_histories'][$nuh]['state_datetime']);
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
					if ( $node_state == 1) {
						$node_up_mins = $node_up_mins + $diff;
					} else {
						$node_dwn_mins = $node_dwn_mins + $diff;
					}
					// Figure how many 'bars' for diff
					$diff_rem = ((int) $diff) % 10; // Minimum bar is 20 minutes
					$diff_slice = $diff / 10;
					//printf('$node_state: %d, $diff: %f</br>', $node_state,$diff);
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
						if ( $node_state == 0) {
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
			
			$this_data['dayuptimehist'] = $hist_day;
			$this_data['uptimhistpct'] = $hist_pct;
            array_push($items,$this_data);

        }
		// Sort by node state
		$sortedNodes = Hash::sort($items, '{s}.state', 'desc');
        //___ FINAL PART ___
        $this->set(array(
            'items' => $sortedNodes, //$items,
            'success' => true,
            'totalCount' => $total,
             'metaData'		=> [
            	'total'	=> $total
            ]
        ));
        $this->viewBuilder()->setOption('serialize', true);           
    }
  
    private function _get_dead_after($mesh_id){
		$data 		= $this->_getDefaultSettings();
		$dead_after	= $data['heartbeat_dead_after'];
		$n_s = $this->Meshes->NodeSettings->find()->where(['NodeSettings.mesh_id' => $mesh_id])->first(); 
        if($n_s){
            $dead_after = $n_s->heartbeat_dead_after;
        }
		return $dead_after;
	}
	
	private function _getDefaultSettings(){   
        Configure::load('MESHdesk'); 
        $data  = Configure::read('common_node_settings'); //Read the defaults
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
    
    private function _make_linux_password($pwd){
		return exec("openssl passwd -1 $pwd");
	}

    private function _make_hardware_lookup(){
        $hardware   = [];    
        $q_e        = $this->{'Hardwares'}->find()->where(['Hardwares.for_mesh' => true])->all();
        foreach($q_e as $e){ 
            $id     = $e->fw_id;
            $hardware["$id"] = [
            	'name' 	=> $e->name,
            	'photo' => $e->photo_file_name
            ];  
        }
        return $hardware;
    }
  
}
