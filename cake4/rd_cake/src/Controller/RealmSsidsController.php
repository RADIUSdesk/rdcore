<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class RealmSsidsController extends AppController{
  
    public $base         = "Access Providers/Controllers/RealmSsids/";   
    protected $owner_tree   = array();
    protected $main_model   = 'RealmSsids';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Realms');
        $this->loadModel('RealmSsids');
        $this->loadModel('RealmPmks');  
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'                     => 'RealmSsids',
            'no_available_to_siblings'  => true,
            'sort_by'                   => 'name'
        ]); 
                
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');  
        $this->loadComponent('Formatter');         
    }
    
    public function cmbIndex(){
    
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];
        $conditions = [];
        
        //The request should also contain the realm_id
        if(isset($req_q['realm_id'])){
            //The cloud_id should match the realm_id
            $realm_id = $req_q['realm_id'];
            $e_rlm  = $this->{'Realms'}->find()->where(['Realms.id' => $realm_id])->first(); 
            if(($e_rlm)&&($e_rlm->cloud_id != $cloud_id)){
                $this->JsonErrors->errorMessage('Action Not Allowed');
                return;  
            }
        }else{
            $this->JsonErrors->errorMessage("Missing realm_id in request");
            return;  
        }
        
        //base conditions
        $conditions = ['RealmSsids.realm_id' => $realm_id];
        $query 	    = $this->{$this->main_model}->find()->where($conditions);      
        
        $sort   = 'name';
        $dir    = 'ASC';   
        $query->order([$sort => $dir]);
        	
        $total  = $query->count();       
        $q_r    = $query->toArray();
        
        array_unshift($q_r,['id' => 0, 'name' => '**ALL SSIDS**']);
                  
        $this->set([
            'items'         => $q_r,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
       
    public function index(){
    
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];
        $conditions = [];
        
        //The request should also contain the realm_id
        if(isset($req_q['realm_id'])){
            //The cloud_id should match the realm_id
            $realm_id = $req_q['realm_id'];
            $e_rlm  = $this->{'Realms'}->find()->where(['Realms.id' => $realm_id])->first(); 
            if(($e_rlm)&&($e_rlm->cloud_id != $cloud_id)){
                $this->JsonErrors->errorMessage('Action Not Allowed');
                return;  
            }
        }else{
            $this->JsonErrors->errorMessage("Missing realm_id in request");
            return;  
        }
        
        //base conditions
        $conditions = ['RealmSsids.realm_id' => $realm_id];
        
        $c_filter = $this->CommonQueryFlat->get_filter_conditions();
        $conditions = array_merge($conditions,$c_filter);      
        $query 	  = $this->{'RealmPmks'}->find()->where($conditions)->contain(['RealmSsids']);      
     
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
        
        $sort   = 'name';
        $dir    = 'ASC';
        $dir    = isset($req_q['dir']) ? $req_q['dir'] : $dir;
        $sort   = isset($req_q['sort']) ? $req_q['sort'] : $sort;
       // $sort   = $this->{$this->main_model}.$sort;
        
        $query->order([$sort => $dir]);
        	
        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){             
            $row       = [];
            $fields    = $this->{'RealmPmks'}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
            }
            $row['realm_ssid_name']  = $i->realm_ssid->name;   
			$row['update']  = true;
			$row['delete']	= true; 
            array_push($items,$row);      
        }
       
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
   
    public function add(){
    
    	$this->set([
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
        $this->_addOrEdit('add');          
    }
    
    public function edit(){ 
        $this->_addOrEdit('edit'); 
    }
     
    private function _addOrEdit($type= 'add') {
    
    	$req_d	= $this->request->getData();  	
       
        if($type == 'add'){ 
            //Unset the ID in the request data (if the call has it though it should not include an ID) 02-Jun-2022
            $add_data = $req_d;
            unset($add_data['id']);                   
            $entity = $this->{$this->main_model}->newEntity($add_data);           
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($req_d['id']);
            $this->{$this->main_model}->patchEntity($entity, $req_d);
        } 
                     
        if ($this->{$this->main_model}->save($entity)) {
              	      
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true); 
        } else {
        
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }
	}
	
    public function menuForGrid(){     
        $menu = $this->GridButtonsFlat->returnButtons(false,'RealmSsids'); 
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true); 
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
        $req_d		= $this->request->getData();

        $user_id   = $user['id'];
        $fail_flag = false;

	    if(isset($req_d['id'])){   //Single item delete     
            $entity     = $this->{$this->main_model}->get($req_d['id']);              
           	$this->{$this->main_model}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);                
              	$this->{$this->main_model}->delete($entity);
            }
        }

        if($fail_flag == true){
            $this->set(array(
                'success'   => false,
                'message'   => __('Could not delete some items'),
            ));
            $this->viewBuilder()->setOption('serialize', true); 
        }else{
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true); 
        }
	}
	
    
}
