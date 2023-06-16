<?php

namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Inflector;
use Cake\ORM\TableRegistry;
use Cake\Mailer\Mailer;


class VouchersController extends AppController{
  
    public $base         = "Access Providers/Controllers/Vouchers/";   
    protected $owner_tree   = array();
    protected $main_model   = 'Vouchers';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Vouchers'); 
        $this->loadModel('Users');
        $this->loadModel('Realms');
        $this->loadModel('Profiles');
        $this->loadModel('Radaccts');   
       
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'     => 'Vouchers',
            'sort_by'   => 'Vouchers.name'
        ]);  
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('VoucherGenerator'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('MailTransport');
        $this->loadComponent('RdLogger');       
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
                    if($column_name == 'expire'){
                        if($i->{$column_name} !== null){
                            array_push($csv_line,$i->{$column_name}->i18nFormat('yyyy-MM-dd'));
                        } 
                    }elseif($column_name == 'time_valid'){
                        if($i->{$column_name} !== ''){
                            $pieces = explode("-", $i->{$column_name});
                            array_push($csv_line,$pieces[0].'-'.$pieces[1].'-'.$pieces[2]);
                        } 
                    }else{
                        array_push($csv_line,$i->{$column_name});  
                    }
                }
                array_push($data,$csv_line);
            }
        }
        
        $this->setResponse($this->getResponse()->withDownload('Vouchers.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(['data'=>$data]); 
        $this->viewBuilder()->setOption('serialize', true);  
          
    }

     public function exportPdf(){
     
     	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_q 		= $this->request->getQuery();
        $cloud_id 	= $req_q['cloud_id'];
        $this->viewBuilder()->setLayout('pdf');
        $this->response = $this->response->withType('pdf');
        
		//We improve this function by also allowing the user to specify certain values
		//which in turn will influence the outcome of the PDF
		Configure::load('Vouchers');
        $output_instr  	= Configure::read('voucher_dafaults'); //Read the defaults

		foreach(array_keys($output_instr) as $k){
			if(isset($req_q[$k])){
				if(($k == 'language')||($k == 'format')||($k == 'orientation')||($k == 'logo_or_qr')){
					$output_instr["$k"] 	= $req_q["$k"];
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
        if(isset($req_q['selected'])){
            $selected = json_decode($req_q['selected']);
            $sel_condition = [];
            foreach($selected as $i){
                array_push($sel_condition, ["Vouchers.id" => $i]); 
            }

            $voucher_data = [];
            $query = $this->{$this->main_model}->find();
            $q_r   = $query->where(['OR' => $sel_condition])->all();

            foreach($q_r as $i){
                $v                  = [];
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
                    $r_fields   = $this->{'Realms'}->getSchema()->columns();
                    foreach($r_fields as $r_field){
                        $row["$r_field"]= $e_realm->{"$r_field"};
                    } 
                    $voucher_data[$realm] = $row;
                    $voucher_data[$realm]['vouchers'] = [];
                }
                array_push($voucher_data[$realm]['vouchers'],$v); 
            }
               
            $this->set('voucher_data',$voucher_data);
        }else{
            //Check if there is a filter applied
            $query = $this->{$this->main_model}->find();
            $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['Realms']);
            $query->contain(['Realms']);            
            $q_r   = $query->all();
            $voucher_data = [];
            foreach($q_r as $i){
                $v                  = [];
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
                    $r_fields    = $this->{'Realms'}->getSchema()->columns();
                    foreach($r_fields as $r_field){
                        $row["$r_field"]= $e_realm->{"$r_field"};
                    } 
                    $voucher_data[$realm] = $row;
                    $voucher_data[$realm]['vouchers'] = [];
                }
                array_push($voucher_data[$realm]['vouchers'],$v);    
            }
            $this->set('voucher_data',$voucher_data);
        }     
    }

    public function pdfView(){

      	//$this->viewBuilder()->setLayout('pdf');//Looks like we can skip this
        $this->set('title', 'My Great Title');
        $this->set('file_name', '2016-06' . '_June_CLM.pdf');      
        	
  		$this->response = $this->response->withType('pdf');
		//$this->response = $this->response->withHeader( //Looks like we can also skip this
    	//	'Content-Disposition', 'inline; filename="some.pdf"'
		//);
  		
    }
    
    //____ BASIC CRUD Manager ________
    public function index(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

      	$req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];     
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id); 
                
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

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){
                                    
            $row        = [];
            $fields    = $this->{$this->main_model}->getSchema()->columns();
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
            
			$row['update']	= true;
			$row['delete']	= true; 
            array_push($items,$row);      
        }
       
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total
        ));
        $this->viewBuilder()->setOption('serialize', true); 
    }
   
    public function add(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
    	$req_d    = $this->request->getData();  
        $check_items = [
			'activate_on_login',
            'never_expire'
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
        if($req_d['never_expire'] == 0){
            $newDate = date_create_from_format('m/d/Y', $req_d['expire']);
            $req_d['expire'] = $newDate;
        }
        
        //---Set Realm related things--- 
        $realm_entity           = $this->Realms->entityBasedOnPost($req_d);
        if($realm_entity){
            $req_d['realm']   = $realm_entity->name;
            $req_d['realm_id']= $realm_entity->id;
            
            //Test to see if we need to auto-add a suffix
            $suffix          =  $realm_entity->suffix; 
            $suffix_vouchers = $realm_entity->suffix_vouchers;
           
        }else{
            $this->JsonErrors->errorMessage('realm or realm_id not found in DB or not supplied');
            return;
        }
        
        //---Set profile related things---
        $profile_entity = $this->Profiles->entityBasedOnPost($req_d);
        if($profile_entity){
            $req_d['profile']   = $profile_entity->name;
            $req_d['profile_id']= $profile_entity->id;
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

        if(array_key_exists('quantity',$req_d)){
            $qty = $req_d['quantity'];
        }

        while($counter < $qty){
        
            if($req_d['single_field'] == 'false'){
                $p = '';
                if(array_key_exists('precede',$req_d)){
                    if($req_d['precede'] !== ''){
                        $p = $req_d['precede'];
                    }
                }
            
                $s = '';
                if(($suffix != '')&&($suffix_vouchers)){
                    $s = $suffix;
                }      
                $un     = $this->VoucherGenerator->generateUsernameForVoucher($p,$s);
                $pwd    = $this->VoucherGenerator->generatePassword();
                $req_d['name']      = $un; 
                $req_d['password']  = $pwd;
                
            }else{
                $pwd = $this->VoucherGenerator->generateVoucher();
                if(($suffix != '')&&($suffix_vouchers)){
                    $pwd = $pwd.'@'.$suffix;
                }
                
                $req_d['name']      = $pwd; 
                $req_d['password']  = $pwd;
            }
             
            $entity = $this->{$this->main_model}->newEntity($req_d);
            
            $this->{$this->main_model}->save($entity);
            if(!$entity->getErrors()){ //Hopefully taking care of duplicates is as simple as this :-)
                $counter = $counter + 1;
                $row     = [];
                foreach($repl_fields as $field){
                    $row["$field"]= $entity->{"$field"};
                }
                array_push($created,$row);
                
                //OCT 2022 ADD A STEP TO REMOVE POTENTIAL OLD ORPHANED ACCOUNTIG RECORDS
                $n = $req_d['name'];
                $this->{'Radaccts'}->deleteAll(['Radaccts.username' => $n]);
                //END
                
            }            
        }
        
        $this->set([
            'success' => true,
            'data'    => $created
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    } 

    public function viewBasicInfo(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
       
    	$req_q    	= $this->request->getQuery();       
        $entity     = $this->{$this->main_model}->find()->where(['Vouchers.id' => $req_q['voucher_id']])->first();
        

        //List these items
        $include_items = [
            'realm','realm_id','profile','profile_id',
            'extra_name','extra_value', 'expire' ,
            'time_valid',
            'id'
        ];
        

        $items = [];
        if($entity){
        	$username   = $entity->name;
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
		        $items['activate_on_login'] = true;
		        $pieces                     = explode("-", $items['time_valid']);
		        $items['days_valid']        = $pieces[0];  
		        $items['hours_valid']       = $pieces[1];
		        $items['minutes_valid']     = $pieces[2]; 
		    }else{
		    	$items['activate_on_login'] = false;
		    }
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
      
        //---Set Realm related things--- 
        $req_d    = $this->request->getData();  
        
        
        $realm_entity   	= $this->Realms->entityBasedOnPost($req_d);
        if($realm_entity){
            $req_d['realm']   = $realm_entity->name;
            $req_d['realm_id']= $realm_entity->id;
            //FIXME WE HAVE TO CHECK AND CHANGE USERNAME IF CHANGE ...
        
        }else{
            $message = __('realm or realm_id not found in DB or not supplied');
            $this->JsonErrors->errorMessage($message);
            return;
        }
        
        //---Set profile related things---
        $profile_entity = $this->Profiles->entityBasedOnPost($req_d);
        if($profile_entity){
            $req_d['profile']   = $profile_entity->name;
            $req_d['profile_id']= $profile_entity->id;
        }else{
            $message = __('profile or profile_id not found in DB or not supplied');
            $this->JsonErrors->errorMessage($message);
            return;
        }
        
        $check_items = [
			'activate_on_login',
            'never_expire'
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
        if($req_d['never_expire'] == 0){
            $newDate = date_create_from_format('m/d/Y', $req_d['expire']);
            $req_d['expire'] = $newDate;
        }

        $req_d['status'] = 'new'; //Make it new so it changes visibly
        
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
    
    public function bulkDelete(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        $conditions 		= $this->CommonQueryFlat->get_filter_conditions();      
        $list_of_vouchers 	= $this->{$this->main_model}->find()->where($conditions)->all();
        foreach($list_of_vouchers as $voucher){
        	$this->{$this->main_model}->delete($voucher);
        }
               
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);  
    }
    
    public function delete() {
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		$req_d    = $this->request->getData();
		
	    if(isset($req_d['id'])){      
            $entity     = $this->{$this->main_model}->get($req_d['id']);   
            $owner_id   = $entity->user_id;
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

     public function privateAttrIndex(){
     
     	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $username   = $this->request->getQuery('username');
        $items      =  $this->{$this->main_model}->privateAttrIndex($username);
        $this->set([
            'items'         => $items,
            'success'       => true
        ]);
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
    
    	$req_d  = $this->request->getData(); 
        $entity =  $this->{$this->main_model}->privateAttrEdit($this->request);    
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

    public function changePassword(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
    	$req_d  = $this->request->getData();

        if(
            (isset($req_d['voucher_id']))||
            (isset($req_d['name'])) //Can also change by specifying name
        ){
			$single_field = false;
            if(isset($req_d['name'])){
                $entity =  $this->{$this->main_model}->find()->where(['name' => $req_d['name']])->first();       
            }else{
                $entity =  $this->{$this->main_model}->get($req_d['voucher_id']); 
			}

            if($entity){
                if( $entity->name == $entity->password){
                    $message = __('Cannot change the password of a single field voucher');
                    $this->JsonErrors->errorMessage($message);
                }else{
                    $this->{$this->main_model}->patchEntity($entity, $req_d);
                    if ($this->{$this->main_model}->save($entity)) {
                        $this->set(array(
                            'success' => true
                        ));
                        $this->viewBuilder()->setOption('serialize', true); 
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
                 
            $meta_data      = $this->MailTransport->setTransport($data['cloud_id']);           
            $success        = false;
                      
            if($meta_data !== false){         
                $email 	= new Mailer(['transport'   => 'mail_rd']);
                $from   = $meta_data['from'];
                $email->setSubject('Your voucher detail')
                    ->setFrom($from)
                    ->setTo($to)
                    ->setViewVars(compact( 'username', 'password','valid_for','profile','extra_name','extra_value','message'))
                    ->setEmailFormat('html')
                    ->viewBuilder()
                    	->setTemplate('voucher_detail')
                		->setLayout('voucher_notify');                   

                $email->deliver();
               
                $settings_cloud_id = $this->MailTransport->getCloudId();
            	$this->RdLogger->addEmailHistory($settings_cloud_id,$to,'voucher_detail',"$username $password $message");
               
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

    public function pdfExportSettings(){
		Configure::load('Vouchers'); 
        $data  = Configure::read('voucher_dafaults'); //Read the defaults

		$this->set([
            'data'     => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
	}

    public function pdfVoucherFormats(){
        Configure::load('Vouchers'); 
        $data  = Configure::read('voucher_formats'); //Read the defaults
        $items = [];
        foreach($data as $i){
            if($i['active']){
                array_push($items, $i);
            }
        }

        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }

    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'vouchers');
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true); 
    }

    function menuForAccountingData(){

       $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'fr_acct_and_auth');
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true); 
    }
}
