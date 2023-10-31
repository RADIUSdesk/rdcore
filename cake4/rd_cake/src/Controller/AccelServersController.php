<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;

class AccelServersController extends AppController{

    protected $main_model   = 'AccelServers';
    protected  $fields  	= [
        'sessions'  => 'sum(AccelStats.sessions_active)',
    ];
    protected   $deadAfter = 600; //600 seconds
    
    public function initialize():void{  
        parent::initialize();

        $this->loadModel('AccelServers'); 
        $this->loadModel('AccelStats');
        $this->loadModel('AccelSessions');
    
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'AccelServers'
        ]);        
         $this->loadComponent('JsonErrors'); 
         $this->loadComponent('TimeCalculations');          
    }
    
    public function getConfigForServer(){ 
    
        Configure::load('AccelPresets');
        $config_file    = Configure::read('AccelPresets.Default'); //Read the defaults  
        $reply_data     = $config_file;
    
         $this->set([
            'success'   => true,
            'data'      => $reply_data
        ]);
        $this->viewBuilder()->setOption('serialize', true);
        
    }
    
    public function submitReport(){ 
    
        $req_d		= $this->request->getData();
        $reply_data = [];
        
        //--We store the data as JSON strings since ther are arrays.
        foreach (array_keys($req_d['stat']) as $key){
                 
            if($key == 'sessions'){
                $s_list = $req_d['stat'][$key];
                foreach($s_list as $s){
                    if($s['name'] == 'active'){
                        $req_d['stat']['sessions_active'] = $s['value'];
                    }
                }              
            }
            
            if(($key == 'core')||($key == 'sessions')||($key == 'pppoe')){
                $req_d['stat'][$key] = json_encode($req_d['stat'][$key]);
            }
            
            if(preg_match('/^radius/', $key)){ //,"radius(1, 164.160.89.129)"
                $radius_nr = preg_replace('/^radius\(/','',$key);
                $radius_nr = preg_replace('/,.*/','',$radius_nr);
                $radius_ip = preg_replace('/.*,\s+/','',$key);
                $radius_ip = preg_replace('/\)$/','',$radius_ip);
                array_push($req_d['stat'][$key], ['name' => 'ip', 'value' => $radius_ip]);            
                $req_d['stat']['radius'.$radius_nr] = json_encode($req_d['stat'][$key]);     
            }
            
            if(preg_match('/^mem/', $key)){    // "mem(rss\/virt)":"5632\/244536 kB"
                $req_d['stat']['mem'] = $req_d['stat'][$key];
            }             
        }
        
        if(isset($req_d['mac'])){
            $mac = $req_d['mac'];
            $e_s = $this->{'AccelServers'}->find()->where(['AccelServers.mac' => $mac])->first();
            if($e_s){ 
            
                $server_id = $e_s->id;
                $req_d['stat']['accel_server_id'] = $e_s->id;
                                        
                $e_s->last_contact = date('Y-m-d H:i:s', time());
                $e_s->last_contact_from_ip = $this->request->clientIp();
                $this->{'AccelServers'}->save($e_s);
                
                //--Do the stats entry-- 
                $e_stats = $this->{'AccelStats'}->find()->where(['AccelStats.accel_server_id' => $e_s->id])->first();
                if($e_stats){
                    $this->{'AccelStats'}->patchEntity($e_stats, $req_d['stat']);    
                }else{                  
                    $e_stats = $this->{'AccelStats'}->newEntity($req_d['stat']);
                }
                $this->{'AccelStats'}->save($e_stats);
                
                //--Do the sessions entry--
                foreach($req_d['sessions'] as $session){ 
                
                    foreach(array_keys($session) as $key){              
                         if(str_contains($key , '-')){                        
                            $new_key = str_replace('-','_',$key);
                            $session[$new_key] = $session[$key];
                         }
                    }
                    if(array_key_exists('rate_limit',$session)){
                       //Do nothing 
                    }else{
                       $session['rate_limit'] = 'No Limit';  
                    }
                                               
                    $mac        = $session['calling_sid'];                                
                    $e_session  =  $this->{'AccelSessions'}->find()->where(['AccelSessions.accel_server_id' => $server_id,'AccelSessions.calling_sid' => $mac])->first();
                    if($e_session){
                        $this->{'AccelSessions'}->patchEntity($e_session,$session);    
                    }else{ 
                        $session['accel_server_id'] = $server_id;                 
                        $e_session                  = $this->{'AccelSessions'}->newEntity($session);
                    }
                    $this->{'AccelSessions'}->save($e_session);             
                }
                
                //See if there are any sessions to terminate
                $terminate_list = $this->{'AccelSessions'}->find()->where(['AccelSessions.disconnect_flag' => true,'AccelSessions.accel_server_id' => $server_id])->all();
                if(count($terminate_list)>0){
                    $reply_data['terminate'] = [];
                    foreach($terminate_list as $t){
                        array_push($reply_data['terminate'],$t->sid);
                        //Clear the flag 
                        $t->disconnect_flag = false;
                        $t->setDirty('modified', true); //Dont update the modified field
                        //Save it
                        $this->{'AccelSessions'}->save($t);
                    }              
                }
                
                //See if the restart_service_flag is set and clear it
                if($e_s->restart_service_flag){
                    $reply_data['restart_service'] = true;
                    $e_s->restart_service_flag = false;
                    //$e_s->setDirty('modified', true);
                    $this->{'AccelServers'}->save($e_s);             
                }                                        
            }     
        }
                
        $this->set([
            'success'   => true,
            'data'      => $reply_data
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
   
	public function index(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $dead_after = $this->deadAfter;
    
    	$req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find()->contain(['AccelStats']);      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);
        
        $ft_fresh = FrozenTime::now();
        $ft_fresh = $ft_fresh->subSecond($this->deadAfter);//Below 10 minutes is fresh
        
        
        if((isset($req_q['only_online']))&&($req_q['only_online'] =='true')){
            $query->where(['AccelServers.last_contact >=' => $ft_fresh ]);
        }
        
        
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
			
			if($i->accel_stat){
			    $i->sessions_active = $i->accel_stat->sessions_active;
			    $i->uptime = $i->accel_stat->uptime;
			    $i->accel_stat->core = json_decode($i->accel_stat->core);
			    $i->accel_stat->sessions = json_decode($i->accel_stat->sessions);
			    $i->accel_stat->pppoe = json_decode($i->accel_stat->pppoe);
			    $i->accel_stat->radius1 = json_decode($i->accel_stat->radius1);
			    $i->accel_stat->radius2 = json_decode($i->accel_stat->radius2);		    
			}else{
			    $i->sessions_active = 0;
			    $i->uptime = 0;
			}	
					
            array_push($items,$i);
        }
        
        $t_q    = $query->select($this->fields)->first();
        
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            'metaData'		=> [
            	'count'	    => $total,
            	'sessions'  => $t_q->sessions
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
    
    	$req_d  = $this->request->getData();
         
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
	
	 public function restart($id = null) {
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
            if($entity->restart_service_flag == 0){
                $entity->restart_service_flag = 1;
            }else{
                $entity->restart_service_flag = 0;
            }
            $entity->setDirty('modified', true);
            $this->{$this->main_model}->save($entity);
        }else{
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                if($entity->restart_service_flag == 0){
                    $entity->restart_service_flag = 1;
                }else{
                    $entity->restart_service_flag = 0;
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
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'accel_servers');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
}

?>
