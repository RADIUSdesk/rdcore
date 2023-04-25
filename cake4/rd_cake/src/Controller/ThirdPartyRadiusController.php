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
        	
    	Configure::load('TestRadius','default'); 
    	$config_data = Configure::read('TestRadius.auth_test');
    	
    	$req_q 	= $this->request->getQuery();
    	$req_d	= $this->request->getData();
    	
    	$success	= false; // fail by default  	
    	//--simple test--
    	//$req_d['username'] = 'a89ced761d91';
    	//$req_d['password'] = 'a89ced761d91';
    
        	
    	if(($config_data['auth_method'] == 'pap')||($config_data['auth_method'] == 'chap')||($config_data['auth_method'] == 'ms_chap')){
    	
    		$exec_string = 'echo "User-Name='.$req_d['username'].',';
    		
    		if($config_data['auth_method'] == 'pap'){
    			$exec_string = $exec_string.'User-Password='.$req_d['password'];
    		}
    		if($config_data['auth_method'] == 'chap'){
    			$exec_string = $exec_string.'CHAP-Password='.$req_d['password'];
    		}
    		if($config_data['auth_method'] == 'ms_chap'){
    			$exec_string = $exec_string.'MS-CHAP-Password='.$req_d['password'];
    		}
    		
    		if($config_data['nas_ip_address'] !== ''){		
    			$exec_string = $exec_string.',NAS-IP-Address='.$config_data['nas_ip_address'];
    		}
    		if($config_data['called_station_id'] !== ''){ 		
    			$exec_string = $exec_string.',Called-Station-Id='.$config_data['called_station_id'];
    		}   		
    		if($config_data['nas_identifier'] !== ''){  		
    			$exec_string = $exec_string.',NAS-Identifier='.$config_data['nas_identifier'];
    		}
    		$exec_string = $exec_string.'"';
    		$exec_string = $exec_string.' | radclient -x -r 2 -t 2 '.$config_data['radius_ip'].':'.$config_data['port'].' auth '.$config_data['secret'];		
    		$output = shell_exec($exec_string);    	
    		if(preg_match('/Received Access-Accept/', $output )){
    			$success = true;		
    		}    		   		
    	}
    	
    	if(
    		($config_data['auth_method'] == 'eap_md5')||
    		($config_data['auth_method'] == 'eap_ttls_pap')||
    		($config_data['auth_method'] == 'eap_ttls_mschap')||
    		($config_data['auth_method'] == 'eap_peap')||
    		($config_data['auth_method'] == 'eap_leap')
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
			$exec_string = "eapol_test -c /tmp/config.ttls -N 32:s:".$config_data['nas_identifier']." -N 30:s:".$config_data['called_station_id']."  -a ".$config_data['radius_ip']." -s ".$config_data['secret'];
			$output = shell_exec($exec_string); 
			$output = explode("\n",$output);
			array_pop($output); //Remove last blank item
			$output = array_pop($output); 	
			if($output == 'SUCCESS'){
				$success = true;
			}		
    	} 
    	    	 
      	$this->set([
      		'data'		=> [
      			'auth_method' 		=> $config_data['auth_method'],
      			'nas_identifier' 	=> $config_data['nas_identifier'],
      			'called_station_id' => $config_data['called_station_id'],
      			'radius_ip'			=> $config_data['radius_ip'],
      			'auth_method'		=> $config_data['auth_method']	
      		],
            'success' 	=> $success
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
}
