<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 12/03/2019
 * Time: 00:00
 */

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class HardwaresController extends AppController{
  
    public $base  = "Access Providers/Controllers/Hardwares/";
    
    protected $owner_tree = array();
    protected $main_model = 'Hardwares';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Hardwares'); 
        $this->loadModel('HardwareRadios');      
        $this->loadModel('Users');   
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'Hardwares'
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

        $this->CommonQuery->build_common_query($query,$user,['Users','HardwareRadios']);
 
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

        $total      = $query->count();       
        $q_r        = $query->all();
        $items      = []; 
        
        $radio_fields = [
            'disabled','hwmode','htmode','txpower','include_beacon_int',
            'beacon_int','include_distance','distance','ht_capab','mesh','ap', 'config',
            'band',
            'mode',
            'width'
        ];
        
        foreach ($q_r as $i) {

            $owner_id = $i->user_id;
            if (!array_key_exists($owner_id, $this->owner_tree)) {
                $owner_tree = $this->Users->find_parents($owner_id);
            } else {
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags = $this->Aa->get_action_flags($owner_id, $user);
              
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
            
            foreach($i->hardware_radios as $hr){
            
                $fs             = $this->{'HardwareRadios'}->schema()->columns();
                $radio_number   = $hr->radio_number;
                foreach($radio_fields as $fr){
                    if($fr == 'disabled'){
                        $row['radio_'.$radio_number.'_enabled'] = !$hr[$fr];
                    }
                    $row['radio_'.$radio_number.'_'.$fr] = $hr[$fr];
                }
            } 
                 
            $row['owner']		= $owner_tree;
			$row['update']		= $action_flags['update'];
			$row['delete']		= $action_flags['delete'];
            array_push($items, $row);
        }
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));
    }
    
    public function apProfilesList(){
    
         //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $this->_commonList($user,'ap');
    }
    
    public function meshesList(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        if(isset($this->request->query['id'])){
            $id = $this->request->query['id'];
            $this->_commonList($user,'mesh',$id);
        }else{
            $this->_commonList($user,'mesh');
        }       
    }
    
    public function advancedSettingsForModel(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $radio_fields = [
            'disabled','hwmode','htmode','txpower','include_beacon_int',
            'beacon_int','include_distance','distance','ht_capab','mesh','ap','config'
        ];
        
        $data   = [];
        
        if(isset($this->request->query['model'])){
            $model = $this->request->query['model'];
            $q_e = $this->{$this->main_model}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
            if($q_e){
                foreach($q_e->hardware_radios as $hr){    
                    $radio_number   = $hr->radio_number;
                    foreach($radio_fields as $fr){
                    
                        if($fr == 'ap'){
                            $data['radio'.$radio_number.'_entry'] = $hr[$fr];
                               
                        }elseif($fr == 'mesh'){
                            $data['radio'.$radio_number.'_mesh'] = $hr[$fr]; 
                              
                        }elseif($fr == 'config'){
                            $data['radio'.$radio_number.'_config'] = $hr[$fr]; 
                              
                        }elseif($fr == 'hwmode'){
                            
                            if($hr[$fr] == '11g'){
                                $data['radio'.$radio_number.'_band'] = '24';
                            }
                            
                            if($hr[$fr] == '11a'){
                                $data['radio'.$radio_number.'_band'] = '5';
                            } 
                            if($hr[$fr] == '11a_ac'){
                                $data['radio'.$radio_number.'_band']   = '5';
                                $data['device_type']                    = 'ac';
                            } 
                              
                        }elseif($fr == 'disabled'){
                            $data['radio'.$radio_number.'_enabled'] = !$hr[$fr];
                        }else{
                            $data['radio'.$radio_number.'_'.$fr] = $hr[$fr];
                        }
                    }  
                }
            } 
        }
           
        $this->set(array(
            'data'          => $data,
            'success'       => true,
            '_serialize'    => array('data','success')
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
			'for_mesh',
			'for_ap',
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
            $entity = $this->{$this->main_model}->get($this->request->data['id']);
            $this->{$this->main_model}->patchEntity($entity, $this->request->data());
        }
              
        if ($this->{$this->main_model}->save($entity)) {
        
            if($type == 'edit'){
                $this->_processRadios(); //Do the radios
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
	
    public function delete(){
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
	
	public function view(){
	    //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $data =[];
        
        if(isset($this->request->query['hardware_id'])){
            $id = $this->request->query['hardware_id'];
            $ent = $this->{'Hardwares'}->find()->where(['Hardwares.id' => $id])->first();
            $data = $ent;
        }
               
        $this->set(array(
            'data'          => $data,
            'success'       => true,
            '_serialize'    => array('data','success')
        ));
	}
	
	public function uploadPhoto($id = null){

        //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.    
        $this->viewBuilder()->layout('ext_file_upload');

        $path_parts         = pathinfo($_FILES['photo']['name']);
        $entity             = $this->{$this->main_model}->get($this->request->data['id']);
        $photo_file_name    = $entity->id.'_'.$entity->fw_id.'.'.$path_parts['extension'];
        $dest               = WWW_ROOT."/img/hardwares/".$photo_file_name;
        $entity->photo_file_name = $photo_file_name;
        
        if($this->{$this->main_model}->save($entity)){
            move_uploaded_file ($_FILES['photo']['tmp_name'] , $dest);
            $json_return['id']                  = $this->request->data['id'];
            $json_return['success']             = true;
            $json_return['photo_file_name']     = $photo_file_name;           
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
                  
            $json_return['errors']      = $a;
            $json_return['message']     = array("message"   => __('Problem uploading photo'));
            $json_return['success']     = false;
        }
        $this->set('json_return',$json_return);
    }
	
	private function _processRadios(){
	
	    $r_c            = $this->request->data['radio_count'];
	    $hardware_id    = $this->request->data['id'];
	    
	    //Remove any entries bigger than the current radio count
	    $q_r = $this->{'HardwareRadios'}
            ->find()
            ->where(['HardwareRadios.hardware_id' => $hardware_id])
            ->all();
        foreach($q_r as $i){
            $this->{'HardwareRadios'}->delete($i);
        }
        
        for ($x = 0; $x < $r_c; $x++){
        
            $data                   = [];
            $data['hardware_id']    = $hardware_id;
            $data['radio_number']   = $x;
            $items = [
                //'hwmode',   'htmode',   
                'txpower',      'include_beacon_int',   'beacon_int',   'include_distance', 
                'distance', 'ht_capab', 'mesh',         'ap',                   'config',       'disabled',
                'band',
                'mode',
                'width'
            ];  
            
             $check_items = [
			    'radio_'.$x.'_ap',
			    'radio_'.$x.'_mesh',
			    'radio_'.$x.'_config',
			    'radio_'.$x.'_include_beacon_int',
			    'radio_'.$x.'_include_distance'
		    ];
            foreach($check_items as $i){
                if(isset($this->request->data[$i])){
                    $this->request->data[$i] = 1;
                }else{
                    $this->request->data[$i] = 0;
                }
            }
            
            foreach($items as $item){
                if(isset($this->request->data['radio_'.$x.'_'.$item])){    
                    $data[$item] = $this->request->data['radio_'.$x.'_'.$item];
                }
            }
            
            $entity = $this->{'HardwareRadios'}->newEntity($data);
            $this->{'HardwareRadios'}->save($entity);  
        }    
	}

  
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'Hardwares'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
    private function _commonList($user,$item = 'mesh',$id = 'fw_id'){
    
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query,$user,['Users','HardwareRadios']);
        
        if($item == 'ap'){
            $query->where(['Hardwares.for_ap' => true]); 
        }else{  
            $query->where(['Hardwares.for_mesh' => true]);      
        }
 
        //===== PAGING (MUST BE LAST) ======
        $limit  = 200;   //Defaults
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

        $total      = $query->count();       
        $q_r        = $query->all();
        $items      = []; 
        
        foreach ($q_r as $i) {
            $row            = [];
            $row['id']      = $i->{$id};
            $row['fw_id']   = $i->fw_id;
            $row['name']    = $i->name;
            $row['radios']  = $i->radio_count;
            $row['vendor']  = $i->vendor;
            $row['model']   = $i->model;
            $row['photo_file_name'] = $i->photo_file_name;
            
            $ac_flag            = false;
            $row['device_type'] = 'n';  
            foreach($i->hardware_radios as $hr){
                if($hr->hwmode == '11a_ac'){
                    $ac_flag = true;
                }  
            }
            
            if($ac_flag){
                $row['device_type'] = 'ac';
            }
            array_push($items, $row);
        }
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));  
    }
    
    
}
