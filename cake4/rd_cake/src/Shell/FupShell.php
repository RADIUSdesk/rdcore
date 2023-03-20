<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake fup

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;

use Cake\Datasource\ConnectionManager;

use Cake\I18n\FrozenTime;
use Cake\I18n\Time;
use Cake\Http\Client;

class FupShell extends Shell {

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
        $this->findFupProfiles();
        if(!empty($this->fupProfiles)){
        	//There is FUP Profiles lets see if some are with the current active users
        	$this->testActiveConnections();
        }else{
        	$this->out("<info>No FUP Profiles - Exit</info>");
        }                 
    }
      
    private function testActiveConnections(){    
    	$e_ra = $this->{'Radaccts'}->find()->where(['Radaccts.acctstoptime IS NULL'])->all();
    	foreach($e_ra as $ra){ 
    		$this->processUsername($ra);   			
    	}      
    }  
    
    private function processUsername($ra){
    	$type = $this->find_type($ra->username);
    	$this->out("<info>".$ra->username." is of type $type</info>");
    	if($type == 'user'){  	
    		$e_pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.username' => $ra->username])->first();
    		if($e_pu){
    			if(isset($this->fupProfiles[$e_pu->profile_id])){
    				$this->out("<info>Found FUP Profile for user</info>");
    				$billing_cycle = false;	
    				if(($e_pu->extra_name == 'BCStartDay')&&(intval($e_pu->extra_value) > 0)){
    					$billing_cycle = $e_pu->extra_value;	
    				}
    				$timezone 	= $this->getTimezone($ra->nasidentifier);
    				$profile_id = $e_pu->profile_id;
    				$username	= $ra->username;
    				$this->fup($username,$profile_id,$timezone,$e_pu->cloud_id,$billing_cycle);
    			}
    		}
    	}
    	
    	if($type == 'voucher'){  	
    		$e_v = $this->{'Vouchers'}->find()->where(['Vouchers.name' => $ra->username])->first();
    		if($e_v){
    			if(isset($this->fupProfiles[$e_v->profile_id])){
    				$this->out("<info>Found FUP Profile for voucher</info>");
    				$timezone 	= $this->getTimezone($ra->nasidentifier);
    				$profile_id = $e_v->profile_id;
    				$username	= $ra->username;
    				$this->fup($username,$profile_id,$timezone,$e_v->cloud_id);
    			}
    		}
    	}
    	
    	if($type == 'device'){  	
    		$e_d = $this->{'Devices'}->find()->where(['Devices.name' => $ra->username])->first();
    		if($e_d){
    			if(isset($this->fupProfiles[$e_d->profile_id])){
    				$this->out("<info>Found FUP Profile for device</info>");
    				$timezone 	= $this->getTimezone($ra->nasidentifier);
    				$profile_id = $e_v->profile_id;
    				$username	= $ra->username;
    				//Need to find the Permanet User
    				$e_pu_d = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.id' => $e_d->permanent_user_id])->first();
    				if($e_pu_d){
    					$this->fup($username,$profile_id,$timezone,$e_pu_d->cloud_id);
    				}
    			}
    		}
    	}    	    	     
    }
    
    private function findFupProfiles(){    
    	$e_p = $this->{'Profiles'}->find()->contain(['ProfileFupComponents'])->all();
    	foreach($e_p as $p){
    		if(count($p->profile_fup_components)> 0){
    			$this->fupProfiles[$p->id] = $p->profile_fup_components;
    		}    	
    	}    
    }
        
    private function find_type($username){
        $type = 'unknown';
        $q_r = $this->Radchecks->find()->where(['Radchecks.username' => $username,'Radchecks.attribute' => 'Rd-User-Type'])->first();
        if($q_r){
            $type = $q_r->value;
        }
        return $type;
    }
    
    private function getTimezone($nasid){
    
    	$timezone = $this->timezone;
   		$sql_dynamic = "SELECT IFNULL((SELECT tz.name FROM dynamic_clients c LEFT JOIN timezones tz ON tz.id = c.timezone where c.nasidentifier=:nasid),'timezone_not_found') as timezone";
   		$sql_system  = "SELECT IFNULL((SELECT tz.name FROM user_settings us LEFT JOIN timezones tz ON tz.id = us.value where us.name='timezone' AND us.user_id=-1 LIMIT 1),'timezone_not_found') as timezone" ; 
   		
   		$connection = ConnectionManager::get('default');          
      	$results = $connection
    		->execute($sql_dynamic , ['nasid' => $nasid])
    		->fetchAll('assoc');
    	if($results[0]['timezone']== 'timezone_not_found'){ 
    		$results_system = $connection
    			->execute($sql_system)
    			->fetchAll('assoc');    			
    		if($results_system[0]['timezone'] !== 'timezone_not_found'){ 
    			$timezone = $results_system[0]['timezone'];
    		}    	
    	}else{
       		$timezone = $results[0]['timezone'];
    	}    	
    	return $timezone;    
    }
    
    private function fup($username,$profile_id,$timezone,$cloud_id,$billing_cycle = false){
    
    	#Get the current active applied_fup_component for the user (Then compare it with the one which SHOULD apply)
    	#If different you then issue a disconnect request
    	$current_applied = 0; //Default is none applied (even if it might not be recorded)
    	$e_applied = $this->{'AppliedFupComponents'}->find()->where(['AppliedFupComponents.username' => $username])->first();
    	if($e_applied){
    		$current_applied = $e_applied->profile_fup_component_id;
    	}

		$should_apply 	= 0;
		$limits			= [];
  
    	foreach($this->fupProfiles[$profile_id] as $c){   	
    		if($c->if_condition == 'time_of_day'){
				$return_action = $this->check_time_of_day($c,$timezone);
				if($return_action == 'block'){
					$should_apply = $c->id;
					break;				
				}
				if($return_action == 'limit'){				
					$limits[$c->id] = $c;
				}   		
    		}else{    		
    			#These are day_usage week_usage or month_usage limits
    			$return_usage = $this->check_usage($username,$c,$timezone,$billing_cycle);
    			if($return_usage == 'block'){
					$should_apply = $c->id;
					break;				
				}
				if($return_usage == 'limit'){				
					$limits[$c->id] = $c;
				}     				    		
    		}   	
    	}
    	
    	if($should_apply !== 0){
    		$this->out("<info>Block Active </info>");
    	}

    	
    	$most_decrease 	= null;
    	$least_increase = null;    	
    	foreach($limits as $val){
    		
    		#Decrease Speed
            if($most_decrease){
                if($val->{'action'} == 'decrease_speed'){
                    if($val->{'action_amount'} >$most_decrease->{'action_amount'}){
                        $most_decrease = $val;
                    } 
                }
            }else{
                if($val->{'action'} == 'decrease_speed'){
                    $most_decrease = $val;
                }
            }

            #Increase Speed
            if($least_increase){
                if($val->{'action'} == 'increase_speed'){
                    if($val->{'action_amount'} <$least_increase->{'action_amount'}){
                        $least_increase = $val;
                    } 
                }
            }else{
                if($val->{'action'} == 'increase_speed'){
                    $least_increase = $val;
                }
            }  	
    	}
    	
    	if($most_decrease){
        	$should_apply = $most_decrease->{'id'};
		}else{
		    if($least_increase){
		    	$should_apply = $least_decrease->{'id'};      
		    }
		}

		$this->out("<info>Current Applied $current_applied</info>");
    	$this->out("<info>Should Apply $should_apply</info>");
    	if($current_applied !== $should_apply){
    		$e_cloud = $this->{'Clouds'}->find()->where(['Clouds.id' => $cloud_id])->first();
    		if($e_cloud){
    			$user_id = $e_cloud->user_id;
    			$e_user = $this->{'Users'}->find()->where(['Users.id' => $user_id])->first();
    			if($e_user){
    				$token = $e_user->token;
    				$http  = new Client();
					$response = $http->get(
					  'http://127.0.0.1/cake4/rd_cake/radaccts/kick-active-username.json',
					  ['cloud_id' => $cloud_id,'username' => $username,'token' => $token],
					  ['type' => 'json']
					);
					$reply          = $response->getStringBody();
					print($reply);
    			
    			}    		
    		}
    	}  	   
    }
    
    private function check_time_of_day($row,$timezone) {
    
    	$dt  		= new FrozenTime();
    	$dt			= $dt->setTimezone($timezone);
    	
    	$dt_start  	= new FrozenTime();
    	$dt_start  	= $dt_start->setTimezone($timezone);
    	
    	$dt_end  	= new FrozenTime();
    	$dt_end  	= $dt_end->setTimezone($timezone);
    	
    	$time_start = explode(':', $row->time_start);
    	$dt_start   = $dt_start->hour($time_start[0])->minute($time_start[1])->second(00);

		$time_end 	= explode(':', $row->time_end);
		$dt_end     = $dt_end->hour($time_end[0])->minute($time_end[1])->second(00);

		//$this->out("<info>".$dt_start->nice()."</info>");
		//$this->out("<info>".$dt->nice()."</info>");
		//$this->out("<info>".$dt_end->nice()."</info>");
		if(($dt >= $dt_start)&&($dt <= $dt_end)){
			if($row->{'action'} == 'block'){
				//$this->out("<info>BLOCK</info>");
				return 'block';
			}else{
				//$this->out("<info>LIMIT</info>");			
				return 'limit';
			}
		}
		return 'noop';
	}
	
	private function check_usage($username,$row,$timezone, $billing_cycle=false){

    	$time_start = $this->get_start_of($row->{'if_condition'},$timezone,$billing_cycle);
    	$nice = $time_start->toIso8601String();
    	$this->out("<info>TIME START $nice </info>");
    	$sql_usage 	= "SELECT IFNULL(SUM(acctinputoctets)+SUM(acctoutputoctets),0) AS data_used FROM user_stats WHERE username=:username AND timestamp >=:timestamp";
    	$connection = ConnectionManager::get('default');          
      	$results = $connection
    		->execute($sql_usage , ['username' => $username,'timestamp' => $nice])
    		->fetchAll('assoc');
    	$data_used 	= $results[0]['data_used'];
    	$this->out("<info>DATA USED $data_used</info>");
   		$trigger  	= $row->{'data_amount'};
		if($row->{'data_unit'} == 'mb'){
		    $trigger = $trigger * 1024 * 1024;
		}
		if($row->{'data_unit'} == 'gb'){
		    $trigger = $trigger * 1024 * 1024 * 1024;
		}

		if($data_used > $trigger){
		    if($row->{'action'} == 'block'){
		        return 'block';
		    }
		    return 'limit';
		}
    	return 'noop';  
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
    	$day_now 	= $dt->day;
    	
    	if(($bc_day > $day_now)&&($day_now < 28)){
    		$bc_start = $dt->subMonth(1);
			$bc_start = $bc_start->setDateTime($bc_start->year,$bc_start->month,$bc_day,0,0,0);   		
    	}else{
    		$bc_start = $dt->setDateTime($dt->year,$dt->month,$bc_day,0,0,0);
    	}
    	//$this->out("<info>Billing Cycle Start Time IS $bc_start</info>");   	
    	return $bc_start;  
    }
	     		
}

?>
