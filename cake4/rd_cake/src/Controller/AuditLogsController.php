<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 29/05/2026
 * Time: 00:00
 */
 

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class AuditLogsController extends AppController{
  
    protected $main_model   = 'AuditLogs';
    
    public function initialize():void{ 
        parent::initialize();
        
        $this->loadModel('AuditLogs');           
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'AuditLogs'
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
                
        $query 		= $this->{$this->main_model}->find();
		$cquery     = $this->request->getQuery();
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
            unset($i->password);               
            $i->created_in_words    = $this->TimeCalculations->time_elapsed_string($i->created);
            $i->modified_in_words   = $this->TimeCalculations->time_elapsed_string($i->modified);                    
            $i->update = true;
            $i->delete = true;
            array_push($items,$i);      
        }
              
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
        ]);
        $this->viewBuilder()->setOption('serialize', true);        
    }
      
    public function add(){ 
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
             
        $cdata  = $this->request->getData(); 
        
        unset($cdata['token']);
             
        $entity = $this->{$this->main_model}->newEntity($cdata);
        
        if($this->{$this->main_model}->save($entity)){     
             $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);        
                 
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);        
        }        
    }
    
    public function edit(){  
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->_edit($user);      
    }
    
    private function _edit($user) {
        
        $cdata = $this->request->getData();
        
        $entity = $this->{$this->main_model}->get($cdata['id']);                 
        $this->{$this->main_model}->patchEntity($entity, $cdata);   
              
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
  
        }else{                          //Assume multiple item delete
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

    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons( false, 'basic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
      
}
