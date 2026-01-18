<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;

class FreeradiusStatsController extends AppController{ 
    protected $main_model  = 'FreeradiusStats';    
    protected $time_zone   = 'UTC'; //Default for timezone
    protected $base_search = false;
    

    public function initialize():void{  
        parent::initialize();
        $this->loadModel('FreeradiusStats');
        $this->loadModel('FreeradiusInstances');
        $this->loadModel('Timezones'); 
        $this->loadComponent('Aa');
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        $this->Authentication->allowUnauthenticated([ 'index']);        
    }    

    public function index(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
    
        //--day--
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
        
         // Always work in a single timezone
        $tz     = $this->time_zone ?: 'UTC';
        $ft_day = $ft_day->setTimezone($tz);
              
        //VERY IMPORTANT
        $this->_setTimeZone();

        //Base Search
        $this->base_search = $this->_base_search();
        
        $data   = [];
             
        if($span === 'day'){               
            $data['graph']  = $this->_getDailyGraph($ft_day);        
        }
        if($span === 'week'){               
            $data['graph']  = $this->_getWeeklyGraph($ft_day);
        }
        if($span === 'month'){               
            $data['graph']  = $this->_getMonthlyGraph($ft_day);
        }
        
        $data['instances']  = $this->_getInstances($ft_day,$span);    
        
        $formatted_day      = $ft_day->setTimezone($this->time_zone)->format('D, d M Y');
        $formatted_time     =  $ft_day->setTimezone($this->time_zone)->i18nFormat('HH:mm');
           
        $totals             = $this->_getTotals($ft_day,$span);
        $totals->date       = $formatted_day;
        $totals->time       = $formatted_time;
        $totals->timespan   = ucfirst($span);
        
        $t[] = ['id' => 1, 'objtype' => 'Authentication' , 'requests'   => $totals->access_requests];
        $t[] = ['id' => 2, 'objtype' => 'Accounting' ,     'requests'  => $totals->acct_requests];
        
        $data['polar']['totals'] = $t;       
        $data['summary']    = $totals;
            
       // $data           = ['date' => $formatted_day, 'time' => $formatted_time, 'timespan' => ucfirst($span),'acces_requests' => $result->access_requests, 'avg_rtt' => $result->responsetime];
        
        
         
       // $data['polar']['totals']    = $this->_getTotal($ft_day,$span);   


        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
    private function _getInstances($ft_day,$span){
    
        $where[] = ['FreeradiusInstances.tag' => 'main'];  
        
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
        
        $slot_start_txt = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
        $slot_end_txt   = $slot_end->i18nFormat('yyyy-MM-dd HH:mm:ss');
        
        $query = $this->FreeradiusInstances->find();
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
        array_push($where, ["modified >=" => $time_start]);
        array_push($where, ["modified <=" => $time_end]);
    
        $instances = $query->where($where)
        ->order(['FreeradiusInstances.modified DESC']) // The sort order is the opposite or VpnConnectionsController
        ->all(); 
        
        if($instances){
            $currentTime = FrozenTime::now();
            $lastItem = $instances->first();
            if($lastItem){
                $last_update = $lastItem->modified;
                $lastItem->last_contact_in_words = $last_update
                    ->setTimezone($this->time_zone)
                    ->timeAgoInWords([
                        'accuracy' => 'minute',
                        'end' => '1 day'  // after 1 day it becomes: "on 2025-01-01"
                    ]);
                 
                         
                $lastItem->open_session  = true;
                $lastItem->stale_session = true;
                              
                if ($currentTime->diffInMinutes($last_update) < 10) {
                        // difference is less than 25 minutes                   
                        $lastItem->stale_session = false;
                }
            }                
        }
                
        return $instances;    
    }
    
    
    private function _getTotals($ft_day,$span){
        $items          = [];
        $base_search    = $this->base_search;
        $where          = $base_search;
        
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
                
        $slot_start_txt = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
        $slot_end_txt   = $slot_end->i18nFormat('yyyy-MM-dd HH:mm:ss');
        
        $query = $this->FreeradiusStats->find();
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
        $q = $this->FreeradiusStats->find(); 
        $result = $q->select($this->_getFields($q))
            ->where($where)
            ->first();
        return $result;
    }
    
    private function _getDailyGraph($ft_day){
    
         // Always work in a single timezone
        $tz             = $this->time_zone ?: 'UTC';
        $ft_day         = $ft_day->setTimezone($tz);
    
        $items          = [];
        $count          = 1;
        $base_search    = $this->base_search;
        $day_end        = $ft_day->endOfDay();//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
        $slot_start     = $ft_day->startOfDay(); //Prime it 
        while($slot_start < $day_end){
        
            $slot_start_h_m     = $slot_start->i18nFormat("E\nHH:mm");
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $slot_start->addHour(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss');
            
            $where              = $base_search;
            
            $query = $this->FreeradiusStats->find();
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
            
            $slot_start     = $slot_start->addHour(1);           
            $q = $this->FreeradiusStats->find();    
            $result = $q->select($this->_getFields($q))
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
    
    private function _getWeeklyGraph($ft_day){
    
        $items          = [];
        $week_end       = $ft_day->endOfWeek();//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
        $slot_start     = $ft_day->startOfWeek(); //Prime it 
        $count          = 1;
        $base_search    = $this->base_search;
     
        while($slot_start < $week_end){
        
            $slot_start_h_m     = $slot_start->i18nFormat("eee dd MMM");
            $where              = $base_search; 
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $slot_start->addDay(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss'); //Our interval is one day
            
            $query = $this->FreeradiusStats->find();
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
            
            $slot_start         = $slot_start->addDay(1);
                      
            $q = $this->FreeradiusStats->find();    
            $result = $q->select($this->_getFields($q))
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
    
    private function _getMonthlyGraph($ft_day){
    
        $items          = [];
        $slot_start     = $ft_day->startOfMonth(); //Prime it 
        $month_end      = $ft_day->endOfMonth();//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
            
        $count          = 1;
        $base_search    = $this->base_search;
        
        while($slot_start < $month_end){
        
            $slot_start_h_m     = $slot_start->i18nFormat("dd MMM");
            $where              = $base_search; 
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $slot_start->addDay(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss'); //Our interval is one day
            
            $query = $this->FreeradiusStats->find();
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
            
            $slot_start         = $slot_start->addDay(1);
                      
            $q = $this->FreeradiusStats->find();    
            $result = $q->select($this->_getFields($q))
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
    
    private function _getFields($q){

        return [
            'access_requests' =>
                $q->func()->cast(
                    $q->func()->coalesce([
                        $q->func()->sum('FreeradiusStats.access_requests'),
                        0
                    ]),
                    'SIGNED'
                ),

            'access_accepts' =>
                $q->func()->cast(
                    $q->func()->coalesce([
                        $q->func()->sum('FreeradiusStats.access_accepts'),
                        0
                    ]),
                    'SIGNED'
                ),

            'access_rejects' =>
                $q->func()->cast(
                    $q->func()->coalesce([
                        $q->func()->sum('FreeradiusStats.access_rejects'),
                        0
                    ]),
                    'SIGNED'
                ),

            'access_challenges' =>
                $q->func()->cast(
                    $q->func()->coalesce([
                        $q->func()->sum('FreeradiusStats.access_challenges'),
                        0
                    ]),
                    'SIGNED'
                ),

            'auth_responses' =>
                $q->func()->cast(
                    $q->func()->coalesce([
                        $q->func()->sum('FreeradiusStats.auth_responses'),
                        0
                    ]),
                    'SIGNED'
                ),

            'acct_requests' =>
                $q->func()->cast(
                    $q->func()->coalesce([
                        $q->func()->sum('FreeradiusStats.acct_requests'),
                        0
                    ]),
                    'SIGNED'
                ),

            'acct_responses' =>
                $q->func()->cast(
                    $q->func()->coalesce([
                        $q->func()->sum('FreeradiusStats.acct_responses'),
                        0
                    ]),
                    'SIGNED'
                ),
        ];
    }
   
    private function _base_search(){
        $base_search[] = ['FreeradiusStats.tag' => 'main'];   
        return $base_search;
    }    
}
