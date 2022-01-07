<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 12/01/2018
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use GuzzleHttp\Client;

class NodeActionsController extends AppController {

    public $base = "Access Providers/Controllers/NodeActions/";
    protected $owner_tree = array();
    protected $main_model = 'NodeActions';

    public function initialize(){
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('ApActions');
        $this->loadModel('PredefinedCommands');
        $this->loadModel('Users');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'     => $this->main_model,
            'sort_by'   => $this->main_model.'.created'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');  
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }

    public function index(){
        //__ Authentication + Authorization __
        
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();
        
        if(isset($this->request->query['node_id'])){
            $query->where(["NodeActions.node_id" => $this->request->query['node_id']]);
        }

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($this->request->query['limit'])) {
            $limit = $this->request->query['limit'];
            $page = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();
        $items = array();

        foreach ($q_r as $i) {
            $row        = array();
            $fields     = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                } 
            }
            $row['reply_html']= nl2br($row['reply']);  
            array_push($items, $row);
        }

        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items', 'success', 'totalCount')
        ));
    }

    public function add(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        // Load Config
        Configure::load('MESHdesk');
        $cfg = Configure::read('mqtt_settings');
        $client = new Client();

        foreach(array_keys($this->request->data) as $key){
            if(preg_match('/^\d+/',$key)){
            
                $formData               = $this->request->getData();
                //Substitute the predefined_command 
                if($formData['action'] == 'predefined_command'){
                    $entPre = $this->{'PredefinedCommands'}->find()->where(['PredefinedCommands.id' => $formData['predefined_command_id']])->first();
                    if($entPre){
                        $formData['action']     = $entPre->action;
                        $formData['command']    = $entPre->command;
                    }  
                }
                $formData['node_id']    = $this->request->data[$key];
                $entity                 = $this->{$this->main_model}->newEntity($formData);
                 if ($this->{$this->main_model}->save($entity)) {

                     if ($cfg['enable_realtime']){
                        //Talk to MQTT Broker
                         $data = $this->_get_node_mac_mesh_id($formData['node_id']);
                         $payload = [
                             'node_id'  => $formData['node_id'],
                             'mac'      => strtoupper($data['mac']),
                             'mesh_id'  => strtoupper($data['ssid']),
                             'cmd_id'   => $entity->id,
                             'cmd'      => $formData['command'],
                             'action'   => $formData['action'],
                         ];

                         if($this->_check_server($client, $cfg['api_gateway_url'], 5)){
                             try {
                                 $client->request('POST', $cfg['api_gateway_url'] . '/mesh/node/command', ['json' => ['message' => $payload]]);
                             } catch (\Exception $e) {
                                 // Do Nothing
                             }
                         }
                     }

                     $this->set(array(
                         'success' => true,
                         '_serialize' => array('success')
                     ));
                } else {
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($entity,$message);
                }  
            }
        }

		if($this->request->data['node_id'] != ''){
		
		    $formData               = $this->request->getData();
		    //Substitute the predefined_command 
		    if($formData['action'] == 'predefined_command'){
                $entPre = $this->{'PredefinedCommands'}->find()->where(['PredefinedCommands.id' => $formData['predefined_command_id']])->first();
                if($entPre){
                    $formData['action']     = $entPre->action;
                    $formData['command']    = $entPre->command;
                }  
            }
	    				
			$entity = $this->{$this->main_model}->newEntity($formData);
			if ($this->{$this->main_model}->save($entity)) {

                if ($cfg['enable_realtime']){
                    // Talk to MQTT Broker
                    $data = $this->_get_node_mac_mesh_id($formData['node_id']);
                    $payload = [
                        'node_id'   => $formData['node_id'],
                        'mac'       => strtoupper($data['mac']),
                        'mesh_id'   => strtoupper($data['ssid']),
                        'cmd_id'    => $entity->id,
                        'cmd'       => $formData['command'],
                        'action'    => $formData['action'],
                    ];

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
    }

    public function delete() {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $fail_flag = false;

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];       
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);       
            $this->{$this->main_model}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);      
                $this->{$this->main_model}->delete($entity);   
            }
        }

        if($fail_flag == true){
            $this->set(array(
                'success'   => false,
                'message'   => array('message' => __('Could not delete some items')),
                '_serialize' => array('success','message')
            ));
        }else{
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }
	}

    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user,false, 'add_and_delete'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
    //== THIS IS MY DANS HARE :-) ===
    //With this URL we now cover actions for AP Profiels and Meshes depending on the value of 'mode' in the POST
    public function getActionsFor(){

        if(!(array_key_exists('mac',$this->request->data))){
		        $this->set(array(
		        'message'		=> 'Required field missing in POST',
                'success' => false,
                '_serialize' => array('success','message')
            ));
	        return;
        }

        $mac    = $this->request->data['mac'];
        $mode   = 'mesh';
        $model  = 'NodeActions';
        
        if($this->request->getData('mode')){
            $mode = $this->request->getData('mode');
        }
        
        if($mode == 'mesh'){
            $q_r = $entity = $this->{$this->main_model}->find()
                ->where(['Nodes.mac' => $mac,'NodeActions.status' => 'awaiting'])
                ->contain('Nodes')
                ->all();
        }
        
        if($mode == 'ap'){
            $q_r = $entity = $this->{'ApActions'}->find()
                ->where(['Aps.mac' => $mac,'ApActions.status' => 'awaiting'])
                ->contain('Aps')
                ->all();
            $model = 'ApActions';
        }
            
        $items = [];
        
        foreach($q_r as $i){
	        $id		= $i->id;
	        $c 		= $i->command;
	        $action = $i->action;
	        array_push($items,['id' => $id,'command' => $c,'action' => $action]);	
        }

        //Run through this list and mark them as 'fetched' (Depending on 'mode' will either be NodeActions or ApActions)
        foreach($items as $i){
            $id = $i['id'];
            $entity  = $this->{$model}->find()->where(['id' => $id])->first();
            if($entity){
                $entity->status = 'fetched';
                $this->{$model}->save($entity);
            }
        }
        
        $this->set(array(
	        'items'		    => $items,
            'success' 	    => true,
            '_serialize'    => ['success','items']
        ));
	}
	
	public function replyToAction(){
	
	    if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}	
		$items = $this->request->data;	
		if(array_key_exists('node_action_id',$this->request->data)){
		    $mode   = 'mesh';
            $model  = 'NodeActions';            
            if($this->request->getData('mode')){
                $mode = $this->request->getData('mode');
                if($mode == 'ap'){
                    $model = 'ApActions';
                }
            }
		    $id     = $this->request->data['node_action_id'];
		    $entity = $this->{$model}->find()->where(['id' => $id])->first();
		    if($entity){
                $entity->status = 'replied';
                $entity->reply  = $this->request->data['reply'];
                $this->{$model}->save($entity);
            }
		}
				
		$this->set(array(
	        'items'		=> $items,
            'success' 	=> true,
            '_serialize' => array('success','items')
        ));
	
	}

    //--This comes from the NodeJS API Gateway Application in response to 'execute' type node_actions
    //--This comes from the NodeJS API Gateway Application in FIRST response to 'execute_and_reply' type node_actions
    public function nodeCommand(){

        if($this->request->is('put')){
            $data = $this->request->data;
            if(!empty($data['node_id'])){
                // update command status to fetched
                $entity  = $this->{$this->main_model}->find()->where(['id' => $data['cmd_id']])->first();
                if($entity){
                    $entity->status = 'fetched';
                    $this->{$this->main_model}->save($entity);
                }

                $this->set(array(
                    'data'          => $data,
                    'success'       => true,
                    '_serialize'    => array('data','success')
                ));
            } else {
                $this->set(array(
                    'message'     => 'Node ID not found',
                    'success'       => false,
                    '_serialize'    => array('message','success')
                ));
            }

        } else {
            $this->set(array(
                'message'         => 'Send only PUT request',
                'success'       => false,
                '_serialize'    => array('message','success')
            ));
        }
    }
    
    //--This comes from the NodeJS API Gateway Application in FINAL reply to 'execute_and_reply' type node_actions
    public function nodeReply(){

        if($this->request->is('put')){
            $data = $this->request->data;
            if(!empty($data['node_id'])){
                // update command status to fetched
                $entity  = $this->{$this->main_model}->find()->where(['id' => $data['cmd_id']])->first();
                if($entity){
                    $entity->status = 'replied';
                    $entity->reply  = $data['reply'];
                    $this->{$this->main_model}->save($entity);
                }
                $this->set(array(
                    'data'          => $data,
                    'success'       => true,
                    '_serialize'    => array('data','success')
                ));
            } else {
                $this->set(array(
                    'message'     => 'Node ID not found',
                    'success'       => false,
                    '_serialize'    => array('message','success')
                ));
            }

        } else {
            $this->set(array(
                'message'         => 'Send only PUT request',
                'success'       => false,
                '_serialize'    => array('message','success')
            ));
        }
    }

	private function _get_node_mac_mesh_id($node_id){
        $this->loadModel('Nodes');

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
