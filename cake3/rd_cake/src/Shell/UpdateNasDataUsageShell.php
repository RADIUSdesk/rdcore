<?php
//as www-data
//cd /var/www/htmp/cake3/rd_cake && bin/cake update_nas_data_usage 

namespace App\Shell;

use Cake\Console\Shell;
use Cake\I18n\Time;
use Cake\Datasource\ConnectionManager;


class UpdateNasDataUsageShell extends Shell{

    protected  $default_timezone   = 'UTC'; //Default for timezone
    protected  $timezone_lookup    = [];

    public function initialize(){
        parent::initialize();
        $this->loadModel('DynamicClients');
        $this->loadModel('Radaccts');
        $this->loadModel('Timezones');
    }

    public function main(){
        $this->out("Updating Data Usaged Field For Nas With Data Limits");
        $this->_prime_timezones();
        $this->_update_usage();
        $this->_update_daily_usage();
    }
    
    private function _prime_timezones(){ 
        $results = $this->{'Timezones'}->find()->all();   
        foreach($results as $ent){       
            $this->timezone_lookup[$ent->id] = $ent->name;        
        }
    } 
    
    private function _update_daily_usage(){
        $ent_list_dc = $this->{'DynamicClients'}->find()->where(['DynamicClients.daily_data_limit_active' => true])->all();
        foreach($ent_list_dc as $ent){

            $r_hour     = $ent->daily_data_limit_reset_hour;
            $r_min      = $ent->daily_data_limit_reset_minute;         
            $tz_id      = $ent->timezone;
            $timezone   = $this->default_timezone;
            if($tz_id !== ''){
                if(isset($this->timezone_lookup[$tz_id])){
                    $timezone = $this->timezone_lookup[$tz_id];
                }
            }
            
            $start_of_day = $this->_start_of_day($r_hour,$r_min,$timezone);
            $nas_id = $ent->nasidentifier;
            $this->out("Name ".$ent->name." with nasid ".$nas_id." resets on ".$r_hour." on timezone $timezone");
             
            $query_string = "SELECT IFNULL(SUM(acctinputoctets)+ ".
                            "SUM(acctoutputoctets),0) as used ".
                            "FROM radacct WHERE nasidentifier='$nas_id' ".
                            "AND UNIX_TIMESTAMP(acctstarttime) + acctsessiontime > UNIX_TIMESTAMP(CONVERT_TZ(FROM_UNIXTIME('$start_of_day'),'$timezone','+00:00'))";
                            
            $connection = ConnectionManager::get('default');
            $results = $connection
                ->execute($query_string)
                ->fetch('assoc');
            $used = $results['used'];
            
            $this->{'DynamicClients'}->patchEntity($ent,['daily_data_used' =>$used]);
            $this->{'DynamicClients'}->save($ent);
            
        } 
    }
    
    private function _update_usage(){ 
        $ent_list_dc = $this->{'DynamicClients'}->find()->where(['DynamicClients.data_limit_active' => true])->all(); 
        foreach($ent_list_dc as $ent){
            $r_day      = $ent->data_limit_reset_on;
            $r_hour     = $ent->data_limit_reset_hour;
            $r_min      = $ent->data_limit_reset_minute;        
            $tz_id      = $ent->timezone;
            $timezone   = $this->default_timezone;
            if($tz_id !== ''){
                if(isset($this->timezone_lookup[$tz_id])){
                    $timezone = $this->timezone_lookup[$tz_id];
                }
            }
            
            $start_of_month = $this->_start_of_month($r_day,$r_hour,$r_min,$timezone);
            $nas_id = $ent->nasidentifier;
            $this->out("Name ".$ent->name." with nasid ".$nas_id." resets on ".$r_day." on timezone $timezone");
             
            $query_string = "SELECT IFNULL(SUM(acctinputoctets)+ ".
                            "SUM(acctoutputoctets),0) as used ".
                            "FROM radacct WHERE nasidentifier='$nas_id' ".
                            "AND UNIX_TIMESTAMP(acctstarttime) + acctsessiontime > UNIX_TIMESTAMP(CONVERT_TZ(FROM_UNIXTIME('$start_of_month'),'$timezone','+00:00'))";    
                            
            $connection = ConnectionManager::get('default');
            $results = $connection
                ->execute($query_string)
                ->fetch('assoc');
            $used = $results['used'];
            
            $this->{'DynamicClients'}->patchEntity($ent,['data_used' =>$used]);
            $this->{'DynamicClients'}->save($ent);
            
        }
    }
       
    private function _start_of_day($r_hour,$r_min,$timezone) {
        // Get the current time.
        $dt_now     = Time::now();
        $dt_now->setTimezone($timezone);
            
        $dt_reset  = Time::now()
            ->year($dt_now->year)
            ->month($dt_now->month)
            ->day($dt_now->day)
            ->hour($r_hour)
            ->minute($r_min);              
        $dt_reset->setTimezone($timezone);
              
        #IF we are BEFORE the reset date move one day back
        if($dt_now->timestamp < $dt_reset->timestamp){
            $dt_reset->subDay(1);
        }         
        $dt_reset->setTimezone('UTC');
        return $dt_reset->timestamp;
    }
    
    private function _start_of_month($r_day,$r_hour,$r_min,$timezone) {
   
        // Get the current time.
        $dt_now     = Time::now();
        $dt_now->setTimezone($timezone);
        
        $timestamp  = $dt_now->timestamp;
        
        #Get the day of the month at this moment in time
        $day_now    = $dt_now->day;
        
        //We do the follwoing if reset day is for instance 31 but the month only has 30 days (or 28 for that matter)
        $month_end = Time::now();
        $month_end->setTimezone($timezone);
        
        $last_day_of_month = $month_end->endOfMonth()->day;
        if($r_day > $last_day_of_month){
            $r_day = $last_day_of_month;
        }
          
        $dt_reset  = Time::now()
            ->year($dt_now->year)
            ->month($dt_now->month)
            ->day($r_day)
            ->hour($r_hour)
            ->minute($r_min);
                    
        $dt_reset->setTimezone($timezone);
        
        if($dt_now->timestamp < $dt_reset->timestamp){  
            #We use the previous month 
            //When adding or subtracting months, if the resulting time is a date that does not exist, 
            //the result of this operation will always be the last day of the intended month.
            $dt_reset->subMonth();
        }
        $dt_reset->setTimezone('UTC');
        return $dt_reset->timestamp;  
    }   
}

?>
