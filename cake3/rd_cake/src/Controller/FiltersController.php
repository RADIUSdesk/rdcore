<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class FiltersController extends AppController{
  
    public $base         = "Access Providers/Controllers/Filters/";   
    protected $owner_tree   = array();
    protected $main_model   = 'Filters';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Filters'); 
        $this->loadModel('Users');
        $this->loadModel('FilterCategories');
        $this->loadModel('Categories'); 
              
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'Filters'
        ]);    
    }
    
    //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
                
        $query = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query,$user,['FilterCategories']);
 
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
            } 
            
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
    
    public function indexForList(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $query = $this->{$this->main_model}->find();
        $this->CommonQuery->build_common_query($query,$user);
        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = array();

        foreach($q_r as $i){
            array_push($items,array(
                'id'                    => $i->id, 
                'name'                  => $i->name
            ));
        }
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
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
            $entity = $this->{$this->main_model}->newEntity($this->request->data());
        }
       
        if($type == 'edit'){
        
            //----------------------------
            //Here we do a bit more
            //-----------------------------
            if(!isset($this->request->data['custom'])){ //Not custom is very simple
                if(isset($this->request->data['filter_level'])){
                    $this->request->data['protection_level'] = $this->request->data['filter_level'];
                }
            }else{
                //If the person did not select anything (There is not categories) then we will be rude and overwrite it
                if(!isset($this->request->data['categories'])){ //Not custom is very simple
                    $this->request->data['protection_level'] = $this->request->data['filter_level'];
                }else{
                    //We need to determine if he just clicked the custom button or if he actually chose a different list from the low / medium / high
                    $categories = [];
                    foreach($this->request->data['categories'] as $c){
                        array_push($categories,$c);
                    }
                    $query = $this->Categories->find();
                    
                    $or_clause = ['protection_level' => 'low'];
                    
                    if($this->request->data['filter_level'] == 'medium'){
                        $or_clause = [['protection_level' => 'low'],['protection_level' => 'medium']];
                    }
                    
                    if($this->request->data['filter_level'] == 'high'){
                        $or_clause = [['protection_level' => 'low'],['protection_level' => 'medium'],['protection_level' => 'high']];
                    }
                    
                    $query->where(['OR' => $or_clause]);
                    
                    $sel_cat_count      = count($categories);
                    $tagged_cat_count   = $query->count();
                    $custom             = false;
                                     
                    if($sel_cat_count !== $tagged_cat_count){
                        $custom = true;
                    }else{ 
                        $qr = $query->all();
                        foreach($qr as $entity){
                           // print_r($entity->name."\n");
                           // print_r($categories);
                            $category_id = $entity->id;  
                            if(!in_array($category_id, $categories)){ 
                                $custom = true;
                               // break; //We already miss one no need to go on
                            }     
                        }
                    }
                    
                    if($custom){
                        $this->request->data['protection_level'] = 'custom';
                        //Remove all the previous FilterCategories for this filter
                        $filter_id = $this->request->data['id'];
                        $this->FilterCategories->deleteAll(['FilterCategory.filter_id' => $filter_id]);
                        foreach($categories as $c){
                            $entity = $this->FilterCategories->newEntity();
                            $entity->filter_id  = $filter_id;
                            $entity->category_id= $c;
                            $this->FilterCategories->save($entity);
                        }
                    
                    }else{
                       //Looks like the user did not made any changes
                       $this->request->data['protection_level'] = $this->request->data['filter_level']; 
                    } 
                }
            }
            
            //------------ END -------------
            
        
            $entity = $this->{$this->main_model}->get($this->request->data['id']);
            $this->{$this->main_model}->patchEntity($entity, $this->request->data());
        }
              
        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            
            $errors = $entity->errors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }
            
            $this->set(array(
                'errors'    => $a,
                'success'   => false,
                'message'   => array('message' => __('Could not create item')),
                '_serialize' => array('errors','success','message')
            ));
        }
	}
	
	
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
         
        $menu = $this->GridButtons->returnButtons($user,true,'basic'); 
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
	
	public function filterDetailFor(){
	
	   $q_c         = $this->Categories->find()->all();
	   $categories  = [];
	   $name        = 'categories[]'; 
	   $filter_id   = $this->request->query['filter_id']; 
	   $entity      = $this->{$this->main_model}->get($this->request->query['filter_id']);
	   
       
       
       $custom = false;
       $custom_categories = [];
       if($entity->protection_level == 'custom'){
            $entity->protection_level = 'high';
            $query = $this->FilterCategories->find();
            $fc = $query->where(['filter_id' => $filter_id])->all();
            foreach($fc as $c){
                array_push($custom_categories,$c->category_id);
            }
            $custom = true;
       }
       
       foreach($q_c as $c){
            array_push($categories,[
                'boxLabel'      => $c->name,
                'name'          => $name,
                'inputValue'    => $c->id, 
                'level'         => $c->protection_level,
                'xtype'         => 'checkbox',
                'readOnly'      => !$custom
            ]) ;  
       }
		
	    $this->set(array(
            'success'           => true,
            'categories'        => $categories,
            'protection_level'  => $entity->protection_level,
            'custom'            => $custom,
            'custom_categories' => $custom_categories,
            '_serialize' => array('success','categories','protection_level','custom','custom_categories')
        ));
	}
}
