<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

//Import Hybridauth's namespace
use Hybridauth\Hybridauth;

use Cake\Routing\Router;
use Cake\ORM\TableRegistry;

class ThirdPartyAuthsController extends AppController{
  
    public $base         = "Access Providers/Controllers/ThirdPartyAuths/"; 
    protected $idp_avail    = ['Facebook', 'Google', 'Twitter'];
    protected $cb           = 'third-party-auths/index.json';
    
    protected $social_login_info;
    protected $dynamic_detail_user_id;
    protected $user_profile; 
    
    protected $excludes     = [
        'protocol',
        'hostname',
        'idp_name',
        'pathname',
        'sl_type',
        'sl_value',
        'sl_name',
        'code',
        'state',
        'social_login'    
    ];   
    
    protected $alt_excludes     = [
        'code',
        'state'
    ];   
   
    public function initialize(){  
        parent::initialize(); 
        $this->loadModel('DynamicPairs');
        $this->loadModel('Vouchers');
        $this->loadModel('Users');
        $this->loadModel('PermanentUsers');
        $this->loadComponent('JsonErrors');    
    }
    
    public function index(){
    
        //10/6/19 FB changed things so we have to sent the query string through the 'state' item
        //If it is present extract and append to it can work as before
        if(isset($this->request->query['state'])){
            $result = [];
            parse_str(urldecode($this->request->query['state']),$result); 
            foreach(array_keys($result) as $key){
                $this->request->query[$key] = $result[$key];
            } 
        }
        
        //Only go on if it is a social login based request
        if(!isset($this->request->query['social_login'])){
            $this->JsonErrors->errorMessage('Does not appear to be a social login type request');
            return;
        }
        
        if(!isset($this->request->query['idp_name'])){
            $this->JsonErrors->errorMessage('No IDP name specified');
            return;
        }else{
        
            if(!in_array($this->request->query['idp_name'],$this->idp_avail)){
                $this->JsonErrors->errorMessage('IDP not supported');
                return;
            }
        }
        
        //Now we need to determine what social login idp detail to use
        $config = $this->_determine_sl();
        if($config == false){
            $this->JsonErrors->errorMessage('Problems with the config of Login Page or IDP config');
            return;
        }
        
        
        $hybridauth     = new HybridAuth($config);
        
        $adapter            = $hybridauth->authenticate($this->request->query['idp_name']);
        $this->user_profile = $adapter->getUserProfile();
        $isConnected        = $adapter->isConnected();
    
        if($isConnected){ 
            $this->_authForRadius();
        }
       
        $this->set(array(
            'success'       => true,
            'isConnected'   => $isConnected,
            'profile'       => $this->user_profile,
            '_serialize'    => array('success','isConnected','profile')
        ));
    }
    
    public function infoFor(){

		if(
			(array_key_exists('sl_type',$this->request->query))&&
			(array_key_exists('sl_name',$this->request->query))&&
			(array_key_exists('sl_value',$this->request->query))
		){

			if($this->request->query['sl_type'] == 'voucher'){
				$voucher_info = $this->_find_vouchername_and_password($this->request->query['sl_name'],$this->request->query['sl_value']);
				$this->set(array(
                    'data'         => $voucher_info,
                    'success'       => true,
                    '_serialize'    => array('data','success')
                ));
				return;
			}
			
			if($this->request->query['sl_type'] == 'user'){
				$user_info = $this->_find_username_and_password($this->request->query['sl_name'],$this->request->query['sl_value']);
				$this->set(array(
                    'data'         => $user_info,
                    'success'       => true,
                    '_serialize'    => array('data','success')
                ));
				return;
			}

		}else{
			$this->JsonErrors->errorMessage('Missing values in query string');	
			return;
		}
	}
    
    private function _determine_sl(){
    
        $conditions = array("OR" =>array());
      
        foreach(array_keys($this->request->query) as $key){
            array_push($conditions["OR"],
                array("DynamicPairs.name" => $key, "DynamicPairs.value" =>  $this->request->query[$key])
            );
        }
       	
		$q_r = $this->DynamicPairs
            ->find()
            ->contain([
                'DynamicDetails' => 
                    [
                        'DynamicDetailSocialLogins'
                    ]
            ])
            ->where([$conditions])
            ->order(['DynamicPairs.priority' => 'DESC'])
            ->first();
            
        $config = false; 
         
        if($q_r){
              
            $new_query_array  = $this->request->query;
            //Remove unwanted items
            foreach($this->alt_excludes as $excl){
                unset($new_query_array[$excl]);   
            }
            $query_string   = http_build_query($new_query_array);
        
            $domain = parse_url(Router::url('/', true));
            $base_url = $domain['scheme'].'://'.$domain['host'];
            //$callback = $domain['scheme'].'://'.$domain['host'].$domain['path'].$this->cb.'?'.$query_string;
            $callback = $domain['scheme'].'://'.$domain['host'].$domain['path'].$this->cb;
            
            $this->dynamic_detail_user_id = $q_r->dynamic_detail->user_id;
            
            foreach($q_r->dynamic_detail->dynamic_detail_social_logins as $ssli){
                if($ssli->name == $this->request->query['idp_name']){
                    $this->social_login_info = $ssli;
                     $config = [
                        "base_url" => $base_url,   
                        "providers"    => [
                                $ssli->name => [
                                    'enabled'   => true,
                                    'callback'  => $callback,
                                    'keys'      => [ "id" => $ssli->special_key, "secret" => $ssli->secret],
                                    'scope'     => ['email','public_profile'], // optional
                                    'display'   => "popup", // optional,
                                    'authorize_url_parameters' => [
                                        'state'   => $query_string
                                    ]
                                 ]
                            ]
                        ];       
                }
            }
        }
        return $config;      
    }
    
