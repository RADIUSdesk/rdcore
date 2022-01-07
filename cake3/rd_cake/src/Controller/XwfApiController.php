<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 21/11/2020
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;

use Cake\ORM\Query;
use Cake\Database\Expression\QueryExpression;

use GuzzleHttp\Client;

class XwfApiController extends AppController {

    protected $main_model   = 'TrafficClasses';
    protected $exit_array   = [];
    public function initialize(){
        parent::initialize();
        $this->loadModel('TrafficClasses');
        $this->loadComponent('Aa');    
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
        
        $this->loadModel('MeshExitCaptivePortals');
        $this->loadModel('MeshExits');
        $this->loadModel('Meshes');
        $this->loadModel('Nodes');
        $this->loadModel('NodeActions');
        $this->loadModel('Clouds');
        $this->loadModel('Sites');
        $this->loadModel('Networks');
        $this->loadModel('Users');
    }
     
    public function adhocCommand(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		// Load Config
        Configure::load('MESHdesk');
        $cfg    = Configure::read('mqtt_settings');
        $client = new Client();
		
		$post_data = $this->request->data();
		
		if(array_key_exists('id',$this->request->data)){
		    $id     = $this->request->data('id');
		    $ent    = $this->{'Nodes'}->find()->where(['Nodes.id' =>$id])->contain(['Meshes'])->first();
		    if($ent){
		        //Q it for execution
		        //==PINGELING==
		        if($post_data['command']['name']== 'ping'){
		        
		            $host   = $post_data['command']['meta_data'];
		            $action = 'execute_and_reply';
		            $wait   = $post_data['command']['wait'];
		            $cmd    = "ping -c 4 $host";
		            
		            $na_data = [
		                'action'    => $action,
		                'command'   => "ping -c 4 $host",
		                'node_id'   => $id 
		            ];
		            
		            //See if there is not already such an unanswered command
		            $ent_check = $this->{'NodeActions'}->find()->where(['command' => $cmd, 'node_id' => $id,'status' => 'awaiting'])->first();
		            if($ent_check){
		                $this->set([
                            'error'         => [
                                'message'   => "Command $cmd ALREADY queued ID is $ent_check->id",
                                'meta_data' => [
                                    'command'   => $cmd,
                                    'action_id' => $ent_check->id,
                                    'id'        => $id,
                                    'created'           => $ent_check->{"created"},
                                    'modified'          => $ent_check->{"modified"},
                                    'created_in_words'  => $this->TimeCalculations->time_elapsed_string($ent_check->{"created"}),
                                    'modified_in_words' => $this->TimeCalculations->time_elapsed_string($ent_check->{"modified"}),
                                ]
                            ],
                            'success'       => false,
                            '_serialize'    => ['error','success']
                        ]);
                        return;		            
		            }
		            		            
		            $e_node_action   = $this->{'NodeActions'}->newEntity($na_data);
		            if ($this->{'NodeActions'}->save($e_node_action)) {
		            
		                if ($cfg['enable_realtime']){
                            //Talk to MQTT Broker
                             $payload   = [
                                 'node_id'  => $ent->id,
                                 'mac'      => strtoupper($ent->mac),
                                 'mesh_id'  => strtoupper(str_replace('_','-',$ent->mesh->ssid)),
                                 'cmd_id'   => $e_node_action->id,
                                 'cmd'      => $na_data['command'],
                                 'action'   => $na_data['action'],
                             ];

                             if($this->_check_server($client, $cfg['api_gateway_url'], 5)){
                                 try {
                                     $client->request('POST', $cfg['api_gateway_url'] . '/mesh/node/command', ['json' => ['message' => $payload]]);
                                 } catch (\Exception $e) {
                                     // Do Nothing
                                 }
                             }        
                         }
                         
                        //==Do the sleep loop
                        $timeout = true;
                        $reply   = '';
                        
                        while($wait > 0){
                            sleep(1);
                            $wait = $wait -1;
                            $latest_node_action = $this->{'NodeActions'}->find()->where(['id' => $e_node_action->id])->first();
                            if($latest_node_action){
                                if($latest_node_action->status !== 'replied'){
                                    $wait = $wait -1;
                                }else{
                                    $timeout = false;
                                    $reply   = $latest_node_action->reply;
                                    break;
                                }    
                            }
                         }
                         
                        if($timeout == true){
                            $this->set([
                                'error'         => [
                                    'message'   => "Timeout waiting for reply",
                                    'meta_data' => [
                                        'command'   => $cmd,
                                        'wait'      => $post_data['command']['wait'],
                                        'action_id' => $e_node_action->id,
                                        'id'        => $id,
                                        'created'   => $e_node_action->{"created"},
                                        'modified'  => $e_node_action->{"modified"},
                                        'created_in_words'  => $this->TimeCalculations->time_elapsed_string($e_node_action->{"created"}),
                                        'modified_in_words' => $this->TimeCalculations->time_elapsed_string($e_node_action->{"modified"}),
                                    ]
                                ],
                                'success'       => false,
                                '_serialize'    => ['error','success']
                            ]);
                            return;	  
                        }else{
                            $this->set([
                                'data' => [
                                    'command'   => $cmd,
                                    'wait'      => $post_data['command']['wait'],
                                    'reply'     => $latest_node_action->reply,
                                    'action_id' => $e_node_action->id,
                                    'id'        => $id,
                                    'created'   => $e_node_action->{"created"},
                                    'modified'  => $e_node_action->{"modified"},
                                    'created_in_words' => $this->TimeCalculations->time_elapsed_string($e_node_action->{"created"}),
                                    'modified_in_words' => $this->TimeCalculations->time_elapsed_string($e_node_action->{"modified"}),
                                ],
                                'success'       => true,
                                '_serialize'    => ['data','success']
                            ]);
                            return;                        
                        }                 
                               
		            } 
		        }
		        //==END PINGELING==       
		    }	
		}
        
        $data = $post_data;
        
        if($timeout == true){
            $this->set(array(
                'data'          => $data,
                'success'       => false,
                '_serialize'    => array('data','success')
            ));        
        }else{      
            $this->set(array(
                'data'          => $data,
                'success'       => true,
                '_serialize'    => array('data','success')
            ));
        }         
    }
         
