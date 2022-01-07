<?php

//Call this the following way from cron (once a day at 4:50am in this example)
// 50 4 * * * www-data cd /var/www/radiusdesk/cake3/rd_cake && bin/cake archive_node_ibssconnections >> /dev/null 2>&1
// Direct MySQL Call example:
//
// set @msg = '';
// call sp_archive_node_ibss_connections(@msg);
// select @msg;
//
namespace App\Shell;

use Cake\Console\Shell;
use Cake\Datasource\ConnectionManager;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class ArchiveNodeIbssconnectionsShell extends Shell{
    public function main(){
        $this->out("Archiving Node Ibss Connections");
        $this->connection = ConnectionManager::get('default');
        $this->connection->execute("set @msg = '' ");
        $this->connection->execute("sp_archive_node_ibss_connections(@msg)");
        $results = $this->connection->execute("select @msg;")->fetchAll('assoc');
        $message = $results[0]['@msg'];
        $this->out("Archive Node Ibss Connections Result: $message");
    } 
}

?>
