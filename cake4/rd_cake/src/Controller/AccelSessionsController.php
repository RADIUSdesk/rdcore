<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;

class AccelSessionsController extends AppController{

    protected $main_model   = 'AccelSessions';
    protected  $fields  	= [
        'total_in'  => 'sum(AccelSessions.rx_bytes_raw)',
        'total_out' => 'sum(AccelSessions.tx_bytes_raw)',
        'total'     => 'sum(AccelSessions.rx_bytes_raw) + sum(AccelSessions.tx_bytes_raw)',
    ];
    
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
        $conditions = [];
        
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
        
        //base conditions
        $conditions = ['AccelSessions.accel_server_id' => $srv_id];
        
        $ft_fresh = FrozenTime::now();
        $ft_fresh = $ft_fresh->subMinute(10);//Below 10 minutes is fresh
        
        
        if((isset($req_q['only_connected']))&&($req_q['only_connected'] =='true')){
            array_push($conditions, ['AccelSessions.modified >=' => $ft_fresh ]);
        }
                       
        $query 	  = $this->{$this->main_model}->find()->where($conditions);      
     
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

        $t_q    = $this->{$this->main_model}->find()->where($conditions)->select($this->fields)->first();	
        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){               
			$i->update  = true;
			$i->delete	= true;		
			$i->state	= 'up';

			$i->modified_in_words = $this->TimeCalculations->time_elapsed_string($i->modified);
			$i->created_in_words = $this->TimeCalculations->time_elapsed_string($i->created);	
			
		    if ($i->modified <= $ft_fresh) {
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
                'count'    => $total,
            	'in'       => $t_q->total_in,
                'out'      => $t_q->total_out,
                'total'    => $t_q->total
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
