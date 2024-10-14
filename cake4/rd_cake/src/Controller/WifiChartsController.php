<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class WifiChartsController extends AppController{
  
    public $base            = "Access Providers/Controllers/WifiCharts/";   
    protected $owner_tree   = [];
    protected $main_model   = 'Meshes';   
    protected $time_zone    = 'UTC'; //Default for timezone
    protected $span         = 'hour'; //hour, day or week
    
    protected $graph_item   = 'ssid'; //ssid or node or device or ap or ap_device
    protected $ssid         = '';
    protected $node         = '';
    protected $mac          = '';
    protected $ap_profile_id = false;
    protected $cloud_wide   = false;
    protected $fw_command   = '/etc/MESHdesk/utils/fetch_firewall.lua';
    protected $adv_fw_command	= '/etc/MESHdesk/utils/fetch_adv_firewall.lua';
      
    protected $fields       = [
        'data_in'       => 'sum(tx_bytes)',
        'data_out'      => 'sum(rx_bytes)',
        'data_total'    => 'sum(tx_bytes) + sum(rx_bytes)'
    ];
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Meshes'); 
        $this->loadModel('Users');
        $this->loadModel('Timezones');
        $this->loadModel('MacAliases'); 
        $this->loadModel('NodeStations');
        $this->loadModel('ApStations');
        $this->loadModel('Aps');
        
        $this->loadModel('NodeStationHourlies');
        $this->loadModel('ApStationHourlies');
        
        $this->loadModel('MacActions');
        $this->loadModel('MacAddresses');
        $this->loadModel('NodeActions');
        $this->loadModel('ApActions');
        $this->loadModel('Nodes');
        $this->loadModel('Aps');
        $this->loadModel('ApProfiles'); 
          
        $this->loadComponent('Aa');
        $this->loadComponent('MacVendors');      
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');    
    }
        
    public function editMacBlock(){
    	//__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $req_d = $this->request->getData();
        $req_q = $this->request->getQuery(); 
              
        //-- Tweaks for Modern --
        if(isset($req_d['cloud_id'])){
        	$cloud_id 	= $req_d['cloud_id'];
        }
        
        if(isset($req_d['mac'])){
        	$req_d['items'] = [
        		[ 'mac' => $req_d['mac']]
        	];
        }
        
        if(isset($req_d['remove_block'])&&($req_d['remove_block'] == 'null')){      
        	unset($req_d['remove_block']);
        }
        //-- END Tweaks for Modern --  
           
       	if(isset($req_q['cloud_id'])){
       		$cloud_id 	= $req_q['cloud_id'];
       	}	
        
       	$ap_profile_id = false;
       	if(isset($req_d['ap_id'])){      	
       		$e_ap 			= $this->{'Aps'}->find()->where(['Aps.id' => $req_d['ap_id']])->first();
       		if($e_ap){  	
       			$ap_profile_id	= $e_ap->ap_profile_id;
       		}
       	}
       	
       	$mesh_id = false;
       	if(isset($req_d['mesh_id'])){
       		$mesh_id	= $req_d['mesh_id'];
       	}
       	
       	if(isset($req_d['scope'])){
       		if($req_d['scope'] == 'cloud_wide'){
       			$this->cloud_wide = true;
       		}
       	}
       	      	
       	//Remove old entries to start with
       	foreach($req_d['items'] as $item){
			$mac = $this->{'MacAddresses'}->find()->where(['MacAddresses.mac' => $item['mac']])->first();
			if($mac){ 
				$mac_address_id = $mac->id;
				if($this->cloud_wide){ //This we only delete if it is specified ans cloud wide else we ignore it
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.cloud_id' => $cloud_id]);
				}
				//These we always remove to start clean
				if($mesh_id){
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.mesh_id' => $mesh_id]);
				}
				if($ap_profile_id){
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.ap_profile_id' => $ap_profile_id]);
				}
			}			
		}
			 		
   		if(!isset($req_d['remove_block'])){
		
			foreach($req_d['items'] as $item){
				$e_mac = $this->{'MacAddresses'}->find()->where(['MacAddresses.mac' => $item['mac']])->first();
				if(!$e_mac){			
					$e_mac = $this->{'MacAddresses'}->newEntity(['mac' => $item['mac']]);
					$this->{'MacAddresses'}->save($e_mac);
				}
				$d_action = [
					'mac_address_id' => $e_mac->id,
					'action'		 => 'block'	
				];
				if($this->cloud_wide){
					$d_action['cloud_id'] = $cloud_id;
				}else{
					if($mesh_id){
						$d_action['mesh_id'] = $mesh_id;
					}
					if($ap_profile_id){
						$d_action['ap_profile_id'] = $ap_profile_id;
					}
				}
				$e_ma = $this->{'MacActions'}->newEntity($d_action);
				$this->{'MacActions'}->save($e_ma);	
			}			
		}
		
		//Action section
		if($this->cloud_wide){
			$this->_addActionsCloud($cloud_id);
		}else{
			if($mesh_id){
				$this->_addActionsMesh($mesh_id);
			}
			if($ap_profile_id){
				$this->_addActionsApProfile($ap_profile_id);
			}
		}
		      
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);    
    }
    
    public function editMacLimit(){
    	//__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        /*
        	Mbps : Megabit per second (Mbit/s or Mb/s)
			kB/s : Kilobyte per second
			1 byte = 8 bits
			1 bit  = (1/8) bytes
			1 bit  = 0.125 bytes
			1 kilobyte = 10001 bytes
			1 megabit  = 10002 bits
			1 megabit  = (1000 / 8) kilobytes
			1 megabit  = 125 kilobytes
			1 megabit/second = 125 kilobytes/second
			1 Mbps = 125 kB/s
        */
        
        $req_d = $this->request->getData();
        $req_q = $this->request->getQuery();    

       	
       	//-- Tweaks for Modern --
        if(isset($req_d['cloud_id'])){
        	$cloud_id 	= $req_d['cloud_id'];
        }
        
        if(isset($req_d['mac'])){
        	$req_d['items'] = [
        		[ 'mac' => $req_d['mac']]
        	];
        }
        
        if(isset($req_d['remove_limit'])&&($req_d['remove_limit'] == 'null')){      
        	unset($req_d['remove_limit']);
        }
        //-- END Tweaks for Modern --  
           
       	if(isset($req_q['cloud_id'])){
       		$cloud_id 	= $req_q['cloud_id'];
       	}	
       	       	
       	$ap_profile_id = false;
       	if(isset($req_d['ap_id'])){      	
       		$e_ap 			= $this->{'Aps'}->find()->where(['Aps.id' => $req_d['ap_id']])->first();
       		if($e_ap){  	
       			$ap_profile_id	= $e_ap->ap_profile_id;
       		}
       	}
       	     	
       	$mesh_id = false;
       	if(isset($req_d['mesh_id'])){
       		$mesh_id	= $req_d['mesh_id'];
       	}
       	
       	if(isset($req_d['scope'])){
       		if($req_d['scope'] == 'cloud_wide'){
       			$this->cloud_wide = true;
       		}
       	}
       	
       	//Remove old entries to start with
       	foreach($req_d['items'] as $item){
			$mac = $this->{'MacAddresses'}->find()->where(['MacAddresses.mac' => $item['mac']])->first();
			if($mac){ 
				$mac_address_id = $mac->id;
				if($this->cloud_wide){ //This we only delete if it is specified ans cloud wide else we ignore it
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.cloud_id' => $cloud_id]);
				}
				//These we always remove to start clean
				if($mesh_id){
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.mesh_id' => $mesh_id]);
				}
				if($ap_profile_id){
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.ap_profile_id' => $ap_profile_id]);
				}
			}			
		}
		
		 		
   		if(!isset($req_d['remove_limit'])){
   		
	   		//download
	   		$d_amount 	= $req_d['limit_download_amount'];
	   		$d_unit 	= $req_d['limit_download_unit'];
	   		if($d_unit == 'mbps'){
	   			$bw_down = ($d_amount * 1000) / 8;
	   		}
	   		if($d_unit == 'kbps'){
	   			$bw_down = $d_amount / 8;
	   		}
	   		//Upload
	   		$u_amount 	= $req_d['limit_upload_amount'];
	   		$u_unit 	= $req_d['limit_upload_unit'];
	   		if($u_unit == 'mbps'){
	   			$bw_up = ($u_amount * 1000) / 8;
	   		}
	   		if($u_unit == 'kbps'){
	   			$bw_up = $u_amount / 8;
	   		}
	   		   		
	   		foreach($req_d['items'] as $item){
				$e_mac = $this->{'MacAddresses'}->find()->where(['MacAddresses.mac' => $item['mac']])->first();
				if(!$e_mac){			
					$e_mac = $this->{'MacAddresses'}->newEntity(['mac' => $item['mac']]);
					$this->{'MacAddresses'}->save($e_mac);
				}
				$d_action = [
					'mac_address_id' => $e_mac->id,
					'action'		 => 'limit',
					'bw_up'			 => $bw_up,
					'bw_down'		 => $bw_down	
				];
				if($this->cloud_wide){
					$d_action['cloud_id'] = $cloud_id;
				}else{
					if($mesh_id){
						$d_action['mesh_id'] = $mesh_id;
					}
					if($ap_profile_id){
						$d_action['ap_profile_id'] = $ap_profile_id;
					}
				}
				$e_ma = $this->{'MacActions'}->newEntity($d_action);
				$this->{'MacActions'}->save($e_ma);	
			}		
		}
		
		//Action section
		if($this->cloud_wide){
			$this->_addActionsCloud($cloud_id);
		}else{
			if($mesh_id){
				$this->_addActionsMesh($mesh_id);
			}
			if($ap_profile_id){
				$this->_addActionsApProfile($ap_profile_id);
			}
		}
		
						               
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);    
    } 
    
   	public function editMacFirewall(){
    	//__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
             
        $req_d = $this->request->getData();
        $req_q = $this->request->getQuery(); 
        
        //-- Tweaks for Modern --
        if(isset($req_d['cloud_id'])){
        	$cloud_id 	= $req_d['cloud_id'];
        }
        
        if(isset($req_d['mac'])){
        	$req_d['items'] = [
        		[ 'mac' => $req_d['mac']]
        	];
        }
        
        if(isset($req_d['remove_firewall'])&&($req_d['remove_firewall'] == 'null')){      
        	unset($req_d['remove_firewall']);
        }
        //-- END Tweaks for Modern --       
        
        if(isset($req_q['cloud_id'])){
       		$cloud_id 	= $req_q['cloud_id'];
       	}
       	      	      	
       	$ap_profile_id = false;
       	if(isset($req_d['ap_id'])){      	
       		$e_ap 			= $this->{'Aps'}->find()->where(['Aps.id' => $req_d['ap_id']])->first();
       		if($e_ap){  	
       			$ap_profile_id	= $e_ap->ap_profile_id;
       		}
       	}
       	     	
       	$mesh_id = false;
       	if(isset($req_d['mesh_id'])){
       		$mesh_id	= $req_d['mesh_id'];
       	}
       	
       	if(isset($req_d['scope'])){
       		if($req_d['scope'] == 'cloud_wide'){
       			$this->cloud_wide = true;
       		}
       	}
       	       	
       	//Remove old entries to start with
       	foreach($req_d['items'] as $item){
			$mac = $this->{'MacAddresses'}->find()->where(['MacAddresses.mac' => $item['mac']])->first();
			if($mac){ 
				$mac_address_id = $mac->id;
				if($this->cloud_wide){ //This we only delete if it is specified and cloud wide else we ignore it
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.cloud_id' => $cloud_id]);
				}
				//These we always remove to start clean
				if($mesh_id){
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.mesh_id' => $mesh_id]);
				}
				if($ap_profile_id){
					$this->{'MacActions'}->deleteAll(['MacActions.mac_address_id' => $mac_address_id, 'MacActions.ap_profile_id' => $ap_profile_id]);
				}
			}			
		}
		 		
   		if(!isset($req_d['remove_firewall'])){
   			   		   		
	   		foreach($req_d['items'] as $item){
				$e_mac = $this->{'MacAddresses'}->find()->where(['MacAddresses.mac' => $item['mac']])->first();
				if(!$e_mac){			
					$e_mac = $this->{'MacAddresses'}->newEntity(['mac' => $item['mac']]);
					$this->{'MacAddresses'}->save($e_mac);
				}
				$d_action = [
					'mac_address_id' => $e_mac->id,
					'action'		 => 'firewall',
					'firewall_profile_id'	=> $req_d['firewall_profile_id']
				];
				if($this->cloud_wide){
					$d_action['cloud_id'] = $cloud_id;
				}else{
					if($mesh_id){
						$d_action['mesh_id'] = $mesh_id;
					}
					if($ap_profile_id){
						$d_action['ap_profile_id'] = $ap_profile_id;
					}
				}
				$e_ma = $this->{'MacActions'}->newEntity($d_action);
				$this->{'MacActions'}->save($e_ma);	
			}		
		}
		
		//Action section
		if($this->cloud_wide){
			//$this->_addActionsCloud($cloud_id);
		}else{
			if($mesh_id){
				$this->_addActionsMesh($mesh_id);
			}
			if($ap_profile_id){
				$this->_addActionsApProfile($ap_profile_id);
			}
		}						               
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);    
    } 
        
    public function editMacAlias(){   
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $post_data 	= $this->request->getData();
        $cloud_id	= $post_data['cloud_id'];

        //==== MacAliases.mac ====
        $mac_address_id = $this->_findMacAddressId($this->request->getData('mac'));
        $post_data                      = $this->request->getData();
        $post_data['mac_address_id']    = $mac_address_id;
        $macAlias  = $this->MacAliases->find()->where(['MacAliases.mac_address_id' => $mac_address_id,'MacAliases.cloud_id' => $this->request->getData('cloud_id')])->first();          
        if(isset($post_data['remove_alias'])&&($post_data['remove_alias']!== 'null')){

	        $this->{'MacAliases'}->delete($macAlias);
	        $this->set([
	            'success' => true
	        ]);
	        $this->viewBuilder()->setOption('serialize', true); 
	        return;

        }	
        
        if($macAlias){
            $this->MacAliases->patchEntity($macAlias, $post_data);
        }else{
            $macAlias = $this->MacAliases->newEntity($post_data);
        }
        
        if ($this->MacAliases->save($macAlias)) {
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true); 
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
    }
    
    //-------------------------------------------
    //------- GRAPH Functions -------------------
    //-------------------------------------------
    
    //------ APDESK ------
    
    public function apUsageForSsid(){
    
        //Try to determine the timezone if it might have been set ....       
        $this->_setTimeZone();
        $span       = $this->request->getQuery('span');
        $this->span = $span;  
        
        $this->loadModel('Aps');
        $ap_id          = $this->request->getQuery('ap_id');
        $mac            = $this->request->getQuery('mac');
        $mac_address_id = $this->_findMacAddressId($mac);
        $ap_entry_id    = $this->request->getQuery('ap_entry_id');
        
        //FOR APdesk we add the AP as a start 
        $where_clause   = ['ap_id' =>$ap_id];
        
        $this->graph_item = 'ap';
           
        $q_ap  = $this->{'Aps'}->find()
            ->where(['Aps.id' => $ap_id])
            ->contain(['ApProfiles' => 'ApProfileEntries'])->first();    
        if($q_ap){
        	$this->ap_profile_id = $q_ap->ap_profile_id;      
            $ap_profile_entries_list = [];
            foreach($q_ap->ap_profile->ap_profile_entries as $e){
                if($ap_entry_id == -1){ //Everyone
                    $this->ssid = "** ALL SSIDs **";
                    array_push($ap_profile_entries_list,['ap_profile_entry_id' =>$e->id]);
                }else{
                    if($ap_entry_id == $e->id){ //Only the selected one 
                        $this->ssid = $e->name;
                        array_push($ap_profile_entries_list,['ap_profile_entry_id' =>$e->id]);
                        break;
                    }  
                }     
            }
            array_push($where_clause,['OR' => $ap_profile_entries_list]);
            $this->base_search_no_mac = $this->base_search = $where_clause;
            
            //IS this for a device
            if($mac !=='false'){
                $this->graph_item   = 'ap_device';
                //$this->mac          = $mac;
                $this->mac_address_id   = $mac_address_id;
                array_push($where_clause,['mac_address_id' =>$mac_address_id]);
            }       
        }
        $this->base_search = $where_clause;
        
        //print_r($this->base_search); 
        
        //---- GRAPHS ----- 
        $ft_now = FrozenTime::now();
        $graph_items = []; 
        if($span == 'hour'){
            $graph_items    = $this->_getHourlyGraph($ft_now);
            $ft_start       = $ft_now->subHour(1);
        }
        if($span == 'day'){
            $graph_items = $this->_getDailyGraph($ft_now);
            $ft_start    = $ft_now->subHour(24);
        }
        if($span == 'week'){
            $graph_items = $this->_getWeeklyGraph($ft_now);
            $ft_start    = $ft_now->subHour((24*7));
        }
        
        //---- TOP TEN -----
        $top_ten    = $this->_getTopTen($ft_start,$ft_now);
        
        //---- TOTAL DATA ----
        $totals     = $this->_getTotals($ft_start,$ft_now);
        
        $data               = [];
        $data['graph']      = $graph_items;              
        $data['top_ten']    = $top_ten;
        $data['totals']     = $totals;
        
        if($this->graph_item == 'ap_device'){ 
            $data['device_info'] = $this->_device_info();
        }

        $this->set([
            'data'          => $data,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);    
    }
    
    
    //---- MESHdesk ----
    public function usageForSsid(){
    
        //Try to determine the timezone if it might have been set ....       
        $this->_setTimeZone();
        $span       = $this->request->getQuery('span');
        $this->span = $span;
        $data       = [];
   
        //==============================================
        //==== MESH ENTRIES ====
        $where_clause = [];
        if($this->request->getQuery('type')=='mesh_entries'){ 
        
            $this->graph_item = 'ssid';
            
            //== Mesh Entry IDs==       
            $mesh_id        = $this->request->getQuery('mesh_id');
            $mesh_entry_id  = $this->request->getQuery('mesh_entry_id');
            $this->loadModel('MeshEntries');
            $me_list    = $this->{'MeshEntries'}->find()->where(['MeshEntries.mesh_id' => $mesh_id])->all();
            $mesh_entries_list = [];
            foreach($me_list as $me){
                if($mesh_entry_id == -1){ //Everyone
                    $this->ssid = "** ALL SSIDs **";
                    array_push($mesh_entries_list,['mesh_entry_id' =>$me->id]);
                }else{
                    if($mesh_entry_id == $me->id){ //Only the selected one 
                        $this->ssid = $me->name;
                        array_push($mesh_entries_list,['mesh_entry_id' =>$me->id]);
                        break;
                    }  
                }     
            }               
            array_push($where_clause,['OR' => $mesh_entries_list]);
            $this->base_search_no_mac = $this->base_search = $where_clause; //No MAC for top 10
            
            //== Device?==
            $mac            = $this->request->getQuery('mac');
            $mac_address_id = $this->_findMacAddressId($mac);
            if($mac_address_id){
                $this->graph_item       = 'device';
                $this->mac_address_id   = $mac_address_id;
                array_push($where_clause,['mac_address_id' => $mac_address_id]);
            }            
        }
        
        //==============================================
        //==== MESH NODES ====
        if($this->request->getQuery('type')=='mesh_nodes'){ 
        
            $this->graph_item = 'node';
                   
            $mesh_id        = $this->request->getQuery('mesh_id');
            $node_id        = $this->request->getQuery('node_id');
                       
            $this->loadModel('Nodes');
            $n_list         = $this->{'Nodes'}->find()->where(['Nodes.mesh_id' => $mesh_id])->all();
            $nodes_list     = [];
            foreach($n_list as $n){
                if($node_id == -1){ //Everyone
                    $this->node = "** ALL NODES **";
                    array_push($nodes_list,['node_id' =>$n->id]);
                }else{
                    if($node_id == $n->id){ //Only the selected one 
                        $this->node = $n->name;
                        array_push($nodes_list,['node_id' => $node_id]);
                        break;
                    }  
                }     
            }               
            array_push($where_clause,['OR' => $nodes_list]);
            $this->base_search_no_mac = $this->base_search = $where_clause; //No MAC for top 10
            
            
            //== Device?==
            $mac            = $this->request->getQuery('mac');
            $mac_address_id = $this->_findMacAddressId($mac);
            if($mac_address_id){
                $this->graph_item       = 'device';
                $this->mac_address_id   = $mac_address_id;
                array_push($where_clause,['mac_address_id' => $mac_address_id]);
            }       
        }
        
        
        $this->base_search = $where_clause;        
        //==================================
        
        $data = [];
        
        //-- Once we have our base seach next we can to time related seaches added to the base search
               
        //---- GRAPHS ----- 
        $ft_now         = FrozenTime::now();
        $graph_items    = [];
        
        if($span == 'hour'){
            $graph_items    = $this->_getHourlyGraph($ft_now);
            $ft_start       = $ft_now->subHour(1);
        }
        
        if($span == 'day'){
            $graph_items = $this->_getDailyGraph($ft_now);
            $ft_start    = $ft_now->subHour(24);
        }
        if($span == 'week'){
            $graph_items = $this->_getWeeklyGraph($ft_now);
            $ft_start    = $ft_now->subHour((24*7));
        }

      
        //---- TOP TEN -----
        $top_ten    = $this->_getTopTen($ft_start,$ft_now);
        
        //---- TOTAL DATA ----
        $totals     = $this->_getTotals($ft_start,$ft_now);

        $data               = [];
        $data['graph']      = $graph_items;              
        $data['top_ten']    = $top_ten;
        $data['totals']     = $totals;
        
        //---- DATA PER NODE ---
        if($this->request->getQuery('type')=='mesh_nodes'){
            $data['node_data']  = $this->_getNodeData($ft_start,$ft_now);
        }      
        
        if($this->graph_item == 'device'){  
            $data['device_info'] = $this->_device_info();
        }
        
           
        $this->set([
            'data'          => $data,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);    
    }
        
    private function _getNodeData($ft_start,$ft_end){
    
        $node_data      = [];
        $table          = 'NodeStations';
        $where          = $this->base_search;     
        $fields         = $this->fields;
        array_push($fields, 'node_id');
        array_push($fields, 'Nodes.name');
        array_push($where, ["$table.modified >=" => $ft_start]);
        array_push($where, ["$table.modified <=" => $ft_end]);
              
        $nodes = $this->{$table}->find()->select($fields)
            ->where($where)
            ->order(['data_total' => 'DESC'])
            ->group(['node_id','Nodes.name'])
            ->contain(['Nodes'])
            ->all();
            
        foreach($nodes as $ns){
            $name = $ns->node->name;
            array_push($node_data, 
                [
                    'id'            => $ns->node_id,
                    'name'          => $name,
                    'node_id'       => $ns->node_id,
                    'data_in'       => $ns->data_in,
                    'data_out'      => $ns->data_out,
                    'data_total'    => $ns->data_total,
                ]
            );
        }
        
        //--- Hourlies (for day and week) ---
        if($this->span !== 'hour'){              
            $where_h    = $this->base_search;
            $tHourlies  = 'NodeStationHourlies';
            array_push($where_h , ["$tHourlies.modified >=" => $ft_start]);
            array_push($where_h , ["$tHourlies.modified <=" => $ft_end]); 
            
            $nodes_h = $this->{$tHourlies}->find()->select($fields)
                ->where($where_h)
                ->order(['data_total' => 'DESC'])
                ->group(['node_id','Nodes.name'])
                ->contain(['Nodes'])
                ->all(); 
            
            foreach($nodes_h as $ns){
                // Loop through the array to find the matching node_id
                $found = false;
                foreach ($node_data as $key => $entry) {
                    if ($entry['node_id'] == $ns->node_id) {
                        // Update data_in, data_out, and data_total
                        $node_data[$key]['data_in']     = $node_data[$key]['data_in']+$ns->data_in;
                        $node_data[$key]['data_out']    = $node_data[$key]['data_out']+$ns->data_out;
                        $node_data[$key]['data_total']  = $node_data[$key]['data_total']+$ns->data_total; 
                        $found = true;                 
                        break; // Exit the loop once the node is found and updated
                    }
                }
                
                //Add it if not found
                if(!$found){
                    $name = $ns->node->name;
                    array_push($node_data, 
                        [
                            'id'            => $ns->node_id,
                            'name'          => $name,
                            'node_id'       => $ns->node_id,
                            'data_in'       => $ns->data_in,
                            'data_out'      => $ns->data_out,
                            'data_total'    => $ns->data_total,
                        ]
                    );                       
                }                    
            }              
        }
        return $node_data;
    }
    
    private function _device_info(){
        $di             = [];      
        $where          = $this->base_search;
        $table_raw      = 'NodeStations'; //By default use this table
        $contain        = ['MeshEntries','Nodes','MacAddresses'];  
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table_raw  = 'ApStations';
            $contain    = ['ApProfileEntries','Aps','MacAddresses']; 
        }
                   
        $station        = $this->{"$table_raw"}->find()->where($where)->order(["$table_raw.modified DESC"])->contain($contain)->first();

        if($station){
            $di = $station;
            $di['last_seen'] = $station->modified->timeAgoInWords();
            $di['vendor']    = $this->MacVendors->vendorFor($station->mac_address->mac);         
            //CURRENT
            $signal     = round($station->signal_now);
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
            $di['signal_bar'] = $signal_bar;
                  
            //AVG
            $signal_avg     = round($station->signal_avg);
            if ($signal_avg < -95) {
                $signal_avg_bar = 0.01;
            }
            if (($signal_avg >= -95)&($signal_avg <= -35)) {
                    $p_val = 95-(abs($signal_avg));
                    $signal_avg_bar = round($p_val/60, 1);
            }
            if ($signal_avg > -35) {
                $signal_avg_bar = 1;
            }
            $di['signal_avg_bar'] = $signal_avg_bar;     
            
        }else{ //Get it from the hourlies table (use signal_avg as signal_now)
        
            if($table_raw == 'NodeStations'){
                $tHourlies = 'NodeStationHourlies';
            }
            if($table_raw == 'ApStations'){
                $tHourlies = 'ApStationHourlies';
            }
            $station_h       = $this->{"$tHourlies"}->find()->where($where)->order(["$tHourlies.modified DESC"])->contain($contain)->first();
            if($station_h){
                $di = $station_h;
                $di['last_seen'] = $station_h->modified->timeAgoInWords();
                $di['vendor']    = $this->MacVendors->vendorFor($station_h->mac_address->mac);                               
                //AVG
                $signal_avg     = round($station_h->signal_avg);
                $station_h->signal_now = $signal_avg;
                if ($signal_avg < -95) {
                    $signal_avg_bar = 0.01;
                }
                if (($signal_avg >= -95)&($signal_avg <= -35)) {
                        $p_val = 95-(abs($signal_avg));
                        $signal_avg_bar = round($p_val/60, 1);
                }
                if ($signal_avg > -35) {
                    $signal_avg_bar = 1;
                }
                $di['signal_avg_bar'] = $signal_avg_bar;     
                $di['signal_bar']     = $signal_avg_bar;            
            }      
        }             
        return $di;
    }
    
    private function _getHourlyGraph($ft_now){
        $items          = [];
        $start          = 0;
        $base_search    = $this->base_search;
        $hour_end       = $ft_now;   
        $slot_start     = $ft_now->subHour(1); 
        $table          = 'NodeStations';
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
        
        while($slot_start < $hour_end){
            $slot_start_h_m = $slot_start->i18nFormat("E\nHH:mm",$this->time_zone);
            $slot_end       = $slot_start->addMinute(10)->subSecond(1);  
            $where          = $base_search;
            array_push($where, ["modified >=" => $slot_start]);
            array_push($where, ["modified <=" => $slot_end]);   
            $slot_start     = $slot_start->addMinute(10); 
            $q_r            = $this->{$table}->find()->select($this->fields)->where($where)->first();

            if($q_r){
                $d_in   = $q_r->data_in;
                $d_out  = $q_r->data_out;
                array_push($items, ['id' => $start, 'time_unit' => $slot_start_h_m, 'data_in' => $d_in, 'data_out' => $d_out,'slot_start_txt' => $slot_start_h_m]);
            }
            $start++;
        }
        return(['items' => $items]);
    }
          
    private function _getDailyGraph($ft_now){
    
        $items          = [];
        $start          = 0;
        $base_search    = $this->base_search;
        $day_end        = $ft_now;//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
        $slot_start     = $ft_now->subHour(24);
        $slot_start     = $slot_start->minute(00); 
        $table          = 'NodeStations';
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
                
        while($slot_start < $day_end){  
            $slot_start_h_m = $slot_start->i18nFormat("E\nHH:mm",$this->time_zone);
            $slot_end       = $slot_start->addHour(1)->subSecond(1);   
            $where          = $base_search;
            array_push($where, ["modified >=" => $slot_start]);
            array_push($where, ["modified <=" => $slot_end]);    
            $slot_start     = $slot_start->addHour(1);
            
            $dataIn         = 0;
            $dataOut        = 0;
            
            //-- Raw---
            $stations  = $this->{$table}->find()->select($this->fields)->where($where)->first();        
            if($stations){
                $dataIn = $dataIn + $stations->data_in;
                $dataOut= $dataOut + $stations->data_out;                          
            }
            
            //--Hourlies--
            if($table == 'NodeStations'){
                $tHourlies = 'NodeStationHourlies';
            }
            if($table == 'ApStations'){
                $tHourlies = 'ApStationHourlies';
            }
            $stations_h  = $this->{$tHourlies}->find()->select($this->fields)->where($where)->first();        
            if($stations_h){
                $dataIn = $dataIn + $stations_h->data_in;
                $dataOut= $dataOut + $stations_h->data_out;                          
            }
                       
            array_push($items, ['id' => $start, 'time_unit' => $slot_start_h_m, 'data_in' => $dataIn, 'data_out' => $dataOut]);
            
            $start++;
        }
        return(['items' => $items]);
    }
    
     private function _getWeeklyGraph($ft_day){

        $items          = [];  
        $count          = 0;
        $base_search    = $this->base_search;       
        $week_end       = $ft_day;         
        $slot_start     = $ft_day->subHour(24*7)->hour(00)->minute(00)->second(00);
        $table          = 'NodeStations';
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
       // print_r($slot_start);
       
        while($slot_start < $week_end){
        
            $where          = $base_search; 
            $slot_start_h_m = $slot_start->i18nFormat("dd E\nHH:mm",$this->time_zone);
            $slot_end       = $slot_start->addDay(1)->subSecond(1); //Our interval is one day 
            array_push($where, ["modified >=" => $slot_start]);
            array_push($where, ["modified <=" => $slot_end]);    
            $slot_start     = $slot_start->addDay(1);                 
            $dataIn         = 0;
            $dataOut        = 0;
            
            //-- Raw---
            $stations  = $this->{$table}->find()->select($this->fields)->where($where)->first();        
            if($stations){
                $dataIn = $dataIn + $stations->data_in;
                $dataOut= $dataOut + $stations->data_out;                          
            }
            
            //--Hourlies--
            if($table == 'NodeStations'){
                $tHourlies = 'NodeStationHourlies';
            }
            if($table == 'ApStations'){
                $tHourlies = 'ApStationHourlies';
            }
            $stations_h  = $this->{$tHourlies}->find()->select($this->fields)->where($where)->first();        
            if($stations_h){
                $dataIn = $dataIn + $stations_h->data_in;
                $dataOut= $dataOut + $stations_h->data_out;                          
            }                       
            array_push($items, ['id' => $count, 'time_unit' => $slot_start_h_m, 'data_in' => $dataIn, 'data_out' => $dataOut]);
            
            $count++;
        }
        return(['items' => $items]);
    }
    
    private function _getTopTen($ft_start,$ft_end){
      
        $top_ten        = [];
        $limit          = 10;
        $where          = $this->base_search_no_mac;
        $where_h        = $this->base_search_no_mac;
        $table          = 'NodeStations'; //By default use this table
        
        $req_q    		= $this->request->getQuery();    
       	$cloud_id 		= $req_q['cloud_id'];
       	$mesh_id        = $this->request->getQuery('mesh_id');
       	$ap_profile_id  = false;
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }

        array_push($where, ["$table.modified >=" => $ft_start]);
        array_push($where, ["$table.modified <=" => $ft_end]);
        
        $fields = [
        'mac_address_id',
        'mac'           => 'MacAddresses.mac',
        'data_in'       => 'sum(tx_bytes)',
        'data_out'      => 'sum(rx_bytes)',
        'data_total'    => 'sum(tx_bytes) + sum(rx_bytes)'      
        ];
              
        $stations = $this->{$table}->find()->select($fields)
            ->where($where)
            ->order(['data_total' => 'DESC'])
            ->group(['mac_address_id', 'MacAddresses.mac'])
            ->contain(['MacAddresses'])
            ->limit($limit)
            ->all();
     
        $stations_combined = [];
       
        //First the raw
        foreach($stations as $station){       
            $stations_combined[$station->mac_address_id] = $station;           
        }
     
        //===Daily and Weekly===
        if($this->span !== 'hour'){
        
            if($table == 'NodeStations'){
                $tHourlies = 'NodeStationHourlies';
            }
            if($table == 'ApStations'){
                $tHourlies = 'ApStationHourlies';
            }
            
            array_push($where_h, ["$tHourlies.modified >=" => $ft_start]);
            array_push($where_h, ["$tHourlies.modified <=" => $ft_end]);
            
            
            $stations_h  = $this->{$tHourlies}->find()->select($fields)
                ->where($where_h)
                ->order(['data_total' => 'DESC'])
                ->group(['mac_address_id','MacAddresses.mac'])
                ->contain(['MacAddresses'])
                ->limit($limit)
                ->all();          
            foreach($stations_h as $station_h){  
                if(isset($stations_combined[$station_h->mac_address_id])){
                    $station_raw            = $stations_combined[$station_h->mac_address_id];
                    $station_h->data_in     = $station_h->data_in + $station_raw->data_in;
                    $station_h->data_out    = $station_h->data_out + $station_raw->data_out;
                    $station_h->data_total  = $station_h->data_total + $station_raw->data_total;                
                }
                $stations_combined[$station_h->mac_address_id] = $station_h;        
            }           
        } 
              
        $id = 1;
        
        foreach ($stations_combined  as $mac_address_id => $tt) {
          
            $mac        = $tt->mac;
            $name       = $mac;
            $alias      = '';
            $alias_name = $this->_find_alias($tt->mac_address_id);
            
            $vendor     = $this->MacVendors->vendorFor($mac);
            
            if($alias_name){
                $name = $alias_name;
                $alias= $alias_name;
            }
           
            $block_flag = false;
            $limit_flag = false;
            $firewall_flag = false;
            $cloud_flag = false;
            $bw_up		= '';
            $bw_down	= '';
            $fw_profile = '';                  
            $macAddresses = $this->{'MacAddresses'}->find()->where(['MacAddresses.id' => $tt->mac_address_id])->first();

            if($macAddresses){                     	
            	$e_ma = $this->{'MacActions'}->find()->where(['MacActions.mac_address_id' => $macAddresses->id,'MacActions.cloud_id' => $cloud_id ])->contain(['FirewallProfiles'])->first();
            	if($e_ma){
            		$cloud_flag = true;
            		if($e_ma->action == 'block'){
            			$block_flag = true;
            			$cloud_flag = true;
            		}
            		if($e_ma->action == 'limit'){
            			$limit_flag = true;
            			$cloud_flag = true;
            			$limit_flag = true;
            			$bw_up_suffix = 'kbps';
            			$bw_up = ($e_ma->bw_up * 8);
            			if($bw_up >= 1000){
            				$bw_up = $bw_up / 1000;
            				$bw_up_suffix = 'mbps';
            			}
            			$bw_up = $bw_up.' '.$bw_up_suffix;
            			$bw_down_suffix = 'kbps';
            			$bw_down = ($e_ma->bw_down * 8);
            			if($bw_down >= 1000){
            				$bw_down = $bw_down / 1000;
            				$bw_down_suffix = 'mbps';
            			}
            			$bw_down = $bw_down.' '.$bw_down_suffix;
            		}
            		if($e_ma->action == 'firewall'){
            			$firewall_flag 	= true;
            			$fw_profile		= $e_ma->firewall_profile->name;
            		}
            	}
            	//If there is an mesh level override
            	if($mesh_id){
		        	$e_ma = $this->{'MacActions'}->find()->where(['MacActions.mac_address_id' => $macAddresses->id,'MacActions.mesh_id' => $mesh_id ])->contain(['FirewallProfiles'])->first();
		        	if($e_ma){
		        		$cloud_flag = false;
		        		if($e_ma->action == 'block'){
		        			$block_flag = true;
		        		}
		        		if($e_ma->action == 'limit'){
		        			$limit_flag = true;
		        			$bw_up_suffix = 'kbps';
		        			$bw_up = ($e_ma->bw_up * 8);
		        			if($bw_up >= 1000){
		        				$bw_up = $bw_up / 1000;
		        				$bw_up_suffix = 'mbps';
		        			}
		        			$bw_up = $bw_up.' '.$bw_up_suffix;
		        			$bw_down_suffix = 'kbps';
		        			$bw_down = ($e_ma->bw_down * 8);
		        			if($bw_down >= 1000){
		        				$bw_down = $bw_down / 1000;
		        				$bw_down_suffix = 'mbps';
		        			}
		        			$bw_down = $bw_down.' '.$bw_down_suffix;
		        		}
		        		if($e_ma->action == 'firewall'){
		        			$firewall_flag 	= true;
		        			$fw_profile		= $e_ma->firewall_profile->name;
		        		}
		        	}
		        }
		        
		        //If there is an AP Profile level override 
		        if($this->ap_profile_id){
		        	$e_ma = $this->{'MacActions'}->find()->where(['MacActions.mac_address_id' => $macAddresses->id,'MacActions.ap_profile_id' => $this->ap_profile_id ])->contain(['FirewallProfiles'])->first();
		        	if($e_ma){
		        		$cloud_flag = false;
		        		if($e_ma->action == 'block'){
		        			$block_flag = true;
		        		}
		        		if($e_ma->action == 'limit'){
		        			$limit_flag = true;
		        			$bw_up_suffix = 'kbps';
		        			$bw_up = ($e_ma->bw_up * 8);
		        			if($bw_up >= 1000){
		        				$bw_up = $bw_up / 1000;
		        				$bw_up_suffix = 'mbps';
		        			}
		        			$bw_up = $bw_up.' '.$bw_up_suffix;
		        			$bw_down_suffix = 'kbps';
		        			$bw_down = ($e_ma->bw_down * 8);
		        			if($bw_down >= 1000){
		        				$bw_down = $bw_down / 1000;
		        				$bw_down_suffix = 'mbps';
		        			}
		        			$bw_down = $bw_down.' '.$bw_down_suffix;
		        		}
		        		if($e_ma->action == 'firewall'){
			    			$firewall_flag 	= true;
			    			$fw_profile		= $e_ma->firewall_profile->name;
			    		}
		        	}		        			        	
		        }                
            }
                      
            array_push($top_ten, 
                [
                    'id'            => $id,
                    'mac'           => $mac,
                    'mac_address_id'=> $tt->mac_address_id,
                    'vendor'        => $vendor,
                    'alias'         => $alias,
                    'name'          => $name,
                    'data_in'       => $tt->data_in,
                    'data_out'      => $tt->data_out,
                    'data_total'    => $tt->data_total,
                    'block_flag'	=> $block_flag,
                   	'cloud_flag'	=> $cloud_flag,
                   	'limit_flag'	=> $limit_flag,
                    'bw_up'			=> $bw_up,
                    'bw_down'		=> $bw_down,
                    'firewall_flag'	=> $firewall_flag,
		            'fw_profile'	=> $fw_profile,
                ]
            );

            $id++;
        } 
        return $top_ten;
    }
    
    private function _getTotals($ft_start,$ft_end){
    
        $table  = 'NodeStations';
        $where  = $this->base_search;
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
                  
        $totals = [];
        $totals['data_in']      = 0;
        $totals['data_out']     = 0;
        $totals['data_total']   = 0;
      
        array_push($where, ["modified >=" => $ft_start]);
        array_push($where, ["modified <=" => $ft_end]);
        
        $dataIn         = 0;
        $dataOut        = 0;
        $dataTotal      = 0;
        
        //-- Raw---
        $stations  = $this->{$table}->find()->select($this->fields)->where($where)->first();        
        if($stations){
            $dataIn     = $dataIn + $stations->data_in;
            $dataOut    = $dataOut + $stations->data_out;
            $dataTotal  = $dataTotal + $stations->data_total;                       
        }
        
        if($this->span !== 'hour'){ 
            //--Hourlies--
            if($table == 'NodeStations'){
                $tHourlies = 'NodeStationHourlies';
            }
            if($table == 'ApStations'){
                $tHourlies = 'ApStationHourlies';
            }
            $stations_h  = $this->{$tHourlies}->find()->select($this->fields)->where($where)->first();        
            if($stations_h){
                $dataIn     = $dataIn + $stations_h->data_in;
                $dataOut    = $dataOut + $stations_h->data_out;
                $dataTotal  = $dataTotal + $stations_h->data_total;                           
            }
        }                       
        
        $totals['data_in']      = $dataIn;
        $totals['data_out']     = $dataOut;
        $totals['data_total']   = $dataTotal;
        
        $totals['graph_item']   = $this->graph_item;
        $totals['ssid']         = $this->ssid;
        $totals['node']         = $this->node;
        $totals['mac']          = $this->mac;
        $alias                  = $this->_find_alias($this->mac);
        if($alias){
            $totals['mac']     = $alias;
        }        
        return $totals;   
    }
     
    private function _find_alias($mac_address_id){
    
    	$req_q    = $this->request->getQuery();    
       	$cloud_id = $req_q['cloud_id'];
      
        $alias = false;
        $qr = $this->{'MacAliases'}->find()->where(['MacAliases.mac_address_id' => $mac_address_id,'MacAliases.cloud_id'=> $cloud_id])->first();
        if($qr){
        	$alias = $qr->alias;
        } 
        return $alias;
    }
    
    private function _findMacAddressId($mac){ 
        $macAddress = $this->MacAddresses->find()->where(['MacAddresses.mac' => $mac])->first();
        if($macAddress){
            return $macAddress->id;
        }    
    }
       
    private function _setTimezone(){ 
        //New way of doing things by including the timezone_id
        if($this->request->getQuery('timezone_id') != null){
            $tz_id = $this->request->getQuery('timezone_id');
            $ent = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
            if($ent){
                $this->time_zone = $ent->name;
            }
        }
    }
    
    private function _addActionsApProfile($ap_profile_id){   
    	$ap_list = $this->{'Aps'}->find()->where(['Aps.ap_profile_id' => $ap_profile_id])->all();
    	foreach($ap_list as $ap){
    	
    		//-- Simple Firewall --
    		$aa = $this->{'ApActions'}->find()->where([
    			'ApActions.action' 	=> 'execute',
    			'ApActions.ap_id'   => $ap->id,
    			'ApActions.command'	=> $this->fw_command,
    			'ApActions.status'	=> 'awaiting'
    		])->first(); 
    		if(!$aa){
    			$aa = $this->{'ApActions'}->newEntity(['ap_id' => $ap->id,'command' => $this->fw_command]);
    			$this->{'ApActions'}->save($aa);   		
    		}
    		
    		//-- Advanced Firewall --
    		$aa = $this->{'ApActions'}->find()->where([
    			'ApActions.action' 	=> 'execute',
    			'ApActions.ap_id'   => $ap->id,
    			'ApActions.command'	=> $this->adv_fw_command,
    			'ApActions.status'	=> 'awaiting'
    		])->first(); 
    		if(!$aa){
    			$aa = $this->{'ApActions'}->newEntity(['ap_id' => $ap->id,'command' => $this->adv_fw_command]);
    			$this->{'ApActions'}->save($aa);   		
    		}   		
    		    	
    	}
    }
    
    private function _addActionsMesh($mesh_id){       
    	$node_list = $this->{'Nodes'}->find()->where(['Nodes.mesh_id' => $mesh_id])->all();
    	foreach($node_list as $node){
    	
    		//-- Simple Firewall --
    		$na = $this->{'NodeActions'}->find()->where([
    			'NodeActions.action' 	=> 'execute',
    			'NodeActions.node_id' 	=> $node->id,
    			'NodeActions.command'	=> $this->fw_command,
    			'NodeActions.status'	=> 'awaiting'
    		])->first(); 
    		if(!$na){
    			$na = $this->{'NodeActions'}->newEntity(['node_id' => $node->id,'command' => $this->fw_command]);
    			$this->{'NodeActions'}->save($na);   		
    		}
    		
    		//-- Advanced Firewall --
    		$na = $this->{'NodeActions'}->find()->where([
    			'NodeActions.action' 	=> 'execute',
    			'NodeActions.node_id' 	=> $node->id,
    			'NodeActions.command'	=> $this->adv_fw_command,
    			'NodeActions.status'	=> 'awaiting'
    		])->first(); 
    		if(!$na){
    			$na = $this->{'NodeActions'}->newEntity(['node_id' => $node->id,'command' => $this->adv_fw_command]);
    			$this->{'NodeActions'}->save($na);   		
    		}
    		  	
    	}   
    }
    
    private function _addActionsCloud($cloud_id){
    
    	//Get a list of Meshes for this cloud
    	$meshes = $this->{'Meshes'}->find()->where(['Meshes.cloud_id' => $cloud_id])->all();
    	foreach($meshes as $mesh){
    		$this->_addActionsMesh($mesh->id);
    	}
    	       	
    	//Get a list of ApProfiles for this cloud
    	$ap_profiles = $this->{'ApProfiles'}->find()->where(['ApProfiles.cloud_id' => $cloud_id])->all();
    	foreach($ap_profiles as $ap_profile){
    		$this->_addActionsApProfile($ap_profile->id);
    	}   
    }
    
}
