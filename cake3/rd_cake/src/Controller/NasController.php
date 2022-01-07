<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class NasController extends AppController{
  
    public $base         = "Access Providers/Controllers/Nas/";   
    protected $owner_tree   = array();
    protected $main_model   = 'Nas';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Nas'); 
        $this->loadModel('Users');
                 
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'     => 'Nas',
            'sort_by'   => 'Nas.nasname'
        ]);
        
        $this->loadComponent('Notes', [
            'model'     => 'NaNotes',
            'condition' => 'na_id'
        ]);
		$this->loadModel('UserSettings');
        $this->loadModel('NaStates');
        $this->loadModel('NaRealms');
		$this->loadModel('OpenvpnClients');
		$this->loadModel('PptpClients');
        
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
                
        $query = $this->{$this->main_model}->find();
		// $this->request->getQuery() returns an associave array
		$cdata = $this->request->getQuery();

        $this->CommonQuery->build_common_query($query,$user,[
            'Users',
            'NaRealms' => ['Realms'],
            'OpenvpnClients', // => ['OpenvpnClients'],
            'PptpClients', // => ['PptpClients'],
            'NaStates', // => ['States'],
            'NaTags' => ['Tags'],
            'NaNotes' => ['Notes']
        ]);
 
        $limit  = 50;
        $page   = 1;
        $offset = 0;
        if(null !== $cdata['limit']){
            $limit  = $cdata['limit'];
            $page   = $cdata['page'];
            $offset = $cdata['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = array();

        foreach($q_r as $i){
              
            $owner_id   = $i->user_id;
            if(!array_key_exists($owner_id,$this->owner_tree)){
                $owner_tree     = $this->Users->find_parents($owner_id);
            }else{
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags   = $this->Aa->get_action_flags($owner_id,$user);
            
            $notes_flag     = false;
            foreach($i->na_notes as $un){
                if(!$this->Aa->test_for_private_parent($un->note,$user)){
                    $notes_flag = true;
                    break;
                }
            }
            
            $row        = array();
            $fields    = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
            }
            
            $row['tags'] = [];
            foreach($i->na_tags as $t){
                if(!$this->Aa->test_for_private_parent($t->tag,$user)){
                    array_push($row['tags'], 
                    [
                        'id'                    => $t->tag->id,
                        'name'                  => $t->tag->name,
                        'available_to_siblings' => $t->tag->available_to_siblings
                    ]);
                }
            }
            
            $row['realms'] = [];
            foreach($i->na_realms as $t){
                if(!$this->Aa->test_for_private_parent($t->realm,$user)){
                    array_push($row['realms'], 
                    [
                        'id'                    => $t->realm->id,
                        'name'                  => $t->realm->name,
                        'available_to_siblings' => $t->realm->available_to_siblings
                    ]);
                }
            }
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
                
            $row['user']	= $i->user->username;
            $row['owner']   = $owner_tree;
            $row['notes']   = $notes_flag;
			$row['update']	= $action_flags['update'];
			$row['delete']	= $action_flags['delete']; 
            array_push($items,$row);      
        }
       
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => array('items','success','totalCount')
        ));
    }
    
    public function addDirect(){
    //public function add_direct(){

         //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
		// $this->request->getData() returns an associave array
		$cdata = $this->request->getData();

        $conn_type = 'direct';
        $cdata['connection_type'] = $conn_type;

        //Get the creator's id
		 if($cdata['user_id'] == '0'){ //This is the holder of the token - override '0'
			$cdata['user_id'] = $user_id;
		}

        //Make available to siblings check
		if(array_key_exists('available_to_siblings',$cdata)){ // When a key does not exist in request data, null is returned
			$cdata['available_to_siblings'] = 1;
		}else{
			$cdata['available_to_siblings'] = 0;
		}

        //Then we add the rest.....
		$modelEntity = $this->{$this->main_model}->newEntity($cdata);
        //print_r($this->request->data);
		if ($this->{$this->main_model}->save($modelEntity)) {
            //Check if we need to add na_realms table
			if(!array_key_exists('avail_for_all',$cdata)){
				foreach(array_keys($cdata) as $key){
					if(preg_match('/^\d+/',$key)){
						//----------------
						$this->_add_nas_realm($modelEntity->id,$key);
						//-------------
					}
				}
			}
			$cdata['id'] = $modelEntity->id;
            $this->set(array(
                'success' => true,
                'data'      => $cdata,
                '_serialize' => array('success','data')
            ));
        } else {
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($modelEntity,$message);
        }
    }

    public function addOpenVpn(){
    //public function add_open_vpn(){

		//__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];

		$conn_type = 'openvpn';

		// COMMENT
		// $cdata now becomes $this->request->getData()
		// https://book.cakephp.org/3.0/en/controllers/request-response.html#request-body-data
		// $this->request->getData() returns an associave array
		$cdata = $this->request->getData();

		$cdata['connection_type'] = $conn_type;

		//Get the creator's id
		 if($cdata['user_id'] == '0'){ //This is the holder of the token - override '0'
			$cdata['user_id'] = $user_id;
		}

		//Make available to siblings check
		if(null !== $cdata['available_to_siblings']){ // When a key does not exist in request data, null is returned
			$cdata['available_to_siblings'] = 1;
		}else{
			$cdata['available_to_siblings'] = 0;
		}

		// If this attribute is not present it will fail empty check
		if(null === $cdata['nasname']){
			$cdata['nasname'] = ''; //Make it empty if not present
		}

		//First we create the OpenVPN entry....
		$d = [];
		// $d['OpenvpnClient']['username'] = $cdata['username'];
		// $d['OpenvpnClient']['password'] = $cdata['password'];

		// COMMENT
		// The array structure should reflect the associations and follow the naming conventions of the Tables in Cake 3.
		// So OpenvpnClient Model in Cake2 becomes OpenvpnClients Table in Cake 3 (notice the s)
		$d['OpenvpnClients']['username'] = $cdata['username'];
		$d['OpenvpnClients']['password'] = $cdata['password'];
		
		// COMMENT
		// In Cake3, you will need to create an entity object from a request or array data and save it
		//
		// $this->Nas->OpenvpnClients->create();
		$ovpnEntity = $this->Nas->OpenvpnClients->newEntity($d);
		
		if(! $this->Nas->OpenvpnClients->save($ovpnEntity)){
            $message = __('Could not create OpenVPN Client');
            $this->JsonErrors->entityErros($ovpnEntity,$message);
			return;
		}else{
			//Derive the nasname (ip address) from the new OpenvpnClient entry
			// $qr = $this->Nas->OpenvpnClients->findById($this->Nas->OpenvpnClients->id);

			// COMMENT
			// In Cake3, using just the "findBy<magic_column_name>" will only resturn a result object which expects a query method (first or all)
			$qr = $this->Nas->OpenvpnClients->findById($this->Nas->OpenvpnClients->id)->first();
			
			// COMMENT
			// When using first, query result is an object and not an array
			//IP Address =
			// $nasname = Configure::read('openvpn.ip_half').$qr['subnet'].'.'.$qr['peer1'];
			$nasname = Configure::read('openvpn.ip_half') . $qr->subnet . '.' . $qr->peer1;
			
			$cdata['nasname'] = $nasname;
		}

		//Then we add the rest.....
		// $this->{$this->main_model}->create();
		//print_r($cdata);

		$modelEntity = $this->{$this->main_model}->newEntity($cdata);

		if ($this->{$this->main_model}->save($modelEntity)) {

			//Check if we need to add na_realms table
			if(null !== $cdata['avail_for_all']){
			//Available to all does not add any na_realm entries
			}else{
				foreach(array_keys($cdata) as $key){
					if(preg_match('/^\d+/',$key)){
						//----------------
						$this->_add_nas_realm($modelEntity->id,$key);
						//-------------
					}
				}
			}

			//Save the new ID to the OpenvpnClient....
			// $this->Nas->OpenvpnClients->saveField('na_id', $this->{$this->main_model}->id);
			$ovpnClientEntity = $this->Nas->OpenvpnClients->newEntity(['na_id' => $modelEntity->id]);
			
			$this->Nas->OpenvpnClients->save($ovpnClientEntity);

			$cdata['id'] = $modelEntity->id;
			
			$this->set(array(
				'success' => true,
				'data'      => $cdata,
				'_serialize' => array('success','data')
			));

		} else {
			//If it was an OpenvpnClient we need to remove the created openvpnclient entry since there was a failure
			// $this->Nas->OpenvpnClients->delete();
			
			// COMMENT 
			// In Cake3, the delete method expects an a loaded entity
			$this->Nas->OpenvpnClients->delete($modelEntity);
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($modelEntity,$message);
		}
	}
 
	public function addDynamic(){
    //public function add_dynamic(){
		//__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];

		$conn_type = 'dynamic';

		$cdata = $this->request->getData();
		
		$cdata['connection_type'] = $conn_type;

		//Get the creator's id
		 if($cdata['user_id'] == '0'){ //This is the holder of the token - override '0'
			$cdata['user_id'] = $user_id;
		}

		//Make available to siblings check
		if(null !== $cdata['available_to_siblings']){
			$cdata['available_to_siblings'] = 1;
		}else{
			$cdata['available_to_siblings'] = 0;
		}

		//If this attribute is not present it will fail empty check
		if(null === $cdata['nasname']){
			$cdata['nasname'] = ''; //Make it empty if not present
		}

		//Get the class B subnet of the start_ip
		$start_ip   = Configure::read('dynamic.start_ip');
		$pieces     = explode('.',$start_ip);
		$octet_1    = $pieces[0];
		$octet_2    = $pieces[1];
		$class_b    = $octet_1.'.'.$octet_2;
		$q_r        = $this->{$this->main_model}->find()->where(['Nas.nasname LIKE' => "$class_b%"])->order(['Nas.nasname' => 'DESC'])->first();
		
		if($q_r){
			$ip         = $q_r->nasname;
			$next_ip    = $this->_get_next_ip($ip);           
			$not_available = true;
			while($not_available){
				if($this->_check_if_available($next_ip)){
					$cdata['nasname']     = $next_ip;
					$not_available = false;
					break;
				}else{
					$next_ip = $this->_get_next_ip($next_ip);
				}
			}              
		}else{ //The very first entry
			$cdata['nasname'] = $start_ip;
		}

		//Then we add the rest.....
		$modelEntity = $this->{$this->main_model}->newEntity($cdata);

		//print_r($cdata);
		if ($this->{$this->main_model}->save($modelEntity)) {

			//Check if we need to add na_realms table
			if(isset($cdata['avail_for_all'])){
			//Available to all does not add any na_realm entries
			}else{
				foreach(array_keys($cdata) as $key){
					if(preg_match('/^\d+/',$key)){
						//----------------
						$this->_add_nas_realm($modelEntity->id,$key);
						//-------------
					}
				}
			}   
			$cdata['id'] = $modelEntity->id;
			$this->set(array(
				'success' => true,
				'data'      => $cdata,
				'_serialize' => array('success','data')
			));
		} else {
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($modelEntity,$message);
			$first_error = reset($this->JsonErrors->entityErros($modelEntity, $message));
			$this->set(array(
				'errors'    => $this->JsonErrors->entityErros($modelEntity, $message),
				'success'   => false,
				'message'   => array('message' => __('Could not create item').' <br>'.$first_error[0]),
				'_serialize' => array('errors','success','message')
			));
		}
	} 

	public function addPptp(){
    //public function add_pptp(){
          //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];

        $conn_type = 'pptp';
		$cdata = $this->request->getData();
		
		$cdata['connection_type'] = $conn_type;

		//Get the creator's id
		 if($cdata['user_id'] == '0'){ //This is the holder of the token - override '0'
			$cdata['user_id'] = $user_id;
		}

		//Make available to siblings check
		if(null !== $cdata['available_to_siblings']){
			$cdata['available_to_siblings'] = 1;
		}else{
			$cdata['available_to_siblings'] = 0;
		}

		//If this attribute is not present it will fail empty check
		if(null === $cdata['nasname']){
			$cdata['nasname'] = ''; //Make it empty if not present
		}

        //First we create the OpenVPN entry....
        $d = [];
        $d['PptpClient']['username'] = $cdata['username'];
        $d['PptpClient']['password'] = $cdata['password'];

		$pptpEntity = $this->Nas->PptpClients->newEntity($d);
		
		if(! $this->Nas->PptpClients->save($pptpEntity)){
            $message = __('Could not create Pptp Client');
            $this->JsonErrors->entityErros($pptpEntity,$message);
            return;
        }else{
            //Derive the nasname (ip address) from the new PptpClient entry
            $qr = $this->Nas->PptpClients->findById($this->Nas->PptpClients->id)->first();
            //IP Address =
            $nasname = $qr->ip;
            $cdata['nasname'] = $nasname;
        }

        //Then we add the rest.....
		$modelEntity = $this->{$this->main_model}->newEntity($cdata);

		if ($this->{$this->main_model}->save($modelEntity)) {

			//Check if we need to add na_realms table
			if(null !== $cdata['avail_for_all']){
			//Available to all does not add any na_realm entries
			}else{
				foreach(array_keys($cdata) as $key){
					if(preg_match('/^\d+/',$key)){
						//----------------
						$this->_add_nas_realm($modelEntity->id,$key);
						//-------------
					}
				}
			}

            //Save the new ID to the PptpClient....
			$pptpClientEntity = $this->Nas->PptpClients->newEntity(['na_id' => $modelEntity->id]);
			
			$this->Nas->PptpClients->save($pptpClientEntity);

			$cdata['id'] = $modelEntity->id;
            $this->set(array(
                'success' => true,
                'data'      => $cdata,
                '_serialize' => array('success','data')
            ));
        } else {
            //If it was an PptpClient we need to remove the created pptpclient entry since there was a failure
			$this->Nas->PptpClients->delete($modelEntity);
            $message = __('Could not create item');
        }
    }

    public function viewOpenvpn(){
    //public function view_openvpn(){
        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getQuery();

        $items = [];
        if(null !== $cdata['nas_id']){

            $q_r = $this->{$this->modelClass}->OpenvpnClients->find()->where(['OpenvpnClients.na_id' => $cdata['nas_id']])->first();

            if($q_r){
                $items['username'] = $q_r->username;
                $items['password'] = $q_r->password;
            }
        }

        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    public function editOpenvpn(){
    //public function edit_openvpn(){

        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getData();

        if(null !== $cdata['nas_id']){

            $q_r = $this->{$this->modelClass}->OpenvpnClients->find()->where(['OpenvpnClients.na_id' => $cdata['nas_id']])->first();

            if($q_r){
                $id = $q_r->id;
                $cdata['id']      = $id;
                $cdata['subnet']  = $q_r->subnet;
                $cdata['peer1']   = $q_r->peer1;
                $cdata['peer2']   = $q_r->peer2;  
            }
			$ovpnClientEntity = $this->Nas->OpenvpnClients->get($cdata['id']);
			$this->Nas->OpenvpnClients->patchEntity($ovpnClientEntity, $cdata);
			
            if(!$this->Nas->OpenvpnClients->save($ovpnClientEntity)){
				$message = __('Could not update OpenVPN detail');
				$this->JsonErrors->entityErros($ovpnClientEntity,$message);
                return;
            }else{
                    $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            }
        }
    }
    
    public function viewPptp(){
    //public function view_pptp(){
        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getQuery();

        $items = [];
        if(null !== $cdata['nas_id']){

            $q_r = $this->{$this->modelClass}->PptpClients->find()->where(['PptpClients.na_id' => $cdata['nas_id']])->first();

            if($q_r){
                $items['username'] = $q_r->username;
                $items['password'] = $q_r->password;
            }
        }

        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    public function editPptp(){
    //public function edit_pptp(){

        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getData();

        if(null !== $cdata['nas_id']){

            $q_r = $this->{$this->modelClass}->PptpClients->find()->where(['PptpClients.na_id' => $cdata['nas_id']])->first();

            if($q_r){
                $id = $q_r->id;
                $cdata['id']      = $id;
                $cdata['ip']  = $q_r->ip;
            }
			$pptpClientEntity = $this->Nas->PptpClients->get($cdata['id']);
			$this->Nas->PptpClients->patchEntity($pptpClientEntity, $cdata);
			
            if(!$this->Nas->PptpClients->save($pptpClientEntity)){
				$message = __('Could not update PPTP detail');
				$this->JsonErrors->entityErros($pptpClientEntity,$message);
                return;
            }else{
                    $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            }
        }
    }

    public function viewDynamic(){
    //public function view_dynamic(){
        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getQuery();

        $items = [];
        if(null !== $cdata['nas_id']){

            $q_r = $this->Nas->find()->where(['Nas.na_id' => $cdata['nas_id']])->first();

            if($q_r){
                $items['dynamic_attribute'] = $q_r->dynamic_attribute;
                $items['dynamic_value'] 	= $q_r->dynamic_value;
            }
        }

        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    public function editDynamic(){
    //public function edit_dynamic(){

        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getData();

		$modelEntity = $this->{$this->main_model}->get($cdata['id']);
        $this->{$this->main_model}->patchEntity($modelEntity, $cdata);

		if ($this->{$this->main_model}->save($modelEntity)) {
		
			$cdata['id'] = $modelEntity->id;
			
			$this->set(array(
				'success' => true,
				'data'      => $cdata,
				'_serialize' => array('success','data')
			));
		} else {
            $message = __('Could not update Dynamic Detail');
            $this->JsonErrors->entityErros($modelEntity,$message);
		}
    }

    public function viewNas(){
    //public function view_nas(){
        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getQuery();

        $items = [];
        if(null !== $cdata['nas_id']){

            $q_r = $this->Nas->find()->where(['Nas.id' => $cdata['nas_id']])->first();

            if($q_r){
                $items = $q_r;
            }
        }

        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    public function editNas(){
    //public function edit_nas(){
        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getData();

        $items = [];

        if(array_key_exists('on_public_maps',$cdata)){
            $cdata['on_public_maps'] = 1;
        }else{
            $cdata['on_public_maps']      = 0;
        }

        if(array_key_exists('session_auto_close',$cdata)){
            $cdata['session_auto_close'] = 1;
        }else{
            $cdata['session_auto_close']  = 0;
        }
        if(array_key_exists('record_auth',$cdata)){
            $cdata['record_auth'] = 1;
        }else{
            $cdata['record_auth']         = 0;
        }
        if(array_key_exists('ignore_acct',$cdata)){
            $cdata['ignore_acct'] = 1;
        }else{
            $cdata['ignore_acct']         = 0; 
        }


        if($cdata['monitor'] == 'off'){   //Clear the last contact when off
            $cdata['last_contact'] = null;
        }
		
        $modelEntity = $this->{$this->main_model}->get($cdata['id']);
        $this->{$this->main_model}->patchEntity($modelEntity, $cdata);

		if ($this->{$this->main_model}->save($modelEntity)) {
		
			$cdata['id'] = $modelEntity->id;
			if($cdata['monitor'] == 'off'){   //Clear the last contact when off
            //If monitor was == off; clear the NaStates
			// $this->{$this->modelClass}->NaState->deleteAll(array('NaState.na_id' => $this->request->data['id']), false);
				$this->{$this->modelClass}->NaStates->deleteAll(['na_id' => $cdata['id']], false);
			}
			
			$this->set(array(
				'success' => true,
				'data'      => $cdata,
				'_serialize' => array('success','data')
			));
		} else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($modelEntity,$message);
        }

    }

	//public function view_photo(){
	public function viewPhoto(){

        //__ Authentication + Authorization __
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];
		$cdata = $this->request->getQuery();

        $items = [];

        if(null !== $cdata['id']){
            //$query->$this->{$this->main_model}->contains();
			$q_r = $this->Nas->findById($cdata['id'])->first();

            if($q_r){
                $items['photo_file_name'] = $q_r->photo_file_name;
            }
        }

        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    //public function upload_photo($id = null){
	public function uploadPhoto($id = null){
		$user = $this->_ap_right_check();
		if (!$user) {
			return;
		}

		$user_id    = $user['id'];

		$cdata = $this->request->getData();

        //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.
        $this->layout = 'ext_file_upload';

        $path_parts     = pathinfo($_FILES['photo']['name']);
        $unique         = time();
        $dest           = WWWROOT."nas/".$unique.'.'.$path_parts['extension']; // WWWROOT <- IMAGES
        //$dest_www       = "/cake2/rd_cake/webroot/img/nas/".$unique.'.'.$path_parts['extension']; // Not used

        //Now add....
		$modelEntity = $this->{$this->main_model}->newEntity($cdata);
        $modelEntity->id = $cdata['id'];
		$modelEntity->photo_file_name = $unique.'.'.$path_parts['extension'];
        if ($this->{$this->main_model}->save($modelEntity)) {
            move_uploaded_file ($_FILES['photo']['tmp_name'] , $dest);
            $json_return['id']                  = $this->{$this->modelClass}->id;
            $json_return['success']             = true;
            $json_return['photo_file_name']     = $unique.'.'.$path_parts['extension'];
        }else{
            $message = __('Problem uploading photo');
            $this->JsonErrors->entityErros($modelEntity,$message);
			return;
        }
        $this->set('json_return',$json_return);
    }

    public function viewMapPref(){
    //public function view_map_pref(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $items = [];

        $zoom = Configure::read('user_settings.map.zoom');
        //Check for personal overrides
        $q_r = $this->UserSettings->find()->where(['UserSettings.user_id' => $user_id,'UserSettings.name' => 'map_zoom'])->first();
        if($q_r){
            $zoom = intval($q_r->value);
        }

        $type = Configure::read('user_settings.map.type');
        //Check for personal overrides

        $q_r = $this->UserSettings->find()->where(['UserSettings.user_id' => $user_id,'UserSettings.name' => 'map_type'])->first();
        if($q_r){
            $type = $q_r->value;
        }

        $lat = Configure::read('user_settings.map.lat');
        //Check for personal overrides

        $q_r = $this->UserSettings->find()->where(['UserSettings.user_id' => $user_id,'UserSettings.name' => 'map_lat'])->first();
        if($q_r){
            $lat = ($q_r->value)+0;
        }

        $lng = Configure::read('user_settings.map.lng');
        //Check for personal overrides

        $q_r = $this->UserSettings->find()->where(['UserSettings.user_id' => $user_id,'UserSettings.name' => 'map_lng'])->first();
        if($q_r){
            $lng = ($q_r->value)+0;
        }

        $items['zoom'] = $zoom;
        $items['type'] = $type;
        $items['lat']  = $lat;
        $items['lng']  = $lng;

        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    public function editMapPref(){
    //public function edit_map_pref(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
		
		$cdata = $this->request->getData();

        $d = [];

        if(array_key_exists('zoom',$cdata)){        
			$d['user_id']= $user_id;
			$d['name']   = 'map_zoom';
			$d['value']  = $cdata['zoom'];
			$userSettingEntity = $this->UserSettings->newEntity($d);

			if (!$this->UserSettings->save($userSettingEntity)) {
				$message = __('Could not set Map Zoom');
				$this->JsonErrors->entityErros($userSettingEntity,$message);
				return;
			}
		}

        if(array_key_exists('type',$cdata)){        
			$d['user_id']= $user_id;
			$d['name']   = 'map_type';
			$d['value']  = $cdata['type'];
			$userSettingEntity = $this->UserSettings->newEntity($d);

			if (!$this->UserSettings->save($userSettingEntity)) {
				$message = __('Could not create item');
				$this->JsonErrors->entityErros($userSettingEntity,$message);
				$first_error = reset($this->JsonErrors->entityErros($userSettingEntity, $message));
				$this->set(array(
					'errors'    => $this->JsonErrors->entityErros($userSettingEntity, $message),
					'success'   => false,
					'message'   => array('message' => 'Could not set Map Type <br>'.$first_error[0]),
					'_serialize' => array('errors','success','message')
				));
				return;
			}
        }

        if(array_key_exists('lat',$cdata)){        
			$d['user_id']= $user_id;
			$d['name']   = 'map_lat';
			$d['value']  = $cdata['lat'];
			$userSettingEntity = $this->UserSettings->newEntity($d);

			if (!$this->UserSettings->save($userSettingEntity)) {
				$message = __('Could not set Map Latitude');
				$this->JsonErrors->entityErros($userSettingEntity,$message);
				return;
			}
        }

        if(array_key_exists('lng',$cdata)){        
			$d['user_id']= $user_id;
			$d['name']   = 'map_lng';
			$d['value']  = $cdata['lng'];
			$userSettingEntity = $this->UserSettings->newEntity($d);

			if (!$this->UserSettings->save($userSettingEntity)) {
				$message = __('Could not set Map Longitude');
				$this->JsonErrors->entityErros($userSettingEntity,$message);
				return;
			}
        }

		$this->set(array(
			'success' => true,
			'_serialize' => array('success')
		));
    }

    public function deleteMap(){
    //public function delete_map(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
		
		$cdata = $this->request->getQuery();
		
        if(isset($cdata['id'])){
			$modelEntity = $this->{$this->main_model}->newEntity($cdata);
            $this->{$this->main_model}->id = $cdata['id'];
            $this->{$this->main_model}->lat = null;
            $this->{$this->main_model}->lon =  null;
			if (!$this->{$this->main_model}->save($modelEntity)) {
				$message = __('Could not remove Map');
				$this->JsonErrors->entityErros($modelEntity,$message);
				return;
			}
		}
		$this->set(array(
			'success' => true,
			'data'      => $cdata,
			'_serialize' => array('success','data')
		));

    }
	
	public function editMap(){
	//public function edit_map(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
		
		$cdata = $this->request->getQuery();
		
        if(isset($cdata['id'])){
			$modelEntity = $this->{$this->main_model}->newEntity($cdata);
            $this->{$this->main_model}->id = $cdata['id'];
            $this->{$this->main_model}->lat = $cdata['lat'];
            $this->{$this->main_model}->lon =  $cdata['lon'];
			if (!$this->{$this->main_model}->save($modelEntity)) {
				$message = __('Could not Update Map');
				$this->JsonErrors->entityErros($modelEntity,$message);
				return;
			}
		}
		$this->set(array(
			'success' => true,
			'data'      => $cdata,
			'_serialize' => array('success','data')
		));

    }

	public function manageTags(){
	//public function manage_tags(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id   = $user['id'];
		
		$cdata = $this->request->getData();

        $tag_id = $cdata['tag_id'];
        $rb     = $cdata['rb'];

        foreach(array_keys($cdata) as $key){
            if(preg_match('/^\d+/',$key)){
                //----------------
                if($rb == 'add'){
                    $this->_add_nas_tag($key,$tag_id);
                }
                if($rb == 'remove'){
                    $this->Nas->NaTags->deleteAll(array('NaTag.na_id' => $key,'NaTag.tag_id' => $tag_id), false);
                }
                //-------------
            }
        }
     
        $this->set(array(
                'success' => true,
                '_serialize' => array('success')
        ));
    }

    public function editPanelCfg(){
    //public function edit_panel_cfg(){

        $items = [];
        $nn_disabled = true;
        $chilli_heartbeat_flag = false;

		$cdata = $this->request->getQuery();
        //Determine which tabs will be displayed (based on the connection type)
        if(isset($cdata['nas_id'])){
            $q_r = $this->{$this->modelClass}->findById($cdata['nas_id'])->first();
            if($q_r){

                if(($q_r->type == 'CoovaChilli-Heartbeat')||($q_r->type == 'Mikrotik-Heartbeat')){
                    $chilli_heartbeat_flag = true;
                }
                $conn_type = $q_r->connection_type;
                if($conn_type == 'openvpn'){
                    array_push($items,array( 'title'  => __('OpenVPN'), 'itemId' => 'tabOpenVpn', 'xtype' => 'pnlNasOpenVpn'));
                }
                if($conn_type == 'pptp'){
                    array_push($items,array( 'title'  => __('PPTP'),    'itemId' => 'tabPptp', 'xtype' => 'pnlNasPptp'));
                }
                if($conn_type == 'dynamic'){
                    array_push($items,array( 'title'  => __('Dynamic AVP detail'), 'itemId' => 'tabDynamic', 'xtype' => 'pnlNasDynamic' ));
                }
                if($conn_type == 'direct'){
                    $nn_disabled = false;
                }
            }
        }

        //This will be with all of them
       /// array_push($items, array( 'title'  => __('NAS'), 'itemId' => 'tabNas', 'layout' => 'hbox', 
       ///     'items' => array('xtype' => 'frmNasBasic', 'height' => '100%', 'width' => 500)
       /// ));
        array_push($items, array( 'title'  => __('NAS'), 'itemId' => 'tabNas', 'xtype' => 'pnlNasNas', 'nn_disabled' => $nn_disabled));
        array_push($items,array( 'title'  => __('Realms'),'itemId' => 'tabRealms', 'layout' => 'fit', 'border' => false, 'xtype' => 'pnlRealmsForNasOwner'));
        array_push($items,array( 'title'  => __('Photo'),'itemId' => 'tabPhoto', 'xtype' => 'pnlNasPhoto'));
        array_push($items,array( 'title'  => __('Availability'), 'itemId' => 'tabAvailability', 'xtype' => 'gridNasAvailability'));

        if($chilli_heartbeat_flag == true){
            array_push($items,array( 'title'  => __('Heartbeat actions'),'itemId' => 'tabActions','xtype' => 'gridNasActions'));
        }

        $na_id = $cdata['nas_id'];

        $this->set(array(
                'items'     => $items,
                'success'   => true,
                '_serialize' => array('items','success')
        ));

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

        $user_id   = $user['id'];
        $fail_flag = false;
		
		$cdata = $this->request->getData();
	
	    if(isset($cdata['id'])){   //Single item delete
            $message = "Single item ".$cdata['id'];

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($cdata['id']);   
            $owner_id   = $entity->user_id;
            
            if($owner_id != $user_id){
                if($this->Users->is_sibling_of($user_id,$owner_id)== true){
                    $this->{$this->main_model}->delete($entity);
                }else{
                    $fail_flag = true;
                }
            }else{
                $this->{$this->main_model}->delete($entity);
            }
   
        }else{                          //Assume multiple item delete
            foreach($cdata as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                $owner_id   = $entity->user_id;
                if($owner_id != $user_id){
                    if($this->Users->is_sibling_of($user_id,$owner_id) == true){
                        $this->{$this->main_model}->delete($entity);
                    }else{
                        $fail_flag = true;
                    }
                }else{
                    $this->{$this->main_model}->delete($entity);
                }
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
	
    //FOR The CoovaAP heartbeat system
    //This view needs to send plain text out
    public function getCoovaDetail($mac){
    //public function get_coova_detail($mac){

        $this->autoRender = false; // no view to render
        $this->response->type('text');

        $pattern = '/^([0-9a-fA-F]{2}[-]){5}[0-9a-fA-F]{2}$/i';
        if(preg_match($pattern, $mac)< 1){
            $error      = "ERROR=MAC missing or wrong";
            $response   = "HEARTBEAT=NO\n$error\n";
            $this->response->body($response);
            return;
        }

        //MAC format fine; see if defined
        $q_r = $this->{$this->main_model}->find()->where(['Na.community' => $mac,'Na.type' => 'CoovaChilli-Heartbeat'])->first();

        if($q_r){
            $nas_id = $q_r->nasidentifier;
            $nas_ip = $q_r->nasname;
            if(($nas_id == '')||($nas_ip == '')){
                $response = "HEARTBEAT=NO\nERROR=DATA MISSING\n"; 
            }else{
                $response = "HEARTBEAT=YES\nNAS-ID=$nas_id\nNAS-IP=$nas_ip\n";         
            }
            
        }else{
            $response = "HEARTBEAT=NO\nERROR=NO MATCH FOR MAC $mac\n"; 
        }
        $this->response->body($response);
    }
 
    public function noteIndex(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $items = $this->Notes->index($user); 
    }
    
    public function noteAdd(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }   
        $this->Notes->add($user);
    }
    
    public function noteDel(){  
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->Notes->del($user);
    }

    //------ List of available connection types ------
    //This is displayed as options when a user adds a new NAS device
    public function connTypesAvailable(){
    //public function conn_types_available(){

        $items = [];

        $ct = Configure::read('conn_type');
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

    //------ List of configured dynamic attributes types ------
    //This is displayed as a select to choose from when the user adds a NAS of connection type dynamic
    public function dynamicAttributes(){
    //public function dynamic_attributes(){
        $items = [];
        $ct = Configure::read('dynamic_attributes');
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
        
        $menu = $this->GridButtons->returnButtons($user,true,'nas');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

	public function menuForMaps(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtons->returnButtons($user,true,'nas_map');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    private function _add_nas_realm($nas_id,$realm_id){
        $d                          = [];
        $d['id']         = '';
        $d['na_id']      = $nas_id;
        $d['realm_id']   = $realm_id;

		$realmEntity = $this->Nas->NaRealms->newEntity($d);
        $this->Nas->NaRealms->save($realmEntity);
		// ???
        $this->Nas->NaRealms->id      = false;
    }

    private function _add_nas_tag($nas_id,$tag_id){
        //Delete any previous tags if there were any
        $this->Nas->NaTags->deleteAll(array('NaTag.na_id' => $nas_id,'NaTag.tag_id' => $tag_id), false);
        $d             = [];
        $d['id']       = '';
        $d['na_id']    = $nas_id;
        $d['tag_id']   = $tag_id;
		
        //$this->Nas->NaTags->save($d);
		$tagEntity = $this->Nas->NaTags->newEntity($d);
        $this->Nas->NaTags->save($tagEntity);
		
        $this->Nas->NaTags->id    = false;
    }

    private function _get_next_ip($ip){

        $pieces     = explode('.',$ip);
        $octet_1    = $pieces[0];
        $octet_2    = $pieces[1];
        $octet_3    = $pieces[2];
        $octet_4    = $pieces[3];

        if($octet_4 >= 254){
            $octet_4 = 1;
            $octet_3 = $octet_3 +1;
        }else{

            $octet_4 = $octet_4 +1;
        }
        $next_ip = $octet_1.'.'.$octet_2.'.'.$octet_3.'.'.$octet_4;
        return $next_ip;
    }
    
}
