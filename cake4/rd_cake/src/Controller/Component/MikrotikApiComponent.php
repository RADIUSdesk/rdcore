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
    
    public function kickPppoeId($config,$id){
    	$client 	= new Client($config);
    	$q  = new Query('/ppp/active/remove');
		$q->equal('.id', $id);
		$r  = $client->query($q)->read(); 
    }
    
    public function kickHotspotId($config,$id){
    	$client 	= new Client($config);
    	$q  = new Query('/ip/hotspot/active/remove');
		$q->equal('.id', $id);
		$r  = $client->query($q)->read(); 
    }
      
    public function kickRadiusId($config,$id){
    	$client 	= new Client($config);
    	$q  = new Query('/ip/hotspot/active/remove');
		$q->equal('.id', $id);
		$r  = $client->query($q)->read(); 
    }
    
    public function kickRadius($ent,$config){
    	$client 	= new Client($config);
    	
    	//We need to guess what connection the user used based on cetrain fields in the $ent record
    	$called_station_id 	= $ent->calledstationid;
    	$mac_minus			= $ent->callingstationid;
    	$mac_colon			= str_replace("-",":",$mac_minus);
    	$servicetype		= $ent->servicetype;
    	$framedprotocol		= $ent->framedprotocol;
    	
    	//=== If they connected using the PPPoE server the following will be in the accounting record
    	if(($servicetype == 'Framed-User' )&&($framedprotocol == 'PPP' )){
    	
			$query 		=  (new Query('/ppp/active/print'))
						->where('caller-id', $mac_colon); //here the mac address is called the 'caller-id'												
			$response = $client->query($query)->read();
			foreach($response as $r){
				$id = $r[".id"];
				$q  = new Query('/ppp/active/remove');
				$q->equal('.id', $id);
				$r  = $client->query($q)->read(); 
			}  	 	
    	}
    	  	
    	
    	//=== If they connected using the captive portal / hotspot
    	if(preg_match('/^hotspot/',$called_station_id)){ //We only look at calledstationid since the hotspot can potentially also be used through the LAN
    	
			$query 		=  (new Query('/ip/hotspot/active/print'))
						->where('mac-address', $mac_colon);						
			$response = $client->query($query)->read();
			foreach($response as $r){
				$id = $r[".id"];
				$q  = new Query('/ip/hotspot/active/remove');
				$q->equal('.id', $id);
				$r  = $client->query($q)->read(); 
			}  	
    	}
     					
    }
    
    public function getHotspotActive($config){
    	$client 	= new Client($config);		
		$query 		= new Query('/ip/hotspot/active/print');
		$response 	= $client->query($query)->read();
		return $response;      
    }
    
}
