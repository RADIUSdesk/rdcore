<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 30/MAY/2026
 * Time: 00:01
 */
 

namespace App\Controller;

use Cake\Auth\DefaultPasswordHasher;
use Cake\Http\Exception\UnauthorizedException;
use Cake\Utility\Text;

class ConnectController extends AppController {


	protected $main_model   = 'PermanentUsers';
	
    public function initialize():void{
        parent::initialize();
        
        $this->loadModel('PermanentUsers');
        $this->loadModel('Users');
        $this->loadModel('DynamicDetails');         
        $this->loadComponent('Aa');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('JsonErrors');         
        $this->Authentication->allowUnauthenticated([
            'register', 'authenticate', 'branding','checkToken', 'changePassword',
            'android',
            'apple',
            'linux',
            'windows'
        ]);                  
    }
    
    public function authenticate(){

        $this->request->allowMethod(['post']);
        $data = $this->request->getData();
        
        
        //--- Automatically add the suffix if set for the login page --
        if(isset($data['login_page_id'])){
            $page_id    = $data['login_page_id'];
            $loginPage  = $this->DynamicDetails->find()->where(['DynamicDetails.id' => $page_id])->first();
            if ($loginPage && $loginPage->auto_suffix_check) {
                $suffix = $loginPage->auto_suffix;

                if (!str_ends_with($data['username'], '@' . $suffix)) {
                    $data['username'] .= '@' . $suffix;
                }
            }  
        }

        $user = $this->loadModel('PermanentUsers')->find()
            ->where(['username' => $data['username']])
            ->first();

        if ($user && (new DefaultPasswordHasher())->check($data['password'], $user->password)) {
        
            $timezone_id = $this->_getTimezone();        
            $data = [
                'token'     => $user->token,
                'user'      => [
                    'id'            => $user->id,
                    'username'      => $user->username,
                    'timezone_id'   => $timezone_id
                ]
            ];
        
            $this->set([
                'data'          => $data,
                'success'       => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }else{
            //throw new UnauthorizedException('Invalid credentials');
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
            $user   = $this->PermanentUsers->find()->where(['PermanentUsers.token' => $token])->first();          
            if(!$user){
                $this->set([
                    'errors'        => ['token'=>'invalid'],
                    'success'       => false
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            
            }else{
                $timezone_id = $this->_getTimezone();
                $data = $data = [
                    'token'     => $user->token,
                    'user'      => [
                        'id'        => $user->id,
                        'username'  => $user->username,
                        'timezone_id'   => $timezone_id
                    ]
                ];                             
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
    
    public function changePassword(){
        
        $this->request->allowMethod(['post']);
        $data = $this->request->getData();
        $user = $this->PermanentUsers->find()
            ->where(['token' => $data['token']])
            ->first();     
        $user->set('password',$this->request->getData('password'));
        $user->set('token',''); //Setting it ti '' will trigger a new token generation
        $this->PermanentUsers->save($user); 
        $data['token']  = $user->get('token');        
        $this->set([
            'success' => true,
            'data'    => $data
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
           
    public function register(){
        $data = [];       	
      	$this->set([
            'data' 	    => $data,
            'success' 	=> true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    } 
    
    public function android(){  
    
        $data = $this->request->getQuery();
        if(isset($data['token'])){
            $user = $this->PermanentUsers->find()
            ->where(['token' => $data['token']])
            ->contain([
                'Radchecks' => function ($q) {
                    return $q->where(['Radchecks.attribute' => 'Cleartext-Password']);
                },
                'Realms.RealmPasspointProfiles' => [
                    'RealmPasspointNaiRealms',
                    'RealmPasspointRcois'
                ]
            ])
            ->first();

            if($user){
                $passwordRadcheck = $user->radchecks[0] ?? null;
                if($passwordRadcheck){
                    if($user->real_realm->realm_passpoint_profile){
                       $profile = $user->real_realm->realm_passpoint_profile;                    
                       return $this->_doAndroid($profile,$passwordRadcheck->username,$passwordRadcheck->value);                    
                    }
                }
            }     
        }  
    } 
    
    public function apple(){
    
        $data = $this->request->getQuery();
        if(isset($data['token'])){
            $user = $this->PermanentUsers->find()
            ->where(['token' => $data['token']])
            ->contain([
                'Radchecks' => function ($q) {
                    return $q->where(['Radchecks.attribute' => 'Cleartext-Password']);
                },
                'Realms.RealmPasspointProfiles' => [
                    'RealmPasspointNaiRealms',
                    'RealmPasspointRcois'
                ]
            ])
            ->first();

            if($user){
                $passwordRadcheck = $user->radchecks[0] ?? null;
                if($passwordRadcheck){
                    if($user->real_realm->realm_passpoint_profile){
                       $profile = $user->real_realm->realm_passpoint_profile;                    
                       return $this->_doApple($profile,$passwordRadcheck->username,$passwordRadcheck->value);                    
                    }
                }
            }     
        }      
    }
    
    public function linux(){
    
        $this->viewBuilder()->setLayout('custom'); // Optional: use your own layout
        $message = 'The Linux setup instructions are coming soon. Please check back later.';
        $this->set('message', $message);
    
    }
    
    public function windows(){
    
        $this->viewBuilder()->setLayout('custom'); // Optional: use your own layout
        $message = 'The Windows setup instructions are coming soon. Please check back later.';
        $this->set('message', $message);
    
    }
    
    
    private function _getTimezone(){
        
        $timezone_id = 44; //Fallback
        
        $root_user = $this->Users->find()->where(['Users.id' => 44])->first(); // Root user
        if($root_user){
            $timezone_id = $root_user->timezone_id;
        }
      
        return $timezone_id;
    }
     
    private function _doAndroid($profile,$username,$password){
    
        //Some variables
        $ca         = $profile->ca_cert;
        $friendly   = $profile->name;
        $realm      = $profile->anonymous_realm;
        $username   = $username;
        $pwd_64     = base64_encode($password);        
        $inner      = 'MS-CHAP-V2';         
        if($profile->eap_method == 'ttls_pap'){
            $inner = 'PAP';
        }
        
        $fqdn       = $profile->domain_name;
       
        //=== (apparently) ANDROID DOES NOT SUPPORT NAI REALM LISTS === 
        /*
        //-- Nai Realms
        $nai_realms = [];
        if($profile->realm_passpoint_nai_realms){
            foreach($profile->realm_passpoint_nai_realms as $nai){
                $nai_realms[] =  $nai->name;              
            }        
        }
        if($nai_realms){
            $fqdn = implode(',', $nai_realms);       
        }
        */
        
        //--- RCOIs ---
        $rcois      = [];
        if($profile->realm_passpoint_rcois){
            foreach($profile->realm_passpoint_rcois as $rcoi){
                $rcois[] =  $rcoi->rcoi_id;              
            }        
        }
        $rcoi_string = '';
        if($rcois){
            $rcois = implode(',', $rcois);
            $rcoi_string ="<Node>
              <NodeName>RoamingConsortiumOI</NodeName>
              <Value>$rcois</Value>
            </Node>";         
        }
        
        //----
        $extensions = '';
        if(strlen($profile->domain_suffix_match)>4){
        
            $trusted_fqdns = str_replace(',', ';',$profile->domain_suffix_match);
        
            $extensions  = "<Node>
                <NodeName>Extension</NodeName>
                <Node>
                    <NodeName>Android</NodeName>
                    <Node>
                        <NodeName>AAAServerTrustedNames</NodeName>
                        <Node>
                            <NodeName>FQDN</NodeName>
                            <Value>$trusted_fqdns</Value>
                        </Node>
                    </Node>
                </Node>
              </Node>";       
        }
                  
        $response   = $this->response;
        $response   = $response->withHeader('Content-Transfer-Encoding', 'base64');
        $response   = $response->withType('application/x-wifi-config');        
        $home_sp    = <<<EOD
<MgmtTree xmlns="syncml:dmddf1.2">
  <VerDTD>1.2</VerDTD>
  <Node>
    <NodeName>PerProviderSubscription</NodeName>
    <RTProperties>
      <Type>
        <DDFName>urn:wfa:mo:hotspot2dot0-perprovidersubscription:1.0</DDFName>
      </Type>
    </RTProperties>
    <Node>
      <NodeName>i001</NodeName>
      <Node>
        <NodeName>HomeSP</NodeName>
        <Node>
          <NodeName>FriendlyName</NodeName>
          <Value>$friendly</Value>
        </Node>
        <Node>
          <NodeName>FQDN</NodeName>
          <Value>$fqdn</Value>
        </Node>
        $rcoi_string
      </Node>
      <Node>
        <NodeName>Credential</NodeName>
        <Node>
          <NodeName>Realm</NodeName>
          <Value>$realm</Value>
        </Node>
        <Node>
          <NodeName>UsernamePassword</NodeName>
          <Node>
            <NodeName>Username</NodeName>
            <Value>$username</Value>
          </Node>
          <Node>
            <NodeName>Password</NodeName>
            <Value>$pwd_64</Value>
          </Node>
          <Node>
            <NodeName>EAPMethod</NodeName>
            <Node>
              <NodeName>EAPType</NodeName>
              <Value>21</Value>
            </Node>
            <Node>
              <NodeName>InnerMethod</NodeName>
              <Value>$inner</Value>
            </Node>
          </Node>
        </Node>
      </Node>
      $extensions
    </Node>
  </Node>
</MgmtTree> 
EOD;  

        $home_sp_64 = base64_encode($home_sp);  
        $ca_64      = base64_encode($ca);             
        $home_sp_ca = <<<EOD
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="XXXXboundary"
Content-Transfer-Encoding: base64

--XXXXboundary
Content-Type: application/x-x509-ca-cert
Content-Transfer-Encoding: base64

$ca_64

--XXXXboundary
Content-Type: application/x-passpoint-profile
Content-Transfer-Encoding: base64

$home_sp_64

--XXXXboundary--
EOD;       
                
        $response = $response->withStringBody(base64_encode($home_sp_ca));
        return $response;   
    }
    
    
    private function _doApple($profile,$username,$password){
    
        //Some variables
        $ca         = $profile->ca_cert;
        $friendly   = $profile->name;
        $payloadUUID= Text::uuid();
        $realm      = $profile->anonymous_realm;     
        $inner      = 'MSCHAPv2';         
        if($profile->eap_method == 'ttls_pap'){
            $inner = 'PAP';
        }
        
        $fqdn       = $profile->domain_name;
        $oper_name  = 'HS2.0 '.$profile->name;
        
        //-- Nai Realms
        $nai_realms = [];
        if($profile->realm_passpoint_nai_realms){
            foreach($profile->realm_passpoint_nai_realms as $nai){
                $nai_realms[] =  $nai->name;              
            }        
        }
        $nai_string = '';
        if($nai_realms){
            $nai_string = "<key>NAIRealmNames</key>
                <array>";
            foreach($nai_realms as $nai){
                $nai_string = $nai_string."\n<string>{$nai}</string>";
            }
            $nai_string = $nai_string."\n</array>";             
        }
        
        //--- RCOIs ---
        $rcois      = [];
        if($profile->realm_passpoint_rcois){
            foreach($profile->realm_passpoint_rcois as $rcoi){
                $rcois[] =  $rcoi->rcoi_id;              
            }        
        }
        $rcoi_string = '';
        if($rcois){
            $rcoi_string = "<key>RoamingConsortiumOIs</key>
                <array>";
            foreach($rcois as $rcoi){
                $rcoi_string = $rcoi_string."\n<string>{$rcoi}</string>";
            }
            $rcoi_string = $rcoi_string."\n</array>";       
        }
                      
        $trusted_servernames_string = ''; //FIXME complete later
        
        if(strlen($profile->domain_suffix_match)>4){        
            $trusted_servernames_string = "<key>TLSTrustedServerNames</key>
               <array>";              
            $domains = explode(',', $profile->domain_suffix_match);            
            foreach($domains as $domain){
                $trusted_servernames_string = $trusted_servernames_string."\n<string>{$domain}</string>";          
            }
            $trusted_servernames_string = $trusted_servernames_string."\n</array>";
        }        
                     
        $apple_xml = <<<EOD
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- Used to define the structure of the management tree for the device-->
<plist version="1.0">
   <dict>
      <key>PayloadDisplayName</key>
      <string>{$friendly}</string>
      <key>PayloadIdentifier</key>
      <string>tetrapi.radiusdesk-apple-4</string>
      <key>PayloadRemovalDisallowed</key>
      <false />
      <key>PayloadType</key>
      <string>Configuration</string>
      <key>PayloadUUID</key>
      <string>radiusdesk-apple-3</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>ExpirationDate</key>
      <date>2029-06-22T11:45:30Z</date>
      <key>PayloadContent</key>
      <array>
         <dict>
            <key>AutoJoin</key>
            <true />
            <key>CaptiveBypass</key>
            <false />
            <key>DisableAssociationMACRandomization</key>
            <false />
            <key>DisplayedOperatorName</key>
            <string>{$oper_name}</string>          
            <key>DomainName</key>
            <string>{$fqdn}</string>
            <key>EAPClientConfiguration</key>
            <dict>
               <key>AcceptEAPTypes</key>
               <array>
                  <integer>21</integer>
               </array>
               {$trusted_servernames_string}
               <key>TTLSInnerAuthentication</key>
               <string>{$inner}</string>
               <key>UserName</key>
               <string>{$username}</string>
               <key>UserPassword</key>
               <string>{$password}</string>
               <key>OuterIdentity</key>
               <string>anonymous@{$realm}</string>
            </dict>
            <key>EncryptionType</key>
            <string>WPA</string>
            <key>HIDDEN_NETWORK</key>
            <false />
            <key>IsHotspot</key>
            <true />
            <key>PayloadDescription</key>
            <string>Configure Passpoint for Tetrapi</string>
            <key>PayloadDisplayName</key>
            <string>Wi-Fi</string>
            <key>PayloadIdentifier</key>
            <string>com.apple.wifi.managed.radiusdesk-apple-2</string>
            <key>PayloadType</key>
            <string>com.apple.wifi.managed</string>
            <key>PayloadUUID</key>
            <string>radiusdesk-apple-1</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>ProxyType</key>
            <string>None</string>
            $rcoi_string
            $nai_string
            <key>ServiceProviderRoamingEnabled</key>
            <true />
         </dict>
      </array>
   </dict>
</plist>
EOD;
        $response = $this->response->withType('application/x-apple-aspen-config');
        $response = $response->withHeader('Content-Disposition', 'attachment; filename="rd_passpoint.mobileconfig"');
        $response = $response->withStringBody($apple_xml);
        return $response;  
     }
      
}
