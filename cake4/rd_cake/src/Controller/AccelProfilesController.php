<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;

class AccelProfilesController extends AppController{

    protected $main_model   = 'AccelProfiles';
    
    public function initialize():void{  
        parent::initialize();

        $this->loadModel('AccelProfiles'); 
    
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'AccelProfiles'
        ]);        
         $this->loadComponent('JsonErrors'); 
         $this->loadComponent('TimeCalculations');          
    }
    
    public function indexConfigs(){
    
        $items = [];
        Configure::load('AccelPresets');
        $configs    = Configure::read('AccelPresets'); //Read the defaults
        foreach(array_keys($configs) as $conf){        
            array_push($items, [ 'id' => $conf, 'name' => $conf]);       
        }
        
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }  
      
	public function index(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
    
    	$req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find()->contain(['AccelProfileEntries']);      
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
            array_push($items,$i);
        }
        
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            'metaData'		=> [
            	'count'	    => $total
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function viewConfig(){
    
        $data   = []; 
        $req_q  = $this->request->getQuery(); //q_data is the query data
        
        Configure::load('AccelPresets');
        $configs    = Configure::read('AccelPresets');
        $looking_for = [
            'dns',
            'radius',
            'pppoe',
            'ppp',
            'shaper',
            'ip-pool',
            'cli',       
        ];
             
        if($req_q['mode'] == 'add'){        
            $base_config = $req_q['base_config'];
            $config = $configs[$base_config]; 
            foreach($looking_for as $look){       
                foreach(array_keys($config[$look]) as $k){
                                  
                    $val = $config[$look][$k];
                    $key = $look.'_'.$k;
                    if((is_string($val))||(is_int($val))){
                        $data[$key] = $val;
                    }
                    
                    //ip-pool -> pool is different
                    if(($look == 'ip-pool')&&($k == 'pools')){
                        $val_string = '';
                        foreach($val as $v_line){
                            $val_string = $val_string.$v_line."\n";                       
                        }
                        $data[$key] = $val_string;                  
                    }
                    
                    //radius -> server is different
                    if(($look == 'radius')&&($k == 'server')){ //'164.160.89.129,testing123,auth-port=1812,acct-port=1813,req-limit=50,fail-timeout=0,max-fail=10,weight=1'
                        $radius1 = $val[0];
                        if(isset($val[1])){
                            $radius2 = $val[1];
                        }               
                    }                                
                }         
            }                        
        }
        $this->set([
            'data' => $data,
            'success' => true,
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
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'accel_profiles');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
}

?>
