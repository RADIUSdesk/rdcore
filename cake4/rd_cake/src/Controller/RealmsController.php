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
        $this->loadModel('NaRealms');
        $this->loadModel('Nas');
           
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'Realms'
        ]);    
        $this->loadComponent('TimeCalculations');
        
        $this->loadComponent('IspPlumbing');    
    }
    
     public function indexCloud(){   
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $req_q    = $this->request->getQuery(); //q_data is the query data 
        $items    = [];
        
        if(isset($req_q['all_option'])&&($req_q['all_option']==='true')){
             array_push($items,
                [
                    'id'  	=> 0, 
                    'name'  => '** ALL REALMS **'
                ]
            );       
        }
        if(isset($req_q['settings_cloud_id'])){ //Override for settings Window
       		$cloud_id  = $req_q['settings_cloud_id'];
       	}else{
       		$cloud_id = $req_q['cloud_id'];
       	}   	
       	      	   	   	
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);
        $q_r        = $query->all();     
        
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
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function exportCsv(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }       
        $req_q    	= $this->request->getQuery(); //q_data is the query data      
       	$cloud_id 	= $req_q['cloud_id'];
        
        $query = $this->{$this->main_model}->find(); 
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);
        
        $q_r    = $query->all();

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

            $columns    = [];
            $csv_line   = [];
            if(isset($req_q['columns'])){
                $columns = json_decode($req_q['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    array_push($csv_line,$i->{$column_name});  
                }
                array_push($data,$csv_line);
            }
        }
        
        $this->setResponse($this->getResponse()->withDownload('Realms.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(['data' => $data]);   
        $this->viewBuilder()->setOption('serialize', true);  
        
    } 

	public function index(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
    
    	$req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);
        
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
            'metaData'		=> [
            	'total'	=> $total
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function add(){
    	$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $this->_addOrEdit('add');   
    }
    
    public function edit(){
    	$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $this->_addOrEdit('edit');      
    }
     
    private function _addOrEdit($type= 'add') {
    
    	$req_d		= $this->request->getData();
        $check_items = [
			'suffix_permanent_users',
			'suffix_vouchers',
            'suffix_devices'
		];
		
        foreach($check_items as $i){
            if(isset($req_d[$i])){
            	if($req_d[$i] == 'null'){
                	$req_d[$i] = 0;
                }else{
                	$req_d[$i] = 1;
                }  
            }else{
                $req_d[$i] = 0;
            }
        }
       
        if($type == 'add'){ 
            $entity = $this->{$this->main_model}->newEntity($req_d);
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($this->request->getData('id'));
            $this->{$this->main_model}->patchEntity($entity, $req_d);
        }
              
        if ($this->{$this->main_model}->save($entity)) {
        
        	$this->IspPlumbing->realmAddEdit($entity);
            $this->set([
                'success' 	=> true,
                'data'		=> $entity
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = 'Error';           
            $errors = $entity->getErrors();
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
                'message'   => __('Could not create item'),
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }
	}
	
	public function view(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
	      
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
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
	
    public function menuForGrid(){
    
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
         
        $menu = $this->GridButtonsFlat->returnButtons(false,'realms'); //No "Action" title basic refresh/add/delete/edit
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
 
    public function delete($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
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
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function uploadLogo($id = null){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

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
		        'icon_file_name'	=> $icon_file_name
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);                
            
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
		        'message' 	=> __('Problem uploading photo'),
		        'success'	=> false
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);
                        
        }      
    }    
    
    public function listRealmsForDynamicClientCloud(){
    
    	$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
    
    	$req_q      = $this->request->getQuery();   
    	$cloud_id 	= $req_q['cloud_id'];
        $query 	  	= $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['DynamicClientRealms']);
        $q_r 		= $query->all();       
        $items 		= [];
        
        $dynamic_client_id = false;
        if(isset($req_q['dynamic_client_id'])){
        	$dynamic_client_id = $req_q['dynamic_client_id'];
        }
        
        //========== CLEAR FIRST CHECK =======
        //By default clear_flag is not included
        $clear_flag = false;
        if(isset($req_q['clear_flag'])){
            if($req_q['clear_flag'] == 'true'){
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
            'success'   	=> true
        ]); 
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
    public function viewRealmsForDynamicClient(){
    
    	$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $req_q    	= $this->request->getQuery();    
        $a_to_all 	= true;        
        $e_list 	= $this->DynamicClientRealms->find()->where(['DynamicClientRealms.dynamic_client_id' => $req_q['dynamic_client_id']])->all();    
        $realms 	= [];
        
        foreach($e_list as $e){
        	array_push($realms,$e->realm_id);
        	$a_to_all = false;
        }
    
    	$data = [
    		'available_to_all'  => $a_to_all,
    		'realms'			=> $realms
    	];
    
    	 $this->set([
            'data'     		=> $data,
            'success'   	=> true
        ]); 
        $this->viewBuilder()->setOption('serialize', true);   
    }
    
    public function editRealmsForDynamicClient(){
    
    	if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
    
    	$req_d	  = $this->request->getData();
    	
    	if(isset($req_d['available_to_all'])){
    		if($req_d['available_to_all'] !== 'null'){
    			$this->DynamicClientRealms->deleteAll(['DynamicClientRealms.dynamic_client_id' => $this->request->getData('id')]);	
    		}   	
    	}
    	
    	if(isset($req_d['realms'])){   	
    		$this->DynamicClientRealms->deleteAll(['DynamicClientRealms.dynamic_client_id' => $this->request->getData('id')]);	//Clear the old ones	
    		if(str_contains($req_d['realms'], ',')) {		
				foreach(explode(',',$req_d['realms']) as $realm_id){
					$entity = $this->DynamicClientRealms->newEmptyEntity();
		            $entity->dynamic_client_id = $this->request->getData('id');
		            $entity->realm_id =  $realm_id;
		            $this->DynamicClientRealms->save($entity);
				}
			}else{
				$entity = $this->DynamicClientRealms->newEmptyEntity();
	            $entity->dynamic_client_id = $this->request->getData('id');
	            $entity->realm_id =  $req_d['realms'];
	            $this->DynamicClientRealms->save($entity);	
			}  	
    	}
    	   
    	 $this->set([
            'data'     		=> $req_d,
            'success'   	=> true
        ]); 
        $this->viewBuilder()->setOption('serialize', true);   
    }
    
    
    public function updateDynamicClientRealm(){
     
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
		
		$req_q    = $this->request->getQuery();
		$req_d	  = $this->request->getData();

        if((isset($req_q['dynamic_client_id']))&&($req_q['dynamic_client_id'] !== '')){
            $dynamic_client_id     = $req_q['dynamic_client_id'];
	        if(isset($req_d['id'])){   //Single item select
                $realm_id   = $req_d['id'];
                if($req_d['selected']){
                    $entity = $this->DynamicClientRealms->newEmptyEntity();
                    $entity->dynamic_client_id = $dynamic_client_id;
                    $entity->realm_id =  $realm_id;
                    $this->DynamicClientRealms->save($entity);
                }else{
                    $this->DynamicClientRealms->deleteAll(
                        ['DynamicClientRealms.dynamic_client_id' => $dynamic_client_id,'DynamicClientRealms.realm_id' => $realm_id]
                    );        
                }
            }else{                          //Assume multiple item select
                foreach($req_d as $d){
                    if(isset($d['id'])){   //Single item select
                        $realm_id   = $d['id'];
                        if($d['selected']){
                            $entity = $this->DynamicClientRealms->newEmptyEntity();
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
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function listRealmsForNasCloud(){
    
    	$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
    
    	$req_q      = $this->request->getQuery();   
    	$cloud_id 	= $req_q['cloud_id'];
        $query 	  	= $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['NaRealms']);
        $q_r 		= $query->all();       
        $items 		= [];
        
        $na_id = false;
        if(isset($req_q['na_id'])){
        	$na_id = $req_q['na_id'];
        }
        
        //========== CLEAR FIRST CHECK =======
        //By default clear_flag is not included
        $clear_flag = false;
        if(isset($req_q['clear_flag'])){
            if($req_q['clear_flag'] == 'true'){
                $clear_flag = true;
            }
        }

        if($clear_flag){    //If we first need to remove previous associations!        
        	//if the cloud_id of the na_id (nas) is -1 (System Wide) and we are not root; do not clear it!
        	$ent_nas = $this->{'Nas'}->find()->where(['Nas.id' => $na_id])->first();
        	if($ent_nas){
        		//System Wide we do a bit different
        		if($ent_nas->cloud_id == -1){
        			if($user['group_name'] == Configure::read('group.ap')){
		    				$this->set([
							'message' 	=> 'Not enough rights for action',
							'success'	=> false
						]);
						$this->viewBuilder()->setOption('serialize', true);
						return;	
        			}
        			//If it is System Wide ONLY remove Realms with the selected cloud_id 
        			$realm_list = $this->{'Realms'}->find()->where(['Realms.cloud_id' => $cloud_id])->all();
        			$or_realms = [];
        			foreach($realm_list as $r){
        				array_push($or_realms, ['NaRealms.realm_id' => $r->id]);
        			}
        			$this->NaRealms->deleteAll(['OR' =>$or_realms]);      			
        		}else{
        			$this->NaRealms->deleteAll(['NaRealms.na_id' => $na_id]); //If it fails the -1 and group.ap test it will never reach here        		
        		}
        	}       
            
        }
        //========== END CLEAR FIRST CHECK =======
        
        
        foreach ($q_r as $i) {
        	$selected = false;
            if($na_id){
            	foreach($i->na_realms as $nr){
                    if($nr->na_id == $na_id){
                        $selected = true;
                    }
                }
            }   
                       
        	$item = [ 'id' => $i->id, 'name' => $i->name,'selected' => $selected];          
        	array_push($items,$item);    
        }
        
        $this->set([
            'items'     	=> $items,
            'success'   	=> true
        ]); 
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
    public function updateNasRealm(){
     
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
		
		$req_q    = $this->request->getQuery();
		$req_d	  = $this->request->getData();

        if((isset($req_q['na_id']))&&($req_q['na_id'] !== '')){
            $na_id     = $req_q['na_id'];
	        if(isset($req_d['id'])){   //Single item select
                $realm_id   = $req_d['id'];
                if($req_d['selected']){
                    $entity 		= $this->NaRealms->newEmptyEntity();
                    $entity->na_id 	= $na_id;
                    $entity->realm_id =  $realm_id;
                    $this->NaRealms->save($entity);
                }else{
                    $this->NaRealms->deleteAll(
                        ['NaRealms.na_id' => $na_id,'NaRealms.realm_id' => $realm_id]
                    );        
                }
            }else{                          //Assume multiple item select
                foreach($req_d as $d){
                    if(isset($d['id'])){   //Single item select
                        $realm_id   = $d['id'];
                        if($d['selected']){
                            $entity = $this->NaRealms->newEmptyEntity();
                            $entity->na_id = $na_id;
                            $entity->realm_id =  $realm_id;
                            $this->NaRealms->save($entity);
                        }else{
                            $this->NaRealms->deleteAll(
                                ['NaRealms.na_id' => $na_id,'NaRealms.realm_id' => $realm_id]
                            );        
                        }
                    }
                }
            }
        }
        
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }                    
}
