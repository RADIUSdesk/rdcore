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
                
                // added for rolling token; enhanced security
                //FIXME Bring it back later with Config option -> Makes it hard to colaborate and troubleshoot
                // --- BEGIN ---
               // $u->set('token',''); //Setting it ti '' will trigger a new token generation
              //  $this->Users->save($u);
              //  $data['token']  = $u->get('token');
                // --- END ---
                          
                $this->set(array(
                    'data'          => $data,
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
    
     public function utilitiesItems(){
     
        $ta     = 'left';        
        $data   = [
            [
                'xtype'   => 'button',
                'text'    => 'Mesh Networks Overview',
                'glyph'   => Configure::read('icnMesh'),
                'scale'   => 'large',
                'itemId'  => 'btnMeshOverview',
                'textAlign' => $ta 
            ],
            [
                'xtype'   => 'button',
                'text'    => 'Users Overview',
                'glyph'   => Configure::read('icnUser'),
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
            ]             
        ];      
        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['success','data']
        ]);
    
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
    
        //print_r($user);
         
        $group      = $user->group->name;
        $username   = $user->username;
        $token      = $user->token;
        $id         = $user->id;
        
        $cls        = 'user';
        $menu       = array();
        
        $isRootUser = false;
        $extensions = false;
        if(Configure::read('extensions.active') == true){
            $extensions = true;
        }
        
        $display = 'take_setting'; //Default is to take the settings value 
   
        if($auto_compact){
            $display = 'compact'; //Override setting due to screen size to small
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
        
        if( $group == Configure::read('group.admin')){  //Admin
            $cls = 'admin';
            $tabs= $this->_build_admin_tabs($id,$display);  //We do not care for rights here;
            $isRootUser = true; 
            $show_wizard = true;
            $show_unknown_nodes = true;    
        }
        
        if( $group == Configure::read('group.ap')){  //Or AP
            $cls = 'access_provider';
            $tabs= $this->_build_ap_tabs($id,$display);  //We DO care for rights here! 
            if($this->Acl->check(['model' => 'Users', 'foreign_key' => $id],$this->acl_base.'Wizards/index')){
                $show_wizard = true;
            }
            
            if($this->Acl->check(['model' => 'Users', 'foreign_key' => $id],$this->acl_base.'UnknownNodes/index')){
                $show_unknown_nodes = true;
            }  
        }
        
        $data_usage = [];
        if(isset($this->realm_id)){
           $data_usage = ['realm_id' => $this->realm_id, 'realm_name' => $this->realm_name];
        }
            
        return [
            'token'         =>  $token,
            'extensions'    =>  $extensions,
            'isRootUser'    =>  $isRootUser,
            'tabs'          =>  $tabs,
            'data_usage'    =>  $data_usage,
            'user'          =>  ['id' => $id, 'username' => $username,'group' => $group,'cls' => $cls,'timezone_id' => $user->timezone_id],
            'white_label'   =>  $white_label,
            'show_wizard'   =>  $show_wizard,
            'show_unknown_nodes' => $show_unknown_nodes,
        ];        
    }
    
     private function _build_admin_tabs($user_id,$style = 'take_setting'){
        $show = 'title'; //Default is not compact
        if($style == 'take_setting'){
            $q_rc = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => "compact_view"])->first();
            if($q_rc){
                if($q_rc->value == 1){
                    $show = 'tooltip';
                }
            }   
        }
        
        if($style == 'compact'){ //override due to screen size
            $show = 'tooltip'; 
        }
        
        
        $tabs = [];
        
        //Admin
        array_push($tabs, array(
                "$show"   => __('Admin'),
                'glyph'   => Configure::read('icnAdmin'),
                'plain'   => false,
                'ui'      => $this->ui,
                'xtype'   => 'tabpanel',
                'itemId'  => 'tabAdmin',
                'layout'  => 'fit',
                'items'   => array(
                    array(
                        'title'   => __('Admins'),
                        'glyph'   => Configure::read('icnAdmin'),
                        'id'      => 'cAccessProviders',
                        'layout'  => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIOne
                        ]
                    ),
                    array(
                        'title'   => __('Realms (Groups)'),
                        'glyph'   => Configure::read('icnRealm'),
                        'id'      => 'cRealms',
                        'layout'  => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUITwo
                        ]
                    )
                )

            )
        );
        
        //Users
        array_push($tabs, [
                "$show"   => __('Users'),
                'xtype'   => 'tabpanel',
                'glyph'   => Configure::read('icnUser'),
                'plain'   => false,
                'ui'      => $this->ui,
                'layout'  => 'fit',
                'itemId'  => 'tabUsers',
                'items'   => [
                    [
                        'title'     => __('Permanent Users'),
                        'glyph'     => Configure::read('icnUser'),
                        'id'        => 'cPermanentUsers',
                        'layout'    => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIOne
                        ]
                    ],
                    [
                        'title'     => __('Vouchers'),
                        'glyph'     => Configure::read('icnVoucher'),
                        'id'        => 'cVouchers',
                        'layout'    => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUITwo
                        ]
                    ],
                    [
                        'title'     => __('Activity Monitor'),
                        'glyph'     => Configure::read('icnActivity'),
                        'id'        => 'cActivityMonitor',
                        'layout'    => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIThree
                        ]
                    ],
                    /*
                    array(
                        'title'     => __('BYOD'),
                        'glyph'     => Configure::read('icnDevice'),
                        'id'        => 'cDevices',
                        'layout'    => 'fit'
                    ),
                    */
                    [
                        'title'     => __('Top-Ups'),
                        'glyph'     => Configure::read('icnTopUp'),
                        'id'        => 'cTopUps',
                        'layout'    => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIThree
                        ]
                    ],                  
                ]
            ]
        );
        
        //Users
        array_push($tabs, array(
                "$show"   => __('Profiles'),
                'glyph'   => Configure::read('icnProfile'),
                'plain'   => false,
                'ui'      => $this->ui,
                'xtype'   => 'tabpanel',
                'layout'  => 'fit',
                'items'   => [
                 /*   array(
                        'title'   => __('Profile Components'),
                        'glyph'   => Configure::read('icnComponent'),
                        'id'      => 'cProfileComponents',
                        'layout'  => 'fit',
                        'tabConfig'=> [
                            'ui' => 'tab-brown'
                        ]
                    ),*/
                    [
                        'title'   => __('Profiles'),
                        'glyph'   => Configure::read('icnProfile'),
                        'id'      => 'cProfiles',
                        'layout'  => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIOne
                        ]
                    ]   
                ]
            )
        );
        
        //RADIUS
        array_push($tabs, array(
                "$show"   => __('RADIUS'),
                'glyph'   => Configure::read('icnRadius'),
                'plain'   => $this->plain,
                'ui'      => $this->ui,
                'xtype'   => 'tabpanel',
                'layout'  => 'fit',
                'items'   => array(
                    array(
                        'title'   => __('RADIUS Clients'),
                        'glyph'   => Configure::read('icnNas'),
                        'id'      => 'cDynamicClients',
                        'layout'  => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIOne
                        ]
                    ),
                 /*   array(
                        'title'   => __('NAS Devices'),
                        'glyph'   => Configure::read('icnNas'),
                        'id'      => 'cNas',
                        'layout'  => 'fit'
                    ),
                    array(
                        'title'   => __('NAS Device Tags'),
                        'glyph'   => Configure::read('icnTag'),
                        'id'      => 'cTags',
                        'layout'  => 'fit'
                    ),
                    array(
                        'title'   => __('SSIDs'),
                        'glyph'   => Configure::read('icnSsid'),
                        'id'      => 'cSsids',
                        'layout'  => 'fit'
                    )  */
                )
            )
        );
       
        //Analytics
        /*
        array_push($tabs, array(
                "$show"   => __('Analytics'),
                'glyph'   =>  Configure::read('icnSignal'),
                'id'      => 'cAnalytics',
                'layout'  => 'fit'
            )
        );
        */
        
        
        //MESHdesk
        array_push($tabs, array(
                "$show"   => __('MESHdesk'),
                'glyph'   => Configure::read('icnMesh'),
                'id'      => 'cMeshes',
                'layout'  => 'fit'
            )
        );
        
        //APdesk    
        array_push($tabs, array(
                "$show"   => __('APdesk'),
                'glyph'   => Configure::read('icnWifi2'),
                'id'      => 'cAccessPoints',
                'layout'  => 'fit'
            )
        );
              
        //Experi-mental 
        if(Configure::read('experimental.active')){
        
            $dns_desk = [
                "$show"   => __('DNSdesk'),
                'glyph'   => Configure::read('icnShield'),
                'xtype'   => "tabpanel",
                'layout'  => 'fit',
                'plain'   => $this->plain,
                'ui'      => $this->ui,
                'items'   => array(
                    array(
                        'title'   => 'Black Lists',
                        'glyph'   => Configure::read('icnBan'),
                        'id'      => 'cBlackLists',
                        'layout'  => 'fit'
                    ),
                    array(
                        'title'   => 'White Lists',
                        'glyph'   => Configure::read('icnCheckC'),
                        'id'      => 'cWhiteLists',
                        'layout'  => 'fit'
                    ),  
                    array(
                        'title'   => 'Schedules',
                        'glyph'   => Configure::read('icnWatch'),
                        'id'      => 'cSchedules',
                        'layout'  => 'fit'
                    ), 
                    array(
                        'title'   => 'Filters',
                        'glyph'   => Configure::read('icnFilter'),
                        'id'      => 'cFilters',
                        'layout'  => 'fit'
                    ), 
                    array(
                        'title'   => 'Operators',
                        'glyph'   => Configure::read('icnAdmin'),
                        'id'      => 'cDnsDeskOperators',
                        'layout'  => 'fit'
                    ),    
                ) 
            ];
            array_push($tabs, $dns_desk);   
        }
        
         //Login Pages
        array_push($tabs, array(
                "$show"   => __('Login Pages'),
                'glyph'   => Configure::read('icnSignIn'),
                'xtype'   => 'tabpanel',
                'plain'   => $this->plain,
                'ui'      => $this->ui,
                'layout'  => 'fit',
                'items'   => array(
                    array(
                        'title'   => __('Login Pages'),
                        'glyph'   => Configure::read('icnSignIn'),
                        'id'      => 'cDynamicDetails',
                        'layout'  => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIOne
                        ]
                    )         
                )
            )
        );
        
        //Other
        array_push($tabs, array(
                "$show"   => __('Other'),
                'glyph'   => Configure::read('icnGears'),
                'xtype'   => 'tabpanel',
                'plain'   => $this->plain,
                'ui'      => $this->ui,
                'itemId'  => 'tpOther',
                'layout'  => 'fit',
                'items'   => array(
                /*    array(
                        'title'   => __('Firmware Keys'),
                        'glyph'   => Configure::read('icnKey'),
                        'id'      => 'cFirmwareKeys',
                        'layout'  => 'fit'
                    ),
                    
                    array(
                        'title'   => __('IP Pools'),
                        'glyph'   => Configure::read('icnIP'),
                        'id'      => 'cIpPools',
                        'layout'  => 'fit'
                    ),*/
                     [
                        'title'   => __('Wireguard Servers'),
                        'glyph'   => Configure::read('icnVPN'),
                        'id'      => 'cWireguardServers',
                        'layout'  => 'fit'
                    ],
                    [
                        'title'   => __('OpenVPN Servers'),
                        'glyph'   => Configure::read('icnVPN'),
                        'id'      => 'cOpenvpnServers',
                        'layout'  => 'fit'
                    ],
              /*      [
                        'title'   => __('Traffic Class Sets'),
                        'glyph'   => Configure::read('icnTaxi'),
                        'id'      => 'cTrafficClasses',
                        'layout'  => 'fit'
                    ],
                    [
                        'title'   => __('RADIUS Proxies'),
                        'glyph'   => Configure::read('icnDotCircleO'),
                        'id'      => 'cHomeServerPools',
                        'layout'  => 'fit'
                    ],*/
                    [
                        'title'   => __('Clouds'),
                        'glyph'   => Configure::read('icnCloud'),
                        'id'      => 'cClouds',
                        'layout'  => 'fit'
                    ],
                    [
                        'title'   => __('Rights Manager'),
                        'glyph'   => Configure::read('icnKey'),
                        'id'      => 'cAcos',
                        'layout'  => 'fit'
                    ],  
                  /*  [
                        'title'   => __('Logfile Viewer'),
                        'glyph'   => Configure::read('icnLog'),
                        'id'      => 'cLogViewer',
                        'layout'  => 'fit'
                    ],
                 /*   array(
                        'title'   => __('Debug Output'),
                        'glyph'   => Configure::read('icnBug'),
                        'id'      => 'cDebug',
                        'layout'  => 'fit'
                    ),*/
                    array(
                        'title'   => __('Settings'),
                        'glyph'   => Configure::read('icnGears'),
                        'id'      => 'cSettings',
                        'layout'  => 'fit'
                    ),
                  /*  array(
                        'title'   => __('Tree Tags'),
                        'glyph'   => Configure::read('icnTree'),
                        'id'      => 'cTreeTags',
                        'layout'  => 'fit'
                    ), */ 
                    
                   [
                        'title'   => __('Schedules'),
                        'glyph'   => Configure::read('icnCalendarO'),
                        'id'      => 'cSchedules',
                        'layout'  => 'fit'
                    ],
                                        
                   [
                        'title'   => __('Hardwares'),
                        'glyph'   => Configure::read('icnHdd'),
                        'id'      => 'cHardwares',
                        'layout'  => 'fit'
                    ],  
                  /*  array(
                        'title'   => __('Registration Requests'),
                        'glyph'   => Configure::read('icnEdit'),
                        'id'      => 'cRegistrationRequests',
                        'layout'  => 'fit'
                    )  */
                )
            )
        );       
              
        //____ Overview Tab ___
        //This one is a bit different :-)
        $overview_items = [];
        
        //Find out if there is a dafault setting for the realm.
        $radius_overview        = false;
        $realm_blank            = false;
        
                
        //Find if there is a realm specified in the settings        
        $q_rr =  $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'realm_id'])->first();
        
        if($q_rr){
            //Get the name of the realm
            $q_r = $this->Realms->find()->where(['id' => $q_rr->value])->first();
            
            if($q_r){
                $realm_name         = $q_r->name;
                $data['realm_name'] = $realm_name;
                $data['realm_id']   = $q_rr->value;
                
                $this->realm_name   = $realm_name;
                $this->realm_id     = $q_rr->value;
               
                //Get the settings of whether to show the two tabs
                $q_rdu = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'radius_overview'])->first();
                
                if($q_rdu){
                    if($q_rdu->value == 1){
                        $radius_overview = true;
                    }
                }
                
            }else{            
                $realm_blank = true;
            }       
        //No realm specified in settings; get a default one (if there might be one )    
        }else{ 
            $q_r = $this->Realms->find()->first();
            if($q_r){
                $realm_name         = $q_r->name;
                $data['realm_name'] = $realm_name;
                $data['realm_id']   = $q_r->id;
                
                $this->realm_name   = $realm_name;
                $this->realm_id     = $q_r->id;
            }else{
                $realm_blank = true;
            }
        }
        
        //We found a realm and should display it
        if(($realm_blank == false)&&($radius_overview == true)){
            array_push($overview_items, array(
                    'title'   => __('Users'),
                    'glyph'   => Configure::read('icnUser'),
                    'id'      => 'cDataUsage',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]
                )
            );      
            
        }else{
        
            //We could not find a realm and should display a welcome message
            if($realm_blank == true){
                array_push($overview_items, array(
                        'title'   => __('Welcome Message'),
                        'glyph'   => Configure::read('icnNote'),
                        'margin'  => 10,
                        'padding' => 10,
                        'id'      => 'cWelcome',
                        'layout'  => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIOne
                        ]
                    )
                );
            }
        }
     
        //MESHdesk   
        $meshdesk_overview = false;     
        $q_md_overview = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'meshdesk_overview'])->first();
        if($q_md_overview){
            if($q_md_overview->value == 1){
                $meshdesk_overview = true;
            }
        }
        
        if($meshdesk_overview){                
            array_push($overview_items, array(
                    'title'   => __('Clouds'),
                    'glyph'   => Configure::read('icnCloud'),
                    //'id'      => 'cMeshOverview',
                    'id'      => 'cNetworkOverview',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]
                )
            );
        }
        
        //APdesk
        $apdesk_overview = false;
        $q_ap_overview = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'apdesk_overview'])->first();
        if($q_ap_overview){
            if($q_ap_overview->value == 1){
                $apdesk_overview = true;
            }
        }
        
        if($apdesk_overview){                
             array_push($overview_items, array(
                    'title'   => __('Access Points'),
                    'glyph'   => Configure::read('icnCloud'),
                    'id'      => 'cApOverview',
                    'layout'  => 'fit'
                )
            );
        }
        
        array_push($overview_items, array(
                'title'   => __('Utilities'),
                'glyph'   => Configure::read('icnGears'),
                'id'      => 'cUtilities',
                'layout'  => 'fit',
                'tabConfig'=> [
                    'ui' => $this->tabUIThree
                ]
            )
        );
               
        array_unshift($tabs,array(
            "$show"     => __('Overview'),
            'xtype'     => 'tabpanel',
            'glyph'     => Configure::read('icnView'),
            'plain'     => $this->plain,
            'ui'        => $this->ui,
            'itemId'    => 'tpOverview',
            'layout'    => 'fit',
            'items'     => $overview_items
        ));
                
        return $tabs;
    }
    
    private function _build_ap_tabs($id,$style = 'take_setting'){
        $tabs   = array();
        $user_id = $id;
        
        $show = 'title'; //Default is not compact
        if($style == 'take_setting'){
            $q_rc = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => "compact_view"])->first();
            if($q_rc){
                if($q_rc->value == 1){
                    $show = 'tooltip';
                }
            }   
        }
        
        if($style == 'compact'){ //override due to screen size
            $show = 'tooltip'; 
        }
          
        //Base to start looking from.
        $base   = "Access Providers/Controllers/"; 
           
        
        //____ Overview Tab ___
        //This one is a bit different :-)
        $overview_items = array();
        
        //Find out if there is a dafault setting for the realm.
        $radius_overview        = false;
        $realm_blank            = false;
        
        //Find if there is a realm specified in the settings        
        $q_rr =  $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'realm_id'])->first();
        
        if($q_rr){
            //Get the name of the realm
            $q_r = $this->Realms->find()->where(['id' => $q_rr->value])->first();
            $realm_name         = $q_r->name;
            $data['realm_name'] = $realm_name;
            $data['realm_id']   = $q_rr->value;
            
            $this->realm_name   = $realm_name;
            $this->realm_id     = $q_rr->value;
           
            //Get the settings of whether to show the two tabs
            $q_rdu = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'radius_overview'])->first();
             
            if($q_rdu){
                if($q_rdu->value == 1){
                    $radius_overview = true;
                }
            }
              
         
        //No realm specified in settings; get a default one (if there might be one )    
        }else{            
            $realm_detail = $this->_ap_default_realm($user_id);
            if(array_key_exists('realm_id',$realm_detail)){
                $data['realm_name'] = $realm_detail['realm_name'];
                $data['realm_id']   = $realm_detail['realm_id'];
                
                $this->realm_name   = $realm_detail['realm_name'];
                $this->realm_id     = $realm_detail['realm_id'];
            }else{ // Could not find a default realm
                $realm_blank = true;
            }      
        }    
        
         //We found a realm and should display it
        if(($realm_blank == false)&&($radius_overview == true)){
            array_push($overview_items, array(
                    'title'   => __('Users'),
                    'glyph'   => Configure::read('icnData'),
                    'id'      => 'cDataUsage',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]
                )
            );
        }else{
        
            //We could not find a realm and should display a welcome message
            if($realm_blank == true){
                array_push($overview_items, array(
                        'title'   => __('Welcome Message'),
                        'glyph'   => Configure::read('icnNote'),
                        'margin'  => 10,
                        'padding' => 10,
                        'id'      => 'cWelcome',
                        'layout'  => 'fit',
                        'tabConfig'=> [
                            'ui' => $this->tabUIOne
                        ]
                    )
                );
            }
        }
        
        
        //MESHdesk   
        $meshdesk_overview = false;     
        $q_md_overview = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'meshdesk_overview'])->first();
        if($q_md_overview){
            if($q_md_overview->value == 1){
                $meshdesk_overview = true;
            }
        }
        
        if($meshdesk_overview){                
            array_push($overview_items, array(
                    'title'   => __('Clouds'),
                    'glyph'   => Configure::read('icnCloud'),
                    //'id'      => 'cMeshOverview',
                    'id'      => 'cNetworkOverview',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]
                )
            );
        }
      
        //APdesk
        $apdesk_overview = false;
        $q_ap_overview = $this->UserSettings->find()->where(['user_id' => $user_id,'name' => 'apdesk_overview'])->first();
        if($q_ap_overview){
            if($q_ap_overview->value == 1){
                $apdesk_overview = true;
            }
        }
        
        if($apdesk_overview){                
             array_push($overview_items, array(
                    'title'   => __('Access Points'),
                    'glyph'   => Configure::read('icnCloud'),
                    'id'      => 'cApOverview',
                    'layout'  => 'fit'
                )
            );
        }          
       
        array_push($overview_items, array(
                'title'   => __('Utilities'),
                'glyph'   => Configure::read('icnGears'),
                'id'      => 'cUtilities',
                'layout'  => 'fit',
                'tabConfig'=> [
                    'ui' => $this->tabUIThree
                ]
            )
        );
            
        array_push($tabs, array(
                "$show"     => __('Overview'),
                'xtype'     => 'tabpanel',
                'plain'     => $this->plain,
                'ui'        => $this->ui,
                'glyph'     => Configure::read('icnView'),
                'itemId'    => 'tpOverview',
                'layout'    => 'fit',
                'items'   => $overview_items
            )
        );
        
         //____ Admin Tab ____
        $admin_items = array();
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."AccessProviders/index")){
        
            array_push($admin_items, array(
                    'title'   => __('Admins'),
                    'glyph'   => Configure::read('icnAdmin'),
                    'id'      => 'cAccessProviders',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]
                )
            );
        }
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Realms/index")){
            array_push($admin_items, array(
                    'title'   => __('Realms (Groups)'),
                    'glyph'   => Configure::read('icnRealm'),
                    'id'      => 'cRealms',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUITwo
                    ]
                )
            );
        }

        if(count($admin_items) > 0){
            array_push($tabs, array(
                    "$show"   => __('Admin'),
                    'plain'   => $this->plain,
                    'ui'      => $this->ui,
                    'glyph'   => Configure::read('icnAdmin'),
                    'xtype'   => 'tabpanel',
                    'itemId'  => 'tabAdmin',
                    'layout'  => 'fit',
                    'items'   => $admin_items
                )
            );
        }
       
        //____ Users Tab ____   
        $users_items = [];
        
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."PermanentUsers/index")){
            array_push($users_items, array(
                    'title'     => __('Permanent Users'),
                    'glyph'     => Configure::read('icnUser'),
                    'id'        => 'cPermanentUsers',
                    'layout'    => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]                  
                )
            );
        
        }
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Vouchers/index")){
            array_push($users_items, array(
                    'title'     => __('Vouchers'),
                    'glyph'     => Configure::read('icnVoucher'),
                    'id'        => 'cVouchers',
                    'layout'    => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUITwo
                    ]         
                )
            );
        }
        
        if(count($users_items)>0){
            array_push($users_items, [
                    'title'     => __('Activity Monitor'),
                    'glyph'     => Configure::read('icnActivity'),
                    'id'        => 'cActivityMonitor',
                    'layout'    => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIThree
                    ]
                ]
            );
        }
        
        /*
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Devices/index")){
            array_push($users_items, array(
                    'title'     => __('BYOD'),
                    'glyph'     => Configure::read('icnDevice'),
                    'id'        => 'cDevices',
                    'layout'    => 'fit'       
                )
            );
        }
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."TopUps/index")){
            array_push($users_items, array(
                    'title'     => __('Top-Ups'),
                    'glyph'     => Configure::read('icnTopUp'),
                    'id'        => 'cTopUps',
                    'layout'    => 'fit'
                )
            ); 
        }
        */
        
        if(count($admin_items) > 0){
            array_push($tabs, array(
                    "$show"   => __('Users'),
                    'plain'   => $this->plain,
                    'ui'      => $this->ui,
                    'xtype'   => 'tabpanel',
                    'glyph'   => Configure::read('icnUser'),
                    'layout'  => 'fit',
                    'itemId'  => 'tabUsers',
                    'items'   => $users_items
                )
            );
        }
        
        //____ Profiles Tab ____   
        $profile_items = array();
        
      /*  if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."ProfileComponents/index")){
            array_push($profile_items, array(
                    'title'   => __('Profile Components'),
                    'glyph'   => Configure::read('icnComponent'),
                    'id'      => 'cProfileComponents',
                    'layout'  => 'fit'          
                )
            );
        }*/
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Profiles/index")){
            array_push($profile_items, array(
                    'title'   => __('Profiles'),
                    'glyph'   => Configure::read('icnProfile'),
                    'id'      => 'cProfiles',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]           
                )
            );
        }
        
        if(count($profile_items) > 0){
            array_push($tabs, array(
                "$show"   => __('Profiles'),
                'plain'   => $this->plain,
                'ui'      => $this->ui,
                'glyph'   => Configure::read('icnProfile'),
                'xtype'   => 'tabpanel',
                'layout'  => 'fit',
                'items'   => $profile_items
                )
            );
        }
        
        //____ RADIUS Tab ____  
        $radius_items = array();
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."DynamicClients/index")){
            array_push($radius_items, array(
                    'title'   => __('RADIUS Clients'),
                    'glyph'   => Configure::read('icnNas'),
                    'id'      => 'cDynamicClients',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]             
                )
            );
        }
