<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class FirewallComponent extends Component {


	public function initialize(array $config):void{
        $this->Nodes 		= TableRegistry::get('Nodes');
        $this->Aps   		= TableRegistry::get('Aps'); 
        $this->ClientMacs   = TableRegistry::get('ClientMacs');
        $this->MacActions   = TableRegistry::get('MacActions');
        $this->Meshes		= TableRegistry::get('Meshes');
        $this->ApProfiles	= TableRegistry::get('ApProfiles');
    }
    
    public function JsonForMac($mac){
    
    	$firewall_list = [];
    
    	$e_ap = $this->{'Aps'}->find()->where(['Aps.mac' => $mac])->contain(['ApProfiles'])->first(); //First try for AP
    	if($e_ap){

    		$cloud_id = $e_ap->ap_profile->cloud_id;
    		//Cloud wide rules
    		$cloud_actions = $this->{'MacActions'}->find()->where(['MacActions.cloud_id' => $cloud_id])->contain(['ClientMacs'])->all();
    		foreach($cloud_actions as $ca){
    			$mac 	= strtolower($ca->client_mac->mac);
    			$action = $ca->action;
    			$bw_up	= false;
    			$bw_down= false;
    			if($action == 'limit'){
    				$bw_up = $ca->bw_up;
    				$bw_down = $ca->bw_down;
    			}
    			array_push($firewall_list,['mac' => $mac,'action' => $action,'bw_up' => $bw_up,'bw_down' => $bw_down]);
    		}
    		//Ap Profile specific rules 
    		$ap_profile_rules = $this->{'MacActions'}->find()->where(['MacActions.ap_profile_id' => $e_ap->ap_profile->id])->contain(['ClientMacs'])->all();
    		foreach($ap_profile_rules as $ca){
    			$mac 	= strtolower($ca->client_mac->mac);
    			$action = $ca->action;
    			$bw_up	= false;
    			$bw_down= false;
    			if($action == 'limit'){
    				$bw_up = $ca->bw_up;
    				$bw_down = $ca->bw_down;
    			}
    			array_push($firewall_list,['mac' => $mac,'action' => $action,'bw_up' => $bw_up,'bw_down' => $bw_down]);
    		}   
    
    	}else{
    	
    		$e_node 	= $this->Nodes->find()->where(['Nodes.mac' => $mac])->contain(['Meshes'])->first(); //If not try for Mesh Nodes
    		$cloud_id 	= $e_node->mesh->cloud_id;
    		//Cloud wide rules
    		$cloud_actions = $this->{'MacActions'}->find()->where(['MacActions.cloud_id' => $cloud_id])->contain(['ClientMacs'])->all();
    		foreach($cloud_actions as $ca){
    			$mac 	= strtolower($ca->client_mac->mac);
    			$action = $ca->action;
    			$bw_up	= false;
    			$bw_down= false;
    			if($action == 'limit'){
    				$bw_up = $ca->bw_up;
    				$bw_down = $ca->bw_down;
    			}
    			array_push($firewall_list,['mac' => $mac,'action' => $action,'bw_up' => $bw_up,'bw_down' => $bw_down]);
    		}
    		//Mesh specific rules
    		$mesh_rules = $this->{'MacActions'}->find()->where(['MacActions.mesh_id' => $e_node->mesh->id])->contain(['ClientMacs'])->all();
    		foreach($mesh_rules as $ca){
    			$mac 	= strtolower($ca->client_mac->mac);
    			$action = $ca->action;
    			$bw_up	= false;
    			$bw_down= false;
    			if($action == 'limit'){
    				$bw_up = $ca->bw_up;
    				$bw_down = $ca->bw_down;
    			}
    			array_push($firewall_list,['mac' => $mac,'action' => $action,'bw_up' => $bw_up,'bw_down' => $bw_down]);
    		}  
    	
    	}
    	  
    	return $firewall_list;
    }


}
