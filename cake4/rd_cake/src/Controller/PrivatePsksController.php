<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 03/05/2024
 * Time: 00:00
 */
 

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class PrivatePsksController extends AppController{
  
    public $base            = "Access Providers/Controllers/PrivatePsks/";
    protected $owner_tree   = [];
    protected $main_model   = 'PrivatePsks';

    
    public function initialize():void{ 
        parent::initialize();
        
        $this->loadModel('PrivatePsks'); 
        $this->loadModel('PrivatePskEntries');      
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'PrivatePskEntries'
        ]);             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');    
    }
    
     //____ BASIC CRUD Manager ________
     
     
    public function indexCombo(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
      
        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();
                  
        $query->where(['OR'=>[["cloud_id" => -1],["cloud_id" => $cloud_id]]]);


        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($req_q['limit'])) {
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
        
        if(isset($req_q['include_all_option'])){
		    if($req_q['include_all_option'] == true){
		    	array_push($items, ['id' => 0,'name' => '**All PPSK Groups**']);      
		    }
		}

        foreach ($q_r as $i) {
	        array_push($items, ['id' => $i->id,'name' => $i->name]);        
        }

        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
     
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
                
        $query 		= $this->{'PrivatePskEntries'}->find();
		$cquery     = $this->request->getQuery();
		$cloud_id 	= $cquery['cloud_id'];
		$this->CommonQueryFlat->cloud_with_system($query,$cloud_id,['PrivatePsks']);
		
		if(isset($cquery['id'])){
        	if($cquery['id'] > 0){
        		$query->where(['PrivatePsks.id' => $cquery['id']]);
        	}	   
        }
		
        $limit  = 50;
        $page   = 1;
        $offset = 0;
        if(null !== $cquery['limit']){
            $limit  = $cquery['limit'];
            $page   = $cquery['page'];
            $offset = $cquery['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){
                                       
            $i->for_system = false;
            if($i->private_psk->cloud_id == -1){
            	$i->for_system = true;
            } 
            $i->ppsk_name = $i->private_psk->name;
            if($i->vlan == 0){
                $i->vlan = '';
            }
            $i->created_in_words    = $this->TimeCalculations->time_elapsed_string($i->created);
            $i->modified_in_words   = $this->TimeCalculations->time_elapsed_string($i->modified);            
            $i->update = true;
            $i->delete = true;
            array_push($items,$i);      
        }
              
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
        ]);
        $this->viewBuilder()->setOption('serialize', true);
        
    }
      
    public function add(){ 
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
             
        $cdata = $this->request->getData();
        
        $check_items = [
        	'for_system'
        ];
        
        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }
            
        if($cdata['for_system'] == 1){
	    	$cdata['cloud_id'] = -1;
	    }else{
	    	$cdata['cloud_id'] = $this->request->getData('cloud_id');
	    }
	         
        $entity = $this->{$this->main_model}->newEntity($cdata);
        
        if($this->{$this->main_model}->save($entity)){
        
            //With ADD we automatically add the first psk-entry entry to the PrivatePskEntries table
            $d_entry            = [];
            $d_entry['name']    = 'ReplaceMe';
            $d_entry['comment'] = 'First User PPSK';
            $d_entry['active']  = 1; //Default (We make the first one active by default),
            $d_entry['private_psk_id'] = $entity->id;
            $e_entry    = $this->{'PrivatePskEntries'}->newEntity($d_entry); 
                 
            if($this->{'PrivatePskEntries'}->save($e_entry)){          
                 $this->set([
                    'success' => true,
                    '_serialize' => ['success']
                ]);        
            }else{
                $message = __('Could not add PPSK Frist Entry');
                $this->JsonErrors->entityErros($entity,$message);          
            }                
                        
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);        
        }        
    }
    
    public function pskAdd(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $cdata = $this->request->getData();
        
        $check_items = [
        	'active'
        ];
        
        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }
        
        if($cdata['vlan'] == ''){
            $cdata['vlan'] = 0; 
        }
        
        $e_entry    = $this->{'PrivatePskEntries'}->newEntity($cdata);      
        if($this->{'PrivatePskEntries'}->save($e_entry)){          
             $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);        
        }else{
            $message = __('Could not add PPSK Entry');
            $this->JsonErrors->entityErros($e_entry,$message);          
        }       
    }
    
    
    public function pskEdit(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $cdata = $this->request->getData();    
        $check_items = [
        	'active',
        	'for_system'
        ];
        
        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }
                  
        if($cdata['for_system'] == 1){
	    	$cdata['cloud_id'] = -1;
	    }else{
	    	$cdata['cloud_id'] = $this->request->getData('cloud_id');
	    }
        
        if($cdata['vlan'] == ''){
            $cdata['vlan'] = 0; 
        }
         
        $entity = $this->{'PrivatePskEntries'}->get($cdata['id']);                         
        $this->{'PrivatePskEntries'}->patchEntity($entity, $cdata); 
                       
        if ($this->{'PrivatePskEntries'}->save($entity)) {
        
            $g_entity = $this->{$this->main_model}->get($entity->private_psk_id);
            $cdata['id'] = $entity->private_psk_id;
            $cdata['name'] = $cdata['ppsk_name'];
            $this->{$this->main_model}->patchEntity($g_entity, $cdata);
            $this->{$this->main_model}->save($g_entity);
                     
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
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
        
        $req_d		= $this->request->getData();
        $ap_flag 	= true;		
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}

	    if(isset($req_d['id'])){
            $entity     = $this->{'PrivatePskEntries'}->get($req_d['id']);         
            if(($entity->cloud_id == -1)&&($ap_flag == true)){
	    		$this->set([
					'message' 	=> 'Not enough rights for action',
					'success'	=> false
				]);
				$this->viewBuilder()->setOption('serialize', true);
				return;
	    	} 
            $private_psk_id = $entity->private_psk_id;
            $this->{'PrivatePskEntries'}->delete($entity);
            
            $ent_count = $this->{'PrivatePskEntries'}->find()->where(['PrivatePskEntries.private_psk_id' => $private_psk_id])->count();
            if($ent_count == 0){ //All removed remove the private_psk also
                $e_ppsk = $this->{$this->main_model}->get($private_psk_id);
                $this->{$this->main_model}->delete($e_ppsk);
            }
  
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){           
                $entity         = $this->{'PrivatePskEntries'}->get($d['id']);
                $private_psk_id = $entity->private_psk_id;
                if(($entity->cloud_id == -1)&&($ap_flag == true)){
					$this->set([
							'message' 	=> 'Not enough rights for action',
							'success'	=> false
						]);
					$this->viewBuilder()->setOption('serialize', true);	
					return;
				}      
                $this->{'PrivatePskEntries'}->delete($entity);
                
                $ent_count = $this->{'PrivatePskEntries'}->find()->where(['PrivatePskEntries.private_psk_id' => $private_psk_id])->count();
                if($ent_count == 0){ //All removed remove the private_psk also
                    $e_ppsk = $this->{$this->main_model}->get($private_psk_id);
                    $this->{$this->main_model}->delete($e_ppsk);
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
	
	public function csvImport(){
	
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

        $path_parts         = pathinfo($_FILES['csv_file']['name']);
        $entity             = $this->{$this->main_model}->get($this->request->getData('private_psk_id'));
        
        //Refuse for system-wide and Access Provider
        if(($entity->cloud_id == -1)&&($ap_flag == true)){
			$this->set([
					'message' 	=> 'Not enough rights for action',
					'success'	=> false
				]);
			$this->viewBuilder()->setOption('serialize', true);
			return;
		}
		
		$tmpName    = $_FILES['csv_file']['tmp_name'];
        $csvAsArray = array_map('str_getcsv', file($tmpName));

        $errors     = [];
        foreach ($csvAsArray as $index => $row) {
            $row_errors = [];
            if ($index === 0 && $row[0] === 'PSK') {
                continue;
            }
            if (strlen($row[0]) < 8) {
                $row_errors[] = "Field 0 must be 8 characters or longer";
            }
            if (!in_array($row[2], ['Yes', 'No'])) {
                $row_errors[] = "Field 2 must be either 'Yes' or 'No'";
            }
            
            $active = 1;
            if($row[2] == 'No'){
                $active = 0;
            }
            
            $vlan = $row[3];
            if ($row[3] == '') {
                $vlan = 0;
            }
            
            if(empty($row_errors)){
                $e_data    = [
                    'private_psk_id'    => $this->request->getData('private_psk_id'),
                    'name'              => $row[0],
                    'comment'           => $row[1],
                    'active'            => $active,
                    'vlan'              => $vlan,
                    'mac'               => $row[4]
                ];
                $e_entry    = $this->{'PrivatePskEntries'}->newEntity($e_data);      
                $this->{'PrivatePskEntries'}->save($e_entry);                     
            
            }
        }
        
        $error_string = '';
        if (!empty($errors)) {
            $error_string = 'The following errors occurred:<br>';
            $error_string .= implode('<br>', $errors);
        }
				
        $this->set([
            'message' 	=> $error_string,
            'success'	=> true,
        ]);
        $this->viewBuilder()->setOption('serialize', true);     
        
    }
		
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons( false, 'ppsk'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
}
