<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 17/FEB/2023
 * Time: 00:00
 */

namespace App\Controller;


class FirewallsController extends AppController {

    public function initialize():void{
        parent::initialize();
        $this->loadComponent('Firewall');
    }
      
  	//**http://127.0.0.1/cake4/rd_cake/firewalls/get-config-for-node.json?gateway=true&_dc=1651070922&version=22.03&mac=64-64-4A-DD-07-FC**
    public function getConfigForNode(){
         if($this->request->getQuery('mac')){
            $mac        = $this->request->getQuery('mac');
            $version    = $this->request->getQuery('version');            
            $json		= [];
            $config		= []; //Default is empty
        
            if($version == 22.03){
            	$config['firewall'] = $this->Firewall->JsonForMac($mac);
            }
            $this->set([
                'config_settings' => $config,
                'success'         => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);

       	}
    }
    
    //**http://127.0.0.1/cake4/rd_cake/firewalls/get-md-fw-for-node.json?gateway=true&_dc=1651070922&version=22.03&mac=64-64-4A-DD-07-FC**
    public function getMdFwForNode(){
    
    	$this->loadComponent('MdFirewall');
    	 
       	if($this->request->getQuery('mac')){
            $mac        = $this->request->getQuery('mac');
            $version    = $this->request->getQuery('version');            
            $json		= [];
            $config		= []; //Default is empty
        
            if($version == 22.03){
            	$config['md_fw'] = $this->MdFirewall->JsonForMac($mac);
            }
            $this->set([
                'config_settings' => $config,
                'success'         => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);

       	}
    } 
         
}
