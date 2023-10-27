<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class AccelSessionsController extends AppController{

    protected $main_model   = 'AccelSessions';
    
    public function initialize():void{  
        parent::initialize();

        $this->loadModel('AccelSessions'); 
        $this->loadModel('AccelServers');  
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'AccelServers'
        ]);        
         $this->loadComponent('JsonErrors'); 
         $this->loadComponent('TimeCalculations');          
    }
    
    
   
	public function index(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
            
        $dead_after = 600; //10 minutes
    
    	$req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];
        
        //The request should also contain the accel_server_id
        if(isset($req_q['accel_server_id'])){
            //The cloud_id should match the accell_server_id
            $srv_id = $req_q['accel_server_id'];
            $e_srv  = $this->{'AccelServers'}->find()->where(['AccelServers.id' => $srv_id])->first(); 
            if(($e_srv)&&($e_srv->cloud_id != $cloud_id)){
                $this->JsonErrors->errorMessage('Action Not Allowed');
                return;  
            }
        }else{
            $this->JsonErrors->errorMessage("Missing accel_server_id in request");
            return;  
        }
                
        $query 	  = $this->{$this->main_model}->find()->where(['AccelSessions.accel_server_id' => $srv_id]);      
     
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
			$i->update  = true;
			$i->delete	= true;		
			$i->state	= 'up';

			$i->modified_in_words = $this->TimeCalculations->time_elapsed_string($i->modified);
			$i->created_in_words = $this->TimeCalculations->time_elapsed_string($i->created);			
			$last_timestamp = strtotime($i->modified);
            if ($last_timestamp+$dead_after <= time()) {
                $i->state = 'down';
            } else {
                $i->state = 'up';
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
    
    public function disconnect($id = null) {
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
            if($entity->disconnect_flag == 0){
                $entity->disconnect_flag = 1;
            }else{
                $entity->disconnect_flag = 0;
            }
            $entity->setDirty('modified', true);
            $this->{$this->main_model}->save($entity);
        }else{
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                if($entity->disconnect_flag == 0){
                    $entity->disconnect_flag = 1;
                }else{
                    $entity->disconnect_flag = 0;
                }
                $entity->setDirty('modified', true);
                $this->{$this->main_model}->save($entity);
            }
        }         
        $this->set([
            'success' => true
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
   
    public function menuForGrid(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'accel_sessions');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
}

?>
