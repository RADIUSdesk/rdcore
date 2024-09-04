<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake auto_clean_mesh_desk

namespace App\Shell;
use Cake\Console\Shell;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;



class AutoCleanMeshDeskShell extends Shell {

    public function initialize():void{
        parent::initialize();
        $this->loadModel('NodeIbssConnections');
        $this->loadModel('NodeStations');
        $this->loadModel('TempReports');
        
        $this->loadModel('NodeUptmHistories');
        $this->loadModel('ApStations');
        $this->loadModel('ApUptmHistories');
        
        
    }

    public function main() {
		$hour   	= (60*60);
        $day    	= $hour*24;
        $week   	= $day*8;//Change to 8 days
		$modified 	= date("Y-m-d H:i:s", time()-$week);
        $this->out("<comment>Auto Clean-up of MESHdesk data older than one week".APP."</comment>");
        $this->NodeStations->deleteAll(['NodeStations.modified <' => $modified]);
		$this->NodeIbssConnections->deleteAll(['NodeIbssConnections.modified <' => $modified]);
		
		$this->NodeUptmHistories->deleteAll(['NodeUptmHistories.modified <' => $modified]);
		
		$this->ApStations->deleteAll(['ApStations.modified <' => $modified]);
		$this->ApUptmHistories->deleteAll(['ApUptmHistories.modified <' => $modified]);
			
		//--Delete TempReports if it is older than 30 minutes--;
		$now        = new FrozenTime();
		$hour_old	= $now->subMinute(30);
		$this->TempReports->deleteAll(['TempReports.timestamp <' => $hour_old]);		
    }
}

?>
