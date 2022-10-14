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
        
        $_serialize = 'data';
        $this->setResponse($this->getResponse()->withDownload('export.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(compact('data', '_serialize'));  

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
		$this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['NaRealms.Realms','NaStates']);
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
                array_push($realms,
                    [
                        'id'                    => $r_id,
                        'name'                  => $r_n
                    ]);
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
            $i->update = true;
            $i->delete = true;
            array_push($items,$i);      
        }
              
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
        
    }
    
    public function add() {
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
        $cdata = $this->request->getData();
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
                'data'      => $cdata,
                '_serialize' => ['success','data']
            ]);
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
                ->first();
            if($q_r){
                $data = $q_r;
            }         
        }
        $this->set([
            'data'   => $data,
            'success' => true,
            '_serialize' => ['success','data']
        ]);
    }
    
    
     public function edit(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $cdata = $this->request->getData();

        if ($this->request->is('post')) {

            //Unfortunately there are many check items which means they will not be in the POST if unchecked
            //so we have to check for them
            $check_items = [
                'active', 'on_public_maps', 'session_auto_close','record_auth','ignore_acct'
            ];

            foreach($check_items as $i){
                if(isset($cdata[$i])){
                    $cdata[$i] = 1;
                }else{
                    $cdata[$i] = 0;
                }
            }

            $modelEntity = $this->{$this->main_model}->get($cdata['id']);
            // Update Entity with Request Data
            $modelEntity = $this->{$this->main_model}->patchEntity($modelEntity, $cdata);

            if ($this->{$this->main_model}->save($modelEntity)) {
            
            	$cdata['id'] = $modelEntity->id;
				if($cdata['monitor'] == 'off'){   //Clear the last contact when off
					$this->{$this->modelClass}->NaStates->deleteAll(['na_id' => $cdata['id']], false);
				}
                $this->set([
                    'success' => true,
                    '_serialize' => ['success']
                ]);
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
          
        $cdata = $this->request->getData();
        if(isset($cdata['id'])){ 
            $deleteEntity = $this->{$this->main_model}->get($cdata['id']);
            $this->{$this->main_model}->delete($deleteEntity);
        }else{                          //Assume multiple item delete
            foreach($this->request->getData() as $d){
                $deleteEntity = $this->{$this->main_model}->get($d['id']);
                $this->{$this->main_model}->delete($deleteEntity);
            }
        }
        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
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

        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }


    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'nas');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ));
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
