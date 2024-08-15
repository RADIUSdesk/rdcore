<?php
//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake update_user_stats 

namespace App\Shell;

use Cake\Console\Shell;
use Cake\I18n\Time;
use Cake\Datasource\ConnectionManager;
use Cake\I18n\FrozenTime;

class UpdateUserStatsShell extends Shell{

    private $basicSection = 1200; //20 minutes

    public function initialize():void{
        parent::initialize();
        $this->loadModel('Radaccts');
        $this->loadModel('UserStats');
        $this->loadModel('UserSettings');
    }

    public function main(){
    
        $this->out("<warning>THIS function has been replaced by a trigger on the radacct table - Please apply the SQL patch if you have not yet</warning>");
        $this->out("<warning>You can also remove this script from CRON</warning>");
        $this->out("<warning>BYE :-)</warning>");
        return;
    
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
   
    private function _update_user_stats($last_run_time) {
        $start_time = $last_run_time;
        $this->out("-C- Last Run WAS " . $start_time->i18nFormat('yyyy-MM-dd HH:mm:ss'));

        // Optimize the query
        $query = $this->Radaccts->find()
            ->select([
                'Radaccts.radacctid',
                'Radaccts.acctinputoctets',
                'Radaccts.acctoutputoctets',
                'data_in'   => 'SUM(UserStats.acctinputoctets)',
                'data_out'  => 'SUM(UserStats.acctoutputoctets)'
            ])
            ->leftJoinWith('UserStats')
            ->where([
                'OR' => [
                    ['Radaccts.acctstoptime IS NULL', 'Radaccts.acctupdatetime >=' => $start_time],
                    ['Radaccts.acctstoptime >=' => $start_time]
                ]
            ])
            ->group(['Radaccts.radacctid'])
            ->enableAutoFields(false); // Disable unnecessary auto fields

        // Fetch results in batches
        $batchSize = 100;
        $ent_list_radacct = $query->limit($batchSize)->all();

        if ($ent_list_radacct->isEmpty()) {
            $this->out("-D- No Radacct changes since last run");
            return;
        }

        // Process each entry
        foreach ($ent_list_radacct as $ent) {
            $this->processRadacctEntry($ent);
        }
    }

    private function processRadacctEntry($ent) {
        $radacctid      = $ent->radacctid;
        $radaccts_in    = $ent->acctinputoctets;
        $radaccts_out   = $ent->acctoutputoctets;

        if ((intval($ent->data_in) !== intval($radaccts_in)) || (intval($ent->data_out) !== intval($radaccts_out))) {
            $this->out("-D- UserStats NOT In Sync");
            $this->updateUserStats($ent, $radaccts_in, $radaccts_out);
        } else {
            $this->out("UserStats IN Sync - Do Nothing");
        }
        $this->out('Radacctid ' . $radacctid . " UserStatsIn " . intval($ent->data_in) . " $radaccts_in UserStatsOut " . intval($ent->data_out) . " $radaccts_out");
    }

    private function updateUserStats($ent, $radaccts_in, $radaccts_out) {
        $data = $ent->toArray();
        $data['radacct_id'] = $data['radacctid'];

        if ((intval($ent->data_in) == 0) && (intval($ent->data_out) == 0)) {
            $this->out("UserStats Is Empty Now");
            $ent_us = $this->UserStats->newEntity($data);
        } else {
            $new_acctinputoctets = intval($radaccts_in) - intval($ent->data_in);
            $new_acctoutputoctets = intval($radaccts_out) - intval($ent->data_out);
            $sectionStart = FrozenTime::now()->subSecond($this->basicSection);

            $ent_us = $this->UserStats->find()
                ->where([
                    'UserStats.radacct_id' => $data['radacct_id'],
                    'UserStats.timestamp >=' => $sectionStart
                ])
                ->order(['UserStats.id DESC'])
                ->first();

            if ($ent_us) {
                $ent_us->acctinputoctets += $new_acctinputoctets;
                $ent_us->acctoutputoctets += $new_acctoutputoctets;
            } else {
                $data['acctinputoctets'] = $new_acctinputoctets;
                $data['acctoutputoctets'] = $new_acctoutputoctets;
                $this->out("New Entry for New Timeslot");
                $ent_us = $this->UserStats->newEntity($data);
            }
        }
        $this->UserStats->save($ent_us);
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
