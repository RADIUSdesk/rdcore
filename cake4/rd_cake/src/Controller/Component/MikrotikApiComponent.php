<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component interacts with the Mikrotik Router using the API
//---- Date: 05-Dec-2022
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use \RouterOS\Client;
use \RouterOS\Query;

class MikrotikApiComponent extends Component {

    public function test($config){    
    	$client 	= new Client($config);		
		$query 		= new Query('/system/resource/print');
		$response 	= $client->query($query)->read();
		return $response[0];  
    }
    
    public function kickRadius($ent,$config){
    	$client 	= new Client($config);
    	
    	//We need to guess what connection the user used based on cetrain fields in the $ent record
    	$called_station_id 	= $ent->calledstationid;
    	$mac_minus			= $ent->callingstationid;
    	$mac_colon			= str_replace("_",":",$mac_minus);
    	if(preg_match('/^hotspot/',$called_station_id)){ //We only look at calledstationid since the hotspot can potentially also be used through the LAN
    	
    		$query 		= new Query('/system/resource/print');
			$query 		=  (new Query('/ip/hotspot/active/print'))
						->where('mac-address', '0C:C6:FD:7B:8B:AA');
						
			$response = $client->query($query)->read();
			foreach($response as $r){
				$id = $r[".id"];
				$q  = new Query('/ip/hotspot/active/remove');
				$q->equal('.id', $id);
				$r  = $client->query($q)->read(); 
			}  	
    	}
    	
    					
    }
    
}
