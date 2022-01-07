<?php
//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake update_user_stats 

namespace App\Shell;

use Cake\Console\Shell;
use Cake\I18n\Time;
use Cake\Datasource\ConnectionManager;
use Cake\I18n\FrozenTime;

class UpdateUserStatsShell extends Shell{

    private $basicSection = 1200; //20 minutes

    public function initialize(){
        parent::initialize();
        $this->loadModel('Radaccts');
        $this->loadModel('UserStats');
        $this->loadModel('UserSettings');
    }

    public function main(){
        $this->out("-A- Start Updating User Stats");
        $last_run_time =$this->_getLastRunTime();
        if($last_run_time){ //We skip the first time we enter something
            $this->_updateLastRunTime();
            $this->out("-B- Test To See if there were updates to synch");
            $this->_update_user_stats($last_run_time);  
        }else{
            $this->out("Last Run was not found - Added it for next run");   
        }       
    }
   
    private function _update_user_stats($last_run_time){ 
    
        $start_time = $last_run_time; //->addSecond(1); //Last run of the DB table + 1 second (Dont really need the painfull accuracy)
        //$start_time = FrozenTime::now()->subMinute(40);
        $this->out("-C- Last Run WAS ".$start_time->i18nFormat('yyyy-MM-dd HH:mm:ss'));
        
        $query = $this->{'Radaccts'}->find();
        $ent_list_radacct = $query->where([
                'OR' => [
                    ['Radaccts.acctstoptime is NULL','Radaccts.acctupdatetime >=' => $start_time ], //Sessions that still are open and have been updated since last run
                    //['Radaccts.acctstoptime is NULL'], //Sessions that still are open and have been updated since last run
                    ['Radaccts.acctstoptime >='  => $start_time] //OR - Sessions that were closed since last run
                ]
            ])->select(['data_in' => $query->func()->sum('UserStats.acctinputoctets'),'data_out' => $query->func()->sum('UserStats.acctoutputoctets')])
            ->leftJoinWith('UserStats')
            ->group(['Radaccts.radacctid'])
            ->enableAutoFields(true); 
         
        if($ent_list_radacct->count() == 0){
            $this->out("-D- No Radacct changes since last run");
        }   
         
        foreach($ent_list_radacct as $ent){
            $nas_id = $ent->nasidentifier;
            $radacctid = $ent->radacctid;
            $radaccts_in    = $ent->acctinputoctets;
            $radaccts_out   = $ent->acctoutputoctets;
            if((intval($ent->data_in) !== intval($radaccts_in))||(intval($ent->data_out) !== intval($radaccts_out))){
            
                $this->out("-D- UserStats NOT In Sync");
                $this->out("-E- RADACCT IN $radaccts_in OUT $radaccts_out");
                $this->out("-E- U-STATS IN $ent->data_in OUT $ent->data_out");
                  
                $data = $ent->toArray(); 
                $data['radacct_id'] = $data['radacctid']; 
                
                if((intval($ent->data_in) == 0)&&(intval($ent->data_out) == 0)){
                    $this->out("UserStats Is Empty Now");
                    $ent_us = $this->{'UserStats'}->newEntity($data);
                    $this->{'UserStats'}->save($ent_us);   
                }else{
                    //See if there is an entry that id newer that the $basicSection value
                    $new_acctinputoctets        = intval($radaccts_in) - intval($ent->data_in);
                    $new_acctoutputoctets       = intval($radaccts_out) - intval($ent->data_out);
                    
                    $sectionStart   = FrozenTime::now()->subSecond($this->basicSection);
                    $ent_us = $this->{'UserStats'}->find()
                        ->where(['UserStats.radacct_id' => $data['radacct_id'],'UserStats.timestamp >=' => $sectionStart])
                        ->order(['UserStats.id DESC'])
                        ->first();
                    if($ent_us){
                        $data['acctinputoctets']    = $ent_us->acctinputoctets  + $new_acctinputoctets;
                        $data['acctoutputoctets']   = $ent_us->acctoutputoctets + $new_acctoutputoctets;
                        //We only patch those two values in otder to avoid that the whole entity is updated since that nakes things slow and 
                        //causes indexes to be rebuild
                        $this->{'UserSettings'}->patchEntity($ent_us,
                            [
                                'acctinputoctets'   => $data['acctinputoctets'],
                                'acctoutputoctets'  => $data['acctoutputoctets']
                            ]);
                    }else{
                        $data['acctinputoctets']    = $new_acctinputoctets;
                        $data['acctoutputoctets']   = $new_acctoutputoctets;
                        $this->out("New Entry for New Timeslot");
                        $ent_us                     = $this->{'UserStats'}->newEntity($data);    
                    }
                    $this->{'UserStats'}->save($ent_us);
                }    
            }else{
                $this->out("UserStats IN Sync - Do Nothing");
            }
            $this->out('Radacctid '.$radacctid."UserStatsIn ".intval($ent->data_in)." $radaccts_in UserStatsOut ".intval($ent->data_out)." $radaccts_out");    
        }  
    }
    
    private function _getLastRunTime(){
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'UserStatsLastRun'])->first();
        
        if($e_us){
            $frozen_t = FrozenTime::createFromTimestamp($e_us->value);
            return($frozen_t);  
        }else{
            $now  = FrozenTime::now();
            $now_timestamp = $now->toUnixString();
            $frozen_t = FrozenTime::createFromTimestamp($now_timestamp);
            $ent_setting = $this->{'UserSettings'}->newEntity(['user_id' => -1,'name' => 'UserStatsLastRun','value' => $now_timestamp]);
            $this->{'UserSettings'}->save($ent_setting);
            return false;
        }
    
    }
    
    private function _updateLastRunTime(){
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'UserStatsLastRun'])->first();
        $now  = FrozenTime::now();
        $now_timestamp = $now->toUnixString();
        $this->{'UserSettings'}->patchEntity($e_us,['value' => $now_timestamp]);
        $this->{'UserSettings'}->save($e_us);
    }
}

?>
