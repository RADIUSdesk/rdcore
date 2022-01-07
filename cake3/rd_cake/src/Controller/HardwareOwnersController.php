<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Http\Client;
use Cake\Http\ServerRequest;


class HardwareOwnersController extends AppController{
  
    public $base            = "Access Providers/Controllers/HardwareOwners/"; 
    protected $owner_tree   = [];
    protected $main_model   = 'HardwareOwners';
    protected $claim_owner  = '/cake3/rd_cake/unknown-nodes/claim-ownership.json';
    //protected $base_server  = "http://127.0.0.1";
    protected $base_server  = "https://base.wifi-dashboard.com";
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('HardwareOwners');            
        $this->loadModel('Users');   
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'HardwareOwners'
        ]);
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');    
    }
     //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();
        

        $this->CommonQuery->build_common_query($query,$user,['Users','Hardwares']);
 
        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
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

        $items      = [];

        foreach ($q_r as $i) {

            $owner_id = $i->user_id;
            if (!array_key_exists($owner_id, $this->owner_tree)) {
                $owner_tree = $this->Users->find_parents($owner_id);
            } else {
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags = $this->Aa->get_action_flags($owner_id, $user);
              
            $row        = [];
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
            $row['owner']		= $owner_tree;
			$row['update']		= $action_flags['update'];
			$row['delete']		= $action_flags['delete'];
			$row['hardware']    = $i->{"hardware"}->name;
			
            array_push($items, $row);
        }
       
        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => ['items','success','totalCount']
        ]);  
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
			'available_to_siblings'
		);
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
       
        if($type == 'add'){
        
            //We don't want to add doubles
            $entity = $this->{$this->main_model}->find()->where(['name' =>$this->request->data['name']])->first();
            if($entity){
                $a['name'] = "MAC ".$this->request->data['name']." Already Taken";
                $this->set([
                    'errors'    => $a,
                    'success'   => false,
                    'message'   => "MAC ".$this->request->data['name']." Already Taken",
                    '_serialize' => ['errors','success','message']
                    ]);
                    return;
            
            } 
        
            //First try to update the base server before adding it here
            $http = new Client();
            //$data = $this->request->getData();
            
            //Specify to the base server where we are from man
            $host = $this->request->host();
            $proto= 'http';
            if($this->request->is('ssl')){
                $proto = 'https';
            }
            $data['host']   = $host;
            $data['proto']  = $proto;
            $data['mac']    = $this->request->data['name'];
            $data['description'] = $this->request->data['description'];
                     
            try{
                $response = $http->post(
                    $this->base_server.$this->claim_owner,
                    json_encode($data),
                    ['type' => 'json','timeout' => 5]
                );
                if($response->isOk()){
                    $feedback = $response->getJson();
                    if($feedback['success'] == true){
                        //Now we can add it locally
                        //print_r($response->getJson());
                        $entity = $this->{$this->main_model}->newEntity($this->request->data());
                        if ($this->{$this->main_model}->save($entity)) {
                            $this->set(array(
                                'success' => true,
                                '_serialize' => array('success')
                            ));
                        } else {
                            $message = __('Could not update item');
                            $this->JsonErrors->entityErros($entity,$message);
                        }
                    }else{
                         $this->set([
                            'success' => false,
                            '_serialize' => ['success']
                        ]);
                    }
                    return;
                }
            }catch (\Exception $e) {         
                 $this->set([
                    'success'       => false,
                    'message'       => $e->getMessage(),
                    '_serialize'    => ['success','message']
                ]);
                return;
            }   
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
	
	
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
         
        $menu = $this->GridButtons->returnButtons($user,false,'basic'); //No "Action" title basic refresh/add/delete/edit
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }
    
    
     public function delete($id = null) {
		if (!$this->request->is('post')) {
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
            $message = "Single item ".$this->request->data['id'];

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);   
            $owner_id   = $entity->user_id;
            
            if($owner_id != $user_id){
                if($this->Users->is_sibling_of($user_id,$owner_id)== true){
                    if($entity->status == 'checked-in'){
                        $this->{$this->main_model}->patchEntity($entity,['status'=>'awaiting-check-out']);
                        $this->{$this->main_model}->save($entity);
                    }
                    
                    if($entity->status == 'checked-out'){
                        $this->{$this->main_model}->delete($entity);
                    }
                    
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
                        if($entity->status == 'checked-in'){
                            $this->{$this->main_model}->patchEntity($entity,['status'=>'awaiting-check-out']);
                            $this->{$this->main_model}->save($entity);
                        }
                        
                        if($entity->status == 'checked-out'){
                            $this->{$this->main_model}->delete($entity);
                        }
                    }else{
                        $fail_flag = true;
                    }
                }else{
                    if($entity->status == 'checked-in'){
                        $this->{$this->main_model}->patchEntity($entity,['status'=>'awaiting-check-out']);
                        $this->{$this->main_model}->save($entity);
                    }
                    
                    if($entity->status == 'checked-out'){
                        $this->{$this->main_model}->delete($entity);
                    }
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
}
