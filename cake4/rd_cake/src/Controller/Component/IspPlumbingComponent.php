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

    public function realmAddEdit($entity){ //Call when we a
    
    	if($this->disabled){
    		return;
    	}
    	       
        $wl 			= [];     
        $IspSpecifics  	= TableRegistry::get('IspSpecifics');
        $isp_name 		= strtolower($entity->name);
        $isp_name     	= preg_replace("/\s+/", "", $isp_name);
        
        $ent			= $IspSpecifics->find()->where(['IspSpecifics.name' => $isp_name])->count();
        if(!$ent){
        	foreach($this->regions as $r){
        		$d	= [
        			'name'		=> $isp_name,
        			'cloud_id'	=> $entity->cloud_id,
        			'region'	=> $r,
        			'field1'	=> $this->prime_prefix.$isp_name,
        			'field2'	=> $this->suspend_prefix.$isp_name,
        			'field3'	=> 'x',
        			'field4'	=> 'x'      		
        		];
        	
        		$entity = $IspSpecifics->newEntity($d);
        		$IspSpecifics->save($entity);   	
        	}                   
        }     
    } 
}

