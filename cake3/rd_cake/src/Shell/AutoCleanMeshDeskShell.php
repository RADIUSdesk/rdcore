<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake accounting auto_clean_mesh_desk

namespace App\Shell;
use Cake\Console\Shell;


class AutoCleanMeshDeskShell extends Shell {

    public function initialize(){
        parent::initialize();
        $this->loadModel('NodeIbssConnections');
        $this->loadModel('NodeStations');
    }

    public function main() {
		$hour   	= (60*60);
        $day    	= $hour*24;
        $week   	= $day*31;//Change to month
		$modified 	= date("Y-m-d H:i:s", time()-$week);
        $this->out("<comment>Auto Clean-up of MESHdesk data older than one week".APP."</comment>");
        $this->NodeStations->deleteAll(['NodeStations.modified <' => $modified]);
		$this->NodeIbssConnections->deleteAll(['NodeIbssConnections.modified <' => $modified]);
    }
}

?>
