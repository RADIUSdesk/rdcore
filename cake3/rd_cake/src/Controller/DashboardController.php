<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class DashboardController extends AppController{
  
    public $base = "Access Providers/Controllers/Dashboard/";
    //protected $ui   = 'toplevel';
    protected $ui       = 'default';
    //protected $ui       = 'tab-grey';
    //protected $plain    = true;
    protected $plain    = false;
    
    //Options are: tab-teal, tab-blue, tab-orange, tab-green, tab-metal, tab-brown
    protected $tabUINone    = 'default';
    protected $tabUIOne     = 'tab-blue';
    protected $tabUITwo     = 'tab-orange';
    protected $tabUIThree   = 'tab-metal';
    
    protected $acl_base     = "Access Providers/Controllers/";
    
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Users');
        $this->loadModel('UserSettings');
        $this->loadModel('Realms');   
        $this->loadComponent('Aa');
        $this->loadComponent('WhiteLabel');      
    }
      
    public function navTree(){
    
    	$items = $this->_nav_tree();
    
    	$this->set([
            'items'          => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);      
    }
    
    public function tokenForId(){

        $this->set([
            'data'          => ['token'=> 'b4c6ac81-8c7c-4802-b50a-0a6380555b50'],
            'success'       => true,
            '_serialize'    => ['data','success']
        ]);     
    }
    
    public function getToken(){
    
        //Sample call from CURL
        //curl -X POST -H 'Content-Type: application/x-www-form-urlencoded' -i 'http://127.0.0.1/cake3/rd_cake/dashboard/get-token.json' 
        //--data 'username=root&password=admin'
        //END Sample Call from Curl
         $this->loadComponent('Auth', [
            'authenticate' => [
                'Form' => [
                    'userModel' => 'Users',
                    'fields' => ['username' => 'username', 'password' => 'password'],
                    'passwordHasher' => [
                        'className' => 'Fallback',
                        'hashers' => [
                            'Default',
                            'Weak' => ['hashType' => 'sha1']
                        ]
                    ]
                ]
            ]
        ]);
        
        if ($this->request->is('post')) {
            $user = $this->Auth->identify();
            if ($user){
            
                $this->set(array(
                    'data'          => ['token' => $user['token'],'username' =>$user['username']],
                    'success'       => true,
                    '_serialize' => array('data','success')
                ));
            
            }else{
            
                $this->set(array(
                    'errors'        => array('username' => __('Confirm this name'),'password'=> __('Type the password again')),
                    'success'       => false,
                    'message'       => __('Authentication failed'),
                    '_serialize' => array('errors','success','message')
                ));
      
            }
        }else{
            $this->set(array(
                'errors'        => array('username' => __('Required'),'password'=> __('Required')),
                'success'       => false,
                'message'       => __('HTTP POST Required -> Authentication failed'),
                '_serialize' => array('errors','success','message')
            ));
            return;
        }
    }
    
    public function authenticate(){
    
        $this->loadComponent('Auth', [
            'authenticate' => [
                'Form' => [
                    'userModel' => 'Users',
                    'fields' => ['username' => 'username', 'password' => 'password'],
                    'passwordHasher' => [
                        'className' => 'Fallback',
                        'hashers' => [
                            'Default',
                            'Weak' => ['hashType' => 'sha1']
                        ]
                    ]
                ]
            ]
        ]);
    
        if ($this->request->is('post')) {
            $user = $this->Auth->identify();
            if ($user){
                //We can get the detail for the user
                $u = $this->Users->find()->contain(['Groups'])->where(['Users.id' => $user['id']])->first();
               
                //Check for auto-compact setting
                $auto_compact = false;
                if(isset($this->request->data['auto_compact'])){
                    if($this->request->data['auto_compact']=='true'){ //Carefull with the query's true and false it is actually a string
                        $auto_compact = true;
                    }
                }
                
                $data = []; 
                $data = $this->_get_user_detail($u,$auto_compact);
                                  
                $this->set([
                    'data'          => $data,
                    'success'       => true,
                    '_serialize' => ['data','success']
                ]);
                
            }else{
            
                $this->set([
                    'errors'        => ['username' => __('Confirm this name'),'password'=> __('Type the password again')],
                    'success'       => false,
                    'message'       => __('Authentication failed'),
                    '_serialize' => ['errors','success','message']
                ]);               
            }
        }
    }
	
	public function checkToken(){

        if((isset($this->request->query['token']))&&($this->request->query['token'] != '')){
        
            $token  = $this->request->query['token'];           
            $user   = $this->Users->find()->contain(['Groups'])->where(['Users.token' => $token])->first();
            
            if(!$user){
                $this->set(array(
                    'errors'        => array('token'=>'invalid'),
                    'success'       => false,
                    '_serialize'    => array('errors','success')
                ));
            
            }else{
               // print_r($user);
               
                //Check for auto-compact setting
                $auto_compact = false;
                if(isset($this->request->query['auto_compact'])){
                    if($this->request->query['auto_compact']=='true'){ //Carefull with the query's true and false it is actually a string
                        $auto_compact = true;
                    }
                }
               
                $data = $this->_get_user_detail($user,$auto_compact);                              
                $this->set([
                    'data'          => $data,
                    'success'       => true,
                    '_serialize'    => ['data','success']
                ]);
            }
                     
        }else{

            $this->set(array(
                'errors'        => array('token'=>'missing'),
                'success'       => false,
                '_serialize'    => array('errors','success')
            ));
        }
         
    }
    
    public function i18n(){
        $items = array();
        $i18n = Configure::read('Admin.i18n');
        foreach($i18n as $i){
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
     
     public function settingsView(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id    = $user['id']; 
        

        $wl         = $this->WhiteLabel->detail($user_id);  
        $data       = $wl; 
        
        $e_user     = $this->{'Users'}->find()->where(['Users.id' => $user['id']])->first();

        $timezone_id = 316; //London by default
        if($e_user->timezone_id){
            $timezone_id = $e_user->timezone_id;
        } 
        $data['timezone_id'] = $timezone_id;
        $data['email']       = $e_user->email;
               
        $check_items = [
		    'compact_view',
		    'alert_activate'
	    ];
	    
	    $overview_items = [ 
	    'meshdesk_overview', 
	    //'apdesk_overview', 
	    'radius_overview'
	    ];
	    $active_overview_items = [];
	    
	    foreach($overview_items as $o){
	        $q_r_o = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => "$o"])->first();
	        if($q_r_o){
                if($q_r_o->value == 1){
                    array_push($active_overview_items,$o);
                }
            }
	    }
	    
	    $data['overviews_to_include[]'] = $active_overview_items;
	    
	    foreach($check_items as $i){
	        $q_rc = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => "$i"])->first();
            if($q_rc){
                $val_rc = 0;
                if($q_rc->value == 1){
                    $val_rc = "$i";
                }
                $data["$i"] = $val_rc;
            }else{
            	$data["$i"] = 0;
            }   
        }
        if(isset($data['alert_activate'])){
            if($data['alert_activate'] == 'alert_activate'){
                $data['alert_frequency'] = 1;
                $q_afr = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'alert_frequency'])->first();
                if($q_afr){
                    $data['alert_frequency'] = $q_afr->value;
                }  
            }
        } 
           
        //Now for the more difficult bit finding the default realm if there are not one.
        $q_rr = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'realm_id'])->first();
        if($q_rr){
            $q_r                = $this->Realms->find()->where(['id' => $q_rr->value])->first();
            $realm_name         = $q_r->name;
            $data['realm_name'] = $realm_name;
            $data['realm_id']   = $q_rr->value;
        }else{
            //We need to find the first valid realm
            if($user['group_name'] == 'Administrators'){
                $q_r            = $this->Realms->find()->first();
                if($q_r){
                    $realm_name         = $q_r->name;
                    $data['realm_name'] = $realm_name;
                    $data['realm_id']   = $q_r->id;
                }
            }
            
            if($user['group_name'] == 'Access Providers'){
                $realm_detail = $this->_ap_default_realm($user_id);
                if(array_key_exists('realm_id',$realm_detail)){
                    $data['realm_name'] = $realm_detail['realm_name'];
                    $data['realm_id']   = $realm_detail['realm_id'];
                }
            }    
        }
       
        $this->set(array(
            'data'   => $data,
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }
     
     public function settingsSubmit(){
     
         //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.    
        $this->viewBuilder()->layout('ext_file_upload');
     
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        
        $remove_items = [ 
            'meshdesk_overview',
            'apdesk_overview',
            'radius_overview',
            'compact_view',
            'realm_id',
            'default_overview',
            'alert_activate',
            'alert_frequency'
        ];  
          
        //Clean up everything
        foreach($remove_items as $ri){
             $this->UserSettings->deleteAll(['UserSetting.user_id' => $user_id,'UserSetting.name' => $ri]);
        } 
        
        $ap_id = $user_id;
        
        $check_items = array(
			'wl_active',
			'wl_img_active'
		);
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }    
        
        $looking_for    = ['wl_active','wl_header','wl_h_bg','wl_h_fg','wl_footer','wl_img_active','wl_img_file'];
        
        if($this->request->data['wl_active'] == 1){
            
            $new_logo       = false;
            
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
        
            foreach($looking_for as $ri){
                 $this->UserSettings->deleteAll(['UserSetting.user_id' => $user_id,'UserSetting.name' => $ri]);
            } 
        }  
               
        if(isset($this->request->data['realm_id'])){
		    $s = $this->UserSettings->newEntity();
            $s->user_id = $user_id;
            $s->name    = 'realm_id';
            $s->value   = $this->request->data['realm_id'];
            $this->UserSettings->save($s);
        }
       
        if(isset($this->request->data['compact_view'])){
		    $s = $this->UserSettings->newEntity();
            $s->user_id = $user_id;
            $s->name    = 'compact_view';
            $s->value   = 1;
            $this->UserSettings->save($s);
        }
        
        if(isset($this->request->data['alert_activate'])){
		    $s = $this->UserSettings->newEntity();
            $s->user_id = $user_id;
            $s->name    = 'alert_activate';
            $s->value   = 1;
            $this->UserSettings->save($s);
        }
        
        if(isset($this->request->data['alert_frequency'])){
		    $s = $this->UserSettings->newEntity();
            $s->user_id = $user_id;
            $s->name    = 'alert_frequency';
            $s->value   = $this->request->data['alert_frequency'];
            $this->UserSettings->save($s);
        }                    
        
        if (array_key_exists('overviews_to_include', $this->request->data)) {
            if(!empty($this->request->data['overviews_to_include'])){
                foreach($this->request->data['overviews_to_include'] as $e){
                    if($e != ''){
                        $s = $this->UserSettings->newEntity();
                        $s->user_id = $user_id;
                        $s->name    = $e;
                        $s->value   = 1;
                        $this->UserSettings->save($s);
                    }    
                }
            }
        }
           
        if(isset($this->request->data['default_overview'])){
		    $s = $this->UserSettings->newEntity();
            $s->user_id = $user_id;
            $s->name    = 'default_overview';
            $s->value   = $this->request->data['default_overview'];
            $this->UserSettings->save($s);
        }
        $email = '';
        
        if(isset($this->request->data['timezone_id'])){
            $e_user     = $this->{'Users'}->find()->where(['Users.id' => $user['id']])->first();
            if($this->request->getData('email')){
                $email = $this->request->getData('email');
            }
            if($e_user){
                $this->{'Users'}->patchEntity($e_user,['timezone_id' => $this->request->data['timezone_id'],'email' =>$email]);
                $this->{'Users'}->save($e_user);
            }   
        }
      
        //Return the wl settings as data
        $white_label            = [];
        $wl                     = $this->WhiteLabel->detail($ap_id);
        $white_label['active']  = true;
        $white_label['hName']   = $wl['wl_header'];
        $white_label['hBg']     = '#'.$wl['wl_h_bg'];
        $white_label['hFg']     = '#'.$wl['wl_h_fg'];   
        $white_label['fName']   = $wl['wl_footer'];
        
        if(($wl['wl_img_active'] === 'wl_img_active')||($wl['wl_img_active'] == 1)){
            $white_label['imgActive'] = true;   
        }else{
            $white_label['imgActive'] = false;
        }
        $white_label['imgFile']    = $wl['wl_img']; 

        $this->set(array(
            'success'   => true,
            'data'      => $white_label,
            '_serialize' => array('success','data')
        ));
    }
    
    public function changePassword(){
        //$user = $this->_ap_right_check();
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $data       = array();  
        $u          = $this->Users->get($user_id);
        
        $u->set('password',$this->request->data['password']);
        $u->set('token',''); //Setting it ti '' will trigger a new token generation
        $this->Users->save($u); 
        $data['token']  = $u->get('token');

        $this->set(array(
            'success' => true,
            'data'    => $data,
            '_serialize' => array('success','data')
        ));
    }
    
    private function _get_user_detail($user,$auto_compact=false){
           
        $group      = $user->group->name;
        $username   = $user->username;
        $token      = $user->token;
        $id         = $user->id;      
        $cls        = 'user';
        $menu       = [];   
        $isRootUser = false;
        
        if($auto_compact){
        	$compact	= true;
       	}else{
       		$compact	= false;
       	}
        
        //White Label
        $white_label            = [];
        if(Configure::read('whitelabel.active') == true){
            $wl                     = $this->WhiteLabel->detail($id);         
            $white_label['active']  = true;
            $white_label['hName']   = $wl['wl_header'];
            $white_label['hBg']     = '#'.$wl['wl_h_bg'];
            $white_label['hFg']     = '#'.$wl['wl_h_fg'];   
            $white_label['fName']   = $wl['wl_footer'];
            
           // if(($wl['wl_img_active'] == 1)){
            if(($wl['wl_img_active'] === 'wl_img_active')||($wl['wl_img_active'] == 1)){
                $white_label['imgActive'] = true;   
            }else{
                $white_label['imgActive'] = false;
            }
            $white_label['imgFile']    = $wl['wl_img']; 
        }    
        
        $show_wizard        = false;
        $show_unknown_nodes = false;
        
        $q_rc = $this->UserSettings->find()->where(['user_id' => $id,'name' => "compact_view"])->first();
        if($q_rc){
            if($q_rc->value == 1){
                $compact = true;
            }
        }   
        
        
        if( $group == Configure::read('group.admin')){  //Admin

            $isRootUser = true; 
            $show_wizard = true;
        }
        
        if( $group == Configure::read('group.ap')){  //Or AP
          	$show_wizard = true;
            $show_unknown_nodes = true; 
        }
        
        
        $data_usage = [];
        if(isset($this->realm_id)){
           $data_usage = ['realm_id' => $this->realm_id, 'realm_name' => $this->realm_name];
        }
            
        return [
            'token'         =>  $token,
            'isRootUser'    =>  $isRootUser,
            'data_usage'    =>  $data_usage,
            'user'          =>  ['id' => $id, 'username' => $username,'group' => $group,'cls' => $cls,'timezone_id' => $user->timezone_id],
            'white_label'   =>  $white_label,
            'show_wizard'   =>  $show_wizard,
            'show_unknown_nodes' => $show_unknown_nodes,
            'compact'		=> $compact,
            'tree_nav' 		=> $this->_nav_tree()
        ];        
    }
       
    
    private function _ap_default_realm($ap_id){
    
        $realm = array();
      
        $q_r = $this->Users->find('path',['for' => $ap_id]);
            
        $found_flag = false; 
       
               
        foreach($q_r as $i){    
            $user_id    = $i->id;          
            $r          = $this->Realms->find()->where(['Realms.user_id' => $user_id,'Realms.available_to_siblings'=> true])->all();
               
            foreach($r  as $j){
                $id     = $j->id;
                $name   = $j->name;

                $read = $this->Acl->check(
                            array('model' => 'Users', 'foreign_key' => $ap_id), 
                            array('model' => 'Realms','foreign_key' => $id), 'read');
                if($read == true){
                    $realm['realm_id']      = $id;
                    $realm['realm_name']    = $name;
                    $found_flag = true;
                    break; // We only need one 
                }
            }
        }
        
        //All the realms owned by anyone this access provider created (and also itself) 
        //will automatically be under full controll of this access provider  
        if($found_flag == false){           
            $this->children     = $this->Users->find_access_provider_children($ap_id);
            $or_array           = array(['Realms.user_id' => $ap_id]); //Start with itself
            if($this->children){   //Only if the AP has any children...
                foreach($this->children as $i){
                    $id = $i['id'];
                    array_push($or_array,array('Realms.user_id' => $id));
                }       
            }
            if(count($or_array)>0){ //Only if there are something to 'OR'
                $r_sub = $this->Realms->find()->where(['OR' => $or_array])->all(); 
                foreach($r_sub  as $j){
                    $realm['realm_id']     = $j->id;
                    $realm['realm_name']   = $j->name;
                    break; //We only need one
                }
            }              
        }
        return $realm;
    }
    
    private function _nav_tree(){
    
    	$trRadius =	[
			[
				'text'	=> 'USERS',
				'leaf'	=> true,
				'controller'	=> 'cPermanentUsers',
				'id'		=> 'tabMainPermanentUsers',
				'iconCls'	=> 'x-fa fa-user',
				'glyph'		=> 'xf007'
			],
			[
				'text'	=> 'VOUCHERS',
				'leaf'	=> true,
				'controller'	=> 'cVouchers',
				'id'		=> 'tabMainVouchers',
				'iconCls'	=> 'x-fa fa-tag',
				'glyph'		=> 'xf02b'
			],
			[
				'text'	=> 'TOP-UPS',
				'leaf'	=> true,
				'controller'	=> 'cTopUps',
				'id'		=> 'tabMainTopUps',
				'iconCls'	=> 'x-fa  fa-coffee',
				'glyph'		=> 'xf0f4'
			]			
		];
		
		$thRadiusComponents = [
			[
				'text'	=> 'REALMS',
				'leaf'	=> true,
				'controller'	=> 'cRealms',
				'id'		=> 'tabMainRealms',
				'iconCls'	=> 'x-fa fa-globe',
				'glyph'		=> 'xf0ac'
			],		
			[
				'text'	=> 'PROFILES',
				'leaf'	=> true,
				'controller'	=> 'cProfiles',
				'id'		=> 'tabMainProfiles',
				'iconCls'	=> 'x-fa fa-cubes',
				'glyph'		=> 'xf1b3'
			],
			[
				'text'	=> 'CLIENTS',
				'leaf'	=> true,
				'controller'	=> 'cDynamicClients',
				'id'		=> 'tabMainDynamicClients',
				'iconCls'	=> 'x-fa fa-dot-circle-o',
				'glyph'		=> 'xf192'
			]		
		];
		
		$thNetworks = [
			[
				'text'	=> 'MESHdesk',
				'leaf'	=> true,
				'controller'=> 'cMeshes',
				'id'		=> 'tabMainMeshes',
				'iconCls'	=> 'x-fa fa-wifi',
				'glyph'		=> 'xf1eb'
			],	
			[
				'text'	=> 'HARDWARES',
				'leaf'	=> true,
				'controller'=> 'cHardwares',
				'id'		=> 'tabMainHardwares',
				'iconCls'	=> 'x-fa fa-cog',
				'glyph'		=> 'xf013'
			]	
		];
		
		$thOther = [
			[
				'text'	=> 'ADMINS',
				'leaf'	=> true,
				'controller'	=> 'cAccessProviders',
				'id'		=> 'tabMainAccessProviders',
				'iconCls'	=> 'x-fa fa-graduation-cap'
			],
			[
				'text'	=> 'CLOUDS',
				'leaf'	=> true,
				'controller'	=> 'cClouds',
				'id'		=> 'tabMainClouds',
				'iconCls'	=> 'x-fa fa-cloud',
				'glyph'		=> 'xf0c2'
			],
		];
    	   
    	$items = [
			[
				'text' => 'OVERVIEW',
				'id'   => 1,
				'leaf' => true,
				'iconCls' => 'x-fa fa-th-large'
			],
			[
				'text'	=> 'RADIUS USERS',
				'id'		=> 2,
				'expanded'	=> false,
				'iconCls'   => 'x-fa fa-user',
				'children'	=> $trRadius
			],
			[
				'text'	=> 'RADIUS COMPONENTS',
				'id'		=> 3,
				'expanded'	=> false,
				'iconCls'		=> 'x-fa  fa-dot-circle-o',
				'children'	=> $thRadiusComponents
			],
			[
				'text' => 'LOGIN PAGES',
				'leaf'	=> true,
				'controller'	=> 'cDynamicDetails',
				'id'		=> 'tabDynamicCDetails',
				'iconCls'	=> 'x-fa fa-arrow-circle-right',
				'glyph'		=> 'xf090'
			],
			[
				'text' 		=> 'NETWORKS',
				'controller'=> '4',
				'id'		=> 'tabMeshes',
				'iconCls'	=> 'x-fa fa-sitemap',
				'children'	=> $thNetworks		
			],
			[
				'text' 		=> 'OTHER',
				'id'		=> 5,
				'controller'=> '5',
				'iconCls'	=> 'x-fa fa-gears',
				'children'	=> $thOther		
			]  
    	];
    	
    	return $items;
     
    }
}

