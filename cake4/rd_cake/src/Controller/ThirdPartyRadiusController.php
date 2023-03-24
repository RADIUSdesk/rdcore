<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 17/MAR/2023
 * Time: 00:00
 */

namespace App\Controller;
use Dapphp\Radius\Radius;

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
       
    public function test(){
    
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
