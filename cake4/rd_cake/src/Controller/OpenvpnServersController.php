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
                $q_r    = $this->{'Nodes'}->find->where(['Nodes.mac' => $mac])->first();
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
            'success' => $success,
            '_serialize' => ['mac','username','password','success']
        ]);
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
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,[]);


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

        $items = array();

        foreach ($q_r as $i) {

            array_push($items,[
                'id'                    => $i['id'], 
                'name'                  => $i['name'],
                'description'           => $i['description'],
                'available_to_siblings' => $i['available_to_siblings'],
                'local_remote'          => $i['local_remote'],
                'protocol'              => $i['protocol'],
                'ip_address'            => $i['ip_address'],
                'port'                  => $i['port'],
                'vpn_gateway_address'   => $i['vpn_gateway_address'],
                'vpn_bridge_start_address'      => $i['vpn_bridge_start_address'],
                'vpn_mask'              => $i['vpn_mask'],
                'config_preset'         => $i['config_preset'],
                'ca_crt'                => $i['ca_crt'],       
				'extra_name'            => $i['extra_name'],
				'extra_value'           => $i['extra_value'],
                'update'                => true,
                'delete'                => true
            ]);
        }
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));
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
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,[]);
        
        $q_r = $query->all();

        foreach ($q_r as $i) {
			array_push($items,['id' => $i->id, 'name' => $i->name]);
		}

        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            '_serialize' => ['items','success']
        ]);
    }

    public function add(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $this->_addOrEdit($user,'add');
        
    }
    
    public function edit(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->_addOrEdit($user,'edit');
        
    }
    
    private function _addOrEdit($user,$type= 'add') {

        //__ Authentication + Authorization __
       
		$req_d 		= $this->request->getData();
		
        $check_items = [
			'active'
		];
        foreach($check_items as $i){
            if(isset($req_d [$i])){
                $req_d [$i] = 1;
            }else{
                $req_d [$i] = 0;
            }
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
                'success' => true,
                '_serialize' => array('success')
            ));
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

	    if(isset($req_d['id'])){        
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

    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'basic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
}
