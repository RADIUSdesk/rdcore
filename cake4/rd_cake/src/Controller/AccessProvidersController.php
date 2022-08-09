<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;


class AccessProvidersController extends AppController{
  
    public $base  = "Access Providers/Controllers/AccessProviders/";
    
    protected $owner_tree = [];
    
    protected $main_model = 'Users';
    
    protected $rights = [
        'cmp_admins'            => 'AccessProviders/index',
        'cmp_realms'            => 'Realms/index',
        'cmp_permanent_users'   => 'PermanentUsers/index',
        'cmp_vouchers'          => 'Vouchers/index',
        'cmp_profiles'          => 'Profiles/index',
        'cmp_radius'            => 'DynamicClients/index',
        'cmp_mesh_desk'         => 'Meshes/index',
        'cmp_ap_desk'           => 'ApProfiles/index',
        //'cmp_alerts'            => 'ApProfiles/index',
        'cmp_login_pages'       => 'DynamicDetails/index',
        'cmp_wizards'           => 'Wizards/index',
        'cmp_openvpn_servers'   => 'OpenvpnServers/index',
        'cmp_traffic_classes'   => 'TrafficClasses/index', //This will imply also Facebook XWF
        'cmp_unknown_dynamic_clients'   => 'UnknownDynamicClients/index',
        'cmp_unknown_nodes'     => 'UnknownNodes/index',
    ];
    protected   $acl_base = "Access Providers/Controllers/";
  
