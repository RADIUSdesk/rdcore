<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class PasspointUplinksController extends AppController{
  
    protected $main_model   = 'PasspointUplinks';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('PasspointUplinks');
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ 
            'model'     => 'PasspointUplinks',
            'sort_by'   => 'name'
        ]); 
             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');  
        $this->loadComponent('Formatter'); 
        $this->Authentication->allowUnauthenticated([]);         
    }
    
    public function indexCombo(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
      
        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();
                  
        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,[]);


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
		    	array_push($items, ['id' => 0,'name' => '**All WPA2 Enterpise / HS2.0 Clients**']);      
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
    
    	$req_q    	= $this->request->getQuery(); 
        $cloud_id 	= $req_q['cloud_id'];             
        $query 		= $this->{$this->main_model}->find();
        
        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,[]);
 
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
                       
            $i->created_in_words = $this->TimeCalculations->time_elapsed_string($i->created);
            $i->modified_in_words = $this->TimeCalculations->time_elapsed_string($i->modified);    
			$i->update  = true;
			$i->delete	= true;
			$i->for_system = false;
            if($i->cloud_id == -1){
            	$i->for_system = true;
            }  
            array_push($items,$i);      
        }
       
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
   
    public function add(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
           
        if ($this->request->is('post')) {         
        	$req_d	  = $this->request->getData();       	        	      
        	if($this->request->getData('for_system')){
        		$req_d['cloud_id'] = -1;
		    }
		    
		    $check_items = [
            	'ca_cert_usesystem',
            	'for_system'
            ];
            
            foreach($check_items as $i){
                if(isset($req_d[$i])){
                    $req_d[$i] = 1;
                }else{
                    $req_d[$i] = 0;
                }
            }
		    	    
		    if(!isset($req_d['ca_cert'])){
		        $req_d['ca_cert'] = '';
		    }
		    if(!isset($req_d['client_cert'])){
		        $req_d['client_cert'] = '';
		    }
		    if(!isset($req_d['private_key'])){
		        $req_d['private_key'] = '';
		    }
                 
            $entity = $this->{$this->main_model}->newEntity($req_d); 
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
    }
       
    public function view(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }        
        $req_d	= $this->request->getQuery();
       
        $data = [];
        if(isset($req_d['uplink_id'])){
       
            $passpointUplink = $this->PasspointUplinks->find()
                ->where(['PasspointUplinks.id' => $req_d['uplink_id']])
                ->contain([])
                ->first();
                
            if($passpointUplink){                                                      
                $data = $passpointUplink;
                if($passpointUplink->cloud_id == -1){
                	$data['for_system'] = true;
                }  
            }
        }
       
       $this->set([
            'data'      => $data,
            'success'   => true
        ]);
       
       $this->viewBuilder()->setOption('serialize', true);          
    }
    
    public function edit(){
	   
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $ap_flag 	= true;	
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}
				   
        if ($this->request->is('post')) { 
            $req_d  = $this->request->getData();
                    
		    if($this->request->getData('for_system')){
        		$req_d['cloud_id'] = -1;
		    }
		    	    
		    $check_items = [
            	'ca_cert_usesystem',
            ];
            
            foreach($check_items as $i){
                if(isset($req_d[$i])){
                    $req_d[$i] = 1;
                }else{
                    $req_d[$i] = 0;
                }
            }
            
            $entity  = $this->{$this->main_model}->find()->where(['id' => $req_d['id']])->first();
            
            if($entity){
            
            	if($ap_flag && ($entity->cloud_id == -1)){
            		$this->JsonErrors->errorMessage('Not enough rights for action');
					return;          	
            	}
                        
                $this->{$this->main_model}->patchEntity($entity, $req_d); 
                if ($this->{$this->main_model}->save($entity)) {
                    $this->set(array(
                        'success' => true
                    ));
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($entity,$message);
                }   
            }
        }
    }
        
	
    public function menuForGrid(){
      
        $menu = $this->GridButtonsFlat->returnButtons(false,'FirewallApps'); 
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
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

