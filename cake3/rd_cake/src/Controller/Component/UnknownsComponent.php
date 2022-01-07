<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component that is used to record Unknown thing, e.g Nodes, Access Points etc
//---- Date: 05-05-2018
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class UnknownsComponent extends Component {

    public function initialize(array $config){
        //Please Note that we assume the tontroller has a JsonErrors Component Included which we can access.
        $this->controller = $this->_registry->getController();
    }

    public function RecordUnknownNode(){
        $unknown_table      = 'UnknownNodes';
        $this->record_unknown($unknown_table);
    }
    
    public function RecordUnknownAp(){
        $unknown_table = 'UnknownAps';
        $this->record_unknown($unknown_table);
    }
    
    private function record_unknown($unknown_table){
    
        $this->{$unknown_table} = TableRegistry::get($unknown_table);
        
        $gw = false;
        if(isset($this->request->query['gateway'])){
            if($this->request->query['gateway'] == 'true'){
                $gw = true;
            }
        }
        $mac = $this->request->query['mac'];
        
        $ip 					        = $this->request->clientIp();
		$data 					        = array();
		$data['mac'] 			        = $mac;
		$data['from_ip']		        = $ip;
		$data['gateway']		        = $gw;
		$data['last_contact']	        = date("Y-m-d H:i:s", time());
		$data['last_contact_from_ip']   = $this->request->clientIp();
		
		if(isset($this->request->query['name'])){
		    $data['name'] = $this->request->query['name'];
		}
		
		if(isset($this->request->query['token_key'])){
		    $token_key      = $this->request->query['token_key'];
		    $firmware_keys   = TableRegistry::get('FirmwareKeys');
		    $q_fk = $firmware_keys->find()->where(['FirmwareKeys.token_key' => $token_key])->first();
		    if($q_fk){
		        $data['firmware_key_id'] = $q_fk->id;
		    }
		}
		$include_new_server = false;
		$include_new_mode   = false;
		
		$entity = $this->{"$unknown_table"}->find()->where(["$unknown_table".".mac" => $mac])->first();
		if($entity){
		    $new_server = $entity->new_server;
            if($new_server != ''){           
                $data['new_server_status'] = 'fetched';
                $include_new_server = true;
            }
            if(($entity->new_mode !== null)&&($entity->new_mode_status !== 'fetched')){
                $data['new_mode_status'] = 'fetched';
                $include_new_mode = true;
            }  
		    $this->{"$unknown_table"}->patchEntity($entity, $data);
		}else{
		    $entity = $this->{"$unknown_table"}->newEntity($data);
		}
		
		if ($this->{"$unknown_table"}->save($entity)) {
		    
		    if(($include_new_server)||($include_new_mode)){
		        $fb             = [];
		        $fb['success']  = false;
		        $serialize      = ['success'];
		        
		        if($include_new_server){
		            $fb['new_server'] = $new_server;
		            $fb['new_server_protocol'] = $entity->new_server_protocol;
		            array_push($serialize,'new_server','new_server_protocol');
		        }
		          
		        if($include_new_mode){
		            $fb['new_mode'] = $entity->new_mode;
		            array_push($serialize,'new_mode');
		        }
		        $fb['_serialize'] = $serialize;
		        
		        $this->controller->set($fb);
            }else{
                $this->controller->JsonErrors->errorMessage("MAC Address: ".$mac." not defined on system",'error'); 
            }     
        }else{
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);   
        }  
    }
}
