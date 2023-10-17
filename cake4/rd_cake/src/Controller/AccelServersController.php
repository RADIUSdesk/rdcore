<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class AccelServersController extends AppController{

    protected $main_model   = 'AccelServers';
    
    public function initialize():void{  
        parent::initialize();

        $this->loadModel('AccelServers'); 
        $this->loadModel('AccelStats');
    
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'AccelServers'
        ]);        
         $this->loadComponent('JsonErrors'); 
         $this->loadComponent('TimeCalculations');          
    }
    
    public function submitReport(){ 
    
        $req_d		= $this->request->getData();
        
        //json_encode($req_d['stat']['sessions']);
        
        if(isset($req_d['mac'])){
            $mac = $req_d['mac'];
            $e_s = $this->{'AccelServers'}->find()->where(['AccelServers.mac' => $mac])->first();
            if($e_s){               
                $e_s->last_contact = date('Y-m-d H:i:s', time());
                $e_s->last_contact_from_ip = $this->request->clientIp();
                $this->{'AccelServers'}->save($e_s);
                //Do the stats entry 
                $e_stats = $this->{'AccelStats'}->find()->where(['AccelStats.accel_server_id' => $e_s->id])->first();
                if($e_stats){
                    $this->{'AccelStats'}->patchEntity($e_stats, $req_d['stat']);    
                }else{
                    $e_stats = $this->{'AccelStats'}->newEntity($req_d['stat']);
                }
                $this->{'AccelStats'}->save($e_stats);
            }     
        }
                
        $this->set([
            'data'      => $req_d['stat']['uptime'],
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
   
	public function index(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $dead_after = 900; //15 minutes
    
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
			$i->update		= true;
			$i->delete		= true;		
			$i->state		= 'up';

			$i->modified_in_words = $this->TimeCalculations->time_elapsed_string($i->modified);
			$i->created_in_words = $this->TimeCalculations->time_elapsed_string($i->created);
			
			if($i->config_fetched == null){
			    $i->config_state= 'never';
			}else{
			    $i->config_fetched_human = $this->TimeCalculations->time_elapsed_string($i->config_fetched);
			    $last_timestamp = strtotime($i->config_fetched);
                if ($last_timestamp+$dead_after <= time()) {
                    $i->config_state = 'down';
                } else {
                    $i->config_state = 'up';
                }		
			}
			
			if($i->last_contact == null){
			    $i->state= 'never';
			}else{
			    $i->last_contact_human = $this->TimeCalculations->time_elapsed_string($i->last_contact);
			    $last_timestamp = strtotime($i->last_contact);
                if ($last_timestamp+$dead_after <= time()) {
                    $i->state = 'down';
                } else {
                    $i->state = 'up';
                }		
			}	
					
            array_push($items,$i);
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
   
    public function menuForGrid(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'accel_servers');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
}

?>
