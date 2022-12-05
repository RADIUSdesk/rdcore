<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake hello

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;

use \RouterOS\Client;
use \RouterOS\Query;

/*
/ip firewall filter
add action=accept chain=input dst-port=8728 protocol=tcp
*/

class HelloShell extends Shell
{
    public function main()
    {
        $this->out('Hello world.');
        
        
        try {
			 
		    $client = new Client([
				'host' => '192.168.8.136',
				'user' => 'admin',
				'pass' => 'admin',
				'port' => 8728,
			]);
			
			$query = new Query('/system/resource/print');
			$response = $client->query($query)->read();
			return $response;
		}
		catch (Exception $e) {
			echo "Message: " . $e->getMessage();
			echo "";
			echo "getCode(): " . $e->getCode();
			echo "";
			echo "__toString(): " . $e->__toString();
		}
        
        
/*
		// Create "where" Query object for RouterOS
		$query =
			(new Query('/ip/hotspot/host/print'))
				->where('mac-address', '0C:C6:FD:7B:8B:AA');
		//$query = (new Query('/ip/hotspot/host/print'))
		
		$query = new Query('/system/resource/print');
		
		//$query = new Query('/ip/hotspot/host/remove');
		//$query->equal('.id', '*8');
		

		// Send query and read response from RouterOS
		$response = $client->query($query)->read();

		print_r($response);
 */       
        
    }

    public function heyThere($name = 'Anonymous')
    {
        $this->out('Hey there ' . $name);
    }
    
	public function getOptionParser():ConsoleOptionParser{
		// Get an empty parser from the framework.
		$parser = parent::getOptionParser();
		$parser->setDescription(__('RADIUSdesk console for various tasks'));

		// Define your options and arguments.

		// Return the completed parser
		return $parser;
	}   
}

?>
