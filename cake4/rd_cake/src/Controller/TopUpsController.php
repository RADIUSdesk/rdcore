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
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('TopUps'); 
        $this->loadModel('PermanentUsers');
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'                     => 'TopUps',
            'no_available_to_siblings'  => true,
            'sort_by'                   => 'PermanentUsers.username'
        ]); 
             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');          
    }
    
    public function exportCsv(){
    
    	$req_q      = $this->request->getQuery();

		$cloud_id 	= $req_q['cloud_id'];
        $query 		= $this->{$this->main_model}->find(); 
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['PermanentUsers']);
        
        $q_r  = $query->all();

        //Headings
        $heading_line   = [];
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
    
    public function index(){
    
    	$req_q    	= $this->request->getQuery(); 
        $cloud_id 	= $req_q['cloud_id'];             
        $query 		= $this->{$this->main_model}->find();
        
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['PermanentUsers']);
 
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
        $items  = [];

        foreach($q_r as $i){
                       
            $row       = [];
            $fields    = $this->{$this->main_model}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
            }        
			$row['update']	= true;
			$row['delete']	= true; 
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
    
    	$this->set([
            'success'       => true,
            '_serialize'    => ['success']
        ]);
        $this->_addOrEdit('add');          
    }
    
    public function edit(){ 
        $this->_addOrEdit('edit'); 
    }
     
    private function _addOrEdit($type= 'add') {
    
    	$req_d		= $this->request->getData();      

        //====Check what type it is====
        //---Data---
        if($req_d['type'] == 'data'){
            $multiplier = 1;
            if(isset($req_d['data_unit'])){
                if($req_d['data_unit'] == 'mb'){
                    $multiplier = 1048576; //(1024*1024)
                }
                if($req_d['data_unit'] == 'gb'){
                    $multiplier = 1073741824; //(1024*1024*1024)
                }            
            }
            $req_d['data'] = $req_d['value'] * $multiplier;
        }

        //---Time---
        if($req_d['type'] == 'time'){
            $multiplier = 1;
            if(isset($req_d['time_unit'])){
                if($req_d['time_unit'] == 'minutes'){
                    $multiplier = 60; //(60 seconds = minute)
                }
                if($req_d['time_unit'] == 'hours'){
                    $multiplier = 3600; //(60 seconds * 60 minutes)
                } 
                if($req_d['time_unit'] == 'days'){
                    $multiplier = 86400; //(60 seconds * 60 minutes * 24 Hours)
                }             
            }
            $req_d['time'] = $req_d['value'] * $multiplier;
        }

        //---Days To Use---
        if($req_d['type'] == 'days_to_use'){
            $req_d['days_to_use'] = $req_d['value'];
        }
        //====END Check what type it is====
       
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
      
        $menu = $this->GridButtonsFlat->returnButtons(false,'top_ups'); 
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
