<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component that generates the OpenWrt config for firmware version=22.03 and 21.02
//---- Date: 19-SEPT-2022
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\I18n\FrozenTime;
use Cake\I18n\Time;


class MeshHelper22Component extends Component {

	protected $components 		= ['Firewall','MdFirewall','AccelPpp', 'Sqm'];
    protected $RadioSettings    = [];
    protected $l3_vlans         = []; //Layer three VLAN interfaces
    
    protected $ent_mesh         = null;
    protected $if_wbw_nat_br    = null;
    protected $wbw_settings     = [];
    protected $reboot_setting   = [];
    protected $WbwActive        = false;
    protected $QmiActive        = false;   
    protected $Schedules        = false;
    protected $WifiSchedules    = [];
    protected $week_days 	    = [ 1 => 'mo',2 => 'tu',3 => 'we',4 => 'th',5 => 'fr',6 => 'sa',7 => 'su'];
    
    protected $ppsk_flag		= false;
    protected $private_psks     = [];
    protected $ppsk_unset       = [ 'key','nasid','auth_server','auth_secret','acct_server','acct_secret','acct_interval', 'nasid', 'radius_auth_req_attr','radius_acct_req_attr'];
    
    protected $MeshSettings		= [];
    
    protected $stp              = 1;
    protected $acct_interval	= 300;

    public function initialize(array $config):void{
        //Please Note that we assume the Controller has a JsonErrors Component Included which we can access.
        $this->controller       = $this->_registry->getController();
        $this->Meshes           = TableRegistry::get('Meshes');
        $this->Nodes            = TableRegistry::get('Nodes');
        $this->OpenvpnServers   = TableRegistry::get('OpenvpnServers');
        $this->NodeWifiSettings = TableRegistry::get('NodeWifiSettings');
        $this->Devices          = TableRegistry::get('Devices');
        $this->MeshExitSettings = TableRegistry::get('MeshExitSettings');
        $this->UserSettings     = TableRegistry::get('UserSettings');
        $this->Hardwares        = TableRegistry::get('Hardwares');
        $this->NodeConnectionSettings = TableRegistry::get('NodeConnectionSettings');
        $this->UserSettings     = TableRegistry::get('UserSettings');
        $this->Timezones        = TableRegistry::get('Timezones');
         $this->PrivatePskEntries= TableRegistry::get('PrivatePskEntries');      
    }

    public function JsonForMeshNode($ent_node,$gw){
    
        $mesh_id        = $ent_node->mesh_id;
        $this->MeshId	= $mesh_id;
        $this->NodeId   = $ent_node->id;
	    $this->Hardware	= $ent_node->hardware;
		$this->Power	= $ent_node->power;
		$this->Mac      = $ent_node->mac;
		$this->EntNode  = $ent_node;
		
		if($gw){
			$this->GwNumber = 1; //Default start with number 1
		}
		
		$this->MetaData = [];
		$this->MetaData['mode']    = 'mesh';
		$this->MetaData['mac']     = $ent_node->mac;
		$this->MetaData['node_id'] = $this->NodeId;
		
		$this->_update_wbw_channel(); //Update the wbw channel if it is included
        
        $ent_mesh = $this->Meshes->find()
                    ->where(['Meshes.id' => $mesh_id])
                    ->contain([
                        'MeshExits.MeshExitMeshEntries', 
                        'MeshEntries' => [ 
                        	'MeshEntrySchedules'
                        ],
                        'NodeSettings' => [
                            'Schedules' => [
                                'ScheduleEntries' => [
                                    'PredefinedCommands'
                                ]
                            ]  
                        ],
                        'MeshSettings',
                        'MeshExits' => [
                            'MeshExitCaptivePortals',
                            'OpenvpnServerClients',
                            'MeshExitSettings',
                            'MeshExitPppoeServers'
                        ],
                        'Nodes' => [
                            'NodeMeshEntries',
                            'NodeConnectionSettings',
                            'Schedules' => [
                                'ScheduleEntries' => [
                                    'PredefinedCommands'
                                ]
                            ]                       
                        ]
                        ])
                    ->first();
                    
        if($ent_mesh){
            $this->ent_mesh = $ent_mesh;   
			$this->_update_fetched_info($ent_node);
            $json = $this->_build_json($ent_mesh,$gw);
            
            $firewall = $this->Firewall->JsonForMac($ent_node->mac);
            if($firewall){
            	$json['config_settings']['firewall'] = $firewall;
            }
            
            $adv_firewall = $this->MdFirewall->JsonForMac($ent_node->mac);
            if($adv_firewall){
            	$json['config_settings']['adv_firewall'] = $adv_firewall;
            }
            
            $sqm_profiles = $this->Sqm->jsonForMac($ent_node->mac);
            	if($sqm_profiles){
            		$json['config_settings']['sqm'] = $sqm_profiles;
            	}
            
            //Populate the ppsk files if there are any
        	foreach(array_keys($this->private_psks) as $ppsk_id){
        	    $this->private_psks[$ppsk_id] = $this->_formulate_ppsk_file($ppsk_id);
        	} 
        	$json['config_settings']['ppsk_files'] = $this->private_psks;      	
            
            return $json; 
        }
    }
    
    private function _update_wbw_channel(){
    
        //Update wbw info if present
        
        if($this->getController()->getRequest()->getQuery('wbw_active') == '1'){
            $this->WbwActive = true;
            $channel = $this->getController()->getRequest()->getQuery('wbw_channel');
            $ent_channel = $this->NodeConnectionSettings->find()
                ->where([
                    'NodeConnectionSettings.node_id'    => $this->NodeId,
                    'NodeConnectionSettings.grouping'   => 'wbw_info',
                    'NodeConnectionSettings.name'       => 'channel']
                )->first();
            if($ent_channel){
                $this->NodeConnectionSettings->patchEntity($ent_channel,['value'=>$channel]);
            }else{
                $d = [];
                $d['node_id']       = $this->NodeId;
                $d['grouping']      = 'wbw_info';
                $d['name']          = 'channel';
                $d['value']         = $channel;
                $ent_channel = $this->NodeConnectionSettings->newEntity($d);
            }       
            $this->NodeConnectionSettings->save($ent_channel);
        }
    }
       
    private function _update_fetched_info($ent_node){

        if ($this->_isSampleRequest()) {
            return;
        }

        if (!$ent_node) {
            // Handle invalid entity
            throw new \InvalidArgumentException('Invalid entity');
        }

        $fetchedInfo = [];
        $fetchedInfo['id'] = $this->NodeId;
        $fetchedInfo['config_fetched'] = FrozenTime::now();
        $fetchedInfo['last_contact_from_ip'] = $this->getController()->getRequest()->clientIp();

        $this->Nodes->patchEntity($ent_node, $fetchedInfo);

        if (!$this->Nodes->save($ent_node)) {
            // Handle save error
            throw new \RuntimeException('Failed to save entity');
        }
    }
    
    private function _isSampleRequest(){

        return $this->getController()->getRequest()->getQuery('sample') === 'true';
    }
    
