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

    public function initialize():void{
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('ApActions');
        $this->loadModel('PredefinedCommands');
        $this->loadModel('Users');
        $this->loadModel('UserSettings');
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');  
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }

    public function index(){
        //__ Authentication + Authorization __
        
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $query    = $this->{$this->main_model}->find();
        $req_q    = $this->request->getQuery();  
        
        if(isset($req_q['node_id'])){
            $query->where(["NodeActions.node_id" => $req_q['node_id']]);
        }

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($req_q['limit'])) {
            $limit 	= $req_q['limit'];
            $page 	= $req_q['page'];
            $offset = $req_q['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();
        $items = array();

        foreach ($q_r as $i) {
            $row        = array();
            $fields     = $this->{$this->main_model}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                } 
            }
            if($row['reply']){
                $row['reply_html']= nl2br($row['reply']);
            }  

            array_push($items, $row);
        }

        //___ FINAL PART ___
        $this->set([
            'items' 		=> $items,
            'success' 		=> true,
            'totalCount' 	=> $total,
            'metaData'		=> [
            	'total'	=> $total
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function add(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        //Some default values
        $cfg['api_mqtt_enabled'] = false;
        $cfg['api_gateway_url'] = 'http://127.0.0.1:8001';
        
        $want_these = ['api_mqtt_enabled','api_gateway_url'];
		$ent_us     = $this->UserSettings->find()->where(['UserSettings.user_id' => -1])->all();
	
		foreach($ent_us as $s){
		    $s_name     = $s->name;
		    $s_value    = $s->value;
		    if(in_array($s_name,$want_these)){
		        $cfg["$s_name"] = $s_value;
		    }
		}
               
        $client = new Client();
        $req_d  = $this->request->getData();

        foreach(array_keys($req_d) as $key){
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
                $formData['node_id']    = $req_d[$key];
                $entity                 = $this->{$this->main_model}->newEntity($formData);
                if ($this->{$this->main_model}->save($entity)) {

                     if ($cfg['api_mqtt_enabled'] == "1"){
                        //Talk to MQTT Broker
                         $data = $this->_get_node_mac_mesh_id($formData['node_id']);
                         $payload = [
                             'mode'     => 'mesh',
                             'node_id'  => $formData['node_id'],
                             'mac'      => strtoupper($data['mac']),
                             'mesh_id'  => strtoupper($data['ssid']),
                             'cmd_id'   => $entity->id,
                             'cmd'      => $formData['command'],
                             'action'   => $formData['action'],
                         ];

                         if($this->_check_server($client, $cfg['api_gateway_url'], 5)){
                             try {
                                 $client->request('POST', $cfg['api_gateway_url'] . '/rd/mesh/command', ['json' => ['message' => $payload]]);
                             } catch (\Exception $e) {
                                 // Do Nothing
                             }
                         }
                     }

                     $this->set(array(
                         'success' => true
                     ));
                     $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($entity,$message);
                }  
            }
        }

		if($req_d['node_id'] != ''){
		
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

                if ($cfg['api_mqtt_enabled'] == "1"){
                    // Talk to MQTT Broker
                    $data = $this->_get_node_mac_mesh_id($formData['node_id']);
                    $payload = [
                        'mode'      => 'mesh',
                        'node_id'   => $formData['node_id'],
                        'mac'       => strtoupper($data['mac']),
                        'mesh_id'   => strtoupper($data['ssid']),
                        'cmd_id'    => $entity->id,
                        'cmd'       => $formData['command'],
                        'action'    => $formData['action'],
                    ];

                    if($this->_check_server($client, $cfg['api_gateway_url'], 20)){
                        $client->request('POST', $cfg['api_gateway_url'] . '/rd/mesh/command', ['json' => ['message' => $payload]]);
                    }
                }

                $this->set([
				    'success' => true
				]);
				$this->viewBuilder()->setOption('serialize', true);
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
        $req_d     = $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
            $message = "Single item ".$req_d['id'];       
            $entity     = $this->{$this->main_model}->get($req_d['id']);       
            $this->{$this->main_model}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);      
                $this->{$this->main_model}->delete($entity);   
            }
        }

        if($fail_flag == true){
            $this->set(array(
                'success'   => false,
                'message'   => __('Could not delete some items')
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }else{
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
	}

    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'add_and_delete'); 
        $this->set([
            'items' => $menu,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    //== THIS IS MY DANS HARE :-) ===
    //With this URL we now cover actions for AP Profiels and Meshes depending on the value of 'mode' in the POST
    public function getActionsFor(){
    
    	$req_d     = $this->request->getData();

        if(!(array_key_exists('mac',$req_d))){
		        $this->set([
		        'message'	=> 'Required field missing in POST',
                'success' 	=> false
            ]);
            $this->viewBuilder()->setOption('serialize', true);
	        return;
        }

        $mac    = $req_d['mac'];
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
            'success' 	    => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function replyToAction(){
	
	    if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}	
		$req_d = $this->request->getData();
		if(array_key_exists('node_action_id',$req_d)){
		    $mode   = 'mesh';
            $model  = 'NodeActions';            
            if($this->request->getData('mode')){
                $mode = $this->request->getData('mode');
                if($mode == 'ap'){
                    $model = 'ApActions';
                }
            }
		    $id     = $req_d['node_action_id'];
		    $entity = $this->{$model}->find()->where(['id' => $id])->first();
		    if($entity){
                $entity->status = 'replied';
                $entity->reply  = $req_d['reply'];
                $this->{$model}->save($entity);
            }
		}
				
		$this->set([
	        'items'		=> $req_d,
            'success' 	=> true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	
	}

    //--This comes from the NodeJS API Gateway Application in response to 'execute' type node_actions
    //--This comes from the NodeJS API Gateway Application in FIRST response to 'execute_and_reply' type node_actions
    public function nodeCommand(){

        if($this->request->is('put')){
            $req_d = $this->request->getData();
            if((!empty($req_d['node_id']))||(!empty($req_d['ap_id']))){
                // update command status to fetched
                $model = 'NodeActions';
                if($req_d['mode'] == 'ap'){
                    $model = 'ApActions';
                }
                
                $entity  = $this->{$model}->find()->where(['id' => $req_d['cmd_id']])->first();
                if($entity){
                    $entity->status = 'fetched';
                    $this->{$model}->save($entity);
                }

                $this->set(array(
                    'data'          => $req_d,
                    'success'       => true
                ));
                $this->viewBuilder()->setOption('serialize', true);
            } else {
                $this->set(array(
                    'message'     => 'Node ID not found',
                    'success'       => false
                ));
                $this->viewBuilder()->setOption('serialize', true);
            }

        } else {
            $this->set(array(
                'message'         => 'Send only PUT request',
                'success'       => false
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
    }
    
    //--This comes from the NodeJS API Gateway Application in FINAL reply to 'execute_and_reply' type node_actions
    public function nodeReply(){

        if($this->request->is('put')){
        	$req_d = $this->request->getData();
            if((!empty($req_d['node_id']))||(!empty($req_d['ap_id']))){
                // update command status to fetched
                $model = 'NodeActions';
                if($req_d['mode'] == 'ap'){
                    $model = 'ApActions';
                }
                $entity  = $this->{$model}->find()->where(['id' => $req_d['cmd_id']])->first();
                if($entity){
                    $entity->status = 'replied';
                    $entity->reply  = $req_d['reply'];
                    $this->{$model}->save($entity);
                }
                $this->set(array(
                    'data'          => $req_d,
                    'success'       => true
                ));
                $this->viewBuilder()->setOption('serialize', true);
            } else {
                $this->set(array(
                    'message'     => 'Node ID not found',
                    'success'       => false
                ));
                $this->viewBuilder()->setOption('serialize', true);
            }

        } else {
            $this->set(array(
                'message'         => 'Send only PUT request',
                'success'       => false
            ));
            $this->viewBuilder()->setOption('serialize', true);
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
