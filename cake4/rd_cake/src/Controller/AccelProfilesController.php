<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;

class AccelProfilesController extends AppController{

    protected $main_model  = 'AccelProfiles';
    protected $looking_for = [
        'dns',
        'radius',
        'pppoe',
        'ppp',
        'shaper',
        'ip-pool',
        'cli',       
    ];
    
    protected $submit_sections = [
        'dns',
        'radius',
        'radius1',
        'radius2',
        'pppoe',
        'ppp',
        'shaper',
        'ip-pool',
        'cli',       
    ];
    
    public function initialize():void{  
        parent::initialize();

        $this->loadModel('AccelProfiles');
        $this->loadModel('AccelProfileEntries');
    
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
             
        if($req_q['mode'] == 'add'){         
            $base_config    = $req_q['base_config'];
            $data           = $this->_getViewFromBaseConfig($base_config);         
        }
        
        if($req_q['mode'] == 'edit'){         
            $base_config    = $req_q['base_config'];
            $data           = $this->_getViewFromBaseConfig($base_config); 
            //Fin the rest of the data
            $id             = $req_q['accel_profile_id'];
            $e_profile      = $this->{'AccelProfiles'}->find()->where(['AccelProfiles.id' => $id])->contain(['AccelProfileEntries'])->first();
            if($e_profile){
                $data['name']   = $e_profile->name;
                $data['id']     = $e_profile->id;
                $found_radius2  = false;
                foreach($e_profile->accel_profile_entries as $a){
                    if($a->secion == 'radius2'){
                        $found_radius2 = true;
                    }
                    $key = $a->section.'_'.$a->item;
                    $data[$key] = $a->value;                
                }                      
            }
            
            if($found_radius2 == false){ //Unset radius2_ items
                foreach(array_keys($data) as $k){               
                    if(str_contains($k, 'radius2_')){
                        unset($data[$k]);
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
    	
    	$check_items = [
			'ppp_verbose',
			'pppoe_verbose',
            'shaper_verbose',
            'cli_verbose'
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
        
            $accel_profile_id = $entity->id;
            //Delete all the old entries
            $this->{'AccelProfileEntries'}->deleteAll(['AccelProfileEntries.accel_profile_id' => $accel_profile_id]);
        
            //After is has been saved the real work begins
            foreach(array_keys($req_d) as $key){
                if(str_contains($key, '_')){
                    $section    = preg_replace('/_.+$/', '', $key);
                    $s_item     = preg_replace('/^.+_/', '', $key);
                    $value      = $req_d[$key];
                    if(in_array($section,$this->submit_sections)){
                        $d_entry =[
                            'accel_profile_id'  => $accel_profile_id,
                            'section'           => $section,
                            'item'              => $s_item,
                            'value'             => $value
                        ];
                        if($value !== ''){
                            $e_entry = $this->{'AccelProfileEntries'}->newEntity($d_entry);
                            $this->{'AccelProfileEntries'}->save($e_entry);
                        }
                    }                              
                }        
            }
               
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
    
    private function _getViewFromBaseConfig($base_config){
    
        Configure::load('AccelPresets');
        $configs    = Configure::read('AccelPresets');  
        $config     = $configs[$base_config];
        $data       = [];     
        foreach($this->looking_for as $look){       
            foreach(array_keys($config[$look]) as $k){
                              
                $val = $config[$look][$k];
                $key = $look.'_'.$k;
                if((is_string($val))||(is_int($val))){
                    $data[$key] = $val;
                }
                
                //ip-pool -> pool is different
                if(($look == 'ip-pool')&&($k == 'pools')){
                    $data[$key] = implode("\n",$val);                               
                }
                
                //radius -> server is different
                if(($look == 'radius')&&($k == 'server')){ //'164.160.89.129,testing123,auth-port=1812,acct-port=1813,req-limit=50,fail-timeout=0,max-fail=10,weight=1'
                    $radius1 = $val[0];
                    $r1_pieces = explode(',',$radius1);
                    $data['radius1_ip'] = $r1_pieces[0];
                    $data['radius1_secret'] = $r1_pieces[1];
                    foreach($r1_pieces as $p){
                        if(str_contains($p, '=')){
                            $r_key = preg_replace('/=.+$/', '', $p);
                            $r_val = preg_replace('/^.+=/', '', $p);
                            $data['radius1_'.$r_key] = $r_val;
                        }  
                    }
                    
                    if(isset($val[1])){
                        $radius2 = $val[1];
                        $r2_pieces = explode(',',$radius2);
                        $data['radius2_ip'] = $r2_pieces[0];
                        $data['radius2_secret'] = $r2_pieces[1];
                        foreach($r2_pieces as $p){
                            if(str_contains($p, '=')){
                                $r_key = preg_replace('/=.+$/', '', $p);
                                $r_val = preg_replace('/^.+=/', '', $p);
                                $data['radius2_'.$r_key] = $r_val;
                            }  
                        }
                    }               
                }                                
            }         
        }
        return $data;                           
    }
}

?>