    private function  _build_json($ent_mesh,$gateway = false){

        //Basic structure
        $json                                   = [];
        $json['meta_data']                      = []; //Add Meta Data for better reporting 
        $json['timestamp']                      = 1; 
        $json['config_settings']                = [];
        $json['config_settings']['wireless']    = [];
        $json['config_settings']['network']     = [];
		$json['config_settings']['system']		= [];
		
		
		//== if it is a gateway we need to deterimine which gateway number (in case of multiple)
		if($gateway){
			$count = $this->{'Nodes'}->find()
				->where([
					'Nodes.gateway !='  => 'none',
					'Nodes.mesh_id'		=> $this->MeshId,
					'Nodes.id <'  		=> $this->NodeId 
				])
				->count();			
			$this->GwNumber = $count+1;		
		}
				
		//====== Batman-adv specific config settings ======
		Configure::load('MESHdesk');
        $batman_adv       	= Configure::read('mesh_settings'); //Read the defaults
        $this->MeshSettings = $batman_adv;
        
		if($ent_mesh->mesh_setting){
			unset($ent_mesh->mesh_setting->id);
			unset($ent_mesh->mesh_setting->mesh_id);
			unset($ent_mesh->mesh_setting->created);
			unset($ent_mesh->mesh_setting->modified);
			$batman_adv = $ent_mesh->mesh_setting;
			$this->MeshSettings = $ent_mesh->mesh_setting->toArray();
		}
		
        //============ Network ================
        $version    = $this->getController()->getRequest()->getQuery('version');
        $net_return = $this->_build_network($ent_mesh,$gateway,$version); //version can be 18.06/19.07/21.02

              
        $json_network       = $net_return[0];
        $json['config_settings']['network'] = $json_network;

        //=========== Wireless ===================
        $entry_data         = $net_return[1];
        $json_wireless      = $this->_build_wireless($ent_mesh,$entry_data);
        $json['config_settings']['wireless'] = $json_wireless;
        
        //===WbW=====   
        if($this->wbw_settings){  
            $json['config_settings']['web_by_wifi'] = $this->wbw_settings;
        }
        
        //==Reboot Settings====
        $this->_checkForRebootSettings();
        if($this->reboot_setting){  
            $json['config_settings']['reboot_setting'] = $this->reboot_setting;
        }
          
        //========== Gateway or NOT? ======
        if($gateway){   
            $json['config_settings']['gateways']        = $net_return[2]; //Gateways
            $json['config_settings']['gateway_details'] = $net_return[5]; //Gateways
            $json['config_settings']['captive_portals'] = $net_return[3]; //Captive portals
            $json['config_settings']['accel_servers']   = $net_return[6]; //Accel-ppp servers
            
                             
            $openvpn_bridges                            = $this->_build_openvpn_bridges($net_return[4]);
            $json['config_settings']['openvpn_bridges'] = $openvpn_bridges; //Openvpn Bridges
        }
        

		//======== System related settings ======
		$system_data 		= $this->_build_system($ent_mesh);
		$json['config_settings']['system'] = $system_data;
		
		
		//=== Schedules ===
		//Direct Schedules
		foreach($ent_mesh->nodes as $ent_node){
		    if($ent_node->id == $this->NodeId){
		        if(($ent_node->schedule)&&($ent_node->enable_schedules == '1')){
                    if(count($ent_node->schedule->schedule_entries)>0){
                        $arr_shedule_entries = [];
                        foreach($ent_node->schedule->schedule_entries as $ent_se){
                            if($ent_se->predefined_command !== null){
                                $ent_se->command = $ent_se->predefined_command->command;                          
                            }
                            unset($ent_se->predefined_command);
                            unset($ent_se->predefined_command_id);
                            unset($ent_se->created);
                            unset($ent_se->modified);
                            array_push($arr_shedule_entries,$ent_se);
                        }
                        $this->Schedules = $arr_shedule_entries;  
                    }
		        } 
		    }
		}

        //Node Settings Schedules
        if($this->Schedules == false){      
            if($ent_mesh->node_setting){            
                if(($ent_mesh->node_setting->schedule)&&($ent_mesh->node_setting->enable_schedules== '1')){                  
                    if(count($ent_mesh->node_setting->schedule->schedule_entries)>0){
                        $arr_shedule_entries = [];
                        foreach($ent_mesh->node_setting->schedule->schedule_entries as $ent_se){
                            if($ent_se->predefined_command !== null){
                                $ent_se->command = $ent_se->predefined_command->command;
                                unset($ent_se->predefined_command);                                
                            }
                            unset($ent_se->predefined_command);
                            unset($ent_se->predefined_command_id);
                            unset($ent_se->created);
                            unset($ent_se->modified);
                            array_push($arr_shedule_entries,$ent_se);
                        }
                        $this->Schedules = $arr_shedule_entries;
                    }              
                }
            }
        }
			
		if($this->Schedules !== false){
			if(count($this->WifiSchedules) > 0){
		    	$json['config_settings']['schedules'] = array_merge($this->Schedules,$this->WifiSchedules);
		    }else{
		    	$json['config_settings']['schedules'] = $this->Schedules;
		    }
		}else{
			if(count($this->WifiSchedules) > 0){
				$json['config_settings']['schedules'] = $this->WifiSchedules;
			}
		}
				
		//--- Sept 2019 --- Add some metadata ----
		$this->MetaData['WbwActive']    = $this->WbwActive;
		$this->MetaData['QmiActive']    = $this->QmiActive;
		$json['meta_data']              = $this->MetaData;	
		
        return $json; 
    }
    
    
	private function _build_system($ent_mesh){
		//Get the root password
		$default_data = $this->_getDefaultSettings();
		$ss = [];
		if($ent_mesh->node_setting !== null && $ent_mesh->node_setting->password_hash != ''){
			$ss['password_hash'] 		= $ent_mesh->node_setting->password_hash;
			$ss['heartbeat_dead_after']	= $ent_mesh->node_setting->heartbeat_dead_after;
		}else{
			$ss['password_hash'] 		= $default_data['password_hash'];
			$ss['heartbeat_dead_after']	= $default_data['heartbeat_dead_after'];
		}

       
        //Timezone
        if($ent_mesh->node_setting !== null && $ent_mesh->node_setting->tz_value != ''){
            $ss['timezone']             = $ent_mesh->node_setting->tz_value;
        }else{
            $ss['timezone']   = $default_data['tz_value'];
        }

	    //Syslog Server 1
	    if($ent_mesh->node_setting !== null && $ent_mesh->node_setting->syslog1_ip != ''){
		    $ss['syslog1_ip'] = $ent_mesh->node_setting->syslog1_ip;
            $ss['syslog1_port'] = $ent_mesh->node_setting->syslog1_port;
	    }else{
		    $ss['syslog1_ip']   = $default_data['syslog1_ip'];
		    $ss['syslog1_port'] = $default_data['syslog1_port'];
	    }

	    //Syslog Server 2
        if($ent_mesh->node_setting !== null && $ent_mesh->node_setting->syslog2_ip != ''){
            $ss['syslog2_ip']   = $ent_mesh->node_setting->syslog2_ip;
            $ss['syslog2_port'] = $ent_mesh->node_setting->syslog2_port;
        }else{
            $ss['syslog2_ip']   = $default_data['syslog2_ip'];
            $ss['syslog2_port'] = $default_data['syslog2_port'];
        }

	//Syslog Server 3
        if($ent_mesh->node_setting !== null && $ent_mesh->node_setting->syslog3_ip != ''){
            $ss['syslog3_ip'] = $ent_mesh->node_setting->syslog3_ip;
            $ss['syslog3_port'] = $ent_mesh->node_setting->syslog3_port;
        }else{
            $ss['syslog3_ip']   = $default_data['syslog3_ip'];
            $ss['syslog3_port'] = $default_data['syslog3_port'];
        }

        //Gateway specifics
        if($ent_mesh->node_setting !== null && $ent_mesh->node_setting->gw_dhcp_timeout != ''){
            $ss['gw_dhcp_timeout']          = $ent_mesh->node_setting->gw_dhcp_timeout;
            $ss['gw_use_previous']          = $ent_mesh->node_setting->gw_use_previous;
            $ss['gw_auto_reboot']           = $ent_mesh->node_setting->gw_auto_reboot;
            $ss['gw_auto_reboot_time']      = $ent_mesh->node_setting->gw_auto_reboot_time; 
        }else{
            $ss['gw_dhcp_timeout']          = $default_data['gw_dhcp_timeout'];
            $ss['gw_use_previous']          = $default_data['gw_use_previous'];
            $ss['gw_auto_reboot']           = $default_data['gw_auto_reboot'];
            $ss['gw_auto_reboot_time']      = $default_data['gw_auto_reboot_time'];
        }
        
        //Advanced Reporting
        if($ent_mesh->report_adv_enable !== null){     
            $ss['report_adv_enable']    = $ent_mesh->node_setting->report_adv_enable;
            $ss['report_adv_proto']     = $ent_mesh->node_setting->report_adv_proto;
            $ss['report_adv_light']     = $ent_mesh->node_setting->report_adv_light;
            $ss['report_adv_full']      = $ent_mesh->node_setting->report_adv_full;
            $ss['report_adv_sampling']  = $ent_mesh->node_setting->report_adv_sampling;
        }else{
            $ss['report_adv_enable']    = $default_data['report_adv_enable'];
            $ss['report_adv_proto']     = $default_data['report_adv_proto'];
            $ss['report_adv_light']     = $default_data['report_adv_light'];
            $ss['report_adv_full']      = $default_data['report_adv_full'];
            $ss['report_adv_sampling']  = $default_data['report_adv_sampling'];
        }
        
		$ss['hostname'] = $this->EntNode->name;
		
		//System Specific Settings
		$want_these = ['mqtt_user','mqtt_password', 'mqtt_server_url', 'mqtt_command_topic'];
		$ent_us = $this->UserSettings->find()->where(['UserSettings.user_id' => -1])->all();
		
		foreach($ent_us as $s){
		    $s_name     = $s->name;
		    $s_value    = $s->value;
		    if(in_array($s_name,$want_these)){
		        $ss["$s_name"] = $s_value;
		    }
		}
		return $ss;
	}
	
