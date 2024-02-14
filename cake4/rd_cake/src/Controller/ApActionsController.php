<?php

namespace App\Controller;

use Cake\Core\Configure;
use MethodNotAllowedException;
use GuzzleHttp\Client;

class ApActionsController extends AppController {

    public $main_model       = 'ApActions';
    public $base    = "Access Providers/Controllers/ApActions/";

//------------------------------------------------------------------------

    public function initialize():void
    {
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('Aps');
        $this->loadModel('PredefinedCommands');
        $this->loadModel('Users');
        $this->loadModel('UserSettings');
        $this->loadComponent('Aa');
        $this->loadComponent('Formatter');
        $this->loadComponent('GridFilter');
        $this->loadComponent('JsonErrors');
        $this->loadComponent('GridButtonsFlat');  
        $this->loadComponent('TimeCalculations'); 

    }

    //____ BASIC CRUD Actions Manager ________
    
    
    public function index(){
        //__ Authentication + Authorization __
        
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();        
        $req_q    	= $this->request->getQuery();  
        
        if(isset($req_q['ap_id'])){
            $query->where(["ApActions.ap_id" => $req_q['ap_id']]);
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
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            'metaData'		=> [
            	'total'	=> $total
            ]
        ));
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
              
        $client	= new Client();
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
                $formData['ap_id']  = $req_d[$key];
                $entity             = $this->{$this->main_model}->newEntity($formData);
                 if ($this->{$this->main_model}->save($entity)) {
                 
                    if ($cfg['api_mqtt_enabled'] == '1'){
                        //Talk to MQTT Broker
                         $mac = $this->_get_ap_mac($formData['ap_id']);
                         $payload = [
                             'mode'     => 'ap',
                             'ap_id'    => $formData['ap_id'],
                             'mac'      => $mac,
                             'cmd_id'   => $entity->id,
                             'cmd'      => $formData['command'],
                             'action'   => $formData['action'],
                         ];

                         if($this->_check_server($client, $cfg['api_gateway_url'], 5)){
                             try {
                                 $client->request('POST', $cfg['api_gateway_url'] . '/rd/ap/command', ['json' => ['message' => $payload]]);
                             } catch (\Exception $e) {
                                 // Do Nothing
                             }
                         }
                     }              
                 
                     $this->set([
                         'success' => true
                     ]);
                     $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($entity,$message);
                }  
            }
        }

		if(isset($req_d['ap_id'])){
		
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
			    $mac = $this->_get_ap_mac($formData['ap_id']);
			    if ($cfg['api_mqtt_enabled'] == '1'){
                    // Talk to MQTT Broker
                    $mac = $this->_get_ap_mac($formData['ap_id']);
                    $payload = [
                        'mode'      => 'ap',
                        'ap_id'     => $formData['ap_id'],
                        'mac'       => $mac,
                        'cmd_id'    => $entity->id,
                        'cmd'       => $formData['command'],
                        'action'    => $formData['action'],
                    ];

                    if($this->_check_server($client, $cfg['api_gateway_url'], 20)){
                        $client->request('POST', $cfg['api_gateway_url'] . '/rd/ap/command', ['json' => ['message' => $payload]]);
                    }
                }
            
                $this->set(array(
				    'success' => true
				));
				$this->viewBuilder()->setOption('serialize', true);
				return;
			} else {
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($entity,$message);
            }
		}       
    }
   
    //FIXME check rights
    public function delete($id = null) {
		if (! $this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $fail_flag  = false;
        $req_d      = $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
            $message = "Single item ".$this->data['id'];
            $this->{$this->main_model}->query()->delete()->where(['id' => $req_d['id']])->execute();
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $this->{$this->main_model}->query()->delete()->where(['id' => $d['id']])->execute();
            }
        }

        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   =>  __('Could not delete some items')
            ]);
        }else{
            $this->set([
                'success' => true
            ]);
        }
        $this->viewBuilder()->setOption('serialize', true);
	}

     //DEPECATED => Using NodeActions controller with ONE URL
     //With that URL we now cover actions for AP Profiels and Meshes depending on the value of 'mode' in the POST
	public function getActionsFor(){
	
		$req_d      = $this->request->getData();

		if(!(array_key_exists('mac', $req_d))){
				$this->set([
				'message' => 'Required field missing in POST',
		        'success' => false
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);
			return;
		}

		$mac        = $this->request->getData('mac');
		$ent_ap     = $this->{'Aps'}->find()->where(['Aps.mac' => $mac])->first();
		$q_r        = $this->{$this->main_model}->find()->where(['ApActions.ap_id' => $ent_ap->id,'ApActions.status' => 'awaiting'])->all();

		$items = [];
		foreach($q_r as $i){
			$id		= $i->id;
			$c 		= $i->command;
			array_push($items, ['id' => $id,'command' => $c]);
			//Mark them as fetched
			$i->status = 'fetched';
            $this->{$this->main_model}->save($i);			
		}

		$this->set([
			'items'		=> $items,
            'success' 	=> true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function restartAps(){

		$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
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
              
        //Loop through the nodes and make sure there is not already one pending before adding one
        foreach ($this->request->getData('aps') as $a) {
            $ap_id    = $a['id'];
            $ent_ap = $this->{'Aps'}->find()->where(['Aps.id' => $ap_id])->first();        
            if($ent_ap){  
                $ent_ap->reboot_flag = !$ent_ap->reboot_flag;
                if($this->{'Aps'}->save($ent_ap)){
                    //ADD Support for MQTT
                                                  
                }
            }
        }
		
		$items = [];
		$this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	private function _get_ap_mac($ap_id){
        $this->loadModel('Aps');

        $q_r = $this->{'Aps'}->find()->where(['Aps.id' => $ap_id])->first();
        if($q_r){
            return $q_r->mac;
        }else{
            return false;
        }
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
    
    //----- Menus ------------------------
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false, 'add_and_delete'); 
        $this->set(array(
            'items' => $menu,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
}