    public function initialize(){  
        parent::initialize();  
          
        $this->loadModel('Users'); 
        $this->loadModel('Groups');
        $this->loadModel('TreeTags');
		$this->loadModel('UserSettings');
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => $this->main_model
        ]);
                
        $this->loadComponent('WhiteLabel'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('JsonErrors');     
    }
    
    public function test(){
    
        $node = $this->{$this->main_model}->find()->where(['Users.id' => 51])->first(); 
      
        if($node){   
            $this->{$this->main_model}->patchEntity($node,['parent_id' => 50]);
            $this->{$this->main_model}->save($node);
        };
          
        $this->set([
            'success'       => true,
            '_serialize'    => ['success']
        ]);
        return;
    }
    
    
    public function exportCsv(){
   
        $query = $this->{$this->main_model}->find(); 
        $this->CommonQuery->build_ap_query($query,$user); //AP QUERY is sort of different in a way
        
        $q_r    = $query->all();

        //Headings
        $heading_line   = array();
        if(isset($this->request->query['columns'])){
            $columns = json_decode($this->request->query['columns']);
            foreach($columns as $c){
                array_push($heading_line,$c->name);
            }
        }
        
        $data = [
            $heading_line
        ];
        
        foreach($q_r as $i){

            $columns    = array();
            $csv_line   = array();
            if(isset($this->request->query['columns'])){
                $columns = json_decode($this->request->query['columns']);
                foreach($columns as $c){                  
               		array_push($csv_line,$i->{$column_name});  
                }
                array_push($data,$csv_line);
            }
        }
         
        $_serialize = 'data';
        $this->setResponse($this->getResponse()->withDownload('export.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(compact('data', '_serialize'));  
    } 
    
     //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
       
        $query = $this->{$this->main_model}->find();
        
        $this->CommonQuery->build_ap_query($query,$user); //AP QUERY is sort of different in a way
        
        //===== PAGING (MUST BE LAST) ======
        $limit  = 50; 
        $page   = 1;
        $offset = 0;
        if(isset($this->request->query['limit'])){
            $limit  = $this->request->query['limit'];
            $page   = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];
        
        foreach($q_r as $i){            
            $row        = [];
            $fields     = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};             
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            }
            array_push($items,$row);
        }
        $this->set([
            'items' 		=> $items,
            'success' 		=> true,
            'totalCount' 	=> $total,
            '_serialize' 	=> ['items','success','totalCount']
        ]);
    }
   
    public function add(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
  
        $check_items = [
			'active'
		];
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }    

        //Get the language and country
        $country_language   = explode( '_', $this->request->data['language'] );
        $country            = $country_language[0];
        $language           = $country_language[1];

        $this->request->data['language_id'] = $language;
        $this->request->data['country_id']  = $country;

        //Get the group ID for AP's
        $ap_name    = Configure::read('group.ap');
        $q_r        = $this->Groups->find()->where(['Groups.name' => $ap_name])->first();
        $group_id   = $q_r->id;
        $this->request->data['group_id'] = $group_id;

        //Zero the token to generate a new one for this user:
        $this->request->data['token'] = '';

        //The rest of the attributes should be same as the form..
        $entity = $this->{$this->main_model}->newEntity($this->request->data()); 
        if($this->{$this->main_model}->save($entity)){
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }else{
            $message = 'Error';
            $errors = $entity->errors();
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
                'message'   => ['message' => __('Could not create item')],
                '_serialize' => ['errors','success','message']
            ]);
        }   
    }
    
    public function view(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $items = array();
        if(isset($this->request->query['ap_id'])){
			$ap_id = $this->request->query['ap_id'];
            $q_r = $this->{$this->main_model}->find()->where([$this->main_model.'.id' => $ap_id])->first();
            if($q_r){
                $owner_tree         = $this->Users->find_parents($q_r->parent_id);
                $items['id']        = $q_r->id;
                $items['username']  = $q_r->username;
                $items['name']      = $q_r->name;
                $items['surname']   = $q_r->surname;
                $items['phone']     = $q_r->phone;
                $items['address']   = $q_r->address;
                $items['email']     = $q_r->email;
                $items['active']    = $q_r->active;
                $items['can_manage_tree_tags']    = $q_r->can_manage_tree_tags;
                $items['monitor']   = $q_r->monitor;
                $items['owner']     = $owner_tree;
                $language           = $q_r->country_id.'_'.$q_r->language_id;
                $items['language']  = $language;
                $items['timezone_id']  = $q_r->timezone_id;
                $items['api_key']   = $q_r->token;
                
                // Get the alert_activate and alert_frequency
				$this->loadModel('UserSettings');
				$items['alert_activate'] = 0;
				$items['alert_frequency'] = 1;
				$q_alert = $this->UserSettings->find()->where(['UserSettings.user_id' => $ap_id,"UserSettings.name" => "alert_activate"])->first();
				if($q_alert) {
					if(intval($q_alert->value) > 0){
						$items['alert_activate'] = 'alert_activate';
					} else {
						$items['alert_activate'] = 0;
					}
				}
				$q_freq = $this->UserSettings->find()->where(['UserSettings.user_id' => $ap_id,"UserSettings.name" => "alert_frequency"])->first();
				if($q_freq) {
					$items['alert_frequency'] = $q_freq->value;
				}
				
				$sel_comp   = $this->_getSelectedComponents($this->request->query['ap_id']);
				$items      = array_merge($items, $sel_comp);
				
                $wl         = $this->WhiteLabel->detail($this->request->query['ap_id']);   
                $items      = array_merge($items, $wl);
                
                //Get the items that the owner can actually see
                $meta_data  = $this->_getAllowedComponentsFor($ap_id);
                   
            }
        }
        
        $this->set(array(
            'data'      => $items,
            'success'   => true,
            'metaData'  => $meta_data,
            '_serialize'=> array('success', 'data','metaData')
        ));
    }
  
    public function edit(){
    
         //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.    
        $this->viewBuilder()->layout('ext_file_upload');
    
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];

        //We need to unset a few of the values submitted:
        unset($this->request->data['token']);
        unset($this->request->data['password']);
        unset($this->request->data['parent_id']);
        
        $ap_id = $this->request->data['id'];

        $check_items = [
			'active',
			'monitor',
			'wl_active',
			'wl_img_active',
			'alert_activate',
			'can_manage_tree_tags'
		];
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }    

        //Get the language and country
        $country_language   = explode( '_', $this->request->data['language'] );

        $country            = $country_language[0];
        $language           = $country_language[1];

        $this->request->data['language_id'] = $language;
        $this->request->data['country_id']  = $country;
        
        $e_user = $this->{$this->main_model}->get($ap_id);
        $this->{$this->main_model}->patchEntity($e_user, $this->request->data());
        
		$this->loadModel('UserSettings');

		// Set the Alerts email threshold and frequency
		if(!array_key_exists('alert_activate',$this->request->data)){
			$this->request->data['alert_activate'] = 0;
		}
		if(!array_key_exists('alert_frequency', $this->request->data)){
			$this->request->data['alert_frequency'] = 1;
		}
		$this->UserSettings->deleteAll(['user_id' => $ap_id,'name' => 'alert_activate']);
		$this->UserSettings->deleteAll(['user_id' => $ap_id,'name' => 'alert_frequency']);
		$us_entity = $this->UserSettings->newEntity();
		$us_entity->user_id    = $ap_id;
		$us_entity->name       = 'alert_activate';
		$us_entity->value      = $this->request->data['alert_activate'];
		$this->UserSettings->save($us_entity);
		$us_entity = $this->UserSettings->newEntity();
		$us_entity->user_id    = $ap_id;
		$us_entity->name       = 'alert_frequency';
		$us_entity->value      = $this->request->data['alert_frequency'];
		$this->UserSettings->save($us_entity);
		
        //The White Label stuff ONLY if it is enabled Site Wide
        
        if(Configure::read('whitelabel.active') == true){
            $looking_for    = ['wl_active','wl_header','wl_h_bg','wl_h_fg','wl_footer','wl_img_active','wl_img_file'];
        
            //Only if it is enabled do we do it
            if($this->request->data['wl_active'] == 1){
            
                $new_logo = false;
            
                //Check if there came some image with it
                if(isset($_FILES['wl_img_file_upload'])){
                    if($_FILES['wl_img_file_upload']['size'] > 0){    
                        $path_parts     = pathinfo($_FILES['wl_img_file_upload']['name']);
                        $unique         = time();
                        $filename       = $unique.'.'.$path_parts['extension'];
                        $dest           = WWW_ROOT."img/access_providers/".$filename;
                        move_uploaded_file ($_FILES['wl_img_file_upload']['tmp_name'] , $dest);
                        $new_logo       = true;
                    }
                    
                    if($new_logo == true){
                        $this->UserSettings->deleteAll(['user_id' => $ap_id,'name' => 'wl_img_file']);
                        $entity = $this->UserSettings->newEntity();
                        $entity->user_id    = $ap_id;
                        $entity->name       = 'wl_img_file';
                        $entity->value      = $filename;
                        $this->UserSettings->save($entity);
                    }
                }   
            
                foreach($looking_for as $i){    
                    //Delete old one
                    if(($i == 'wl_img_file')&&($new_logo == true)){
                        continue; //We skip it if we added a new file
                    }
                      
                    $this->UserSettings->deleteAll(['user_id' => $ap_id,'name' => $i]);
                    //Add a New ONE
                    $entity             = $this->UserSettings->newEntity();
                    $entity->user_id    = $ap_id;
                    $entity->name       = $i;
                    $entity->value      = $this->request->data["$i"];
                    $this->UserSettings->save($entity);
                }
            }else{
                //Only disable it
                $this->UserSettings->deleteAll(['user_id' => $ap_id,'name' => 'wl_active']);
                $entity = $this->UserSettings->newEntity();
                $entity->user_id    = $ap_id;
                $entity->name       = 'wl_active';
                $entity->value      = 0;
                $this->UserSettings->save($entity);
            }  
        }
        
        //Selected Components
        $this->_setSelectedComponents($ap_id);

        if ($this->{$this->main_model}->save($e_user)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            
            $errors = $e_user->errors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }
            
            $this->set(array(
                'errors'    => $a,
                'success'   => false,
                'message'   => array('message' => __('Could not create item')),
                '_serialize' => array('errors','success','message')
            ));
        }
        
    }
   
    
    public function menuForGrid(){   
        $menu = $this->GridButtonsFlat->returnButtons(false,'access_providers');
        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }
    
    public function delete($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
	    if(isset($this->request->data['id'])){   //Single item delete      
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);
            $this->{$this->main_model}->delete($entity);  
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);               
               	$this->{$this->main_model}->delete($entity);
            }
        }
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
	}
	
	public function changePassword(){

        $success = false;
        if(isset($this->request->data['user_id'])){
            $entity = $this->{$this->main_model}->get($this->request->data['user_id']); 
            $data = [
                'password'  => $this->request->data['password'],
                'token'     => ''
            ];
            $this->{$this->main_model}->patchEntity($entity, $data);
            $this->{$this->main_model}->save($entity);
            $success               = true;  
        }

        $this->set([
            'success' => $success,
            '_serialize' => ['success']
        ]);
    }
    
    public function enableDisable(){       

        $rb  	= $this->request->data['rb'];
        if($rb == 'enable'){
            $active = 1;
        }else{
            $active = 0;
        }
        foreach(array_keys($this->request->data) as $key){
            if(preg_match('/^\d+/',$key)){  
                $entity = $this->{$this->main_model}->get($key);
                $entity->active = $active;
                $this->{$this->main_model}->save($entity);  
            }
        }
        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
    }
	
}