    public function devicesList(){ 
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        //filter=[{"operator"%3A"like"%2C"value"%3A"25"%2C"property"%3A"mac"}%2C{"operator"%3A"like"%2C"value"%3A"oad"%2C"property"%3A"mesh"}]
            
        //First get a list of captive portals with the xwf_enable = true;
        $ents_cp        = $this->{'MeshExitCaptivePortals'}->find()->where(['MeshExitCaptivePortals.xwf_enable' =>true])->all();
        $mesh_exit_list = [];
           
        foreach($ents_cp as $e){
            if(!in_array($e->mesh_exit_id,$mesh_exit_list)){
                array_push($mesh_exit_list,$e->mesh_exit_id);
            }
        }
        
        //Now get a list of mesh exists that these captive portals belong to  
        $query = $this->{'MeshExits'}->find();
        $ents_exits = $query->where(function (QueryExpression $exp, Query $q)use($mesh_exit_list) {
                return $exp->in('id',$mesh_exit_list);
            })->all();
               
        //Now build a list of meshes that these exit points belong to
        $mesh_id_list = [];
        
        foreach($ents_exits as $e_exit){
            if(!in_array($e_exit->mesh_id,$mesh_id_list)){
                array_push($mesh_id_list,$e_exit->mesh_id);
            }
        }
        
        //For root we do not have to have a filter but for access providers we have to add a filter on the woner of the meshes
        $query = $this->{'Nodes'}->find()->contain(['Meshes'=> ['Networks' => ['Sites'=>'Clouds']],'NodeSystems']);
        $query->where(function (QueryExpression $exp, Query $q)use($mesh_id_list) {
                return $exp->in('Meshes.id',$mesh_id_list);
            });
            
        $ap_filter = $this->_ap_list_for_available_to_siblings($user);
               
        if($ap_filter){
            $query->where($ap_filter); //Add an extra query to it
        }
        
        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
        if (isset($this->request->query['limit'])) {
            $limit = $this->request->query['limit'];
            $page = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);
        
        $total      = $query->count();
        $ents_nodes = $query->all();
        
        $items = [];
           
        foreach($ents_nodes as $e_node){ 
            $item = [];
            $item['network_name']   = $e_node->mesh->network->name; 
            $item['network_id']     = $e_node->mesh->network->id;
            $item['network_lat']    = $e_node->mesh->network->lat;
            $item['network_lng']    = $e_node->mesh->network->lng;
            
            $item['site_name']      = $e_node->mesh->network->site->name; 
            $item['site_id']        = $e_node->mesh->network->site->id;
            $item['site_lat']       = $e_node->mesh->network->site->lat;
            $item['site_lng']       = $e_node->mesh->network->site->lng;
               
            $item['cloud_name']     = $e_node->mesh->network->site->cloud->name; 
            $item['cloud_id']       = $e_node->mesh->network->site->cloud->id;
            $item['cloud_lat']      = $e_node->mesh->network->site->cloud->lat;
            $item['cloud_lng']      = $e_node->mesh->network->site->cloud->lng;
            
            $item['id']             = $e_node->id;
            $item['mac']            = $e_node->mac;
            $item['name']           = $e_node->name;  
            $item['lat']            = $e_node->lat; 
            $item['lng']            = $e_node->lon;
            $item['model_name']     = $e_node->hardware;
            $item['fw_version']     = 'unknown';
            
            foreach($e_node->node_systems as $e_ns){
                if($e_ns->name == 'DISTRIB_BUILD'){     
                    $item['fw_version'] =  $e_ns->value; 
                }       
            }    
            array_push($items, $item);
        }
                  
        $this->set(array(
            'items'         => $items,
            'success'       => true,
             'totalCount'   => $total,
            '_serialize'    => array('items','success','totalCount')
        ));       
    }
    
    private function _ap_list_for_available_to_siblings($user){

        $model          = 'Meshes';
       
        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $where_clause   = []; 
            $tree_array     = [];
            $user_id        = $user['id'];

            //**AP and upward in the tree**
            $this->parents = $this->{'Users'}->find('path',['for' => $user_id]);
 
            //So we loop this results asking for the parent nodes who have available_to_siblings = true
            foreach($this->parents as $i){
                $i_id = $i->id;
                if($i_id != $user_id){ //upstream
                    array_push($tree_array,array($model.'.'.'user_id' => $i_id,$model.'.'.'available_to_siblings' => true));
                }else{
                    array_push($tree_array,array($model.'.'.'user_id' => $i_id)); //That is the access provider self
                }
            }
                 
            //** ALL the AP's children
            $children = $this->{'Users'}->find('children', ['for' => $user_id]);
            if($children){   //Only if the AP has any children...
                foreach($children as $i){
                    $id = $i->id;
                    array_push($tree_array,array($model.'.'.'user_id' => $id));
                }       
            }      
            //Add it as an OR clause
            if(count($tree_array) > 0){
                array_push($where_clause,array('OR' => $tree_array));
            }
            return $where_clause;  
        }
        return false;
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
