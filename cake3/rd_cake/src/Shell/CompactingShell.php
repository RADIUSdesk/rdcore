<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake compacting 

/*--==== Compacting Shell ===
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

class CompactingShell extends Shell{

    protected $start_date  = false;
    protected $end_date    = false;
    
    public function initialize(){
        parent::initialize();
        $this->loadModel('UserStats');
        $this->loadModel('UserSettings');
    }
    
    public function main(){
        $this->out("<info>Start the Compacting of the user_stats table</info>");
        $start_at = $this->_getStartAt();
        if($start_at){
            $start_of_today = FrozenTime::now()->startOfDay();
            if($start_at == $start_of_today){
                $this->out("<info>Compacting up to date - Bye (".$start_at->toCookieString().")</info>");
            }else{
                //Remove empties
                $this->_removeEmpties();
                $this->start_date = $start_at;
                $this->end_date   = $start_of_today;
                $this->out("<info>Start at ".$this->start_date->toCookieString()."</info>");
                $this->out("<info>END at ".$this->end_date->toCookieString()."</info>");   
                $this->_compactWork();    
                //Update to the start of today
                $this->_updateStartAt();
            }
        }else{
            $this->out("<info>user_stats table seems empty - nothing to compact</info>");
        }
    }
    
    private function _removeEmpties(){ 
        $this->out("<info>Remove entries with acctoutputoctets and acctinputoctets of 0 (zero)</info>"); 
        $this->{'UserStats'}->deleteAll(['UserStats.acctoutputoctets' =>0,'UserStats.acctinputoctets' =>0]);
    }
       
    private function _compactWork(){    
        while($this->start_date < $this->end_date){        
            $hour_start = $this->start_date;
            $hour_end   = $this->start_date->addHours(1)->subSeconds(1);
            $this->out("<info>Section Starts ".$hour_start->toCookieString()."</info>");
            $this->out("<info>Section Ends ".$hour_end->toCookieString()."</info>");         
            $this->start_date = $this->start_date->addHours(1);
            
            $ent_list = $this->UserStats->find()
                ->where(['UserStats.timestamp >=' => $hour_start,'UserStats.timestamp <=' => $hour_end])
                ->all();
                
            $data_workbench = [];
                
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
                    'timestamp'         => $ent->timestamp //Need the timestamp
                ];
                array_push($data_workbench[$ent->realm][$ent->nasidentifier][$ent->username][$ent->callingstationid],$info_array);
            }
            $this->_update_and_delete($data_workbench);       
        }   
    }
    
    private function _update_and_delete($data_workbench){
    
        foreach(array_keys($data_workbench) as $realm){ 
            foreach(array_keys($data_workbench[$realm]) as $nasidentifier){
                foreach(array_keys($data_workbench[$realm][$nasidentifier]) as $username){
                    foreach(array_keys($data_workbench[$realm][$nasidentifier][$username]) as $callingstationid){
                        $working_set        = $data_workbench[$realm][$nasidentifier][$username][$callingstationid];
                        $first_id           = false;
                        $trigger            = false;
                        $acctinputoctets    = 0;
                        $acctoutputoctets   = 0;
                        $remove_rows        = [];
                        if(count($working_set) > 1){
                            $trigger            = true;
                            $first_id           = $working_set[0]['id'];
                            $first_timestamp    = $working_set[0]['timestamp'];
                            foreach($working_set as $row){
                                $acctinputoctets  = $acctinputoctets + $row['acctinputoctets'];    
                                $acctoutputoctets = $acctoutputoctets + $row['acctoutputoctets']; 
                                if($row['id'] != $first_id){
                                    array_push($remove_rows,$row['id']);
                                }
                            }
                        }
                        if($trigger){
                            $this->out("<info>Update $first_id to IN $acctinputoctets and OUT $acctoutputoctets</info>");
                            $entity = $this->{'UserStats'}->get($first_id );
                            $this->{'UserStats'}->patchEntity($entity,[
                                'acctinputoctets'   => $acctinputoctets,
                                'acctoutputoctets'  => $acctoutputoctets,
                                'timestamp'         => $first_timestamp
                            ]);
                            $this->{'UserStats'}->save($entity);
                            foreach($remove_rows as $id){
                                $del  = $this->{'UserStats'}->get($id);
                                $this->{'UserStats'}->delete($del);
                            }
                        }
                    }
                }
            }
        }  
    }
    
   //Determine where we need to start from 
   private function _getStartAt(){ 
        $frozen_t = false;    
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'UserStatsCompactingStoppedAt'])->first(); 
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
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'UserStatsCompactingStoppedAt'])->first();
        if($e_us){
            $this->{'UserSettings'}->patchEntity($e_us,['value' => $start_of_day_timestamp]);
        }else{
            $e_us = $this->{'UserSettings'}->newEntity(['user_id' => -1,'name' => 'UserStatsCompactingStoppedAt','value' => $start_of_day_timestamp]);
        }
        $this->{'UserSettings'}->save($e_us);
    }        
}

?>
