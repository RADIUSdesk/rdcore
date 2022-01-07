<?php

//Call this the following way from cron (once a day at 4:20am in this example)
// 20 4 * * * www-data cd /var/www/radiusdesk/cake3/rd_cake && bin/cake archive_node_stations >> /dev/null 2>&1
// Direct MySQL Call example:
//
// set @msg = '';
// call sp_archive_node_stations(@msg);
// select @msg;
//
namespace App\Shell;

use Cake\Console\Shell;
use Cake\Datasource\ConnectionManager;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class ArchiveNodeStationsShell extends Shell{
    public function main(){
        $this->out("Archiving Node Stations");
        $this->connection = ConnectionManager::get('default');
        $this->connection->execute("set @msg = '' ");
        $this->connection->execute("sp_archive_node_stations(@msg)");
        $results = $this->connection->execute("select @msg;")->fetchAll('assoc');
        $message = $results[0]['@msg'];
        $this->out("Archive Node Stations Result: $message");
    } 
}

?>
