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
}
