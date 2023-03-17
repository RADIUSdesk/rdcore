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
       
    public function test(){
    
    	$client = new Radius();

		// set server, secret, and basic attributes
		$client->setServer('127.0.0.1') // RADIUS server address
			   ->setSecret('testing123')
			   ->setNasIpAddress('127.0.0.1') // NAS server address
			   ->setAttribute(32, 'login');  // NAS identifier

		// PAP authentication; returns true if successful, false otherwise
		//$authenticated = $client->accessRequest('dirk-ppsk', 'dirk-ppsk');
		
		//$authenticated = $client->accessRequestEapMsChapV2('dirk-ppsk', 'dirk-ppsk');
		
		$client->setMSChapPassword('dirk-ppsk'); // set ms chap password (uses openssl or mcrypt)
		$authenticated = $client->accessRequest('dirk-ppsk');

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
