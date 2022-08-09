<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class RealmsController extends AppController{

    public $base  = "Access Providers/Controllers/Realms/";
    
    protected $main_model = 'Realms';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Realms');     
        $this->loadModel('Users');     
        $this->loadModel('NaRealms');
        $this->loadModel('DynamicClientRealms');
           
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'Realms'
        ]);    
        $this->loadComponent('TimeCalculations');     
    }
    
     public function indexAp(){
    
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $req_q    = $this->request->getQuery(); //q_data is the query data      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQuery->build_cloud_query($query,$cloud_id,[]);
        $q_r        = $query->all();     
        $items      = [];
        
        foreach($q_r as $i){    
            $id   	= $i->id;
            $name  	= $i->name;
            array_push($items,
                [
                    'id'  	=> $id, 
                    'name'  => $name
                ]
            );
        } 
        $this->set([
            'items' => $items,
            'success' => true,
            '_serialize' => ['items', 'success']
        ]);
    }

    //x
    public function exportCsv(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $query = $this->{$this->main_model}->find(); 
        $this->CommonQuery->build_common_query($query,$user,[]);
        
        $q_r    = $query->all();

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
                    array_push($csv_line,$i->{$column_name});  
                }
                array_push($data,$csv_line);
            }
        }
        
        $_serialize = 'data';
        $this->setResponse($this->getResponse()->withDownload('export.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(compact('data', '_serialize'));  
        
    } 
    
    
    //____ BASIC CRUD Manager ________
   	//=Y=
	public function index(){
    
    	$req_q    = $this->request->getQuery(); //q_data is the query data

        $cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQuery->build_cloud_query($query,$cloud_id,[]);
        
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
        if(isset($req_q['limit'])){
            $limit  = $req_q['limit'];
            $page   = $req_q['page'];
            $offset = $req_q['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){               
            $row        = [];
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
			$row['update']		= true;
			$row['delete']		= true;
            array_push($items,$row);
        }
        
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
    }
    
    //x
    public function indexForFilter(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $query  = $this->{$this->main_model}->find();
        $this->CommonQuery->build_common_query($query,$user,[]);        
        $q_r    = $query->all();
        $items      = array();
        foreach($q_r as $i){
            array_push($items,array(
                'id'                    => $i->id, 
                'text'                  => $i->name
            ));
        }   

        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
    //=Y=
    public function add(){
        $this->_addOrEdit('add');   
    }
    
    //=Y=
    public function edit(){
        $this->_addOrEdit('edit');      
    }
     
    private function _addOrEdit($type= 'add') {
    
    	$req_d		= $this->request->getData();

        $check_items = [
			'available_to_siblings',
			'suffix_permanent_users',
			'suffix_vouchers',
            'suffix_devices'
		];
		
        foreach($check_items as $i){
            if(isset($req_d[$i])){
                $req_d[$i] = 1;
            }else{
                $req_d[$i] = 0;
            }
        }
       
        if($type == 'add'){ 
            $entity = $this->{$this->main_model}->newEntity($this->request->getData());
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($this->request->getData('id'));
            $this->{$this->main_model}->patchEntity($entity, $this->request->getData());
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
            
            $this->set([
                'errors'    => $a,
                'success'   => false,
                'message'   => ['message' => __('Could not create item')],
                '_serialize' => ['errors','success','message']
            ]);
        }
	}
	
	//=Y=
	public function view(){      
        $data	= []; 
        $req_q  = $this->request->getQuery();    
        if(isset($req_q['realm_id'])){
       		$id  = $req_q['realm_id'];
            $ent = $this->{$this->main_model}->find()->where([$this->main_model.'.id' => $id])->first();
            if($ent){      
                $data = $ent; 
            }
        }      
        $this->set([
            'data'      => $data,
            'success'   => true,
            '_serialize'=> ['success', 'data']
        ]);
    }
	
	//=Y=	
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
         
        $menu = $this->GridButtonsFlat->returnButtons(false,'realms'); //No "Action" title basic refresh/add/delete/edit
        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }
 
 	//=Y=
    public function delete($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		$req_d		= $this->request->getData();
			
	    if(isset($req_d['id'])){   //Single item delete       
            $entity     = $this->{$this->main_model}->get($req_d['id']);   
            $this->{$this->main_model}->delete($entity);

        }else{
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                $this->{$this->main_model}->delete($entity);
            }
        }         
        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
	}
	
	//=Y=
	public function uploadLogo($id = null){

        //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.    
        $this->viewBuilder()->setLayout('ext_file_upload');

        $path_parts     = pathinfo($_FILES['photo']['name']);
        $unique         = time();
        $dest           = WWW_ROOT."/img/realms/".$unique.'.'.$path_parts['extension'];
        $dest_www       = "/cake4/rd_cake/webroot/img/realms/".$unique.'.'.$path_parts['extension'];
       
        $entity         = $this->{$this->main_model}->get($this->request->getData('id'));
        $icon_file_name = $unique.'.'.$path_parts['extension'];
        $old_file       = $entity->icon_file_name;
        $entity->icon_file_name = $icon_file_name;
        
        if($this->{$this->main_model}->save($entity)){
            move_uploaded_file ($_FILES['photo']['tmp_name'] , $dest);   
             //Remove old file
            $file_to_delete = WWW_ROOT."/img/realms/".$old_file;
            if(file_exists($file_to_delete)){
                unlink($file_to_delete);
            }
            
            $this->set([
		        'success' 			=> true,
		        'id'      			=> $this->request->getData('id'),
		        'icon_file_name'	=> $icon_file_name,
		        '_serialize' => ['success','id','icon_file_name']
		    ]);                
            
        }else{       
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
            
            $this->set([
		        'errors' 	=> $a,
		        'message' 	=> array("message"   => __('Problem uploading photo')),
		        'success'	=> false,
		        '_serialize' => ['success','message','success']
		    ]);
                        
        }
       // $this->set('json_return',$json_return);
        
    }

 
    public function listRealmsForNasOwner(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        $user_id = null;
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $user_id = $user['id'];
        }

        if($user['group_name'] == Configure::read('group.ap')){  //Or AP
            $user_id = $user['id'];
        }

        if(isset($this->request->query['owner_id'])){

            //Check if it was 0 -> which means it is the current user
            if($this->request->query['owner_id'] == 0){
                $owner_id = $user_id;
            }else{
                $owner_id = $this->request->query['owner_id'];
            }
        }

        if(isset($this->request->query['available_to_siblings'])){
            $a_to_s      = $this->request->query['available_to_siblings'];  
        }

        //By default nas_id not included
        $nas_id = false;
        if(isset($this->request->query['nas_id'])){
            $nas_id      = $this->request->query['nas_id'];  
        }

        //========== CLEAR FIRST CHECK =======
        //By default clear_flag is not included
        $clear_flag = false;
        if(isset($this->request->query['clear_flag'])){
            if($this->request->query['clear_flag'] == 'true'){
                $clear_flag = true;
            }
        }

        if($clear_flag){    //If we first need to remove previous associations! 
            $this->NaRealms->deleteAll(['NaRealms.na_id' => $nas_id]);
        }
        //========== END CLEAR FIRST CHECK =======

        $items = array();

        //if $a_to_s is false we need to find the chain upwards to root and seek the public realms
        if($a_to_s == 'false'){
                    
            $q_r = $this->Users->find('path',['for' => $owner_id]);
            
            foreach($q_r as $i){
                $user_id = $i->id;
                
                if($owner_id != $user_id){
                
                    $q = $this->Realms
                        ->find()
                        ->contain(['NaRealms'])
                        ->where(['Realms.user_id' => $owner_id,'Realms.available_to_siblings' => true])
                        ->all();
                       
                    foreach($q as $j){ 
                        $selected = false;
                        //Check if the nas is not already assigned to this realm
                        if($nas_id){
                            foreach($j->na_realms as $nr){
                                if($nr->na_id == $nas_id){
                                    $selected = true;
                                }
                            }
                        }
                        array_push($items,array('id' => $j->id, 'name' => $j->name,'selected' => $selected));  
                    }
                
                }
                
                //When it got down to the owner; also get the private realms
                if($user_id == $owner_id){
                    $q = $this->Realms
                        ->find()
                        ->contain(['NaRealms'])
                        ->where(['Realms.user_id' => $owner_id])
                        ->all();
                       
                    foreach($q as $j){ 
                        $selected = false;
                        //Check if the nas is not already assigned to this realm
                        if($nas_id){
                            foreach($j->na_realms as $nr){
                                if($nr->na_id == $nas_id){
                                    $selected = true;
                                }
                            }
                        }
                        array_push($items,array('id' => $j->id, 'name' => $j->name,'selected' => $selected));  
                    }
                }
            }
        }

        //If $a_to_s is true, we neet to find the chain downwards to list ALL the realms of belonging to children of the owner
        if($a_to_s == 'true'){

            //First find all the realms beloning to the owner:
            $q = $this->Realms
                    ->find()
                    ->contain(['NaRealms'])
                    ->where(['Realms.user_id' => $owner_id])
                    ->all();
            foreach($q as $j){
                $selected = false;
                //Check if the nas is not already assigned to this realm
                if($nas_id){
                    foreach($j->na_realms as $nr){
                        if($nr->na_id == $nas_id){
                            $selected = true;
                        }
                    }
                }
                array_push($items,array('id' => $j->id, 'name' => $j->name,'selected' => $selected));                
            }
            
            //Now get all the realms of the siblings of the owner
            $children = $this->Users->find('children', ['for' => $owner_id]);

            if($children){   //Only if the AP has any children...
                foreach($children as $i){
                    $user_id = $i->id;
                    $q = $this->Realms
                        ->find()
                        ->contain(['NaRealms'])
                        ->where(['Realms.user_id' => $user_id])
                        ->all();
                  
                    foreach($q as $j){
                        $selected = false;
                        //Check if the nas is not already assigned to this realm
                        if($nas_id){
                            foreach($j->na_realms as $nr){
                                if($nr->na_id == $nas_id){
                                    $selected = true;
                                }
                            }
                        }   
                        array_push($items,array('id' => $j->id, 'name' => $j->name,'selected' => $selected));                
                    }
                }       
            }               
        }
       
        $this->set(array(
            'items'     => $items,
            'success'   => true,
            '_serialize' => array('items','success')
        ));
    }
    
    public function updateNaRealm(){

        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if(isset($this->request->query['nas_id'])){
            $nas_id     = $this->request->query['nas_id'];
	        if(isset($this->request->data['id'])){   //Single item select
                $realm_id   = $this->request->data['id'];
                if($this->request->data['selected']){
                
                    $entity = $this->NaRealms->newEntity();
                    $entity->na_id = $nas_id;
                    $entity->realm_id =  $realm_id;
                    $this->NaRealms->save($entity);
                }else{      
                    $this->NaRealms->deleteAll(['NaRealms.na_id' => $nas_id,'NaRealms.realm_id' => $realm_id]);            
                }
            }else{                          //Assume multiple item select
                foreach($this->request->data as $d){
                    if(isset($d['id'])){   //Single item select
                        $realm_id   = $d['id'];
                        if($d['selected']){
                            $entity = $this->NaRealms->newEntity();
                            $entity->na_id = $nas_id;
                            $entity->realm_id =  $realm_id;
                            $this->NaRealms->save($entity);
                        }else{
                        
                            $this->NaRealms->deleteAll(['NaRealms.na_id' => $nas_id,'NaRealms.realm_id' => $realm_id]);        
                        }
                    }
                }
            }
        }

        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }
       
    public function listRealmsForDynamicClientOwner(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        $user_id = null;
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $user_id = $user['id'];
        }

        if($user['group_name'] == Configure::read('group.ap')){  //Or AP
            $user_id = $user['id'];
        }

        if(isset($this->request->query['owner_id'])){

            //Check if it was 0 -> which means it is the current user
            if($this->request->query['owner_id'] == 0){
                $owner_id = $user_id;
            }else{
                $owner_id = $this->request->query['owner_id'];
            }
        }

        if(isset($this->request->query['available_to_siblings'])){
            $a_to_s      = $this->request->query['available_to_siblings'];  
        }

        //By default nas_id not included
        $dynamic_client_id = false;
        if(isset($this->request->query['dynamic_client_id'])){
            $dynamic_client_id      = $this->request->query['dynamic_client_id'];  
        }

        //========== CLEAR FIRST CHECK =======
        //By default clear_flag is not included
        $clear_flag = false;
        if(isset($this->request->query['clear_flag'])){
            if($this->request->query['clear_flag'] == 'true'){
                $clear_flag = true;
            }
        }

        if($clear_flag){    //If we first need to remove previous associations! 
            $this->DynamicClientRealms->deleteAll(['DynamicClientRealms.dynamic_client_id' => $dynamic_client_id]);
        }
        //========== END CLEAR FIRST CHECK =======

        $items = array();

        //if $a_to_s is false we need to find the chain upwards to root and seek the public realms
        if($a_to_s == 'false'){
        
        
            $q_r = $this->Users->find('path',['for' => $owner_id]);
            
            foreach($q_r as $i){
                $user_id = $i->id;
                
                if($owner_id != $user_id){
                
                    $q = $this->Realms
                        ->find()
                        ->contain(['DynamicClientRealms'])
                        ->where(['Realms.user_id' => $owner_id,'Realms.available_to_siblings' => true])
                        ->all();
                       
                    foreach($q as $j){ 
                        $selected = false;
                        //Check if the nas is not already assigned to this realm
                        if($dynamic_client_id){
                            foreach($j->dynamic_client_realms as $nr){
                                if($nr->dynamic_client_id == $dynamic_client_id){
                                    $selected = true;
                                }
                            }
                        }
                        array_push($items,array('id' => $j->id, 'name' => $j->name,'selected' => $selected));  
                    }
                
                }
                
                //When it got down to the owner; also get the private realms
                if($user_id == $owner_id){
                    $q = $this->Realms
                        ->find()
                        ->contain(['DynamicClientRealms'])
                        ->where(['Realms.user_id' => $owner_id])
                        ->all();
                       
                    foreach($q as $j){ 
                        $selected = false;
                        //Check if the nas is not already assigned to this realm
                        if($dynamic_client_id){
                            foreach($j->dynamic_client_realms as $nr){
                                if($nr->dynamic_client_id == $dynamic_client_id){
                                    $selected = true;
                                }
                            }
                        }
                        array_push($items,array('id' => $j->id, 'name' => $j->name,'selected' => $selected));  
                    }
                }
            }    
        }

        //If $a_to_s is true, we neet to find the chain downwards to list ALL the realms of belonging to children of the owner
        if($a_to_s == 'true'){
          
             //First find all the realms beloning to the owner:
            $q = $this->Realms
                    ->find()
                    ->contain(['DynamicClientRealms'])
                    ->where(['Realms.user_id' => $owner_id])
                    ->all();
            foreach($q as $j){
                $selected = false;
                //Check if the nas is not already assigned to this realm
                if($dynamic_client_id){
                    foreach($j->dynamic_client_realms as $nr){
                        if($nr->dynamic_client_id == $dynamic_client_id){
                            $selected = true;
                        }
                    }
                }
                array_push($items,array('id' => $j->id, 'name' => $j->name,'selected' => $selected));                
            }
            
            //Now get all the realms of the siblings of the owner
            $children = $this->Users->find('children', ['for' => $owner_id]);

            if($children){   //Only if the AP has any children...
                foreach($children as $i){
                    $user_id = $i->id;
                    $q = $this->Realms
                        ->find()
                        ->contain(['DynamicClientRealms'])
                        ->where(['Realms.user_id' => $user_id])
                        ->all();
                  
                    foreach($q as $j){
                        $selected = false;
                        //Check if the nas is not already assigned to this realm
                        if($dynamic_client_id){
                            foreach($j->dynamic_client_realms as $nr){
                                if($nr->dynamic_client_id == $dynamic_client_id){
                                    $selected = true;
                                }
                            }
                        }   
                        array_push($items,array('id' => $j->id, 'name' => $j->name,'selected' => $selected));                
                    }
                }       
            }               
        }
       
        $this->set(array(
            'items'     => $items,
            'success'   => true,
            '_serialize' => array('items','success')
        ));
    }
    
    
    public function listRealmsForDynamicClientCloud(){
    
    	$cloud_id 	= $this->request->query['cloud_id'];
        $query 	  	= $this->{$this->main_model}->find();      
        $this->CommonQuery->build_cloud_query($query,$cloud_id,['DynamicClientRealms']);
        $q_r 		= $query->all();       
        $items 		= [];
        
        $dynamic_client_id = false;
        if(isset($this->request->query['dynamic_client_id'])){
        	$dynamic_client_id = $this->request->query['dynamic_client_id'];
        }
        
        //========== CLEAR FIRST CHECK =======
        //By default clear_flag is not included
        $clear_flag = false;
        if(isset($this->request->query['clear_flag'])){
            if($this->request->query['clear_flag'] == 'true'){
                $clear_flag = true;
            }
        }

        if($clear_flag){    //If we first need to remove previous associations! 
            $this->DynamicClientRealms->deleteAll(['DynamicClientRealms.dynamic_client_id' => $dynamic_client_id]);
        }
        //========== END CLEAR FIRST CHECK =======
        
        
        foreach ($q_r as $i) {
        	$selected = false;
            if($dynamic_client_id){
                foreach($i->dynamic_client_realms as $nr){
                    if($nr->dynamic_client_id == $dynamic_client_id){
                        $selected = true;
                    }
                }
            }   
                       
        	$item = [ 'id' => $i->id, 'name' => $i->name,'selected' => $selected];          
        	array_push($items,$item);    
        }
        
        $this->set([
            'items'     	=> $items,
            'success'   	=> true,
            '_serialize' 	=> ['items','success']
        ]);  
    }
    
    //x
    public function updateDynamicClientRealm(){
     
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        if(isset($this->request->query['dynamic_client_id'])){
            $dynamic_client_id     = $this->request->query['dynamic_client_id'];
	        if(isset($this->request->data['id'])){   //Single item select
                $realm_id   = $this->request->data['id'];
                if($this->request->data['selected']){
                    $entity = $this->DynamicClientRealms->newEntity();
                    $entity->dynamic_client_id = $dynamic_client_id;
                    $entity->realm_id =  $realm_id;
                    $this->DynamicClientRealms->save($entity);
                }else{
                    $this->DynamicClientRealms->deleteAll(
                        ['DynamicClientRealms.dynamic_client_id' => $dynamic_client_id,'DynamicClientRealms.realm_id' => $realm_id]
                    );        
                }
            }else{                          //Assume multiple item select
                foreach($this->request->data as $d){
                    if(isset($d['id'])){   //Single item select
                        $realm_id   = $d['id'];
                        if($d['selected']){
                            $entity = $this->DynamicClientRealms->newEntity();
                            $entity->dynamic_client_id = $dynamic_client_id;
                            $entity->realm_id =  $realm_id;
                            $this->DynamicClientRealms->save($entity);
                        }else{
                            $this->DynamicClientRealms->deleteAll(
                                ['DynamicClientRealms.dynamic_client_id' => $dynamic_client_id,'DynamicClientRealms.realm_id' => $realm_id]
                            );        
                        }
                    }
                }
            }
        }
        
        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
    }
     
    //x
    public function editAp(){

        //The ap_id who's realm rights HAS to be a sibling of the user who initiated the request
        //___AA Check Starts ___
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $user_id = null;
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $user_id = $user['id'];
        }elseif($user['group_name'] == Configure::read('group.ap')){  //Or AP
            $user_id = $user['id'];
        }else{
           $this->Aa->fail_no_rights($this);
           return;
        }
        //__ AA Check Ends ___

        if(isset($this->request->query['ap_id'])){

            //Make sure the $ap_id is a child of $user_id - perhaps we should sub-class the Behaviaour...
            //TODO Complete this check
            
            $temp_debug = Configure::read('debug');
            Configure::write('debug', 0); // turn off debugging
            
            $success = false;

            $ap_id  = $this->request->query['ap_id'];
            $id     = $this->request->data['id'];
            
            try{
                       
                if($this->request->data['create'] == true){
                    $this->Acl->allow(
                    array('model' => 'Users', 'foreign_key' => $ap_id), 
                    array('model' => 'Realms','foreign_key' => $id), 'create');
                }else{
                    $this->Acl->deny(
                    array('model' => 'Users', 'foreign_key' => $ap_id), 
                    array('model' => 'Realms','foreign_key' => $id), 'create');
                } 

                if($this->request->data['read'] == true){
                    $this->Acl->allow(
                    array('model' => 'Users', 'foreign_key' => $ap_id), 
                    array('model' => 'Realms','foreign_key' => $id), 'read');
                }else{
                    $this->Acl->deny(
                    array('model' => 'Users', 'foreign_key' => $ap_id), 
                    array('model' => 'Realms','foreign_key' => $id), 'read');
                }

                if($this->request->data['update'] == true){
                    $this->Acl->allow(
                    array('model' => 'Users', 'foreign_key' => $ap_id), 
                    array('model' => 'Realms','foreign_key' => $id), 'update');
                }else{
                    $this->Acl->deny(
                    array('model' => 'Users', 'foreign_key' => $ap_id), 
                    array('model' => 'Realms','foreign_key' => $id), 'update');
                } 
                
                if($this->request->data['delete'] == true){
                    $this->Acl->allow(
                    array('model' => 'Users', 'foreign_key' => $ap_id), 
                    array('model' => 'Realms','foreign_key' => $id), 'delete');
                }else{
                    $this->Acl->deny(
                    array('model' => 'Users', 'foreign_key' => $ap_id), 
                    array('model' => 'Realms','foreign_key' => $id), 'delete');
                } 
                $success = true;
                    
            }catch(\Exception $e){               
                $success = false;  
            }        
            Configure::write('debug', $temp_debug); // turn off debugging 
        }

        $this->set(array(
            'items' => array(),
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    //____ END :: Access Providers application ______
      
    private function _doApListFor($user,$right = 'create'){
    
        $user_id    = null;
        $admin_flag = false;
    
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $user_id    = $user['id'];
            $admin_flag = true;
        }

        if($user['group_name'] == Configure::read('group.ap')){  //Or AP
            $user_id = $user['id'];
        }
        $items      = array();
        
        $ap_id = false;
        if(isset($this->request->query['ap_id'])){
            $ap_id      = $this->request->query['ap_id'];
        }

        if(($admin_flag)&&($ap_id == false)){
            $r = $this->{$this->main_model}->find()->all();
            foreach($r as $j){
                $id     = $j->id;
                $name   = $j->name;
                array_push($items,array('id' => $id, 'name' => $name));
            }

        }else{
            //Access Providers needs more work...
            if($ap_id == false){
                $ap_id      = $user_id;
            }
            if($ap_id == 0){
                $ap_id = $user_id;
            }
            $q_r = $this->Users->find('path',['for' => $ap_id]);
                   
            foreach($q_r as $i){    
                $user_id    = $i->id; 
                if($user_id != $ap_id){ //Only parents not the user self
                    $r  = $this->{$this->main_model}
                            ->find()
                            ->where(['Realms.user_id' => $user_id, 'Realms.available_to_siblings' => true])
                            ->all();
                    foreach($r  as $j){
                        $id     = $j->id;
                        $name   = $j->name; 
                        $create = false;
                        
                        $temp_debug = Configure::read('debug');
                        Configure::write('debug', 0); // turn off debugging
                        
                        
                        try{
                            $create = $this->Acl->check(
                                array('model' => 'Users', 'foreign_key' => $ap_id), 
                                array('model' => 'Realms','foreign_key' => $id), $right); //Only if they have create right
                        }catch(\Exception $e){               
                             $create = false;  
                        }
                        
                        if($create == true){
                            array_push($items,array('id' => $id, 'name' => $name));
                        }
                        
                        Configure::write('debug', $temp_debug); // turn off debugging
                    }
                }
            }

            //All the realms owned by anyone this access provider created (and also itself) 
            //will automatically be under full controll of this access provider           
            $this->children = $this->Users->find('children', ['for' => $ap_id]);
            
            $tree_array     = array(['Realms.user_id' => $ap_id]); //Start with itself
            
            if($this->children){   //Only if the AP has any children...
                foreach($this->children as $i){
                    $id = $i->id;                   
                    array_push($tree_array,['Realms.user_id' => $id]);
                }       
            } 
            $r_sub  = $this->{$this->main_model}
                    ->find()
                    ->where(['OR' => $tree_array])
                    ->all();
                    
            foreach($r_sub  as $j){
                $id     = $j->id;
                $name   = $j->name;
                array_push($items,array('id' => $id, 'name' => $name));
            }   
        }

        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
}