	private function _getDefaultSettings(){
    
        Configure::load('MESHdesk'); 
        $data  = Configure::read('common_node_settings'); //Read the defaults

        $q_r = $this->{'UserSettings'}->find()->where(['user_id' => -1])->all();
        if($q_r){
            foreach($q_r as $s){
            
            	//ALL Report Adv Related default settings will be 'report_adv_<whatever>'
                if(preg_match('/^report_adv_/',$s->name)){
                    $data[$name]    = $s->value;    
                }
            
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
        
    private function _build_network($ent_mesh,$gateway = false,$version='18.06'){

        $network 				= [];
        $nat_data				= [];
        $captive_portal_data 	= [];
        $openvpn_bridge_data    = [];
		$include_lan_dhcp 		= true;
		$nat_detail				= [];
		$pppoe_detail           = [];


        //=================================
        //loopback if
        array_push( $network,
            [
                "interface"    => "loopback",
                "options"   => [
                    "device"        => "lo",
                    "proto"         => "static",
                    "ipaddr"        => "127.0.0.1",
                    "netmask"       => "255.0.0.0"
               ]
            ]);
        //========================

		//We add a new feature - we can specify for NON Gateway nodes to which their LAN port should be connected with
		if($ent_mesh->node_setting !== null && $ent_mesh->node_setting->eth_br_chk != ''){
			$eth_br_chk 		= $ent_mesh->node_setting->eth_br_chk;
			$eth_br_with	    = $ent_mesh->node_setting->eth_br_with;
			$eth_br_for_all	    = $ent_mesh->node_setting->eth_br_for_all;
		}else{
	    	Configure::load('MESHdesk');
			$c_n_s 				= Configure::read('common_node_settings'); //Read the defaults
			$eth_br_chk 		= $c_n_s['eth_br_chk'];
			$eth_br_with	    = $c_n_s['eth_br_with'];
			$eth_br_for_all	    = $c_n_s['eth_br_for_all'];
		}

		$lan_bridge_flag 	= false;
		
		//If we need to bridge and it is with the LAN (the easiest)
		if(
			($eth_br_chk)&&
			($eth_br_with == 0)
		){
			$lan_bridge_flag = true;
		}

        //LAN(Actually WAN e.g. eth1)
		$br_int = $this->_eth_br_for($this->Hardware);
		$wan_if = $this->_eth_br_for($this->Hardware);
		
		if($gateway == true){
		    if($this->Vlan){
		        $br_int = $br_int.'.'.$this->Vlan;
		    }
		}
		
		if($lan_bridge_flag){
			$br_int = "$br_int bat0.100";
		}

		//If we need to bridge and it is NOT with the LAN (more involved)
		if(
			($eth_br_chk)&&
			($eth_br_with != 0)&&
			($gateway == false) //Only on non-gw nodes
		){
			$include_lan_dhcp = false; //This case we do not include the lan dhcp bridge
		}
        //==================
        

		if($include_lan_dhcp){

			//We need to se the non-gw nodes to have:
			//1.) DNS Masq must not be running
			//2.) The LAN must now have DHCP client since this will trigger the setup script as soon as the interface get an IP
			//3.) This will cause a perpetiual loop since it will kick off the setup script and reconfigure itself.
			//4.) The gateway however still needs to maintain its dhcp client status.
			$proto = 'dhcp';
			if(($lan_bridge_flag)&&($gateway == false)){
				$proto = 'static';
			}
			
			//SMALL HACK START 
			$m = $this->getController()->getRequest()->getQuery('mac');
            $m = strtolower($m);
            $m = str_replace('-', ':', $m);
            //SMALL HACK END
                               
            $lan_options = [
                "ifname"        => "$br_int", 
                "type"          => "bridge",
                "proto"         => "$proto"
            ];
            if($version !== '21.02'){
                $lan_options['macaddr'] = $m;  
            }
            
             array_push( $network,
                [
                    "device" => "br-lan",
                    "options"   => [
                    	'name'	=> 'br-lan',
                    	'type'	=> 'bridge'
                    ],
                    'lists'	=> ['ports' => [
                    	$br_int
                    ]
            	]
            ]);
            
            array_push( $network,
                [
                    "interface" => "lan",
                    "options"   => [
                    	"proto" => "$proto",
                    	"device"=> 'br-lan'
                    ]
            ]);
            
            if($version == '21.02'){         
                if($wan_if == 'wan'){      
                    array_push( $network,
                        [
                            "device"    => $wan_if,
                            "options"   => [
                                "name"      => $wan_if, 
                                "macaddr"   => "$m"
                           ]
                    ]);
                }      
            }
                    
	        //-- Jul 2021 -ADD LTE Support--
            $qmi_return =  $this->_checkForQmi();
            if($qmi_return){
                array_push( $network,$qmi_return);
            }  	       	
		}
		
		//---- Batman-Adv ---
		$gw_mode = 'client';
		if($gateway){
			$gw_mode = 'server';
		}
		      
	    //Add an interface called b to list the batman interface
	    array_push( $network,
            [
                "interface"    => "bat0",
                "options"   => [
                    'proto'         	=> 'batadv',
                    'routing_algo'  	=> $this->MeshSettings['routing_algo'],
                    'aggregated_ogms'   => intval($this->MeshSettings['aggregated_ogms']),//1
                    'ap_isolation'      => intval($this->MeshSettings['ap_isolation']),//0
                    'bonding'           => intval($this->MeshSettings['bonding']),//0
                    'fragmentation'     => intval($this->MeshSettings['fragmentation']),//1
                    #'gw_bandwidth'     =>'10000/2000',
                    'gw_mode'           => $gw_mode,
                    #'gw_sel_class'     => $this->MeshSettings['gw_sel_class'],                        
                    'orig_interval'     => $this->MeshSettings['orig_interval'], //100
                    'bridge_loop_avoidance' => intval($this->MeshSettings['bridge_loop_avoidance']), //1
                    'distributed_arp_table' => intval($this->MeshSettings['distributed_arp_table']), //1
                    'multicast_mode'    => 1,
                    'network_coding'    => 0,
                    'hop_penalty'       => 30,
                    'isolation_mark'    => '0x00000000/0x00000000',
                    'log_level'         => 0,     
               ]
            ]);
            
            /*
            'proto'         	=> 'batadv',
            'routing_algo'  	=> 'BATMAN_IV',
            'aggregated_ogms'   => 1,
            'ap_isolation'      => 0,
            'bonding'           => 0,
            'fragmentation'     => 1,
            #'gw_bandwidth'     =>'10000/2000',
            'gw_mode'           => 'off',
            #'gw_sel_class'     => 20,
            'log_level'         => 0,
            'orig_interval'     => 1000,
            'bridge_loop_avoidance' => 1, //FIXME It seems the originator mac message stops when this is disabled FIXME 19Sept22 enable it again
            'distributed_arp_table' => 1,
            'multicast_mode'    => 1,
            'network_coding'    => 0,
            'hop_penalty'       => 30,
            'isolation_mark'    => '0x00000000/0x00000000'                 
            */
	    
        //Mesh
        array_push( $network,
            [
                "interface"    => "mesh",
                "options"   => [
                    "proto"     => "batadv_hardif",
                    'master'    => 'bat0',
                    'mtu'       => 2304            
               ]
            ]);

        $ip = $this->EntNode->ip;

        //Admin interface
        array_push($network,
            [
                "device"    => "br-one",
                "options"   => [
                	"name"		=> "br-one",
                    "type"      => "bridge",
                    'stp'       => $this->stp,
               	],
               	'lists'	=> [
               		'ports'	=> [ "bat0.1" ]
               	]                          
            ]
        );
                
        array_push($network,
        	[
		        "interface"    => "one",
		        "options"   => [
		            "device"    => "br-one",
		            "proto"     => "static",
		            "ipaddr"    => $ip,
		            "netmask"   => "255.255.255.0"
		       ]
		 	]
        );

        //Now we will loop all the defined exits **that has entries assigned** to them and add them as bridges as we loop. 
        //The members of these bridges will be determined by which entries are assigned to them and specified
        //in the wireless configuration file

        $start_number   = 2;
        
        $ifCounter      = 2;
        $loopCounter    = 2; 

        //We create a data structure which will be used to add the entry points and bridge them with
        //The correct network defined here
        $entry_point_data = [];

        //Add the auto-attach entry points
        $interfaces = [];
        foreach($ent_mesh->mesh_exits as $me){
        
            $has_entries_attached   = false;
            //$if_name                = 'ex_'.$this->_number_to_word($start_number);
            $exit_id                = $me->id;
            $type                   = $me->type;
            $vlan                   = $me->vlan;
            $openvpn_server_id      = $me->openvpn_server_id;
            $notVlan                = true;
            $sqm_active             = $me->apply_sqm_profile;
            
            if (($me->vlan > 0) && ($me->type === 'nat')) {
                $if_name    = 'ex_v'.$me->vlan;
                $notVlan    = false;
            } else {
                $if_name = 'ex_' . $this->_number_to_word($ifCounter);
            }
            
            
            //Mar 2021 The eth_br_with will have the ID of the exit point. If it matches we need to add it even if it does not have a macting SSID
            if($eth_br_with == $me->id){
                $has_entries_attached = true;
            }              
            //This is used to fetch info eventually about the entry points
            if(count($me->mesh_exit_mesh_entries) > 0){
                $has_entries_attached = true;
                foreach($me->mesh_exit_mesh_entries as $entry){
                    if($entry->mesh_entry_id!=0){ //Entry id of 0 is for eth1 ...
                    
                    	//==OCT ADD ON==
		                if(preg_match('/^-9/',$entry->mesh_entry_id)){ 	
				        	$dynamic_vlan = $entry->mesh_entry_id;
				        	$dynamic_vlan = str_replace("-9","",$dynamic_vlan);
				        	$if_name = 'ex_v'.$dynamic_vlan;
				        	$this->ppsk_flag = true; //set the heads-up flag
				        	$notVlan    = false;	            
				        }
                       
                        if(($type == 'bridge')&&($gateway)){ //The gateway needs the entry points to be bridged to the LAN
                            array_push($entry_point_data, ['network' => 'lan','entry_id' => $entry->mesh_entry_id]);
                        }else{
                            array_push($entry_point_data, ['network' => $if_name,'entry_id' => $entry->mesh_entry_id]);
                        }
                    }
                }
            }
            
             $this->MetaData['exits'][] = [
                'id'        => $exit_id,
                'mesh_exit_id' => $exit_id, // With mesh we will make it mesh_exit_id
                'type'      => $type,
                'device'    => 'br-'.$if_name,
                'sqm'       => $me->apply_sqm_profile
            ];
                                    
            if($type == 'tagged_bridge_l3'){
                $has_entries_attached = true;    
            }
  
            if($has_entries_attached == true){
				
                //=======================================
                //========= GATEWAY NODES ===============
                //=======================================
                $captive_portal_count = 1;
                
                //-- Common to gateway --
                if($gateway){
                    $eth_one_bridge = false;
                    $interfaces = ["bat0.".$loopCounter];
                    foreach($me->mesh_exit_mesh_entries as $cp_ent){
                        if($cp_ent['mesh_entry_id'] == 0){
                            $eth_one_bridge = true;
                            break;
                        }
                    }     
                    if($eth_one_bridge == true){
                        $lan_if = $this->_lan_if_for($this->Hardware);                      
                        if($lan_if){
                            $interfaces = array_merge($interfaces,$lan_if);
                        }
                    }
                }             

                if(($type == 'tagged_bridge')&&($gateway)){
                                    
					$br_int = $this->_eth_br_for($this->Hardware);
					array_push($interfaces,"bat0.".$loopCounter);
					array_push($interfaces,$br_int.".$vlan");
					
					array_push($network,
                        [
                            "device"    => "br-$if_name",
                            "options"   => [
                            	"name"		=> "br-$if_name",
                                "type"      => "bridge",
                                'stp'       => $this->stp,
                           	],
                           	'lists'	=> [
                           		'ports'	=> $interfaces
                           	]                          
                        ]
                    );
										
                    array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                "device"    => "br-$if_name"
                        ]]
                    );

			        if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;                 
                    continue;   //We don't car about the other if's
                }
        
                //== 21May2021 == Modify so it will use custom settings if defined 
                if(($type == 'nat')&&($gateway)){
                
                    $if_ipaddr          = "10.200.".(100+$loopCounter).".1";
                    $if_netmask         = "255.255.255.0";
                    $nat_detail_item    = [];
                    
                    foreach($me->mesh_exit_settings as $s){                        
                        if(preg_match('/^nat_/',$s->name)){
                            $nat_item  = preg_replace('/^nat_/', '', $s->name);
                            $nat_detail_item[$nat_item] = $s->value;
                        }                             
                    }
                    
                    if(!empty($nat_detail_item)){
                        $if_ipaddr  = $nat_detail_item['ipaddr'];
                        $if_netmask = $nat_detail_item['netmask'];
                        $nat_detail[$if_name]=$nat_detail_item;
                    }
                                       
                    if($this->GwNumber > 1){ //Because there are more than one gateways we have to adjust our range (up it one)
                    
                    	if($if_netmask == '255.255.255.0'){ //Class C subnets
                    		preg_match('/^(\d{1,3}).(\d{1,3}).(\d{1,3}).(\d{1,3})$/',$if_ipaddr,$matches);
                    		$subnet    = $matches[3];
                    		$subnet    = $subnet + $this->GwNumber - 1;
                    		$if_ipaddr = preg_replace('/^(\d{1,3}).(\d{1,3}).(\d{1,3}).(\d{1,3})$/', "$1.$2.$subnet.$4", $if_ipaddr);
                    		//print_r($if_ipaddr);
                    		$nat_detail[$if_name]['ipaddr'] = $if_ipaddr;
                    	}
                    	
                    	if($if_netmask == '255.255.0.0'){ //Class B subnets
                    		preg_match('/^(\d{1,3}).(\d{1,3}).(\d{1,3}).(\d{1,3})$/',$if_ipaddr,$matches);
                    		$subnet    = $matches[2];
                    		$subnet    = $subnet + $this->GwNumber - 1;
                    		$if_ipaddr = preg_replace('/^(\d{1,3}).(\d{1,3}).(\d{1,3}).(\d{1,3})$/', "$1.$subnet.$3.$4", $if_ipaddr);
                    		$nat_detail[$if_name]['ipaddr'] = $if_ipaddr;
                    	}                      	                        
                  	}                    
                    
                    array_push($network,
                        [
                            "device"    => "br-$if_name",
                            "options"   => [
                            	"name"		=> "br-$if_name",
                                "type"      => "bridge",
                                'stp'       => $this->stp,
                           	],
                           	'lists'	=> [
                           		'ports'	=> $interfaces
                           	]                          
                        ]
                    );
										
                    array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                'device'    => "br-$if_name",
                                'ipaddr'    => $if_ipaddr,
                                'netmask'   => $if_netmask,
                                'proto'     => 'static',
                        ]]
                    );
                    
					
                    //Push the nat data
                    array_push($nat_data,$if_name);
                    if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;
                    continue; //We dont care about the other if's
                }

