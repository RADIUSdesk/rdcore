<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class PermanentUsersController extends AppController{

    public $base         = "Access Providers/Controllers/PermanentUsers/";
    protected $owner_tree   = array();
    protected $main_model   = 'PermanentUsers';

    public function initialize(){  
        parent::initialize();
        $this->loadModel('PermanentUsers'); 
        $this->loadModel('Users');
        $this->loadModel('Realms');
        $this->loadModel('Profiles');      
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'     => 'PermanentUsers',
            'sort_by'   => 'PermanentUsers.username'
        ]); 
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('Formatter');       
    }

    public function exportCsv(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
               
        $query = $this->{$this->main_model}->find(); 
   
        if($this->CommonQuery->build_with_realm_query($query,$user,['Users','PermanentUserNotes' => ['Notes'],'Realms']) == false){
            //FIXME Later we can redirect to an error page for CSV
            return;
        }
        
        $q_r    = $query->all();

        //Headings
        $heading_line   = [];
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

            $columns    = [];
            $csv_line   = [];
            if(isset($this->request->query['columns'])){
                $columns = json_decode($this->request->query['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    if($column_name == 'notes'){
                        $notes   = '';
                        foreach($i->permanent_user_notes as $un){
                            if(!$this->Aa->test_for_private_parent($un->note,$user)){
                                $notes = $notes.'['.$un->note->note.']';    
                            }
                        }
                        array_push($csv_line,$notes);
                    }elseif($column_name =='owner'){
                        $owner_id       = $i->user_id;
                        $owner_tree     = $this->Users->find_parents($owner_id);
                        array_push($csv_line,$owner_tree); 
                    }elseif($column_name == 'cleartext_password'){
                        $cleartext_password = $this->{$this->main_model}->getCleartextPassword($i->username);
                        array_push($csv_line,$cleartext_password);
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

      	$cloud_id = $this->request->query['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQuery->build_cloud_query($query,$cloud_id,[]);
        
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
        
            $row            = [];
            $fields         = $this->{$this->main_model}->schema()->columns();
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
                 
			$row['update']	= true;
			$row['delete']	= true; 
            array_push($items,$row); 
                 
        }
        
       
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => array('items','success','totalCount')
        ));
    }
    
    public function add(){
          
        //---Get the language and country---
        $country_language                   = Configure::read('language.default');
        if($this->request->getData('language')){
            $country_language               = explode( '_', $this->request->getData('language'));
        }
        $country                            = $country_language[0];
        $language                           = $country_language[1];
        $this->request->data['language_id'] = $language;
        $this->request->data['country_id']  = $country;
        
        //---Set Realm related things--- 
        $realm_entity           = $this->Realms->entityBasedOnPost($this->request->data);
        if($realm_entity){
            $this->request->data['realm']   = $realm_entity->name;
            $this->request->data['realm_id']= $realm_entity->id;
            
            //Test to see if we need to auto-add a suffix
            $suffix                 =  $realm_entity->suffix; 
            $suffix_permanent_users = $realm_entity->suffix_permanent_users;
            if(($suffix != '')&&($suffix_permanent_users)){
                $this->request->data['username'] = $this->request->data['username'].'@'.$suffix;
            }
        
        }else{
            $this->JsonErrors->errorMessage('realm or realm_id not found in DB or not supplied');
            return;
        }
        
        //---Set profile related things---
        $profile_entity = $this->Profiles->entityBasedOnPost($this->request->data);
        if($profile_entity){
            $this->request->data['profile']   = $profile_entity->name;
            $this->request->data['profile_id']= $profile_entity->id;
        }else{
            $this->JsonErrors->errorMessage('profile or profile_id not found in DB or not supplied');
            return;
        }
        
        //Zero the token to generate a new one for this user:
        $this->request->data['token'] = '';

        //Set the date and time
        $extDateSelects = [
                'from_date',
                'to_date'
        ];
        foreach($extDateSelects as $d){
            if(isset($this->request->data[$d])){
                $newDate = date_create_from_format('m/d/Y', $this->request->data[$d]);
                $this->request->data[$d] = $newDate;
            }  
        }
        
        $check_items = [
			'active'
		];
		
		//Default for account active if not in POST data
		if(!$this->request->getData('active')){
		    $this->request->data['active'] = 1;
		}

        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
        
        //The rest of the attributes should be same as the form..
        $entity = $this->{$this->main_model}->newEntity($this->request->data());
         
        if($this->{$this->main_model}->save($entity)){
            $reply_data         = $this->request->data();
            $reply_data['id']   = $entity->id;
            $this->set(array(
                'success' => true,
                'data'    => $reply_data,
                '_serialize' => ['success','data']
            ));
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }      
    }

    public function delete() {
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
        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
	}

    public function viewBasicInfo(){
       
        $entity     = $this->{$this->main_model}->get( $this->request->query['user_id']);
        $username   = $entity->username;
        $items      = [];
        
        $fields         = $this->{$this->main_model}->schema()->columns();
        
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

        //Check if it has an SSID limitation
        if($this->{$this->main_model}->hasSsidCheck($username)){
            $items['ssid_only'] = true;
            $items['ssid_list'] = $this->{$this->main_model}->listRestrictedSsids($username);
        }

        $this->set([
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => ['success','data']
        ]);
    }

    public function editBasicInfo(){ 
       
        //---Set Realm related things--- 
        $realm_entity           = $this->Realms->entityBasedOnPost($this->request->data);
        if($realm_entity){
            $this->request->data['realm']   = $realm_entity->name;
            $this->request->data['realm_id']= $realm_entity->id;
            //FIXME WE HAVE TO CHECK AND CHANGE USERNAME IF CHANGE ...
        
        }else{
            $message = __('realm or realm_id not found in DB or not supplied');
            $this->JsonErrors->errorMessage($message);
            return;
        }
        
        //---Set profile related things---
        $profile_entity = $this->Profiles->entityBasedOnPost($this->request->data);
        if($profile_entity){
            $this->request->data['profile']   = $profile_entity->name;
            $this->request->data['profile_id']= $profile_entity->id;
        }else{
            $message = __('profile or profile_id not found in DB or not supplied');
            $this->JsonErrors->errorMessage($message);
            return;
        }
        
        //Zero the token to generate a new one for this user:
        unset($this->request->data['token']);

        //Set the date and time
        $extDateSelects = [
                'from_date',
                'to_date'
        ];
        foreach($extDateSelects as $d){
            if(isset($this->request->data[$d])){
                $newDate = date_create_from_format('m/d/Y', $this->request->data[$d]);
                $this->request->data[$d] = $newDate;
            }  
        }
        
        $entity = $this->{$this->main_model}->get($this->request->data['id']);
        $this->{$this->main_model}->patchEntity($entity, $this->request->data());
     
        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
    }

    public function viewPersonalInfo(){
       
        $items      = [];
        //TODO Check if the owner of this user is in the chain of the APs
        if(isset($this->request->query['user_id'])){
            $entity         = $this->{$this->main_model}->get( $this->request->query['user_id']);
            $include_items  = ['name','surname','phone','address', 'email','language_id','country_id'];
            foreach($include_items as $i){
                $items[$i] = $entity->{$i};
            }
            $items['language'] = $items['country_id'].'_'.$items['language_id'];
        }
        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    public function editPersonalInfo(){
       
        //TODO Check if the owner of this user is in the chain of the APs
        unset($this->request->data['token']);
        //Get the language and country
        $country_language   = explode( '_', $this->request->data['language'] );
        $country            = $country_language[0];
        $language           = $country_language[1];

        $this->request->data['language_id'] = $language;
        $this->request->data['country_id']  = $country;

        $entity = $this->{$this->main_model}->get($this->request->data['id']);
        $this->{$this->main_model}->patchEntity($entity, $this->request->data());
     
        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
    }

    public function privateAttrIndex(){
        
        $username   = $this->request->query['username'];
        $items      =  $this->{$this->main_model}->privateAttrIndex($username);

        $this->set(array(
            'items'         => $items,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    public function privateAttrAdd(){
       
        $entity =  $this->{$this->main_model}->privateAttrAdd($this->request);
        $errors = $entity->errors();
        if($errors){
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);
        }else{        
            $this->request->data['id'] = $entity->id;
            $this->set(array(
                'items'     => $this->request->data,
                'success'   => true,
                '_serialize' => array('success','items')
            ));
        }
    }

    public function privateAttrEdit(){
        
        $entity =  $this->{$this->main_model}->privateAttrEdit($this->request);    
        $errors = $entity->errors();
        if($errors){
            $message = __('Could not edit item');
            $this->JsonErrors->entityErros($entity,$message);
        }else{        
            $this->request->data['id'] = $entity->id;
            $this->set(array(
                'items'     => $this->request->data,
                'success'   => true,
                '_serialize' => array('success','items')
            ));
        }
    }

    public function privateAttrDelete(){
        if($this->{$this->main_model}->privateAttrDelete($this->request)){
            $message = __('Could not delete some items');
            $this->JsonErrors->errorMessage($message);  
        }else{
            $this->set(array(
                'success'   => true,
                '_serialize' => array('success')
            ));
        }
    }

    public function restrictListOfDevices(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];

        if((isset($this->request->query['username']))&&(isset($this->request->query['restrict']))){
            $username = $this->request->query['username'];
            if($this->request->query['restrict'] == 'true'){
                $this->{$this->main_model}->setRestrictListOfDevices($username,true);      
            }else{
                $this->{$this->main_model}->setRestrictListOfDevices($username,false);
            }
        }
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }

    public function autoMacOnOff(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];

        if((isset($this->request->query['username']))&&(isset($this->request->query['auto_mac']))){
            $username = $this->request->query['username'];
            if($this->request->query['auto_mac'] == 'true'){
                $this->{$this->main_model}->setAutoMac($username,true);     
            }else{
                $this->{$this->main_model}->setAutoMac($username,false);
            }
        }

        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }
    
    public function enableDisable(){
        
        $rb         = $this->request->data['rb'];
        $d          = array();

        if($rb == 'enable'){
            $d['active'] = 1;
        }else{
            $d['active'] = 0;
        }

        foreach(array_keys($this->request->data) as $key){
            if(preg_match('/^\d+/',$key)){
                $entity = $this->{$this->main_model}->get($key);
                $this->{$this->main_model}->patchEntity($entity, $d);
                $this->{$this->main_model}->save($entity);
            }
        }

        $this->set(array(
            'success' => true,
            '_serialize' => array('success',)
        ));
    }

    public function viewPassword(){

        $success    = false;
        $value      = false;
        $activate   = false;
        $expire     = false;

        if(isset($this->request->query['user_id'])){

            $q_r = $this->{$this->main_model}->get($this->request->query['user_id']);
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
        $this->set(array(
            'success'   => $success,
            'value'     => $value,
            'activate'  => $activate,
            'expire'    => $expire,
            '_serialize' => array('success','value','activate','expire')
        ));

    }

    public function changePassword(){

        unset($this->request->data['token']);

        //Set the date and time
        $extDateSelects = [
                'from_date',
                'to_date'
        ];
        foreach($extDateSelects as $d){
            if(isset($this->request->data[$d])){
                $newDate = date_create_from_format('m/d/Y', $this->request->data[$d]);
                $this->request->data[$d] = $newDate;
            }  
        }

        $entity = $this->{$this->main_model}->get($this->request->data['user_id']);
        unset($this->request->data['user_id']);

        $this->{$this->main_model}->patchEntity($entity, $this->request->data());

        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not change password');
            $this->JsonErrors->entityErros($entity,$message);
        }           
    }
   
    public function menuForGrid(){
             
        $menu = $this->GridButtonsFlat->returnButtons(false,'permanent_users');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    function menuForUserDevices(){
    
        $settings = ['listed_only' => false,'add_mac' => false];

        if(isset($this->request->query['username'])){
            $username = $this->request->query['username'];
            $settings = $this->{$this->main_model}->deviceMenuSettings($username,true);     
        }

        //Empty by default
        $menu = array(
                array('xtype' => 'buttongroup','title' => false, 'items' => array(
                    array( 'xtype'=>  'button', 'glyph'   => Configure::read('icnReload'), 'scale' => 'large', 'itemId' => 'reload',   'tooltip'   => __('Reload'),'ui' => 'button-orange'),
                    array( 
                        'xtype'         => 'checkbox', 
                        'boxLabel'      => 'Connect only from listed devices', 
                        'itemId'        => 'chkListedOnly',
                        'checked'       => $settings['listed_only'], 
                        'cls'           => 'lblRd',
                        'margin'        => 0
                    ),
                    array( 
                        'xtype'         => 'checkbox', 
                        'boxLabel'      => 'Auto-add device after authentication', 
                        'itemId'        => 'chkAutoAddMac',
                        'checked'       => $settings['add_mac'], 
                        'cls'           => 'lblRd',
                        'margin'        => 0
                    )
            )) 
        );

        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    function menuForAccountingData(){

        $menu = $this->GridButtonsFlat->returnButtons(false,'fr_acct_and_auth');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    function menuForAuthenticationData(){
      
        $menu = $this->GridButtonsFlat->returnButtons(true,'fr_acct_and_auth');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }
}

?>
