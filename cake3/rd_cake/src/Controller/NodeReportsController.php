<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 10/01/2018
 * Time: 00:00
 */

namespace App\Controller;

use App\Controller\AppController;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;
use Cake\Core\Configure;

class NodeReportsController extends AppController {

    protected $main_model       = 'Nodes';
    private   $MeshMacLookup    = [];
    private   $UptmTimestamp    = '0';  
    private $rebootFlag         = false;
    private $repSettings        = [];
      

    public function initialize(){
        parent::initialize();
        $this->loadModel('Meshes');
        $this->loadModel('Nodes');
        $this->loadModel('NodeLoads'); 
        $this->loadModel('NodeActions');
        $this->loadModel('NodeSystems');
        $this->loadModel('NodeSettings');
        $this->loadModel('NodeScans');
        $this->loadModel('MeshEntries'); 
        $this->loadModel('NodeIbssConnections');
        $this->loadModel('NodeStations');
        $this->loadModel('NodeNeighbors');
        $this->loadModel('NodeUptmHistories'); 
        $this->loadModel('StagingStations');      
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
        
        //Prime the repSettings with defaults
        Configure::load('MESHdesk');
        $rs     = [];
        $data   = Configure::read('common_node_settings'); //Read the defaults
        $rs['report_adv_enable']    = $data['report_adv_enable'];
        $rs['report_adv_proto']     = $data['report_adv_proto'];
        $rs['report_adv_light']     = $data['report_adv_light'];
        $rs['report_adv_full']      = $data['report_adv_full'];
        $rs['report_adv_sampling']  = $data['report_adv_sampling'];
        $this->repSettings          = $rs; //Read the default     
    }
    
