<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 13/Oct/2022
 * Time: 00:00
 */

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class NasController extends AppController{
  
    protected $main_model   = 'Nas';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Nas'); 
        $this->loadModel('Users');
        $this->loadModel('NaSettings');                 
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ 
            'model'     => 'Nas',
            'sort_by'   => 'Nas.nasname'
        ]);        
		$this->loadModel('UserSettings');
        $this->loadModel('NaStates');
        $this->loadModel('NaRealms');       
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('MikrotikApi');         
    }
    
    public function testMikrotik(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $cquery     = $this->request->getQuery();
        $id 		= $cquery['id'];       
        $q_r 		= $this->{'NaSettings'}->find()->where(['NaSettings.na_id' => $id])->all(); 
        $mt_data 	= [];
        foreach($q_r as $s){    
			if(preg_match('/^mt_/',$s->name)){
				$name = preg_replace('/^mt_/','',$s->name);
				$value= $s->value;
				if($name == 'port'){
					$value = intval($value); //Requires integer 	
				}
				$mt_data[$name] = $value;				
			}			        
        }
        
        if($mt_data['proto'] == 'https'){
        	$mt_data['ssl'] = true;
        	if($mt_data['port'] ==8728){
        		//Change it to Default SSL port 8729
        		$mt_data['port'] = 8729;
        	}
        }         
        unset($mt_data['proto']);              
      	$response = $this->MikrotikApi->test($mt_data);
    	
    	//___ FINAL PART ___
        $this->set([
        	'data'	 => $response,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    
    }
    
    public function exportCsv(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
		// $cdata now becomes $this->request->getData()
		// https://book.cakephp.org/3.0/en/controllers/request-response.html#request-body-data
		// $this->request->getQuery() returns an associave array
		$cdata = $this->request->getQuery();

        $query = $this->{$this->main_model}->find();
        $this->CommonQuery->build_common_query($query,$user,[
            'Users',
            'NaRealms' => ['Realms'],
            'NaTags' => ['Tags'],
            'NaNotes' => ['Notes']
        ]);
        
        $q_r  = $query->all();
        //Headings
        $heading_line   = array();
        if(null !== $cdata['columns']){
            $columns = json_decode($cdata['columns']);
            foreach($columns as $c){
                array_push($heading_line,$c->name);
            }
        }  
        $data = [
            $heading_line
        ];
        
        foreach($q_r as $i){

            //FIXME ADD Status; Realms; Tags
            $columns    = array();
            $csv_line   = array();
            if(null !== $cdata['columns']){
                $columns = json_decode($cdata['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    if($column_name == 'notes'){
                        $notes   = '';
                        foreach($i->na_notes as $un){
                            if(!$this->Aa->test_for_private_parent($un->note,$user)){
                                $notes = $notes.'['.$un->note->note.']';    
                            }
                        }
                        array_push($csv_line,$notes);
                    }elseif($column_name =='owner'){
                        $owner_id       = $i->user_id;
                        $owner_tree     = $this->Users->find_parents($owner_id);
                        array_push($csv_line,$owner_tree); 
                    }else{
                        array_push($csv_line,$i->{$column_name});  
                    }
                }
                array_push($data,$csv_line);
            }
        }
       
        $this->setResponse($this->getResponse()->withDownload('export.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
         $this->set([
            'data'=> $data
        ]);       
        $this->viewBuilder()->setOption('serialize', true); 

    } 
      
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
                
        $query 		= $this->{$this->main_model}->find();
		$cquery     = $this->request->getQuery();
		$cloud_id 	= $cquery['cloud_id'];
		$this->CommonQueryFlat->cloud_with_system($query,$cloud_id,['NaRealms.Realms','NaStates']);
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
                               
            $realms     = [];
            foreach($i->na_realms as $nr){ 
            	$r_id= $nr->realm->id;
              	$r_n = $nr->realm->name;

              	if(($nr->realm->cloud_id != $cloud_id)&&($user['group_name'] == Configure::read('group.admin'))){ //Admin can see all of them
              		array_push($realms,
                    [
                        'id'                    => $r_id,
                        'name'                  => $r_n,
                        'other_cloud'			=> true
                    ]);             	
              	
              	}else{
              		if($nr->realm->cloud_id == $cloud_id){
		          		array_push($realms,
		                [
		                    'id'                    => $r_id,
		                    'name'                  => $r_n,
		                    'other_cloud'			=> false
		                ]);
		          	}             	
              	}                     
            }
/*                     
			//FIXME Add NaState
            if(empty($i->na_states)){
                $status = 'unknown';
                $status_time = null;
            }else{
                if($i['na_states'][0]['state'] == 1){
                    $status         = 'up';
                    $status_time    = time()- strtotime($i['na_states'][0]['modified']);
                }else{
                    $status         = 'down';
                    $status_time    = time() -strtotime($i['na_states'][0]['modified']);
                }
            }
            
			$row['status']	= $status;
			$row['status']	= $status_time;

            foreach($i->na_states as $t){
                if(!$this->Aa->test_for_private_parent($t->realm,$user)){
                    array_push($row['realms'], 
                    [
                        'id'                    => $t->realm->id,
                        'name'                  => $t->realm->name,
                        'available_to_siblings' => $t->realm->available_to_siblings
                    ]);
                }
            }
            */
            
            $i->realms = $realms;
            
            $i->for_system = false;
            if($i->cloud_id == -1){
            	$i->for_system = true;
            } 
            
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
    
    public function add() {
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
        $cdata = $this->request->getData();
        
        $check_items = [
        	'for_system'
        ];
        
        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }
            
        if($cdata['for_system'] == 1){
	    	$cdata['cloud_id'] = -1;
	    }else{
	    	$cdata['cloud_id'] = $this->request->getData('cloud_id');
	    }
          
        $modelEntity = $this->{$this->main_model}->newEntity($cdata);

        if ($this->{$this->main_model}->save($modelEntity)) {
            //Check if we need to add na_realms table
            if(isset($cdata['avail_for_all'])){
                //Available to all does not add any dynamic_client_realm entries
            }else{
                foreach(array_keys($cdata) as $key){
                    if(preg_match('/^\d+/',$key)){
                        //----------------
                        $this->_add_na_realm($modelEntity->id, $key);
                        //-------------
                    }
                }
            }
            $cdata['id'] = $modelEntity->id;
            $this->set([
                'success' => true,
                'data'      => $cdata
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = 'Error';
            $this->JsonErrors->entityErros($modelEntity,$message);
        }
    }
       
  	public function view(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
        $data = [];
        if(null !== $this->request->getQuery('nas_id')){

            $q_r = $this->{$this->main_model}->find()
                ->where(['Nas.id' => $this->request->getQuery('nas_id')])
                ->contain(['NaSettings'])
                ->first();
            if($q_r){
                $data = $q_r;
                if($q_r->cloud_id == -1){
                	$data['for_system'] = true;
                }
                foreach($q_r->na_settings as $s){
            		$data[$s->name] = $s->value;
            	}
            	unset($data['na_settings']);                
            }         
        }
        $this->set([
            'data'   => $data,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
     public function edit(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $cdata = $this->request->getData();
              
        //If cloud_id = -1 and the user is not root ...reject the action
        if($user['group_name'] == Configure::read('group.ap')){
        	$e_check = $this->{$this->main_model}->find()->where(['Nas.id' => $this->request->getData('id')])->first();
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

        if ($this->request->is('post')) {

            //Unfortunately there are many check items which means they will not be in the POST if unchecked
            //so we have to check for them
            $check_items = [
                'active', 'on_public_maps', 'session_auto_close','record_auth','ignore_acct', 'for_system'
            ];

            foreach($check_items as $i){
                if(isset($cdata[$i])){
                    $cdata[$i] = 1;
                }else{
                    $cdata[$i] = 0;
                }
            }
            
            if($cdata['for_system'] == 1){
		    	$cdata['cloud_id'] = -1;
		    }else{
		    	$cdata['cloud_id'] = $this->request->getData('cloud_id');
		    }

            $modelEntity = $this->{$this->main_model}->get($cdata['id']);
            // Update Entity with Request Data
            $modelEntity = $this->{$this->main_model}->patchEntity($modelEntity, $cdata);
                        
            //See if there are Mikrotik specific settings that has to go to NaSettings
            foreach(array_keys($cdata) as $key){
                if(preg_match('/^mt_/',$key)){
               		$s_data 			= [];
               		$s_data['name'] 	= $key;
               		$s_data['value'] 	= $cdata[$key];
               		$s_data['na_id'] = $modelEntity->id;              		
                	$setting = $this->{'NaSettings'}->find()
                		->where(['NaSettings.na_id' => $modelEntity->id,'NaSettings.name' => $key])
                		->first();
                	if($setting){
                		if($setting->value != $cdata[$key]){
                			$this->{'NaSettings'}->patchEntity($setting, $s_data);
                		}
                	}else{
                		$setting = $this->{'NaSettings'}->newEntity($s_data);
                	}
                	$this->{'NaSettings'}->save($setting);                       
                }
            }

            if ($this->{$this->main_model}->save($modelEntity)) {
            
            	$cdata['id'] = $modelEntity->id;
				if($cdata['monitor'] == 'off'){   //Clear the last contact when off
					$this->{$this->modelClass}->NaStates->deleteAll(['na_id' => $cdata['id']], false);
				}
                $this->set([
                    'success' => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            }
        }
    }

    public function delete($id = null) {
        if (!$this->request->is('post')) {
            throw new MethodNotAllowedException();
        }
        
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
          
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

        }else{ 
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
       	
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
	
    //------ List of configured nas types  ------
    //This is displayed as a select to choose from when the user specifies the NAS detail 
    public function nasTypes(){
    //public function nas_types(){
        $items = [];
        $ct = Configure::read('nas_types');
        foreach($ct as $i){
            if($i['active']){
                array_push($items, $i);
            }
        }
        
        $this->set([
            'items' 	=> $items,
            'success' 	=> true
        ]);
        
        $this->viewBuilder()->setOption('serialize', true);
    }


    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'nas');
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }

    private function _add_na_realm($nas_id,$realm_id){
        $d                          = [];
        $d['id']         = '';
        $d['na_id']      = $nas_id;
        $d['realm_id']   = $realm_id;

		$realmEntity = $this->Nas->NaRealms->newEntity($d);
        $this->Nas->NaRealms->save($realmEntity);
    }   
}
