<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 29-05-2013
//------------------------------------------------------------

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\Core\Configure;
use Cake\ORM\TableRegistry;
use Cake\Http\Client;


class KickerComponent extends Component {

    protected $radclient;
    //protected $pod_command = '/etc/MESHdesk/pod.lua';
    protected $pod_command 	= 'chilli_query logout mac';
    protected	$coova_md 	= 'CoovaMeshdesk'; 
    protected	$node_action_add = 'http://127.0.0.1/cake4/rd_cake/node-actions/add.json';
    protected	$ap_action_add = 'http://127.0.0.1/cake4/rd_cake/ap-actions/add.json';
    
    public function initialize(array $config):void{
        //Please Note that we assume the Controller has a JsonErrors Component Included which we can access.
        $this->DynamicClients           = TableRegistry::get('DynamicClients');
        $this->MeshExitCaptivePortals   = TableRegistry::get('MeshExitCaptivePortals'); 
        $this->MeshExits                = TableRegistry::get('MeshExits'); 
        $this->Nodes                    = TableRegistry::get('Nodes');
        $this->NodeActions              = TableRegistry::get('NodeActions'); 
    }

    public function kick($ent,$token){
        //---Location of radclient----
        $nasidentifier  = $ent->nasidentifier;
        $radacctid      = $ent->radacctid;
                
     	//First we try to locate the client under dynamic_clients
     	$dc = $this->DynamicClients->find()->where(['DynamicClients.nasidentifier' => $nasidentifier])->first();
     	if($dc){
     		if($dc->type == $this->coova_md){ //It is type CoovaMeshdesk => Now try and locate AP to send command to 
     		
     			//We have a convention of nasidentifier for meshdesk => mcp_<captive_portal_id> and apdesk => ap_<ap id>_cp_<captive_portal_id>
     			if(preg_match('/^mcp_/' ,$nasidentifier)){ //MESHdesk     		
     				$this->kickMeshNodeUser($ent,$dc->cloud_id,$token);
     			}
     			
     			if(preg_match('/^ap_/' ,$nasidentifier)){ //APdesk		
     				$this->kickApUser($ent,$dc->cloud_id,$token); 			
     			}
     			sleep(1); //Give MQTT time to do its thing....  			
     		}   	
     	}
             
        return $data = [];       
    }
       
    private function kickMeshNodeUser($ent,$cloud_id,$token){      
  		$cp = $this->MeshExitCaptivePortals->find()->where(['MeshExitCaptivePortals.radius_nasid' => $ent->nasidentifier])->first();            
        if($cp){
            $exit_id = $cp->mesh_exit_id;
            $exit = $this->MeshExits->find()->where(['MeshExits.id' => $exit_id])->first();
            if($exit){
                $mesh_id    = $exit->mesh_id;
                $gw_nodes   = $this->Nodes->find()->where(['Nodes.gateway !=' => 'none','Nodes.mesh_id' => $mesh_id])->all();
                foreach($gw_nodes as $node){
                    $node_id 	= $node->id;
                    $command 	= $this->pod_command.' '.$ent->callingstationid;
                    $a_data 	= [
                    	'node_id' 	=> $node_id,
                    	'command' 	=> $command, 
                    	'action'	=> 'execute',
						'cloud_id'	=> $cloud_id,
						'token'		=> $token,
						'sel_language'	=> '4_4'
                  	];                  	
                  	$http 		= new Client();
					$response 	= $http->post(
					  $this->node_action_add,
					  json_encode($a_data),
					  ['type' => 'json']
					);                  	                   
                }
            }              
        }       
    }
    
    private function kickApUser($ent,$cloud_id,$token){  
    	//The nasidentifier will be in the format of ap_<ap id>_cp_<cp number>
    	//We just care about the ap id since we will send the logout command to that ap
    	$command 	= $this->pod_command.' '.$ent->callingstationid;
    	$nasid		= $ent->nasidentifier;
    	//remove the _cp_<number>
    	$ap_id      = preg_replace("/_cp_.*/",'', $nasid);
    	//remove the ap_
    	$ap_id      = preg_replace("/^ap_/",'', $ap_id);
    	if($ap_id){
    		$command 	= $this->pod_command.' '.$ent->callingstationid;
            $a_data 	= [
            	'ap_id' 	=> $ap_id,
            	'command' 	=> $command, 
            	'action'	=> 'execute',
				'cloud_id'	=> $cloud_id,
				'token'		=> $token,
				'sel_language'	=> '4_4'
          	];                  	
          	$http 		= new Client();
			$response 	= $http->post(
			  $this->ap_action_add,
			  json_encode($a_data),
			  ['type' => 'json']
			);   	
    	}      
    }
}
