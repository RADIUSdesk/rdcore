<?php

namespace App\Controller;


//use Cake\I18n\Time;
use Cake\I18n\FrozenTime;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class DataUsagesController extends AppController {

    public $main_model        = 'DataUsage';
    public $base     = "Access Providers/Controllers/DataUsage/";
    
    protected   $type           = false;
    protected   $item_name      = false;
    protected   $base_search    = false;
    protected   $data_limit_active   = false;
    protected   $start_of_month = 1;
    protected   $time_zone      = 'UTC'; //Default for timezone
   // protected   $time_zone      = 'Africa/Johannesburg';

    protected $fields   = [
        'data_in' => 'sum(UserStats.acctinputoctets)',
        'data_out' => 'sum(UserStats.acctoutputoctets)',
        'data_total' => 'sum(UserStats.acctoutputoctets) + sum(UserStats.acctinputoctets)'
    ];

    public function initialize()
    {
        parent::initialize();
        $this->loadModel('UserStats');
        $this->loadModel('Vouchers');
        $this->loadModel('PermanentUsers');
        $this->loadModel('Devices');
        $this->loadModel('DynamicClients');

        $this->loadComponent('TimeCalculations');
        $this->loadComponent('Formatter');
    }

    public function clientUsageForRealm(){

        $data = [];
        
        $this->base_search = $this->_base_search();
        
        $today = date('Y-m-d', time());

        if($this->type == 'realm'){

            $data['daily']['top']   = $this->_getTopClients($today,'day');
            $data['weekly']['top']  = $this->_getTopClients($today,'week');
            $data['monthly']['top'] = $this->_getTopClients($today,'month');
        }
        

        $data['daily']['graph']     = $this->_getDailyGraph($today);
        $data['daily']['totals']    = $this->_getTotal($today,'day');

        $data['weekly']['totals']   = $this->_getTotal($today,'week');
        $data['weekly']['graph']    =  $this->_getWeeklyGraph($today);

        //_____ MONTHLY ___
        $data['monthly']['graph']   =  $this->_getMonthlyGraph($today);
        $data['monthly']['totals']  = $this->_getTotal($today,'month');

        if($this->type == 'nas_id'){
            $data['client_detail'] = $this->_getClientDetail();
        }


        $this->set([
            'data' => $data,
            'success' => true,
            '_serialize' => ['data','success']
        ]);
    }

    //--Read (the whole lot)
    public function usageForRealm() {

        $data = [];
           
        $this->base_search = $this->_base_search();
        $today = date('Y-m-d', time());
        
        //Try to determine the timezone if it might have been set ....
        $this->_setTimeZone();
                
        //________ DAILY _________      
        
        //-- Only if $this->type = 'realm' do we need theser --
        if($this->type == 'realm'){
            $data['daily']['top_ten']   = $this->_getTopTen($today,'day');
            $data['weekly']['top_ten']  = $this->_getTopTen($today,'week');
            $data['monthly']['top_ten'] = $this->_getTopTen($today,'month');
            
            //Also the active sessions
            $active_sessions = [];
            $this->loadModel('Radaccts');
            $q_acct = $this->Radaccts->find()->where([
                'Radaccts.realm' => $this->item_name,
                'Radaccts.acctstoptime IS NULL'
            ])->all();
            foreach($q_acct as $i){
                $online_time    = time()-strtotime($i->acctstarttime);
                $active         = true; 
                $online_human   = $this->TimeCalculations->time_elapsed_string($i->acctstarttime,false,true);
                array_push($active_sessions, [
                    'id'                => intval($i->radacctid),
                    'username'          => $i->username,
                    'callingstationid'  => $i->callingstationid,
                    'online_human'      => $online_human,
                    'online'            => $online_time
                ]);
            }
            $data['daily']['active_sessions'] = $active_sessions;
            
        }
        
        //____ Get some Dope on the user if it is a user
        if($this->type == 'user'){
            
            $data['user_detail'] = $this->_getUserDetail();
        
        }
        
        
        $data['daily']['graph']     = $this->_getDailyGraph($today);
        $data['daily']['totals']    = $this->_getTotal($today,'day');
        
        //______ WEEKLY ____
        $data['weekly']['totals']   = $this->_getTotal($today,'week');
        $data['weekly']['graph']    =  $this->_getWeeklyGraph($today);
        
        //_____ MONTHLY ___
        $data['monthly']['graph']   =  $this->_getMonthlyGraph($today);
        $data['monthly']['totals']  = $this->_getTotal($today,'month');
  
        $this->set([
            'data' => $data,
            'success' => true,
            '_serialize' => ['data','success']
        ]);
    }
    
    private function _setTimezone(){    
        //HEADSUP This might cause problems in future since its dependent on the ID value in the config file
        //ALSO We need to modify the wizard to populate the dynamic_clients timzone value 
        $where      = $this->base_search;
        $q_r        = $this->UserStats->find()->select(['UserStats.nasidentifier'])->where($where)->order(['UserStats.timestamp DESC'])->first();
        if($q_r){
            $nasidentifier  = $q_r->nasidentifier;
            $e_dc        = $this->{'DynamicClients'}->find()
                            ->where(['DynamicClients.nasidentifier' => $nasidentifier])
                            ->first();
            if($e_dc){
                if($e_dc !== ''){
                    Configure::load('MESHdesk','default'); 
                    $d_tz = Configure::read('MESHdesk.timezones'); //Read the defaults
                    foreach($d_tz as $z){
                        if($z['id'] == $e_dc->timezone){
                            $this->time_zone = $z['name'];
                            break;
                        }
                    }
                } 
            }
        }
    }
     
    private function _getTotal($day,$span){
    
        $totals         = [];
        $where          = $this->base_search;
        
        if($span == 'day'){
            $slot_start     = "$day ".'00:00:00';
            $slot_end       = "$day ".'23:59:59';
        }
        
        if($span == 'week'){
            $pieces         = explode('-', $day);
            $start_day      = date('Y-m-d', strtotime('this week', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
            $pieces         = explode('-',$start_day);
            $end_day        = date('Y-m-d',strtotime('+7 day', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
              
            $slot_start     = "$start_day ".'00:00:00';
            $slot_end       = "$end_day ".'23:59:59';
        }
        
        if($span == 'month'){          
            if($this->data_limit_active){           
                $slot_start = FrozenTime::createFromTimestamp($this->_start_of_month($this->start_of_month,$this->start_hour,$this->start_minute));
                $end_time   = $slot_start; 
                $slot_end   = $end_time->addMonth(1)->subMinute(1); 
            }else{
                $start_time = FrozenTime::now()->startOfMonth();    
                $slot_start = $start_time->startOfDay(); 
                $slot_end   = $start_time->addMonth(1)->subMinute(1);     
            }
        }
        
        //print_r("===========================");
        //print_r($span);
        
        //print_r($slot_start);
        
        if($span == 'month'){
            array_push($where, ['UserStats.timestamp >=' => $slot_start]);
            array_push($where, ['UserStats.timestamp <=' => $slot_end]);    
        
        }else{
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);
        }      
        
        $q_r = $this->UserStats->find()->select($this->fields)->where($where)->first();
        
        //print_r($where);

        $totals['type']         = $this->type;
        $totals['item_name']    = $this->item_name;
                 
        if($q_r){
            $totals['data_in']      = $q_r->data_in;
            $totals['data_out']     = $q_r->data_out;
            $totals['data_total']   = $q_r->data_total;
        } 
        return $totals;
    
    }

    private function _getTopClients($day,$span){

        $this->loadModel('DynamicClients');
        $top        = [];
        $where      = $this->base_search;

        if($span == 'day'){
            $slot_start     = "$day ".'00:00:00';
            $slot_end       = "$day ".'23:59:59';
        }

        if($span == 'week'){
            $pieces         = explode('-', $day);
            $start_day      = date('Y-m-d', strtotime('this week', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
            $pieces         = explode('-',$start_day);
            $end_day        = date('Y-m-d',strtotime('+7 day', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));

            $slot_start     = "$start_day ".'00:00:00';
            $slot_end       = "$end_day ".'23:59:59';
        }

        if($span == 'month'){  //This one we have to tread differently
            $start_time = FrozenTime::now()->subMonth(); //Go one month back
                        
            array_push($where,array("CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $start_time));
            //array_push($where,array('UserStats.timestamp >=' => $start_time));
            $fields = $this->fields;
            array_push($fields, 'UserStats.nasidentifier');

            $q_r = $this->UserStats->find()->select($fields)
                    ->where($where)
                    ->order(['data_total' => 'DESC'])
                    ->group(['UserStats.nasidentifier'])
                    ->all();
           
            $id = 1;
            
            foreach($q_r as $tt){
                $nas        = $tt->nasidentifier;      
                $ent_nas    = $this->{'DynamicClients'}->find()->where(['DynamicClients.nasidentifier' => $nas])->first();		
                if($ent_nas){
                    $nas_name   = $ent_nas->name;
                    if($ent_nas->data_limit_active){
                        $slot_start = FrozenTime::createFromTimestamp(
                            $this->_start_of_month($ent_nas->data_limit_reset_on,$ent_nas->data_limit_reset_hour,$ent_nas->data_limit_reset_minute));
                        $end_time   = $slot_start; 
                        $slot_end   = $end_time->addMonth(1)->subMinute(1);
                    
                    }else{
                        $slot_start = FrozenTime::now()->startOfMonth(); 
                        $slot_end   = $start_time->addMonth(1)->subMinute(1);
                    }
                    $new_where = $where; 
                    
                    array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
                    array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);
                                    
                    //array_push($new_where,array('UserStats.timestamp >=' =>  $slot_start));
                    //array_push($new_where,array('UserStats.timestamp <=' =>  $slot_end));
                    
                    array_push($new_where,array('UserStats.nasidentifier' => $nas));
                    $q_us = $this->UserStats->find()->select($fields)
                        ->where($new_where)
                        ->order(['data_total' => 'DESC'])
                        ->group(['UserStats.nasidentifier'])
                        ->first();
                    if($q_us){
                        array_push($top,
                            [
                                'nasid'         => $nas,
								'nasname'		=> $nas_name,
                                'data_in'       => $q_us->data_in,
                                'data_out'      => $q_us->data_out,
                                'data_total'    => $q_us->data_total,
                            ]
                        );
                    }   
                }
            }
            return $top;     
        }else{
        
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);

           // array_push($where,array('UserStats.timestamp >=' => $slot_start));
           // array_push($where,array('UserStats.timestamp <=' => $slot_end));

            $fields = $this->fields;
            array_push($fields, 'UserStats.nasidentifier');

            $q_r = $this->UserStats->find()->select($fields)
                    ->where($where)
                    ->order(['data_total' => 'DESC'])
                    ->group(['UserStats.nasidentifier'])
                    ->all();

            $id = 1;
            foreach($q_r as $tt){
                $nas        = $tt->nasidentifier;
                
                $nas_name   = "(UNKNOWN)";
                $ent_nas    = $this->{'DynamicClients'}->find()->where(['DynamicClients.nasidentifier' => $nas])->first();
                if($ent_nas){
                    $nas_name   = $ent_nas->name;
                }
                
                array_push($top,
                    [
                        'nasid'         => $nas,
                        'nasname'		=> $nas_name,
                        'data_in'       => $tt->data_in,
                        'data_out'      => $tt->data_out,
                        'data_total'    => $tt->data_total,
                    ]
                );
                $id++;
            }
            return $top;
        }
    }

    private function _getTopTen($day,$span){
    
        $top_ten        = [];
        $where          = $this->base_search;  
        
        if($span == 'day'){
            $slot_start     = "$day ".'00:00:00';
            $slot_end       = "$day ".'23:59:59';
        }
        
        if($span == 'week'){
            $pieces         = explode('-', $day);
            $start_day      = date('Y-m-d', strtotime('this week', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
            $pieces         = explode('-',$start_day);
            $end_day        = date('Y-m-d',strtotime('+7 day', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
              
            $slot_start     = "$start_day ".'00:00:00';
            $slot_end       = "$end_day ".'23:59:59';
        }
        
         if($span == 'month'){
            //$givenday = date("w", mktime(0, 0, 0, MM, dd, yyyy));
            $pieces         = explode('-', $day);
            $start_day      = date('Y-m-d', strtotime('first day of', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
            $end            = cal_days_in_month(CAL_GREGORIAN, $pieces[1], $pieces[0]); 
            $end_day        = date('Y-m-d',strtotime('+'.$end.' day', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
           
            if($this->data_limit_active){           
                $slot_start = FrozenTime::createFromTimestamp($this->_start_of_month($this->start_of_month,$this->start_hour,$this->start_minute));
                $end_time   = $slot_start; 
                $slot_end   = $end_time->addMonth(1)->subMinute(1); 
            }else{
                $start_time = FrozenTime::now()->startOfMonth();    
                $slot_start = $start_time->startOfDay(); 
                $slot_end   = $start_time->addMonth(1)->subMinute(1);     
            }
        }
        
        if($span == 'month'){
            array_push($where, ['UserStats.timestamp >=' => $slot_start]);
            array_push($where, ['UserStats.timestamp <=' => $slot_end]);        
        }else{
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);
        }    
        
        $fields = $this->fields;
        array_push($fields, 'UserStats.username','UserStats.callingstationid');
        
        $q_r = $this->UserStats->find()->select($fields)
            ->where($where)
            ->order(['data_total' => 'DESC'])
            ->group(['UserStats.username'])
            ->all();
    
        $id = 1;
        foreach($q_r as $tt){
            $username   = $tt->username;
            $mac        = $tt->callingstationid;
            array_push($top_ten, 
                [
                    'id'            => $id,
                    'username'      => $username,
                    'mac'           => $mac,
                    'data_in'       => $tt->data_in,
                    'data_out'      => $tt->data_out,
                    'data_total'    => $tt->data_total,
                ]
            );
            $id++;
        } 
        return $top_ten;
    }
    
    private function _getDailyGraph($day){

        $items  = [];
        $start  = 0;
        $end    = 24;
        $base_search = $this->base_search;

        while($start < $end){
            $slot_start  = "$day ".sprintf('%02d', $start).':00:00';
            $slot_end    = "$day ".sprintf('%02d', $start).':59:59';
            $start++;
        
            $where = $base_search;
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);
            
       //     array_push($where, ['UserStats.timestamp >=' => $slot_start]);
       //    array_push($where, ['UserStats.timestamp <=' => $slot_end]);

            $q_r = $this->UserStats->find()->select($this->fields)->where($where)->first();

            if($q_r){
                $d_in   = $q_r->data_in;
                $d_out  = $q_r->data_out;
                array_push($items, ['id' => $start, 'time_unit' => $start, 'data_in' => $d_in, 'data_out' => $d_out]);
            }
        }
        return(['items' => $items]);
    }
    
    private function _getWeeklyGraph($day){

        $items          = [];
    
        //With weekly we need to find the start of week for the specified date
        $pieces     = explode('-', $day);
        $start_day  = date('Y-m-d', strtotime('this week', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));

        //Prime the days
        $slot_start = "$start_day 00:00:00";
        $slot_end   = "$start_day 59:59:59";
        $days       = ["Monday", "Tuesday","Wednesday", "Thusday", "Friday", "Saturday", "Sunday"];
        $count      = 1;

        $base_search = $this->base_search;
       
        foreach($days as $d){

            $where = $base_search;
            
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
            array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);
            
            //array_push($where,['UserStats.timestamp >=' => $slot_start]);
            //array_push($where,['UserStats.timestamp <=' => $slot_end]);
            
            $q_r = $this->UserStats->find()->select($this->fields)->where($where)->first();
            
            if($q_r){
                $d_in   = $q_r->data_in;
                $d_out  = $q_r->data_out;
                array_push($items, ['id' => $count, 'time_unit' => $d, 'data_in' => $d_in, 'data_out' => $d_out]);
            }

            //Get the nex day in the slots (we move one day on)
            $pieces     = explode('-',$start_day);
            $start_day  = date('Y-m-d',strtotime('+1 day', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
            $slot_start = "$start_day 00:00:00";
            $slot_end   = "$start_day 59:59:59";
            $count++;
        }
        return(['items' => $items]);
    }
    
    private function _getMonthlyGraph(){
        $items          = [];        
        if($this->data_limit_active){           
            $slot_start = FrozenTime::createFromTimestamp($this->_start_of_month($this->start_of_month,$this->start_hour,$this->start_minute));
            $end_time   = $slot_start; 
            $slot_end   = $end_time->addHour(24)->subMinute(1); 
        }else{
            $start_time = FrozenTime::now()->startOfMonth();    
            $slot_start = $start_time->startOfDay(); 
            $slot_end   = $start_time->endOfDay();     
        }
         
        $month_date     = $slot_end->addMonth(1);
        $base_search    = $this->base_search;
        $id_counter     = 1;
       
        while($month_date->timestamp > $slot_end->timestamp){
            $where = $base_search;
            //FIXME THISE TIMEZONE THING NOT WORK ON MONTH
          //  array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
          //  array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);
            
            array_push($where, ['UserStats.timestamp >=' => $slot_start]);
            array_push($where, ['UserStats.timestamp <=' => $slot_end]);
            $q_r = $this->UserStats->find()->select($this->fields)->where($where)->first();
            if($q_r){
                $d_in   = $q_r->data_in;
                $d_out  = $q_r->data_out;
                array_push($items, ['id' => $id_counter, 'time_unit' => $slot_start->day, 'data_in' => $d_in, 'data_out' => $d_out]);
            }
            $slot_start = $slot_start->addHour(24);
            $slot_end = $slot_end->addHour(24);
            $id_counter ++;
        }    
        $base_search    = $this->base_search;
        return(['items' => $items]);
    } 
    
    private function _base_search(){

        $type           = 'realm';
        $base_search    = [];
        $username       = $this->request->getQuery('username');
        $this->item_name= $username;

        if(null !== $this->request->getQuery('type')){
            $type = $this->request->getQuery('type');
            //Permanent users an vouchers
            if(($type == 'permanent')||($type == 'voucher')||($type == 'user')||($type == 'activity_viewer')){
                array_push($base_search, ['UserStats.username' => $username]);
        
            }
            //Devices
            if($type == 'device'){
                array_push($base_search, ['UserStat.callingstationid' => $username]);
            }
            //Realms
            if($type == 'realm'){
                $this->loadModel('Realms');

                $q_r = $this->Realms->find()->where(['Realms.id' => $username])->first();
                        
                if($q_r){ 
                    $realm_name = $q_r->name;
                    $this->item_name= $realm_name;
                    array_push($base_search, ['UserStats.realm' => $realm_name]);
                }
            }
            //Nas
            if($type == 'nas'){
                $this->loadModel('Nas');

                $q_r = $this->Nas->find()->where(['Nas.id' => $username])->first();
                if($q_r){ 
                    $nas_identifier = $q_r->nasidentifier;
                    $this->item_name= $nas_identifier;
                    array_push($base_search, ['UserStats.nasidentifier' => $nas_identifier]);
                }
            }
            
            //Dynamic clients
            if($type == 'dynamic_client'){
                $this->loadModel('DynamicClients');

                $q_r = $this->DynamicClients->find()->where(['DynamicClients.id' => $username])->first();

                if($q_r){
                    $nas_identifier = $q_r->nasidentifier;
                    $this->item_name= $nas_identifier; 
                    array_push($base_search, ['UserStats.nasidentifier' => $nas_identifier]);
                }
            }
            
            //Specific NAS 
            if($type == 'nas_id'){
                $this->loadModel('DynamicClients');

                $q_r = $this->DynamicClients->find()->where(['DynamicClients.nasidentifier' => $username])->first();

                if($q_r){     
                    $nas_identifier = $q_r->nasidentifier;
                    $this->item_name= $nas_identifier;
                    if($q_r->data_limit_active){
                        $this->data_limit_active = $q_r->data_limit_active;
                        $this->start_of_month    = $q_r->data_limit_reset_on;
                        $this->start_hour        = $q_r->data_limit_reset_hour; 
                        $this->start_minute      = $q_r->data_limit_reset_minute;  
                    }
                    array_push($base_search, ['UserStats.nasidentifier' => $nas_identifier]);
                }
            }
            
            $this->type = $type;   
        }
        
        return $base_search;
    }
    
    private function _getUserDetail(){
    
        $found = false;
    
        $user_detail = [];
        $username = $this->item_name;
        
        if($this->_isValidMac($username)){
        
        }

        //Test to see if it is a Voucher
        $q_v = $this->Vouchers->find()->where(['Vouchers.name' => $username])->first();
       // print_r($q_v);
        if($q_v){
        
            $user_detail['username'] = $username;
            
            $user_detail['type']    = 'voucher';
            $user_detail['profile'] = $q_v->profile;
            $user_detail['created'] = $this->TimeCalculations->time_elapsed_string($q_v->created,false,false);
            $user_detail['status']  = $q_v->status;
            if(!(is_null($q_v->last_reject_time))){
                $user_detail['last_reject_time'] = $this->TimeCalculations->time_elapsed_string($q_v->last_reject_time,false,false);
                $user_detail['last_reject_message'] = $q_v->last_reject_message;
            }
            
            if(!(is_null($q_v->last_accept_time))){
                $user_detail['last_accept_time'] = $this->TimeCalculations->time_elapsed_string($q_v->last_accept_time,false,false);
            }
            
            if(!(is_null($q_v->data_cap))){
                $user_detail['data_cap'] = $this->Formatter->formatted_bytes($q_v->data_cap);
            }
            
            if(!(is_null($q_v->data_used))){
                $user_detail['data_used'] = $this->Formatter->formatted_bytes($q_v->data_used);
            }
            
            if(!(is_null($q_v->perc_data_used))){
                $user_detail['perc_data_used'] = $q_v->perc_data_used;
            }
            
            if(!(is_null($q_v->time_cap))){
                $user_detail['time_cap'] = $this->Formatter->formatted_seconds($q_v->time_cap);
            }
            
            if(!(is_null($q_v->time_used))){
                $user_detail['time_used'] = $this->Formatter->formatted_seconds($q_v->time_used);
            }
            
            if(!(is_null($q_v->perc_time_used))){
                $user_detail['perc_time_used'] = $q_v->perc_time_used;
            }
            $found = true;
   
        }
        
        if(!$found){
            $q_pu = $this->PermanentUsers->find()->where(['PermanentUsers.username' => $username])->first();

           // print_r($q_pu);
            if($q_pu){ 
                $user_detail['username']    = $username;
                $user_detail['type']        = 'user';
                $user_detail['profile']     = $q_pu->profile;
                $user_detail['created']     = $this->TimeCalculations->time_elapsed_string($q_pu->created,false,false);
                if(!(is_null($q_pu->last_reject_time))){
                    $user_detail['last_reject_time'] = $this->TimeCalculations->time_elapsed_string($q_pu->last_reject_time,false,false);
                    $user_detail['last_reject_message'] = $q_pu->last_reject_message;
                }
            
                if(!(is_null($q_pu->last_accept_time))){
                    $user_detail['last_accept_time'] = $this->TimeCalculations->time_elapsed_string($q_pu->last_accept_time,false,false);
                }
            
                if(!(is_null($q_pu->data_cap))){
                    $user_detail['data_cap'] = $this->Formatter->formatted_bytes($q_pu->data_cap);
                }
            
                if(!(is_null($q_pu->data_used))){
                    $user_detail['data_used'] = $this->Formatter->formatted_bytes($q_pu->data_used);
                }
            
                if(!(is_null($q_pu->perc_data_used))){                
                    $user_detail['perc_data_used'] = $q_pu->perc_data_used;
                }
            
                if(!(is_null($q_pu->time_cap))){
                    $user_detail['time_cap'] = $this->Formatter->formatted_seconds($q_pu->time_cap);
                }
            
                if(!(is_null($q_pu->time_used))){
                    $user_detail['time_used'] = $this->Formatter->formatted_seconds($q_pu->time_used);
                }
            
                if(!(is_null($q_pu->perc_time_used))){
                    $user_detail['perc_time_used'] = $q_pu->perc_time_used;
                }
                $found = true;
            
            }
        
        }   
        return $user_detail;
    }
    
    private function _getClientDetail(){
    
        $found = false;
    
        $client_detail = [];
        $nasid = $this->item_name;
        
        $this->loadModel('DynamicClients');
        
        $ent_dc = $this->{'DynamicClients'}->find()->where(['DynamicClients.nasidentifier' => $nasid])->first();
        if($ent_dc){
            $fields     = $this->{'DynamicClients'}->schema()->columns();
            foreach($fields as $field){
                $client_detail[$field] = $ent_dc->{"$field"};
            }
        
            if(!(is_null($ent_dc->last_contact))){
                $client_detail['last_contact'] = $this->TimeCalculations->time_elapsed_string($ent_dc->last_contact,false,false);
            }
            
            if($ent_dc->data_limit_active){
                $d_limit_bytes = $this->_getBytesValue($ent_dc->data_limit_amount,$ent_dc->data_limit_unit);
                $client_detail['data_cap'] = $this->Formatter->formatted_bytes($d_limit_bytes);
                if($ent_dc->data_used >0){
                    $client_detail['perc_data_used'] =  round(($ent_dc->data_used /$d_limit_bytes*100),2) ;
                    if($client_detail['perc_data_used'] > 100){
                        $client_detail['perc_data_used'] = 100;
                    }
                    
                }else{
                    $client_detail['perc_data_used'] = 0;
                }
                $client_detail['data_used'] = $this->Formatter->formatted_bytes($client_detail['data_used']);
            }
            
        } 
        return $client_detail;
    }

    private  function _isValidMac($mac){
        return (preg_match('/([a-fA-F0-9]{2}[:|\-]?){6}/', $mac) == 1);
    }
    
    private function _start_of_month($r_day,$r_hour,$r_min) {
   
        // Get the current time.
        $dt_now     = FrozenTime::now();
        $timestamp  = $dt_now->timestamp;
        
        #Get the day of the month at this moment in time
        $day_now    = $dt_now->day;
        
        //We do the follwoing if reset day is for instance 31 but the month only has 30 days (or 28 for that matter)
        $month_end = FrozenTime::now();
        $last_day_of_month = $month_end->endOfMonth()->day;
        if($r_day > $last_day_of_month){
            $r_day = $last_day_of_month;
        }
          
        $dt_reset  = FrozenTime::now()
            ->year($dt_now->year)
            ->month($dt_now->month)
            ->day($r_day)
            ->hour($r_hour)
            ->minute($r_min);
        
        if($dt_now->timestamp < $dt_reset->timestamp){  
            #We use the previous month 
            //When adding or subtracting months, if the resulting time is a date that does not exist, 
            //the result of this operation will always be the last day of the intended month.
            $dt_reset = $dt_reset->subMonth();
        }
        return $dt_reset->timestamp;  
    } 
    
     private function _getBytesValue($total_data,$unit){
    
        if(strpos($unit, 'kb') !== false){
           $total_data = $total_data * 1024; 
        }
        if(strpos($unit, 'mb') !== false){
           $total_data = $total_data * 1024 * 1024; 
        }
        if(strpos($unit, 'gb') !== false){
           $total_data = $total_data * 1024 * 1024 * 1024; 
        }
        if(strpos($unit, 'tb') !== false){
           $total_data = $total_data * 1024 * 1024 * 1024 * 1024; 
        }
           
        return $total_data;
    }  
}
