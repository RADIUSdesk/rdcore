<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake fup

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;

use Cake\Datasource\ConnectionManager;


/*
/ip firewall filter
add action=accept chain=input dst-port=8728 protocol=tcp
*/

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
    }

    public function main(){
        $this->out('Hello world.');  
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
    				$timezone 	= $this->getTimezone($ra->nasidentifier);
    				$profile_id = $e_pu->profile_id;
    				$username	= $ra->username;
    				$this->fup($username,$profile_id,$timezone);
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
    
    private function fup($username,$profile_id,$timezone){
    
    	#Get the current active applied_fup_component for the user (Then compare it with the one which SHOULD apply)
    	#If different you then issue a disconnect request
    	
    
    	foreach($this->fupProfiles[$profile_id] as $c){
    	
    		if($c->if_condition == 'time_of_day'){
    		
    		
    		}else{
    		
    		    		
    		}   	
    	}   
    }
    
/*
sub fup {
    $stmt_fup_comps->execute($RAD_CONFIG{'Rd-Fup-Profile-Id'});
    my %limits;
    while(my $row = $stmt_fup_comps->fetchrow_hashref()){
        if($row->{'if_condition'} eq 'time_of_day'){
            if(check_time_of_day($row)){
                #Block action always stop everything further
                if($return == RLM_MODULE_USERLOCK){
                    #say $RAD_REPLY{'Reply-Message'};
                    last; #We do not need to do anything else
                }
                $limits{$row->{'id'}} = $row;               
            }
        }else{

            #These are day_usage week_usage or month_usage limits
            if(check_usage($row)){
                #Block action always stop everything further
                if($return == RLM_MODULE_USERLOCK){
                    #say $RAD_REPLY{'Reply-Message'};
                    last; #We do not need to do anything else
                }
                #Action is increase_speed or decrease_speed
                $limits{$row->{'id'}} = $row;
            }
        }

    }       
    $stmt_fup_comps->finish();
    my $most_decrease = undef;
    my $least_increase  = undef;
    if($return != RLM_MODULE_USERLOCK){ #Determine the 'winner'
        while (my($key, $val) = each (%limits)){
            # do whatever you want with $key and $value here ...
            $val = $limits{$key};

            #Decrease Speed
            if($most_decrease){
                if($most_decrease->{'action'} eq 'decrease_speed'){
                    if($val->{'action_amount'} >$most_decrease->{'action_amount'}){
                        $most_decrease = $val;
                    } 
                }
            }else{
                if($val->{'action'} eq 'decrease_speed'){
                    $most_decrease = $val;
                }
            }

            #Increase Speed
            if($least_increase){
                if($least_increase->{'action'} eq 'increase_speed'){
                    if($val->{'action_amount'} <$least_increase->{'action_amount'}){
                        $least_increase = $val;
                    } 
                }
            }else{
                if($val->{'action'} eq 'increase_speed'){
                    $least_increase = $val;
                }
            }
        }
    }

    if($most_decrease){
        #print(Dumper($most_decrease));
        formulate_reply($most_decrease)
    }else{
        if($least_increase){      
            #print(Dumper($least_increase));
            formulate_reply($least_increase);
        }else{
            #say "No FUP Speed Adjustment";
            formulate_reply();
        }
    }
}

sub check_time_of_day {
    my($row) = @_;
    if(exists($RAD_CHECK{'Rd-Client-Timezone'})){   
        if($RAD_CHECK{'Rd-Client-Timezone'} ne 'timezone_not_found'){
            $default_tz = $RAD_CHECK{'Rd-Client-Timezone'};
        } 
    }

    my $dt          = DateTime->now( time_zone => $default_tz);
    my $dt_start    = DateTime->now( time_zone => $default_tz);
    my $dt_end      = DateTime->now( time_zone => $default_tz);

    #Determine if we fall within the timeslot of the time_of_day span
    my @time_start = split(':', $row->{'time_start'});
    $dt_start->set_hour($time_start[0]);
    $dt_start->set_minute($time_start[1]);
    $dt_start->set_second(00);

    my @time_end = split(':', $row->{'time_end'});
    $dt_end->set_hour($time_end[0]);
    $dt_end->set_minute($time_end[1]);
    $dt_end->set_second(00);
    if(($dt->epoch >= $dt_start->epoch)&&($dt->epoch <= $dt_end->epoch)){
        if($row->{'action'} eq 'block'){
            $RAD_REPLY{'Reply-Message'} = "Not Available To Use On ".$dt->day_name." at ".$dt->hms(':');
            $return                     = RLM_MODULE_USERLOCK;
        }
        return 1;
    }else{
        return undef;
    }
}

sub check_usage {
    my($row)        = @_;
    my $time_start  = get_start_of($row->{'if_condition'});
    #print($time_start);
    $stmt_data_used->execute($RAD_REQUEST{'User-Name'},$time_start);
    my $result      = $stmt_data_used->fetchrow_hashref();
    $stmt_data_used->finish();

    my $trigger     = $row->{'data_amount'};
    if($row->{'data_unit'} eq 'mb'){
        $trigger = $trigger * 1024 * 1024;
    }
    if($row->{'data_unit'} eq 'gb'){
        $trigger = $trigger * 1024 * 1024 * 1024;
    }

    if($result->{'data_used'} > $trigger){
        if($row->{'action'} eq 'block'){
            $RAD_REPLY{'Reply-Message'} = "$row->{'if_condition'} of $row->{'data_amount'}$row->{'data_unit'} reached";
            $return                     = RLM_MODULE_USERLOCK;
        }
        return 1;
    }else{
        return undef;
    }
    
}

sub get_start_of {
    my ($when) = @_;
    if(exists($RAD_CHECK{'Rd-Client-Timezone'})){   
        if($RAD_CHECK{'Rd-Client-Timezone'} ne 'timezone_not_found'){
            $default_tz = $RAD_CHECK{'Rd-Client-Timezone'};
        } 
    }

    #'day_usage' is default of current day
    my $dt = DateTime->now( time_zone => $default_tz);
    $dt->set_hour(00);
    $dt->set_minute(00);
    $dt->set_second(00);

    if($when eq 'week_usage'){
        while($dt->day_of_week > 1){
            #say $dt->day_of_week;
            $dt->subtract( days => 1 );
        }      
    }

    if($when eq 'month_usage'){
        $dt->set_day(1);
    }   
    say $dt;
    return $dt;
}
*/    
    
    
		
}

?>
