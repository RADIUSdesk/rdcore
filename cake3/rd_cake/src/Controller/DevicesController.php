<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class DevicesController extends AppController{

    public $base         = "Access Providers/Controllers/Devices/";
    protected $owner_tree   = array();
    protected $main_model   = 'Devices';

    public function initialize(){  
        parent::initialize();

        $this->loadModel('Devices'); 
        $this->loadModel('PermanentUsers'); 
        $this->loadModel('Users');
        $this->loadModel('Realms');
        $this->loadModel('Profiles');
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'     => 'Devices',
            'sort_by'   => 'Devices.name'
        ]); 
        
        $this->loadComponent('Notes', [
            'model'     => 'DeviceNotes',
            'condition' => 'device_id'
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
        
        if($this->CommonQuery->build_with_realm_query($query,$user,['PermanentUsers','DeviceNotes' => ['Notes']]) == false){
            //FIXME Later we can redirect to an error page for CSV
            return;
        }
        
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
                    if($column_name == 'notes'){
                        $notes   = '';
                        foreach($i->device_notes as $un){
                            if(!$this->Aa->test_for_private_parent($un->note,$user)){
                                $notes = $notes.'['.$un->note->note.']';    
                            }
                        }
                        array_push($csv_line,$notes);
                    }elseif($column_name =='permanent_user'){
                        $permanent_user= $i->permanent_user->username;
                        array_push($csv_line,$permanent_user); 
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
        if($this->CommonQuery->build_with_realm_query($query,$user,['PermanentUsers','DeviceNotes' => ['Notes']],'name','Devices') == false){
            return;
        }
        

        //This is to list devices owned by a specific permanent user
        if(isset($this->request->query['permanent_user_id'])){
            $query->where(['permanent_user_id' => $this->request->query['permanent_user_id']]);
        }
 
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
            $row            = array();
            $fields         = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'last_accept_time'){
                    if($i->{"$field"}){
                        $row['last_accept_time_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                    }else{
                        $row['last_accept_time_in_words'] = __("Never");
                    }
                } 
                if($field == 'last_reject_time'){
                    if($i->{"$field"}){
                        $row['last_reject_time_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                    }else{
                        $row['last_reject_time_in_words'] = __("Never");
                    }
                }        
                
            }
            
            $action_flags           = $this->Aa->get_action_flags($i->permanent_user->user_id,$user);  
            

            $notes_flag     = false;
            foreach($i->device_notes as $pun){
                if(!$this->Aa->test_for_private_parent($pun->note,$user)){
                    $notes_flag = true;
                    break;
                }
            }

            $row["permanent_user"]  = $i->permanent_user->username;               
            $row['notes']           = $notes_flag;
            $row['update']	        = $action_flags['update'];
			$row['delete']	        = $action_flags['delete']; 
            

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
             
        //---Set Realm related things---
         //Get the device's owner's username
        if(isset($this->request->data['permanent_user_id'])){
            $q_r = $this->{'PermanentUsers'}->get($this->request->data['permanent_user_id'], [
                'contain' => ['Realms']
            ]);
            if($q_r){
               $this->request->data['rd_device_owner'] = $q_r->username;
               $this->request->data['realm']   = $q_r->realm;
               $this->request->data['realm_id']= $q_r->realm_id;

                //Test to see if we need to auto-add a suffix
                $suffix         = $q_r->real_realm->suffix; 
                $suffix_devices = $q_r->real_realm->suffix_devices;
                if(($suffix != '')&&($suffix_devices)){
                    $this->request->data['name'] = $this->request->data['name'].'@'.$suffix;
                }

            }else{
                $this->JsonErrors->errorMessage('Valid value for permanent_use_id required');
                return;
            }
        }else{
            $this->JsonErrors->errorMessage('Value for pemanent_user_id missing');
            return;
        }
        
        //---Set profile related things---
        $profile_entity = $this->Profiles->entityBasedOnPost($this->request->data);
        if($profile_entity){
            $this->request->data['profile']   = $profile_entity->name;
            $this->request->data['profile_id']= $profile_entity->id;
        }else{
            $this->JsonErrors->errorMessage('profile or profile_id not found in DB or not supplied');
            return;
        }
        
       
        //Set the date and time
        $extDateSelects = [
                'from_date',
                'to_date'
        ];
        foreach($extDateSelects as $d){
            if(isset($this->request->data[$d])){
                $newDate = date_create_from_format('m/d/Y', $this->request->data[$d]);
                $this->request->data[$d] = $newDate;
            }  
        }
        
        $check_items = array(
			'active'
		);

        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }

        $this->request->data['name'] = strtolower($this->request->data['name']);
 
        //The rest of the attributes should be same as the form..
        $entity = $this->{$this->main_model}->newEntity($this->request->data());
         
        if($this->{$this->main_model}->save($entity)){
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }      
    }

     public function delete() {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id   = $user['id'];
        $fail_flag = false;

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($this->request->data['id'], [
                'contain' => ['PermanentUsers']
            ]);   
            $owner_id   = $entity->permanent_user->user_id;
            
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
                $entity     = $this->{$this->main_model}->get($d['id'],[
                    'contain' => ['PermanentUsers']
                ]);  
                $owner_id   = $entity->permanent_user->user_id;
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
            $message = __('Could not delete some items');
            $this->JsonErrors->errorMessage($message);
        }else{
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }
	}


    public function enableDisable(){
        
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $rb         = $this->request->data['rb'];
        $d          = array();

        if($rb == 'enable'){
            $d['active'] = 1;
        }else{
            $d['active'] = 0;
        }

        foreach(array_keys($this->request->data) as $key){
            if(preg_match('/^\d+/',$key)){
                $entity = $this->{$this->main_model}->get($key);
                $this->{$this->main_model}->patchEntity($entity, $d);
                $this->{$this->main_model}->save($entity);
            }
        }

        $this->set(array(
            'success' => true,
            '_serialize' => array('success',)
        ));
    }

     public function privateAttrIndex(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $username   = $this->request->query['username'];
        $items      =  $this->{$this->main_model}->privateAttrIndex($username);

        $this->set(array(
            'items'         => $items,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

     public function viewBasicInfo(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $entity     = $this->{$this->main_model}->get( $this->request->query['device_id']);
        $username   = $entity->username;

        //List these items
        $include_items = [
            'description', 'permanent_user_id',
            'profile','profile_id','time_cap_type',
            'data_cap_type', 'from_date','to_date' 
        ];

        $items = [];
        foreach($include_items as $i){
            $items[$i] = $entity->{$i};
        }
        $items['user_id'] = $entity->permanent_user_id;

        if(($items['from_date'] == null)&&($items['to_date'] == null)){
            $items['always_active'] = true;
            unset($items['from_date']);
            unset($items['to_date']);

        }else{
             $items['always_active'] = false;
             $items['from_date']    = $items['from_date']->format("m/d/Y");
             $items['to_date']      = $items['to_date']->format("m/d/Y");
        }


        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    public function editBasicInfo(){ 
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        //---Set profile related things---
        $profile_entity = $this->Profiles->entityBasedOnPost($this->request->data);
        if($profile_entity){
            $this->request->data['profile']   = $profile_entity->name;
            $this->request->data['profile_id']= $profile_entity->id;
        }else{
            $message = __('profile or profile_id not found in DB or not supplied');
            $this->JsonErrors->errorMessage($message);
            return;
        }
        
        //Set the date and time
        $extDateSelects = [
                'from_date',
                'to_date'
        ];
        foreach($extDateSelects as $d){
            if(isset($this->request->data[$d])){
                $newDate = date_create_from_format('m/d/Y', $this->request->data[$d]);
                $this->request->data[$d] = $newDate;
            }  
        }
        
        $entity = $this->{$this->main_model}->get($this->request->data['id']);
        $this->{$this->main_model}->patchEntity($entity, $this->request->data());
     
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

    public function privateAttrAdd(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $entity =  $this->{$this->main_model}->privateAttrAdd($this->request);
        $errors = $entity->errors();
        if($errors){
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }else{        
            $this->request->data['id'] = $entity->id;
            $this->set(array(
                'items'     => $this->request->data,
                'success'   => true,
                '_serialize' => array('success','items')
            ));
        }
    }

    public function privateAttrEdit(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $entity =  $this->{$this->main_model}->privateAttrEdit($this->request);    
        $errors = $entity->errors();
        if($errors){
            $message = __('Could not edit item');
            $this->JsonErrors->entityErros($entity,$message);
        }else{        
            $this->request->data['id'] = $entity->id;
            $this->set(array(
                'items'     => $this->request->data,
                'success'   => true,
                '_serialize' => array('success','items')
            ));
        }
    }

    public function privateAttrDelete(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        if($this->{$this->main_model}->privateAttrDelete($this->request)){
            $message = __('Could not delete some items');
            $this->JsonErrors->errorMessage($message);  
        }else{
            $this->set(array(
                'success'   => true,
                '_serialize' => array('success')
            ));
        }
    }



    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtons->returnButtons($user,false,'devices');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    function menuForAccountingData(){

       $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtons->returnButtons($user,false,'fr_acct_and_auth');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    function menuForAuthenticationData(){

       $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtons->returnButtons($user,false,'fr_acct_and_auth');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

     	
    public function noteIndex(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $items = $this->Notes->index($user); 
    }
    
    public function noteAdd(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }   
        $this->Notes->add($user);
    }
    
    public function noteDel(){  
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->Notes->del($user);
    }  
}

?>
