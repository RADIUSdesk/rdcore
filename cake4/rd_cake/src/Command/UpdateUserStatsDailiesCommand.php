<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake update_user_stats_dailies 

namespace App\Command;

use Cake\Command\Command;
use Cake\Console\Arguments;
use Cake\Console\ConsoleIo;
use Cake\ORM\TableRegistry;
use Cake\I18n\FrozenTime;

class UpdateUserStatsDailiesCommand extends Command {

    protected $startDate      = null;
    protected $endDate        = null;
    protected $nasTimezone    = [];
    protected $time_zone      = 'UTC'; //Default for timezone
    protected $io             = null;
   // protected   $time_zone            = 'Africa/Johannesburg';
   
   public function initialize():void{
        parent::initialize();
        $this->UserStats        = $this->getTableLocator()->get('UserStats');
        $this->UserStatsDailies = $this->getTableLocator()->get('UserStatsDailies');
        $this->UserSettings     = $this->getTableLocator()->get('UserSettings');
        $this->DynamicClients   = $this->getTableLocator()->get('DynamicClients');
        $this->Timezones        = $this->getTableLocator()->get('Timezones');
    }

    public function execute(Arguments $args, ConsoleIo $io):int {
    
        $this->io = $io;
        $this->io->info("Start Porting of the user_stats table's data to user_stats_dailies table");
        
        $startAt = $this->_getStartAt();
        if($startAt){
            $startOfToday = FrozenTime::now()->startOfDay();
            if($startAt == $startOfToday){
                $this->io->success("Porting up to date - Bye (".$startAt->toCookieString().")");
            }else{
                $this->startDate = $startAt;
                $this->endDate   = $startOfToday;                        
                $this->io->info("Start at ".$this->startDate->toCookieString());
                $this->io->info("END at ".$this->endDate->toCookieString()); 
                
                $this->_buildNasTimeZoneList();
                $this->doesWork(); 
               // $this->_doWork();    
                //Update to the start of today*/
                $this->_updateStartAt();
            }
        }else{
            $this->io->warning("user_stats table seems empty - nothing to port");
        }
        return static::CODE_SUCCESS;
    }
      
    private function doesWork(){

        while ($this->startDate < $this->endDate) {
            $dayStart   = $this->startDate;
            $dayEnd     = $dayStart->addDays(1)->subSeconds(1);

            $this->io->warning("==Section Starts " . $dayStart->toCookieString().'==');
            $this->io->warning("==Section Ends " . $dayEnd->toCookieString().'==');

            $uniqueTimezones = array_unique(array_values($this->nasTimezone));

            if (count($uniqueTimezones) === 1) {
                $this->_addToDailies($dayStart, $dayEnd, $uniqueTimezones[0]);
            } else {
                foreach ($this->nasTimezone as $nasIdentifier => $timezone) {
                    $this->_addToDailies($dayStart, $dayEnd, $timezone, $nasIdentifier);
                }
            }

            $this->startDate = $dayStart->addDays(1);
        }
    }
       
    private function _addToDailies($dayStart,$dayEnd,$timezone,$nasidentifier = null){ //nasidentifier is optional
    
        $dayStartTxt= $dayStart->i18nFormat('yyyy-MM-dd HH:mm:ss');
        $dayEndTxt  = $dayEnd->i18nFormat('yyyy-MM-dd HH:mm:ss');
        
        $query      = $this->UserStats->find();               
        $tz         = $timezone;
        
        $time_start = $query->func()->CONVERT_TZ([
            "'$dayStartTxt'"  => 'literal',
            "'$tz'"          => 'literal',
            "'+00:00'"       => 'literal',
        ]);
        
        $time_end = $query->func()->CONVERT_TZ([
            "'$dayEndTxt'"    => 'literal',
            "'$tz'"           => 'literal',
            "'+00:00'"        => 'literal',
        ]);
        
        $where = [
            'timestamp >=' => $time_start,
            'timestamp <=' => $time_end
        ];
        if($nasidentifier){
            $where['nasidentifier'] = $nasidentifier;
        }                              
        $query
            ->select([
                'user_stat_id'      => 'id',
                'username',
                'realm',
                'nasidentifier',
                'callingstationid',
                'timestamp'          => $dayStart->getTimestamp(),
                'acctinputoctets'    => $query->func()->sum('acctinputoctets'),
                'acctoutputoctets'   => $query->func()->sum('acctoutputoctets'),
            ])
            ->distinct([
                'username',
                'realm',
                'nasipaddress',
                'nasidentifier',
                'callingstationid'
            ])
            ->where($where);
        
        // Execute the query and get the results
        $results = $query->all();       
        foreach ($results as $row) {
            //print_r($row->username);
            $this->UserStatsDailies->save($this->UserStatsDailies->newEntity($row->toArray()));
        }  
    }
      
    //Determine where we need to start from     
    private function _getStartAt(){
        $frozenTime = null;
        // Try to find the 'UserStatsDailiesStoppedAt' setting
        $userSetting = $this->UserSettings
            ->find()
            ->where(['user_id' => -1, 'name' => 'UserStatsDailiesStoppedAt'])
            ->first();

        if ($userSetting) {
            $frozenTime = FrozenTime::createFromTimestamp($userSetting->value)->startOfDay();
        } else {
            // Fallback to the first UserStats entry
            $firstUserStat = $this->UserStats
                ->find()
                ->order(['timestamp' => 'ASC'])
                ->first();

            if ($firstUserStat) {
                $time         = new FrozenTime($firstUserStat->timestamp);
                $frozenTime   = $time->startOfDay();
            }
        }
        return $frozenTime;
    }
    
    private function _buildNasTimeZoneList(){
    
        $nasList = $this->UserStats->find()
            ->where(['UserStats.timestamp >=' => $this->startDate,'UserStats.timestamp <=' => $this->endDate])
            ->group(['nasidentifier'])
            ->all();
    
        foreach($nasList as $nas){
            $this->nasTimezone[$nas->nasidentifier] = $this->_findTimeZoneFor($nas->nasidentifier); 
        } 
    }
    
    private function _findTimeZoneFor($nasidentifier){
    
        $time_zone = 'UTC'; //Sane Default
        $dynamicClient   = $this->DynamicClients->find()
            ->where(['DynamicClients.nasidentifier' => $nasidentifier])
            ->first();
            
        if($dynamicClient){
            if($dynamicClient !== ''){    
                $tz_id      = $dynamicClient->timezone;
                $timezone   = $this->Timezones->find()->where(['Timezones.id' => $tz_id])->first();
                if($timezone){
                    $time_zone = $timezone->name;
                }
            } 
        }
        return $time_zone;
    }       
    
    private function _updateStartAt(){

        $startOfDay = FrozenTime::now()->startOfDay();
        $userSetting = $this->UserSettings
            ->find()
            ->where(['user_id' => -1, 'name' => 'UserStatsDailiesStoppedAt'])
            ->first();

        if ($userSetting) {
            $userSetting->value = $startOfDay->toUnixString();
        } else {
            $userSetting = $this->UserSettings->newEntity([
                'user_id' => -1,
                'name' => 'UserStatsDailiesStoppedAt',
                'value' => $startOfDay->toUnixString(),
            ]);
        }

        $this->UserSettings->save($userSetting);
    }
}
