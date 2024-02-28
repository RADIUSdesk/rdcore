<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 13/08/2020
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;


class OpenvpnServersController extends AppController {

    public $base            = "Access Providers/Controllers/OpenvpnServers/";
    protected $owner_tree   = [];
    protected $main_model   = 'OpenvpnServers';

    public function initialize():void{
        parent::initialize();
        $this->loadModel('OpenvpnServers');
        $this->loadModel('Users');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => $this->main_model,
            'sort_by' => $this->main_model . '.id'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }
     
    public function authClient(){
    
        $success = false;   
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$req_d 		= $this->request->getData();
		
		if(isset($req_d['username'])){
		    $username = $req_d['username'];
		}
		
		if(isset($req_d['password'])){
		    $password = $req_d['password'];
		}
		
		$md5_sum = md5($username);
				
		if($password == $md5_sum){
		    
		    if (preg_match('/^mesh_/',$username)){
		        $mac    = preg_replace('/^mesh_/', '', $username);    
		        $this->loadModel('Nodes');
                $q_r    = $this->{'Nodes'}->find()->where(['Nodes.mac' => $mac])->first();
                if($q_r){
                    $success = true;
                }
		    }
		    
		    if (preg_match('/^ap_/',$username)){
		        $mac    = preg_replace('/^ap_/', '', $username);
		        $this->loadModel('Aps');
                $q_r    = $this->{'Aps'}->find()->where(['Aps.mac' => $mac])->first();
                if($q_r){
                    $success = true;
                }
		    }    
		}
	  
     	$this->set([
            'username'  => $username,
            'password'  => $password, 
            'mac'       => $mac,
            'success' => $success
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function index(){
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
            $limit = $req_q['limit'];
            $page = $req_q['page'];
            $offset = $req_q['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items = [];

        foreach ($q_r as $i) {
        
            $i->for_system = false;
            if($i->cloud_id == -1){
            	$i->for_system = true;
            }
            
            $i->created_in_words    = $this->TimeCalculations->time_elapsed_string($i->created);
            $i->modified_in_words   = $this->TimeCalculations->time_elapsed_string($i->modified);                 
            $i->update = true;
            $i->delete = true;
            array_push($items,$i);     

        }
       
        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
	
    //____ BASIC CRUD Manager ________
    public function index_ap(){
    //Display a list of items with their owners
    //This will be dispalyed to the Administrator as well as Access Providers who has righs

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $items = [];
        
        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,[]); 
        
        $q_r = $query->all();

        foreach ($q_r as $i) {
			array_push($items,['id' => $i->id, 'name' => $i->name]);
		}

        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function add(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $ap_flag 	= true;		
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}
    
        $this->_addOrEdit($user,'add');
        
    }
    
    public function edit(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        //If cloud_id = -1 and the user is not root ...reject the action
        if($user['group_name'] == Configure::read('group.ap')){
        	$e_check = $this->{$this->main_model}->find()->where(['OpenvpnServers.id' => $this->request->getData('id')])->first();
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
        $this->_addOrEdit($user,'edit');
        
    }
    
    private function _addOrEdit($user,$type= 'add') {

        //__ Authentication + Authorization __
       
		$req_d 		= $this->request->getData();
		
        $check_items = [
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
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
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

        $fail_flag  = false;
        $req_d 		= $this->request->getData();
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

    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'basic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
}
