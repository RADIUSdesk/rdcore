<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake update_user_stats_dailies 

/*--==== UpdateUserStatsDailies Shell ===
Our daily graphs are taken from user_stats and has a minimum interval of 60 minutes (1 Hour). 
This means that any number of entries for a realm/nasidentifier/username/callingstationid can be consolidated in that slot to ONLY ONE.
The other entries can be removed, making out table more compact, thus the name of this CakePHP Shell Script

We recommend that you run this through Cron around 3AM (UTC) 
The script will stop at the start of the current day (e.g. if it start at 03:00 it will actually only compress entries up to 00:00 of the current day (now))
The script will also record which where it last stopped so it does not need to start from the first entry.
*/

namespace App\Shell;

namespace App\Shell;

use Cake\Console\Shell;
use Cake\I18n\Time;
use Cake\Datasource\ConnectionManager;
use Cake\I18n\FrozenTime;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class UpdateUserStatsDailiesShell extends Shell{

    protected $start_date     = false;
    protected $end_date       = false;
    protected $nas_timezone   = [];
    protected $utc_plus_12    = "Pacific/Funafuti";
    protected $utc_minus_12   = "Pacific/Wallis";
    protected $time_zone      = 'UTC'; //Default for timezone
   // protected   $time_zone            = 'Africa/Johannesburg';
    
    public function initialize(){
        parent::initialize();
        $this->loadModel('UserStats');
        $this->loadModel('UserStatsDailies');
        $this->loadModel('UserSettings');
        $this->loadModel('DynamicClients');
        $this->loadModel('Timezones');
    }
    
    public function main(){
        $this->out("<info>Start Porting of the user_stats table's data to user_stats_dailies table</info>");
        $start_at = $this->_getStartAt();
        if($start_at){
            $start_of_today = FrozenTime::now()->startOfDay();
            if($start_at == $start_of_today){
                $this->out("<info>Porting up to date - Bye (".$start_at->toCookieString().")</info>");
            }else{
                $this->start_date = $start_at;
                $this->end_date   = $start_of_today;
                $this->out("<info>Start at ".$this->start_date->toCookieString()."</info>");
                $this->out("<info>END at ".$this->end_date->toCookieString()."</info>"); 
                $this->_buildNasTimeZoneList();  
                $this->_doWork();    
                //Update to the start of today
                $this->_updateStartAt();
            }
        }else{
            $this->out("<info>user_stats table seems empty - nothing to port</info>");
        }
    }
    
    private function _buildNasTimeZoneList(){
    
        $nas_list = $this->UserStats->find()
            ->where(['UserStats.timestamp >=' => $this->start_date,'UserStats.timestamp <=' => $this->end_date])
            ->group(['nasidentifier'])
            ->all();
    
        foreach($nas_list as $nas){
            $this->nas_timezone[$nas->nasidentifier] = $this->_findTimeZoneFor($nas->nasidentifier); 
        } 
    }
       
    private function _doWork(){    
        while($this->start_date < $this->end_date){        
            $day_start      = $this->start_date;
            $day_start_txt  = $day_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $day_end        = $this->start_date->addDays(1)->subSeconds(1);
            $day_end_txt    = $day_end->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $this->out("<info>Section Starts ".$day_start->toCookieString()."</info>");
            $this->out("<info>Section Ends ".$day_end ->toCookieString()."</info>");         
            $this->start_date = $this->start_date->addDays(1);
            
            $data_workbench = [];
            
            //Now go through the list in the nas_timezone
            foreach(array_keys($this->nas_timezone) as $nasidentifier){ 
            
                $tz     = $this->nas_timezone[$nasidentifier];
                $query  = $this->UserStats->find();
                $time_start = $query->func()->CONVERT_TZ([
                    "'$day_start_txt'"  => 'literal',
                    "'$tz'"             => 'literal',
                    "'+00:00'"          => 'literal',
                ]);
                
                $time_end = $query->func()->CONVERT_TZ([
                    "'$day_end_txt'"    => 'literal',
                    "'$tz'"             => 'literal',
                    "'+00:00'"          => 'literal',
                ]);
                
                $ent_list = $this->UserStats->find()
                    ->where(['timestamp >=' => $time_start,'timestamp <=' => $time_end,'nasidentifier' => $nasidentifier])
                    ->all();
                                                
                foreach($ent_list as $ent){
                               
                    if(!array_key_exists($ent->realm,$data_workbench)){    
                        $data_workbench[$ent->realm]  = [];
                        $data_workbench[$ent->realm][$ent->nasidentifier] = [];
                        $data_workbench[$ent->realm][$ent->nasidentifier][$ent->username] = [];
                        $data_workbench[$ent->realm][$ent->nasidentifier][$ent->username][$ent->callingstationid] = [];
                    }else{
                        if(!array_key_exists($ent->nasidentifier,$data_workbench[$ent->realm])){
                            $data_workbench[$ent->realm][$ent->nasidentifier] = [];
                            $data_workbench[$ent->realm][$ent->nasidentifier][$ent->username] = [];
                            $data_workbench[$ent->realm][$ent->nasidentifier][$ent->username][$ent->callingstationid] = [];
                        }else{
                            if(!array_key_exists($ent->username,$data_workbench[$ent->realm][$ent->nasidentifier])){
                                $data_workbench[$ent->realm][$ent->nasidentifier][$ent->username] = [];
                                $data_workbench[$ent->realm][$ent->nasidentifier][$ent->username][$ent->callingstationid] = [];
                            }else{
                                if(!array_key_exists($ent->callingstationid,$data_workbench[$ent->realm][$ent->nasidentifier][$ent->username])){
                                    $data_workbench[$ent->realm][$ent->nasidentifier][$ent->username][$ent->callingstationid] = [];
                                }
                            }
                        
                        } 
                    }
                    $info_array = [
                        'id'                => $ent->id,
                        'acctinputoctets'   => $ent->acctinputoctets,
                        'acctoutputoctets'  => $ent->acctoutputoctets,
                        'timestamp'         => $ent->timestamp
                    ];
                    array_push($data_workbench[$ent->realm][$ent->nasidentifier][$ent->username][$ent->callingstationid],$info_array);
                }          
            
            }                
            //print_r($data_workbench);
            $this->_add_to_dailies($data_workbench);       
        }   
    }
    
    private function _add_to_dailies($data_workbench){
    
        foreach(array_keys($data_workbench) as $realm){ 
            foreach(array_keys($data_workbench[$realm]) as $nasidentifier){
                foreach(array_keys($data_workbench[$realm][$nasidentifier]) as $username){
                    foreach(array_keys($data_workbench[$realm][$nasidentifier][$username]) as $callingstationid){
                        $working_set        = $data_workbench[$realm][$nasidentifier][$username][$callingstationid];
                        $first_id           = $working_set[0]['id'];
                        $first_timestamp    = $working_set[0]['timestamp'];
                        $acctinputoctets    = 0;
                        $acctoutputoctets   = 0;                          
                        foreach($working_set as $row){
                            $acctinputoctets  = $acctinputoctets + $row['acctinputoctets'];    
                            $acctoutputoctets = $acctoutputoctets + $row['acctoutputoctets'];
                        }
                        $this->out("<info>Add REALM $realm NASID $nasidentifier USERNAME $username user_stat_id $first_id to IN $acctinputoctets and OUT $acctoutputoctets</info>");
                        $data = [
                            'user_stat_id'      => $first_id,
                            'username'          => $username,
                            'realm'             => $realm,
                            'nasidentifier'     => $nasidentifier,
                            'callingstationid'  => $callingstationid,
                            'timestamp'         => $first_timestamp,
                            'acctinputoctets'   => $acctinputoctets,
                            'acctoutputoctets'  => $acctoutputoctets
                        ];
                        //Check if it is not already added
                        $ent_exists = $this->{'UserStatsDailies'}->find()->where(['UserStatsDailies.user_stat_id'=> $first_id])->first();
                        if($ent_exists){
                            $this->out("<info>Skipping Double Entry for $username in user_stat_id of $first_id</info>");
                        }else{
                            $this->out("<info>Adding Entry for $username in user_stat_id of $first_id</info>");
                            $entity = $this->{'UserStatsDailies'}->newEntity($data);
                            $this->{'UserStatsDailies'}->save($entity);
                        }
                    }
                }
            }
        }  
    }
    
   //Determine where we need to start from 
   private function _getStartAt(){ 
        $frozen_t = false;    
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'UserStatsDailiesStoppedAt'])->first(); 
        if($e_us){
            $frozen_t = FrozenTime::createFromTimestamp($e_us->value)->startOfDay();
        }else{
            //Get the first entry
            $ent_us = $this->UserStats->find()->order(['UserStats.timestamp' => 'ASC'])->first();
            if($ent_us){
                $time = new FrozenTime($ent_us->timestamp);
                $frozen_t   = $time->startOfDay();
            }
        }
        return $frozen_t;  
    }
    
    private function _updateStartAt(){
        $start_of_day = FrozenTime::now()->startOfDay();
        $start_of_day_timestamp = $start_of_day->toUnixString();
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'UserStatsDailiesStoppedAt'])->first();
        if($e_us){
            $this->{'UserSettings'}->patchEntity($e_us,['value' => $start_of_day_timestamp]);
        }else{
            $e_us = $this->{'UserSettings'}->newEntity(['user_id' => -1,'name' => 'UserStatsDailiesStoppedAt','value' => $start_of_day_timestamp]);
        }
        $this->{'UserSettings'}->save($e_us);
    }
    
    
    private function _findTimeZoneFor($nasidentifier){
    
        $time_zone = 'UTC'; //Sane Default
        $e_dc   = $this->{'DynamicClients'}->find()
            ->where(['DynamicClients.nasidentifier' => $nasidentifier])
            ->first();
            
        if($e_dc){
            if($e_dc !== ''){    
                $tz_id  = $e_dc->timezone;
                $ent    = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
                if($ent){
                    $time_zone = $ent->name;
                }
            } 
        }
        return $time_zone;
    }       
}

?>
