<?php

namespace App\Controller;


//use Cake\I18n\Time;
use Cake\I18n\FrozenTime;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class DataUsagesNewController extends AppController {

    public $main_model              = 'DataUsage';
    public $base                    = "Access Providers/Controllers/DataUsage/";    
    protected   $type               = false;
    protected   $item_name          = false;
    protected   $base_search        = false;
    protected   $data_limit_active  = false;
    protected   $start_of_month     = 1;
    protected   $time_zone          = 'UTC'; //Default for timezone
    protected   $mac                = false;
    protected   $dailies_stopped    = false;
    protected   $top_amount         = 20;

    protected $fields   = [
        'data_in'       => 'sum(acctinputoctets)',
        'data_out'      => 'sum(acctoutputoctets)',
        'data_total'    => 'sum(acctoutputoctets) + sum(acctinputoctets)'
    ];
    
    protected   $realm              = '** ALL REALMS **';
    
    public function initialize():void
    {
        parent::initialize();
        $this->loadModel('UserStats');
        $this->loadModel('UserStatsDailies');
        $this->loadModel('UserSettings');
        $this->loadModel('Vouchers');
        $this->loadModel('PermanentUsers');
        $this->loadModel('Devices');
        $this->loadModel('DynamicClients');
        $this->loadModel('Timezones');

        $this->loadComponent('TimeCalculations');
        $this->loadComponent('Formatter');
        $this->loadComponent('MacVendors');
        $this->loadComponent('Aa');
    }
    
    public function usageForRealmNew(){
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){   
            return;
        }
    
        $data   = [];   
        $day    = $this->request->getQuery('day'); //day will be in format 'd/m/Y'
        
        if($day){
            $ft_day = FrozenTime::createFromFormat('d/m/Y',$day);     
        }else{
            $ft_day = FrozenTime::now();
        }
           
        //--span--
        $span = 'day'; //default
        if($this->request->getQuery('span')){
            $span = $this->request->getQuery('span');
        }
             
        //--VERY IMPORTANT--
        $this->_setTimeZone();
                 
        //--Historical or not-- (GUI will display active sessions list if NOT historical)
        $historical = true; 
        $tz_adjusted= FrozenTime::createFromTimestamp($ft_day->timestamp,$this->time_zone);
        //print_r($tz_adjusted->i18nFormat('yyyy-MM-dd HH:mm:ss'));
        if($tz_adjusted->isToday()||$tz_adjusted->isTomorrow()){
            $historical = false;
        }
               
                
        //--Base Search--
        $this->base_search = $this->_base_search();
        
        //--See if there is a dailies timestamp--
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'UserStatsDailiesStoppedAt'])->first(); 
        
        if($e_us){
            $this->dailies_stopped = FrozenTime::createFromTimestamp($e_us->value);
        }
       // print_r($this->dailies_stopped);
       
       //Feedback on requested query     
        $data['query_info']['date']         = $ft_day->i18nFormat('yyyy-MM-dd');
        $data['query_info']['date_human']   = $ft_day->timeAgoInWords();
        $data['query_info']['type']         = $this->type;
        $data['query_info']['historical']   = $historical;
        $data['query_info']['span']         = $span;
        $data['query_info']['timezone']     = $this->time_zone;
             
       
        $data['graph']      = $this->_getGraph($ft_day,$span);
        $data['summary']    = $this->_getSummary($ft_day,$span);   
        $data['top']        = $this->_getTop($ft_day,$span);
      
        //$data['summary']['historical'] = $historical;
        if(!$historical){
            $data['summary']['online'] = $this->_getOnline();
        }
        
        if(($this->type == 'user')||($this->type == 'device')){    
            $data['user_detail']        = $this->_getUserDetail();
        }
        
    
        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);     
    }
       
    public function activeSessions(){
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){   
            return;
        }
    
        if ($this->request->getQuery('realm_id')){
            if($this->request->getQuery('realm_id') == -1){            
                $this->set([
                    'items'      => [],
                    'metaData'   => [
                        'totalCount' => 0
                    ],
                    'success'    => true,
                    'totalCount' => 0
                ]);
                $this->viewBuilder()->setOption('serialize', true); 
                return;          
            }   
        }
                
       // $this->loadModel('RadacctHistories');
       // $query  = $this->RadacctHistories->find();
        
        $this->loadModel('Radaccts');
        $query  = $this->Radaccts->find();
        
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
               
        if ($this->request->getQuery('limit')) {
            $limit  = $this->request->getQuery('limit');
            $page   = $this->request->getQuery('page');
            $offset = $this->request->getQuery('start');
        }
                
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);
        
        //-----Sort order----
        $sort   = 'acctstarttime';
        $dir    = 'DESC'; //Newest first
        
        if ($this->request->getQuery('sort')) {
            $sort_raw = $this->request->getQuery('sort');
            if($sort_raw == 'online'){
                $sort = 'acctstarttime';
            }else{
                $sort = $sort_raw;
            }
            $dir = $this->request->getQuery('dir');        
        }
        $query->order([$sort => $dir]);
        //----END Sort Order ---
        
        //--Base Search--
        $this->base_search = $this->_base_search();
        
        $where = [
            $this->base_search,
            'Radaccts.acctstoptime IS NULL'
        ];
        
                
        $filter_flag = false;
        if ($this->request->getQuery('filter')) {
            $where = $this->_addFilter($where); 
            $filter_flag = true;    
        }
        
        $active_sessions = [];
              
        $query->where($where)
            ->select(['radacctid','callingstationid', 'acctstarttime', 'username']);
                
        $total  = $query->count();      
        $q_acct = $query->all();
        
        
        $active_total = 0;
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
            $active_total++;
        }
    
        $this->set([
            'items'      => $active_sessions,
            'metaData'   => [
                'totalCount' => $total,
                'filterFlag' => $filter_flag
            ],
            'success'    => true,
            'totalCount' => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);     
    
    }
    
    private function _addFilter($where){   
        $filter = json_decode($this->request->getQuery('filter')); 
        foreach($filter as $f){ 
            //Strings (like)
            if($f->operator == 'like'){          
                array_push($where,[$f->property." LIKE" => '%'.$f->value.'%']);    
            }
            if(($f->operator == 'gt')||($f->operator == 'lt')||($f->operator == 'eq')){ 
                          
                $col = 'acctstarttime';                
                if($f->operator == 'eq'){
                    array_push($where,array("DATE($col)" => $f->value));
                }

                if($f->operator == 'lt'){
                    array_push($where,array("DATE($col) <" => $f->value));
                }
                if($f->operator == 'gt'){
                    array_push($where,array("DATE($col) >" => $f->value));
                }
                
            }          
        }     
        return $where;     
    }
    
    private function _getOnline(){   
        $base_search    = $this->base_search;  
        $this->loadModel('Radaccts');      
        $online   = $this->Radaccts->find()
            ->where([
                $base_search,
                'Radaccts.acctstoptime IS NULL'
            ])
            ->count();       
        return $online;    
    }
        
    private function _getGraph($ft_day, $span){
  
        $items          = [];
        $count          = 1;
        $base_search    = $this->base_search;
        
        // Always work in a single timezone #FIXME NOT NEEDED HERE since it them messes with the table selection
        //$tz             = $this->time_zone ?: 'UTC';
        //$ft_day         = $ft_day->setTimezone($tz);
        
        if($span === 'day'){
            $slot_start = $ft_day->startOfDay(); 
            $slot_end   = $ft_day->endOfDay();
        }
        if($span === 'week'){
            $slot_start = $ft_day->startOfWeek();
            $slot_end   = $ft_day->endOfWeek();         
        }
        if($span === 'month'){
            $slot_start = $ft_day->startOfMonth(); //Prime it 
            $slot_end   = $ft_day->endOfMonth();//->i18nFormat('yyyy-MM-dd HH:mm:ss');             
        }
               
        while($slot_start < $slot_end){
        
            $table              = 'UserStats';     
            $slot_start_h_m     = $slot_start->i18nFormat("E\nHH:mm");
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            if($span === 'week'){
                $slot_start_h_m     = $slot_start->i18nFormat("eee dd MMM");
            }           
            if($span === 'month'){
                $slot_start_h_m     = $slot_start->i18nFormat("dd MMM"); 
            }
            
            if($span === 'day'){
                $slot_end_txt   = $slot_start->addHour(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss');
                $slot_start     = $slot_start->addHour(1);
            }else{
            
                //Week and month we can use Dailies :-)
                $slot_end_txt   = $slot_start->addDay(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss'); //Our interval is one day              
                //Logic to determine which table to use   
                if($this->dailies_stopped ){
                    if($this->dailies_stopped > $slot_start){
                        $table = 'UserStatsDailies';
                    }else{
                        $table = 'UserStats';
                    }
                }                
                
                $slot_start     = $slot_start->addDay(1);
            }
                    
            $where              = $base_search;
                       
            $query = $this->{$table}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
                 
            array_push($where, ["created >=" => $time_start]);
            array_push($where, ["created <=" => $time_end]);          
            $q = $this->{$table}->find();    
            $result = $q->select($this->fields)
                ->where($where)
                ->first();            

            if($result){
                $result->time_unit  = $slot_start_h_m;
                $result->id         = $count;
                array_push($items, $result);
            }
            $count++;
        }
        return(['items' => $items]);    
    
    }
    
    private function _getSummary($ft_day,$span){
          
        $total          = $this->_getTotal($ft_day,$span);   
        $formatted_day  =  $ft_day->setTimezone($this->time_zone)->format('D, d M Y');
        $formatted_time =  $ft_day->setTimezone($this->time_zone)->i18nFormat('HH:mm');
        //$formatted_day  =  $ft_day->format('D, d M Y');     
        $data           = [
            'date'          => $formatted_day,
            'time'          => $formatted_time,
            'type'          => $this->type,
            'item_name'     => $this->item_name, 
            'timespan'      => ucfirst($span),
            'data_in'       => $total['data_in'],
            'data_out'      => $total['data_out'],
            'data_total'    => $total['data_total']
        ];
        
        if($this->type == 'realm'){ 
            $data['realm'] = $this->realm;
        }
        
        return $data;  
    }
        
    private function _setTimezone(){ 
        //New way of doing things by including the timezone_id
        if($this->request->getQuery('timezone_id') != null){
            $tz_id = $this->request->getQuery('timezone_id');
            $ent = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
            if($ent){
                $this->time_zone = $ent->name;
            }
        }
    }
     
    private function _getTotal($ft_day,$span){
    
        $totals         = [];
        $where          = $this->base_search;
        
        $table          = 'UserStats'; //By default use this table
        $mix_table      = false;
        
        // Always work in a single timezone
        $tz     = $this->time_zone ?: 'UTC';
        $ft_day = $ft_day->setTimezone($tz);
            
        if($span == 'day'){
        
            if($this->dailies_stopped ){
                if($ft_day->endOfDay() < $this->dailies_stopped ){
                    $table          = 'UserStatsDailies';
                }
            }
            $slot_start_txt     = $ft_day->startOfDay()->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $ft_day->endOfDay()->i18nFormat('yyyy-MM-dd HH:mm:ss');
        }
           
        if ($span === 'week') {
           
            // Normalize reference points
            $weekStart = $ft_day->startOfWeek(); // 00:00:00 of week start in $tz
            $weekEnd   = $ft_day->endOfWeek();   // 23:59:59 of week end in $tz

            // Defaults: the overall slot we are answering for
            $slot_start_txt = $weekStart->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt   = $weekEnd->i18nFormat('yyyy-MM-dd HH:mm:ss');
            
            if($this->dailies_stopped ){

                // Normalize dailies_stopped to same tz (clone to avoid side-effects)
                $ds = $this->dailies_stopped->setTimezone($tz);

                // CASE 1: No dailies for this week yet (stopped BEFORE the week starts)
                // Entire answer should come from live/aggregate table
                if ($ds < $weekStart) {
                    $table = 'UserStats';
                }

                // CASE 2: The week is entirely in the past with dailies complete
                // (stopped AT or AFTER weekEnd) → use dailies only
                if ($ds >= $weekEnd) {
                    $table = 'UserStatsDailies';
                }
                
                // CASE 3: Dailies stopped after start of week BUT before end of week
                if (($ds > $weekStart) && ($ds < $weekEnd)) {
                    $mix_table = true;
                    $daily_slot_start_txt   = $slot_start_txt;
                    $daily_slot_end_txt     = $this->dailies_stopped->i18nFormat('yyyy-MM-dd HH:mm:ss');
                    $slot_start_txt         = $this->dailies_stopped->i18nFormat('yyyy-MM-dd HH:mm:ss');
                    $slot_end_txt           = $slot_end_txt;
                }
            }            
        }
        
        if ($span === 'month') {           
            // Normalize reference points
            $monthStart = $ft_day->startOfMonth(); // 00:00:00 of week start in $tz
            $monthEnd   = $ft_day->endOfMonth();   // 23:59:59 of week end in $tz

            // Defaults: the overall slot we are answering for
            $slot_start_txt = $monthStart->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt   = $monthEnd->i18nFormat('yyyy-MM-dd HH:mm:ss');
            
            if($this->dailies_stopped ){

                // Normalize dailies_stopped to same tz (clone to avoid side-effects)
                $ds = $this->dailies_stopped->setTimezone($tz);

                // CASE 1: No dailies for this month yet (stopped BEFORE the month starts)
                // Entire answer should come from live/aggregate table
                if ($ds < $monthStart) {
                    $table = 'UserStats';
                }

                // CASE 2: The month is entirely in the past with dailies complete
                // (stopped AT or AFTER monthEnd) → use dailies only
                if ($ds >= $monthEnd) {
                    $table = 'UserStatsDailies';
                }
                
                // CASE 3: Dailies stopped after start of month BUT before end of month
                if (($ds > $monthStart) && ($ds < $monthEnd)) {
                
                    $mix_table = true;
                    $daily_slot_start_txt   = $slot_start_txt;
                    $daily_slot_end_txt     = $this->dailies_stopped->i18nFormat('yyyy-MM-dd HH:mm:ss');
                    $slot_start_txt         = $this->dailies_stopped->i18nFormat('yyyy-MM-dd HH:mm:ss');
                    $slot_end_txt           = $slot_end_txt;
                }
            }            
        }
                      
        if($mix_table){      
            $totals['data_in']      = 0;
            $totals['data_out']     = 0;
            $totals['data_total']   = 0;
            
            //First lot from user_stats_dailies 
            $where_dailies = $where;      
            
            $query = $this->{'UserStatsDailies'}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$daily_slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);

            $time_end = $query->func()->CONVERT_TZ([
                "'$daily_slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]); 
            
            
            array_push($where_dailies, ["created >=" => $time_start]);     
            array_push($where_dailies, ["created <" => $time_end]);
                        
            $q_r_dailies = $this->{'UserStatsDailies'}->find()->select($this->fields)->where($where_dailies)->first();
            if($q_r_dailies){
                $totals['data_in']      = $q_r_dailies->data_in;
                $totals['data_out']     = $q_r_dailies->data_out;
                $totals['data_total']   = $q_r_dailies->data_total;
            }
            
            $query = $this->{'UserStats'}->find();
            $time_s = $query->func()->CONVERT_TZ([
                "'$slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);

            $time_e = $query->func()->CONVERT_TZ([
                "'$slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]); 
            
            //Rest from user_stats
            array_push($where, ["created >"   => $time_s]); 
            array_push($where, ["created <="  => $time_e]);
           
            $q_r = $this->{'UserStats'}->find()->select($this->fields)->where($where)->first();
            if($q_r){
                $totals['data_in']      = $totals['data_in'] + $q_r->data_in;
                $totals['data_out']     = $totals['data_out'] + $q_r->data_out;
                $totals['data_total']   = $totals['data_total'] +$q_r->data_total;
            }       
        
        }else{
        
            $query = $this->{$table}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);

            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]); 
        
            array_push($where, ["created >=" => $time_start]); 
            array_push($where, ["created <=" => $time_end]);
        
            $q_r = $this->{$table}->find()->select($this->fields)->where($where)->first();
            if($q_r){
                $totals['data_in']      = $q_r->data_in;
                $totals['data_out']     = $q_r->data_out;
                $totals['data_total']   = $q_r->data_total;
            } 
        } 
        
        $totals['type']         = $this->type;
        $totals['item_name']    = $this->item_name;      
        return $totals;    
    }

    private function _getTop($ft_day,$span){
    
        $top_ten        = [];
        $limit          = $this->top_amount;
        $where          = $this->base_search;
        $table          = 'UserStats'; //By default use this table
        $mix_table      = false;
        
        // Always work in a single timezone
        $tz             = $this->time_zone ?: 'UTC';
        $ft_day         = $ft_day->setTimezone($tz);
        
        if(($this->type == 'user')||($this->type == 'device')){ //Now we have to find the realm this user /device belongs to
            $ent_us = $this->{$table}->find()
                ->where(['username' => $this->item_name])
                ->order(['created' => 'DESC'])
                ->first();
            if($ent_us){
                $where = ['realm' => $ent_us->realm]; 
            }
        }
                 
        if($span == 'day'){    
            if($this->dailies_stopped ){
                if($ft_day->endOfDay() < $this->dailies_stopped ){
                    $table          = 'UserStatsDailies';
                }
            }
            $slot_start     = $ft_day->startOfDay()->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end       = $ft_day->endOfDay()->i18nFormat('yyyy-MM-dd HH:mm:ss');
        }
         
        if ($span === 'week') {
           
            // Normalize reference points
            $weekStart = $ft_day->startOfWeek(); // 00:00:00 of week start in $tz
            $weekEnd   = $ft_day->endOfWeek();   // 23:59:59 of week end in $tz

            // Defaults: the overall slot we are answering for
            $slot_start = $weekStart->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end   = $weekEnd->i18nFormat('yyyy-MM-dd HH:mm:ss');
            
            if($this->dailies_stopped ){

                // Normalize dailies_stopped to same tz (clone to avoid side-effects)
                $ds = $this->dailies_stopped->setTimezone($tz);
                

                // CASE 1: No dailies for this week yet (stopped BEFORE the week starts)
                // Entire answer should come from live/aggregate table
                if ($ds < $weekStart) {
                    $table = 'UserStats';
                }

                // CASE 2: The week is entirely in the past with dailies complete
                // (stopped AT or AFTER weekEnd) → use dailies only
                if ($ds >= $weekEnd) {
                    $table = 'UserStatsDailies';
                }
                
                // CASE 3: Dailies stopped after start of week BUT before end of week
                if (($ds > $weekStart) && ($ds < $weekEnd)) {
                    $mix_table = true;
                    $daily_slot_start   = $slot_start;
                    $daily_slot_end     = $this->dailies_stopped->i18nFormat('yyyy-MM-dd HH:mm:ss');
                    $slot_start         = $this->dailies_stopped->i18nFormat('yyyy-MM-dd HH:mm:ss');
                    $slot_end           = $slot_end;
                }
            }            
        }
        
        if ($span === 'month') {           
            // Normalize reference points
            $monthStart = $ft_day->startOfMonth(); // 00:00:00 of week start in $tz
            $monthEnd   = $ft_day->endOfMonth();   // 23:59:59 of week end in $tz

            // Defaults: the overall slot we are answering for
            $slot_start = $monthStart->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end   = $monthEnd->i18nFormat('yyyy-MM-dd HH:mm:ss');
            
            if($this->dailies_stopped ){

                // Normalize dailies_stopped to same tz (clone to avoid side-effects)
                $ds = $this->dailies_stopped->setTimezone($tz);

                // CASE 1: No dailies for this month yet (stopped BEFORE the month starts)
                // Entire answer should come from live/aggregate table
                if ($ds < $monthStart) {
                    $table = 'UserStats';
                }

                // CASE 2: The month is entirely in the past with dailies complete
                // (stopped AT or AFTER monthEnd) → use dailies only
                if ($ds >= $monthEnd) {
                    $table = 'UserStatsDailies';
                }
                
                // CASE 3: Dailies stopped after start of month BUT before end of month
                if (($ds > $monthStart) && ($ds < $monthEnd)) {
                    $mix_table = true;
                    $daily_slot_start   = $slot_start;
                    $daily_slot_end     = $this->dailies_stopped->i18nFormat('yyyy-MM-dd HH:mm:ss');
                    $slot_start         = $this->dailies_stopped->i18nFormat('yyyy-MM-dd HH:mm:ss');
                    $slot_end           = $slot_end;
                }
            }            
        }
                             
        $fields = $this->fields;
        array_push($fields, 'username');      
          
        if($mix_table){                
            //First lot from user_stats_dailies 
            $where_dailies = $where;           
            $query = $this->{'UserStatsDailies'}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$daily_slot_start'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$daily_slot_end'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            array_push($where_dailies, ["created >=" => $time_start]);
            array_push($where_dailies, ["created <" => $time_end]); 
            
            //print_r($where_dailies);
                         
            $q_r_dailies = $this->{'UserStatsDailies'}->find()->select($fields)
                ->where($where_dailies)
                ->order(['data_total' => 'DESC'])
                ->group(['username'])
                ->limit($limit)
                ->all();
                
            if($q_r_dailies){
                $id = 1;
                foreach($q_r_dailies as $tt){
                    $username   = $tt->username;
                    array_push($top_ten, 
                        [
                            'id'            => $id,
                            'username'      => $username,
                            'data_in'       => $tt->data_in,
                            'data_out'      => $tt->data_out,
                            'data_total'    => $tt->data_total,
                        ]
                    );
                    $id++;
                } 
            }
                      
            //Rest from user_stats
            $query = $this->{'UserStats'}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            array_push($where, ["created >=" => $time_start]);
            array_push($where, ["created <=" => $time_end]); 
            
            $q_r = $this->{'UserStats'}->find()->select($fields)
                ->where($where)
                ->order(['data_total' => 'DESC'])
                ->group(['username'])
                ->limit($limit)
                ->all();
                
            foreach($q_r as $tt){
                $username   = $tt->username;
                $count      = 0;
                $not_found  = true;
                foreach($top_ten as $tt_daily){                
                    if($tt_daily['username'] == $username){
                        $not_found = false;
                        $top_ten[$count]['data_in'] = $top_ten[$count]['data_in']+$tt->data_in;
                        $top_ten[$count]['data_out'] = $top_ten[$count]['data_out']+$tt->data_out;
                        $top_ten[$count]['data_total'] = $top_ten[$count]['data_total']+$tt->data_total;
                    }
                    $count++;
                }
                //Add if not found (even if it means we'll end up with more than 10 for now)
                if($not_found){
                    array_push($top_ten, 
                        [
                            'id'            => $id,
                            'username'      => $username,
                            'data_in'       => $tt->data_in,
                            'data_out'      => $tt->data_out,
                            'data_total'    => $tt->data_total,
                        ]
                    );
                    $id++;
                }           
            }   
        
        }else{
        
            $query = $this->{$table}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            array_push($where, ["created >=" => $time_start]);
            array_push($where, ["created <=" => $time_end]);
              
            $q_r = $this->{$table}->find()->select($fields)
                ->where($where)
                ->order(['data_total' => 'DESC'])
                ->group(['username'])
                ->limit($limit)
                ->all();
        
            $id = 1;
            foreach($q_r as $tt){
                $username   = $tt->username;
                array_push($top_ten, 
                    [
                        'id'            => $id,
                        'username'      => $username,
                        'data_in'       => $tt->data_in,
                        'data_out'      => $tt->data_out,
                        'data_total'    => $tt->data_total,
                    ]
                );
                $id++;
            } 
        } 
        return $top_ten;
    }
           
    private function _base_search(){

        $type               = $this->request->getQuery('type') ?? 'realm'; //Realm is the default
        $cloud_id           = $this->request->getQuery('cloud_id');
        $username           = $this->request->getQuery('username');
        $cloud_id           = $this->request->getQuery('cloud_id');        
        $this->item_name    = $username;
        
        $base_search        = [];
        $this->type         = $type;
              
        //-------- REALMS ----------
        if($type == 'realm'){       
            $this->loadModel('Realms');
            $realm_id  = $this->request->getQuery('username') ?? 0; //Realm is the default        
            //Get the data form ALL the realms for this cloud id
            if($realm_id == 0){
                $realm_list = [];
                $el_realms = $this->Realms->find()->where(['Realms.cloud_id' => $cloud_id])->all();
                foreach($el_realms as $r){
                    array_push($realm_list,$r->name);
                }
                //Override if there is a reduced list
                $apRealmList  = $this->Aa->realmCheck(true);
              	if($apRealmList){
              	    $realm_list = $apRealmList;
              	}                
                array_push($base_search, ['realm IN' => $realm_list]);                 
            }
            
            //Thisa is for a specific realm (make sure it is a valid ID)
            if($realm_id > 0){
                $q_r = $this->Realms->find()->where(['Realms.id' => $realm_id])->first();                          
                if($q_r){ 
                    $realm_name = $q_r->name;
                    $this->realm = $realm_name;
                    array_push($base_search, ['realm' => $realm_name]);
                }
            }             
        }
        //------ END REALMS -------
        
        //Permanent users an vouchers
        if(($type == 'permanent')||($type == 'voucher')||($type == 'user')||($type == 'activity_viewer')){
            array_push($base_search, ['username' => $username]);
        }
        //Devices
        if($type == 'device'){
            $this->mac = $this->request->getQuery('mac');
            array_push($base_search, ['callingstationid' => $this->mac,'username' => $username]);
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
        
        if($this->type == 'device'){
        
            $device_history = [];
            $id = 1;
        
            $ent_us = $this->UserStats->find()
                ->select(['nasidentifier'])
                ->distinct(['nasidentifier'])
                ->where($this->base_search)
                ->all();
                
            foreach($ent_us as $us){
                $clean_where = $this->base_search;
                array_push($clean_where,["nasidentifier" =>$us->nasidentifier]);
                $q_r = $this->UserStats->find()
                    ->select(['created'])
                    ->where($clean_where)
                    ->order(['created' => 'DESC'])
                    ->first();
                    
                $q_c = $this->DynamicClients->find()->where(['DynamicClients.nasidentifier' => $us->nasidentifier])->first();
                $nasname = "UNKNOWN";
                if($q_c){
                    $nasname = $q_c->name;
                }
                    
                array_push($device_history,[
                    'id'                => $id,
                    'nasname'           => $nasname,
                    'nasidentifier'     => $us->nasidentifier, 
                    'last_seen'         => $q_r->created,
                    'last_seen_human'   => $q_r->created->timeAgoInWords()
                ]);
                  
                $id++;  
            }
        
            $user_detail['type']    =  'device';
            $user_detail['mac']     = $this->mac; 
            $user_detail['vendor']  = $this->MacVendors->vendorFor($this->mac);
            $user_detail['device_history'] =  $device_history; 
        }
           
        return $user_detail;
    }
    
    private  function _isValidMac($mac){
        return (preg_match('/([a-fA-F0-9]{2}[:|\-]?){6}/', $mac) == 1);
    }
       
}
