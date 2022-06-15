<?php

namespace App\Controller;

use Cake\Core\Configure;
use MethodNotAllowedException;
use GuzzleHttp\Client;

class ApActionsController extends AppController {

    public $main_model       = 'ApActions';
    public $base    = "Access Providers/Controllers/ApActions/";

//------------------------------------------------------------------------

    public function initialize()
    {
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('Aps');
        $this->loadModel('PredefinedCommands');
        $this->loadModel('Users');
        $this->loadComponent('Aa');
        $this->loadComponent('Formatter');
        $this->loadComponent('GridFilter');

        $this->loadComponent('JsonErrors');
        $this->loadComponent('GridButtons');  
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
        
        if(isset($this->request->query['ap_id'])){
            $query->where(["ApActions.ap_id" => $this->request->query['ap_id']]);
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
                $formData['ap_id']  = $this->request->data[$key];
                $entity             = $this->{$this->main_model}->newEntity($formData);
                 if ($this->{$this->main_model}->save($entity)) {
                 
                    if ($cfg['enable_realtime']){
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

		if(isset($this->request->data['ap_id'])){
		
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
                    $mac = $this->_get_ap_mac($formData['ap_id']);
                    $payload = [
                        'mode'      => 'mesh',
                        'ap_id'     => $formData['ap_id'],
                        'mac'       => strtoupper($data['mac']),
                        'mesh_id'   => strtoupper($data['ssid']),
                        'cmd_id'    => $entity->id,
                        'cmd'       => $formData['command'],
                        'action'    => $formData['action'],
                    ];

                    if($this->_check_server($client, $cfg['api_gateway_url'], 20)){
                        $client->request('POST', $cfg['api_gateway_url'] . '/rd/ap/command', ['json' => ['message' => $payload]]);
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
        $fail_flag = false;

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->data['id'];
            $this->{$this->main_model}->query()->delete()->where(['id' => $this->request->data['id']])->execute();
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $this->{$this->main_model}->query()->delete()->where(['id' => $d['id']])->execute();
            }
        }

        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   => ['message' => __('Could not delete some items')],
                '_serialize' => ['success','message']
            ]);
        }else{
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }
	}

     //DEPECATED => Using NodeActions controller with ONE URL
     //With that URL we now cover actions for AP Profiels and Meshes depending on the value of 'mode' in the POST
	public function getActionsFor(){

		if(!(array_key_exists('mac', $this->request->getData()))){
				$this->set([
				'message'		=> 'Required field missing in POST',
		        'success' => false,
		        '_serialize' => ['success','message']
		    ]);
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
            'success' 	=> true,
            '_serialize' => ['success','items']
        ]);
	}
	
	public function restartAps(){

		$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
		// Load Config -FIXME Still have to enable for APdesk
        //Configure::load('MESHdesk');
        //$cfg    = Configure::read('mqtt_settings');
        //$client = new Client();

        //Loop through the nodes and make sure there is not already one pending before adding one
        foreach ($this->request->getData('aps') as $a) {
            $ap_id    = $a['id'];
            $ent_ap = $this->{'Aps'}->find()->where(['Aps.id' => $ap_id])->first();        
            if($ent_ap){  
                $ent_ap->reboot_flag = !$ent_ap->reboot_flag;
                if($this->{'Aps'}->save($ent_ap)){
                    if ($cfg['enable_realtime']){
                        //Talk to MQTT Broker -FIXME Still have to enable for APdesk
                        /*
                        $data = $this->_get_node_mac_mesh_id($node_id);

                        $payload = [
                            'node_id' => $node_id,
                            'mac'  => strtoupper($data['mac']),
                            'mesh_id' => strtoupper($data['ssid']),
                            'cmd_id' => $nodeActionEntity->id,
                            'cmd' => 'reboot',
                        ];

                        if($this->_check_server($client, $cfg['api_gateway_url'], 5)){
                            $client->request('POST', $cfg['api_gateway_url'] . '/mesh/node/command', ['form_params' => ['message' => json_encode($payload)]]);
                        }
                        */
                    }
                }
            }
        }
		
		$items = [];
		$this->set([
            'items' => $items,
            'success' => true,
            '_serialize' => ['items','success']
        ]);
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

        $menu = $this->GridButtons->returnButtons($user,false, 'add_and_delete'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }

    function _build_common_query($query, $user){

        $where = [];
        $joins = [];

        $query->contain(['Aps']);

        //===== SORT =====
        //Default values for sort and dir
        $sort   = 'ApActions.created';
        $dir    = 'ASC';

        if(null !== $this->request->getQuery('sort')){
            $sort = $this->main_model.'.'.$this->request->getQuery('sort');
            $dir  = $this->request->getQuery('dir');
        }

        $query->order([$sort => $dir]);
        //==== END SORT ===


        //====== REQUEST FILTER =====
        if(null !== $this->request->getQuery('filter')){
            $filter = json_decode($this->request->getQuery('filter'));
            foreach($filter as $f){
            
                $f = $this->GridFilter->xformFilter($f);
            
                //Strings
                if($f->type == 'string'){
                    $col = $this->main_model.'.'.$f->field;
                    array_push($where, ["$col LIKE" => '%'.$f->value.'%']);
                }
                //Bools
                if($f->type == 'boolean'){
                     $col = $this->main_model.'.'.$f->field;
                     array_push($where, ["$col" => $f->value]);
                }
            }
        }
        //====== END REQUEST FILTER =====

        //====== AP FILTER =====
        //If the user is an AP; we need to add an extra clause to only show the Tags which he is allowed to see.
        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $tree_array = [];
            $user_id    = $user['id'];

            //**AP and upward in the tree**
//            $this->parents = $this->User->getPath($user_id,'User.id');
            $this->parents = $this->Users->find('path', ['for' => $user_id, 'fields' => ['Users.id']]);
//            $Navigations->find('path', ['for' => 33]);
            //So we loop this results asking for the parent nodes who have available_to_siblings = true
            foreach($this->parents as $i){
                $i_id = $i->id;
                if($i_id != $user_id){ //upstream
                  ////  array_push($tree_array,array('Ap.user_id' => $i_id,'Na.available_to_siblings' => true));
                }else{
                  ///  array_push($tree_array,array('Na.user_id' => $i_id));
                }
            }
            //** ALL the AP's children
            $this->children    = $this->Users->find_access_provider_children($user['id']);
            if($this->children){   //Only if the AP has any children...
                foreach($this->children as $i){
                    $id = $i['id'];
                  ////  array_push($tree_array,array('Na.user_id' => $id));
                }       
            }   
            //Add it as an OR clause
            array_push($where, ['OR' => $tree_array]);
        }       
        //====== END AP FILTER =====      
        return $query->where($where);
    }

    private function _get_action_flags($owner_id,$user){
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            return ['update' => true, 'delete' => true];
        }

        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $user_id = $user['id'];

            //test for self
            if($owner_id == $user_id){
                return ['update' => true, 'delete' => true];
            }
            //Test for Parents
            foreach($this->parents as $i){
                if($i->id == $owner_id){
                    return ['update' => false, 'delete' => false];
                }
            }

            //Test for Children
            foreach($this->children as $i){
                if($i['id'] == $owner_id){
                    return ['update' => true, 'delete' => true];
                }
            }  
        }
    }

}
