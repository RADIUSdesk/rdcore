<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class MdFirewallComponent extends Component {

	protected $Hardware = 'tplink'; //Some default value
	protected $ApId     = '';
	protected $RadioSettings = [];

	public function initialize(array $config):void{
        $this->Nodes 		= TableRegistry::get('Nodes');
        $this->Aps   		= TableRegistry::get('Aps'); 
        $this->Meshes		= TableRegistry::get('Meshes');
        $this->ApProfiles	= TableRegistry::get('ApProfiles');
        $this->Hardwares	= TableRegistry::get('Hardwares');
    }
    
    public function JsonForMac($mac){
    
    	$firewall_list = [];
    	
    	$e_ap = $this->{'Aps'}->find()->where(['Aps.mac' => $mac])->contain(['ApProfiles.ApProfileExits'])->first(); //First try for AP
    	if($e_ap){
    	
    		$ap_profile_id  = $e_ap->ap_profile_id;
    		$this->Hardware = $e_ap->hardware;
    		$this->ApId		= $e_ap->id;
    		
			$query = $this->{'Aps'}->find()->contain([
				'ApProfiles' => [
					'Aps',
					'ApProfileEntries',
					'ApProfileExits' => [
						'ApProfileExitApProfileEntries'
					]
				]
			]);
           	$ap_profile = $query->where(['ApProfiles.id' => $ap_profile_id,'Aps.mac' =>$mac])->first();
           	
           	$firewall_list = $this->_apMdFw($ap_profile);
           	$this->_setWiFiSettings();
    	
    	
    	}else{
    	
    		$e_node 	= $this->Nodes->find()->where(['Nodes.mac' => $mac])->contain(['Meshes'])->first(); //If not try for Mesh Nodes
    		print_r($e_node);
    	   	
    	
    	}
    	   	
    	return $firewall_list;
    }
    
    
    private function _apMdFw($ap_profile){
    
    	$network 	= [];
    	$br_int 	= $this->_ap_wan_for($this->Hardware);
    	$wan_if 	= $br_int;
    	
        $entry_point_data = [];  
        $start_number = 0;
               
        foreach($ap_profile->ap_profile->ap_profile_exits as $ap_profile_e){
            $has_entries_attached   = false;
            $if_name                = 'ex_'.$this->_number_to_word($start_number);
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
		            	$if_name = 'ex_vlan'.$dynamic_vlan;
		            	$this->ppsk_flag = true; //set the heads-up flag	            
		            }
		                               
                    if($type == 'bridge'){ //The gateway needs the entry points to be bridged to the LAN
                        array_push($entry_point_data, ['network' => 'lan','entry_id' => $entry->ap_profile_entry_id, 'exit_id'=> $entry->ap_profile_exit_id ]);
                    }else{
                        array_push($entry_point_data, ['network' => $if_name,'entry_id' => $entry->ap_profile_entry_id, 'exit_id'=> $entry->ap_profile_exit_id]);
                    }
                }           
            }
            
            if($has_entries_attached == true){
            	if($ap_profile_e->type !== 'bridge'){          
            		$ap_profile_e->network = $if_name;             		
            		$start_number++;
            	}else{
            		$ap_profile_e->network = 'lan';
            	}
            	array_push($network,$ap_profile_e);           
            }          
      	}
      	
      	print_r($entry_point_data);
    
    	return $network;
    }
    
    private function _ap_wan_for($hw){
		$return_val = 'eth0'; //some default	
		$q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hw, 'Hardwares.for_ap' => true])->first();
		if($q_e){
		    $return_val = $q_e->wan;   
		}
		return $return_val;
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
    
    private function _setWiFiSettings(){
    
        //Get the basics and then do overrides
        $radio_fields = [
            'disabled','band'
        ];
        $model  = $this->Hardware;
        $q_e    = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
        if($q_e){
            foreach($q_e->hardware_radios as $hr){    
                $radio_number   = $hr->radio_number;
                $prefix = 'radio'.$radio_number.'_';
                foreach($radio_fields as $fr){                    
                 	$this->RadioSettings[$radio_number]["$prefix$fr"] = $hr->{"$fr"};
                }
            }
        }
                
        $q_r = $this->{'Aps'}->find()->contain(['ApWifiSettings'])->where(['Aps.id' => $this->ApId])->first();
        //There seems to be specific settings for the node
        if($q_r){       
            if(count($q_r->ap_wifi_settings) > 0){            
                foreach($q_r->ap_wifi_settings as $i){
                    $name  = $i['name'];
                    $value = $i['value'];                   
                    if(preg_match('/(^radio.*disabled)|(^radio.*band)/', $name) === 0){ //If it does not start with 'radio'
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
        }
    }

}
