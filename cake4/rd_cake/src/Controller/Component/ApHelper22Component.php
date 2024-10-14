<?php

//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component that is used to build the JSON reply for a device uses as a pure Access Point
//---- Date: 19-SEPT-2022
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class ApHelper22Component extends Component {

	protected $components 	= ['Firewall','MdFirewall','AccelPpp', 'Sqm'];
    protected $main_model   = 'Aps';
    protected $ApId     = '';
	protected $Hardware = 'creatcomm_ta8h'; //Some default value
	protected $Power	= '10'; //Some default
    protected $RadioSettings = [];
    protected $WbwActive    = false;
    protected $QmiActive    = false;
    protected $WbwChannel   = 0;
    
    protected $Schedules    = false;
    protected $WifiSchedules = [];
    protected $week_days 	= [ 1 => 'mo',2 => 'tu',3 => 'we',4 => 'th',5 => 'fr',6 => 'sa',7 => 'su'];
    

    protected $special_mac = "30-B5-C2-B3-80-B1"; //hack

    protected $l3_vlans = []; //Layer three VLAN interfaces
    
    protected $ent_mesh         = null;
    protected $if_wbw_nat_br    = null;
    protected $wbw_settings     = [];
    protected $wan_settings     = [];
    protected $reboot_setting   = [];
    
    protected $ppsk_flag		= false;
    protected $private_psks     = [];
      
    protected $stp_dflt			= 0;
    
    protected $acct_interval	= 300; //Heads-up if you have larde deployments and want to reduce the RADIUS Accounting traffic, increate this value to 3600(hour) or 1800 (half hour)
    
    protected $br_int			= 'eth0'; //bogus filler
    
    //Jan 2024 - Add a flag which will be triggered if wan interface is defined as 'eth0 eth1' This is to accomodate a special config to get VLANs to work on certain Mediatek based hardware
    protected $vlan_hack        = false;


    public function initialize(array $config):void{
        //Please Note that we assume the Controller has a JsonErrors Component Included which we can access.
        $this->controller       = $this->_registry->getController();
        $this->Aps              = TableRegistry::get('Aps');
        $this->UnknownAps       = TableRegistry::get('UnknownAps');
        $this->ApProfileSettings= TableRegistry::get('ApProfileSettings');
        $this->ApProfiles       = TableRegistry::get('ApProfiles');
        $this->OpenvpnServers   = TableRegistry::get('OpenvpnServers');
        $this->ApProfileEntries = TableRegistry::get('ApProfileEntries');
        $this->Hardwares        = TableRegistry::get('Hardwares'); 
        $this->UserSettings     = TableRegistry::get('UserSettings');
        $this->Timezones        = TableRegistry::get('Timezones');
        $this->OpenvpnServerClients   = TableRegistry::get('OpenvpnServerClients');
        $this->Devices          = TableRegistry::get('Devices');   
        
        $this->ApConnectionSettings     = TableRegistry::get('ApConnectionSettings');
        $this->PrivatePskEntries= TableRegistry::get('PrivatePskEntries');    
    }
    
    public function JsonForAp($mac){
      
        $ent_ap = $this->{$this->main_model}->find()->where(['Aps.mac' => $mac])->first();
        
         if($ent_ap){           
                        
                $ap_profile_id  = $ent_ap->ap_profile_id;
                $this->ApId     = $ent_ap->id;
                $this->Mac      = $mac;
				$this->Hardware	= $ent_ap->hardware;
				
				$this->MetaData             = [];
		        $this->MetaData['mode']     = 'ap';
		        $this->MetaData['mac']      = $mac;
		        $this->MetaData['ap_id']    = $this->ApId;
		        $this->MetaData['node_id']  = $this->ApId; //Add this to keep the firmware simple and backward compatible
		        
		        
		        $this->_update_wbw_channel(); //Update the wbw channel if it is included
		        
                $query = $this->{$this->main_model}->find()->contain([
                    'ApApProfileEntries' => [
                        'ApProfileEntries' => [
                            'ApProfileEntrySchedules'
                        ],
                    ],
                    'ApStaticEntryOverrides',
                    'ApProfiles' => [
                        'ApProfileEntries' => [ 
                        	'ApProfileEntrySchedules'
                        ],
                        'ApProfileSettings' => [
                            'Schedules' => [
                                'ScheduleEntries' => [
                                    'PredefinedCommands'
                                ]
                            ]
                        ],
                        'ApProfileSpecifics',
                        'ApProfileExits' => [
                            'ApProfileExitApProfileEntries',
                            'ApProfileExitCaptivePortals',
                            'ApProfileExitSettings',
                            'ApProfileExitPppoeServers',
                            'SqmProfiles'
                        ]
                    ],
                    'Schedules' => [
                        'ScheduleEntries' => [
                            'PredefinedCommands'
                        ]
                    ]
                ]);
                $ap_profile = $query->where(['ApProfiles.id' => $ap_profile_id,'Aps.mac' =>$mac])->first();

                $ap_profile['ApsDetail'] = $ent_ap;             
                $this->_update_fetched_info($ent_ap);
                
                          
                $json = $this->_build_json($ap_profile);
                
                $firewall = $this->Firewall->JsonForMac($mac);
            	if($firewall){
            		$json['config_settings']['firewall'] = $firewall;
            	}
            	
            	$adv_firewall = $this->MdFirewall->JsonForMac($mac);
            	if($adv_firewall){
            		$json['config_settings']['adv_firewall'] = $adv_firewall;
            	}
            	
            	$sqm_profiles = $this->Sqm->jsonForMac($mac);
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
            $channel = $this->getController()->getRequest()->getQuery('wbw_channel');
            $ent_channel = $this->ApConnectionSettings->find()
                ->where([
                    'ApConnectionSettings.ap_id'    => $this->ApId,
                    'ApConnectionSettings.grouping'   => 'wbw_info',
                    'ApConnectionSettings.name'       => 'channel']
                )->first();
            if($ent_channel){
                $this->ApConnectionSettings->patchEntity($ent_channel,['value'=>$channel]);
            }else{
                $d = [];
                $d['ap_id']         = $this->ApId;
                $d['grouping']      = 'wbw_info';
                $d['name']          = 'channel';
                $d['value']         = $channel;
                $ent_channel = $this->ApConnectionSettings->newEntity($d);
            }
            $this->WbwActive  = true;
            $this->WbwChannel = $channel;     
            $this->ApConnectionSettings->save($ent_channel);
        }
    }
    
    private function _update_fetched_info($ent_ap){

        if ($this->_isSampleRequest()) {
            return;
        }

        if (!$ent_ap) {
            // Handle invalid entity
            throw new \InvalidArgumentException('Invalid entity');
        }

        $fetchedInfo = [];
        $fetchedInfo['id'] = $this->ApId;
        $fetchedInfo['config_fetched'] = FrozenTime::now();
        $fetchedInfo['last_contact_from_ip'] = $this->getController()->getRequest()->clientIp();

        $this->{$this->main_model}->patchEntity($ent_ap, $fetchedInfo);

        if (!$this->{$this->main_model}->save($ent_ap)) {
            // Handle save error
            throw new \RuntimeException('Failed to save entity');
        }
    }
    
    private function _isSampleRequest(){

        return $this->getController()->getRequest()->getQuery('sample') === 'true';
    }
       
     //___________________ AP Settings and related functions _________________
    private function  _build_json($ap_profile){

        //Basic structure
        $json = [];
        $json['meta_data']                      = []; //Add Meta Data for better reporting
        $json['timestamp']                      = 1; 
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
        
        //===WbW=====   
        if($this->wbw_settings){  
            $json['config_settings']['web_by_wifi'] = $this->wbw_settings;
        }
        
        //==Reboot Settings====
        $this->_checkForRebootSettings();
        if($this->reboot_setting){  
            $json['config_settings']['reboot_setting'] = $this->reboot_setting;
        }       

        //========== Gateway  ======
        $json['config_settings']['gateways']        = $net_return[2]; //Gateways
        $json['config_settings']['gateway_details'] = $net_return[5]; //Gateways
        $json['config_settings']['captive_portals'] = $net_return[3]; //Captive portals
        $json['config_settings']['accel_servers']   = $net_return[6]; //Accel-ppp servers

        $openvpn_bridges                            = $this->_build_openvpn_bridges($net_return[4]);
        $json['config_settings']['openvpn_bridges'] = $openvpn_bridges; //Openvpn Bridges

		//======== System related settings ======
		$system_data 		= $this->_build_system($ap_profile);
		$json['config_settings']['system'] = $system_data;
		
		//=== Schedules ===
		//Direct Schedules
        if(($ap_profile->schedule)&&($ap_profile->enable_schedules == '1')){
            if(count($ap_profile->schedule->schedule_entries)>0){
                $arr_shedule_entries = [];
                foreach($ap_profile->schedule->schedule_entries as $ent_se){
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
        //AP Profile Schedules
        if($this->Schedules == false){      
            if($ap_profile->ap_profile->ap_profile_setting){            
                if(($ap_profile->ap_profile->ap_profile_setting->schedule)&&($ap_profile->ap_profile->ap_profile_setting->enable_schedules== '1')){                  
                    if(count($ap_profile->ap_profile->ap_profile_setting->schedule->schedule_entries)>0){
                        $arr_shedule_entries = [];
                        foreach($ap_profile->ap_profile->ap_profile_setting->schedule->schedule_entries as $ent_se){
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
		
		//--- Mar 2021 --- Add some metadata ----
		$this->MetaData['WbwActive']    = $this->WbwActive;
		$this->MetaData['QmiActive']    = $this->QmiActive;
		$json['meta_data']              = $this->MetaData;	

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
            $ss['timezone']     = $ap_profile->ap_profile->ap_profile_setting->tz_value;
        } else {
            $ss['timezone']     = $default_data['tz_value'];
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
        
        //Advanced Reporting
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->report_adv_proto != ''){  
            $ss['report_adv_enable']    = true; //enable by default
            $ss['report_adv_proto']     = $ap_profile->ap_profile->ap_profile_setting->report_adv_proto;
            $ss['report_adv_light']     = $ap_profile->ap_profile->ap_profile_setting->report_adv_light;
            $ss['report_adv_full']      = $ap_profile->ap_profile->ap_profile_setting->report_adv_full;
            $ss['report_adv_sampling']  = $ap_profile->ap_profile->ap_profile_setting->report_adv_sampling;
        }else{
            $ss['report_adv_enable']    = true; //enable by default
            $ss['report_adv_proto']     = $default_data['report_adv_proto'];
            $ss['report_adv_light']     = $default_data['report_adv_light'];
            $ss['report_adv_full']      = $default_data['report_adv_full'];
            $ss['report_adv_sampling']  = $default_data['report_adv_sampling'];
        }

        $ss['hostname'] = $ap_profile->name;
        
        //System Specific Settings
		$want_these = ['mqtt_user','mqtt_password', 'mqtt_server_url', 'mqtt_command_topic'];
		$ent_us     = $this->UserSettings->find()->where(['UserSettings.user_id' => -1])->all();
	
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
    
        Configure::load('ApProfiles'); 
        $data  = Configure::read('common_ap_settings'); //Read the defaults
 
        $q_r = $this->{'UserSettings'}->find()->where(['user_id' => -1])->all();
        if($q_r){
            foreach($q_r as $s){
                        	            
            	//ALL Report Adv Related default settings will be 'report_adv_<whatever>'
                if(preg_match('/^report_adv_/',$s->name)){
                    $data[$s->name]    = $s->value;     
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

    private function _build_network($ap_profile){

        $network 				= [];
        $nat_data				= [];
        $captive_portal_data 	= [];
        $openvpn_bridge_data    = [];
		$include_lan_dhcp 		= true;
		$nat_detail				= [];		
		$interfaces				= [];	
		$dummy_start			= 100; //Dummy Interface start for Dynamic VLAN (PPSK)
		$pppoe_detail           = [];
		

        //--Jul 2021 --See if there are a WAN bridge to-- 
        $e_wan_bridge = $this->{'ApConnectionSettings'}->find()->where([
            'ApConnectionSettings.ap_id'    => $this->ApId,
            'ApConnectionSettings.name'     => 'wan_bridge',
        ])->first();
        
        $wan_bridge_id = 0; //Default = no bridge / leave as is     
        if($e_wan_bridge){        
            $wan_bridge_id = $e_wan_bridge->value;
        }
       
		
        //-> loopback if
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


        $br_int     = $this->_wan_for($this->Hardware);
        $this->br_int = $br_int;
        $version    = $this->getController()->getRequest()->getQuery('version');
        //SMALL HACK START 
		$m = $this->getController()->getRequest()->getQuery('mac');
        $m = strtolower($m);
        $m = str_replace('-', ':', $m);
        //SMALL HACK END
        
        //Default
        $wan_if = 'wan0'; //Just bogus value
        if($wan_bridge_id == 0){ //No bridging
            $wan_if = $br_int;
        }
        
        $wan_options = [
            "proto"     => "dhcp"
        ];
               
        $e_s = $this->{'ApConnectionSettings'}->find()->where([
            'ApConnectionSettings.ap_id'    => $this->ApId,
            'ApConnectionSettings.grouping' => 'wan_static_setting',
        ])->all();
        if(count($e_s)>0){
            $wan_options['proto'] = 'static';
            $dns = '';
            foreach($e_s as $acs){
                if($acs->name == 'dns_1'){
                    if($acs->value !== ''){
                        $dns = $acs->value;
                    }
                }
                if($acs->name == 'dns_2'){
                    if($acs->value !== ''){
                        $dns = $dns.' '.$acs->value;
                    }
                }
                if(($acs->name !== 'dns_1')&&($acs->name !== 'dns_2')){      
                    if($acs->value !== ''){     
                        $wan_options[$acs->name] = $acs->value;
                    }
                }              
            }
            if($dns !== ''){
                $wan_options['dns'] = $dns;    
            }
        }
        
        $e_p = $this->{'ApConnectionSettings'}->find()->where([
            'ApConnectionSettings.ap_id'    => $this->ApId,
            'ApConnectionSettings.grouping' => 'wan_pppoe_setting',
        ])->all();
        if(count($e_p)>0){
            $wan_options['proto'] = 'pppoe';
            $dns = '';
            foreach($e_p as $acp){
                if($acp->name == 'dns_1'){
                    if($acp->value !== ''){
                        $dns = $acp->value;
                    }
                }
                if($acp->name == 'dns_2'){
                    if($acp->value !== ''){
                        $dns = $dns.' '.$acp->value;
                    }
                }
                if(($acp->name !== 'dns_1')&&($acp->name !== 'dns_2')){
                    if($acp->value !== ''){     
                        $wan_options[$acp->name] = $acp->value;
                    }
                }              
            }
            if($dns !== ''){
                $wan_options['dns'] = $dns;    
            }         
        }
        
        $e_vlan = $this->{'ApConnectionSettings'}->find()->where([
            'ApConnectionSettings.ap_id'    => $this->ApId,
            'ApConnectionSettings.grouping' => 'vlan_setting',
            'ApConnectionSettings.name' 	=> 'vlan_admin',
        ])->first();
        
        if($e_vlan){
        	$wan_if = $wan_if.'.'.$e_vlan->value;
        }
        
      	array_push( $network,
            [
                "device" => "br-lan",
                "options"   => [
                	'name'	=> 'br-lan',
                	'type'	=> 'bridge'
                ],
                'lists'	=> ['ports' => [
                	$wan_if
                ]
        	]
        ]);
        
        $wan_options['device'] = 'br-lan';
        
        
        //---26Jan24 VLAN Hack---
        /* --Sample--
        config interface 'lan'
            option device 'br-lan'
            option proto 'dhcp'
            option ifname 'eth0 eth1'
            option stp '1'
        
        */
        if($this->vlan_hack){       
            $wan_options['ifname'] = 'eth0 eth1'; 
            $wan_options['stp']    =  '1';
        }
        //---
                      
        array_push( $network,
            [
                "interface" => "lan",
                "options"   => $wan_options
       	]); 	

		
		//LTE/4G - !!HEADSUP Place it here since some code expect the LAN IF to be on $network[1]['options']['ifname'];!!
        $e_qmi = $this->{'ApConnectionSettings'}->find()->where([
            'ApConnectionSettings.ap_id'    => $this->ApId,
            'ApConnectionSettings.grouping' => 'qmi_setting',
        ])->all();
        if(count($e_qmi)>0){
            $this->QmiActive            = true;
            $wwan_options               = [];
            $wwan_options['proto']      = 'qmi';
            $wwan_options['device']     = '/dev/cdc-wdm0';
            $wwan_options['disabled']   = '0';
            $wwan_options['ifname']     = 'wwan';
            foreach($e_qmi as $acp){              
                if($acp->value !== ''){     
                    $wwan_options[$acp->name] = $acp->value;
                }        
            }            
            array_push( $network,
	            [
	                "interface" => "wwan",
	                "options"   => $wwan_options
	       	]);                  
        }

        //Now we will loop all the defined exits **that has entries assigned** to them and add them as bridges as we loop.
        //The members of these bridges will be determined by which entries are assigned to them and specified
        //in the wireless configuration file

        $start_number = 0;
        $ifCounter      = 0;
        $loopCounter    = 0;      

        //We create a data structure which will be used to add the entry points and bridge them with
        //The correct network defined here
        $entry_point_data = [];

       /// print_r($ap_profile['ApProfileExit']);
       
       $this->MetaData['exits']= [];

        //Add the auto-attach entry points
        foreach($ap_profile->ap_profile->ap_profile_exits as $ap_profile_e){
                    
            $has_entries_attached   = false;
            $notVlan                = true;

            if (($ap_profile_e->vlan > 0) && ($ap_profile_e->type === 'nat')) {
                $if_name     = 'ex_v'.$ap_profile_e->vlan;
                $notVlan    = false;
            } else {
                $if_name = 'ex_' . $this->_number_to_word($ifCounter);
            }

            $exit_id                = $ap_profile_e->id;
            $type                   = $ap_profile_e->type;
            $vlan                   = $ap_profile_e->vlan;
            $eth_one_bridge         = false;
                                              
            //This is used to fetch info eventually about the entry points
            if(count($ap_profile_e->ap_profile_exit_ap_profile_entries) > 0){
                $has_entries_attached = true;
                foreach($ap_profile_e->ap_profile_exit_ap_profile_entries as $entry){
                    if($entry->ap_profile_entry_id == 0){
                        $eth_one_bridge = true;
                    }
                    
                    //==OCT ADD ON==
                    if(preg_match('/^-9/',$entry->ap_profile_entry_id)){ 	
		            	$dynamic_vlan = $entry->ap_profile_entry_id;
		            	$dynamic_vlan = str_replace("-9","",$dynamic_vlan);
		            	$if_name = 'ex_v'.$dynamic_vlan;
		            	$this->ppsk_flag = true; //set the heads-up flag
		            	$notVlan    = false;	            
		            }
		                               
                    if($type == 'bridge'){ //The gateway needs the entry points to be bridged to the LAN
                        array_push($entry_point_data, ['network' => 'lan','entry_id' => $entry->ap_profile_entry_id, 'exit_id'=> $entry->ap_profile_exit_id ]);
                    }else{
                        array_push($entry_point_data, ['network' => $if_name,'entry_id' => $entry->ap_profile_entry_id, 'exit_id'=> $entry->ap_profile_exit_id]);
                    }
                    
                   foreach($ap_profile->ap_static_entry_overrides as $override){                         
                        if($override->item == 'vlan'){
                            if($entry->ap_profile_entry_id == $override->ap_profile_entry_id){
                                $vlan = $override->value;
                            }                       
                        }  
                   }                    
                }           
            }
            
            $this->MetaData['exits'][] = [
                'id'        => $exit_id,
                'ap_profile_exit_id' => $exit_id, // With mesh we will make it mesh_exit_id
                'type'      => $type,
                'device'    => 'br-'.$if_name,
                'sqm'       => $ap_profile_e->apply_sqm_profile
            ];
                                   
            if($type == 'tagged_bridge_l3'){
                $has_entries_attached = true;
            }
            
            //We might have just WBW and single WAN port WITHOUT SSID
            if($exit_id == $wan_bridge_id){
                $has_entries_attached = true;   
            }

            if(($has_entries_attached == true)||($ap_profile_e->vlan > 0)){

            //print_r($ap_profile_e);

                $captive_portal_count = 1;

                if($type == 'tagged_bridge'){
                
                	$interfaces =  [ $br_int.'.'.$vlan ]; //only one
                	                
                	array_push($network,
	                    [
	                        "device"    => "br-$if_name",
	                        "options"   => [
	                        	"name"		=> "br-$if_name",
	                            "type"      => "bridge",
	                            'stp'       => $this->stp_dflt,
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
                                "proto"		=> "none",
                                "device"	=> "br-$if_name"
                        ]]
                    );
                    
                    if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;
                    continue;   //We don't care about the other if's
                }

                //== 20May2021 == Modify so it will use custom settings if defined 
                if($type == 'nat'){
                
                    $if_ipaddr          = "10.200.".(100+$loopCounter).".1";
                    $if_netmask         = "255.255.255.0";
                    $nat_detail_item    = [];
                    
                    if($ap_profile_e->vlan > 0){                   
                        $if_name            = 'ex_v'.$ap_profile_e->vlan;                      
                    }
                    
                    foreach($ap_profile_e->ap_profile_exit_settings as $s){                        
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
                                        
                    $interfaces =  [];
                    if($this->ppsk_flag){                 
                		$interfaces = ['eth'.$dummy_start]; 
	            		$dummy_start++; //Increment it with one;
	            	}
	            	            		   
                    if($eth_one_bridge == true){
                        $interfaces = array_merge($interfaces,$this->_lan_for($this->Hardware));
                    }
                    
                    if($ap_profile_e->vlan > 0){
                        $with_vlan = [];
                        foreach($this->_lan_for($this->Hardware) as $l){
                            array_push($with_vlan,$l.'.'.$ap_profile_e->vlan);
                        }
                        $interfaces = array_merge($interfaces,$with_vlan);                   
                    }
                    
                    
                    if($exit_id == $wan_bridge_id){
                        array_push($interfaces,$br_int);    
                    }
                    
                    $nat_bridge = [
                        "device"    => "br-$if_name",
                        "options"   => [
                        	"name"		=> "br-$if_name",
                            "type"      => "bridge",
                            'stp'       => $this->stp_dflt,
                       	],
                       	'lists'	=> [
                       		'ports'	=> $interfaces
                       	]                          
                    ];
		          	if(count($interfaces)==0){	//Remove if empty 	          	
		          		unset($nat_bridge['lists']);
		          	}
                    
                    array_push($network,$nat_bridge);
	                
	                                                                      
                    array_push($network,
                        [
                            "interface"    => "$if_name",
                            "options"   => [
                                "device"    => "br-$if_name",
                                'ipaddr'    =>  $if_ipaddr,
                                'netmask'   =>  $if_netmask,
                                'proto'     => 'static'
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

                if($type=='bridge'){  
                    $current_interfaces = $network[1]['lists']['ports'];                  
                    if($eth_one_bridge == true){
                        $current_interfaces = array_merge($current_interfaces,$this->_lan_for($this->Hardware));
                    }   
                
                    if(($this->WbwActive == true)||($this->QmiActive == true)){
                        $this->if_wbw_nat_br = $if_name;
                        $interfaces =  ["nat.".$loopCounter];
                        if($eth_one_bridge == true){
                            $current_interfaces = array_merge($interfaces,$this->_lan_for($this->Hardware));
                        }
                        if($exit_id == $wan_bridge_id){
                            array_push($interfaces,$br_int);    
                        }
                        
                        array_push($network,
		                    [
		                        "device"    => "br-$if_name",
		                        "options"   => [
		                        	"name"		=> "br-$if_name",
		                            "type"      => "bridge",
		                            'stp'       => $this->stp_dflt,
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
                                    'proto'     => 'static',
                                    'stp'       => $this->stp_dflt,
                                    'delegate'  => 0
                            ]]
                        );
                        //Push the nat data
                        array_push($nat_data,$if_name);                        
                    }else{                   
                        $network[1]['lists']['ports'] = $current_interfaces;
                    }                                                               
                    continue; //We dont care about the other if's
                }

                if($type == 'captive_portal'){
                

                    //---WIP Start---
                    if($ap_profile_e->ap_profile_exit_captive_portal->dnsdesk == true){
                        $if_ip      = "10.$captive_portal_count.0.2";
                    }
                    $captive_portal_count++; //Up it for the next one
                    //---WIP END---

                    $a = $ap_profile_e->ap_profile_exit_captive_portal;                   
                    
                    //Walled garden fix
                    $a->walled_garden = preg_replace('#\s+#',',',trim($a->walled_garden));
                    //coova_optional fix
                    if($a->coova_optional !== ''){
                        $a->coova_optional = trim($a->coova_optional);
                        $a->coova_optional = $a->coova_optional."\n";
                    }
                    //7May2022 remove empty UAMsecret
                    if($a->uam_secret == ''){
                        unset($a->uam_secret);
                    }                    
                    
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
                    //$a['radius_nasid']  = $ap_profile_name.'_'.$ap_dev_name.'_cp_'.$ap_profile_e->ap_profile_exit_captive_portal->ap_profile_exit_id;
                    $a['radius_nasid']  = 'ap_'.$this->ApId.'_cp_'.$ap_profile_e->ap_profile_exit_captive_portal->ap_profile_exit_id;
                    array_push($captive_portal_data,$a);
                    
                    $cp_interfaces = [];
                    //Add the LAN side if set as an interface to the bridge
                    if($eth_one_bridge == true){
                        $cp_interfaces = $this->_lan_for($this->Hardware);
                    }else{  
                    	//Set dummy interface for Dynamci VLAN 
                    	if($this->ppsk_flag){                 
                    		$cp_interfaces = ['eth'.$dummy_start]; 
		            		$dummy_start++; //Increment it with one;
		            	}	                  
                    }

                    if($ap_profile_e->ap_profile_exit_captive_portal->dnsdesk == true){
                        $options_cp = [
                            "proto"     => "none",
                            "ipaddr"    => "$if_ip",
                            "netmask"   => "255.255.255.0",
                            "proto"     => "static"
                        ];
                    }else{                  
                    
                        $options_cp = [
                             "proto"     => "none"
                        ];
                    }
                    
                    $cp_bridge = [
		                    "device"    => "br-$if_name",
		                    "options"   => [
		                    	"name"		=> "br-$if_name",
		                        "type"      => "bridge",
		                        'stp'       => $this->stp_dflt,
		                   	],
		                   	'lists'	=> [
		                   		'ports'	=> $cp_interfaces
		                   	]                          
		                ];
		          	if(count($cp_interfaces)==0){	//Remove if empty 	          	
		          		unset($cp_bridge['lists']);
		          	}
                    
                    array_push($network,$cp_bridge); 
		            
		            $options_cp['device'] = "br-$if_name";     
                    
                    array_push($network,["interface" => "$if_name","options"=> $options_cp]);
                    if($notVlan){
                        $ifCounter ++;
                    }
                    $loopCounter++;
                    continue; //We dont care about the other if's
                }

                //___ OpenVPN Bride ________
                if($type == 'openvpn_bridge'){

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
                        if($notVlan){
                            $ifCounter ++;
                        }
                        $loopCounter++;
                        continue; //We dont care about the other if's
                    }
                }

                 //____ LAYER 3 Tagged Bridge ____
                if($type == 'tagged_bridge_l3'){

                    $interfaces     = [$br_int.'.'.$ap_profile_e['vlan']];  //We only do eth0
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
                
                //____ PPPoE Server ____
                if($type == 'pppoe_server'){
                
                    $pppoe_if       = "br-$if_name";
                    $nas_identifier = 'a_pppoe_'.$ap_profile_e->id.'_'.$this->ApId;
                    
                    $profile_id     = $ap_profile_e->ap_profile_exit_pppoe_server->accel_profile_id;
                    
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
                        'server_type'       => 'ap_profile',
                        'nas_identifier'    => $nas_identifier,
                        'cloud_id'          => $ap_profile->ap_profile->cloud_id,
                        'pppoe_interface'   => $pppoe_if,
                        'mac'               => $this->Mac.'_'.$nas_identifier, //We do this to allow multiple servers to be defined
                        'accel_profile_id'  => $profile_id,
                        'name'              => $ap_profile->ap_profile->name.'_'.$nas_identifier
                    ];
                    
                    $pppoe_conf = $this->AccelPpp->JsonConfig($info);
                    array_push($pppoe_detail,$pppoe_conf);
                                                                                                     
                    array_push($network,
	                    [
	                        "device"    => "br-$if_name",
	                        "options"   => [
	                        	"name"		=> "br-$if_name",
	                            "type"      => "bridge",
	                            'stp'       => 1,
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
        return [$network,$entry_point_data,$nat_data,$captive_portal_data,$openvpn_bridge_data,$nat_detail,$pppoe_detail];
    }

    private function _build_wireless($ap_profile,$entry_point_data){

       // print_r($entry_point_data);

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
            'disabled','band','mode','width','txpower','include_beacon_int','beacon_int',
            'include_distance','distance','ht_capab','cell_density'
        ];
        $model  = $this->Hardware;
        $q_e    = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
        if($q_e){
            foreach($q_e->hardware_radios as $hr){    
                $radio_number   = $hr->radio_number;
                $prefix = 'radio'.$radio_number.'_';
                $ht_capab = [];
                foreach($radio_fields as $fr){ 
                    if($fr == 'ht_capab'){
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
        
            $ht_capab_zero  = [];
            $ht_capab_one   = [];
            $ht_capab_two   = [];
        
            if(count($q_r->ap_wifi_settings) > 0){
            
                foreach($q_r->ap_wifi_settings as $i){
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
        }
    }
    
    private function _build_radio_wireless($ap_profile,$entry_point_data,$radio_count){
    
        $wireless   = [];
        
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->country != ''){
            $country  = $ap_profile->ap_profile->ap_profile_setting->country;
        }else{
            $data       = $this->_getDefaultSettings();
            $country    = $data['country'];
        }
        
        
        //Check for wbw overrides
        $replace_info = $this->_checkForWbWReplacement();
        if($replace_info['two_replace'] == true){
            $two_chan = $replace_info['two_chan'];  
        }
        if($replace_info['five_replace'] == true){
            $five_chan = $replace_info['five_chan'];   
        }    
        
        
        for ($x = 0; $x < $radio_count; $x++) {
        
            if($this->RadioSettings[$x]['radio'.$x.'_band'] == '2g'){
                $channel = $this->RadioSettings[$x]['radio'.$x.'_channel_two'];
                
		        if(($this->WbwActive == true)&&($this->WbwChannel <= 14)){ //Assume g override        
		            $channel = $this->WbwChannel;
		        }	
            }
                
            if($this->RadioSettings[$x]['radio'.$x.'_band'] == '5g'){
                $channel    = $this->RadioSettings[$x]['radio'.$x.'_channel_five'];
              
		        if(($this->WbwActive == true)&&($this->WbwChannel > 14)){ //Assume a/ac override        
		            $channel = $this->WbwChannel;
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
                                
            $options_array = [
                'channel'       => $channel,
                'disabled'      => intval($this->RadioSettings[$x]['radio'.$x.'_disabled']),
                'hwmode'        => $hwmode,
                'htmode'        => $htmode.$width,
                'band'          => $band,
                'cell_density'  => intval($this->RadioSettings[$x]['radio'.$x.'_cell_density']),
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
               
        $start_number = 0;
        
		//____ ENTRY POINTS ____
        //Check if we need to add this wireless VAP
        foreach($ap_profile->ap_profile->ap_profile_entries as $ap_profile_e){
            $entry_id   = $ap_profile_e->id;
            
            if($ap_profile_e->apply_to_all == 1){
                       
                //Check if it is assigned to an exit point                  
                foreach($entry_point_data as $epd){
                    if($epd['entry_id'] == $entry_id){ //We found our man :-) This means the Entry has been 'connected' to an exit point
                                        
                    	//We start off by adding WiFi Scedules
                    	$ssid_name = $ap_profile_e->name;
                        $script    = "/etc/MESHdesk/utils/ssid_on_off.lua";
                        
                        $start_disabled = $this->_scheduleStartDisabledTest($ap_profile,$ap_profile_e->ap_profile_entry_schedules);
                        
                        foreach($ap_profile_e->ap_profile_entry_schedules as $sch){
                        	$sch->command 	= "$script '$ssid_name' '$sch->action'";
                        	$sch->type		= 'command';
                        	unset($sch->action);
                           	unset($sch->ap_profile_entry_id);
                            unset($sch->created);
                            unset($sch->modified);
                            array_push($this->WifiSchedules,$sch);                    
                        } 
                    
                    
                    	//FIXME DONT THINK THIS IS NEEDED ACTUALLY
                    	//Lets see if there is not perhaps a Dynamic VLAN to override the interface name 
                    	$exit_id = $epd['exit_id'];
                    	foreach($entry_point_data as $epd_vlan){
                    		if(($epd_vlan['exit_id'] == $exit_id)&&(preg_match('/^ex_v/',$epd_vlan['network']))){
                    			$epd['network'] = $epd_vlan['network'];
                    		}             	
                    	}
          
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
                                
                                $this->MetaData["$if_name"."$y"] = $ap_profile_e->id;
                                
                                //Change the bridge if auto-wbw detection and nat creation happened
                                if( ($epd['network'] == 'lan')&&
                                    (($this->WbwActive == true)||($this->QmiActive == true))
                                ){
                                    $epd['network'] = $this->if_wbw_nat_br;
                                }
                                
                                //If it is NOT disabled in hardware BUT we have to disable it on the schedule ($start_disabled) then make it disabled
                                $disabled = $this->RadioSettings[$y]['radio'.$y.'_disabled'];
                                if(($start_disabled)&&(!$disabled)){
                                	$disabled = $start_disabled;
                                }
                                                           
                                $base_array = [
                                    "device"        => "radio".$y,
                                    "ifname"        => "$if_name"."$y",
                                    "mode"          => "ap",
                                    "network"       => $epd['network'],
                                    "encryption"    => $ap_profile_e->encryption,
                                    "ssid"          => $ap_profile_e->name,
                                    "key"           => $ap_profile_e->special_key,
                                    "hidden"        => $ap_profile_e->hidden,
                                    "isolate"       => $ap_profile_e->isolate,
                                    "disabled"      => $disabled 
                                ];
                                
                                if($ap_profile_e->chk_maxassoc){
                                    $base_array['maxassoc'] = $ap_profile_e->maxassoc;
                                }
                                                                
                                if($ap_profile_e->ieee802r){
	                                $base_array['ieee80211r']				= $ap_profile_e->ieee802r; //FIXME A Typo slipped in ... OpenWrt looking for ieee80211r and not ieee802r
	                                $base_array['ft_over_ds']			    = $ap_profile_e->ft_over_ds;
	                                $base_array['ft_psk_generate_local']	= $ap_profile_e->ft_pskgenerate_local; //FIXME Another Type slipped in ... OpenWrt looking for ft_psk_generate_local
	                                
	                                if($ap_profile_e->mobility_domain !== ''){
		                                $base_array['mobility_domain']  = $ap_profile_e->mobility_domain;
	                                }                           	                          
                                }                                                      
                                                                                     
                                //==OCT 2022== Private PSK Support ==
                                /*
                                config wifi-iface 'default_radio0'
								    option device 'radio0'
								    option network 'lan'
								    option mode 'ap'
								    option ssid 'OpenWrt'
								    option encryption 'psk2'
								    option ppsk '1'
								    option auth_secret 'testing123'
								    option key '12345678'
								    option auth_server '192.168.8.101'
								    option nasid 'DisVrydag'
								    option dynamic_vlan '2'
								    option vlan_tagged_interface 'lan1'
								    option vlan_bridge 'br-vlan'
								    option vlan_naming '0'
							    */
							    
							    if($ap_profile_e->encryption == 'ppsk'){				                
				                    $base_array = $this->_addPpskSettings($base_array);								
					                //Set the flag
					                $this->ppsk_flag = true;
				                }
							    
							    							    
							    if($ap_profile_e->encryption == 'wpa2'){
								    $base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
								    $base_array['vlan_bridge']  = 'br-ex_v';
								    $base_array['vlan_tagged_interface']  = $this->br_int; //WAN port on LAN bridge
								    $base_array['vlan_naming']	= '0';
							    }							    
							    						    
							    							    
							    //== May 2024== PPSK without RADIUS Support===
							    if($ap_profile_e->encryption == 'ppsk_no_radius'){
								    $base_array['encryption']	= 'psk2';
								    $base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
								    $base_array['vlan_bridge']  = 'br-ex_v';
								    $base_array['vlan_tagged_interface']  = $this->br_int; //WAN port on LAN bridge
								    $base_array['vlan_naming']	= '0';
								    $base_array['wpa_psk_file'] = '/etc/hostapd-'.$ap_profile_e->private_psk_id.'.wpa_psk';
					                $base_array['vlan_file'] = '/etc/hostapd.vlan';								
								    //Set the flag
								    $this->ppsk_flag = true;
								    $this->private_psks[$ap_profile_e->private_psk_id] = []; //Populate it with an empty list first;
								    
								    //Unset the key (We use the file)
								    unset($base_array['key']);					    							    
							    }
							    							    
                                
                                if($ap_profile_e->macfilter != 'disable'){

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
                                
                                $lists = [];
                                
                               	if($ap_profile_e->hotspot2_enable){
                                	Configure::load('Hotspot2');
								    $options = Configure::read('Hotspot2.options'); 
								    $base_array = array_merge($base_array,$options);
								    $lists	 = Configure::read('Hotspot2.lists');                                  
                                }
                                
                                //Check if we need to mix in the RADIUS items
                                $base_array = $this->_includeRadius($base_array,$ap_profile_e,$y);

                                array_push( $wireless,
                                    [
                                        "wifi-iface"=> "$if_name",
                                        "options"   => $base_array,
                                        "lists"		=> $lists
                                ]); 
                                $start_number++;
                            }
                        }
                                            
                        break; //No need to loop further
                    }    
                }
                
            }
        } 
               
        foreach($ap_profile->ap_ap_profile_entries as $ap_ap_profile_entry){
               
            //We start off by adding WiFi Scedules
            $ap_profile_e   = $ap_ap_profile_entry->ap_profile_entry;
        	$ssid_name      = $ap_profile_e->name;
        	
        	//--Determine the network Name-- 
        	foreach($entry_point_data as $epd){ 
                if($epd['entry_id'] == $ap_profile_e->id){
                    break;
                }
            }
            //--End Network Name --
                            	
        	//-- WiFi Schedules --
            $script         = "/etc/MESHdesk/utils/ssid_on_off.lua";                      
            $start_disabled = $this->_scheduleStartDisabledTest($ap_profile,$ap_profile_e->ap_profile_entry_schedules);                        
            foreach($ap_profile_e->ap_profile_entry_schedules as $sch){
            	$sch->command 	= "$script '$ssid_name' '$sch->action'";
            	$sch->type		= 'command';
            	unset($sch->action);
               	unset($sch->ap_profile_entry_id);
                unset($sch->created);
                unset($sch->modified);
                array_push($this->WifiSchedules,$sch);                                  
            }
            //-- End WiFi Schedules --           
            
            $ssid   = $ap_profile_e->name;
            $key    = $ap_profile_e->special_key;
            
            foreach($ap_profile->ap_static_entry_overrides as $override){        
                if($override->ap_profile_entry_id == $ap_profile_e->id){               
                    if($override->item == 'ssid'){
                        $ssid = $override->value;
                    }
                    if($override->item == 'key'){
                        $key = $override->value;
                    }
                }          
            }
            
            
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
                    
                    $this->MetaData["$if_name"."$y"] = $ap_profile_e->id;
                    
                    //Change the bridge if auto-wbw detection and nat creation happened
                    if( ($epd['network'] == 'lan')&&
                        (($this->WbwActive == true)||($this->QmiActive == true))
                    ){
                        $epd['network'] = $this->if_wbw_nat_br;
                    }
                    
                    //If it is NOT disabled in hardware BUT we have to disable it on the schedule ($start_disabled) then make it disabled
                    $disabled = $this->RadioSettings[$y]['radio'.$y.'_disabled'];
                    if(($start_disabled)&&(!$disabled)){
                    	$disabled = $start_disabled;
                    }
                                                                  
                    $base_array = [
                        "device"        => "radio".$y,
                        "ifname"        => "$if_name"."$y",
                        "mode"          => "ap",
                        "network"       => $epd['network'],
                        "encryption"    => $ap_profile_e->encryption,
                        "ssid"          => $ssid,
                        "key"           => $key,
                        "hidden"        => $ap_profile_e->hidden,
                        "isolate"       => $ap_profile_e->isolate,
                        "disabled"      => $disabled 
                    ];
                    
                    if($ap_profile_e->chk_maxassoc){
                        $base_array['maxassoc'] = $ap_profile_e->maxassoc;
                    }
                    
                    
                    if($ap_profile_e->ieee802r){
                        $base_array['ieee80211r']				= $ap_profile_e->ieee802r; //FIXME A Typo slipped in ... OpenWrt looking for ieee80211r and not ieee802r
                        $base_array['ft_over_ds']			= $ap_profile_e->ft_over_ds;
                        $base_array['ft_psk_generate_local']	= $ap_profile_e->ft_pskgenerate_local; //FIXME Another Type slipped in ... OpenWrt looking for ft_psk_generate_local
                        
                        if($ap_profile_e->mobility_domain !== ''){
                            $base_array['mobility_domain']  = $ap_profile_e->mobility_domain;
                        }                           	                          
                    }                                                      
                                                                         
                    //==OCT 2022== Private PSK Support ==
                    /*
                    config wifi-iface 'default_radio0'
					    option device 'radio0'
					    option network 'lan'
					    option mode 'ap'
					    option ssid 'OpenWrt'
					    option encryption 'psk2'
					    option ppsk '1'
					    option auth_secret 'testing123'
					    option key '12345678'
					    option auth_server '192.168.8.101'
					    option nasid 'DisVrydag'
					    option dynamic_vlan '2'
					    option vlan_tagged_interface 'lan1'
					    option vlan_bridge 'br-vlan'
					    option vlan_naming '0'
				    */
				    if($ap_profile_e->encryption == 'ppsk'){
				    
				        $base_array = $this->_addPpskSettings($base_array);								
					    //Set the flag
					    $this->ppsk_flag = true;
				    }
				    
				    if($ap_profile_e->encryption == 'wpa2'){
					    $base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
					    $base_array['vlan_bridge']  = 'br-ex_v';
					    $base_array['vlan_tagged_interface']  = $this->br_int; //WAN port on LAN bridge
					    $base_array['vlan_naming']	= '0';
				    }	
				    
				    
				    //== May 2024== PPSK without RADIUS Support===
				    if($ap_profile_e->encryption == 'ppsk_no_radius'){
					    $base_array['encryption']	= 'psk2';
					    $base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
					    $base_array['vlan_bridge']  = 'br-ex_v';
					    $base_array['vlan_tagged_interface']  = $this->br_int; //WAN port on LAN bridge
					    $base_array['vlan_naming']	= '0';
					    $base_array['wpa_psk_file'] = '/etc/hostapd-'.$ap_profile_e->private_psk_id.'.wpa_psk';
					    $base_array['vlan_file'] = '/etc/hostapd.vlan';							
					    //Set the flag
					    $this->ppsk_flag = true;
					    $this->private_psks[$ap_profile_e->private_psk_id] = []; //Populate it with an empty list first;
					    
					    //Unset some items
					    unset($base_array['key']);
				    }
				    				                      
                    if($ap_profile_e->macfilter != 'disable'){

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
                    
                    $lists = [];
                    
                   	if($ap_profile_e->hotspot2_enable){
                    	Configure::load('Hotspot2');
					    $options = Configure::read('Hotspot2.options'); 
					    $base_array = array_merge($base_array,$options);
					    $lists	 = Configure::read('Hotspot2.lists');                                  
                    }
                    
                    //Check if we need to mix in the RADIUS items                    
                    $base_array = $this->_includeRadius($base_array,$ap_profile_e,$y);
                    
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
        return $wireless;  
    }
      
    //We shorten this to work with the SQM script (if its to long it truncates and breaks)
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

    private function _wan_for($hw){
		$return_val = 'eth0'; //some default	
		$q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hw, 'Hardwares.for_ap' => true])->first();
		if($q_e){
		    $return_val = $q_e->wan;   
		}
		
		//--26Jan24 Tweak for VLAN hack--
		if($return_val == 'eth0 eth1'){
		    $return_val = 'lan';
		    $this->vlan_hack = true;
		}
		//--
		
		return $return_val;
	}
	
	private function _lan_for($hw){
	    $return_val = ['eth1']; //some default	
		$q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hw, 'Hardwares.for_ap' => true])->first();
		if($q_e){
		    $return_val = [$q_e->lan]; 
		    $ports = preg_split('/\s+/', $q_e->lan);//New format if there are multiple items
		    if($ports){
		    	$return_val = $ports; 
		    } 
		}
		return $return_val;
	}
	
	private function _checkForWbWReplacement(){ 
     
        $ret_data                   = [];
        $ret_data['two_replace']    = false;
        $ret_data['five_replace']   = false;
        $unix_start                 = 1; //Anything will be gigger than one    
        
        $e_s = $this->{'ApConnectionSettings'}->find()->where([
                'ApConnectionSettings.ap_id'    => $this->ApId
            ])->all();
        
        foreach($e_s as $acs){
        
            if($acs->grouping == 'wbw_setting'){
                $this->wbw_settings['proto'] = 'dhcp'; //default 
            }
            
            if($acs->grouping == 'wifi_static_setting'){
                $this->wbw_settings['proto'] = 'static'; 
            }
            if($acs->grouping == 'wifi_pppoe_setting'){
                $this->wbw_settings['proto'] = 'pppoe'; 
            }         
        
            if(($acs->grouping == 'wbw_setting')||($acs->grouping == 'wifi_static_setting')||($acs->grouping == 'wifi_pppoe_setting')){ 
                if($acs->value !== ''){
                    $this->wbw_settings[$acs->name] = $acs->value;
                }
            }                     
            if(($acs->grouping == 'wbw_info')&&($acs->name == 'channel')){    
                if($acs->value < 14){
                    $ret_data['two_replace']  = true;
                    $ret_data['two_chan']     = $acs->value;    
                }
                if($acs->value > 30){
                    $ret_data['five_replace'] = true;
                    $ret_data['five_chan']     = $acs->value;    
                }
            }
        }
        return $ret_data;
    }
    
    private function _checkForRebootSettings(){
    /*
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
    */
    }
    
    private function _make_linux_password($pwd){
		return exec("openssl passwd -1 $pwd");
	}
	
	private function _scheduleStartDisabledTest($ap_profile,$schedules){
	
		$default_data = $this->_getDefaultSettings();
		//Timezone
        if($ap_profile->ap_profile->ap_profile_setting !== null && $ap_profile->ap_profile->ap_profile_setting->tz_value != ''){
            $tz_name			= $ap_profile->ap_profile->ap_profile_setting->tz_name;
        } else {
            $tz_name			= $default_data['tz_name'];
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
	
	private function _includeRadius($base_array, $apProfileEntry,$radioNumber){
	
        if(
            ($apProfileEntry->encryption == 'ppsk')||
            ($apProfileEntry->encryption == 'wpa')||
            ($apProfileEntry->encryption == 'wpa2')
        ){

            $base_array['auth_server']  = $apProfileEntry->auth_server;
            $base_array['auth_secret']  = $apProfileEntry->auth_secret;
            
            if($apProfileEntry->accounting){
                $base_array['acct_server']	= $apProfileEntry->auth_server;
                $base_array['acct_secret']	= $apProfileEntry->auth_secret;
                $base_array['acct_interval']= $this->acct_interval;
            }
            
            //MESHdesk / AP Profile **(m/a)** _ **id** _ **entry_id** _ **radio_number** _ **node id / ap id**
            $req_attr                               = '126:s:a_hosta_'.$apProfileEntry->ap_profile_id.'_'.$apProfileEntry->id.'_'.$radioNumber.'_'.$this->ApId;           
            $base_array['radius_auth_req_attr']     = $req_attr;
            $base_array['radius_acct_req_attr']     = $req_attr;
            
            if($apProfileEntry->auto_nasid){                   
                //MESHdesk / AP Profile **(m/a)** _ **id** _ **entry_id**                       
                $base_array['nasid'] = 'a_hosta_'.$apProfileEntry->ap_profile_id.'_'.$apProfileEntry->id;                                
            }else{
            	if($apProfileEntry->nasid !== ''){
            		$base_array['nasid'] = $apProfileEntry->nasid;             	
            	}                            
            }
        }
        return $base_array;	
	}
	
	private function _addPpskSettings($base_array){
	    $base_array['encryption']	= 'psk2';
	    $base_array['ppsk']			= '1';
	    $base_array['dynamic_vlan'] = '1'; //1 allows VLAN=0 
	    $base_array['vlan_bridge']  = 'br-ex_v';
	    $base_array['vlan_tagged_interface']  = $this->br_int; //WAN port on LAN bridge
	    $base_array['vlan_naming']	= '0';
	    return $base_array;	
	}

}
