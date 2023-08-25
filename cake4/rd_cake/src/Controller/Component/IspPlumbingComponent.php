<?php

//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 20-JUL-2022
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\ORM\TableRegistry;

class IspPlumbingComponent extends Component {

	protected $root_user_id	= 44;
	protected $prime_prefix	= 'cgnat_'; //field1
	protected $suspend_prefix = 'suspension_'; //field2 (We mark field3 and 4 with x as placeholder)
	protected $regions	= [
		'CPT',
		'DBN',
		'JHB'		
	];
	protected	$disabled	= true;
	protected $components   = ['Kicker'];

    public function realmAddEdit($entity){ //Call when we a
    
    	if($this->disabled){
    		return;
    	}
    	       
        $wl 			= [];     
        $IspSpecifics  	= TableRegistry::get('IspSpecifics');
        $lc_name 		= strtolower($entity->name);
        $lc_name     	= preg_replace("/\s+/", "", $lc_name);      
        $ent			= $IspSpecifics->find()->where(['IspSpecifics.name' => $entity->name])->count();
        if(!$ent){
        	foreach($this->regions as $r){
        		$d	= [
        			'name'		=> $entity->name,
        			'cloud_id'	=> $entity->cloud_id,
        			'region'	=> $r,
        			'field1'	=> $this->prime_prefix.$lc_name,
        			'field2'	=> $this->suspend_prefix.$lc_name,
        			'field3'	=> 'x',
        			'field4'	=> 'x'      		
        		];
        	
        		$entity = $IspSpecifics->newEntity($d);
        		$IspSpecifics->save($entity);   	
        	}                   
        }     
    }
    
    public function disconnectIfActive($entity){
    
    	if($this->disabled){
    		return;
    	}
    	  
    	$this->Radaccts = TableRegistry::get('Radaccts');
    	$this->Users  	= TableRegistry::get('Users');
    	
    	$ent_root 		= $this->Users->find()->where(['Users.id' => $this->root_user_id])->first();
    	$token	 		= $ent_root->token;
    	$username		= $entity->username;
    	$data			= [];
    	
    	$e_username 	= $this->{'Radaccts'}->find()->where(['Radaccts.username' => $username,'Radaccts.acctstoptime IS NULL'])->all();
		foreach($e_username as $ent){
			$data = $this->Kicker->kick($ent,$token); 
		}
		return $data;	      
    }
}

