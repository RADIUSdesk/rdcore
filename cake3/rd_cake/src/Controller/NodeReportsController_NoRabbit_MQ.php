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

class NodeReportsController extends AppController {

    protected $main_model = 'Nodes';
    private   $MeshMacLookup = [];
    private   $UptmTimestamp = '0';     

    public function initialize(){
        parent::initialize();
        $this->loadModel('Meshes');
        $this->loadModel('Nodes');
        $this->loadModel('NodeLoads'); 
        $this->loadModel('NodeActions');
        $this->loadModel('NodeSystems');
        $this->loadModel('MeshEntries'); 
        $this->loadModel('NodeIbssConnections');
        $this->loadModel('NodeStations');
        $this->loadModel('NodeNeighbors');
        $this->loadModel('NodeUptmHistories');       
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');   
    }
    
    public function submitReport(){
        $vendor_file        = APP."StaticData".DS."mac_lookup.txt";
        $this->vendor_list  = file($vendor_file); 
        $fb = $this->_new_report();    
        $this->set(array(
            'items'         => $fb,
            'timestamp'     => $this->UptmTimestamp,
            'success'       => true,
            '_serialize' => array('items', 'success','timestamp')
        ));
    }
    
    public function index(){  
        $items = [];      
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
    public function _new_report(){
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
            
            $r0      = $this->request->data['network_info']['radios'][0]['interfaces'];  
            $this->_do_radio_interfaces($entity, $r0);

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
        }
        return $items;
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
        
        if (array_key_exists('drift', $this->request->data)) {
            //FIXME Leave for now
           // $drift  = intval($this->request->data['drift']); 
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
        /* }else{
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
		*/		
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
