<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class TopUpsController extends AppController{
  
    public $base         = "Access Providers/Controllers/TopUps/";   
    protected $owner_tree   = array();
    protected $main_model   = 'TopUps';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('TopUps'); 
        $this->loadModel('Users');
        $this->loadModel('PermanentUsers');
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'                     => 'TopUps',
            'no_available_to_siblings'  => true,
            'sort_by'                   => 'PermanentUsers.username'
        ]); 
             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
          
    }
    
    public function exportCsv(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $query = $this->{$this->main_model}->find(); 
        $this->CommonQuery->build_common_query($query,$user,['PermanentUsers','Users']);
        
        $q_r  = $query->all();

        //Headings
        $heading_line   = array();
        if(isset($this->request->query['columns'])){
            $columns = json_decode($this->request->query['columns']);
            foreach($columns as $c){
                array_push($heading_line,$c->name);
            }
        }
        $data = [
            $heading_line
        ];
        foreach($q_r as $i){

            $columns    = array();
            $csv_line   = array();
            if(isset($this->request->query['columns'])){
                $columns = json_decode($this->request->query['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    if($column_name == 'notes'){
                        $notes   = '';
                        foreach($i->na_notes as $un){
                            if(!$this->Aa->test_for_private_parent($un->note,$user)){
                                $notes = $notes.'['.$un->note->note.']';    
                            }
                        }
                        array_push($csv_line,$notes);
                    }elseif($column_name =='owner'){
                        $owner_id       = $i->user_id;
                        $owner_tree     = $this->Users->find_parents($owner_id);
                        array_push($csv_line,$owner_tree); 
                    }else{
                        array_push($csv_line,$i->{$column_name});  
                    }
                }
                array_push($data,$csv_line);
            }
        }
         
        $_serialize = 'data';
        $this->setResponse($this->getResponse()->withDownload('export.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(compact('data', '_serialize'));         
    } 
    
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
                
        $query = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query,$user,['PermanentUsers','Users']);
 
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

        foreach($q_r as $i){
              
            $owner_id   = $i->user_id;
            if(!array_key_exists($owner_id,$this->owner_tree)){
                $owner_tree     = $this->Users->find_parents($owner_id);
            }else{
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags   = $this->Aa->get_action_flags($owner_id,$user); 
            
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
            
            $row['user']	        = $i->user->username;
            $row['permanent_user']	= $i->permanent_user->username;
            
            $row['owner']   = $owner_tree;
			$row['update']	= $action_flags['update'];
			$row['delete']	= $action_flags['delete']; 
            array_push($items,$row);      
        }
       
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => array('items','success','totalCount')
        ));
    }
   
    public function add(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        //Set the permanent_user_id if the permanent_user is sent
        if((isset($this->request->data['permanent_user']))&&(!isset($this->request->data['permanent_user_id']))){
            $pu_name = $this->request->data['permanent_user'];
            $pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.username' => $pu_name])->first();
            if($pu){        
                $this->request->data['permanent_user_id'] = $pu->id;
            }else{
                $this->set([
                    'success'   => false,
                    'message'   => ['message' => __("Permanent Usser $pu_name NOT found")],
                    '_serialize' => ['success','message']
                ]);
                return;
            }        
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
        $user_id    = $user['id'];

        //Get the creator's id
        if(isset($this->request->data['user_id'])){
            if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
                $this->request->data['user_id'] = $user_id;
            }
        }

        //====Check what type it is====
        //---Data---
        if($this->request->data['type'] == 'data'){
            $multiplier = 1;
            if(isset($this->request->data['data_unit'])){
                if($this->request->data['data_unit'] == 'mb'){
                    $multiplier = 1048576; //(1024*1024)
                }
                if($this->request->data['data_unit'] == 'gb'){
                    $multiplier = 1073741824; //(1024*1024*1024)
                }            
            }
            $this->request->data['data'] = $this->request->data['value'] * $multiplier;
        }

        //---Time---
        if($this->request->data['type'] == 'time'){
            $multiplier = 1;
            if(isset($this->request->data['time_unit'])){
                if($this->request->data['time_unit'] == 'minutes'){
                    $multiplier = 60; //(60 seconds = minute)
                }
                if($this->request->data['time_unit'] == 'hours'){
                    $multiplier = 3600; //(60 seconds * 60 minutes)
                } 
                if($this->request->data['time_unit'] == 'days'){
                    $multiplier = 86400; //(60 seconds * 60 minutes * 24 Hours)
                }             
            }
            $this->request->data['time'] = $this->request->data['value'] * $multiplier;
        }

        //---Days To Use---
        if($this->request->data['type'] == 'days_to_use'){
            $this->request->data['days_to_use'] = $this->request->data['value'];
        }
        //====END Check what type it is====
       
        if($type == 'add'){ 
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
        
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }
	}
	
	
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
         
        $menu = $this->GridButtons->returnButtons($user,true,'top_ups'); 
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
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
}
