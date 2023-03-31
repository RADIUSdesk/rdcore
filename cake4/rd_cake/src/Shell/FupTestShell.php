<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake fup_test

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;

use Cake\Datasource\ConnectionManager;

use Cake\I18n\FrozenTime;
use Cake\I18n\Time;
use Cake\Http\Client;

class FupTestShell extends Shell {

	protected $fupProfiles 	= [];
	protected $timezone		= 'Africa/Johannesburg';

	public function initialize():void{
        parent::initialize();
        $this->loadModel('Profiles');
        $this->loadModel('Radaccts');
        $this->loadModel('Radchecks');
        $this->loadModel('Vouchers');
        $this->loadModel('PermanentUsers');
        $this->loadModel('Devices');
        $this->loadModel('AppliedFupComponents');
        $this->loadModel('Clouds');
        $this->loadModel('Users');
    }

    public function main(){
        
     	$this->out("<info>Brannas</info>");
     	$time_start = $this->get_start_of('month_usage',$this->timezone,2);
     	$nice = $time_start->toIso8601String();
     	$this->out("<info>Data Usage Start From $nice</info>");
                 
    }
      

	private function get_start_of($when,$timezone, $billing_cycle=false){
		#'day_usage' is default of current day
		$dt = new FrozenTime();
    	$dt = $dt->setTimezone($timezone);
    	$dt = $dt->hour(00)->minute(00)->second(00);
		if($when == 'week_usage'){
		    $dt = $dt->startOfWeek();
		}

		if($when == 'month_usage'){
			if($billing_cycle){
				$dt = $this->findBillingCycleStart($timezone,$billing_cycle);	
			}else{
		    	$dt = $dt->startOfMonth();
		   	}
		}		
		return $dt;
	}
	
	private function findBillingCycleStart($timezone,$bc_day){

    	$dt 		= new FrozenTime();
    	$dt 		= $dt->setTimezone($timezone);
    	//$dt 		= $dt->subDay(20);
    	$day_now 	= $dt->day;
    	$this->out("<info>Day Now IS $day_now</info>");
    	$this->out("<info>Billing Cycle Day Is $bc_day</info>");
    	
    	if(($bc_day > $day_now)&&($day_now < 28)){
    		$bc_start = $dt->subMonth(1);
			$bc_start = $bc_start->setDateTime($bc_start->year,$bc_start->month,$bc_day,0,0,0);   		
    	}else{
    		if($day_now > 28){ //Roll over to next month after 28th (29,30,31 will use this)
    			$bc_start = $dt->setDateTime($dt->year,$dt->month,29,0,0,0); 	
    		}else{
    			$bc_start = $dt->setDateTime($dt->year,$dt->month,$bc_day,0,0,0);
    		}
    	}
    	//$this->out("<info>Billing Cycle Start Time IS $bc_start</info>");   	
    	return $bc_start;  
    }
	     		
}

?>
