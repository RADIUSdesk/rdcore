<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use GuzzleHttp\Client;

class CoaRequestsController extends AppController{
  
    protected $main_model   = 'CoaRequests';
    protected $c_debug      = true;
  
    public function initialize(){  
        parent::initialize(); 
        $this->loadModel($this->main_model);
        $this->loadModel('MeshExitCaptivePortals');
        $this->loadModel('MeshExits');
        $this->loadModel('Nodes');
        $this->loadModel('NodeActions');
        $this->loadComponent('JsonErrors'); 
    }
    
    public function coaReply(){
        $items = [];
    
        if($this->request->is('post')){  
            $data   = $this->request->getData();
            $items  = $this->request->getData();
            if(isset($data['mac'])){
                $mac = $data['mac']; 
                $n_ent = $this->Nodes->find()->where(['Nodes.mac' => $mac])->first();
                if($n_ent){
                    if(isset($data['coa_results'])){
                        foreach($data['coa_results'] as $result){
                            $e_coa_request = $this->{$this->main_model}->find()
                                ->where(['id' => $result['id'],'node_id' => $n_ent->id]) //Be strict where only AP can update own with results
                                ->first(); 
                            if($e_coa_request){
                                $this->{$this->main_model}->patchEntity($e_coa_request, ['result'=> $result['results'],'status' => 'replied']);
                                $this->{$this->main_model}->save($e_coa_request);
                            }                        
                        }                                   
                    }         
                }            
            }
        }          
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ));   
    }
    
    public function coaForMac(){
    
        $items = [];
        $data['found'] = false;
        if($this->request->is('post')){   
            $data =$this->request->getData();
            if(isset($data['mac'])){
                $mac = $data['mac']; 
                $n_ent = $this->Nodes->find()->where(['Nodes.mac' => $mac])->first();
                if($n_ent){
                    $node_id    = $n_ent->id;
                    $ent_list   = $this->{$this->main_model}->find()
                        ->select(['id','request_type','avp_json','status'])
                        ->where(['node_id' => $node_id,'status' => 'awaiting'])
                        ->all();
                                                
                    foreach($ent_list as $ent){
                        $data = $ent->toArray();
                        $data['avp'] = json_decode($ent->avp_json);
                        unset($data['avp_json']);
                        unset($data['status']);    
                        array_push($items,$data);
                        
                        //Update it 
                        $this->{$this->main_model}->patchEntity($ent, ['status' => 'fetched']);
                        $this->{$this->main_model}->save($ent);
                    }
                }              
            }
        }    
                  
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ));       
    }
    
    public function coaDetail(){
    
        $data = [];
        $data['found'] = false;
        if($this->request->is('post')){   
            $data =$this->request->getData();
            if(isset($data['mac'])){
                $mac = $data['mac']; 
                $n_ent = $this->Nodes->find()->where(['Nodes.mac' => $mac])->first();
                if($n_ent){
                    $node_id = $n_ent->id;
                    if(isset($data['coa_request_id'])){
                        $coa_request_id = $data['coa_request_id'];
                        $c_ent = $this->{$this->main_model}->find()->where(['id' => $coa_request_id])->first();
                        if($c_ent){
                            if($node_id == $c_ent->node_id){
                                $data['found'] = true;
                                $data['request_type'] = $c_ent->request_type;
                                $data['avp'] = json_decode($c_ent->avp_json);
                            } 
                        }        
                    }
                }
            }
        }
          
        $this->set(array(
            'data' => $data,
            'success' => true,
            '_serialize' => ['data','success']
        ));   
    }
    
    public function coaAdd(){     
        $data = [];         
        if ($this->request->is('post')) {     
            $data =$this->request->getData();
            //We need at least the NAS-Identifier
            if(isset($data['NAS-Identifier'])){
                //Process the COA    
                $this->_process_coa($data);
            }else{
                 $this->log("NAS-Identifier Missing", 'alert');
                 $this->log($data, 'alert');           
            }      
        }
        
        $this->set(array(
            'data' => $data,
            'success' => true,
            '_serialize' => array('data','success')
        ));
    }
    
    public function edit(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
       
        if ($this->request->is('post')) {
        
            $items = [];
        
            foreach(array_keys($this->request->data) as $k){
                $q_r = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => $k ])->first();
                if($q_r){
                    array_push($items,$k);
                    $value = $this->request->data[$k];
                    $this->{$this->main_model}->patchEntity($q_r, ['value'=> $value]);
                    $this->{$this->main_model}->save($q_r);
                }else{
                    if(($k !== 'token')&&($k !== 'sel_language')){
                        $d = [];
                        $d['name']      = $k;
                        $d['value']     = $this->request->data[$k];
                        $d['user_id']   = -1;
                        $entity = $this->{$this->main_model}->newEntity($d);
                        $this->{$this->main_model}->save($entity);
                    }
                }
            }

            $this->set(array(
                'items' => $items,
                'success' => true,
                '_serialize' => array('items','success')
            ));
               
        }
    }
   
    //================ Private Functions ========
   
    private function _process_coa($data){  
        //See if NASID can be traced to a mesh_captive portal
        $nasidentifier = $data['NAS-Identifier']; 
        $request_type  = 'pod';
        //Request type: if there is a XWF-Authorize-Class-Name attribute present we will mark it as coa
        if(isset($data['XWF-Authorize-Class-Name'])){
            $request_type  = 'coa';
        }
              
        $cp = $this->{'MeshExitCaptivePortals'}->find()->where(['MeshExitCaptivePortals.radius_nasid' => $nasidentifier])->first();
        if($cp){
            $multiple_gateways = false;
            $exit_id = $cp->mesh_exit_id;
            $this->_log("Nasidentifier $nasidentifier Found Under MESHdesk Captive Portals Mesh Exit ID $exit_id");
            $exit = $this->{'MeshExits'}->find()->where(['MeshExits.id' => $exit_id])->first();
            if($exit){
                $mesh_id    = $exit->mesh_id;
                $gw_nodes   = $this->Nodes->find()->where(['Nodes.gateway !=' => 'none','Nodes.mesh_id' => $mesh_id])->all();
                $gw_count   = count($gw_nodes);
                
                if($gw_count > 1){
                    $multiple_gateways = true;
                }
                $this->_log("There are ".$gw_count." Gateway Nodes");
                
                foreach($gw_nodes as $node){
                    $this->_log("Add COA Request For Node ".$node->id);
                    $d = [];
                    $d['node_id']            = $node->id;
                    $d['multiple_gateways']  = $multiple_gateways;
                    $d['avp_json']           = json_encode($data);
                    $d['request_type']       = $request_type;    
                    $entity = $this->{'CoaRequests'}->newEntity($d);
                    if ($this->{'CoaRequests'}->save($entity)){
                    
                    }
                    //Tell the node there is something waiting for it....
                    $this->_informNode($node->id);   
                }
                
                if($gw_count == 0){
                    $this->_log("No Gateways found - Add request regardless for troubleshooting");
                    $this->_add_with_missing_info($data);
                }               
            }else{
                $this->_log("No Exit found - Add request regardless for troubleshooting");
                $this->_add_with_missing_info($data);     
            }              
        }else{
            $this->_log("Nasidentifier $nasidentifier NOT Found Under MESHdesk Captive Portals");
            $this->_add_with_missing_info($data);     
        }  
    }
    
    private function _log($item){
       
        if($this->c_debug){
            $this->log($item, 'alert');
        }   
    }
    
    private function _add_with_missing_info($data){
    
        $request_type  = 'pod';
        //Request type: if there is a XWF-Authorize-Class-Name attribute present we will mark it as coa
        if(isset($data['XWF-Authorize-Class-Name'])){
            $request_type  = 'coa';
        } 
        $d = [];
        $d['avp_json']           = json_encode($data);
        $entity = $this->{'CoaRequests'}->newEntity($d);
        if ($this->{'CoaRequests'}->save($entity)){
        
        }
    }
    
    private function _informNode($node_id){
    
        // Load Config
        Configure::load('MESHdesk');
        $cfg    = Configure::read('mqtt_settings');
        $cmd    = '/etc/MESHdesk/reporting/check_for_coa.lua';
        $entity = $this->{'NodeActions'}->newEntity(['node_id' => $node_id,'command' => $cmd]);
        
        if ($this->{'NodeActions'}->save($entity)) {

            if ($cfg['enable_realtime']){
                // Talk to MQTT Broker
                $data = $this->_get_node_mac_mesh_id($node_id);
                $payload = [
                    'node_id'   => $node_id,
                    'mac'       => strtoupper($data['mac']),
                    'mesh_id'   => strtoupper($data['ssid']),
                    'cmd_id'    => $entity->id,
                    'cmd'       => $cmd
                ];

                $client = new Client();
                if($this->_check_server($client, $cfg['api_gateway_url'], 20)){
                    $client->request('POST', $cfg['api_gateway_url'] . '/mesh/node/command', ['json' => ['message' => $payload]]);
                }
            }

            $this->set(array(
			    'success' => true,
			    '_serialize' => array('success')
			));
			return;
		} else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
    }
    
    private function _get_node_mac_mesh_id($node_id){
        $query = $this->Nodes->find();
        $query->contain(['Meshes']);
        $q_r = $query->where(['Nodes.id' => $node_id])->first();

        if($q_r){
            return [
                'mac' => $q_r->mac,
                'ssid' => strtoupper(str_replace('_','-',$q_r->mesh->ssid))
            ];
        }
        return [
            'mac' => '',
            'ssid' => ''
        ];
    }
    
    private function _check_server($client, $url, $timeout = 30){

        try {
            $client->request('GET', $url, ['timeout' => $timeout]);
            return true;

        } catch (\Exception $e) {
            // Fail silently
            return false;
        }
    }
 
}
