<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class MeshTopdataController extends AppController{
  
    public $base         = "Access Providers/Controllers/MeshTopdata/";   
    protected $owner_tree   = array();
    protected $main_model   = 'Meshes';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Meshes'); 
        $this->loadModel('Users');    
        $this->loadComponent('Aa');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'                     => 'Meshes',
            'no_available_to_siblings'  => false,
            'sort_by'                   => 'Meshes.name'
        ]); 
             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');    
    }
    
    public function index(){
    
        //__ Authentication + Authorization __      
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        
        $timespan = 'daily'; //Default = hourly but we double it to give comparitive stats
                
        $query = $this->{$this->main_model}->find();
         
        $this->CommonQuery->build_common_query($query,$user,['Users','Nodes'=> ['NodeStations' =>
            function($q) {
          
                $timespan = 'hourly'; //
                $seconds  = (60*60)*2; //default is two hours
                if(isset($this->request->query['timespan'])){
                    $timespan = $this->request->query['timespan'];
                }
                
                if($timespan == 'daily'){
                    $seconds = (60*60)*24; //Two days
                }
                if($timespan == 'weekly'){
                    $seconds = (60*60)*24*14; //Two weeks
                }
                if($timespan == 'monthly'){
                    $seconds = (60*60)*24*60; //60 Days
                }

                         
                $hour   = (60*60);
                $day    = $hour*24;
                $modified = date("Y-m-d H:i:s", time()-$seconds);
          
                    return $q
                        ->select([
                            'NodeStations.vendor', 
                            'NodeStations.mac',
                            'NodeStations.node_id',
                            'NodeStations.modified',
                            'NodeStations.tx_bytes',
                            'NodeStations.rx_bytes'
                        ])
                        ->where(['NodeStations.modified >=' => $modified]);
            }
        ]]);
 
        $limit  = 50;
        $page   = 1;
        $offset = 0;
        if(isset($this->request->query['limit'])){
            $limit  = $this->request->query['limit'];
            $page   = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = array();
        
        $mesh_no_nodes  = 0;
        $mesh_down      = 0;
        $mesh_up        = 0;
        
        $total_nodes    = 0;
        $t_nodes_up     = 0;
        $t_nodes_down   = 0;
        
        //client totals
        $client_count_now       = 0;
        $cliet_count_before     = 0;
        $data_tx_now            = 0;
        $data_tx_before         = 0;
        $data_rx_now            = 0;
        $data_rx_before         = 0;
        
        $ns_temp_current        = [];
        $ns_temp_previous       = [];
        
        $data_usage                 = [];
        $data_usage['tx_current']   = 0;
        $data_usage['rx_current']   = 0;
        $data_usage['tx_previous']  = 0;
        $data_usage['rx_previous']  = 0;
        
        $now                    = Time::now();
        $ts_now                 = $now->toUnixString();
        
        $timespan = 'hourly'; //
        $seconds  = (60*60)*2; //default is two hours
        if(isset($this->request->query['timespan'])){
            $timespan = $this->request->query['timespan'];
        }
        
        if($timespan == 'daily'){
            $seconds = (60*60)*24; //Two days
        }
        if($timespan == 'weekly'){
            $seconds = (60*60)*24*14; //Two weeks
        }
        
        if($timespan == 'monthly'){
            $seconds = (60*60)*24*60; //60 Days
        }

        foreach($q_r as $i){
        
            //print_r($i->nodes);
              
            $owner_id   = $i->user_id;
            if(!array_key_exists($owner_id,$this->owner_tree)){
                $owner_tree     = $this->Users->find_parents($owner_id);
            }else{
                $owner_tree = $this->owner_tree[$owner_id];
            }
             
            $row        = array();
            $fields    = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
            } 
            
            $mesh_id		= $i->id;

			//Get the 'dead_after' value
			$dead_after = $this->_get_dead_after($mesh_id);
			$now		= time();

			$node_count 	= 0;
			$nodes_up		= 0;
			$nodes_down		= 0;
			
			$ns_mesh_current = [];
		    $data_mesh = 0;
		    $data_mesh_tx = 0;
		    $data_mesh_rx = 0;
			
			foreach($i->nodes as $node){ 
			
			    foreach($node->node_stations as $ns){
			        $mod_timestamp      = $ns->modified->i18nFormat(Time::UNIX_TIMESTAMP_FORMAT);
			        $create_timestamp   = $ns->modified->i18nFormat(Time::UNIX_TIMESTAMP_FORMAT);
			        if($mod_timestamp > ($ts_now - ($seconds /2))){ 
			            $data_usage['tx_current']   = $data_usage['tx_current'] + $ns->tx_bytes;
                        $data_usage['rx_current']   = $data_usage['rx_current'] + $ns->rx_bytes;
			            $ns_temp_current[$ns->mac] = 1;
			            $ns_mesh_current[$ns->mac] = 1;
			            $data_mesh = $data_mesh + $ns->tx_bytes + $ns->rx_bytes;
			            $data_mesh_tx = $data_mesh_tx + $ns->tx_bytes;
			            $data_mesh_rx = $data_mesh_rx + $ns->rx_bytes;;
			        }
			        
			        if(($create_timestamp > ($ts_now - $seconds))||($mod_timestamp > ($ts_now - $seconds))){
			            if(($create_timestamp < ($ts_now - ($seconds /2)))||($mod_timestamp > ($ts_now - ($seconds /2)))){
			                $ns_temp_previous[$ns->mac] = 1;
			                $data_usage['tx_previous'] = $data_usage['tx_previous'] + $ns->tx_bytes;
			                $data_usage['rx_previous'] = $data_usage['rx_previous'] + $ns->rx_bytes;
			            }
			        }
			    }
			
			    $total_nodes ++;
				$l_contact  = $node->last_contact;
				//===Determine when last did we saw this node (never / up / down) ====
				$last_timestamp = strtotime($l_contact);
	            if($last_timestamp+$dead_after <= $now){
	                $nodes_down++;
	                $t_nodes_down++;
	            }else{
					$nodes_up++;
					$t_nodes_up++;  
	            }
				$node_count++;
			} 
			
			if($node_count == 0){
			    $mesh_no_nodes = $mesh_no_nodes + 1;
			}
			
			if(($node_count > 0)&&($nodes_up == $node_count)){
			    $mesh_up = $mesh_up + 1;
			}
			
			if(($node_count > 0)&&($nodes_down > 0)){
			    $mesh_down = $mesh_down + 1;
			}
			
			$row['users']       = count(array_keys($ns_mesh_current));
			$row['tot_bytes']        = $data_mesh; // $this->formatted_bytes($data_mesh);
			$row['tot_tx_bytes']        = $data_mesh_tx; // formatted_bytes($data_mesh_tx);
			$row['tot_rx_bytes']        = $data_mesh_rx; // formatted_bytes($data_mesh_rx);
			$row['node_count']  = $node_count;
			$row['nodes_up']    = $nodes_up;
			$row['nodes_down']  = $nodes_down;
			
            array_push($items,$row);      
        }
        
        
        $network_info = [];
        if($mesh_no_nodes > 0){
            array_push($network_info,[ 'type' => 'info', 'detail' => "$mesh_no_nodes without any nodes"]);
        }
        
        if($mesh_down > 0){
            array_push($network_info,[  'type' => 'warning', 'detail' => "$mesh_down with offline nodes"]);
        }
        
        if($mesh_up > 0){
            array_push($network_info,[ 'type' => 'check', 'detail' => "$mesh_up with all online"]);
        }
        
        $client_count_now       = count(array_keys($ns_temp_current));
        $client_count_previous  = count(array_keys($ns_temp_previous));
        
         //Data
        $data_slope                 = "flat";
        $data_now                   = $data_usage['tx_current']+$data_usage['rx_current'];
        $data_previous              = $data_usage['tx_previous']+$data_usage['rx_previous'];   
        
        $data_usage['current']      = $this->formatted_bytes($data_usage['tx_current']+$data_usage['rx_current']);
        $data_usage['tx_current']   = $this->formatted_bytes($data_usage['tx_current']);
        $data_usage['rx_current']   = $this->formatted_bytes($data_usage['rx_current']);
        $data_usage['previous']     = $this->formatted_bytes($data_usage['tx_previous']+$data_usage['rx_previous']);
        $data_usage['tx_previous']  = $this->formatted_bytes($data_usage['tx_previous']);
        $data_usage['rx_previous']  = $this->formatted_bytes($data_usage['rx_previous']); 
        
        
        //Clients    
        $clients_slope              = "flat";
        if($client_count_previous == $client_count_now){
            $clientsDelta = "0% increase";
        }else{ 
            if($client_count_now < $client_count_previous){
                //Decrease - How much
                if($client_count_now !== 0){
                    $clientsDelta = 100-(ceil(($client_count_now  / $client_count_previous ) * 100))."%";
                }else{
                    $clientsDelta = $client_count_previous;
                }
                $clientsDelta = $clientsDelta." decrease";
                $clients_slope = "down";
            }
            
            if($client_count_now > $client_count_previous){
                //Increase - How much
                if($client_count_previous !== 0){
                    $clientsDelta = ceil(($client_count_now / $client_count_previous  ) * 100)."%";
                }else{
                    $clientsDelta = $client_count_now;
                }
                $clientsDelta = $clientsDelta." increase";
                $clients_slope = "up";
            }
        }
        
        
        if($data_previous == $data_now){
            $dataDelta = "0% increase";
        }else{ 
            if($data_now < $data_previous){
                //Decrease - How much
                if($data_now !== 0){
                    $dataDelta = 100-(ceil(($data_now  / $data_previous ) * 100))."%";
                }else{
                    $dataDelta = $this->formatted_bytes($data_previous);
                }
                $dataDelta = $dataDelta." decrease";
                $data_slope = "down";
            }
            
            if($data_now > $data_previous){
                //Increase - How much
                if($data_previous !== 0){
                    $dataDelta = ceil(($data_now / $data_previous  ) * 100)."%";
                }else{
                    $dataDelta = $this->formatted_bytes($data_now);
                }
                $dataDelta = $dataDelta." increase";
                $data_slope = "up";
            }
        }
        
        $data_usage['dataDelta'] = $dataDelta;
        $data_usage['dataSlope'] = $data_slope;
        
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            'metaData'      => [
                'totalUsers' => 200,
                'totalData'  => '10Gb',
                'networkCount'  => $total,
                'networkInfo'   => $network_info,
                'nodesCount'    => $total_nodes,
                'nodesUp'       => $t_nodes_up,
                'nodesDown'     => $t_nodes_down,
                'clientsNow'    => $client_count_now,
                'clientsPrevious' => $client_count_previous,
                'dataUsage'    => $data_usage,
                'clienstDelta'  => $clientsDelta,
                'clientsSlope'  => $clients_slope
                
            ],
            '_serialize'    => array('items','success','totalCount','metaData')
        ));
    }
    
    private function formatted_bytes($bytes){

        $ret_val=$bytes;
        if($bytes >= 1024){
            $ret_val = round($bytes/1024,2)."K";
        }
        if($bytes >= (1024*1024)){
            $ret_val = round($bytes/1024/1024,2)."M";
        }
         if($bytes >= (1024*1024*1204)){
            $ret_val = round($bytes/1024/1024/1024,2)."G";
        }
        if($bytes >= (1024*1024*1204*1204)){
            $ret_val = round($bytes/1024/1024/1024,2)."T";
        }
         if($bytes >= (1024*1024*1204*1204*1204)){
            $ret_val = round($bytes/1024/1024/1024,2)."P";
        }
        return $ret_val;
    }
    
    
    private function _get_dead_after($mesh_id){
		Configure::load('MESHdesk');
		$data 		= Configure::read('common_node_settings'); //Read the defaults
		$dead_after	= $data['heartbeat_dead_after'];
		$n_s = $this->Meshes->NodeSettings->find()->where(['NodeSettings.mesh_id' => $mesh_id])->first(); 
		
        if($n_s){
            $dead_after = $n_s->heartbeat_dead_after;
        }
		return $dead_after;
	}
    
}