    public function submitRogueReport(){
    
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$mac    = false;
		$mode   = false;
		
		if(isset($this->request->data['mac'])){
		    $mac = $this->request->data['mac'];  
        }
        
        if(isset($this->request->data['mode'])){
		    $mode = $this->request->data['mode'];  
        }
        
        if(($mac)&&($mode)){
            $data               = [];    
            $data['scan_data']  = json_encode($this->request->data['scan_data']);
        
            if($mode == 'ap'){   
                $this->loadModel('Aps');
                $q_a = $this->{'Aps'}->find()->where(['Nodes.mac' => $mac])->first();
                if($q_a){
                    $ap_id              = $q_a->id;
                    $data['ap_id']      = $ap_id;
                    //Clean out old entries 
                    $this->{'NodeScans'}->deleteAll(['NodeScans.ap_id' => $ap_id]);
                }
            }
            
            if($mode == 'mesh'){
                $q_m = $this->{'Nodes'}->find()->where(['Nodes.mac' => $mac])->first();
                if($q_m){
                    $node_id            = $q_m->id;
                    $data['node_id']    = $node_id;
                    //Clean out old entries 
                    $this->{'NodeScans'}->deleteAll(['NodeScans.node_id' => $node_id]);
                }
            }
            
            //Clean out old entries 
            $e_new              = $this->{'NodeScans'}->newEntity($data);    
            $this->{'NodeScans'}->save($e_new);
        }
        
        $items = [];  
        $this->set([
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);    
    }
    
    public function startScanForNode(){
    
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		$command_string     = "/etc/MESHdesk/rogue_scan.lua";	
		if(isset($this->request->data['node_id'])){
		    $node_id = $this->request->data['node_id'];
		    $count = $this->{'NodeActions'}->find()
                ->where([
                    'NodeActions.node_id' => $node_id,
                    'NodeActions.status'  => 'awaiting',
                    'NodeActions.command' => $command_string
                ])->count();
                
     
            if($count == 0){ //Avoid doubles...
                $data   = ['node_id' => $node_id,'status' => 'awaiting','command' => $command_string];
                $e_new  = $this->{'NodeActions'}->newEntity($data);
                $this->{'NodeActions'}->save($e_new); 
            }     
        }
    
        $items = [];  
        $this->set([
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    
    }
     
    public function scansForNode(){

        $items              = [];   
        $vendor_file        = APP."StaticData".DS."mac_lookup.txt";
        $this->vendor_list  = file($vendor_file);
        $entries            = [];
        
        $command_string     = "/etc/MESHdesk/rogue_scan.lua";
        
        $na                 = "Not Available";
        $last_scan_human    = $na;
        $mesh_name          = $na;
        $node_name          = $na;
        $no_scan_data       = true;
        $awaiting           = false;
        $awaiting_human     = $na;
        $least_match        = 80;
        $mac_allow          = [
            'A3-51',  //ZBT 78:A3:51
        ];
        $rogue_ap_count     = 0;
             
        if($this->request->getQuery('node_id') !== null){ 
            //See if there are scans available
            $node_id = $this->request->getQuery('node_id');
            $q_e = $this->{'NodeScans'}->find()->where(['NodeScans.node_id' => $node_id])->first();
            if($q_e){
                $items = json_decode($q_e->scan_data);
                $last_scan_human = $this->TimeCalculations->time_elapsed_string($q_e->{'created'});
                //There are scans available
                $no_scan_data = false;
                //Also get The mesh and node detail
                $q_n = $this->{'Nodes'}->find()->where(['Nodes.id' =>$node_id])->contain(['Meshes' =>['MeshEntries']])->first();
                if($q_n){
                    $mesh_name = $q_n->mesh->name;
                    $node_name = $q_n->name;
                    foreach($q_n->mesh->mesh_entries as $me){
                        $entry_name = $me->name;
                        array_push($entries,$entry_name);
                    }
                }  
            }     
        }    
        $count = 0;
        $no_hidden = [];
        
        foreach($items as $i){
            $mac                = preg_replace('/:/', '-', $i->bssid);
            $i->{'id'}          = $count+1;
            $i->{'mac'}         = $mac;
            $i->{'mac_vendor'}  = $this->_lookup_vendor($i->bssid);
            $i->rogue_flag      = false;
            
            $signal             = $i->signal;
            
            //Here we do a bit of Machine Learning :-)
            if(isset($i->ssid)){
                $percent = 0;
                foreach($entries as $e){
                    similar_text($i->ssid, $e, $percent);
                    if($percent >= $least_match){ //Possible Rogue ... Check if we allow this MAC
                        //Check the MAC ADDY
                        $i->rogue_flag      = true;
                        foreach($mac_allow as $mac_a){
                            if(preg_match("/^([a-fA-F0-9]{2}-)$mac_a/", $mac)){
                                //We founds a valid allowed MAC and can cleat the waring again
                                $i->rogue_flag  = false;
                            }
                        }
                    }
                }
                if($i->rogue_flag){
                    $rogue_ap_count = $rogue_ap_count +1;
                }  
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
            $i->{'signal_bar'}  = $signal_bar;
            
            if(isset($i->ssid)){
                array_push($no_hidden, $i);
            }
            
            $items[$count]      = $i;
            $count++;
        }
        
        //See if there might be a command awaiting 
        $q_c = $this->{'NodeActions'}->find()
            ->where([
                'NodeActions.node_id' => $node_id,
                'NodeActions.status'  => 'awaiting',
                'NodeActions.command' => $command_string
            ])->first();
      
        if($q_c){
            $awaiting           = true;
            $awaiting_human     = $this->TimeCalculations->time_elapsed_string($q_c->{'modified'});
        }
                
         
        $this->set(array(
            'items'    => $items,
            'metaData' => [
                'no_scan_data'      => $no_scan_data,
                'mesh_name'         => $mesh_name,
                'node_name'         => $node_name,
                'last_scan_human'   => $last_scan_human,
                'rogue_ap_count'    => $rogue_ap_count,
                'awaiting'          => $awaiting,
                'awaiting_time_human' => $awaiting_human,
                'entries'           => $entries      
            ] ,
            'success' => true,
            '_serialize' => array('items','metaData', 'success')
        ));

    }
      
    public function menuForScansForNode(){  
        $menu = [
            [
                'xtype' => 'buttongroup',
                'items' => [
                    [ 
                        'xtype'     =>  'splitbutton',  
                        'glyph'     => Configure::read('icnReload'),
                        'scale'     => 'large', 
                        'itemId'    => 'reload',   
                        'tooltip'   => __('Reload'),
                        'menu'  => [
                            'items' => [
                                '<b class="menu-title">'.__('Reload every').':</b>',
                                ['text'  => __('30 seconds'),      'itemId'    => 'mnuRefresh30s', 'group' => 'refresh','checked' => false ],
                                ['text'  => __('1 minute'),        'itemId'    => 'mnuRefresh1m', 'group' => 'refresh' ,'checked' => false],
                                ['text'  => __('5 minutes'),       'itemId'    => 'mnuRefresh5m', 'group' => 'refresh', 'checked' => false ],
                                ['text'  => __('Stop auto reload'),'itemId'    => 'mnuRefreshCancel', 'group' => 'refresh', 'checked' => true ]

                            ]
                        ]
                    ],
                    ['xtype' => 'button', 'glyph'     => Configure::read('icnLight'),   'scale' => 'large', 'itemId' => 'start_scan',   'tooltip'=> __('Start Scan')],
                    ['xtype' => 'button', 'glyph'     => Configure::read('icnDelete'),  'scale' => 'large', 'itemId' => 'remove',       'tooltip'=> __('Delete')]
                ]
            ]
        ];
    
        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }
    
    public function removeScansForNode(){ 
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		if(isset($this->request->data['node_id'])){
           $node_id = $this->request->data['node_id'];
           $this->{'NodeScans'}->deleteAll(['NodeScans.node_id' => $node_id]); 
        }
    
        $items = [];  
        $this->set([
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }
    
    public function submitReport(){
        $vendor_file        = APP."StaticData".DS."mac_lookup.txt";
        $this->vendor_list  = file($vendor_file); 
        
        if(isset($this->request->data['report_type'])){
            $fb = [];
            if($this->request->data['report_type'] == 'light'){
                $fb = $this->_light_report(); 
            } 
            
            if($this->request->data['report_type'] == 'full'){
                $fb = $this->_full_report();
            }
                      
            $this->set(array(
                'items'         => $fb,
               // 'data'          => $this->request->getData(),
                'reboot_flag'   => $this->rebootFlag,
                'reporting'     => $this->repSettings,
                'success'       => true,
                '_serialize' => array('items', 'success','reboot_flag','reporting')
            ));    
        
        }else{
            $fb = $this->_new_report();
            $this->set(array(
                'items'         => $fb,
                'reboot_flag'   => $this->rebootFlag,
                'timestamp'     => $this->UptmTimestamp,
                'success'       => true,
                '_serialize' => array('items', 'success','timestamp','reboot_flag')
            )); 
        } 
    }
    
    public function index(){  
        $items = [];      
        $this->set(array(
            'items' => $items,
            
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
    //===***===   
    public function _node_stations($e){
    
        $now    = new FrozenTime();
        $system_unix = $now->toUnixString();
        $d_now  = new FrozenTime($this->request->data['unix_timestamp']);
        $device_unix = $d_now->toUnixString();
        
        $drift = 0;
        
        if($device_unix > $system_unix){
            $drift = $device_unix - $system_unix;
            $drift = - $drift; //Subtract
        }
        
        if($system_unix > $device_unix){
            $drift = $system_unix - $device_unix; //Add
        }
    
        $d = $this->request->data['network_info'];
    
        foreach(array_keys($d['radios']) as $radio) {
            if (array_key_exists('interfaces',$d['radios'][$radio])){
                foreach($d['radios'][$radio]['interfaces'] as $interface){  
                    if(!empty($interface['stations'])){
                        if (($interface['type'] == 'AP')&&($interface['mesh_entry_id'] !== 0)) {              
                            foreach(array_keys($interface['stations']) as $s_mac){ //Only if there are any stations listed
                                $s_data                     = $interface;
                                $s_data['radio_number']     = $radio;
                                unset($s_data['mac']);
                                unset($s_data['stations']);   
                                $s_data                     = array_merge($s_data, $interface['stations'][$s_mac]);   
                                $s_data['created']          = new FrozenTime($s_data['first_timestamp']+($drift));
                                $s_data['modified']         = new FrozenTime($s_data['unix_timestamp']+($drift)); 
                                $e_new                      = $this->{'NodeStations'}->newEntity($s_data);    
			                    $this->{'NodeStations'}->save($e_new); 
                            }
                        }  
                        if (($interface['type'] == 'IBSS')||($interface['type'] == 'mesh point')) {
                        
                            //Record the MAC
                            $name   = $interface['name'];
                            $m_mac  = $interface['mac'];
                            
                            //Update the mesh colunm with the latest mac (only if there were a change)
                            if($e->{"$name"} !== $m_mac){
                                $e->{"$name"} = $m_mac;
                                $this->{'Nodes'}->save($e);
                            }
                                                        
                            foreach(array_keys($interface['stations']) as $s_mac){ //Only if there are any stations listed
                                $s_data                     = $interface;
                                $s_data['radio_number']     = $radio;
                                $s_data['if_mac']           = $s_data['mac'];
                                unset($s_data['mac']);
                                unset($s_data['stations']); 
                                $s_data                     = array_merge($s_data, $interface['stations'][$s_mac]); 
                                $s_data['created']          = new FrozenTime($s_data['first_timestamp']+($drift));
                                $s_data['modified']         = new FrozenTime($s_data['unix_timestamp']+($drift)); 
                                $e_new                      = $this->{'NodeIbssConnections'}->newEntity($s_data);    
			                    $this->{'NodeIbssConnections'}->save($e_new); 
                            }
                        }     
                    }
                }
            } 
        }
    }
    
    private function _light_report(){
        $mac    = $this->request->data['mac'];
        
        if(preg_match('/^[0-9]{12}$/', $mac)){//Add this hack so Loader can send more variety of packets
            $mac = str_split($mac ,2);
            $mac = implode("-",$mac);            
        }   
        
        $items  = [];
        $entity = $this->{$this->main_model}->find()->where(['mac' => $mac])->first();
        if($entity){
            $entity->last_contact           = date("Y-m-d H:i:s", time());
            if($this->request->clientIp() !== $entity->last_contact_from_ip){
                $entity->last_contact_from_ip   = $this->request->clientIp();
            }
            
            if($entity->reboot_flag){
                $this->rebootFlag = true;
                $entity->reboot_flag = false; //Clear the reboot flag
            }
            
            $this->{$this->main_model}->save($entity);
            
            if(isset($this->request->data['wbw_info'])){
                $this->_addWbwInfo($entity->id);
            }
                     
            $this->_fetchReportSettings($entity->mesh_id);
              
            //Fetch commands awaiting for unit  
            $commands = $this->{'NodeActions'}->find()
                ->where([
                    'NodeActions.status'    => 'awaiting',
                    'NodeActions.node_id'   => $entity->id
                ])->all();
            foreach($commands as $c){
                array_push($items,$c->id);
            }    
            
        }else{
            $this->_rebootFlagTest($mac);
        }
        return $items; 
    }
    
    private function _addWbwInfo($node_id){   
        $this->loadModel('NodeConnectionSettings');
        $wbw_info = $this->request->data['wbw_info'];
        foreach (array_keys($wbw_info) as $key){
            $value = $wbw_info[$key];
            $e_ncs = $this->{'NodeConnectionSettings'}->find()
                ->where([
                    'NodeConnectionSettings.node_id'    => $node_id,
                    'NodeConnectionSettings.grouping'   => 'wbw_info',
                    'NodeConnectionSettings.name'       => $key
                ])->first();
        
            if($e_ncs){
                $this->{'NodeConnectionSettings'}->patchEntity($e_ncs,['name' => $key,'value' => $value]);   
            }else{
                $d_new = ['node_id' => $node_id,'grouping' => 'wbw_info','name' => $key,'value' => $value];
                $e_ncs = $this->{'NodeConnectionSettings'}->newEntity($d_new);
            }
            $this->{'NodeConnectionSettings'}->save($e_ncs);
        } 
    }
    
    private function _full_report(){
    
        $mac    = $this->request->data['mac'];
        $items  = [];
        $entity = $this->{$this->main_model}->find()->where(['mac' => $mac])->first();
        if($entity){
        
            if($entity->reboot_flag){
                $this->rebootFlag = true;
                $entity->reboot_flag = false; //Clear the reboot flag
            }
        
            $this->_update_last_contact($entity);
            
            $this->_new_do_uptm_history($entity);
                      
            //Add node_stations and node_ibss_connections
            if (array_key_exists('network_info', $this->request->data)){ 
                $this->_node_stations($entity); //We send the entity along in case the mesh0/1/2 changed and it needs updating
            }
            
            //Build a lookup for the meshes
            $this->_doMeshMacLookup($entity->mesh_id);
            //Spider web
            $this->_do_vis();          
            
            //Update the Loads
            $this->_do_node_load($entity->id,$this->request->data['system_info']['sys']);
            //Update system info (if required)
            $this->_do_node_system_info($entity->id,$this->request->data['system_info']['sys']);
            
            
            $this->_fetchReportSettings($entity->mesh_id);
              
            //Fetch commands awaiting for unit  
            $commands = $this->{'NodeActions'}->find()
                ->where([
                    'NodeActions.status'    => 'awaiting',
                    'NodeActions.node_id'   => $entity->id
                ])->all();
            foreach($commands as $c){
                array_push($items,$c->id);
            }    
            
        }else{
            $this->_rebootFlagTest($mac);
        }
        return $items;
    }
    
    private function _fetchReportSettings($mesh_id){
        //Get the common node settings for the timing
        $e_ns = $this->{'NodeSettings'}->find()
            ->select(['report_adv_proto', 'report_adv_light','report_adv_full','report_adv_sampling'])
            ->where(['NodeSettings.mesh_id' => $mesh_id])
            ->first();
        if($e_ns){
            $this->repSettings = $e_ns->toArray();
        }//Default is already set if not found 
    }
    
    private function _rebootFlagTest($mac){
        //If the devic is not under unknown nodes; flag it to be rebooted 
        $this->loadModel('UnknownNodes');
        $u_count = $this->{'UnknownNodes'}->find()->where(['mac' => $mac])->count();
        if($u_count == 0){
            $this->rebootFlag = true; //Not yet in unknown nodes; set the reboot flag
        }
    }
      
    //====****=====
    
    private function _new_report(){
        $items  = [];
        //$mac = '00-25-82-06-92-71';
        $mac    = $this->request->data['network_info']['eth0'];
        
        //See if we can find it
        $entity = $this->{$this->main_model}->find()->where(['mac' => $mac])->first();
        if($entity){
        
            //Do uptm history
            $this->_do_uptm_history($entity);
        
            //Update the last contact detail
            $this->_update_last_contact($entity); 
        
            //Update the WiFi Info 
            $mesh_id = $entity->mesh_id;
            $node_id = $entity->id;
        
            //Build lookup table for mesh mac's
            $e_lookup = $this->{$this->main_model}->find()->where(['mesh_id' => $mesh_id])->all();
            foreach($e_lookup as $i){
                if($i->{'mesh0'} !== ''){
                    $hwmode     = '11g'; //default
                    $gateway    = 'no';
                    if($i->radio0_band == 5){
                        $hwmode = '11a';
                    }
                    
                    if($i->gateway == 'lan'){
                        $gateway = 'yes';
                    }
                    $this->MeshMacLookup[$i->{'mesh0'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
                }
                if($i->{'mesh1'} !== ''){
                    $hwmode     = '11g'; //default
                    $gateway    = 'no';
                    if($i->radio1_band == 5){
                        $hwmode = '11a';
                    }
                    if($i->gateway == 'lan'){
                        $gateway = 'yes';
                    }
                    $this->MeshMacLookup[$i->{'mesh1'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
                }
                if($i->{'mesh2'} !== ''){ //FIXME For future
                    $hwmode     = '11g'; //default
                    $gateway    = 'no';
                    if($i->radio2_band == 5){
                        $hwmode = '11a';
                    }
                    if($gateway == 'lan'){
                        $gateway = 'yes';
                    }
                    $this->MeshMacLookup[$i->{'mesh2'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
                }
            }
            
            //Auto captive portal sometimes then does not have this item
            if (array_key_exists(0, $this->request->data['network_info']['radios'])) {
                $r0 = $this->request->data['network_info']['radios'][0]['interfaces'];
                $this->_do_radio_interfaces($entity, $r0);
            }

            //If it is a dual radio --- report on it also ----
            if (array_key_exists(1, $this->request->data['network_info']['radios'])) {
                $r1 = $this->request->data['network_info']['radios'][1]['interfaces'];
                $this->_do_radio_interfaces($entity, $r1);
            }
        
            //Update the Loads
            $this->_do_node_load($entity->id,$this->request->data['system_info']['sys']);
            //Update system info (if required)
            $this->_do_node_system_info($entity->id,$this->request->data['system_info']['sys']);
            //Spider web
            $this->_do_vis();
          
            //Fetch commands awaiting for unit  
            $commands = $this->{'NodeActions'}->find()
                ->where([
                    'NodeActions.status'    => 'awaiting',
                    'NodeActions.node_id'   => $entity->id
                ])->all();
            foreach($commands as $c){
                array_push($items,$c->id);
            }   
        }else{
            //If the devie is not under unknown nodes; flag it to be rebooted 
            $this->loadModel('UnknownNodes');
            $u_count = $this->{'UnknownNodes'}->find()->where(['mac' => $mac])->count();
            if($u_count == 0){
                $this->rebootFlag = true; //Not yet in unknown nodes; set the reboot flag
            }
        }
        return $items;
    }
    
    private function _doMeshMacLookup($mesh_id){
    
        //Build lookup table for mesh mac's
        $e_lookup = $this->{$this->main_model}->find()->where(['mesh_id' => $mesh_id])->all();
        //FIXME with the new hardware profiles we use; we will not use radio0_band etc any more ... 
        //look up the hardware up when we display the spiderweb (MeshReportsController)
        
        foreach($e_lookup as $i){
            if($i->{'mesh0'} !== ''){
                $hwmode     = '11g'; //default
                $gateway    = 'no';
                if($i->radio0_band == 5){
                    $hwmode = '11a';
                }
                
                if($i->gateway == 'lan'){
                    $gateway = 'yes';
                }
                $this->MeshMacLookup[$i->{'mesh0'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
            }
            if($i->{'mesh1'} !== ''){
                $hwmode     = '11g'; //default
                $gateway    = 'no';
                if($i->radio1_band == 5){
                    $hwmode = '11a';
                }
                if($i->gateway == 'lan'){
                    $gateway = 'yes';
                }
                $this->MeshMacLookup[$i->{'mesh1'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
            }
            if($i->{'mesh2'} !== ''){ //For future
                $hwmode     = '11g'; //default
                $gateway    = 'no';
                if($i->radio2_band == 5){
                    $hwmode = '11a';
                }
                if($gateway == 'lan'){
                    $gateway = 'yes';
                }
                $this->MeshMacLookup[$i->{'mesh2'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
            }
        }   
    }
    
    private function _new_do_uptm_history($entity){
        $node_id        = $entity->id;
       
        $e_uptm = $this->{'NodeUptmHistories'}->find()
                ->where([   
                'NodeUptmHistories.node_id' => $node_id,
                ])
                ->order(['NodeUptmHistories.report_datetime' => 'desc'])
                ->first();
                 
        if($e_uptm){
			// check to see if last node_state was up or down
			// UP
			if ($e_uptm->node_state == 1){ 
			
                $e_uptm->report_datetime = time();
                $this->{'NodeUptmHistories'}->save($e_uptm);
                
            // DOWN     
			}else{ 
			
				$data                   = [];
				$data['node_state']     = 1;
				$data['node_id']        = $node_id; 
				$data['state_datetime'] = time();
				$data['report_datetime']= time();    
				$e_new                  = $this->{'NodeUptmHistories'}->newEntity($data);    
				$this->{'NodeUptmHistories'}->save($e_new); 
						
			}
        }else{
        
            $data                   = [];
            $data['node_state']     = 1;
            $data['node_id']        = $node_id; 
            $data['state_datetime'] = time();
            $data['report_datetime']= time();    
            $e_new                  = $this->{'NodeUptmHistories'}->newEntity($data);    
            $this->{'NodeUptmHistories'}->save($e_new); 
        }      
    }
      
    private function _do_uptm_history($entity){
        $node_id        = $entity->id;
        $old_bootcycle  = $entity->bootcycle; 
        $bootcycle      = 0;
        $drift          = 0;
        if (array_key_exists('bootcycle', $this->request->data)) {
            $bootcycle  = intval($this->request->data['bootcycle']); 
        }else{
            return; 
        }
         
        //if($bootcycle == $old_bootcycle){
            $e_uptm = $this->{'NodeUptmHistories'}->find()
                ->where([   
                'NodeUptmHistories.node_id' => $node_id,
                ])
                ->order(['NodeUptmHistories.report_datetime' => 'desc'])
                ->first();
                 
            if($e_uptm){
			// check to see if last node_state was up or down
			if ($e_uptm->node_state == 1) { // UP
                $e_uptm->report_datetime = time();
                $this->{'NodeUptmHistories'}->save($e_uptm); 
			} else { // DOWN
				$data                   = [];
				$data['node_state']     = 1;
				$data['node_id']        = $node_id; 
				$data['state_datetime'] = time();
				$data['report_datetime']= time();    
				$e_new                  = $this->{'NodeUptmHistories'}->newEntity($data);    
				$this->{'NodeUptmHistories'}->save($e_new); 		
			}
        } else {
            $data                   = [];
            $data['node_state']     = 1;
            $data['node_id']        = $node_id; 
            $data['state_datetime'] = time();
            $data['report_datetime']= time();    
            $e_new                  = $this->{'NodeUptmHistories'}->newEntity($data);    
            $this->{'NodeUptmHistories'}->save($e_new); 
        }
      
        $this->UptmTimestamp = time();
    }
 /*   
    private function _do_uptm_history($entity){
        $node_id        = $entity->id;
        $old_bootcycle  = $entity->bootcycle; 
        $bootcycle      = 0;
        $drift          = 0;
        if (array_key_exists('bootcycle', $this->request->data)) {
            $bootcycle  = intval($this->request->data['bootcycle']); 
        }else{
            return; 
        }
        
        if (array_key_exists('drift', $this->request->data)) {
            $drift  = intval($this->request->data['drift']); 
        }
        
         
        if($bootcycle == $old_bootcycle){
            $e_uptm = $this->{'NodeUptmHistories'}->find()
                ->where([   
                    'NodeUptmHistories.node_id' => $node_id
                ])
                ->order(['NodeUptmHistories.report_datetime' => 'desc'])
                ->first();
                 
            if($e_uptm){
                $e_uptm->report_datetime = time();
                $this->{'NodeUptmHistories'}->save($e_uptm); 
            }else{
                $data                   = [];
                $data['node_state']     = 1;
                $data['node_id']        = $node_id; 
                $data['state_datetime'] = time();
                $data['report_datetime']= time();    
                $e_new                  = $this->{'NodeUptmHistories'}->newEntity($data);    
                $this->{'NodeUptmHistories'}->save($e_new); 
            }
        }else{
            //Something changed so we need to check what changed..
            $e_uptm = $this->{'NodeUptmHistories'}->find()
                ->where([   
                    'NodeUptmHistories.node_id' => $node_id
                ])
                ->order(['NodeUptmHistories.report_datetime' => 'desc'])
                ->first();
            if($e_uptm){
                //We need to:
                //-> Close this session - To 'close' it simply create a new 'off' state entry 
                //-> Create a 'down' session
                //-> Create a new up session
                $last_contact               = $e_uptm->report_datetime;
                $next_off_time_start        = $last_contact->i18nFormat(Time::UNIX_TIMESTAMP_FORMAT)+1;
                
                $next_on_time_start         = time()-$drift;
                $next_on_time_stop          = time();
                
                $next_off_time_stop         = time()-$drift-1;
                
                //First the off time 
                $d_off                      = [];
                $d_off['node_id']           = $node_id;
                $d_off['node_state']        = 0;
                $d_off['state_datetime']    = $next_off_time_start;
                $d_off['report_datetime']   = $next_off_time_stop;    
                $e_off                      = $this->{'NodeUptmHistories'}->newEntity($d_off);
                $this->{'NodeUptmHistories'}->save($e_off); 
                
                //Then the on time
                $d_on                      = [];
                $d_on['node_id']           = $node_id;
                $d_on['node_state']        = 1;
                $d_on['state_datetime']    = $next_on_time_start;
                $d_on['report_datetime']   = $next_on_time_stop;   
                $e_on                      = $this->{'NodeUptmHistories'}->newEntity($d_on);
                $this->{'NodeUptmHistories'}->save($e_on); 
            }else{
                $data                   = [];
                $data['node_state']     = 1;
                $data['node_id']        = $node_id; 
                $data['state_datetime'] = time();
                $data['report_datetime']= time();    
                $e_new                  = $this->{'NodeUptmHistories'}->newEntity($data);    
                $this->{'NodeUptmHistories'}->save($e_new); 
            }
        }       
        $this->UptmTimestamp = time();
    }
*/
    
    private function _do_vis(){
    
        if (array_key_exists('vis', $this->request->data)) {     
            foreach ($this->request->data['vis'] as $vis) {
                $metric         = $vis['metric'];
                $neighbor       = $vis['neighbor'];
                $router         = $vis['router'];
                
                $neighbor_id    = false;
                $node_id        = false;
                
                if (array_key_exists($neighbor, $this->MeshMacLookup)) {
                    $neighbor_id    = $this->MeshMacLookup["$neighbor"]['id'];
                }
                
                if (array_key_exists($router, $this->MeshMacLookup)) {
                    $node_id    = $this->MeshMacLookup["$router"]['id'];
                    $gateway    = $this->MeshMacLookup["$router"]['gateway'];
                    $hwmode     = $this->MeshMacLookup["$router"]['hwmode'];
                }
                
                if(($neighbor_id)&&($node_id)){
                    //--Check the last entry for this MAC
                    $entity_nn = $this->{'NodeNeighbors'}->find()
                        ->where([   
                            'NodeNeighbors.node_id'     => $node_id,
                            'NodeNeighbors.neighbor_id' => $neighbor_id

                        ])
                        ->first(); 
                                 
                    if($entity_nn) {
                        $entity_nn->metric = $metric;
                        if($entity_nn->gateway !== $gateway){ //If the gw change we need to reflect it also
                            $entity_nn->gateway = $gateway;
                        }
                        $this->{'NodeNeighbors'}->save($entity_nn);   
                    }else{
                        $data               = [];
                        $data['node_id']    = $node_id;
                        $data['neighbor_id']= $neighbor_id;
                        $data['metric']     = $metric;
                        $data['gateway']    = $gateway;
                        $data['hwmode']     = $hwmode;
                        $e_new              = $this->{'NodeNeighbors'}->newEntity($data);
                        $this->{'NodeNeighbors'}->save($e_new);
                    }
                }
            }
        }
    }
      
    private function _do_radio_interfaces($e, $interfaces){
 //   	return;
        $mesh_id = $e->mesh_id;
        $node_id = $e->id;

        foreach ($interfaces as $i) {
            if (count($i['stations']) > 0) {
               //Try to find (if type=AP)the Entry ID of the Mesh
               
               /*===
               
                if ($i['type'] == 'AP') {
                
                    $entity = $this->{'MeshEntries'}->find()
                        ->where(['MeshEntries.name' => $i['ssid'],'MeshEntries.mesh_id' => $mesh_id])
                        ->first();
                        
                    if ($entity) {
                        $entry_id = $entity->id;
                        foreach ($i['stations'] as $s) {
                            $data = $this->_prep_station_data($s);
                            $data['mesh_entry_id']  = $entry_id;
                            $data['node_id']        = $node_id;
                            $entity_mac = false;
                       
                            //--Check the last entry for this MAC
                            $entity_mac = $this->{'NodeStations'}->find()
                                ->where([   
                                    'NodeStations.mesh_entry_id'=> $entry_id,
                                    'NodeStations.node_id'      => $node_id,
                                    'NodeStations.mac'          => $data['mac']
                                    ])
                                ->order(['NodeStations.created' => 'desc'])
                                ->first();     
                            $new_flag = true;
                            
                            if($entity_mac) {
                                $old_tx = $entity_mac->tx_bytes;
                                $old_rx = $entity_mac->rx_bytes;
                                if (($data['tx_bytes'] >= $old_tx)&($data['rx_bytes'] >= $old_rx)) {
                                    $new_flag = false;
                                }
                            }                           
                            
                            if ($new_flag) {
                                $e_new   = $this->{'NodeStations'}->newEntity($data);
                                $this->{'NodeStations'}->save($e_new);
                            }else{
                                 $this->{'NodeStations'}->patchEntity($entity_mac,$data);
                                 $this->{'NodeStations'}->save($entity_mac);
                            }
                                                       
                        }
                    }
                }
                
                ===*/
                /*===
                //If the type is IBSS we will try to determine which nodes are connected
                //April 2016 - We now also include support for mesh node (802.11s)
                if (($i['type'] == 'IBSS')||($i['type'] == 'mesh point')) {
                
                    //Record the MAC
                    $name   = $i['name'];
                    $m_mac  = $i['mac'];
                    
                    //Update the mesh colunm with the latest mac
                    if($e->{"$name"} !== $m_mac){
                        $e->{"$name"} = $m_mac;
                        $this->{'Nodes'}->save($e);
                    }
                               
                    foreach ($i['stations'] as $s) {
                        $data               = $this->_prep_station_data($s);
                        $data['node_id']    = $node_id;
                        $m                  = $s['mac'];
                        
                        //Jan 2018 Also see if we can find the station node id
                        if (array_key_exists($m, $this->MeshMacLookup)){
                            $data['station_node_id'] = $this->MeshMacLookup[$m]['id'];
                        }
                          
                        $entity_mac = $this->{'NodeIbssConnections'}->find()
                            ->where([   
                                    'NodeIbssConnections.node_id'    => $node_id,
                                    'NodeIbssConnections.mac'        => $data['mac'],
                                ])
                            ->order(['NodeIbssConnections.created' => 'desc'])
                            ->first();

                        $new_flag = true;
                        if ($entity_mac) {
                            $old_tx = $entity_mac->tx_bytes;
                            $old_rx = $entity_mac->rx_bytes;
                            
                            if (($data['tx_bytes'] >= $old_tx)&($data['rx_bytes'] >= $old_rx)) {
                                $new_flag   = false;
                            }
                        }
                        
                        if ($new_flag) {
                            $e_new   = $this->{'NodeIbssConnections'}->newEntity($data);
                            $this->{'NodeIbssConnections'}->save($e_new);
                        }else{
                             $this->{'NodeIbssConnections'}->patchEntity($entity_mac,$data);
                             $this->{'NodeIbssConnections'}->save($entity_mac);
                        }
                    }
                }
                ===*/
            }
        }
    }
    
    private function _prep_station_data($station_info){
        $data       = array();
        $tx_proc    = $station_info['tx bitrate'];
        $tx_bitrate = preg_replace('/\s+.*/', '', $tx_proc);
        $tx_extra   = preg_replace('/.*\s+/', '', $tx_proc);
        $rx_proc    = $station_info['rx bitrate'];
        $rx_bitrate = preg_replace('/\s+.*/', '', $rx_proc);
        $rx_extra   = preg_replace('/.*\s+/', '', $rx_proc);
        $incative   = preg_replace('/\s+ms.*/', '', $station_info['inactive time']);
        $s          = preg_replace('/\s+\[.*/', '', $station_info['signal']);
        $s          = preg_replace('/\s+dBm/', '', $s);
        $a          = preg_replace('/\s+\[.*/', '', $station_info['avg']);
        $a          = preg_replace('/\s+dBm/', '', $a);

        $data['vendor']        = $this->_lookup_vendor($station_info['mac']);
        $data['mac']           = $station_info['mac'];
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
    
    private function _update_last_contact($e){
    
        $entity                         = $this->{$this->main_model}->find()->where(['id' => $e->id])->first();
        $entity->last_contact           = date("Y-m-d H:i:s", time());
        $entity->last_contact_from_ip   = $this->request->clientIp(); 
        
        //--- Check if there are any lan_info items here
        if (array_key_exists('lan_info', $this->request->data)) {
            $lan_proto  = $this->request->data['lan_info']['lan_proto'];
            $lan_gw     = $this->request->data['lan_info']['lan_gw'];
            $lan_ip     = $this->request->data['lan_info']['lan_ip'];
            $entity->lan_gw = $lan_gw;
            $entity->lan_ip = $lan_ip;
            $entity->lan_proto  = $lan_proto;  
        }
       
        if (array_key_exists('bootcycle', $this->request->data)) {
            $entity->bootcycle  = intval($this->request->data['bootcycle']); 
        }
        
        //--Check if we need to update the gateway field
        if (array_key_exists('gateway', $this->request->data)){
            if($e->gateway !== $this->request->data['gateway']){
                $entity->gateway = $this->request->data['gateway']; //Set the gateway only if it is set and different
            }
        }
             
        $this->{$this->main_model}->save($entity);
        
        //Update the mesh last_contact
        $e_m = $this->{'Meshes'}->find()->where(['id' => $e->mesh_id])->first();
        if($e_m){
            $data = [];
            $data['last_contact'] = date("Y-m-d H:i:s", time());
            $this->{'Meshes'}->patchEntity($e_m, $data);
            $this->{'Meshes'}->save($e_m);
        }  
    }
    
    private function _do_node_load($node_id, $info){
    
        $mem_total  = $this->_mem_kb_to_bytes($info['memory']['total']);
        $mem_free   = $this->_mem_kb_to_bytes($info['memory']['free']);
        $u          = $info['uptime'];
        $time       = preg_replace('/\s+up.*/', "", $u);
        $load       = preg_replace('/.*.\s+load average:\s+/', "", $u);
        $loads      = explode(", ", $load);
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
        $data['node_id']    = $node_id;
        
        $entity     = $this->{'NodeLoads'}->find()->where(['NodeLoads.node_id' => $node_id])->first();
        $new_flag   = true;
        
        if ($entity) { 
            $this->{'NodeLoads'}->patchEntity($entity,$data);
            $new_flag   = false;
        }
        if ($new_flag) {
            $entity   = $this->{'NodeLoads'}->newEntity($data);
        }
        $this->{'NodeLoads'}->save($entity);
    }
    
    private function _do_node_system_info($node_id, $info){
    
        $entity         = $this->{'NodeSystems'}->find()->where(['NodeSystems.node_id' => $node_id,'NodeSystems.name' => 'DISTRIB_BUILD'])->first();
        $create_flag    = true;
            
        if ($entity) {
            $create_flag   = false; //Unset the create flag first
            //Get the current value
            $current_dist_build = $entity->value;
            //Try and check if the value of $dist_build changed.
            $new_dist_build = false;
            if (array_key_exists('release', $info)) {
                $release_array = explode("\n", $info['release']);
                foreach ($release_array as $r) {
                    $r_entry    = explode('=', $r);
                    $elements   = count($r_entry);
                    if ($elements == 2) {
                        $value          = preg_replace('/"|\'/', "", $r_entry[1]);
                        if (preg_match('/DISTRIB_BUILD/', $r_entry[0])) {
                            $new_dist_build = $value;
                            break;
                        }
                    }
                }
            }
        
            if($current_dist_build !== $new_dist_build){ //They differ -> Set the flag again
                $create_flag = true;
            }  
        }
       
        if($create_flag){
            //Wipe all the old entries
            $this->{'NodeSystems'}->deleteAll(['NodeSystems.node_id' => $node_id]);
             //--CPU Info--
             
            if (array_key_exists('cpu', $info)) {
                foreach (array_keys($info['cpu']) as $key) {
                    $d              = [];
                    $d['category']  = 'cpu';
                    $d['name']      = $key;
                    $d['value']     = $info['cpu']["$key"];
                    $d['node_id']   = $node_id;   
                    $ns             = $this->{'NodeSystems'}->newEntity($d);
                    $this->{'NodeSystems'}->save($ns);
                }
            }
            
            //--
            if (array_key_exists('release', $info)) {
                $release_array = explode("\n", $info['release']);
                foreach ($release_array as $r) {
                    $r_entry    = explode('=', $r);
                    $elements   = count($r_entry);
                    if ($elements == 2) {
                        $value          = preg_replace('/"|\'/', "", $r_entry[1]);
                        $d              = [];
                        $d['category']  = 'release';
                        $d['name']      = $r_entry[0];
                        $d['value']     = $value;
                        $d['node_id']   = $node_id;
                        
                        $ns             = $this->{'NodeSystems'}->newEntity($d);
                        $this->{'NodeSystems'}->save($ns);
                    }
                }
            }
        }
    }
    
    private function _lookup_vendor($mac){
    
        $vendor = "-Unkown-";
    
        //Convert the MAC to be in the same format as the file
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
        
        return $vendor;
    }
          
    private function _mem_kb_to_bytes($kb_val){
        $kb = preg_replace('/\s*kb/i', "", $kb_val);
        return($kb * 1024);
    }
}
