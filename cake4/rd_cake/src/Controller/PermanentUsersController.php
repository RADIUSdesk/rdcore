<?php

namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Inflector;
use Cake\Mailer\Mailer;
use Cake\I18n\FrozenTime;

use Cake\Log\Log;

use Authorization\Exception\ForbiddenException;

class PermanentUsersController extends AppController{

    public $base            = "Access Providers/Controllers/PermanentUsers/";
    protected $main_model   = 'PermanentUsers';

    public function initialize():void{  
        parent::initialize();
        $this->loadModel('PermanentUsers'); 
        $this->loadModel('Users');
        $this->loadModel('Realms');
        $this->loadModel('Profiles');
        $this->loadModel('Radaccts'); 
        $this->loadModel('RealmVlans'); 
                      
        $this->loadComponent('GridButtonsFlat');
        
        $this->loadComponent('GridButtonsRba');
        
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'     => 'PermanentUsers',
            'sort_by'   => 'PermanentUsers.username'
        ]); 
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('Formatter');
        $this->loadComponent('MailTransport');
        $this->loadComponent('RdLogger');
        $this->loadComponent('IspPlumbing');         
        $this->Authentication->allowUnauthenticated([ 'import']); 
             
    }
    
    public function exportCsv(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_q 		= $this->request->getQuery();
        $cloud_id 	= $req_q['cloud_id'];              
        $query 		= $this->{$this->main_model}->find();           
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);    
        $q_r    	= $query->all();

        //Headings
        $heading_line   = [];
            
        if(isset($req_q['columns'])){
            $columns = json_decode($req_q['columns']);
            foreach($columns as $c){
                array_push($heading_line,$c->name);
            }
        }
        
        $data = [
            $heading_line
        ];

        foreach($q_r as $i){
            $columns    = [];
            $csv_line   = [];
            if(isset($req_q['columns'])){
                $columns = json_decode($req_q['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    if($column_name == 'cleartext_password'){
                        $cleartext_password = $this->{$this->main_model}->getCleartextPassword($i->username);
                        array_push($csv_line,$cleartext_password);
                        
                    }elseif($column_name == 'framedipaddress'){
                        $last_session = $this->{'Radaccts'}->find()->where(['username' => $i->username])->select(['acctstarttime','acctstoptime','framedipaddress'])->order('acctstarttime DESC')->first();
                        if($last_session){
                            array_push($csv_line,$last_session->framedipaddress);
                        }else{
                            array_push($csv_line,'');
                        } 
                                          
                    }elseif($column_name == 'last_seen'){                    
                        $last_session = $this->{'Radaccts'}->find()->where(['username' => $i->username])->select(['acctstarttime','acctstoptime','framedipaddress'])->order('acctstarttime DESC')->first();
                        if($last_session){
                            if(!$last_session->acctstoptime){
                                $online   = $this->TimeCalculations->time_elapsed_string($last_session->acctstarttime,false,true);
                                array_push($csv_line,'online '.$online);                
                            }else{
                                array_push($csv_line,'');                             
                            }
                        }else{
                            array_push($csv_line,'');      
                        }             
                    }else{
                        array_push($csv_line,$i->{$column_name});  
                    }
                }
                array_push($data,$csv_line);
            }
        }
         
        $this->setResponse($this->getResponse()->withDownload('PermanentUsers.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set([
            'data' => $data
        ]);         
        $this->viewBuilder()->setOption('serialize', true);
                  
    } 

    public function index(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
                                    
        $right    = $this->Aa->rights_on_cloud();
        
      	$req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['Realms','RealmVlans']);
        
        $limit  = 50;
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
        
        $q = (clone $query)
            ->select([
                'admin_state',
                'count' => $q = $this->PermanentUsers->find()->func()->count('*')
            ])
            ->group('admin_state');
            
        $results = $q->all()->combine('admin_state', 'count')->toArray();
        
        $states = ['active', 'suspended', 'terminated', 'expired'];
        $counts = array_fill_keys($states, 0);
        foreach ($results as $state => $count) {
            $counts[$state] = (int)$count;
        }           

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];
        
        $update = true;
        $delete = true;
        
        if (isset($user['rba_allowed'])) {
            $update = in_array('*', $user['rba_allowed']) || in_array('viewBasicInfo', $user['rba_allowed']);
            $delete = in_array('*', $user['rba_allowed']) || in_array('delete', $user['rba_allowed']);
        }
        
        $now = FrozenTime::now();
                
        foreach($q_r as $i){
        
            $row            = [];
            $fields         = $this->{$this->main_model}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};   
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'last_accept_time'){
                    if($i->{"$field"}){
                        $row['last_accept_time_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                    }else{
                        $row['last_accept_time_in_words'] = __("Never");
                    }
                } 
                if($field == 'last_reject_time'){
                    if($i->{"$field"}){
                        $row['last_reject_time_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                    }else{
                        $row['last_reject_time_in_words'] = __("Never");
                    }
                }    
            }
            
            //Unset password and token fields
            unset($row["password"]);
            unset($row["token"]);
            
            //Get more detail on the activity           
            //select acctstarttime,acctstoptime,framedipaddress from radacct where username='ord9555@superfibre' order by acctstarttime DESC LIMIT 1;          
            $last_session = $this->{'Radaccts'}->find()->where(['username' => $i->username])->select(['acctstarttime','acctstoptime','framedipaddress'])->order('acctstarttime DESC')->first();
            if ($last_session) {

                if (!$last_session->acctstoptime) { // IF there is no acctstoptime -> online
                    $row['last_seen']['status'] = 'online';
                    $row['last_seen']['span']   = $this->TimeCalculations
                        ->time_elapsed_string($last_session->acctstarttime, false, true);
                        
                    if ($i->last_contact) {
                         if ($i->last_contact->diffInHours($now) >= 24) { //Older than 24 hours - Mark it stale
                             $row['last_seen']['stale'] = true;
                         } else {
                            $row['last_seen']['stale'] = false;
                        }
                    }

                } else {
                    $row['last_seen']['status'] = 'offline';
                    $row['last_seen']['span']   = $this->TimeCalculations
                        ->time_elapsed_string($last_session->acctstoptime, false, true);
                }

                $row['framedipaddress'] = $last_session->framedipaddress;

            } else {

                // Oct 2025 We added a last_contact field which are updated also with Accounting Request
                if ($i->last_contact) {
                    $row['last_seen']['status'] = 'offline';
                    $row['last_seen']['span']   = $this->TimeCalculations
                        ->time_elapsed_string($i->last_contact, false, true);
                } else {
                    $row['last_seen'] = ['status' => 'never'];
                }
            }              
            
            $actions_enabled = true;                       
            if($right == 'view'){  
                $actions_enabled = false;                  
            }             
            $row['update']	= $update;
			$row['delete']  = $delete; 
			$row['extra']   = $actions_enabled; 
			                  						
			$row['vlan']    = 'Default VLAN';
			if($i->realm_vlan){
			    $row['vlan'] = $i->realm_vlan->vlan;
			}
			
            array_push($items,$row); 
                 
        }
             
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            'metaData'		=> [
            	'total'	    => $total,
            	'counts'    => $counts
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    //12Feb 2026 -- Convenient function for API calls to get the id for specified username
    //http://127.0.0.1/cake4/rd_cake/permanent-users/id-for-username.json?cloud_id=23&token=b4c6ac81-6316-4c26-b14c-0a6380555b5f&cloud_id=23&username=909-user1
    public function idForUsername(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $data       = [];
        $found      = false;
        $username   = $this->request->getQuery('username'); 
        $cloud_id   = $this->request->getQuery('cloud_id');
        
        $data['username'] = $username; 
        
        if($username && $cloud_id){
             $user   = $this->PermanentUsers->find()
                ->where([
                    'PermanentUsers.username' => $username,
                    'PermanentUsers.cloud_id' => $cloud_id
                    ])
                ->first();
            if($user){
                $data['id'] = $user->id;
                $found = true;    
            }  
        }
                         
        $this->set([
            'data'      => $data, //For the form to load we use data instead of the standard items as for grids
            'success'   => $found
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    
    }
    
    public function add(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
    	$req_d		= $this->request->getData();
    	
    	$postData = $this->request->getData();  	
    	// Log it to the default log file (logs/debug.log)
        Log::write('debug', 'PermanentUsersController::add POST data: ' . json_encode($postData));

          
        //---Get the language and country---
        $country_language                   = Configure::read('language.default');
        if($this->request->getData('language')){
            $country_language    = $this->request->getData('language');
        }
        $country_language   = explode( '_', $country_language);
        $country            = $country_language[0];
        $language           = $country_language[1];
        $req_d['language_id'] = $language;
        $req_d['country_id']  = $country;
        
        //---Set Realm related things--- 
        $realm_entity           = $this->Realms->entityBasedOnPost($this->request->getData());
        if($realm_entity){
            $req_d['realm']   = $realm_entity->name;
            $req_d['realm_id']= $realm_entity->id;
            
            //Test to see if we need to auto-add a suffix
            $suffix                 =  $realm_entity->suffix; 
            $suffix_permanent_users = $realm_entity->suffix_permanent_users;
            
            //Auto populate the email field if it looks like the username is an email address
            if ((filter_var($req_d['username'], FILTER_VALIDATE_EMAIL))&&($req_d['email']== '')) {
                $req_d['email'] = $req_d['username'];
            }
                        
            if(($suffix != '')&&($suffix_permanent_users)){
                $req_d['username'] = $req_d['username'].'@'.$suffix;
            }
        
        }else{
            $this->JsonErrors->errorMessage('realm or realm_id not found in DB or not supplied');
            return;
        }
        
        //---Set profile related things---
        $profile_entity = $this->Profiles->entityBasedOnPost($this->request->getData());
        if($profile_entity){
            $req_d['profile']   = $profile_entity->name;
            $req_d['profile_id']= $profile_entity->id;
        }else{
            $this->JsonErrors->errorMessage('profile or profile_id not found in DB or not supplied');
            return;
        }
        
        //Zero the token to generate a new one for this user:
        $req_d['token'] = '';
    
        if(isset($req_d['from_date'])){
            if($req_d['from_date'] === 'now'){ //Special keyword for API
                $req_d['from_date'] = FrozenTime::now();
            }else{
                $req_d['from_date'] = date_create_from_format('Y-m-d', $req_d['from_date']); // Submit format: 2026-02-02 (ISO) ISO 8601 format
            }
        }
        
        if(isset($req_d['to_date'])){
            if (filter_var($req_d['to_date'], FILTER_VALIDATE_INT) !== false && $req_d['to_date'] < 100) { //Special type for API (Integer = times 30)
                $to = FrozenTime::now();
                $to = $to->addDay(($req_d['to_date']*30));               
                $req_d['to_date'] = $to;
            }else{
                $req_d['to_date'] = date_create_from_format('Y-m-d', $req_d['to_date']); // Submit format: 2026-02-02 (ISO) ISO 8601 format
            }
        }
                            
        $check_items = [
			'active'
		];

        foreach($check_items as $i){
            if(isset($req_d[$i])){
                $req_d[$i] = 1;
            }else{
                $req_d[$i] = 0;
            }
        }
        
        //Set these fields to empty if they are not included
        $not_null_fields = [
            'name',
            'surname',
            'address',
            'phone',
            'email'       
        ];
        
        foreach($not_null_fields as $j){
             if(!isset($req_d[$j])){
                $req_d[$j] = '';
             }       
        }
        
        //The rest of the attributes should be same as the form..
        $entity = $this->{$this->main_model}->newEntity($req_d);
         
        if($this->{$this->main_model}->save($entity)){
            $reply_data         = $req_d;
            $reply_data['id']   = $entity->id;
            $this->set(array(
                'success' => true,
                'data'    => $reply_data
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }else{
        	$additional = [];
        	if($entity->getInvalidField('username')){
        		$additional['invalid_username'] = $entity->getInvalidField('username');
        	}
        	        
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message,$additional);
        }      
    }
     
    public function import(){

        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

        $c_l        = Configure::read('language.default');
        $c_l        = explode('_', $c_l);
        $country    = $c_l[0];
        $language   = $c_l[1];
        $cloud_id   = $this->request->getData('cloud_id');                
        //$tmpName    = $_FILES['csv_file']['tmp_name'];
        
        $file       = $this->request->getData('csv_file');
        $filename   = $file->getClientFilename();
        if(!$filename){
            $this->set([
                'success' => false,
                'message' => 'Unable to open CSV file.'
            ]);
            $this->viewBuilder()->setOption('serialize', true);
            return;
        
        }
                      
        $tmpName = WWW_ROOT . 'files' . DS . 'imagecache'. DS . 'users.csv';
        if (file_exists($tmpName)) {
            $this->set([
                'success' => false,
                'message' => 'A user import is already in progress. Please wait.'
            ]);
            $this->viewBuilder()->setOption('serialize', ['success', 'message']);
            return;
        }
        
        
        $file->moveTo($tmpName);        
        $cmd = sprintf(
            "%s/bin/cake import_users %s %d %s %s > /dev/null 2>&1 &",
            ROOT,
            escapeshellarg($tmpName),
            $cloud_id,
            escapeshellarg($language),
            escapeshellarg($country)
        );
        exec($cmd);
        
        $this->set([
            'success' => true,
            'message' => 'Import started in background.'
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'message']);

    }
       
    
    public function delete() {
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$req_d		= $this->request->getData();
       
	    if(isset($req_d['id'])){   //Single item delete      
            $entity     = $this->{$this->main_model}->get($req_d['id']);   
            $this->{$this->main_model}->delete($entity);       
        }else{                          //Assume multiple item delete
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

    public function viewBasicInfo(){
    	
  		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
       
        $entity     = $this->{$this->main_model}->get( $this->request->getQuery('user_id'));
        $username   = $entity->username;
        $items      = [];
        
        $fields         = $this->{$this->main_model}->getSchema()->columns();
        
        foreach($fields as $i){
            if($entity->{$i} !== null){
                $items[$i] = $entity->{$i};
            }
        }
        
        $items['created']   = $this->TimeCalculations->time_elapsed_string($entity->created,false,false);    
        if($entity->last_reject_time){
            $items['last_reject_time']  = $this->TimeCalculations->time_elapsed_string($entity->last_reject_time,false,false);
        }
        
        if($entity->last_accept_time){
            $items['last_accept_time']  = $this->TimeCalculations->time_elapsed_string($entity->last_accept_time,false,false);
        }
        
        if($entity->data_cap){
            $items['data_cap'] = $this->Formatter->formatted_bytes($items['data_cap']);
        }
        
        if($entity->data_used){
            $items['data_used'] = $this->Formatter->formatted_bytes($items['data_used']);
        }
             
        if($entity->time_cap){
            $items['time_cap'] = $this->Formatter->formatted_seconds($items['time_cap']);
        }
        
        if($entity->time_used){
            $items['time_used'] = $this->Formatter->formatted_seconds($items['time_used']);
        }
        
        unset($items['password']);
        unset($items['token']);

        if(($entity->from_date)&&($entity->to_date)){
            $items['always_active'] = false;
            $items['from_date']    = $items['from_date']->format("m/d/Y");
            $items['to_date']      = $items['to_date']->format("m/d/Y");
        }else{
            $items['always_active'] = true;
        }

        $this->set([
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function editBasicInfo(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        } 
        
        $req_d		= $this->request->getData();
       
        //---Set Realm related things---               
        if(isset($req_d['realm_id'])||isset($req_d['realm'])){ //If it is not set then we don't bother
        
            $realm_entity  = $this->Realms->entityBasedOnPost($req_d);
            if($realm_entity){
                $req_d['realm']   = $realm_entity->name;
                $req_d['realm_id']= $realm_entity->id;
                //FIXME WE HAVE TO CHECK AND CHANGE USERNAME IF CHANGE ...
            
            }else{
                $message = __('realm or realm_id not found in DB');
                $this->JsonErrors->errorMessage($message);
                return;
            }
        }
        
        //---Set profile related things---
        if(isset($req_d['profile_id'])||isset($req_d['profile'])){ //If it is not set then we don't bother       
            $profile_entity = $this->Profiles->entityBasedOnPost($req_d);
            if($profile_entity){
                $req_d['profile']   = $profile_entity->name;
                $req_d['profile_id']= $profile_entity->id;
            }else{
                $message = __('profile or profile_id not found in DB');
                $this->JsonErrors->errorMessage($message);
                return;
            }
        }
        
        //Clear the token
        unset($req_d['token']);
             
        $check_items = [
			'always_active'
		];

        foreach($check_items as $i){
            if(isset($req_d[$i])){
            	if($req_d[$i] == null){
            		$req_d[$i] = 0;
            	}else{
                	$req_d[$i] = 1;
                }
            }else{
                $req_d[$i] = 0;
            }
        }
        
        //If it is expiring; set it in the correct format        
        try {
            $entity = $this->{$this->main_model}->get($req_d['id']); //First load the entity
        } catch (RecordNotFoundException $e) {
            throw new NotFoundException('Entity not found');
        }
              
        if($req_d['always_active'] == 0){
        
            //Set the date and time
            if(isset($req_d['from_date'])){                           
                if($req_d['from_date'] === 'now'){ //Special keyword for API
                    $req_d['from_date'] = FrozenTime::now();
                }else{
                    $req_d['from_date'] = date_create_from_format('Y-m-d', $req_d['from_date']); // Submit format: 2026-02-02 (ISO) ISO 8601 format
                }
                
                //-- Dev Note --
                //If you don't want the from_date to change after creation, unset it here
                //unset($req_d['from_date']);
                //-- END Dev Note --               
            }
            
            if(isset($req_d['to_date'])){
                if (filter_var($req_d['to_date'], FILTER_VALIDATE_INT) !== false && $req_d['to_date'] < 100) { //Special type for API (Integer = times 30)
                
                    $multiplier = (int)$req_d['to_date'];
                    // Existing value from entity (important!)
                    $oldToDate = $entity->to_date instanceof FrozenTime
                        ? $entity->to_date
                        : FrozenTime::parse($entity->to_date);

                    $now = FrozenTime::now();

                    if ($oldToDate <= $now) {
                        // Old date is past or now → base on NOW, x * 3 days
                        $newToDate = $now->addDays($multiplier * 30);
                    } else {
                        // Old date is in the future → extend from OLD date, x * 30 days
                        $newToDate = $oldToDate->addDays($multiplier * 30);
                    }

                    $req_d['to_date'] = $newToDate;
                
                }else{
                    $req_d['to_date'] = date_create_from_format('Y-m-d', $req_d['to_date']); // Submit format: 2026-02-02 (ISO) ISO 8601 format
                }
            }
            
        }else{
        	$req_d['from_date'] = null;
        	$req_d['to_date'] = null;    
        }   
        
        
        $this->{$this->main_model}->patchEntity($entity, $req_d);
     
        if ($this->{$this->main_model}->save($entity)) {
        
        	$this->IspPlumbing->disconnectIfActive($entity);
        	
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
    }

    public function viewPersonalInfo(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
       
       	$req_q      = $this->request->getQuery(); //q_data is the query data
     	$items      = [];
        //TODO Check if the owner of this user is in the chain of the APs
        if(isset($req_q['user_id'])){
            $entity         = $this->{$this->main_model}->get($req_q['user_id']);
            $include_items  = ['name','surname','phone','address', 'email','language_id','country_id','id'];
            foreach($include_items as $i){
                $items[$i] = $entity->{$i};
            }
            $items['language'] = $items['country_id'].'_'.$items['language_id'];
        }
        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function editPersonalInfo(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
       
        //TODO Check if the owner of this user is in the chain of the APs
        $req_d		= $this->request->getData();
        unset($req_d['token']);
        //Get the language and country
        $country_language   = explode( '_', $req_d['language'] );
        $country            = $country_language[0];
        $language           = $country_language[1];

        $req_d['language_id'] = $language;
        $req_d['country_id']  = $country;

        $entity = $this->{$this->main_model}->get($req_d['id']);
        $this->{$this->main_model}->patchEntity($entity, $req_d);
     
        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
    }

    public function privateAttrIndex(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $username   = $this->request->getQuery('username');
        $items      =  $this->{$this->main_model}->privateAttrIndex($username);

        $this->set(array(
            'items'         => $items,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function privateAttrAdd(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
       
        $req_d  = $this->request->getData();
        $entity =  $this->{$this->main_model}->privateAttrAdd($this->request);
        $errors = $entity->getErrors();
        if($errors){
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }else{        
            $req_d['id'] = $entity->id;
            $this->set(array(
                'items'     => $req_d,
                'success'   => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
    }

    public function privateAttrEdit(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $entity =  $this->{$this->main_model}->privateAttrEdit($this->request);
        $req_d  = $this->request->getData(); 
        
        //== START NEW FEATURE ==
        //===Check if we need to zero the accounting when adjusting Rd-Total-Time or Rd-Total-Data (New feature Nov 2022)
        //== if you also post 'accounting_zero' then we will clear the accounting records 
        if(($req_d['attribute'] == 'Rd-Total-Time')||($req_d['attribute'] == 'Rd-Total-Data')){
        	//if(true){
        	if(isset($req_d['accounting_zero'])){
        		$req_q    	= $this->request->getQuery();
        		if(isset($req_q['username'])){
        				$e_pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.username' => $req_q['username']])->first();
        				if($e_pu){
							$username 	= $e_pu->username;
							$realm		= $e_pu->realm;
							$this->{'Radaccts'}->deleteAll(['Radaccts.username' => $username,'Radaccts.realm' => $realm]);
						}
        		}
        	}
		}
        //== END NEW FEATURE ==        
   
        $errors = $entity->getErrors();
        if($errors){
            $message = __('Could not edit item');
            $this->JsonErrors->entityErros($entity,$message);
        }else{        
            $req_d['id'] = $entity->id;
            $this->set(array(
                'items'     => $req_d,
                'success'   => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
    }

    public function privateAttrDelete(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
        if($this->{$this->main_model}->privateAttrDelete($this->request)){
            $message = __('Could not delete some items');
            $this->JsonErrors->errorMessage($message);  
        }else{
            $this->set(array(
                'success'   => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
    }

    public function restrictListOfDevices(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id  = $user['id'];
        $req_q    = $this->request->getQuery();

        if((isset($req_q['username']))&&(isset($req_q['restrict']))){
            $username = $req_q['username'];
            if($req_q['restrict'] == 'true'){
                $this->{$this->main_model}->setRestrictListOfDevices($username,true);      
            }else{
                $this->{$this->main_model}->setRestrictListOfDevices($username,false);
            }
        }
        $this->set(array(
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function autoMacOnOff(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $req_q    = $this->request->getQuery();

        if((isset($req_q['username']))&&(isset($req_q['auto_mac']))){
            $username = $req_q['username'];
            if($req_q['auto_mac'] == 'true'){
                $this->{$this->main_model}->setAutoMac($username,true);     
            }else{
                $this->{$this->main_model}->setAutoMac($username,false);
            }
        }

        $this->set(array(
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function enableDisable(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_d      = $this->request->getData(); 
        $rb         = $req_d['rb'];
        $d          = [];

        if($rb == 'enable'){
            $d['active'] = 1;
        }else{
            $d['active'] = 0;
        }
        
        if(isset($req_d['id'])){
        	$entity = $this->{$this->main_model}->get($req_d['id']);
           	$this->{$this->main_model}->patchEntity($entity, $d);
            $this->{$this->main_model}->save($entity);       
        }

        foreach(array_keys($req_d) as $key){
            if(preg_match('/^\d+/',$key)){
                $entity = $this->{$this->main_model}->get($key);
                $this->{$this->main_model}->patchEntity($entity, $d);
                $this->{$this->main_model}->save($entity);             
                $this->IspPlumbing->disconnectIfActive($entity);             
            }
        }
        
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function changeAdminState(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_d      = $this->request->getData(); 
        $d          = [];
        $d['admin_state'] = $req_d['admin_state'];
        
        if(isset($req_d['id'])){
        	$entity = $this->{$this->main_model}->get($req_d['id']);
           	$this->{$this->main_model}->patchEntity($entity, $d);
            $this->{$this->main_model}->save($entity);
            $this->IspPlumbing->disconnectIfActive($entity);        
        }

        foreach(array_keys($req_d) as $key){
            if(preg_match('/^\d+/',$key)){
                $entity = $this->{$this->main_model}->get($key);
                $this->{$this->main_model}->patchEntity($entity, $d);
                $this->{$this->main_model}->save($entity);             
                $this->IspPlumbing->disconnectIfActive($entity);             
            }
        }
        
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function viewPassword(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $success    = false;
        $value      = false;
        $activate   = false;
        $expire     = false;

		$req_q      = $this->request->getQuery();

        if(isset($req_q['user_id'])){

            $q_r = $this->{$this->main_model}->get($req_q['user_id']);
            if($q_r){
               if($q_r->from_date ){
                 $activate = $q_r->from_date->format("m/d/Y");   
               }
               if($q_r->to_date ){
                 $expire = $q_r->to_date->format("m/d/Y");   
               }
            }
            $pw = $this->{$this->main_model}->getCleartextPassword($q_r->username);

            if($pw){
                $value = $pw;
            }

            $success = true;
        }
        $this->set([
            'success'   => $success,
            'value'     => $value,
            'activate'  => $activate,
            'expire'    => $expire
        ]);
        $this->viewBuilder()->setOption('serialize', true);

    }

    public function changePassword(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

		$req_d      = $this->request->getData();
        unset($req_d['token']);

        //Set the date and time
        $extDateSelects = [
                'from_date',
                'to_date'
        ];
        foreach($extDateSelects as $d){
            if(isset($req_d[$d])){
                $newDate    = $newDate = date_create_from_format('Y-m-d', $req_d[$d]); // Submit format: 2026-02-02 (ISO) ISO 8601 format
                $req_d[$d]  = $newDate;
            }  
        }

        $entity = $this->{$this->main_model}->get($req_d['user_id']);
        unset($req_d['user_id']);

        $this->{$this->main_model}->patchEntity($entity, $req_d);

        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = __('Could not change password');
            $this->JsonErrors->entityErros($entity,$message);
        }           
    }
    
     public function emailUserDetails(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $data   = $this->request->getData();
        $to     = $data['email'];
        $message= $data['message']; 
        
        $query  = $this->{$this->main_model}->find()->contain(['Radchecks']);
        $entity = $query->where(['PermanentUsers.id' => $data['id']])->first();   
        
        if($entity){
        
            $password = false;       
            foreach($entity->radchecks as $rc){
                if($rc->attribute == 'Cleartext-Password'){
                    $password = $rc->value;
                    break;
                }
            }
            
            $username       = $entity->username;
            $profile        = $entity->profile;
            $extra_name     = $entity->extra_name;
            $extra_value    = $entity->extra_value;
            
            $meta_data      = $this->MailTransport->setTransport($data['cloud_id']);           
            $success        = false;
                      
            if($meta_data !== false){         
                $email 	= new Mailer(['transport'   => 'mail_rd']);
                $from   = $meta_data['from'];
                $email->setSubject('User credentials')
                    ->setFrom($from)
                    ->setTo($to)
                    ->setViewVars(compact( 'username', 'password','profile','extra_name','extra_value','message'))
                    ->setEmailFormat('html')
                    ->viewBuilder()
                    	->setTemplate('user_detail_admin')
                		->setLayout('user_notify');                   

                $email->deliver();
               
                $settings_cloud_id = $this->MailTransport->getCloudId();
            	$this->RdLogger->addEmailHistory($settings_cloud_id,$to,'user_detail',"$username $password $message");
               
                $success    = true;
                $this->set([
                    'data'          => $data,
                    'success'       => $success
                ]);
                $this->viewBuilder()->setOption('serialize', true);  
            }else{                     
                $this->set([
                    'data'          => $data,
                    'success'       => $success,
                    'message'       => 'Email Disabled / Not Configured',
                ]);
                $this->viewBuilder()->setOption('serialize', true); 
            }            
        }       
    }
   
    public function menuForGrid(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $role  = $this->Aa->rights_on_cloud(); 
        //print_r($role);
        //$role  = 'admin';           
        $menu   = $this->GridButtonsRba->returnButtons($role);
        $this->set([
            'items'     => $menu,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    function menuForUserDevices(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
    
        $settings = ['listed_only' => false,'add_mac' => false];
       
        $req_q    = $this->request->getQuery();

        if(isset($req_q['username'])){
            $username = $req_q['username'];
            $settings = $this->{$this->main_model}->deviceMenuSettings($username,true);     
        }

        //Empty by default
        $menu = [
            [
                'xtype' => 'buttongroup',
                'title' => false, 
                'items' => [
                    [ 
                        'xtype'     =>  'button', 
                        'glyph'     => Configure::read('icnReload'), 
                        'scale'     => 'large', 
                        'itemId'    => 'reload',   
                        'tooltip'   => __('Reload'),
                        'ui'        => 'button-orange'
                    ],
                    [ 
                        'xtype'         => 'checkbox', 
                        'boxLabel'      => 'Connect only from listed devices', 
                        'itemId'        => 'chkListedOnly',
                        'checked'       => $settings['listed_only'], 
                        'cls'           => 'lblRd',
                        'margin'        => 0
                    ],
                    [ 
                        'xtype'         => 'checkbox', 
                        'boxLabel'      => 'Auto-add device after authentication', 
                        'itemId'        => 'chkAutoAddMac',
                        'checked'       => $settings['add_mac'], 
                        'cls'           => 'lblRd',
                        'margin'        => 0
                    ]
                ]
            ] 
        ];

        $this->set([
            'items'     => $menu,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    function menuForAccountingData(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $right  = $this->Aa->rights_on_cloud();
        $menu = $this->GridButtonsFlat->returnButtons(false,'FrAcctAndAuth',$right);
        $this->set([
            'items'     => $menu,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    function menuForAuthenticationData(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $right  = $this->Aa->rights_on_cloud();
        $menu   = $this->GridButtonsFlat->returnButtons(true,'FrAcctAndAuth',$right);
        $this->set([
            'items'     => $menu,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
}

?>
