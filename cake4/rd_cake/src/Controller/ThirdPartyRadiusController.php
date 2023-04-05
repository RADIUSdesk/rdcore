<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 17/MAR/2023
 * Time: 00:00
 */

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class ThirdPartyRadiusController extends AppController {


	protected $main_model 	= 'Profiles';


    public function initialize():void{
        parent::initialize();
        $this->loadModel('Profiles');
        $this->loadModel('ProfileComponents');
        $this->loadModel('ProfileFupComponents');
        
        $this->loadModel('Radusergroups');
        
        $this->loadModel('Radgroupchecks');
        $this->loadModel('Radgroupreplies');
        
        $this->loadModel('PermanentUsers');
        $this->loadModel('Devices');
       
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('JsonErrors');          
    }
    
    
    public function authTest(){
    
      	$this->set([
            'success' 	=> true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    
    }
    
    public function testRadius(){
    
    	$req_q 	= $this->request->getQuery();
    	$req_d	= $this->request->getData();
    	
    	if(($req_d['auth_method'] == 'pap')||($req_d['auth_method'] == 'chap')||($req_d['auth_method'] == 'ms_chap')){
    	
    		$exec_string = 'echo "User-Name='.$req_d['username'].',';
    		
    		if($req_d['auth_method'] == 'pap'){
    			$exec_string = $exec_string.'User-Password='.$req_d['password'];
    		}
    		if($req_d['auth_method'] == 'chap'){
    			$exec_string = $exec_string.'CHAP-Password='.$req_d['password'];
    		}
    		if($req_d['auth_method'] == 'ms_chap'){
    			$exec_string = $exec_string.'MS-CHAP-Password='.$req_d['password'];
    		}
    		
    		if($req_d['nas_ip_address'] !== ''){		
    			$exec_string = $exec_string.',NAS-IP-Address='.$req_d['nas_ip_address'];
    		}
    		if($req_d['called_station_id'] !== ''){ 		
    			$exec_string = $exec_string.',Called-Station-Id='.$req_d['called_station_id'];
    		}   		
    		if($req_d['nas_identifier'] !== ''){  		
    			$exec_string = $exec_string.',NAS-Identifier='.$req_d['nas_identifier'];
    		}
    		$exec_string = $exec_string.'"';
    		$exec_string = $exec_string.' | radclient -x -r 2 -t 2 '.$req_d['radius_ip'].':'.$req_d['port'].' auth '.$req_d['secret'];		
    		$output = shell_exec($exec_string);    		
    	}
    	
    	if(
    		($req_d['auth_method'] == 'eap_md5')||
    		($req_d['auth_method'] == 'eap_ttls_pap')||
    		($req_d['auth_method'] == 'eap_ttls_mschap')||
    		($req_d['auth_method'] == 'eap_peap')||
    		($req_d['auth_method'] == 'eap_leap')
    	){
    	
    		$eap_file = "network={
					ssid=\"example\"
					key_mgmt=WPA-EAP
					eap=TTLS
					identity=\"".$req_d['username']."\"
					anonymous_identity=\"".$req_d['username']."\"
					password=\"".$req_d['password']."\"
					phase2=\"autheap=MSCHAPV2\"
			}";
			$myfile = fopen("/tmp/config.ttls", "w") or die("Unable to open file!");
			fwrite($myfile, $eap_file);
			fclose($myfile);
			$exec_string = "eapol_test -c /tmp/config.ttls -N 32:s:".$req_d['nas_identifier']." -N 30:s:".$req_d['called_station_id']."  -a ".$req_d['radius_ip']." -s ".$req_d['secret'];
			$output = shell_exec($exec_string);    
    	}  
    	$this->set([
    		'data'		=> [
    			'command' 	=> $exec_string,
    			'output'	=> nl2br($output)
    		],
            'success' 	=> true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    
    }
    
    public function view(){ 
    
    	Configure::load('TestRadius','default'); 
        $data = Configure::read('TestRadius.defaults');
          
    	$this->set([
    		'data'		=> $data,
            'success' 	=> true
        ]);
        $this->viewBuilder()->setOption('serialize', true);  
    }
   
       
    public function testZ(){
    
    	$client = new Radius();

		// set server, secret, and basic attributes
		//https://www.rfc-editor.org/rfc/rfc2865.html
		
		$server_ip			= '10.0.2.15';
		$secret				= 'testing123';
		$nas_ip_address 	= '164.160.89.129';
		$called_station_id 	= '00-25-82-00-92-30:AC-Devices';
		$nas_identifier     = 'ac-de_apeap_55';

		
		$client->setServer($server_ip) // RADIUS server address
			   ->setSecret($secret)
			   ->setNasIpAddress($nas_ip_address) // NAS server address
			   ->setAttribute(30, $called_station_id)  // Called-Station-Id
			   ->setAttribute(61, 19)  // NAS-Port-Type 19 -> Wireless - IEEE 802.11
			   ->setAttribute(32, $nas_identifier);  // NAS identifier		   

		// PAP authentication; returns true if successful, false otherwise
		//$authenticated = $client->accessRequest('dirkvanderwalt@gmail.com@dev', 'qwerty');
		
		$username = 'dirkvanderwalt@gmail.com@dev';
		$password = 'qwerty';
		
		$client->setMSChapPassword($password); // set ms chap password (uses openssl or mcrypt)
		$authenticated = $client->accessRequest($username);
		
		//$authenticated = $client->accessRequestEapMsChapV2($username, $password);
		
		//$authenticated = $client->accessRequest('tomerd', 'Occasion-Say-5');

		if ($authenticated === false) {
			// false returned on failure
			echo sprintf(
				"Access-Request failed with error %d (%s).\n",
				$client->getErrorCode(),
				$client->getErrorMessage()
			);
		} else {
			// access request was accepted - client authenticated successfully
			echo "Success!  Received Access-Accept response from RADIUS server.\n";
		}
		
		
      	$this->set([
            'success' 	=> true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
}
