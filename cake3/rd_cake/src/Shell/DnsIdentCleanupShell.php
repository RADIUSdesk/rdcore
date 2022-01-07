<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake dns_ident_cleanup

namespace App\Shell;

use Cake\Console\Shell;

use Cake\Datasource\ConnectionManager;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Http\Client;

class DnsIdentCleanupShell extends Shell{

    public function main(){
        $http = new Client();
        $baseUrl = Configure::read('App.fullBaseUrl');
		$response = $http->get(''.$baseUrl.'/cake3/rd_cake/dns-desk-broker/clean-up-stale-connections.json');
		print_r($response->body);
    }  
}

?>