                //=== GATEWAY BRIDGE ===
                if(($type=='bridge')&&($gateway)){                         
                    //Here we have to override the bridge with a NAT if wbw
                    if(($this->getController()->getRequest()->getQuery('wbw_active') == '1')||($this->QmiActive == true)){                 
                        $this->if_wbw_nat_br = $if_name;
                        
                         array_push($network,
		                    [
		                        "device"    => "br-$if_name",
		                        "options"   => [
		                        	"name"		=> "br-$if_name",
		                            "type"      => "bridge",
		                            'stp'       => $this->stp,
		                       	],
		                       	'lists'	=> [
		                       		'ports'	=> $interfaces
		                       	]                          
		                    ]
		                );                      
                        array_push($network,
                            [
                                "interface"    => "$if_name",
                                "options"   => [
                                    "device"    => "br-$if_name",
                                    'ipaddr'    =>  "10.210.".(100+$loopCounter).".1",
                                    'netmask'   =>  "255.255.255.0",
                                    'proto'     => 'static'
                            ]]
                        );
                        //Push the nat data
                        array_push($nat_data,$if_name);
                    }else{       
                        $current_interfaces = $network[1]['lists']['ports'];
                        $network[1]['lists']['ports'] = array_merge($current_interfaces,$interfaces);
                        $network[1]['options']['stp'] = $this->stp;  
                    }                
                    if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;
                    continue; //We dont care about the other if's
                }
                                
