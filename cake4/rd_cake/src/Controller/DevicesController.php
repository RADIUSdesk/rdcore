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

    public function initialize():void{  
        parent::initialize();

        $this->loadModel('Devices'); 
        $this->loadModel('PermanentUsers'); 
        $this->loadModel('Users');
        $this->loadModel('Realms');
        $this->loadModel('Profiles');
        $this->loadModel('DynamicClientMacs');
        $this->loadModel('DynamicClients');
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'     => 'Devices',
            'sort_by'   => 'Devices.name'
        ]); 
        
         $this->loadComponent('JsonErrors'); 
         $this->loadComponent('TimeCalculations');          
    }

    public function exportCsv(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

      	$req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];     
        $query 	  = $this->{$this->main_model}->find();       
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['PermanentUsers']);    
        $q_r      = $query->all();
        
        //Headings
        $heading_line   = array();
        $req_q    		= $this->request->getQuery();
        if(isset($req_q['columns'])){
            $columns = json_decode($req_q['columns']);
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
            if(isset($req_q['columns'])){
                $columns = json_decode($req_q['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    if($column_name =='permanent_user'){
                        $permanent_user= $i->permanent_user->username;
                        array_push($csv_line,$permanent_user); 
                    }else{
                        array_push($csv_line,$i->{$column_name});  
                    }
                }
                array_push($data,$csv_line);
            }
        }
        
        $this->setResponse($this->getResponse()->withDownload('Devices.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        
        $this->set([
            'data'   => $data
        ]);     
        $this->viewBuilder()->setOption('serialize', true);
    } 

    public function index(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
       
        $query 		= $this->{$this->main_model}->find();    
        $req_q    	= $this->request->getQuery();
        $cloud_id 	= $req_q['cloud_id'];
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['PermanentUsers']); 

        
        //This is to list devices owned by a specific permanent user
        if(isset($req_q['permanent_user_id'])){
            $query->where(['permanent_user_id' => $req_q['permanent_user_id']]);
        }
 
        $limit  = 50;
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
        $items  = array();
        
        foreach($q_r as $i){           
            $row            = array();
            $fields         = $this->{$this->main_model}->getSchema()->columns();
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
            $row["permanent_user"]  = $i->permanent_user->username;               
            $row['update']	        = true;
			$row['delete']	        = true; 
            
            array_push($items,$row);      
        }
       
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
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
         
        //---Set Realm related things---
         //Get the device's owner's username
        $req_d  = $this->request->getData();
        if(isset($req_d['permanent_user_id'])){
            $q_r = $this->{'PermanentUsers'}->get($req_d['permanent_user_id'], [
                'contain' => ['Realms']
            ]);
            if($q_r){
               $req_d['rd_device_owner'] = $q_r->username;
               $req_d['realm']   = $q_r->realm;
               $req_d['realm_id']= $q_r->realm_id;

                //Test to see if we need to auto-add a suffix
                $suffix         = $q_r->real_realm->suffix; 
                $suffix_devices = $q_r->real_realm->suffix_devices;
                if(($suffix != '')&&($suffix_devices)){
                    $req_d['name'] = $req_d['name'].'@'.$suffix;
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
        $profile_entity = $this->Profiles->entityBasedOnPost($req_d);
        if($profile_entity){
            $req_d['profile']   = $profile_entity->name;
            $req_d['profile_id']= $profile_entity->id;
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
            if(isset($req_d[$d])){
                $newDate = date_create_from_format('m/d/Y', $req_d[$d]);
                $req_d[$d] = $newDate;
            }  
        }
        
        $check_items = [
			'active',
			'dynamic_client_mac'
		];

        foreach($check_items as $i){
            if(isset($req_d[$i])){
                $req_d[$i] = 1;
            }else{
                $req_d[$i] = 0;
            }
        }

        $req_d['name'] = strtolower($req_d['name']);
 
        //The rest of the attributes should be same as the form..
        $entity = $this->{$this->main_model}->newEntity($req_d);
         
        if($this->{$this->main_model}->save($entity)){
        	
        	if($req_d['dynamic_client_mac'] == 1){
        		$cloud_id = $req_d['cloud_id'];      	
        		$list_dcm = $this->{'DynamicClientMacs'}->find()->where(['DynamicClients.cloud_id' =>$cloud_id, 'ClientMacs.mac'=> $req_d['name']])->contain(['ClientMacs','DynamicClients'])->all();
        		foreach($list_dcm as $dcm){
        			$this->{'DynamicClientMacs'}->delete($dcm);
        		}        	
        	}        	      
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }      
    }

   	public function delete() {
   	
   		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
   	
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		$req_d  = $this->request->getData();
	    if(isset($req_d['id'])){   //Single item delete
	           
            $entity     = $this->{$this->main_model}->get($req_d['id'], [
                'contain' => ['PermanentUsers']
            ]);   
            $cloud_id   = $entity->permanent_user->cloud_id; //FIXME FOR CLOUD PERMISSION           
            $this->{$this->main_model}->delete($entity);
   
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id'],[
                    'contain' => ['PermanentUsers']
                ]);  
                $cloud_id   = $entity->permanent_user->cloud_id; //FIXME FOR CLOUD PERMISSION                  
              	$this->{$this->main_model}->delete($entity);
            }
        }
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}

    public function enableDisable(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

		$req_d  = $this->request->getData();
        $rb     = $req_d['rb'];
        $d     	= [];

        if($rb == 'enable'){
            $d['active'] = 1;
        }else{
            $d['active'] = 0;
        }

        foreach(array_keys($req_d) as $key){
            if(preg_match('/^\d+/',$key)){
                $entity = $this->{$this->main_model}->get($key);
                $this->{$this->main_model}->patchEntity($entity, $d);
                $this->{$this->main_model}->save($entity);
            }
        }
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

     public function privateAttrIndex(){
     
     	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
       
        $username   = $this->request->getQuery('username');
        $items      =  $this->{$this->main_model}->privateAttrIndex($username);

        $this->set([
            'items'         => $items,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

     public function viewBasicInfo(){
     
     	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $id 		= $this->request->getQuery('device_id');

        $entity     = $this->{$this->main_model}->find()->where(['Devices.id' => $id])->contain(['PermanentUsers','Profiles'])->first();
        $username   = $entity->username;

        //List these items
        $include_items = [
            'description', 'permanent_user_id',
            'profile','profile_id','time_cap_type',
            'data_cap_type', 'from_date','to_date', 'id' 
        ];

        $items = [];
        foreach($include_items as $i){
            $items[$i] = $entity->{$i};
        }
        if($entity->real_profile){
        	$items['profile_name'] = $entity->real_profile->name;	
        }
        if($entity->permanent_user){
        	$items['permanent_user_username'] = $entity->permanent_user->username;	
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


        $this->set([
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function editBasicInfo(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
    	$req_d  = $this->request->getData(); 
        
        //---Set profile related things---
        $profile_entity = $this->Profiles->entityBasedOnPost($req_d);
        if($profile_entity){
            $req_d['profile']   = $profile_entity->name;
            $req_d['profile_id']= $profile_entity->id;
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
            if(isset($req_d[$d])){
                $newDate = date_create_from_format('m/d/Y', $req_d[$d]);
                $req_d[$d] = $newDate;
            }  
        }
        
        $entity = $this->{$this->main_model}->get($req_d['id']);
        $this->{$this->main_model}->patchEntity($entity, $req_d);
     
        if ($this->{$this->main_model}->save($entity)) {
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
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
    
    	$req_d  = $this->request->getData();
      
        $entity =  $this->{$this->main_model}->privateAttrAdd($this->request);
        $errors = $entity->getErrors();
        if($errors){
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }else{        
            $req_d['id'] = $entity->id;
            $this->set(array(
                'items'     => $req_d,
                'success'   => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
    }

    public function privateAttrEdit(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
    	$req_d  = $this->request->getData();

        $entity =  $this->{$this->main_model}->privateAttrEdit($this->request);    
        $errors = $entity->getErrors();
        if($errors){
            $message = __('Could not edit item');
            $this->JsonErrors->entityErros($entity,$message);
        }else{        
            $req_d['id'] = $entity->id;
            $this->set(array(
                'items'     => $req_d,
                'success'   => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
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
                'success'   => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
    }

    public function menuForGrid(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'devices');
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }

    function menuForAccountingData(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
       $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'fr_acct_and_auth');
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }

    function menuForAuthenticationData(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
       $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'fr_acct_and_auth');
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
}

?>