    private function _queryToArray($qry){

		//Take the query string and make in an Array

		$result = array();
		//string must contain at least one = and cannot be in first position
		if(strpos($qry,'=')) {
		    if(strpos($qry,'?')!==false) {
		        $q = parse_url($qry);
		        $qry = $q['query'];
		    }
		}else {
			return false;
		}
		foreach (explode('&', $qry) as $couple) {
			list ($key, $val) = explode('=', $couple);
			$result[$key] = $val;
		}
		return empty($result) ? false : $result;
	}
	
	private function _authForRadius(){
	
	    $identifier = $this->user_profile->identifier;    
	    $i          = [];
	
	    //After The IDP Authenticated the person, we can go on to the RADIUS things
	    $type               = $this->social_login_info->type;
	    $i['profile_id']    = $this->social_login_info->profile_id;
	    $i['realm_id']      = $this->social_login_info->realm_id;
	    $extra_name         = $this->social_login_info->name;
		$dd_id		        = $this->social_login_info->dynamic_detail_id;
		$extra_value        = 'sl_'.$dd_id."_".$identifier;  		
		
		if($type == 'voucher'){
		    $v = $this->{'Vouchers'}->find()->where(['extra_name' => $extra_name,'extra_value' => $extra_value])->first();
			if(!$v){
				$i['extra_name'] 	= $extra_name;
				$i['extra_value'] 	= $extra_value;
				$i['user_id'] 		= intval($this->dynamic_detail_user_id);
				$this->_addVoucher($i);
			}
        }
        
        if($type == 'user'){
            
			$u =  $this->{'PermanentUsers'}->find()
			    ->where(['extra_name' => $extra_name,'extra_value' => $extra_value])
			    ->first();
			
			if(!$u){
				$i['extra_name'] 	= $extra_name;
				$i['extra_value'] 	= $extra_value;
				$i['user_id'] 		= intval($this->dynamic_detail_user_id);
				//Some personal info
				$i['name']      = '';
				if($this->user_profile->{'firstName'} !== null){
					$i['name'] 	= $this->user_profile->{'firstName'};
				}
						
				$i['surname']   = '';
				if($this->user_profile->{'lastName'} !== null){
					$i['surname']   = $this->user_profile->{'lastName'};
				}

				$i['email']     = '';
				if($this->user_profile->{'email'} !== null){
					$i['email'] 	= $this->user_profile->{'email'};
				}
												
				$this->_addPermanentUser($i);
			}
        }
        
        //Check if we should record / update this user's detail
		if($this->social_login_info->record_info){
		

		    //We get the entry's ID and see if there is an entry for the realm for this user
			$social_login_user_id = $this->_record_or_update_info();
			
			//Check if there is a realm entry for this user and if not add it
			$this->{'SocialLoginUserRealms'} = TableRegistry::get('SocialLoginUserRealms');
			$count = $this->{'SocialLoginUserRealms'}->find()
			    ->where([
			        'SocialLoginUserRealms.realm_id'                => $i['realm_id'],
			        'SocialLoginUserRealms.social_login_user_id'    => $social_login_user_id
			    ])
			    ->count();
	        if($count == 0){    //If not found we need to add it since we want to tie it to a realm in order to filter the list for Access Providers
	            $d = [];
	            $d['realm_id']              = $i['realm_id'];
	            $d['social_login_user_id']  = $social_login_user_id;
	            
	            $entity = $this->{'SocialLoginUserRealms'}->newEntity($d);
	            $this->{'SocialLoginUserRealms'}->save($entity);
	        }  
		}
        
        
        $new_query_array  = $this->request->query;
        //Remove unwanted items
        foreach($this->excludes as $excl){
            unset($new_query_array[$excl]);   
        }
        $query_string   = http_build_query($new_query_array);
        
        $new_query_string   =$query_string."&sl_type=$type&sl_value=$extra_value"."&sl_name=$extra_name";
		$redirect_url       = urldecode($this->request->query['protocol']).'//'.
            urldecode($this->request->query['hostname']).
            urldecode($this->request->query['pathname'])."?".
            urldecode($new_query_string);
		$this->redirect("$redirect_url");       
	}
	
