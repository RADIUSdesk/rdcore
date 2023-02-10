<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake otp_cleanup

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;
use Cake\Datasource\ConnectionManager;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;


class OtpCleanupShell extends Shell {

	protected $cut_off = 2; //Cut off two hours 

    public function initialize():void{
        parent::initialize();
        $this->loadModel('PermanentUsers');
        $this->loadModel('PermanentUserOtps');
        $this->loadModel('DataCollectorOtps');
        $this->loadModel('DataCollectors');
    }
       
  	public function main(){
  			
		$this->out("<info>==PERMANENT USERS OTP===</info>");
     	$this->out("<info>Remove Awaiting OTP related data older than $this->cut_off hours</info>");
     	$now  		= FrozenTime::now();
     	$cut_off 	= $now->subHours($this->cut_off);
     	
		$pu_old_list = $this->PermanentUserOtps->find()->where(['PermanentUserOtps.modified <=' => $cut_off,'PermanentUserOtps.status' => 'otp_awaiting' ])->all();
		foreach($pu_old_list as $otp){
		 	$pu = $this->PermanentUsers->find()->where(['PermanentUsers.id' => $otp->permanent_user_id])->first();
		 	if($pu){
		 		$this->out("<info>Delete Permanent User ".$pu->username."</info>");
		 		$this->PermanentUsers->delete($pu); 		
		 	}
		 	$this->PermanentUserOtps->delete($otp);    
		 }
		 	 
		$this->out("<info>==CLICK TO CONNECT OTP===</info>");
		$this->out("<info>Remove Awaiting OTP related data older than $this->cut_off hours</info>");

		$dc_old_list = $this->DataCollectorOtps->find()->where(['DataCollectorOtps.modified <=' => $cut_off,'DataCollectorOtps.status' => 'otp_awaiting' ])->all();
		foreach($dc_old_list as $otp){
			$dc = $this->DataCollectors->find()->where(['DataCollectors.id' => $otp->data_collector_id])->first();
			if($dc){
				$this->out("<info>Delete Data Collector ".$dc->email."</info>");
				$this->DataCollectors->delete($dc); 		
			}
			$this->DataCollectorOtps->delete($otp);    
		}
		 		              
    }
  	 	  	
}

?>
