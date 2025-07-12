<?php
namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Inflector;

use Cake\I18n\FrozenTime;
use Cake\I18n\Time;


class RealtimeStatsController extends AppController{
    
    protected $dynamicClientId      = 199;
    protected $permanent_user_id    = 149;
    protected $time_zone            = 'UTC'; //Default for timezone
    protected $span                 = 120;
    protected $interval             = 10;
    
    public function initialize():void{  
        parent::initialize();
        
        $this->loadModel('DynamicClientSettings');
        $this->loadModel('MikrotikPppoeStats');
        $this->loadComponent('MikrotikApi');
                 
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');  
        $this->loadComponent('Formatter'); 
    //    $this->Authentication->allowUnauthenticated([ 'userStats']);         
    }
    
    public function userStats(){
    
        $queryData  = $this->request->getQuery();
        $ifStats    = [];
        $replyData  = [];
        
        $this->_setTimeZone();
        
        if(isset($queryData['username'])){
            $mt_id = $this->_findInferfaceId($queryData['username']);
            if($mt_id){
                $ifStats = $this->_findIfStats($mt_id);
                if(isset($ifStats[0])){
                    $ifStats = $ifStats[0];
                    $ifStats = array_combine(
                        array_map(fn($key) => str_replace('-', '_', $key), array_keys($ifStats)),
                        $ifStats
                    );
                }
                if(isset($ifStats['.id'])){
                    $ifStats['mt_id'] = $ifStats['.id'];                  
                }
                $ifStats['permanent_user_id'] = $this->permanent_user_id;
                $ifStats['name'] = str_replace('<', '', $ifStats['name']);
                $ifStats['name'] = str_replace('>', '', $ifStats['name']);
                $this->_addMikrotikStats($ifStats);
            }
        }
        
        $replyData['last_stats'] = $ifStats;
        
        $chartData  = $this->_getChartData($this->permanent_user_id);  
              
        $replyData['chart'] = $chartData;
     
        $this->set([
            'data'      => $replyData,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);      
    }
    
    private function _findInferfaceId($username){  
    
        //Temp
        //$this->request->getSession()->delete('Mikrotik.ifId');
             
        if(!$this->request->getSession()->read('Mikrotik.ifId')){
            $mt_data 	= $this->_getMtData($this->dynamicClientId);
            $interfaces = $this->MikrotikApi->getPppoeInterfaces($mt_data);
            if($interfaces){
                foreach($interfaces as $interface){
                    if(preg_match("/^<pppoe-$username.*>$/", $interface['name'])){
                        $this->request->getSession()->write('Mikrotik.ifId', $interface['.id']);
                        break;
                    }
                }
            }           
        }        
        return $this->request->getSession()->read('Mikrotik.ifId');       
    }
    
    private function _findIfStats($ifId){
        $mt_data 	= $this->_getMtData($this->dynamicClientId);
        $ifStats    = $this->MikrotikApi->getPppoeIfStats($mt_data,$ifId); 
        if($ifStats){
            return $ifStats;
        }else{
            return false;
        } 
    }
        
    private function _getMtData($id = false){
    
    	if(!$id){
    		$cquery     = $this->request->getQuery();
        	$id 		= $cquery['id'];   	
    	}
         
        $q_r 		= $this->{'DynamicClientSettings'}->find()->where(['DynamicClientSettings.dynamic_client_id' => $id])->all();            
        $mt_data 	= [];
        foreach($q_r as $s){    
			if(preg_match('/^mt_/',$s->name)){
				$name = preg_replace('/^mt_/','',$s->name);
				$value= $s->value;
				if($name == 'port'){
					$value = intval($value); //Requires integer 	
				}
				$mt_data[$name] = $value;				
			}			        
        }
        
        if($mt_data['proto'] == 'https'){
        	$mt_data['ssl'] = true;
        	if($mt_data['port'] ==8728){
        		//Change it to Default SSL port 8729
        		$mt_data['port'] = 8729;
        	}
        }         
        unset($mt_data['proto']);       
        return $mt_data;  
    }
    
    private function _addMikrotikStats($ifStats){  
        $entMtStat = $this->MikrotikPppoeStats->newEntity($ifStats);
        $this->MikrotikPppoeStats->save($entMtStat);    
    }
    
    private function _getChartData($user_id){
        $items  = [];
        $start = 1;
        
        if($this->request->getQuery('span')){
            $this->span = $this->request->getQuery('span');
        }
        if($this->request->getQuery('interval')){
            $this->interval = $this->request->getQuery('interval');
        }
        
        $ft_now     = FrozenTime::now();
        $slot_start = $ft_now->subSecond($this->span);        
        $previous   = null;
        
        while($slot_start < $ft_now){
            $slot_start_h_m = $slot_start->i18nFormat("E\nHH:mm:ss",$this->time_zone);
            $slot_end       = $slot_start->addSecond($this->interval)->subSecond(1);
            
            $entStat    = $this->MikrotikPppoeStats->find()
                ->select(['tx_byte','rx_byte'])
                ->where([
                    'MikrotikPppoeStats.permanent_user_id'  => $user_id,
                    'MikrotikPppoeStats.modified >='        => $slot_start,
                    'MikrotikPppoeStats.modified <='        => $slot_end 
                ])
                ->first();
            if($entStat){
                $rx_delta = 0;
                $tx_delta = 0;                
                if($previous){
                    $rx_delta = $entStat->rx_byte - $previous->rx_byte;
                    $tx_delta = $entStat->tx_byte - $previous->tx_byte;  
                }
                $previous = $entStat;
            }else{          
                $rx_delta = 0;
                $tx_delta = 0;
            }
            
            $slot_start = $slot_start->addSecond($this->interval);
            array_push($items, ['id' => $start, 'time_unit' => $slot_start_h_m, 'rx_delta' => $rx_delta, 'tx_delta' => $tx_delta,'slot_start_txt' => $slot_start_h_m]);
            $start++;
        }
        return $items;    
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
    
}