/*        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Nas/index")){
            array_push($radius_items, array(
                    'title'   => __('NAS Devices'),
                    'glyph'   => Configure::read('icnNas'),
                    'id'      => 'cNas',
                    'layout'  => 'fit'           
                )
            );
        }
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Tags/index")){
            array_push($radius_items, array(
                    'title'   => __('NAS Device Tags'),
                    'glyph'   => Configure::read('icnTag'),
                    'id'      => 'cTags',
                    'layout'  => 'fit'
                              
                )
            );
        }
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Ssids/index")){
            array_push($radius_items, array(
                    'title'   => __('SSIDs'),
                    'glyph'   => Configure::read('icnSsid'),
                    'id'      => 'cSsids',
                    'layout'  => 'fit'             
                )
            );
        }
*/        
        if(count($radius_items) > 0){
            array_push($tabs, array(
                "$show"   => __('RADIUS'),
                'glyph'   => Configure::read('icnRadius'),
                'plain'   => $this->plain,
                'ui'      => $this->ui,
                'xtype'   => 'tabpanel',
                'layout'  => 'fit',
                'items'   => $radius_items
                )
            );
        }
        
        
        //___ Analytics tab ___
    /*    if($this->Acl->check(array('model' => 'User', 'foreign_key' => $id), $base."Analytics/index")){
             array_push($tabs, array(
                    "$show"   => __('Analytics'),
                    'glyph'   => Configure::read('icnSignal'),
                    'id'      => 'cAnalytics',
                    'layout'  => 'fit'
                )
            );
        }*/
        
        
        //___ MESHdesk tab ___
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Meshes/index")){
             array_push($tabs, array(
                    "$show"   => __('MESHdesk'),
                    'glyph'   => Configure::read('icnMesh'),
                    'id'      => 'cMeshes',
                    'layout'  => 'fit'
                )
            );
        }
        
        //___ APdesk tab ___
  
        //Leave out for now    
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."ApProfiles/index")){
             array_push($tabs, array(
                    "$show"   => __('APdesk'),
                    'glyph'   => Configure::read('icnWifi2'),
                    'id'      => 'cAccessPoints',
                    'layout'  => 'fit' 
                )
            );
        }
        
        //___ DNSdesk tab ___
       //Experi-mental 
        if(Configure::read('experimental.active')){
            //FIXME Also do rights check on this for Access Providers
            $dns_desk = [
                "$show"   => __('DNSdesk'),
                'glyph'   => Configure::read('icnShield'),
                'xtype'   => "tabpanel",
                'layout'  => 'fit',
                'items'   => array(
                    
                    array(
                        'title'   => 'Black Lists',
                        'glyph'   => Configure::read('icnBan'),
                        'id'      => 'cBlackLists',
                        'layout'  => 'fit'
                    ),
                    array(
                        'title'   => 'White Lists',
                        'glyph'   => Configure::read('icnCheckC'),
                        'id'      => 'cWhiteLists',
                        'layout'  => 'fit'
                    ),   
                    array(
                        'title'   => 'Schedules',
                        'glyph'   => Configure::read('icnWatch'),
                        'id'      => 'cSchedules',
                        'layout'  => 'fit'
                    ), 
                    array(
                        'title'   => 'Policies',
                        'glyph'   => Configure::read('icnScale'),
                        'id'      => 'cPolicies',
                        'layout'  => 'fit'
                    ), 
                    array(
                        'title'   => 'Operators',
                        'glyph'   => Configure::read('icnAdmin'),
                        'id'      => 'cDnsDeskOperators',
                        'layout'  => 'fit'
                    ),   
                ) 
            ];
            array_push($tabs, $dns_desk);   
        }
            
        // ____ Login Pages Tab ____
        
        $login_pages_items = [];
           
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."DynamicDetails/index")){
            array_push($login_pages_items, [
                    'title'   => __('Login Pages'),
                    'glyph'   => Configure::read('icnSignIn'),
                    'id'      => 'cDynamicDetails',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]         
                ]
            );
        }
             
        if(count($login_pages_items) > 0){
            array_push($tabs, [
            
                "$show"   => __('Login Pages'),
                'glyph'   => Configure::read('icnSignIn'),
                'xtype'   => 'tabpanel',
                'plain'   => $this->plain,
                'ui'      => $this->ui,
                'layout'  => 'fit',
                'items'   => $login_pages_items
                ]
            );
        }
             
        //Other
        
        $other_items = [];
        
       
      /*         
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."TrafficClasses/index")){
            array_push($other_items, [
                    'title'   => __('Traffic Class Sets'),
                    'glyph'   => Configure::read('icnTaxi'),
                    'id'      => 'cTrafficClasses',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]                       
                ]
            );            
            array_push($other_items, [
                    'title'   => __('RADIUS Proxies'),
                    'glyph'   => Configure::read('icnDotCircleO'),
                    'id'      => 'cHomeServerPools',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIOne
                    ]                       
                ]
            );           
        }
        
        */
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Clouds/index")){
            array_push($other_items, [
                    'title'   => __('Clouds'),
                    'glyph'   => Configure::read('icnCloud'),
                    'id'      => 'cClouds',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUITwo
                    ]                       
                ]
            );
        }
        
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Schedules/index")){
            array_push($other_items, [
                    'title'   => __('Schedules'),
                    'glyph'   => Configure::read('icnCalendarO'),
                    'id'      => 'cSchedules',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUITwo
                    ]                       
                ]
            );
        }
        
           
        if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $base."Hardwares/index")){
            array_push($other_items, [
                    'title'   => __('Hardwares'),
                    'glyph'   => Configure::read('icnHdd'),
                    'id'      => 'cHardwares',
                    'layout'  => 'fit',
                    'tabConfig'=> [
                        'ui' => $this->tabUIThree
                    ]                       
                ]
            );
        }
        
        if(count($other_items) > 0){
            array_push($tabs, [         
                "$show"   => __('Other'),
                'plain'   => $this->plain,
                'ui'      => $this->ui,
                'glyph'   => Configure::read('icnGears'),
                'xtype'   => 'tabpanel',
                'itemId'  => 'tpOther',
                'layout'  => 'fit',
                'items'   => $other_items               
                ]
            );
        }             
        return $tabs;
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
}

