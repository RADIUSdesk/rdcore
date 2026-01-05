<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Http\Response;
use Cake\Event\EventInterface;

class DashboardController extends AppController{
        
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Users');
        $this->loadModel('UserSettings');
        $this->loadModel('Realms'); 
        $this->loadModel('Clouds');   
        $this->loadComponent('Aa');
        $this->loadComponent('WhiteLabel');
        
        $this->loadComponent('Counts');
        
        $this->loadModel('Clouds');
        $this->loadModel('CloudAdmins');
        $this->Authentication->allowUnauthenticated([ 'authenticate', 'branding','checkToken']);
        
        //Set to true for a link to Radiator Stats
        $this->showRadiatorStats = true;    
    }    
    
    public function branding(){
    
    	$ap_id					= 44; //root's ID (Small hack) 
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
        $white_label['wallpaper']  = $wl['wl_wallpaper'];	 

        $this->set([
            'success'   => true,
            'data'      => $white_label
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
     public function navTree(){
       
        $r_and_c = $this->Aa->rights_and_components_on_cloud();
        $right   = $r_and_c['rights'];
            
        $items   = [];
        if(($right == 'admin')||($right == 'granular')||($right == 'view')){
            $items = $this->_nav_tree($r_and_c);
        }
         
    	$this->set([
            'items'          => $items,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);      
    }
        
    public function getToken(){
    
        //Sample call from CURL
        //curl -X POST -H 'Content-Type: application/x-www-form-urlencoded' -i 'http://127.0.0.1/cake4/rd_cake/dashboard/get-token.json' 
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
            
                $this->set([
                    'data'          => ['token' => $user['token'],'username' =>$user['username']],
                    'success'       => true
                ]);
                $this->viewBuilder()->setOption('serialize', true); 
            
            }else{
            
                $this->set([
                    'errors'        => ['username' => __('Confirm this name'),'password'=> __('Type the password again')],
                    'success'       => false,
                    'message'       => __('Authentication failed')
                ]);
                $this->viewBuilder()->setOption('serialize', true);
      
            }
        }else{
            $this->set([
                'errors'        => ['username' => __('Required'),'password'=> __('Required')],
                'success'       => false,
                'message'       => __('HTTP POST Required -> Authentication failed')
            ]);
            $this->viewBuilder()->setOption('serialize', true);
            return;
        }
    }
    
    public function authenticate(){

        $this->request->allowMethod(['post']);
        $authenticationService = $this->Authentication->getAuthenticationService();
        $result                = $authenticationService->getResult();
        
        if ($result->isValid()) {
        
            // Assuming you are using the `Password` identifier.
           if ($authenticationService->identifiers()->get('Password')->needsPasswordRehash()) {
                // Rehash happens on save.
                $user           = $this->Users->get($authenticationService->getIdentity()->getIdentifier());                
                $user->password = $this->request->getData('password');
                $this->Users->save($user);
            }
       
            // Authentication succeeded
            $user = $result->getData(); // Get the authenticated user data           
            $this->Authentication->setIdentity($user); // Set the identity in the session

            //We can get the detail for the user
            $u = $this->Users->find()->contain(['Groups'])->where(['Users.id' => $user->id])->first();
           
            //Check for auto-compact setting
            $auto_compact = false;
            if($this->request->getData('auto_compact')){
                if($this->request->getData('auto_compact')=='true'){ //Carefull with the queryz's true and false it is actually a string
                    $auto_compact = true;
                }
            }
                        
            $data = []; 
            $data = $this->_get_user_detail($u,$auto_compact);
                              
            $this->set([
                'data'          => $data,
                'success'       => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);            
            
        } else {
            // Authentication failed
             $this->set([
                'errors'        => ['username' => __('Confirm this name'),'password'=> __('Type the password again')],
                'success'       => false,
                'message'       => __('Authentication failed'),
            ]);
            $this->viewBuilder()->setOption('serialize', true);               
        }
    }
	
	public function checkToken(){
	
		$q_data = $this->request->getQuery();

        if((isset($q_data['token']))&&($q_data['token'] != '')){
        
            $token  = $q_data['token'];           
            $user   = $this->Users->find()->contain(['Groups'])->where(['Users.token' => $token])->first();
            
            if(!$user){
                $this->set([
                    'errors'        => ['token'=>'invalid'],
                    'success'       => false
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            
            }else{
               // print_r($user);
               
                //Check for auto-compact setting
                $auto_compact = false;
                if(isset($q_data['auto_compact'])){
                    if($q_data['auto_compact']=='true'){ //Carefull with the queryz's true and false it is actually a string
                        $auto_compact = true;
                    }
                }
               
                $data = $this->_get_user_detail($user,$auto_compact);                              
                $this->set([
                    'data'          => $data,
                    'success'       => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            }
                     
        }else{

            $this->set([
                'errors'        => ['token'=>'missing'],
                'success'       => false
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }
         
    }
    
    public function i18n(){
        $items = [];
        $i18n = Configure::read('Admin.i18n');
        foreach($i18n as $i){
            if($i['active']){
                array_push($items, $i);
            }
        }
        $this->set([
            'items'     => $items,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
     
     public function settingsView(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id    = $user['id']; 
        $wl         = $this->WhiteLabel->detail($user_id);

        $data       = $wl;         
        $e_user     = $this->{'Users'}->find()->where(['Users.id' => $user_id])->first();

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
                $data["$i"] = true; //19 July 23 - Make this 'true' to work with modern toolkit
            }else{
            	$data["$i"] = false;
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
                  
           
        $q_rr = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'realm_id'])->first();
        if($q_rr){
            $q_r                = $this->Realms->find()->where(['id' => $q_rr->value])->first();
            if($q_r){
            	$realm_name         = $q_r->name;
            	$data['realm_name'] = $realm_name;
            	$data['realm_id']   = intval($q_rr->value);
            }
        }
               
        $q_cloud = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'cloud_id'])->first();
        if($q_cloud){
            $q_c                = $this->Clouds->find()->where(['id' => $q_cloud->value])->first();
            if($q_c){
            	$cloud_name         = $q_c->name;
            	$data['cloud_name'] = $cloud_name;
            	$data['cloud_id']   = intval($q_cloud->value);
            }
        }
          	    
        $this->set([
            'data'   => $data,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
     
     public function settingsSubmit(){
     
         //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.    
        $this->viewBuilder()->setLayout('ext_file_upload');
     
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
            'alert_frequency',
            'cloud_id'
        ];  
          
        //Clean up everything
        foreach($remove_items as $ri){
             $this->UserSettings->deleteAll(['UserSetting.user_id' => $user_id,'UserSetting.name' => $ri]);
        } 
        
        $ap_id = $user_id;
        
        $check_items = [
			'wl_active',
			'wl_img_active'
		];
		
		$r_data		= $this->request->getData();
        $q_data		= $this->request->getQuery();
		
        foreach($check_items as $i){
            if(isset($r_data[$i])){
            	if($r_data[$i] == 'null'){
                	$r_data[$i] = 0;
                }else{
                	$r_data[$i] = 1;
                }  
            }else{
                $r_data[$i] = 0;
            }
        }    
        
        $looking_for    = ['wl_active','wl_header','wl_h_bg','wl_h_fg','wl_footer','wl_img_active','wl_img_file'];
        
        if($r_data['wl_active'] == 1){
            
            $new_logo   = false;
            $filename 	= '';
            $dest		= '';
                               
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
                    $entity = $this->UserSettings->newEmptyEntity();
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
                $entity             = $this->UserSettings->newEmptyEntity();
                $entity->user_id    = $ap_id;
                $entity->name       = $i;
                $entity->value      = $r_data["$i"];
                $this->UserSettings->save($entity);
            }
        }else{
        
            foreach($looking_for as $ri){
                 $this->UserSettings->deleteAll(['UserSetting.user_id' => $user_id,'UserSetting.name' => $ri]);
            } 
        } 
        
         if(isset($r_data['cloud_id'])){
         
         	if(isset($r_data['changed_cloud_id'])){       	
         		$r_data['cloud_id'] = $r_data['changed_cloud_id'];
         	}
         
		    $s = $this->UserSettings->newEmptyEntity();
            $s->user_id = $user_id;
            $s->name    = 'cloud_id';
            $s->value   = $r_data['cloud_id'];
            $this->UserSettings->save($s);
        }
                       
        if(isset($r_data['realm_id'])){
		    $s = $this->UserSettings->newEmptyEntity();
            $s->user_id = $user_id;
            $s->name    = 'realm_id';
            $s->value   = $r_data['realm_id'];
            $this->UserSettings->save($s);
        }
       
        if(isset($r_data['compact_view'])){
		    $s = $this->UserSettings->newEmptyEntity();
            $s->user_id = $user_id;
            $s->name    = 'compact_view';
            $s->value   = 1;
            $this->UserSettings->save($s);
        }
        
        if(isset($r_data['alert_activate'])){
		    $s = $this->UserSettings->newEmptyEntity();
            $s->user_id = $user_id;
            $s->name    = 'alert_activate';
            $s->value   = 1;
            $this->UserSettings->save($s);
        }
        
        if(isset($r_data['alert_frequency'])){
		    $s = $this->UserSettings->newEmptyEntity();
            $s->user_id = $user_id;
            $s->name    = 'alert_frequency';
            $s->value   = $r_data['alert_frequency'];
            $this->UserSettings->save($s);
        }                    
        
        if (array_key_exists('overviews_to_include', $r_data)) {
            if(!empty($r_data['overviews_to_include'])){               
            	if(is_array($r_data['overviews_to_include'])){
            		if(isset($r_data['overviews_to_include'][0])){
		        		if(str_contains($r_data['overviews_to_include'][0], ',')) {
		    				$r_data['overviews_to_include'] = explode(',',$r_data['overviews_to_include'][0]);
		    			}
		    		}          	           	
		            foreach($r_data['overviews_to_include'] as $e){
		                if($e != ''){
		                    $s = $this->UserSettings->newEmptyEntity();
		                    $s->user_id = $user_id;
		                    $s->name    = $e;
		                    $s->value   = 1;
		                    $this->UserSettings->save($s);
		                }    
		            }
		       	}
            }
        }
           
        if(isset($r_data['default_overview'])){
		    $s = $this->UserSettings->newEmptyEntity();
            $s->user_id = $user_id;
            $s->name    = 'default_overview';
            $s->value   = $r_data['default_overview'];
            $this->UserSettings->save($s);
        }
        $email = '';
        
        if(isset($r_data['timezone_id'])){
            $e_user     = $this->{'Users'}->find()->where(['Users.id' => $user['id']])->first();
            if($this->request->getData('email')){
                $email = $this->request->getData('email');
            }
            if($e_user){
                $this->{'Users'}->patchEntity($e_user,['timezone_id' => $r_data['timezone_id'],'email' =>$email]);
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

		//$this->viewBuilder()->setOption('serialize', ['articles', 'comments']);
        $this->set([
            'success'   => true,
            'data'      => $white_label
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function changePassword(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $data       = [];  
        $u          = $this->Users->get($user_id);
        
        $u->set('password',$this->request->getData('password'));
        $u->set('token',''); //Setting it ti '' will trigger a new token generation
        $this->Users->save($u); 
        $data['token']  = $u->get('token');
        
        $this->set([
            'success' => true,
            'data'    => $data
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function itemsFor(){
    	$user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id  	= $user['id'];
        $isRootUser = false;
        $group		= $user['group_name'];
        
        if( $group  == Configure::read('group.admin')){  //Admin
            $isRootUser = true; 
        }
        
        $tabItem    = $this->request->getQuery('item_id');
        $cloudId    = $this->request->getQuery('cloud_id');
        $req_q      = $this->request->getQuery();
	$comps      = [];
        $right      = false;

        if($cloudId){
            $r_and_c = $this->Aa->rights_and_components_on_cloud();
	    if($r_and_c && isset($r_and_c['rights'])){
                $right   = $r_and_c['rights'];
                $comps   = $r_and_c['components'] ?? [];
            }
        }       
        //$right = $this->Aa->rights_on_cloud(); 
              
        $items	    = [];        
        if($tabItem == 'tabMainOverview'){
         
         	$q_network = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'meshdesk_overview'])->first();
         	if($q_network){
                 	
		     	array_push($items,[
		                "title" => "Networks",
		                "glyph" => "xf0e8@FontAwesome",
		                "id" 	=> "cNetworkOverview",
		                "layout" => "fit",
		                "tabConfig" => [
		                    "ui" => "tab-blue"
		                ]
		           ]);
		  	}
		  	
		  	$q_radius = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'radius_overview'])->first();
         	if($q_radius){
                 	
		     	array_push($items,[
		                "title" => "Data Usage",
		                "glyph" => "xf1c0@FontAwesome",
		                "id" 	=> "cDataUsage",
		                "layout" => "fit",
		                "tabConfig" => [
		                    "ui" => "tab-orange"
		                ]
		           ]);
		  	}
		  	
		 	array_push($items,[
                "title" => "Utilities",
                "glyph" => "xf085@FontAwesome",
                "id" 	=> "cUtilities",
                "layout" => "fit",
                "tabConfig" => [
                    "ui" => "tab-blue"
                ]
           ]);                     	  
        }
              
        if($tabItem == 'tabMainUsers'){
	    if(isset($comps['cmp_permanent_users']) && $comps['cmp_permanent_users']){
                $items[] = [
                    "title" => "Permanent Users",
                    "glyph" => "xf2c0@FontAwesome",
                    "id" => "cPermanentUsers",
                    "layout" => "fit",
                    "tabConfig" => [
                        "ui" => "tab-blue"
                    ]
               ];           
            }            
	    if(isset($comps['cmp_vouchers']) && $comps['cmp_vouchers']){
                $items[] = [
                    "title" => "Vouchers",
                    "glyph" => "xf145@FontAwesome",
                    "id" => "cVouchers",
                    "layout" => "fit",
                    "tabConfig" => [
                        "ui" => "tab-orange"
                    ]
                ];           
            }
            $items[] = [
                "title" => "Activity Monitor",
                "glyph" => "xf0e7@FontAwesome",
                "id" => "cActivityMonitor",
                "layout" => "fit",
                "tabConfig" => [
                    "ui" => "tab-metal"
                ]
            ];   
        }
        
        if($tabItem == 'tabMainRadius'){
	    if(isset($comps['cmp_dynamic_clients']) && $comps['cmp_dynamic_clients']){
                $items[] = [
                    "title" => "RADIUS Clients",
                    "glyph" => "xf1ce@FontAwesome",
                    "id"    => "cDynamicClients",
                    "layout"=> "fit",
                    "tabConfig"=> [
                        "ui"=> "tab-blue"
                    ]
                ];           
            }            
	    if(isset($comps['cmp_nas']) && $comps['cmp_nas']){
                $items[] =  [
                    "title" => "NAS",
                    "glyph" => "xf1cb@FontAwesome",
                    "id"    => "cNas",
                    "layout"=> "fit",
                    "tabConfig"=> [
                        "ui"=> "tab-blue"
                    ]
                ];           
            }
	    if(isset($comps['cmp_profiles']) && $comps['cmp_profiles']){
                $items[] =  [
                    "title" => "Profiles",
                    "glyph" => "xf1b3@FontAwesome",
                    "id"    => "cProfiles",
                    "layout"=> "fit",
                    "tabConfig"=> [
                        "ui"=> "tab-blue"
                    ]
                ];           
            }
            
	    if(isset($comps['cmp_realms']) && $comps['cmp_realms']){
                $items[] =  [
                    "title" => "Realms (Groups)",
                    "glyph" => "xf06c@FontAwesome",
                    "id"    => "cRealms",
                    "layout"=> "fit",
                    "tabConfig"=> [
                        "ui"=> "tab-orange"
                    ]
                ];           
            }
                  
          /*  if($right === 'view'){
                $items = [
            		[
                        "title" => "RADIUS Clients",
                        "glyph" => "xf1ce@FontAwesome",
                        "id"    => "cDynamicClients",
                        "layout"=> "fit",
                        "tabConfig"=> [
                            "ui"=> "tab-blue"
                        ]
                    ]
               	];                      
            }*/
        }
        
        if($tabItem == 'tabMainNetworks'){
            if(isset($comps['cmp_meshes']) && $comps['cmp_meshes']){
                $items['meshes'] = true;
            }  
	    if(isset($comps['cmp_ap_profiles']) && $comps['cmp_ap_profiles']){
                $items['ap_profiles'] = true;
            }
            $items['unknown_nodes'] = true;  
        }
              
        $this->set([
            'success' => true,
            'items'    => $items
        ]);
        $this->viewBuilder()->setOption('serialize', true);   
      
    }
    
    public function networksItems(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id  	= $user['id'];
        $isRootUser = false;
        $group		= $user['group_name'];
        
        if( $group  == Configure::read('group.admin')){  //Admin
            $isRootUser = true; 
        }
        //FIXME This needs some more work in terms of components which should be listed per Access Provider

        $cloudId = (int)$this->request->getQuery('cloud_id');
        
        $totals = $this->Counts->totals([
                ['table' => 'Meshes',      'key'  => 'mesh_networks'],
                ['table' => 'ApProfiles',  'key' => 'ap_profiles'],
              //  ['table' => 'UnknownNodes','key' => 'unknown_nodes']
            ], $cloudId);
        
        $items = [];
        $items[] =  [
            'column1'   => 
              [
                'name'          => 'MESHdesk',
                'controller'    => 'cMeshes',
                'id'            => 'pnlNetworksMeshes',
                'glyph'         => 'xf20e',
                'total'         => $totals['mesh_networks'],
                'desc'          => 'Mesh networks made easy',
                'accent'        => 'blue'            
              ],
            'column2' => 
              [
                'name'          => 'APdesk',
                'controller'    => 'cAccessPoints',
                'id'            => 'pnlNetworksAccessPoints',
                'glyph'         => 'xf1b3',
                'total'         => $totals['ap_profiles'],
                'desc'          => 'Manage OpenWrt based hardware',
                'accent'        => 'teal'
              ]
        ];
        
        $items[] =  [
            'column1'   => 
              [
                'name'          => 'New Arrivals - Hardware',
                'controller'    => 'cUnknownNodes',
                'id'            => 'pnlNetworksUnknownNodes',
                'glyph'         => 'xf207',
              //  'total'         => $totals['unknown_nodes'],
                'desc'          => 'Onboarding new hardware',
                'accent'        => 'purple'           
              ]
        ];
        
        $this->set([
            'success' => true,
            'items'    => $items
        ]);
        $this->viewBuilder()->setOption('serialize', true);      
    }
    
    //==== Users ====
    public function usersItems(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id  	= $user['id'];
        $isRootUser = false;
        $group		= $user['group_name'];
        
        if( $group  == Configure::read('group.admin')){  //Admin
            $isRootUser = true; 
        }
        //FIXME This needs some more work in terms of components which should be listed per Access Provider

        $cloudId = (int)$this->request->getQuery('cloud_id');  
        $comps = [];
        $right = false;
        
        if($cloudId){
            $r_and_c = $this->Aa->rights_and_components_on_cloud();
            if($r_and_c && isset($r_and_c['rights'])){
                $right   = $r_and_c['rights'];
                $comps   = isset($r_and_c['components']) ? $r_and_c['components'] : [];
            }
        } 
                
        $firstRow = [];  
            
	if(isset($comps['cmp_permanent_users']) && $comps['cmp_permanent_users']){
            $tUsers = $this->Counts->countPermanentUsers($cloudId);
            $firstRow['column1']   = 
              [
                'name'          => 'Permanent Users',
                'controller'    => 'cPermanentUsers',
                'id'            => 'pnlUsersPermanentUsers',
                'glyph'         => 'xf2c0',
                'total'         => $tUsers['total'],
                'online'        => $tUsers['online'],
                'suspended'     => $tUsers['suspended'],
                'terminated'    => $tUsers['terminated'],     
                'desc'          => 'Regular users with personal login details.',
                'accent'        => 'blue'            
              ];         
        }            
	if(isset($comps['cmp_vouchers']) && $comps['cmp_vouchers']){
            $tVouchers = $this->Counts->countVouchers($cloudId);
            $firstRow['column2']   = 
              [
                'name'          => 'Vouchers',
                'controller'    => 'cVouchers',
                'id'            => 'pnlUsersVouchers',
                'glyph'         => 'xf145',
                'total'         => $tVouchers['total'],
                'online'        => $tVouchers['online'],
                'desc'          => 'Easy to create and use for short visits.',
                'accent'        => 'teal'
            ];                    
        }          
        
        $items      = [];
        $items[]    =  $firstRow;
        
        $sessions = $this->Counts->countRadaccts($cloudId);
        
        $items[] =  [
            'column1'   => 
              [
                'name'          => 'Activity Monitor',
                'controller'    => 'cActivityMonitor',
                'id'            => 'pnlUsersActivityMonitor',
                'glyph'         => 'xf0e7',
                'total'         => $sessions,
                'sessions'      => $sessions,
                'desc'          => 'Current sessions and connection history at a glance.',
                'accent'        => 'purple'           
              ]
        ];
        
        $this->set([
            'success' => true,
            'items'    => $items
        ]);
        $this->viewBuilder()->setOption('serialize', true);    
    }
    
    //==== RADIUS ====
    public function radiusItems(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id  	= $user['id'];
        $isRootUser = false;
        $group		= $user['group_name'];
        
        if( $group  == Configure::read('group.admin')){  //Admin
            $isRootUser = true; 
        }
        //FIXME This needs some more work in terms of components which should be listed per Access Provider

        $cloudId = (int)$this->request->getQuery('cloud_id');
        
        $totals = $this->Counts->totals([
                ['table' => 'DynamicClients', 'key' => 'clients'],
                ['table' => 'Nas',            'key' => 'nas'],
                ['table' => 'Profiles',       'key' => 'profiles'],
                ['table' => 'Realms',         'key' => 'realms'],
            ], $cloudId);
        
        $items = [];
        $items[] =  [
            'column1'   => 
              [
                'name'          => 'RADIUS Clients',
                'controller'    => 'cDynamicClients',
                'id'            => 'pnlRadiusDynamicClients',
                'glyph'         => 'xf1ce',
                'total'         => $totals['clients'],
                'desc'          => 'Devices allowed to send RADIUS requests.',
                'accent'        => 'blue'            
              ],
            'column2' => 
              [
                'name'          => 'NAS',
                'controller'    => 'cNas',
                'id'            => 'pnlRadiusNas',
                'glyph'         => 'xf1cb',
                'total'         => $totals['nas'],
                'desc'          => 'Network access servers and concentrators.',
                'accent'        => 'teal'
              ]
        ];
        
        $items[] =  [
            'column1'   => 
              [
                'name'          => 'Profiles',
                'controller'    => 'cProfiles',
                'id'            => 'pnlRadiusProfiles',
                'glyph'         => 'xf1b3',
                'total'         => $totals['profiles'],
                'desc'          => 'Reusable policy bundles (rates, session).',
                'accent'        => 'purple'           
              ],
            'column2' => 
              [
                'name'          => 'Realms (Groups)',
                'controller'    => 'cRealms',
                'id'            => 'pnlRadiusRealms',
                'glyph'         => 'xf06c',
                'total'         => $totals['realms'],
                'desc'          => 'Tenant/group routing and policy domains.',
                'accent'        => 'orange'
              ]
        ];
        
        $this->set([
            'success' => true,
            'items'    => $items
        ]);
        $this->viewBuilder()->setOption('serialize', true);   
    
    
    }
    
    
    //==== Other ====
    public function otherItems(){
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){
            return;
        }
        $user_id  	= $user['id'];
        $isRootUser = false;
        $group		= $user['group_name'];
        
        if( $group  == Configure::read('group.admin')){  //Admin
            $isRootUser = true; 
        }
        
        $cloudId = (int)$this->request->getQuery('cloud_id');
    
        $items = [];
        $items[] = [ "rowType" => "header", "group" => "System & Admin" ];
        
        if($isRootUser){
            $items[] = [ 
                'column1'   => 
                  [
                    'name'          => 'SETTINGS',
                    'controller'    => 'cSettings',
                    'id'            => 'pnlOtherSettings',
                    'glyph'         => 'xf085',
                    'desc'          => 'Site wide and common settings',
                    'accent'        => 'blue'
                  ],
                  'column2'   => 
                 [
                    'name'          => 'HARDWARE',
                    'controller'    => 'cHardwares',
                    'id'            => 'pnlOtherHardware',
                    'glyph'         => 'xf0a0',
                    'total'         => $this->Counts->countForCloud('Hardwares',$cloudId),
                    'desc'          => 'Hardware defined for MESHdesk and APdesk',
                    'accent'        => 'teal'
                ]
            ];
        }
        
        if($isRootUser){
            $items[] =  [
                'column1'   => 
                  [
                    'name'          => 'CLOUDS',
                    'controller'    => 'cClouds',
                    'id'            => 'pnlOtherClouds',
                    'glyph'         => 'xf0c2',
                    'desc'          => 'We segment by clouds',
                     'accent'       => 'purple'
                  ],
                'column2' => 
                  [
                    'name'          => 'ADMINS',
                    'controller'    => 'cAccessProviders',
                    'id'            => 'pnlOtherAdmins',
                    'glyph'         => 'xf084',
                    'desc'          => 'Administrators to manage clouds',
                    'accent'        => 'orange'
                  ]
            ]; 
            
        }else{
            $items[] =  [
                'column1'   => 
                  [
                    'name'          => 'CLOUDS',
                    'controller'    => 'cClouds',
                    'id'            => 'pnlOtherClouds',
                    'glyph'         => 'xf0c2',
                    'desc'          => 'We segment by clouds',
                    'accent'        => 'purple'
                  ],
                  'column2' => 
                  [
                    'name'          => 'HARDWARE',
                    'controller'    => 'cHardwares',
                    'id'            => 'pnlOtherHardware',
                    'glyph'         => 'xf0a0',
                    'total'         => $this->Counts->countForCloud('Hardwares',$cloudId),
                    'desc'          => 'Hardware defined for MESHdesk and APdesk',
                    'accent'        => 'teal'
                  ]
            ];                      
        }
        
        $items[] = [ "rowType" => "header", "group" => "Traffic & QoS" ];
        
        $items[] =  [
                'column1'   => 
                  [
                    'name'          => 'SQM PROFILES',
                    'controller'    => 'cSqmProfiles',
                    'id'            => 'pnlOtherSqmProfiles',
                    'glyph'         => 'xf00a',
                    'total'         => $this->Counts->countForCloud('SqmProfiles',$cloudId),
                    'desc'          => 'FIXME Description',
                    'accent'        => 'blue'
                  ],
                'column2' => 
                  [
                    'name'          => 'FIREWALL',
                    'controller'    => 'cFirewallProfiles',
                    'id'            => 'pnlOtherFirewall',
                    'glyph'         => 'xf06d',
                    'total'         => $this->Counts->countForCloud('FirewallProfiles',$cloudId),
                    'desc'          => 'FIXME Description',
                    'accent'        => 'teal'
                  ]
            ];
        
        $items[] =  [
                'column1'   => 
                  [
                    'name'          => 'MULTI WAN',
                    'controller'    => 'cMultiWan',
                    'id'            => 'pnlOtherMultiWan',
                    'glyph'         => 'xf0e8',
                    'total'         => $this->Counts->countForCloud('MultiWanProfiles',$cloudId),
                    'desc'          => 'FIXME Description',
                    'accent'        => 'purple'
                  ],
                'column2'   => 
                [
                    'name'          => 'SCHEDULES',
                    'controller'    => 'cSchedules',
                    'id'            => 'pnlOtherSchedules',
                    'glyph'         => 'xf133',
                    'total'         => $this->Counts->countForCloud('Schedules',$cloudId),
                    'desc'          => 'FIXME Description',
                    'accent'        => 'orange'
                  ],
            ];
            
        $items[] = [ "rowType" => "header", "group" => "Authentication & Security" ];
        if($isRootUser){
            $items[] =  [
                'column1' => 
                  [
                    'name'          => 'FREERADIUS HOME SERVERS',
                    'controller'    => 'cHomeServerPools',
                    'id'            => 'pnlOtherHomeServerPools',
                    'glyph'         => 'xf1ce',
               //     'total'         => $this->Counts->countForCloud('HomeServers',$cloudId),
                    'desc'          => 'Mange upstream RADIUS servers',
                    'accent'        => 'blue'
                  ],
                  'column2' => 
                  [
                    'name'          => 'PRIVATE PSKS',
                    'controller'    => 'cPrivatePsks',
                    'id'            => 'pnlOtherPrivatePsks',
                    'glyph'         => 'xf023',
                    'total'         => $this->Counts->countForCloud('PrivatePsks',$cloudId),
                    'desc'          => 'Private PSKs - No RADIUS',
                    'accent'        => 'teal'
                  ]
            ];
        }else{   
            $items[] =   [
                'column1' => 
                    [
                        'name'          => 'PRIVATE PSKS',
                        'controller'    => 'cPrivatePsks',
                        'id'            => 'pnlOtherPrivatePsks',
                        'glyph'         => 'xf023',
                        'total'         => $this->Counts->countForCloud('PrivatePsks',$cloudId),
                        'desc'          => 'Private PSKs - No RADIUS',
                        'accent'        => 'blue'
                    ]
            ];
        }
        $items[] = [ "rowType" => "header", "group" => "Hotspot & Portal" ];
        
        $items[] =   [
                'column1'   => 
                  [
                    'name'          => 'LOGIN PAGES',
                    'controller'    => 'cDynamicDetails',
                    'id'            => 'pnlOtherLogin',
                    'glyph'         => 'xf0a9',
                    'total'         => $this->Counts->countForCloud('DynamicDetails',$cloudId),
                    'desc'          => 'Configurable, Powerfull, Modern. Support for Mikrotik and CoovaChilli',
                    'accent'        => 'blue'
                  ],
                'column2' => 
                  [
                    'name'          => 'HOTSPOT 2.0/PASSPOINT',
                    'controller'    => 'cPasspoint',
                    'id'            => 'pnlOtherPasspoint',
                    'glyph'         => 'xf1eb',
                    'total'         => $this->Counts->countForCloud('PasspointProfiles',$cloudId),
                    'desc'          => 'Quick and easy Hotspot 2.0 profiles',
                    'accent'        => 'teal'
                  ]
            ];
            
        $items[] =   [
                'column1'   => 
                  [
                    'name'          => 'WPA-ENTERPRISE/HS2.0 UPLINKS',
                    'controller'    => 'cPasspointUplinks',
                    'id'            => 'pnlOtherPasspointUplinks',
                    'glyph'         => 'xf1eb',
                    'total'         => $this->Counts->countForCloud('PasspointUplinks',$cloudId),
                    'desc'          => 'Predefined uplinks available to WAN-By-WiFi configurations',
                    'accent'        => 'purple'
                  ]
            ];
            
        $items[] = [ "rowType" => "header", "group" => "VPN & Tunneling" ];        
        $items[] =  [
            'column1'   => 
              [
                'name'          => 'OPENVPN SERVERS',
                'controller'    => 'cOpenvpnServers',
                'id'            => 'pnlOtherOpenvpnServers',
                'glyph'         => 'xf10e',
                'total'         => $this->Counts->countForCloud('OpenvpnServers',$cloudId),
                 'desc'          => 'OpenVPN tunnel and PKI management',
                 'accent'        => 'blue'
              ],
            'column2' => 
              [
                'name'          => 'ACCEL-PPP SERVERS',
                'controller'    => 'cAccel',
                'id'            => 'pnlOtherAccel',
                'glyph'         => 'xf10e',
                'total'         => $this->Counts->countForCloud('AccelServers',$cloudId),
                'desc'          => 'Accel-ppp for PPPoE and L2TPv2 connections',
                'accent'        => 'teal'
              ]
        ];
        
        $items[] =  [
            'column1'   => 
              [
                'name'          => 'WIREGUARD SERVERS',
                'controller'    => 'cWireguard',
                'id'            => 'pnlOtherWireguard',
                'glyph'         => 'xf10e',
                'total'         => $this->Counts->countForCloud('WireguardServers',$cloudId),
                'desc'          => 'Manage Wireguard servers, instances and peers',
                'accent'        => 'purple'
              ]
        ];
        
                       
         $this->set([
            'success' => true,
            'items'    => $items
        ]);
        $this->viewBuilder()->setOption('serialize', true);   
    }
    
     public function utilitiesItems(){
     
        $ta     = 'left';        
        $data   = [
            [
                'xtype'   => 'button',
                'text'    => 'Networks',
                'glyph'   => Configure::read('icnNetwork'),
                'scale'   => 'large',
                'itemId'  => 'btnMeshOverview',
                'textAlign' => $ta 
            ],
            [
                'xtype'   => 'button',
                'text'    => 'Data Usage',
                'glyph'   => Configure::read('icnData'),
                'scale'   => 'large',
                'itemId'  => 'btnDataUsage',
                'textAlign' => $ta 
            ],
            [
                'xtype'   => 'button',
                'text'    => 'Alerts',
                'glyph'   => Configure::read('icnBell'),
                'scale'   => 'large',
                'itemId'  => 'btnAlerts',
                'textAlign' => $ta 
            ],
            [
                'xtype'   => 'button',
                'text'    => 'Flows',
                'glyph'   => Configure::read('icnSkyatlas'),
                'scale'   => 'large',
                'itemId'  => 'btnFlows',
                'textAlign' => $ta 
            ],
            [
                'xtype'   => 'button',
                'text'    => 'Test RADIUS',
                'glyph'   => Configure::read('icnRadius'),
                'scale'   => 'large',
                'itemId'  => 'btnTestRadius',
                'textAlign' => $ta 
            ],
            [
                'xtype'   => 'button',
                'text'    => 'QR Code Generator',
                'glyph'   => Configure::read('icnQrcode'),
                'scale'   => 'large',
                'itemId'  => 'btnQrcode',
                'textAlign' => $ta 
            ]                   
        ];
        
        if($this->showRadiatorStats){
            $data[] = [
                'xtype'     => 'button',
                'text'      => 'RADIUS Stats',
                'glyph'     => Configure::read('icnGraph'),
                'scale'     => 'large',
                'itemId'    => 'btnRadstats',
                'textAlign' => $ta 
            ];       
        }
        
             
        $this->set([
            'data'          => $data,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    
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
       	
       	//Check if the user has any clouds it can manage
       	$query   = $this->{'Clouds'}->find();
            
		//---Access Providers- Special where clause--
    	if($user->group->name == Configure::read('group.ap')){ 
    		      		
			$clouds_OR_list		= [['Clouds.user_id' => $id]]; //This is the basic search item
			$q_ca = $this->{'CloudAdmins'}->find()->where(['CloudAdmins.user_id'=>$id])->all();//The access provider (ap) might also be admin to other clouds
			foreach($q_ca as $e_ca){
				array_push($clouds_OR_list,['Clouds.id' => $e_ca->cloud_id]);
			}      	
			$query->where(['OR' => $clouds_OR_list]);
    	}
    	//---END---        	   
    	
    	$query->order(['name' => 'ASC']);
    	$cloud_count 	= $query->count();
    	$cloud_name		= false;
    	$cloud_id		= false;
    	$realm_id		= false;
    	
    	
    	if($cloud_count > 0){ //Check if there is a default cloud set for this user  	
    		$q_cloud = $this->UserSettings->find()->where(['user_id' => $id,'name' => 'cloud_id'])->first();
        	if($q_cloud){
            	$q_c                = $this->Clouds->find()->where(['id' => $q_cloud->value])->first();
            	$cloud_name         = $q_c->name;
				$cloud_id			= intval($q_cloud->value);			
				if($q_c){
            		$cloud_name         = $q_c->name;
					$cloud_id			= intval($q_cloud->value);
				}else{
					$cloud_name         = '';
					$cloud_id			= null;
				}				
        	} 
        	
        	$q_realm = $this->UserSettings->find()->where(['user_id' => $id,'name' => 'realm_id'])->first();
        	if($q_realm){
            	$q_r                = $this->Realms->find()->where(['id' => $q_realm->value])->first();
            	if($q_r){
            		$realm_name         = $q_r->name;
					$realm_id			= intval($q_realm->value);
				}else{
					$realm_name			= '';
					$realm_id			= null;
				}
        	} 	       		
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
        if($realm_id){
           $data_usage = ['realm_id' => $realm_id, 'realm_name' => $realm_name];
        }
            
        return [
            'token'         =>  $token,
            'isRootUser'    =>  $isRootUser,
            'data_usage'    =>  $data_usage,
            'user'          =>  [
            	'id' 			=> $id, 
            	'username' 		=> $username,
            	'group' 		=> $group,
            	'cls' 			=> $cls,
            	'timezone_id' 	=> $user->timezone_id,
            	'cloud_count' 	=> $cloud_count,
            	'cloud_name'	=> $cloud_name,
            	'cloud_id'		=> $cloud_id
           	],
            'white_label'   =>  $white_label,
            'show_wizard'   =>  $show_wizard,
            'show_unknown_nodes' => $show_unknown_nodes,
            'compact'		=> $compact,
            'tree_nav' 		=> $this->_nav_tree_blank()
        ];        
    }
    
    private function _nav_tree($rc){
    
        $rights     = isset($rc['rights']) ? $rc['rights'] : false;
        $components = isset($rc['components']) ? $rc['components'] : [];   	   
    	$items = [
			[
				'text' 		=> 'OVERVIEW',
				'leaf' 		=> true,
				'iconCls' 	=> 'x-fa fa-th-large',
				'glyph'		=> 'xf009',
				'controller'	=> 'cMainOverview',
				'id'		=> 'tabMainOverview'
			]
        ];
        
        if(isset($components['cmp_permanent_users']) && isset($components['cmp_vouchers']) && ($components['cmp_permanent_users'] || $components['cmp_vouchers'])){      
            $items[] = [
				'text'		=> 'USERS',
				'leaf'		=> true,
				'iconCls'   => 'x-fa fa-user',
				'controller'=> 'cMainUsers',
				'id'		=> 'tabMainUsers',
				'glyph'		=> 'xf2c0'
			];      
        }
        
        if((isset($components['cmp_dynamic_clients']) && $components['cmp_dynamic_clients']) || 
           (isset($components['cmp_nas']) && $components['cmp_nas']) || 
           (isset($components['cmp_profiles']) && $components['cmp_profiles']) || 
           (isset($components['cmp_realms']) && $components['cmp_realms'])){      
            $items[] = [
				'text'		=> 'RADIUS',
				'leaf'		=> true,
				'iconCls'	=> 'x-fa fa-circle-o-notch',
				'controller'=> 'cMainRadius',
				'id'		=> 'tabMainRadius',
				'glyph'		=> 'xf1ce'
			];      
        }
        
        if((isset($components['cmp_meshes']) && $components['cmp_meshes']) || 
           (isset($components['cmp_ap_profiles']) && $components['cmp_ap_profiles'])){      
            $items[] = [
				'text' 		=> 'NETWORK',
				'leaf'	    => true,
				'controller'=> 'cMainNetworks',
				'id'		=> 'tabMainNetworks',
				'iconCls'	=> 'x-fa fa-sitemap',
				'glyph'		=> 'xf0e8'	
			];      
        }
        
        if(isset($components['cmp_other']) && $components['cmp_other']){      
            $items[] = [
				'text' 		=> 'OTHER',
				'leaf'	    => true,
				'id'		=> 'tabMainOther',
				'controller'=> 'cMainOther',
				'iconCls'	=> 'x-fa fa-gears',
				'glyph'		=> 'xf085'	
			];      
        }
    
    	return $items;  
    }    
    
    private function _nav_tree_blank(){
        
    	$items = [
			[
				'text' 		=> 'OVERVIEW',
				'leaf' 		=> true,
				'iconCls' 	=> 'x-fa fa-th-large',
				'glyph'		=> 'xf009',
			    'controller'=> 'cMainOverview',
				'id'		=> 'tabMainOverview'
			],
			[
				'text' 		=> 'OTHER',
				'leaf'	    => true,
				'id'		=> 'tabMainOther',
				'controller'=> 'cMainOther',
				'iconCls'	=> 'x-fa fa-gears',
				'glyph'		=> 'xf090'	
			]  
    	];
    	
    	return $items;      
    }   
}