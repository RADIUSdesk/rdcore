<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class MdFirewallComponent extends Component {

	protected $Hardware = 'tplink'; //Some default value
	protected $ApId     = '';
	protected $NodeId   = '';
	protected $RadioSettings = [];
	protected $Sets 	= [];

	public function initialize(array $config):void{
        $this->Nodes 		= TableRegistry::get('Nodes');
        $this->Aps   		= TableRegistry::get('Aps'); 
        $this->Meshes		= TableRegistry::get('Meshes');
        $this->ApProfiles	= TableRegistry::get('ApProfiles');
        $this->Hardwares	= TableRegistry::get('Hardwares');
        $this->MacActions	= TableRegistry::get('MacActions');
        $this->FirewallProfiles	= TableRegistry::get('FirewallProfiles');
        
        $this->Sets[-1] = [
        	'name' 		=> 'md_internet_not',
        	'elements' 	=> '10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,255.255.255.255',
        	'comment'	=> 'Private IP Addr Excl For Internet'      
        ];
        $this->Sets[-2] = [
        	'name' 		=> 'md_lan',
        	'elements' 	=> '10.0.0.0/8,172.16.0.0/12,192.168.0.0/16',
        	'comment'	=> 'Private IP Addr LAN'      
        ];         
    }
    
    public function JsonForMac($mac){
    
    	$firewall_list 			= [];
    	$firewall_list['macs'] 	= [];
    	$firewall_list['entries'] = [];
    	$firewall_list['sets']  = []; 
    	
    	$e_ap = $this->{'Aps'}->find()->where(['Aps.mac' => $mac])->contain(['ApProfiles.ApProfileExits'])->first(); //First try for AP
    	if($e_ap){
    	
    	
    		//--MACS--   		
    		$firewall_list['macs'] = $this->_apFwForMac($e_ap);   		   		 
    	 	
    		//--ENTRIES--
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
           	$ap = $query->where(['ApProfiles.id' => $ap_profile_id,'Aps.mac' =>$mac])->first();      	
           	$this->_setApWiFiSettings();
           	//Determine the radio count and configure accordingly
		    $radios = 0;
			$q_e = $this->{'Hardwares'}->find()
				->where(['Hardwares.fw_id' => $this->Hardware,'Hardwares.for_ap' => true])
				->first();
			if($q_e){
			    $radios = $q_e->radio_count;
			}       	           	       	
           	$temp_list = $this->_apMdFw($ap,$radios);
           	foreach($temp_list as $fw){
           		$fw['rules'] = $this->_fwRulesFor($fw);
           		array_push($firewall_list['entries'],$fw);       		       	
           	}
           	
           	//Sets          	 
           	$firewall_list['sets']  = $this->Sets;                  	  	
    	
    	}else{   	
    		$e_node 	= $this->Nodes->find()->where(['Nodes.mac' => $mac])->contain(['Meshes'])->first(); //If not try for Mesh Nodes
    		if($e_node){
    		
    			$firewall_list['macs'] = $this->_meshFwForMac($e_node);
    			
    			//--ENTRIES--
				$mesh_id  		= $e_node->mesh_id;
				$this->Hardware = $e_node->hardware;
				$this->NodeId		= $e_node->id;
				
				$query = $this->{'Nodes'}->find()->contain([
					'Meshes' => [
						'Nodes',
						'MeshEntries',
						'MeshExits' => [
							'MeshExitMeshEntries'
						]
					]
				]);
		       	$node = $query->where(['Meshes.id' => $mesh_id,'Nodes.mac' =>$mac])->first();
		       	     	
		       	$this->_setMeshWiFiSettings();
		       	
	       		//Determine the radio count and configure accordingly
				$radios = 0;
				$q_e = $this->{'Hardwares'}->find()
					->where(['Hardwares.fw_id' => $this->Hardware,'Hardwares.for_mesh' => true])
					->first();
				if($q_e){
					$radios = $q_e->radio_count;
				}       	           	       	
		       	$temp_list = $this->_meshMdFw($node,$radios);

		       	foreach($temp_list as $fw){
		       		$fw['rules'] = $this->_fwRulesFor($fw);
		       		array_push($firewall_list['entries'],$fw);       		       	
		       	}
    			    			
    			//Sets          	 
           		$firewall_list['sets']  = $this->Sets;    		
    		}
    		    	   	    	
    	}
    	   	
    	return $firewall_list;
    }
    
    private function _apFwForMac($e_ap){
    
    	$macs_list = [];
    
    	$cloud_id = $e_ap->ap_profile->cloud_id;
		//Cloud wide rules
		$cloud_actions = $this->{'MacActions'}->find()
			->where(['MacActions.cloud_id' => $cloud_id,'MacActions.action' => 'firewall'])
			->contain(['MacAddresses','FirewallProfiles' => ['FirewallProfileEntries'=>['FirewallProfileEntryFirewallApps'=> 'FirewallApps']]])
			->all();
		foreach($cloud_actions as $ca){
			$m 	= strtolower($ca->mac_address->mac);			
			$rules = [];			
			foreach($ca->firewall_profile->firewall_profile_entries as $rule){		
				unset($rule->created);
				unset($rule->modified);
				
				if($rule->category == 'app'){
					$rule->apps = [];
					foreach($rule->firewall_profile_entry_firewall_apps as $fw_app){
						$app_name = $fw_app->firewall_app->name;
						
						if(!isset($this->Sets[$fw_app->firewall_app->id])){
							unset($fw_app->firewall_app->created);
							unset($fw_app->firewall_app->modified); 
							unset($fw_app->firewall_app->fa_code);  
							unset($fw_app->firewall_app->cloud_id);					
							$this->Sets[$fw_app->firewall_app->id] = $fw_app->firewall_app;	   					
						}
						
						array_push($rule->apps,$app_name); 				
					}
				}				
				unset($rule->firewall_profile_entry_firewall_apps);					
				array_push($rules,$rule) ;  		
			}	  		  						
			array_push($macs_list,['mac' => $m, 'rules' => $rules]);
		}
		
		//Ap Profile specific rules 
		$ap_profile_rules = $this->{'MacActions'}->find()
			->where(['MacActions.ap_profile_id' => $e_ap->ap_profile->id,'MacActions.action' => 'firewall'])
			->contain(['MacAddresses','FirewallProfiles' => ['FirewallProfileEntries'=>['FirewallProfileEntryFirewallApps'=> 'FirewallApps']]])
			->all();
		foreach($ap_profile_rules as $ca){
			$m 	= strtolower($ca->mac_address->mac);
						
			$rules = [];			
			foreach($ca->firewall_profile->firewall_profile_entries as $rule){		
				unset($rule->created);
				unset($rule->modified);
				
				if($rule->category == 'app'){
					$rule->apps = [];
					foreach($rule->firewall_profile_entry_firewall_apps as $fw_app){
						$app_name = $fw_app->firewall_app->name;
						
						if(!isset($this->Sets[$fw_app->firewall_app->id])){
							unset($fw_app->firewall_app->created);
							unset($fw_app->firewall_app->modified); 
							unset($fw_app->firewall_app->fa_code);  
							unset($fw_app->firewall_app->cloud_id);					
							$this->Sets[$fw_app->firewall_app->id] = $fw_app->firewall_app;	   					
						}
						
						array_push($rule->apps,$app_name); 				
					}
				}				
				unset($rule->firewall_profile_entry_firewall_apps);					
				array_push($rules,$rule) ;  		
			}	  					
			array_push($macs_list,['mac' => $m, 'rules' => $rules]);
		} 
       
       	return $macs_list;
    }
    
    private function _meshFwForMac($e_node){
    
    	$macs_list = [];
    
    	$cloud_id = $e_node->mesh->cloud_id;
		//Cloud wide rules
		$cloud_actions = $this->{'MacActions'}->find()
			->where(['MacActions.cloud_id' => $cloud_id,'MacActions.action' => 'firewall'])
			->contain(['MacAddresses','FirewallProfiles' => ['FirewallProfileEntries'=>['FirewallProfileEntryFirewallApps'=> 'FirewallApps']]])
			->all();
		foreach($cloud_actions as $ca){
			$m 	= strtolower($ca->mac_address->mac);			
			$rules = [];			
			foreach($ca->firewall_profile->firewall_profile_entries as $rule){		
				unset($rule->created);
				unset($rule->modified);
				
				if($rule->category == 'app'){
					$rule->apps = [];
					foreach($rule->firewall_profile_entry_firewall_apps as $fw_app){
						$app_name = $fw_app->firewall_app->name;
						
						if(!isset($this->Sets[$fw_app->firewall_app->id])){
							unset($fw_app->firewall_app->created);
							unset($fw_app->firewall_app->modified); 
							unset($fw_app->firewall_app->fa_code);  
							unset($fw_app->firewall_app->cloud_id);					
							$this->Sets[$fw_app->firewall_app->id] = $fw_app->firewall_app;	   					
						}
						
						array_push($rule->apps,$app_name); 				
					}
				}				
				unset($rule->firewall_profile_entry_firewall_apps);					
				array_push($rules,$rule) ;  		
			}	  		  						
			array_push($macs_list,['mac' => $m, 'rules' => $rules]);
		}
		
		//MESH specific rules 
		$mesh_rules = $this->{'MacActions'}->find()
			->where(['MacActions.mesh_id' => $e_node->mesh->id,'MacActions.action' => 'firewall'])
			->contain(['MacAddresses','FirewallProfiles' => ['FirewallProfileEntries'=>['FirewallProfileEntryFirewallApps'=> 'FirewallApps']]])
			->all();
		foreach($mesh_rules as $ca){
			$m 	= strtolower($ca->mac_address->mac);
						
			$rules = [];			
			foreach($ca->firewall_profile->firewall_profile_entries as $rule){		
				unset($rule->created);
				unset($rule->modified);
				
				if($rule->category == 'app'){
					$rule->apps = [];
					foreach($rule->firewall_profile_entry_firewall_apps as $fw_app){
						$app_name = $fw_app->firewall_app->name;
						
						if(!isset($this->Sets[$fw_app->firewall_app->id])){
							unset($fw_app->firewall_app->created);
							unset($fw_app->firewall_app->modified); 
							unset($fw_app->firewall_app->fa_code);  
							unset($fw_app->firewall_app->cloud_id);					
							$this->Sets[$fw_app->firewall_app->id] = $fw_app->firewall_app;	   					
						}
						
						array_push($rule->apps,$app_name); 				
					}
				}				
				unset($rule->firewall_profile_entry_firewall_apps);					
				array_push($rules,$rule) ;  		
			}	  					
			array_push($macs_list,['mac' => $m, 'rules' => $rules]);
		} 
       
       	return $macs_list;
    }
    
    
    private function _fwRulesFor($fw_entry){
      	
  		$rules = [];
    	$fw_entry_id = $fw_entry['firewall_profile_id'];
    	$fw_profile = $this->{'FirewallProfiles'}->find()
    		->contain(['FirewallProfileEntries'=>['FirewallProfileEntryFirewallApps'=> 'FirewallApps']])
    		->where(['FirewallProfiles.id' => $fw_entry_id])
    		->first();		
    		
    	if($fw_profile){   
    		foreach($fw_profile->firewall_profile_entries as $rule){		
    			unset($rule->created);
    			unset($rule->modified);
    			
    			if($rule->category == 'app'){
    				$rule->apps = [];
    				foreach($rule->firewall_profile_entry_firewall_apps as $fw_app){
    					$app_name = $fw_app->firewall_app->name;
    					
    					if(!isset($this->Sets[$fw_app->firewall_app->id])){
    						unset($fw_app->firewall_app->created);
    						unset($fw_app->firewall_app->modified); 
    						unset($fw_app->firewall_app->fa_code);  
    						unset($fw_app->firewall_app->cloud_id);					
    						$this->Sets[$fw_app->firewall_app->id] = $fw_app->firewall_app;	   					
    					}
    					
    					array_push($rule->apps,$app_name); 				
    				}
    			}
    			
    			unset($rule->firewall_profile_entry_firewall_apps);
    			
    			array_push($rules,$rule) ;  		
    		}	  			
    	}
    	return $rules;      
    }
       
    private function _apMdFw($ap,$radio_count){
    
    	$tmp_network = [];
    	$network 	 = [];
    	$fw_flag	 = false;
    	
    	//--Check if there are any active firewalls / if none return --
    	foreach($ap->ap_profile->ap_profile_exits as $e_exit){
    		if($e_exit->apply_firewall_profile){
    			$fw_flag = true;
    			break;
    		}
    	}
    	
    	if(!$fw_flag){
    		return [];
    	}
    		
        $entry_point_data 	= [];  
        $start_number 		= 0;
        $interface_data		= [];
               
        foreach($ap->ap_profile->ap_profile_exits as $ap_profile_e){
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
            	
            	$interface_data[$ap_profile_e->network] = []; //Create an empty entry (which will be polulated later)
            	if($eth_one_bridge){
            		$interface_data[$ap_profile_e->network] = $this->_lan_for($this->Hardware);          		
            	}
            	
            	if($ap_profile_e->apply_firewall_profile){
            		$fw_entry = [
            			'type'					=> $ap_profile_e->type,
            			'firewall_profile_id'	=> $ap_profile_e->firewall_profile_id,
            			'network'				=> $ap_profile_e->network,
            			//'interfaces'			=> []     //There's no interfaces right now we add it only later   		
            		];
            		array_push($tmp_network,$fw_entry);
            	}            	           
            }          
      	}
      	  	
      	$start_number = 0;     	
      	foreach($ap->ap_profile->ap_profile_entries as $ap_profile_e){
            $entry_id   = $ap_profile_e->id;
            foreach($entry_point_data as $epd){
                if($epd['entry_id'] == $entry_id){ //We found our man :-) This means the Entry has been 'connected' to an exit point
                
                	$network_name = $epd['network'];

                	//Now we need to determine the WiFi Interface names
                	for ($y = 0; $y < $radio_count; $y++){
                	
                		if(
                			($ap_profile_e->frequency_band == 'five_upper')||
                			($ap_profile_e->frequency_band == 'five_lower')||
                			($ap_profile_e->frequency_band == 'five')||
                			($ap_profile_e->frequency_band == 'both')
                		){                 		
                			if((!$this->RadioSettings[$y]['disabled'])&&($this->RadioSettings[$y]['band'] == '5g' )){
                				$if_name    = $this->_number_to_word($start_number);
				        		$if_name    = "$if_name"."$y";
				        		array_push($interface_data[$network_name],$if_name);
                				$start_number++;
                			}                			              		
                		}
                		
                		if(
                			($ap_profile_e->frequency_band == 'two')||
                			($ap_profile_e->frequency_band == 'both')
                		){ 
                		
                			if((!$this->RadioSettings[$y]['disabled'])&&($this->RadioSettings[$y]['band'] == '2g' )){
                				$if_name    = $this->_number_to_word($start_number);
				        		$if_name    = "$if_name"."$y";
				        		array_push($interface_data[$network_name],$if_name);
                				$start_number++; 
                			}                 			             		
                		}                	                		
                	}               	                	
                }
            }           
     	}
     	
     	foreach($tmp_network as $n){     	
     		$n['interfaces'] = $interface_data[$n['network']]; 	
     		array_push($network,$n);	
     	}
     	    
    	return $network;
    }
    
    private function _meshMdFw($node,$radio_count){
    
    	$tmp_network = [];
    	$network 	 = [];
    	$fw_flag	 = false;
    	
    	//--Check if there are any active firewalls / if none return --
    	foreach($node->mesh->mesh_exits as $e_exit){
    		if($e_exit->apply_firewall_profile){
    			$fw_flag = true;
    			break;
    		}
    	}
    	
    	if(!$fw_flag){
    		return [];
    	}
    		
        $entry_point_data 	= [];  
        $start_number 		= 2;  #We start at 2 for 'zero' is mesh and 'one' is config ssid on mesh  
        $interface_data		= [];
               
        foreach($node->mesh->mesh_exits as $mesh_e){
            $has_entries_attached   = false;
            $if_name                = 'ex_'.$this->_number_to_word($start_number);
            $exit_id                = $mesh_e->id;
            $type                   = $mesh_e->type;
            $vlan                   = $mesh_e->vlan;
            $eth_one_bridge         = false;
            
            //This is used to fetch info eventually about the entry points
            if(count($mesh_e->mesh_exit_mesh_entries) > 0){
                $has_entries_attached = true;
                foreach($mesh_e->mesh_exit_mesh_entries as $entry){
                    if($entry->mesh_entry_id == 0){
                        $eth_one_bridge = true;
                    }
                    
                    //==OCT ADD ON==
                    if(preg_match('/^-9/',$entry->mesh_entry_id)){ 	
		            	$dynamic_vlan = $entry->mesh_entry_id;
		            	$dynamic_vlan = str_replace("-9","",$dynamic_vlan);
		            	$if_name = 'ex_vlan'.$dynamic_vlan;
		            	$this->ppsk_flag = true; //set the heads-up flag	            
		            }
		                               
                    if($type == 'bridge'){ //The gateway needs the entry points to be bridged to the LAN
                        array_push($entry_point_data, ['network' => 'lan','entry_id' => $entry->mesh_entry_id, 'exit_id'=> $entry->mesh_exit_id ]);
                    }else{
                        array_push($entry_point_data, ['network' => $if_name,'entry_id' => $entry->mesh_entry_id, 'exit_id'=> $entry->mesh_exit_id]);
                    }
                }           
            }

            if($has_entries_attached == true){
            	if($mesh_e->type !== 'bridge'){          
            		$mesh_e->network = $if_name;             		
            		$start_number++;
            	}else{
            		$mesh_e->network = 'lan';
            	}
            	
            	$interface_data[$mesh_e->network] = []; //Create an empty entry (which will be polulated later)
            	if($eth_one_bridge){
            		$interface_data[$mesh_e->network] = $this->_lan_for($this->Hardware);          		
            	}
            	
            	if($mesh_e->apply_firewall_profile){
            		$fw_entry = [
            			'type'					=> $mesh_e->type,
            			'firewall_profile_id'	=> $mesh_e->firewall_profile_id,
            			'network'				=> $mesh_e->network,
            			//'interfaces'			=> []     //There's no interfaces right now we add it only later   		
            		];
            		array_push($tmp_network,$fw_entry);
            	}            	           
            }          
      	}
      	  	
      	$start_number = 2;   #We start at 2 for 'zero' is mesh and 'one' is config ssid on mesh  	
      	foreach($node->mesh->mesh_entries as $mesh_e){
            $entry_id   = $mesh_e->id;
            foreach($entry_point_data as $epd){
                if($epd['entry_id'] == $entry_id){ //We found our man :-) This means the Entry has been 'connected' to an exit point
                
                	$network_name = $epd['network'];

                	//Now we need to determine the WiFi Interface names
                	for ($y = 0; $y < $radio_count; $y++){
                	
                		if(
                			($mesh_e->frequency_band == 'five_upper')||
                			($mesh_e->frequency_band == 'five_lower')||
                			($mesh_e->frequency_band == 'five')||
                			($mesh_e->frequency_band == 'both')
                		){                 		
                			if((!$this->RadioSettings[$y]['disabled'])&&($this->RadioSettings[$y]['band'] == '5g' )){
                				$if_name    = $this->_number_to_word($start_number);
				        		$if_name    = "$if_name"."$y";
				        		array_push($interface_data[$network_name],$if_name);
                				$start_number++;
                			}                			              		
                		}
                		
                		if(
                			($mesh_e->frequency_band == 'two')||
                			($mesh_e->frequency_band == 'both')
                		){ 
                		
                			if((!$this->RadioSettings[$y]['disabled'])&&($this->RadioSettings[$y]['band'] == '2g' )){
                				$if_name    = $this->_number_to_word($start_number);
				        		$if_name    = "$if_name"."$y";
				        		array_push($interface_data[$network_name],$if_name);
                				$start_number++; 
                			}                 			             		
                		}                	                		
                	}               	                	
                }
            }           
     	}
     	
     	foreach($tmp_network as $n){     	
     		$n['interfaces'] = $interface_data[$n['network']]; 	
     		array_push($network,$n);	
     	}
     	    
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
    
    private function _setApWiFiSettings(){
    
        //Get the basics and then do overrides
        $radio_fields = [
            'disabled','band'
        ];
        $model  = $this->Hardware;
        $q_e    = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
        if($q_e){
            foreach($q_e->hardware_radios as $hr){    
                $radio_number   = $hr->radio_number;
                foreach($radio_fields as $fr){                    
                 	$this->RadioSettings[$radio_number]["$fr"] = $hr->{"$fr"};
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
                    
                    $name = str_replace('radio'.$radio_number.'_','',$name);
                    
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
    
  	private function _setMeshWiFiSettings(){
    
        //Get the basics and then do overrides
        $radio_fields = [
            'disabled','band'
        ];
        $model  = $this->Hardware;
        $q_e    = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
        if($q_e){
            foreach($q_e->hardware_radios as $hr){    
                $radio_number   = $hr->radio_number;
                foreach($radio_fields as $fr){                    
                 	$this->RadioSettings[$radio_number]["$fr"] = $hr->{"$fr"};
                }
            }
        }
                
        $q_r = $this->{'Nodes'}->find()->contain(['NodeWifiSettings'])->where(['Nodes.id' => $this->NodeId])->first();
        //There seems to be specific settings for the node
        if($q_r){       
            if(count($q_r->node_wifi_settings) > 0){            
                foreach($q_r->node_wifi_settings as $i){
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
                    
                    $name = str_replace('radio'.$radio_number.'_','',$name);
                    
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

}
