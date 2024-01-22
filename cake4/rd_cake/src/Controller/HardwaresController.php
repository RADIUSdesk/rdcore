<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 20/JUL/2022
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
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Hardwares'); 
        $this->loadModel('HardwareRadios');      
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'Hardwares'
        ]);      
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');    
    }
    
     //____ BASIC CRUD Manager ________
    public function index(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

		$req_q    = $this->request->getQuery();    
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();//->where(['OR' =>['Hardwares.cloud_id' => -1]])->contain(['HardwareRadios']);

        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,['HardwareRadios']);

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

        $total      = $query->count();       
        $q_r        = $query->all();
        $items      = []; 
        
        $radio_fields = [
            'disabled','hwmode','htmode','txpower','include_beacon_int',
            'beacon_int','include_distance','distance','ht_capab','mesh','ap', 'config',
            'band',
            'mode',
            'width',
            'cell_density'
        ];
        
        foreach ($q_r as $i) {
           
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
            
            foreach($i->hardware_radios as $hr){
            
                $fs             = $this->{'HardwareRadios'}->getSchema()->columns();
                $radio_number   = $hr->radio_number;
                foreach($radio_fields as $fr){
                    if($fr == 'disabled'){
                        $row['radio_'.$radio_number.'_enabled'] = !$hr[$fr];
                    }
                    $row['radio_'.$radio_number.'_'.$fr] = $hr[$fr];
                }
            }
            
            $row['for_system'] = false;
            if($i->cloud_id == -1){
            	$row['for_system'] = true;
            } 
                 
			$row['update']		= true;
			$row['delete']		= true;
            array_push($items, $row);
        }
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function apProfilesList(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        } 
          
      	$cloud_id = $this->request->getQuery('cloud_id');
        $this->_commonList($cloud_id,'ap');
    }
    
    public function meshesList(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
           
    	$req_q    = $this->request->getQuery();
        $cloud_id = $req_q['cloud_id'];
        if(isset($req_q['id'])){
            $id = $req_q['id'];
            $this->_commonList($cloud_id,'mesh',$id);
        }else{
            $this->_commonList($cloud_id,'mesh');
        }       
    }
     
    public function add(){  
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }    
        $this->_addOrEdit('add');    
    }
    
    public function edit(){
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        //If cloud_id = -1 and the user is not root ...reject the action
        if($user['group_name'] == Configure::read('group.ap')){
        	$e_check = $this->{$this->main_model}->find()->where(['Hardwares.id' => $this->request->getData('id')])->first();
        	if($e_check){       
		    	if($e_check->cloud_id == -1){
		    		$this->set([
						'message' 	=> 'Not enough rights for action',
						'success'	=> false
					]);
					$this->viewBuilder()->setOption('serialize', true);
					return;
		    	}
		  	}
        }    
        $this->_addOrEdit('edit');    
    }
    
    private function _addOrEdit($type= 'add') {

    	$req_d	  = $this->request->getData();
        $check_items = [
			'for_mesh',
			'for_ap',
			'for_system'
		];
        foreach($check_items as $i){
            if(isset($req_d[$i])){
                $req_d[$i] = 1;
            }else{
                $req_d[$i] = 0;
            }
        }
        
        if($req_d['for_system'] == 1){
        	$req_d['cloud_id'] = -1;
        }else{
        	$req_d['cloud_id'] = $this->request->getData('cloud_id');
        }
             
        if($type == 'add'){ 
           $entity = $this->{$this->main_model}->newEntity($req_d);
        }      
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($req_d['id']);
            $this->{$this->main_model}->patchEntity($entity, $req_d);
        }
              
        if ($this->{$this->main_model}->save($entity)) {       
            if($type == 'edit'){
                $this->_processRadios(); //Do the radios
            }         
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
	}
	
    public function delete(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
    
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$req_d		= $this->request->getData();	
		$ap_flag 	= true;		
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}
        
	    if(isset($req_d['id'])){   
            $entity     = $this->{$this->main_model}->get($req_d['id']);          
            if(($entity->cloud_id == -1)&&($ap_flag == true)){
	    		$this->set([
					'message' 	=> 'Not enough rights for action',
					'success'	=> false
				]);
				$this->viewBuilder()->setOption('serialize', true);
				return;
	    	}          
            $this->{$this->main_model}->delete($entity);

        }else{ 
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);
                if(($entity->cloud_id == -1)&&($ap_flag == true)){
					$this->set([
							'message' 	=> 'Not enough rights for action',
							'success'	=> false
						]);
						$this->viewBuilder()->setOption('serialize', true);
					return;
				}      
                $this->{$this->main_model}->delete($entity);
            }
        }
 
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function view(){
	
		$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        } 
       
        $data 		= []; 
        $req_q		= $this->request->getQuery();    
        if(isset($req_q['hardware_id'])){
            $id 	= $req_q['hardware_id'];
            $ent 	= $this->{'Hardwares'}->find()->where(['Hardwares.id' => $id])->first();
            $data 	= $ent;
        }
               
        $this->set([
            'data'          => $data,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function uploadPhoto($id = null){
	
		$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        } 
	
		$ap_flag 	= true;		
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}

        //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.    
        $this->viewBuilder()->setLayout('ext_file_upload');

        $path_parts         = pathinfo($_FILES['photo']['name']);
        $entity             = $this->{$this->main_model}->get($this->request->getData('id'));
        
        //Refuse for system-wide and Access Provider
        if(($entity->cloud_id == -1)&&($ap_flag == true)){
			$this->set([
					'message' 	=> 'Not enough rights for action',
					'success'	=> false
				]);
			$this->viewBuilder()->setOption('serialize', true);
			return;
		}      
        
        
        $photo_file_name    = $entity->id.'_'.$entity->fw_id.'.'.$path_parts['extension'];
        $dest               = WWW_ROOT."/img/hardwares/".$photo_file_name;
        $entity->photo_file_name = $photo_file_name;
        
        if($this->{$this->main_model}->save($entity)){
            move_uploaded_file ($_FILES['photo']['tmp_name'] , $dest);                      
            $this->set([
		        'success' 			=> true,
		        'id'      			=> $this->request->getData('id'),
		        'photo_file_name'	=> $photo_file_name
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);            
                      
        }else{       
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
		        'errors' 	=> $a,
		        'message' 	=> __('Problem uploading photo'),
		        'success'	=> false,
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);
        }
    }
	
	private function _processRadios(){
	
		$req_d			= $this->request->getData();
	
	    $r_c            = $req_d['radio_count'];
	    $hardware_id    = $req_d['id'];
	    
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
                'width',
                'cell_density'
            ];  
            
             $check_items = [
			    'radio_'.$x.'_ap',
			    'radio_'.$x.'_mesh',
			    'radio_'.$x.'_config',
			    'radio_'.$x.'_include_beacon_int',
			    'radio_'.$x.'_include_distance'
		    ];
            foreach($check_items as $i){
                if(isset($req_d[$i])){
                    $req_d[$i] = 1;
                }else{
                    $req_d[$i] = 0;
                }
            }
            
            foreach($items as $item){
                if(isset($req_d['radio_'.$x.'_'.$item])){    
                    $data[$item] = $req_d['radio_'.$x.'_'.$item];
                }
            }
            
            $entity = $this->{'HardwareRadios'}->newEntity($data);
            $this->{'HardwareRadios'}->save($entity);  
        }    
	}
 
    public function menuForGrid(){
        $menu = $this->GridButtonsFlat->returnButtons(false, 'Hardwares'); 
        $this->set([
            'items' => $menu,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    private function _commonList($cloud_id,$item = 'mesh',$id = 'fw_id'){
    
        $query      = $this->{$this->main_model}->find();
        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,['HardwareRadios']);
        $req_q      = $this->request->getQuery();
        
        if($item == 'ap'){
            $query->where(['Hardwares.for_ap' => true]); 
        }else{  
            $query->where(['Hardwares.for_mesh' => true]);      
        }
 
        //===== PAGING (MUST BE LAST) ======
        $limit  = 200;   //Defaults
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
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);  
    }
       
}
