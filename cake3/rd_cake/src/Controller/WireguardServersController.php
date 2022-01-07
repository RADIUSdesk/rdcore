<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 16/03/2021
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;


class WireguardServersController extends AppController {

    public $base            = "Access Providers/Controllers/WireguardServers/";
    protected $owner_tree   = [];
    protected $main_model   = 'WireguardServers';

    public function initialize(){
        parent::initialize();
        $this->loadModel('WireguardServers');
        $this->loadModel('Users');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'     => $this->main_model,
            'sort_by'   => $this->main_model . '.id'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }
    
      
    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query, $user, ['Users']); //AP QUERY is sort of different in a way

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

            $owner_id = $i->user_id;
            if (!array_key_exists($owner_id, $this->owner_tree)) {
                $owner_tree = $this->Users->find_parents($owner_id);
            } else {
                $owner_tree = $this->owner_tree[$owner_id];
            }
            $action_flags 	= $this->Aa->get_action_flags($owner_id, $user);  
			//print_r($i);
            array_push($items,[
                'id'                    => $i['id'], 
                'name'                  => $i['name'],
                'description'           => $i['description'],
                'owner'                 => $owner_tree, 
                'available_to_siblings' => $i['available_to_siblings'],
                'local_remote'          => $i['local_remote'],
                'update'                => $action_flags['update'],
                'delete'                => $action_flags['delete']
            ]);
        }
       
        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
    }
	
    //____ BASIC CRUD Manager ________
    public function index_ap(){
    //Display a list of items with their owners
    //This will be dispalyed to the Administrator as well as Access Providers who has righs

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];


        //_____ ADMIN _____
        $items = array();
        if($user['group_name'] == Configure::read('group.admin')){  //Admin

            $query->{$this->main_model}->contain();
            $q_r = $query->all();

            foreach($q_r as $i){   
                array_push($items,array(
                    'id'            => $i['WireguardServer']['id'], 
                    'name'          => $i['WireguardServer']['name']
                ));
            }
        }

        //_____ AP _____
        if($user['group_name'] == Configure::read('group.ap')){  

            //If it is an Access Provider that requested this list; we should show:
            //1.) all those NAS devices that he is allowed to use from parents with the available_to_sibling flag set (no edit or delete)
            //2.) all those he created himself (if any) (this he can manage, depending on his right)
            //3.) all his children -> check if they may have created any. (this he can manage, depending on his right)

            $query->{$this->main_model}->contain();
            $q_r = $query->all();

            //Loop through this list. Only if $user_id is a sibling of $creator_id we will add it to the list
            $ap_child_count = $this->User->childCount($user_id);

            foreach($q_r as $i){
                $add_flag   = false;
                $owner_id   = $i['WireguardServer']['user_id'];
                $a_t_s      = $i['WireguardServer']['available_to_siblings'];
                $add_flag   = false;
                
                //Filter for parents and children
                if($owner_id != $user_id){
                    if($this->Users->is_sibling_of($owner_id,$user_id)== true){ //Is the user_id an upstream parent of the AP
                        //Only those available to siblings:
                        if($a_t_s == 1){
                            $add_flag = true;
                        }
                    }
                }

                if($ap_child_count != 0){ 
                    if($this->Users->is_sibling_of($user_id,$owner_id)== true){ 
                        $add_flag = true;
                    }
                }

                //Created himself
                if($owner_id == $user_id){
                    $add_flag = true;
                }

                if($add_flag == true ){
                    $owner_tree = $this->Users->find_parents($owner_id);                      
                    //Add to return items
                    array_push($items,array(
                        'id'            => $i['WireguardServer']['id'], 
                        'name'          => $i['WireguardServer']['name']
                    ));
                }
            }
        }

        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }

    public function add(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $this->_addOrEdit($user,'add');
        
    }
    
    public function edit(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->_addOrEdit($user,'edit');
        
    }
    
    private function _addOrEdit($user,$type= 'add') {

        //__ Authentication + Authorization __
        
        $user_id    = $user['id'];

        //Get the creator's id
        if(isset($this->request->data['user_id'])){
            if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
                $this->request->data['user_id'] = $user_id;
            }
        }

        $check_items = array(
			'available_to_siblings',
			'active'
		);
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
       
        if($type == 'add'){ 
            $this->request->data['token_key'] = Text::uuid();
            $entity = $this->{$this->main_model}->newEntity($this->request->data());
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($this->request->data['id']);
            $this->{$this->main_model}->patchEntity($entity, $this->request->data());
        }
              
        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
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

        $user_id   = $user['id'];
        $fail_flag = false;

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);   
            $owner_id   = $entity->user_id;
            
            if($owner_id != $user_id){
                if($this->Users->is_sibling_of($user_id,$owner_id)== true){
                    $this->{$this->main_model}->delete($entity);
                }else{
                    $fail_flag = true;
                }
            }else{
                $this->{$this->main_model}->delete($entity);
            }
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                $owner_id   = $entity->user_id;
                if($owner_id != $user_id){
                    if($this->Users->is_sibling_of($user_id,$owner_id) == true){
                        $this->{$this->main_model}->delete($entity);
                    }else{
                        $fail_flag = true;
                    }
                }else{
                    $this->{$this->main_model}->delete($entity);
                }
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

        $menu = $this->GridButtons->returnButtons($user, false, 'basic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
}