	private function _addVoucher($i){
		$url            = 'http://127.0.0.1/cake3/rd_cake/vouchers/add.json';
		$q_r			= $this->{'Users'}->find()->where(['Users.username' => 'root'])->first();
		$root_token 	= $q_r->token;

		$postData = array(
			'extra_name'	=>	$i['extra_name'],
			'extra_value'	=>  $i['extra_value'],	
			'never_expire'	=>	'never_expire',
			'profile_id'	=>  intval($i['profile_id']),
			'quantity'		=>	1,
			'realm_id'		=>	intval($i['realm_id']),
			'sel_language'	=>	'4_4',
			'token'			=> 	$root_token,
			'user_id'		=>	intval($i['user_id'])
        );

		// Setup cURL
        $ch = curl_init($url);
        curl_setopt_array($ch, array(
         
            CURLOPT_POST            => TRUE,
            CURLOPT_RETURNTRANSFER  => TRUE,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json'
            ),
            CURLOPT_POSTFIELDS => json_encode($postData)
        ));
        // Send the request
        $response = curl_exec($ch);
	}

	private function _addPermanentUser($i){
		$url            = 'http://127.0.0.1/cake3/rd_cake/permanent-users/add.json';
		$q_r			= $this->{'Users'}->find()->where(['Users.username' => 'root'])->first();
		$root_token 	= $q_r->token;
		$password		= $this->_generatePassword();

		$postData = array(
			'active'			=> 'active',
			'always_active'		=> 'always_active',
			'extra_name'		=> $i['extra_name'],
			'extra_value'		=> $i['extra_value'],
			'language'			=> '4_4',
			'password'			=> $password,
			'profile_id'		=> intval($i['profile_id']),
			'realm_id'			=> intval($i['realm_id']),
			'sel_language'		=> '4_4',
			'token'				=> $root_token,
			'user_id'			=> intval($i['user_id']),
			'username'			=> $i['extra_value'],
			'name'				=> $i['name'],
			'surname'			=> $i['surname'],
			'email'				=> $i['email']
        );

		// Setup cURL
        $ch = curl_init($url);
        curl_setopt_array($ch, array(
         
            CURLOPT_POST            => TRUE,
            CURLOPT_RETURNTRANSFER  => TRUE,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json'
            ),
            CURLOPT_POSTFIELDS => json_encode($postData)
        ));
        // Send the request
        $response = curl_exec($ch);
	}

	private function _generatePassword ($length = 8){
        $password = "";
        $possible = "0123456789bBcCdDfFgGhHjJkmnNpPqQrRstTvwxyz";
        $i = 0; 
        while ($i < $length) { 
            $char = substr($possible, mt_rand(0, strlen($possible)-1), 1);
            if (!strstr($password, $char)) { 
                $password .= $char;
                $i++;
            }
        }
        return $password;
    }
    
    private function _find_username_and_password($extra_name,$extra_value){
		$q_r        = $this->{'PermanentUsers'}->find()->where(['extra_name' => $extra_name,'extra_value' => $extra_value])->first();
		$user_data  = array('username' => 'notfound','password' => 'notfound');
		if($q_r){
			$un                     = $q_r->username;
			$user_data['username']  = $un;		
			$radchecks              = TableRegistry::get('Radchecks');
			
			$q_pw  = $radchecks->find()
			    ->where(['Radcheck.username' => $un,'Radcheck.attribute' => 'Cleartext-Password'])
			    ->first();
			    
			if($q_pw){
				$user_data['password'] = $q_pw->value;
			}
		}
		return $user_data;
	}
 
    private function _find_vouchername_and_password($extra_name,$extra_value){
		$q_r = $this->{'Vouchers'}->find()->where(['extra_name' => $extra_name,'extra_value' => $extra_value])->first();
		$voucher_data = ['username' => 'notfound','password' => 'notfound'];
		if($q_r){
		    $voucher_data['username'] =	$q_r->name;
		    $voucher_data['password'] =	$q_r->password;
		}
		return $voucher_data;
	}
	
	private function _record_or_update_info(){
	
	    $profile_lookup = [
	        'photoURL'      => 'image',
	        'firstName'     => 'first_name',
	        'lastName'      => 'last_name',
	        'email'         => 'email',
	        'identifier'    => 'uid',
	        'gender'        => 'gender',
	        'language'      => 'locale'
	    ];
		
		$data		        = [];
		$provider           = $this->request->query['idp_name'];
		$uid                = $this->user_profile->identifier;
		$data['provider']	= $provider;
		$data['last_connect_time'] = date('Y-m-d H:i:s');
		
		foreach(array_keys($profile_lookup) as $key){
		    if($this->user_profile->{$key} !== null){
		        $db_item        = $profile_lookup[$key];
		        $data[$db_item] = $this->user_profile->{$key};
		    }
		}
			
		$this->SocialLoginUsers = TableRegistry::get('SocialLoginUsers');
		$q_r = $this->{'SocialLoginUsers'}->find()->where(['provider' => $provider,'uid' =>$uid])->first();
		
		if($q_r){
			$entity = $this->{'SocialLoginUsers'}->get($q_r->id);
			$this->{'SocialLoginUsers'}->patchEntity($entity, $data);
		}else{
		    $entity = $this->{'SocialLoginUsers'}->newEntity($data);
		}
		
        $this->{'SocialLoginUsers'}->save($entity);
        
		//--Return the ID--
		return $entity->id;
	}

}
