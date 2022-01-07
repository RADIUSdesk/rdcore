<?php

namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Inflector;
use Cake\ORM\TableRegistry;
use Cake\Mailer\Email;


class VouchersController extends AppController{
  
    public $base         = "Access Providers/Controllers/Vouchers/";   
    protected $owner_tree   = array();
    protected $main_model   = 'Vouchers';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Vouchers'); 
        $this->loadModel('Users');
        $this->loadModel('Realms');
        $this->loadModel('Profiles');   
       
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'     => 'Vouchers',
            'sort_by'   => 'Vouchers.name'
        ]);  
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('VoucherGenerator'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('MailTransport');      
    }

    public function exportCsv(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $query = $this->{$this->main_model}->find(); 
  
        if($this->CommonQuery->build_with_realm_query($query,$user,['Users','Realms']) == false){
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
            $columns    = array();
            $csv_line   = array();
            if(isset($this->request->query['columns'])){
                $columns = json_decode($this->request->query['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    if($column_name == 'expire'){
                        if($i->{$column_name} !== null){
                            array_push($csv_line,$i->{$column_name}->i18nFormat('yyyy-MM-dd'));
                        } 
                    }elseif($column_name == 'time_valid'){
                        if($i->{$column_name} !== ''){
                            $pieces = explode("-", $i->{$column_name});
                            array_push($csv_line,$pieces[0].'-'.$pieces[1].'-'.$pieces[2]);
                        } 
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

     public function exportPdf(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $this->viewBuilder()->setLayout('pdf');
        $this->response->type('pdf');
		//We improve this function by also allowing the user to specify certain values
		//which in turn will influence the outcome of the PDF
		Configure::load('Vouchers');
        $output_instr  	= Configure::read('voucher_dafaults'); //Read the defaults

		foreach(array_keys($output_instr) as $k){
			if(isset($this->request->query[$k])){
				if(($k == 'language')||($k == 'format')||($k == 'orientation')||($k == 'logo_or_qr')){
					$output_instr["$k"] 	= $this->request->query["$k"];
				}else{
					$output_instr["$k"] = true;
				}    
		    }else{
				if(!(($k == 'language')||($k == 'format')||($k == 'orientation'))){
					$output_instr["$k"] = false;
				}
			}
		}

        $pieces = explode('_',$output_instr['language']);
        $languages  = TableRegistry::get('Languages');
        $l_entity   = $languages->get($pieces[1]);

        if($l_entity->rtl == '1'){
			$output_instr['rtl'] = true;
        }else{
			$output_instr['rtl'] = false;
        }

		$this->set('output_instr',$output_instr);

        //==== Selected items is the easiest =====
        //We need to see if there are a selection:
        if(isset($this->request->query['selected'])){
            $selected = json_decode($this->request->query['selected']);
            $sel_condition = array();
            foreach($selected as $i){
                array_push($sel_condition, array("Vouchers.id" => $i)); 
            }

            $voucher_data = array();
            $query = $this->{$this->main_model}->find();
            $q_r   = $query->where(['OR' => $sel_condition])->all();

            foreach($q_r as $i){
                $v                  = array();
                $v['username']      = $i->name;
                $v['password']      = $i->password;
                
                if($i->expire !== null){
                    $v['expiration']    = $i->expire->i18nFormat('yyyy-MM-dd');
                
                }else{
                    $v['expiration']    = $i->expire;
                }    
                $v['days_valid']    = $i->time_valid;
                $v['profile']       = $i->profile;
                $v['extra_name']    = $i->extra_name;
                $v['extra_value']   = $i->extra_value;

                $realm_id           = $i->realm_id;
                $realm              = $i->realm;
                if(!array_key_exists($realm,$voucher_data)){
                    $e_realm    = $this->{'Realms'}->get($realm_id);
                    $row        = [];
                    $r_fields   = $this->{'Realms'}->schema()->columns();
                    foreach($r_fields as $r_field){
                        $row["$r_field"]= $e_realm->{"$r_field"};
                    } 
                    $voucher_data[$realm] = $row;
                    $voucher_data[$realm]['vouchers'] = array();
                }
                array_push($voucher_data[$realm]['vouchers'],$v); 
            }
               
            $this->set('voucher_data',$voucher_data);
        }else{
            //Check if there is a filter applied
            $query = $this->{$this->main_model}->find(); 
            
            if($this->CommonQuery->build_with_realm_query($query,$user,['Users','Realms']) == false){
                //FIXME Later we can redirect to an error page for CSV
                return;
            }
            
            $q_r   = $query->all();
            $voucher_data = array();
            foreach($q_r as $i){
                $v                  = array();
                $v['username']      = $i->name;
                $v['password']      = $i->password;
                
                if($i->expire !== null){
                    $v['expiration']    = $i->expire->i18nFormat('yyyy-MM-dd');
                
                }else{
                    $v['expiration']    = $i->expire;
                }
                
                $v['days_valid']    = $i->time_valid;
                $v['profile']       = $i->profile;
                $v['extra_name']    = $i->extra_name;
                $v['extra_value']   = $i->extra_value;

                $realm_id           = $i->realm_id;
                $realm              = $i->realm;
                if(!array_key_exists($realm,$voucher_data)){
                    $e_realm = $this->{'Realms'}->get($realm_id);
                    $row = [];
                    $r_fields    = $this->{'Realms'}->schema()->columns();
                    foreach($r_fields as $r_field){
                        $row["$r_field"]= $e_realm->{"$r_field"};
                    } 
                    $voucher_data[$realm] = $row;
                    $voucher_data[$realm]['vouchers'] = array();
                }
                array_push($voucher_data[$realm]['vouchers'],$v);    
            }
            $this->set('voucher_data',$voucher_data);
        }     
    }

    public function pdfView($schedule_id = null){
        $this->viewBuilder()->layout('ajax');
        $this->set('title', 'My Great Title');
        $this->set('file_name', '2016-06' . '_June_CLM.pdf');
        $this->response->type('pdf');
    } 
    
    //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
                
        $query = $this->{$this->main_model}->find();
        
        if($this->CommonQuery->build_with_realm_query($query,$user,['Users','Realms']) == false){
            return;
        }

 
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
        $items  = array();

        foreach($q_r as $i){
                         
            $owner_id   = $i->user_id;
            if(!array_key_exists($owner_id,$this->owner_tree)){
                $owner_tree     = $this->Users->find_parents($owner_id);
            }else{
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags   = $this->Aa->get_action_flags($owner_id,$user); 
            
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
                
                if($field == 'expire'){
                    if($i->{"$field"}){
                        $row['expire_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                    }else{
                        $row['expire_in_words'] = __("Never");
                    }
                }
                
                if($field == 'time_valid'){
                    if($i->{"$field"} != ''){
                        $row['activate_on_login']   = true;
                        $pieces                     = explode("-", $i->{"$field"});
                        $a_o_l_reply                = '';
                        if($pieces[0] !== '0'){
                            $days = 'Days';
                            if($pieces[0] == 1){
                                $days = 'Day';
                            }
                            $a_o_l_reply = $a_o_l_reply.ltrim($pieces[0], '0')." $days ";
                        }
                        if($pieces[1] !== '00'){
                            $hours = 'Hours';
                            if($pieces[1] == '01'){
                                $hours = 'Hour';
                            }
                            $a_o_l_reply = $a_o_l_reply.ltrim($pieces[1], '0')." $hours ";
                        }
                        if($pieces[2] !== '00'){
                            $minutes = 'Minutes';
                            if($pieces[2] == '01'){
                                $minutes = 'Minute';
                            }
                            $a_o_l_reply = $a_o_l_reply.ltrim($pieces[2], '0')." $minutes";
                        } 
                        $row['time_valid_in_words'] = $a_o_l_reply;
                    }
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
            
            $row['owner']   = $owner_tree;
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
   
    public function add(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];

        //Get the owner's id
        if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
            $this->request->data['user_id'] = $user_id;
        }

        $check_items = array(
			'activate_on_login',
            'never_expire'
		);

        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
        
        //If it is expiring; set it in the correct format
        if($this->request->data['never_expire'] == 0){
            $newDate = date_create_from_format('m/d/Y', $this->request->data['expire']);
            $this->request->data['expire'] = $newDate;
        }
        
        //---Set Realm related things--- 
        $realm_entity           = $this->Realms->entityBasedOnPost($this->request->data);
        if($realm_entity){
            $this->request->data['realm']   = $realm_entity->name;
            $this->request->data['realm_id']= $realm_entity->id;
            
            //Test to see if we need to auto-add a suffix
            $suffix          =  $realm_entity->suffix; 
            $suffix_vouchers = $realm_entity->suffix_vouchers;
           
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

        //--Here we start with the work!
        $qty        = 1;//Default value
        $counter    = 0;
        $repl_fields= [
            'id', 'name', 'batch','created','extra_name','extra_value',
            'realm','realm_id','profile','profile_id','expire','time_valid'
        ];

        $created    = [];

        if(array_key_exists('quantity',$this->request->data)){
            $qty = $this->request->data['quantity'];
        }

        while($counter < $qty){
        
            if($this->request->data['single_field'] == 'false'){
                $p = '';
                if(array_key_exists('precede',$this->request->data)){
                    if($this->request->data['precede'] !== ''){
                        $p = $this->request->data['precede'];
                    }
                }
            
                $s = '';
                if(($suffix != '')&&($suffix_vouchers)){
                    $s = $suffix;
                }      
                $un     = $this->VoucherGenerator->generateUsernameForVoucher($p,$s);
                $pwd    = $this->VoucherGenerator->generatePassword();
                $this->request->data['name']      = $un; 
                $this->request->data['password']  = $pwd;
                
            }else{
                $pwd = $this->VoucherGenerator->generateVoucher();
                if(($suffix != '')&&($suffix_vouchers)){
                    $pwd = $pwd.'@'.$suffix;
                }
                
                $this->request->data['name']      = $pwd; 
                $this->request->data['password']  = $pwd;
            }
             
            $entity = $this->{$this->main_model}->newEntity($this->request->data());
            
            $this->{$this->main_model}->save($entity);
            if(!$entity->errors()){ //Hopefully taking care of duplicates is as simple as this :-)
                $counter = $counter + 1;
                $row     = array();
                foreach($repl_fields as $field){
                    $row["$field"]= $entity->{"$field"};
                }
                array_push($created,$row);
            }
            
        }
 

        $this->set(array(
            'success' => true,
            'data'    => $created,
            '_serialize' => array('success','data')
        ));
    } 

    public function viewBasicInfo(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $entity     = $this->{$this->main_model}->get( $this->request->query['voucher_id']);
        $username   = $entity->name;

        //List these items
        $include_items = [
            'realm','realm_id','profile','profile_id',
            'extra_name','extra_value', 'expire' ,
            'time_valid'
        ];

        $items = [];
        foreach($include_items as $i){
            $items[$i] = $entity->{$i};
        }

        if($items['expire'] == null){
            $items['never_expire'] = true;
        }else{
           $items['never_expire'] = false;
           $items['expire']       = $items['expire']->format("m/d/Y"); 
        }

        if($items['time_valid'] != ''){
            $items['activate_on_login'] = 'activate_on_login';
            $pieces                     = explode("-", $items['time_valid']);
            $items['days_valid']        = $pieces[0];  
            $items['hours_valid']       = $pieces[1];
            $items['minutes_valid']     = $pieces[2]; 
        }

        //Check if it has an SSID limitation
        $items['ssid_only'] = false;
        if($this->{$this->main_model}->hasSsidCheck($username)){
            $items['ssid_only'] = true;
            $items['ssid_list'] = $this->{$this->main_model}->listRestrictedSsids($username);
        }

        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

    public function editBasicInfo(){ 
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

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
        
        $check_items = array(
			'activate_on_login',
            'never_expire'
		);

        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
        
        //If it is expiring; set it in the correct format
        if($this->request->data['never_expire'] == 0){
            $newDate = date_create_from_format('m/d/Y', $this->request->data['expire']);
            $this->request->data['expire'] = $newDate;
        }

        $this->request->data['status'] = 'new'; //Make it new so it changes visibly
        
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
    
    public function bulkDelete(){
    
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }  
        $conditions = $this->CommonQuery->get_filter_conditions();
        
        //Very important for Access Providers to prevent them not to delete other's items
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $this->loadComponent('RealmAcl');
            $realms = $this->RealmAcl->realm_list_for_ap($user['id'],'delete');
            if(!$realms){
                $this->JsonErrors->errorMessage('Access Provider Not Assigned to any Realms - Please Check');
                return false;
            }else{
                array_push($conditions,array('OR' => $realms));
            }  
        }
        
        $this->{$this->main_model}->deleteAll($conditions);
        
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
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

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);   
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
            foreach($this->request->data as $d){
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

     public function privateAttrIndex(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $username   = $this->request->query['username'];
        $items      =  $this->{$this->main_model}->privateAttrIndex($username);

        $this->set(array(
            'items'         => $items,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    public function privateAttrAdd(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

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
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

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
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
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

    public function changePassword(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id = $user['id'];

        if(
            (isset($this->request->data['voucher_id']))||
            (isset($this->request->data['name'])) //Can also change by specifying name
        ){
			$single_field = false;
            if(isset($this->request->data['name'])){
                $entity =  $this->{$this->main_model}->find()->where(['name' => $this->request->data['name']])->first();       
            }else{
                $entity =  $this->{$this->main_model}->get($this->request->data['voucher_id']); 
			}

            if($entity){
                if( $entity->name == $entity->password){
                    $message = __('Cannot change the password of a single field voucher');
                    $this->JsonErrors->errorMessage($message);
                }else{
                    $this->{$this->main_model}->patchEntity($entity, $this->request->data());
                    if ($this->{$this->main_model}->save($entity)) {
                        $this->set(array(
                            'success' => true,
                            '_serialize' => array('success')
                        ));
                    } else {
                        $message = __('Could not change Password this time');
                        $this->JsonErrors->entityErros($entity,$message);
                    }
                }
            }else{
                $message = __('Could not change Password this time');
                $this->JsonErrors->errorMessage($message); 
            }
        }
    }

    public function emailVoucherDetails(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $data   = $this->request->getData();
        $to     = $data['email'];
        $message= $data['message'];    
        
        $entity = $this->{$this->main_model}->get($data['id']);
        if($entity){
            $username       = $entity->name;
            $password       = $entity->password;
            $valid_for      = $entity->time_valid;
            $profile        = $entity->profile;
            $extra_name     = $entity->extra_name;
            $extra_value    = $entity->extra_value;
                 
            $from           = $this->MailTransport->setTransport($user);           
            $success        = false;
                      
            if($from !== false){         
                $email      = new Email(['transport'   => 'mail_rd']);
                $email->subject('Your voucher detail')
                    ->from($from)
                    ->to($to)
                    ->viewVars(compact( 'username', 'password','valid_for','profile','extra_name','extra_value','message'))
                    ->template('voucher_detail', 'voucher_notify')
                    ->emailFormat('html')
                    ->send();
                $success    = true;
                $this->set([
                    'data'          => $data,
                    'success'       => $success,
                    '_serialize'    => ['data','success']
                ]); 
            }else{                     
                $this->set([
                    'data'          => $data,
                    'success'       => $success,
                    'message'       => 'Email Disabled / Not Configured',
                    '_serialize'    => ['data','success','message']
                ]);
            }            
        }
    }

    public function pdfExportSettings(){
		Configure::load('Vouchers'); 
        $data  = Configure::read('voucher_dafaults'); //Read the defaults

		$this->set(array(
            'data'     => $data,
            'success'   => true,
            '_serialize'=> array('success', 'data')
        ));
	}

    public function pdfVoucherFormats(){
        Configure::load('Vouchers'); 
        $data  = Configure::read('voucher_formats'); //Read the defaults
        $items = array();
        foreach($data as $i){
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
        
        $menu = $this->GridButtons->returnButtons($user,false,'vouchers');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }

    function menuForAccountingData(){

       $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtons->returnButtons($user,true,'fr_acct_and_auth');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }


}