                if(($type == 'captive_portal')&&($gateway)){               
                    
                    //---WIP Start---
                    if($me->mesh_exit_captive_portal->dnsdesk == true){
                        $if_ip      = "10.$captive_portal_count.0.2";
                    }
                    $captive_portal_count++; //Up it for the next one
                    //---WIP END---

                    //Add the captive portal's detail
                    if($type =='captive_portal'){
                        $a = $me->mesh_exit_captive_portal;
                        $a->hslan_if = 'br-'.$if_name;
                        $a->network  = $if_name;
                        
                        //---WIP Start---
                        if($me->mesh_exit_captive_portal->dnsdesk == true){
                            $a->dns1      = $if_ip;
                            //Also sent along the upstream DNS Server to use
                            $a->upstream_dns1 = Configure::read('dnsfilter.dns1'); //Read the defaults
                            $a->upstream_dns2 = Configure::read('dnsfilter.dns2'); //Read the defaults
                        }
                        //---WIP END---
                        
                        //Walled garden fix
                        $a->walled_garden = preg_replace('#\s+#',',',trim($a->walled_garden));
                        
                        //Facebook XWF automatically add walled garden based on value of xwf_homepage and optioal config file entries
                        if($a->xwf_enable){
                            $xwf_walled_garden = $a->xwf_uamhomepage;
                            $xwf_walled_garden = preg_replace('#^(https|http)://#','',$xwf_walled_garden);
                            $xwf_walled_garden = preg_replace('#/.*#','',$xwf_walled_garden);
                            
                            Configure::load('MESHdesk');
                            if(Configure::read('MESHdesk.xwf_extra_walled_garden')){
                                $xwf_walled_garden = $xwf_walled_garden.','.Configure::read('MESHdesk.xwf_extra_walled_garden');
                            }                            
                            
                            if($a->walled_garden == ''){
                                $a->walled_garden = $xwf_walled_garden;
                            }else{
                                $a->walled_garden = $a->walled_garden.",".$xwf_walled_garden;
                            }
                        }
                                                                       
                        //coova_optional fix
                        if($a->coova_optional !== ''){
                            $a->coova_optional = trim($a->coova_optional);
                            $a->coova_optional = $a->coova_optional."\n";
                        }
                        
                        //7May2022 remove empty UAMsecret
                        if($a->uam_secret == ''){
                            unset($a->uam_secret);
                        }
                        
                        //print_r($a);                        
                        array_push($captive_portal_data,$a);             
                    }
                    
                    array_push($network,
	                    [
	                        "device"    => "br-$if_name",
	                        "options"   => [
	                        	"name"		=> "br-$if_name",
	                            "type"      => "bridge",
	                            'stp'       => $this->stp,
	                       	],
	                       	'lists'	=> [
	                       		'ports'	=> $interfaces
	                       	]                          
	                    ]
	                );        
                                      
                    array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                "device"    => "br-$if_name"
                        ]]
                    );

                    if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;
                    continue; //We dont care about the other if's
                }
                
                //___ OpenVPN Bridge ________
                if(($type == 'openvpn_bridge')&&($gateway)){

                    //Add the OpenvpnServer detail
                    if($type =='openvpn_bridge'){
                       
                        $a              = $me->openvpn_server_client->toArray();

                        $a['bridge']    = 'br-'.$if_name;
                        $a['interface'] = $if_name;
                        
                        //Get the info for the OpenvpnServer
                        $ent_vpn        = $this->OpenvpnServers->find()
                            ->where(['OpenvpnServers.id' => $me->openvpn_server_client->openvpn_server_id])
                            ->first();
                        
                        $a['protocol']  = $ent_vpn->protocol;
                        $a['ip_address']= $ent_vpn->ip_address;
                        $a['port']      = $ent_vpn->port;
                        $a['vpn_mask']  = $ent_vpn->vpn_mask;
                        $a['ca_crt']    = $ent_vpn->ca_crt;   
                        
                        $a['config_preset']        = $ent_vpn->config_preset;  
                        $a['vpn_gateway_address']  = $ent_vpn->vpn_gateway_address;
                        $a['vpn_client_id']        = $me->openvpn_server_client->id;                      
                        array_push($openvpn_bridge_data,$a);
                                     
                    }
                    $interfaces =  ["bat0.".$loopCounter];
                    
                    array_push($network,
	                    [
	                        "device"    => "br-$if_name",
	                        "options"   => [
	                        	"name"		=> "br-$if_name",
	                            "type"      => "bridge",
	                            'stp'       => $this->stp,
	                       	],
	                       	'lists'	=> [
	                       		'ports'	=> $interfaces
	                       	]                          
	                    ]
	                );    
                                        
                    array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                "device"    => "br-$if_name",
                                'ipaddr'    => $me->openvpn_server_client->ip_address,
                                'netmask'   => $a['vpn_mask'],
                                'proto'     => 'static'                               
                        ]]
                    );
                    
                    if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;
                    continue; //We dont care about the other if's            
                    
                }
                
                //____ LAYER 3 Tagged Bridge ____
                if(($type == 'tagged_bridge_l3')&&($gateway)){
                
                    $tmp_br_int     = $this->_eth_br_for($this->Hardware);                    
                    $interfaces     = $tmp_br_int.'.'.$me->vlan;  //We only do eth0  
                    $exit_point_id  = $me->id;
                                                 
                    $this->l3_vlans[$exit_point_id] = $if_name;
                    if($me->proto == 'dhcp'){
                         array_push($network,
                            array(
                                "interface"    => "$if_name",
                                "options"   => array(
                                    'ifname'    => "$tmp_br_int",
                                    'type'      => '8021q',
                                    'proto'     => 'dhcp',
                                    'name'      => $tmp_br_int.'.'.$me->vlan,
                                    'vid'       => $me->vlan
                            ))
                        );
                    }
                    if($me->proto == 'static'){  
                        $options = [
                            'ifname'    => "$tmp_br_int",
                            'type'      => '8021q',
                            'proto'     => $me->proto,
                            'ipaddr'    => $me->ipaddr,
                            'netmask'   => $me->netmask,
                            'gateway'   => $me->gateway,
                            'name'      => $tmp_br_int.'.'.$me->vlan,
                            'vid'       => $me->vlan
                        ];
                        $lists = [];
                        if($me->dns_2 != ''){
                            array_push($lists,['dns'=> $me->dns_2]);
                        }
                        if($me->dns_1 != ''){
                            array_push($lists,['dns'=> $me->dns_1]);
                        }
                    
                        array_push($network,
                            [
                                "interface" => "$if_name",
                                "options"   => $options,
                                "lists"     => $lists
                        ]); 
                    }
                    continue; //We dont care about the other if's 
                }
                
                //____ PPPoE Server ____
                if(($type == 'pppoe_server')&&($gateway)){
                
                    $pppoe_if       = "br-$if_name";
                    $nas_identifier = "m_pppoe_".$me->id.'_'.$this->EntNode->id;
                    $profile_id     = $me->mesh_exit_pppoe_server->accel_profile_id;
                    
                    /*Info should look like this:
                    [
                        'server_type' => 'mesh' / 'ap_profile',
                        'mac' => 'AA-BB-CC-DD-EE-FF',
                        'cloud_id'  => int val,
                        'accel_profile_id'  => int val,
                        'name'  => string
                        'nas_identifier'    => string,
                        'pppoe_interface'   => string    
                    ]
                    */
                    $info   = [
                        'server_type'       => 'mesh',
                        'nas_identifier'    => $nas_identifier,
                        'cloud_id'          => $this->ent_mesh->cloud_id,
                        'pppoe_interface'   => $pppoe_if,
                        'mac'               => $this->EntNode->mac.'_'.$nas_identifier, //We do this to allow multiple servers to be defined
                        'accel_profile_id'  => $profile_id,
                        'name'              => $this->ent_mesh->name.'_'.$nas_identifier
                    ];
                    
                    $pppoe_conf = $this->AccelPpp->JsonConfig($info);
                    array_push($pppoe_detail,$pppoe_conf);
                                                                                                     
                    array_push($network,
	                    [
	                        "device"    => "br-$if_name",
	                        "options"   => [
	                        	"name"		=> "br-$if_name",
	                            "type"      => "bridge",
	                            'stp'       => $this->stp,
	                       	],
	                       	'lists'	=> [
	                       		'ports'	=> $interfaces
	                       	]                          
	                    ]
	                );        
                                      
                    array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                "device"    => "br-$if_name",
                                "proto"     => "none"
                        ]]
                    );

                    if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;
                    continue; //We dont care about the other if's 
                }
                               

                //=======================================
                //==== STANDARD NODES ===================
                //=======================================

                if(($type == 'nat')||($type == 'tagged_bridge')||($type == 'bridge')||($type =='captive_portal')||($type =='openvpn_bridge')){
                    $interfaces =  ["bat0.".$loopCounter];
                    
					//===Check if this standard node has an ethernet bridge that has to be included here (NON LAN bridge)
					if(
						($eth_br_chk)&& 			//Eth br specified
						($eth_br_with == $exit_id) 	//Only if the current one is the one to be bridged
					){
						array_push($interfaces,$br_int);
					}
					
					array_push($network,
	                    [
	                        "device"    => "br-$if_name",
	                        "options"   => [
	                        	"name"		=> "br-$if_name",
	                            "type"      => "bridge",
	                            'stp'       => $this->stp,
	                       	],
	                       	'lists'	=> [
	                       		'ports'	=> $interfaces
	                       	]                          
	                    ]
	                );
	                
	                array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                "device"    => "br-$if_name"
                        ]]
                    );

                    if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;
                    continue; //We dont care about the other if's
                }
            }
        }
       
        //Captive Portal layer2 VLAN upstream enhancement 
        $cp_counter = 0;
        foreach($captive_portal_data as $cpd){
            if($cpd['mesh_exit_upstream_id'] == 0){
                $captive_portal_data[$cp_counter]['hswan_if'] = 'br-lan';
            }else{
                $captive_portal_data[$cp_counter]['hswan_if'] = $this->l3_vlans[$cpd['mesh_exit_upstream_id']];
            }
            $cp_counter++;
        }
        
        /* --- Add this regardless ---- (If it is configured; set it) */
        $dns            = '';
        $wan_specific   = $this->_checkForWanSpecific();
        
        foreach($wan_specific as $x => $val){
            if(($x == 'dns_1')or($x == 'dns_2')){
                $dns = $dns.' '.$val;
            }else{
                $network[2]['options'][$x] = $val;
            }
        }
        if($dns !== ''){
            $network[2]['options']['dns'] = trim($dns); 
        }
        
                         
        return [$network,$entry_point_data,$nat_data,$captive_portal_data,$openvpn_bridge_data,$nat_detail,$pppoe_detail];     
    }
     
    private function _build_wireless($ent_mesh,$entry_point_data){

        $wireless = [];
		//Determine the radio count and configure accordingly
        $radios = 0;
	    $q_e = $this->{'Hardwares'}->find()
		    ->where(['Hardwares.fw_id' => $this->Hardware,'Hardwares.for_mesh' => true])
		    ->first();
		    
	    if($q_e){
	        $radios     = $q_e->radio_count;
	        //First get the WiFi settings wether default or specific
            $this->_setWiFiSettings($radios);
	        $wireless   = $this->_build_radio_wireless($ent_mesh,$entry_point_data,$radios);
	        return $wireless;
	    }
    }
    
    private function _setWiFiSettings($radio_count){
          
        $q_r = $this->{'Nodes'}->find()->contain(['NodeWifiSettings'])->where(['Nodes.id' => $this->NodeId])->first();
        //There seems to be specific settings for the node
        if($q_r){
         
            $ht_capab_zero  = [];
            $ht_capab_one   = [];
            $ht_capab_two   = [];
        
            if(count($q_r->node_wifi_settings) > 0){
                
                foreach($q_r->node_wifi_settings as $i){
                    $name  = $i['name'];
                    $value = $i['value'];
                    
                    if(preg_match('/^radio/', $name) === 0){ //If it does not start with 'radio'
                        continue;
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
                    if(preg_match('/^radio\d+_ht_capab/',$name)){
                        if($value !== ''){
                            if($radio_number == 0){
                                array_push($ht_capab_zero,$value);
                            }
                            if($radio_number == 1){
                                array_push($ht_capab_one,$value);
                            }
                            if($radio_number == 2){
                                array_push($ht_capab_two,$value);
                            }
                        }
                    }else{
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
                        $this->RadioSettings[$radio_number][$name] = $value; 
                    }
                }
                if(isset($this->RadioSettings[0])){ //Only it is set
                    $this->RadioSettings[0]['radio0_ht_capab'] = $ht_capab_zero;
                }
            
                if(isset($this->RadioSettings[1])){ //Only it is set
                    $this->RadioSettings[1]['radio1_ht_capab'] = $ht_capab_one;
                }
                
                if(isset($this->RadioSettings[2])){ //Only it is set
                    $this->RadioSettings[2]['radio2_ht_capab'] = $ht_capab_two;
                }                                  
            }
            
            //We are not storing the 'config' flag per radio but rather per hardware ... So we need to determine that
            $radio_fields = [
                'config'
            ];
            
            //ONLY If there were no WiFi settings we can use the default
            if(count($q_r->node_wifi_settings) == 0){
                $radio_fields = [
                    'disabled', 'band','mode','width','mesh','config','ap','ht_capab','txpower','cell_density'
                ]; 
            }
                  
            $model  = $this->Hardware;
            $q_e    = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
            if($q_e){
                foreach($q_e->hardware_radios as $hr){    
                    $radio_number   = $hr->radio_number;
                    $prefix = 'radio'.$radio_number.'_';
                    foreach($radio_fields as $fr){  
                        if($fr == 'ht_capab'){
                            if($hr->{"$fr"} !== ''){
                                $ht_capab_array = explode("\n",$hr->{"$fr"});
                                if($radio_number == 0){
                                    $ht_capab_zero = $ht_capab_array;
                                    $this->RadioSettings[0]["$prefix$fr"] = $ht_capab_zero;
                                }
                                if($radio_number == 1){
                                    $ht_capab_one = $ht_capab_array;
                                    $this->RadioSettings[1]["$prefix$fr"] = $ht_capab_one;
                                }
                                if($radio_number == 2){
                                    $ht_capab_two = $ht_capab_array;
                                    $this->RadioSettings[2]["$prefix$fr"] = $ht_capab_two;
                                }
                            }   
                        }else{
                            $this->RadioSettings[$radio_number]["$prefix$fr"] = $hr->{"$fr"};
                        }
                    }
                }
            }
            
            //Now we need to specifically set 'mesh', 'ap' and 'config' to false if they are not set
            for ($x = 0; $x < $radio_count; $x++){ 
                $items = ['mesh','ap','config'];
                foreach($items as $check){
                    if(!isset($this->RadioSettings[$x]['radio'.$x.'_'.$check])){
                        $this->RadioSettings[$x]['radio'.$x.'_'.$check] = false;
                    }
                }      
            }
        }
    }
    
    private function _build_radio_wireless($ent_mesh,$entry_point_data,$radio_count){
   
        $wireless       = [];
        $default_data   = $this->_getDefaultSettings();      
        $client_key     = $default_data['client_key'];
        $two_chan       = $default_data['two_chan'];
        $five_chan      = $default_data['five_chan'];
        $country        = $default_data['country'];
        
        if($ent_mesh->node_setting !== null) {        
            $client_key = $ent_mesh->node_setting->client_key;
            $two_chan   = $ent_mesh->node_setting->two_chan;
            $five_chan  = $ent_mesh->node_setting->five_chan;
            $country    = $ent_mesh->node_setting->country;
        }
        
        //Check for wbw overrides
        $replace_info = $this->_checkForWbWReplacement();
        if($replace_info['two_replace'] == true){
            $two_chan = $replace_info['two_chan'];  
        }
        if($replace_info['five_replace'] == true){
            $five_chan = $replace_info['five_chan'];   
        }       
           
        //== RADIO Interfaces ==
               
        for ($x = 0; $x < $radio_count; $x++){
         
            if($this->RadioSettings[$x]['radio'.$x.'_band'] == '2g'){
                $channel = intval($two_chan);
		        //Individual Channel selection if radio not participating in the mesh 
		        if(($this->RadioSettings[$x]['radio'.$x.'_mesh'] !== true)&&($this->RadioSettings[$x]['radio'.$x.'_ap'] == true)){
		            if(isset($this->RadioSettings[$x]['radio'.$x.'_channel_two'])){
		                if($replace_info['two_replace'] == true){//3Mar20ADD
		                    $channel = intval($two_chan); //Use default for mesh if not set //3Mar20ADD
		                }else{//3Mar20ADD
		                    $channel = intval($this->RadioSettings[$x]['radio'.$x.'_channel_two']);
		                }//3Mar20ADD               
		            }else{
		                $channel = intval($two_chan); //Use default for mesh if not set
		            }
		        }
		        if($channel == 0){
		            $channel = 'auto';
		        }      	
            }
                
            if($this->RadioSettings[$x]['radio'.$x.'_band'] == '5g'){
                $channel    = intval($five_chan);
		        //Individual Channel selection if radio not participating in the mesh 
		        if(($this->RadioSettings[$x]['radio'.$x.'_mesh'] !== true)&&($this->RadioSettings[$x]['radio'.$x.'_ap'] == true)){
		            if(isset($this->RadioSettings[$x]['radio'.$x.'_channel_five'])){
		                if($replace_info['five_replace'] == true){//3Mar20ADD
		                    $channel = intval($five_chan); //Use default for mesh if not set //3Mar20ADD
		                }else{//3Mar20ADD
		                    $channel = intval($this->RadioSettings[$x]['radio'.$x.'_channel_five']);
		                }//3Mar20ADD
		            }else{
		                $channel = intval($five_chan); //Use default for mesh if not set
		            }
		        }
		        if($channel == 0){
		            $channel = 'auto';
		        }	
            }
                
            $band   = $this->RadioSettings[$x]['radio'.$x.'_band'];
            $mode   = $this->RadioSettings[$x]['radio'.$x.'_mode'];
            $width  = $this->RadioSettings[$x]['radio'.$x.'_width'];
            
            //htmode
            if($band == '2g'){
                $hwmode = '11g';
            }
            
            if($band == '5g'){
                $hwmode = '11a';
            }
            
            //htmode
            $htmode = 'HT';
            if(($band == '2g')&&($mode=='ax')){
                $htmode = 'HE';    
            }
            if(($band == '5g')&&($mode=='ac')){
                $htmode = 'VHT';    
            }
            if(($band == '5g')&&($mode=='ax')){
                $htmode = 'HE';    
            }
            
            $radio_capab = [];
            //Somehow the read thing reads double..
            $allready_there = [];
            
            if(isset($this->RadioSettings[$x]['radio'.$x.'_ht_capab'])){
                foreach($this->RadioSettings[$x]['radio'.$x.'_ht_capab'] as $c){
                    if(!in_array($c,$allready_there)){
                        array_push($allready_there,$c);
                        array_push($radio_capab, ['name'    => 'ht_capab', 'value'  => $c]);
                    }
                }
            }
            
            $cell_density  = 0;
            if(isset($this->RadioSettings[$x]['radio'.$x.'_cell_density'])){
                $cell_density =  intval($this->RadioSettings[$x]['radio'.$x.'_cell_density']);  
            }
            
            $options_array = [
                'channel'       => $channel,
                'disabled'      => intval($this->RadioSettings[$x]['radio'.$x.'_disabled']),
                'hwmode'        => $hwmode,
                'htmode'        => $htmode.$width,
                'band'          => $band,
                'cell_density'  => $cell_density,
                'country'       => $country,
                'txpower'       => intval($this->RadioSettings[$x]['radio'.$x.'_txpower'])
            ];
            
            //Unset htmode for legacy ($mode = a or g)
            if(($mode == 'a')||($mode == 'g')){
                unset($options_array['htmode']);
            }
                    
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
               
        //== MESH Interfaces == (Interface 'zero_')===
        //Mesh settings
        $connectivity   = Configure::read('mesh_settings.connectivity');
		$encryption     = Configure::read('mesh_settings.encryption');
        $encryption_key = Configure::read('mesh_settings.encryption_key');
        
        //Get the connection type (IBSS or mesh_point)
        if($ent_mesh->mesh_setting != null){  
            $connectivity   = $ent_mesh->mesh_setting->connectivity;
            $encryption     = $ent_mesh->mesh_setting->encryption;
            $encryption_key = $ent_mesh->mesh_setting->encryption_key;
        }
        
        if($connectivity == 'IBSS'){
            $mode = 'adhoc';
        }
        
        if($connectivity == 'mesh_point'){
            $mode = 'mesh';
        }
                
        if($radio_count == 1){
            $this->RadioSettings[0]['radio0_mesh'] = 1; //Force mesh on single radio else it defies the object!
        }
        
        for ($x = 0; $x < $radio_count; $x++){ 
            if(
                (intval($this->RadioSettings[$x]['radio'.$x.'_disabled']) == 0)&& //Only if the radio is not disabled
                ($this->RadioSettings[$x]['radio'.$x.'_mesh']) //And if we allow mesh on the radio
            ){ 
            
                $iface_name  = $this->_number_to_word(0).'_'.$x;
                //Start with the basics array 
                $mesh_options = [
                    'device'    => 'radio'.$x,
                    'ifname'    => 'mesh'.$x,
                    'network'   => 'mesh',
                    'mode'      => $mode,
                ];    
            
                if($mode == 'adhoc'){
                    $mesh_options['ssid']   = $ent_mesh->ssid;
                    $mesh_options['bssid']  = $ent_mesh->bssid;
                }
                
                if($mode == 'mesh'){
                    $mesh_options['mesh_id']    = $ent_mesh->ssid;
                    $mesh_options['mcast_rate'] = 18000;
                    $mesh_options['disabled']   = 0;
                    $mesh_options['mesh_ttl']   = 1;
                    $mesh_options['mesh_fwding']= 0;
                    $mesh_options['encryption'] = 'none';
                }
                
                if(($mode == 'mesh')&&($encryption)){
                    $mesh_options['encryption'] = 'psk2/aes';
                    $mesh_options['key']        = $encryption_key;
                }
                
                // -- FIX ON NOV 2021 --               
                //Add this to fix the single radio mesh / client (sta) driver issue with same MAC
                if($radio_count == 1){ //Only do on single radio hardware as it broke on dual radio hardware (Meraki-Atheros)
                    $m = $this->getController()->getRequest()->getQuery('mac');
                    $m = strtoupper($m);
                    $m = str_replace('-', ':', $m);
                    $m = preg_replace('/^([0-9a-f]{2}[\:])/i', 'A'.$x.':', $m);
                    $mesh_options['macaddr'] = $m;
                }
                               
                array_push( $wireless,
                    [
                        "wifi-iface"   => $iface_name,
                        "options"      => $mesh_options
                    ]);
            }
        }
        
        $start_number = 2;

        //Check if we need to add this wireless VAP
        foreach($ent_mesh->mesh_entries as $me){ 
            $entry_id   = $me->id;
            
            if($me->apply_to_all == 1){
            
                //Check if it is assigned to an exit point
                foreach($entry_point_data as $epd){

                    if($epd['entry_id'] == $entry_id){ //We found our man :-) This means the Entry has been 'connected' to an exit point
                    
                    	$ssid_name = $me->name;
		                $script    = "/etc/MESHdesk/utils/ssid_on_off.lua";
		                
		                $start_disabled = $this->_scheduleStartDisabledTest($ent_mesh,$me->mesh_entry_schedules);		                
		                
		                foreach($me->mesh_entry_schedules as $sch){
		                	$sch->command 	= "$script '$ssid_name' '$sch->action'";
		                	$sch->type		= 'command';
		                	unset($sch->action);
		                   	unset($sch->ap_profile_entry_id);
		                    unset($sch->created);
		                    unset($sch->modified);
		                    array_push($this->WifiSchedules,$sch);                    
		                }
                    
                    
                        //Loop through all the radios
                        for ($y = 0; $y < $radio_count; $y++){
                        
                            $hwmode     = $wireless[$y]['options']['hwmode'];
                            $channel    = $wireless[$y]['options']['channel'];
                            $band       = 'two'; //Default is 2.4G
                            if($hwmode == '11a'){
                                $band = 'five'; 
                            }
                            
                            if(($me->frequency_band == 'five_upper')||($me->frequency_band == 'five_lower')){      
                                if($band == 'five'){ //This is actually a 5G radio now see if we need t o foce a match based on the channel
                                    if(($channel <= 48)&&($me->frequency_band == 'five_lower')){   
                                        $band = 'five_lower'; //We can enable it based on the channel setting of the radio
                                    }
                                     
                                    if(($channel >= 149)&&($me->frequency_band == 'five_upper')){   
                                        $band = 'five_upper'; //We can enable it based on the channel setting of the radio
                                    } 
                                }  
                            }
                            
                            if(
                                (intval($this->RadioSettings[$y]['radio'.$y.'_disabled']) == 0)&& //Only if the radio is not disabled
                                ($this->RadioSettings[$y]['radio'.$y.'_ap']) //And if we allow mesh on the radio
                            ){ 
                            
                            	//If it is NOT disabled in hardware BUT we have to diesable it on the schedule ($start_disabled) then make it disabled
                            	$disabled = $this->RadioSettings[$y]['radio'.$y.'_disabled'];
                            	if(($start_disabled)&&(!$disabled)){
                            		$disabled = $start_disabled;
                            	}
                            
                            
                                if(($me->frequency_band == 'both')||($me->frequency_band == $band)){
                                    $if_name    = $this->_number_to_word($start_number);
                                    
                                    $this->MetaData["$if_name"."$y"] = $me->id;
                                    
                                    if( ($epd['network'] == 'lan')&&
                                        (($this->getController()->getRequest()->getQuery('wbw_active') == '1')||($this->QmiActive == true))
                                    ){
                                        $epd['network'] = $this->if_wbw_nat_br;
                                    }
                                    
                                    $base_array = [
                                        "device"        => 'radio'.$y,
                                        "ifname"        => "$if_name"."$y",
                                        "mode"          => "ap",
                                        "network"       => $epd['network'],
                                        "encryption"    => $me->encryption,
                                        "ssid"          => $me->name,
                                        "key"           => $me->special_key,
                                        "hidden"        => $me->hidden,
                                        "isolate"       => $me->isolate,
                                        "auth_server"   => $me->auth_server,
                                        "auth_secret"   => $me->auth_secret,
                                        "disabled"      => $disabled
                                    ];
                                        
                                    if($me->chk_maxassoc){
                                        $base_array['maxassoc'] = $me->maxassoc;
                                    }
                                                       
                                    if($me->accounting){
                                        $base_array['acct_server']	= $me->auth_server;
                                        $base_array['acct_secret']	= $me->auth_secret;
                                        $base_array['acct_interval']= $this->acct_interval;
                                    }
                                    
                                    if($me->ieee802r){
	                                    $base_array['ieee80211r']				= $me->ieee802r;
	                                    $base_array['ft_over_ds']			    = $me->ft_over_ds;
	                                    $base_array['ft_psk_generate_local']	= $me->ft_pskgenerate_local; 
	                                    
	                                    if($me->mobility_domain !== ''){
		                                    $base_array['mobility_domain']  = $me->mobility_domain;
	                                    }                           	                          
                                    }   
                                                                       
                                    if($me->encryption == 'ppsk'){
										$base_array['encryption']	= 'psk2';
										$base_array['ppsk']			= '1';
										$base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
										$base_array['vlan_bridge']  = 'br-ex_v';
										//$base_array['vlan_tagged_interface']  = 'lan1';//Is this needed?
										$base_array['vlan_naming']	= '0';
																					
										//Set the flag
										$this->ppsk_flag = true;
									}
									
									//NASID: We can probaly send along regardless and we use a convention of: m_ / a_<entry_id>_<radio_number>_<ap_id>/node_id 
				                    if($me->auto_nasid){                         
				                    	//MESHdesk / AP Profile **(m/a)** _ **id** _ **entry_id**
                                	    $base_array['nasid'] = 'm_hosta_'.$me->mesh_id.'_'.$me->id;
                                	    if($me->accounting){
                                	        //MESHdesk / AP Profile **(m/a)** _ **id** _ **entry_id** _ **radio_number** _ **node id / ap id** 
                                	        $base_array['radius_auth_req_attr'] = '126:s:m_hosta_'.$me->mesh_id.'_'.$me->id.'_'.$y.'_'.$this->NodeId;  
                                	        $base_array['radius_acct_req_attr'] = '126:s:m_hosta_'.$me->mesh_id.'_'.$me->id.'_'.$y.'_'.$this->NodeId;
                                	    }                 	                           
				                    }else{
				                    	if($me->nasid !== ''){				                    	     
				                    		$base_array['nasid'] = $me->nasid;
				                    		if($me->accounting){
				                    		    //MESHdesk / AP Profile **(m/a)** _ **id** _ **entry_id** _ **radio_number** _ **node id / ap id**
				                    		    $base_array['radius_auth_req_attr'] = '126:s:m_hosta_'.$me->mesh_id.'_'.$me->id.'_'.$y.'_'.$this->NodeId;  
                                	            $base_array['radius_acct_req_attr'] = '126:s:m_hosta_'.$me->mesh_id.'_'.$me->id.'_'.$y.'_'.$this->NodeId;
                                	        }                          	         		                         	
				                    	}                            
				                    }
				                    
				                    //== May 2024== PPSK without RADIUS Support===
							        if($me->encryption == 'ppsk_no_radius'){
								        $base_array['encryption']	= 'psk2';
								        $base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
								        $base_array['vlan_bridge']  = 'br-ex_v';
								        //$base_array['vlan_tagged_interface']  = $this->br_int; //Is this needed?
								        $base_array['vlan_naming']	= '0';
								        $base_array['wpa_psk_file'] = '/etc/hostapd-'.$me->private_psk_id.'.wpa_psk';
					                    $base_array['vlan_file'] = '/etc/hostapd.vlan';								
								        //Set the flag
								        $this->ppsk_flag = true;
								        $this->private_psks[$me->private_psk_id] = []; //Populate it with an empty list first;
								        
								        //Unset some items
								        foreach($this->ppsk_unset as $u){
								            unset($base_array[$u]);
								        }							    							    
							        }									

                                    if($me->macfilter != 'disable'){
                                        $base_array['macfilter']    = $me->macfilter;
                                        $mac_list                   = $this->_find_mac_list($me->permanent_user_id);
                                        if(count($mac_list)>0){
                                            $base_array['maclist'] = implode(" ",$mac_list);
                                        }
                                    }
                                    
                                    $lists = [];
                                    
                                    if($me->hotspot2_enable){
                                    	Configure::load('Hotspot2');
        								$options = Configure::read('Hotspot2.options'); 
        								$base_array = array_merge($base_array,$options);
        								$lists	 = Configure::read('Hotspot2.lists');                                  
                                    }
                                   
                                    
                                    array_push( $wireless,
                                        [
                                            "wifi-iface"=> "$if_name",
                                            "options"   => $base_array,
                                            "lists"		=> $lists
                                    ]); 
                                    $start_number++;                         
                                }
                            }    
                        }
                                               
                        break; //No need to go further
                    }
                }
            }else{
                //Check if this entry point is statically attached to the node
               // print_r($mesh['Node']);
                foreach($ent_mesh->nodes as $node){
                    if($node->id == $this->NodeId){   //We have our node
                        foreach($node->node_mesh_entries as $nme){
                            if($nme->mesh_entry_id == $entry_id){
                                //Check if it is assigned to an exit point
                                foreach($entry_point_data as $epd){
                                    //We have a hit; we have to  add this entry                                   
                                    if($epd['entry_id'] == $entry_id){ //We found our man :-)
                                    
                                    	$ssid_name = $me->name;
										$script    = "/etc/MESHdesk/utils/ssid_on_off.lua";
																				
										$start_disabled = $this->_scheduleStartDisabledTest($ent_mesh,$me->mesh_entry_schedules);		                
										
										foreach($me->mesh_entry_schedules as $sch){
											$sch->command 	= "$script '$ssid_name' '$sch->action'";
											$sch->type		= 'command';
											unset($sch->action);
										   	unset($sch->ap_profile_entry_id);
										    unset($sch->created);
										    unset($sch->modified);
										    array_push($this->WifiSchedules,$sch);                    
										}
                                                                       
                                        //Loop through all the radios
                                        for ($y = 0; $y < $radio_count; $y++){
                                        
                                            $hwmode     = $wireless[$y]['options']['hwmode'];
                                            $channel    = $wireless[$y]['options']['channel'];
                                            $band       = 'two'; //Default is 2.4G
                                            if($hwmode == '11a'){
                                                $band = 'five'; 
                                            }
                            
                                            if(($me->frequency_band == 'five_upper')||($me->frequency_band == 'five_lower')){      
                                                if($band == 'five'){ //This is actually a 5G radio now see if we need t o foce a match based on the channel
                                                    if(($channel <= 48)&&($me->frequency_band == 'five_lower')){   
                                                        $band = 'five_lower'; //We can enable it based on the channel setting of the radio
                                                    }
                                                     
                                                    if(($channel >= 149)&&($me->frequency_band == 'five_upper')){   
                                                        $band = 'five_upper'; //We can enable it based on the channel setting of the radio
                                                    } 
                                                }  
                                            }
                                            
                                            if(
                                                (intval($this->RadioSettings[$y]['radio'.$y.'_disabled']) == 0)&& //Only if the radio is not disabled
                                                ($this->RadioSettings[$y]['radio'.$y.'_ap']) //And if we allow mesh on the radio
                                            ){ 
                                        
                                                if(($me->frequency_band == 'both')||($me->frequency_band == $band)){
                                                    $if_name    = $this->_number_to_word($start_number);  
                                                    
                                                    $this->MetaData["$if_name"."$y"] = $me->id;
                                                    
                                                    if( ($epd['network'] == 'lan')&&
                                                        (($this->getController()->getRequest()->getQuery('wbw_active') == '1')||($this->QmiActive == true))
                                                    ){
                                                        $epd['network'] = $this->if_wbw_nat_br;
                                                    }
                                                    
                                                    //If it is NOT disabled in hardware BUT we have to diesable it on the schedule ($start_disabled) then make it disabled
                            						$disabled = $this->RadioSettings[$y]['radio'.$y.'_disabled'];
                            						if(($start_disabled)&&(!$disabled)){
                            							$disabled = $start_disabled;
                            						}
                                                                            
                                                    $base_array = [
                                                        "device"        => "radio".$y,
                                                        "ifname"        => "$if_name"."$y",
                                                        "mode"          => "ap",
                                                        "network"       => $epd['network'],
                                                        "encryption"    => $me->encryption,
                                                        "ssid"          => $me->name,
                                                        "key"           => $me->special_key,
                                                        "hidden"        => $me->hidden,
                                                        "isolate"       => $me->isolate,
                                                        "auth_server"   => $me->auth_server,
                                                        "auth_secret"   => $me->auth_secret,
                                                        "disabled"      => $disabled
                                                    ];
                                                    
                                                    if($me->chk_maxassoc){
                                                        $base_array['maxassoc'] = $me->maxassoc;
                                                    }                                                    
                                                    
                                                    if($me->accounting){
                                                        $base_array['acct_server']	= $me->auth_server;
                                                        $base_array['acct_secret']	= $me->auth_secret;
                                                        $base_array['acct_interval']= $this->acct_interval;
                                                    }
                                                    
                                                    if($me->ieee802r){
	                                                    $base_array['ieee80211r']			= $me->ieee802r;  //FIXME A Typo slipped in ... OpenWrt looking for ieee80211r and not ieee802r
	                                                    $base_array['ft_over_ds']			= $me->ft_over_ds;
	                                                    $base_array['ft_psk_generate_local']	= $me->ft_pskgenerate_local; //FIXME Another Type slipped in ... OpenWrt looking for ft_psk_generate_local
	                                                    
	                                                    if($me->mobility_domain !== ''){
		                                                    $base_array['mobility_domain']  = $me->mobility_domain;
	                                                    }                           	                          
                                                    }     
                                                    
                                                    //OCT 2022
                                                    if($me->encryption == 'ppsk'){
														$base_array['encryption']	= 'psk2';
														$base_array['ppsk']			= '1';
														$base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
														$base_array['vlan_bridge']  = 'br-ex_v';
														//$base_array['vlan_tagged_interface']  = 'lan1';//Is this needed?
														$base_array['vlan_naming']	= '0';													
														//Set the flag
														$this->ppsk_flag = true;
													}
												    if($me->auto_nasid){                         
												    	//MESHdesk / AP Profile **(m/a)** _ **id** _ **entry_id**
                                	                    $base_array['nasid'] = 'm_hosta_'.$me->mesh_id.'_'.$me->id;
                                	                    if($me->accounting){
                                	                        //MESHdesk / AP Profile **(m/a)** _ **id** _ **entry_id** _ **radio_number** _ **node id / ap id**  
                                	                        $base_array['radius_auth_req_attr'] = '126:s:m_hosta_'.$me->mesh_id.'_'.$me->id.'_'.$y.'_'.$this->NodeId;
                                	                        $base_array['radius_acct_req_attr'] = '126:s:m_hosta_'.$me->mesh_id.'_'.$me->id.'_'.$y.'_'.$this->NodeId;
                                	                    }                                       
												    }else{
												    	if($me->nasid !== ''){
												    		$base_array['nasid'] = $me->nasid;
												    		if($me->accounting){
												    		    //MESHdesk / AP Profile **(m/a)** _ **id** _ **entry_id** _ **radio_number** _ **node id / ap id** 												    		
												    		    $base_array['radius_auth_req_attr'] = '126:s:m_hosta_'.$me->mesh_id.'_'.$me->id.'_'.$y.'_'.$this->NodeId; 
                                	                            $base_array['radius_acct_req_attr'] = '126:s:m_hosta_'.$me->mesh_id.'_'.$me->id.'_'.$y.'_'.$this->NodeId; 
                                	                        }                          	
												    	}                            
												    }
												    
												    //== May 2024== PPSK without RADIUS Support===
							                        if($me->encryption == 'ppsk_no_radius'){
								                        $base_array['encryption']	= 'psk2';
								                        $base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
								                        $base_array['vlan_bridge']  = 'br-ex_v';
								                        //$base_array['vlan_tagged_interface']  = $this->br_int; //Is this needed?
								                        $base_array['vlan_naming']	= '0';
								                        $base_array['wpa_psk_file'] = '/etc/hostapd-'.$me->private_psk_id.'.wpa_psk';
					                                    $base_array['vlan_file'] = '/etc/hostapd.vlan';								
								                        //Set the flag
								                        $this->ppsk_flag = true;
								                        $this->private_psks[$me->private_psk_id] = []; //Populate it with an empty list first;
								                        
								                        //Unset some items
								                        foreach($this->ppsk_unset as $u){
								                            unset($base_array[$u]);
								                        }							    							    
							                        }			
                                                    
                                                   	if($me->macfilter != 'disable'){
                                                        $base_array['macfilter']    = $me->macfilter;
                                                        $mac_list                   = $this->_find_mac_list($me->permanent_user_id);
                                                        if(count($mac_list)>0){
                                                            $base_array['maclist'] = implode(" ",$mac_list);
                                                        }
                                                    }
                                                    
                                                  	$lists = [];
                                    
								                    if($me->hotspot2_enable){
								                    	Configure::load('Hotspot2');
														$options = Configure::read('Hotspot2.options'); 
														$base_array = array_merge($base_array,$options);
														$lists	 = Configure::read('Hotspot2.lists');                                  
								                    }

                                                    array_push( $wireless,
								                        [
								                            "wifi-iface"=> "$if_name",
								                            "options"   => $base_array,
								                            "lists"		=> $lists
								                    ]); 
                                                    $start_number++; 
                                            
                                                }
                                            }  
                                        }
                                                                                                                                 
                                        break;
                                    }
                                }
                            }
                        }                       
                        break;
                    }
                }
            }
        }
        
        //===Hidden Config style SSID === (Interface 'one_')===
        for ($x = 0; $x < $radio_count; $x++){  
            if(
                (intval($this->RadioSettings[$x]['radio'.$x.'_disabled']) == 0)&& //Only if the radio is not disabled
                ($this->RadioSettings[$x]['radio'.$x.'_config']) //And if we allow mesh on the radio
            ){  
         
                //Move to the end so that the first 'real' SSID will have the vendor's MAC
                //Add the hidden config VAP
                $one  = $this->_number_to_word(1);
                $iface_name = $one.'_'.$x;
                
                $this->MetaData[$one."$x"] = 0;
                
                array_push( $wireless,
                    [
                        "wifi-iface"    => $iface_name,
                        "options"   => [
                            "device"        => 'radio'.$x,
                            "ifname"        => $one."$x",
                            "mode"          => "ap",
                            "encryption"    => "psk-mixed",
                            "network"       => $one,
                            "ssid"          => "meshdesk_config",
                            "key"           => $client_key,
                            "hidden"        => "1"
                       ]
                    ]);
            }      
        }
         
        return $wireless;  
    }
    
    
     private function _build_openvpn_bridges($openvpn_list){
        $openvpn_bridges = [];
        foreach($openvpn_list as $o){
        
            $br                 = [];
            $br['interface']    = $o['interface'];
            $br['up']           = "mesh_".$this->Mac."\n".md5("mesh_".$this->Mac)."\n";
            $br['ca']           = $o['ca_crt'];
            $br['vpn_gateway_address'] = $o['vpn_gateway_address'];
            $br['vpn_client_id'] = $o['vpn_client_id'];
            
            Configure::load('OpenvpnClientPresets');
            $config_file    = Configure::read('OpenvpnClientPresets.'.$o['config_preset']); //Read the defaults

            $config_file['remote']  = $o['ip_address'].' '.$o['port'];
//            $config_file['up']      = '"/etc/openvpn/up.sh br-'.$o['interface'].'"';
            $config_file['proto']   = $o['protocol'];
            $config_file['ca']      = '/etc/openvpn/'.$o['interface'].'_ca.crt';
            $config_file['auth_user_pass'] = '/etc/openvpn/'.$o['interface'].'_up';  
            $br['config_file']      = $config_file;
            array_push($openvpn_bridges,$br);
        }
        return $openvpn_bridges;
    }


    private function _eth_br_for($hw){
		$return_val = 'eth0'; //some default
		
		$q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hw, 'Hardwares.for_mesh' => true])->first();
		if($q_e){
		    $return_val = $q_e->wan;   
		}
		return $return_val;
	}
	
	private function _lan_if_for($hw){
		$return_val = false; //By default false to catch devices with single ethernet port
		$q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hw, 'Hardwares.for_mesh' => true])->first();
		if($q_e){
		    $return_val = [$q_e->lan];
		    $ports = preg_split('/\s+/', $q_e->lan);//New format if there are multiple items
		    if($ports){
		    	$return_val = $ports; 
		    }      
		}
		return $return_val;
	}
	
	private function _number_to_word($number) {
        $dictionary  = [
            0                   => 'zro',
            1                   => 'one',
            2                   => 'two',
            3                   => 'thr',
            4                   => 'for',
            5                   => 'fve',
            6                   => 'six',
            7                   => 'svn',
            8                   => 'egt',
            9                   => 'nne',
            10                  => 'ten',
            11                  => 'elv',
            12                  => 'tve',
            13                  => 'trt',
            14                  => 'frt',
            15                  => 'fft',
            16                  => 'sxt',
            17                  => 'svt',
            18                  => 'eit',
            19                  => 'nnt',
            20                  => 'twt'
        ];
        return($dictionary[$number]);
    }     
	
	/*private function _number_to_word($number) {
   
   
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
    } */
    
    private function _find_mac_list($pu_uid){
    
        $pu_id      = $me->permanent_user_id;
        $ent_dev    = $this->Devices->find()->where(['Devices.permanent_user_id' => $pu_id])->all();
        $mac_list   = [];
        foreach($ent_dev as $device){
            $mac = $device->name;
            $mac = str_replace('-',':',$mac);
            array_push($mac_list,$mac);
        }    
        return $mac_list;
    }
    
    private function _checkForWbWReplacement(){ 
     
        $ret_data                   = [];
        $ret_data['two_replace']    = false;
        $ret_data['five_replace']   = false;
        $unix_start                 = 1; //Anything will be gigger than one    
        foreach($this->ent_mesh->nodes as $node){                
            foreach($node->node_connection_settings as $ncs){  
                //Only if it matches
                if(($ncs->node_id == $this->NodeId)&&($ncs->grouping == 'wbw_setting')){
                    $this->wbw_settings['proto'] = 'dhcp'; //default 
                }
                if(($ncs->node_id == $this->NodeId)&&($ncs->grouping == 'wifi_pppoe_setting')){
                    $this->wbw_settings['proto'] = 'pppoe'; 
                }
                if(($ncs->node_id == $this->NodeId)&&($ncs->grouping == 'wifi_static_setting')){
                    $this->wbw_settings['proto'] = 'static'; 
                }     
                
                if(($ncs->node_id == $this->NodeId)&&(($ncs->grouping == 'wbw_setting')||($ncs->grouping == 'wifi_static_setting')||($ncs->grouping == 'wifi_pppoe_setting'))){
                    if($ncs->value !== ''){ 
                        $this->wbw_settings[$ncs->name] = $ncs->value;
                    }
                }
                                     
                if(($ncs->grouping == 'wbw_info')&&($ncs->name == 'channel')){
                    $this_unix = $ncs->modified->i18nFormat(Time::UNIX_TIMESTAMP_FORMAT);
                    if($this_unix > $unix_start){
                        $unix_start = $this_unix;
                        if($ncs->value < 14){
                            $ret_data['two_replace']  = true;
                            $ret_data['two_chan']     = $ncs->value;    
                        }
                        if($ncs->value > 30){
                            $ret_data['five_replace'] = true;
                            $ret_data['five_chan']     = $ncs->value;    
                        }
                    };   
                }
            }
        }
        return $ret_data;
    }
    
    private function _checkForRebootSettings(){
    
        //print_r($this->EntNode);
        foreach($this->ent_mesh->nodes as $node){
        
            if($this->Mac ==$node->mac){
                foreach($node->node_connection_settings as $ncs){
                    if(($ncs->node_id == $this->NodeId)&&($ncs->grouping == 'reboot_setting')){ 
                        $this->reboot_setting[$ncs->name] = $ncs->value;
                    } 
                }
            }      
        }
    
    }
    
    private function _make_linux_password($pwd){
		return exec("openssl passwd -1 $pwd");
	}
	
	private function _checkForWanSpecific(){  
        $ret_data   = [];      
        foreach($this->ent_mesh->nodes as $node){                
            foreach($node->node_connection_settings as $ncs){
                if(($ncs->node_id == $this->NodeId)&&($ncs->grouping == 'wan_pppoe_setting')){
                    $ret_data['proto'] = 'pppoe'; 
                }
                if(($ncs->node_id == $this->NodeId)&&($ncs->grouping == 'wan_static_setting')){
                    $ret_data['proto'] = 'static'; 
                }     
                
                if(($ncs->node_id == $this->NodeId)&&(($ncs->grouping == 'wan_static_setting')||($ncs->grouping == 'wan_pppoe_setting'))){
                    if($ncs->value !== ''){ 
                        $ret_data[$ncs->name] = $ncs->value;
                    }
                }
            }
        }
        return $ret_data;
    }
    
    private function _checkForQmi(){  
        $wwan_options   = [];
        $if_data        = false;   
        foreach($this->ent_mesh->nodes as $node){                
            foreach($node->node_connection_settings as $ncs){                
                if(($ncs->node_id == $this->NodeId)&&($ncs->grouping == 'qmi_setting')){
                    if($ncs->value !== ''){ 
                        $this->QmiActive = true;
                        $wwan_options[$ncs->name] = $ncs->value;
                    }
                }
            }
        }
        if($this->QmiActive == true){
            $wwan_options['proto']      = 'qmi';
            $wwan_options['device']     = '/dev/cdc-wdm0';
            $wwan_options['disabled']   = '0';
            $wwan_options['ifname']     = 'wwan';
            $if_data                = [
	                "interface" => "wwan",
	                "options"   => $wwan_options
	       	];        
        }
        return $if_data;
    }
    
    private function _scheduleStartDisabledTest($ent_mesh,$schedules){
	
		$default_data = $this->_getDefaultSettings();
		//Timezone
        if($ent_mesh->node_setting !== null && $ent_mesh->node_setting->tz_value != ''){
            $tz_name   	= $ent_mesh->node_setting->tz_name;
        }else{
            $tz_name   	= $default_data['tz_name'];
        }
              
        //Get the timezone the device will be set to
        $now    	= FrozenTime::now()->setTimezone($tz_name);
        $day_start  = $now->startOfDay();
        $minute_now = $now->diffInMinutes($day_start);
        $day_of_week= $this->week_days[$now->dayOfWeek];
        
        $last_action_time= -1;
        $last_action;
              	
		foreach($schedules as $s){
			if(($s->event_time <= $minute_now)&&($s->{"$day_of_week"} == true)){			
				if($s->event_time > $last_action_time){ //Get the most recent action
					$last_action_time = $s->event_time;
					$last_action = $s->action;
				}		
			}		
		}
		
		if($last_action_time > -1){
			if($last_action == 'off'){ //It needs to start up DISABLED based on the last action
				return true;
			}
		}
						
		return false; // Default is NOT disabled	
	}
	
	private function _formulate_ppsk_file($ppsk_id){
	
	    $lines = [];
	    $items = $this->PrivatePskEntries->find()->where(['PrivatePskEntries.private_psk_id' => $ppsk_id])->all();
	    foreach($items as $i){
	        if($i->active){
	            if(strlen($i->comment)>0){
	                array_push($lines, '#'.$i->comment);
	            }
	            $mac  = '00:00:00:00:00:00';
	            if(strlen($i->mac)>0){
	                $mac = $i->mac;
	            }
	            if($i->vlan > 0){
	                array_push($lines,"vlanid=".$i->vlan.' '.$mac.' '.$i->name);
	            }else{
	                array_push($lines, $mac.' '.$i->name);  
	            }
	        }
	    }
	    return implode("\n",$lines);	
	}
       
}
