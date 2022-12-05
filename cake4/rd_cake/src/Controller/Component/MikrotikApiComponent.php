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

    public function test(){
    
    	$client = new Client([
			'host' => '192.168.8.136',
			'user' => 'admin',
			'pass' => 'admin',
			'port' => 8728,
		]);
		
		$query = new Query('/system/resource/print');
		$response = $client->query($query)->read();
		return $response[0];
   
    }
    
}
