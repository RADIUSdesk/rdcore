<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;
use Cake\Core\Configure\Engine\PhpConfig;

class RdClientsController extends AppController {

    protected $main_model = 'UserStats';
    protected  $fields = [
        'data_in' => 'sum(UserStats.acctinputoctets)',
        'data_out' => 'sum(UserStats.acctoutputoctets)',
        'total' => 'sum(UserStats.acctoutputoctets)+ sum(UserStats.acctinputoctets)',
    ];
  
    public function initialize(){
        parent::initialize();
        $this->loadModel('Radaccts');
        $this->loadModel('PermanentUsers');
        $this->loadModel('Vouchers');
        $this->loadModel('Radchecks');
        $this->loadModel('DynamicClients');
        $this->loadModel('UserStats');
        $this->loadModel('Realms');
        $this->loadModel('Timezones');
        
        $this->loadComponent('Counters');
        $this->loadComponent('GridFilter');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('Formatter'); 
    }
    
    //--Graphs--
    public function getUsageGraph(){
    
          //$day    = '2019-10-25'; //Temp value
        $now    = FrozenTime::now(); 
        $day    = $now->year.'-'.$now->month.'-'.$now->day;  
        $span   = 'daily';      //Can be daily weekly or monthly
       
        if(null !== $this->request->getQuery('day')){
            //Format will be: 2013-09-18T00:00:00
            $pieces = explode('T',$this->request->getQuery('day'));
            $day = $pieces[0];
        }

        if(null !== $this->request->getQuery('span')){
            $span = $this->request->getQuery('span');
        }

        $ret_info = [];

        //Daily Stats
        if($span == 'daily'){
            $ret_info   = $this->_getDaily($day);
        }

        //Weekly
        if($span == 'weekly'){
           $ret_info    = $this->_getWeekly($day);
        }

        //Monthly
        if($span == 'monthly'){
            $ret_info    = $this->_getMonthly($day);  
        }

        if($ret_info){
            $this->set([
                'items'         => $ret_info['items'],
                'success'       => true,
                //This is actually the correct way / place for meta-data
                'metaData'      => [
                    'totalIn'       => $ret_info['total_in'],
                    'totalOut'      => $ret_info['total_out'],
                    'totalInOut'    => $ret_info['total_in_out'],
                ],
                'totalIn'       => $ret_info['total_in'],
                'totalOut'      => $ret_info['total_out'],
                'totalInOut'    => $ret_info['total_in_out'],
                '_serialize'    => ['items','totalIn','totalOut', 'totalInOut','metaData','success']
            ]);
        }else{
            $this->set([
                'success'       => false,
                '_serialize'    => ['success']
            ]);
        }
        
    }

	//---- Return the usage for a user/voucher
	public function getUsage(){
	
		if($this->request->getQuery('username') == null){
		    $this->set([
                'success'   => false,
                'message'   => ['message' => "Require a valid username in the query string"],
                '_serialize' => ['success','message']
            ]);
            return; 
		}

		$username 	= $this->request->getQuery('username');
		
		$found_type = 'unknown'; //default
		$type       = 'unknown';
		if($this->request->getQuery('type')){
		    $type = $this->request->getQuery('type');
		}
		
		if($this->request->getQuery('realm_id')){
		    $ent_r = $this->Realms->find()->where(['Realms.id' => $this->request->getQuery('realm_id')])->first();
		    if($ent_r){
		        if($ent_r->suffix !== ''){
		            $suffix = $ent_r->suffix;
		            if(($ent_r->suffix_permanent_users)&&($type == 'user')){
		                if(!(preg_match("/.+@$suffix$/",$username))){
		                    $username = $username.'@'.$suffix;
		                }
		            }
		            if(($ent_r->suffix_vouchers)&&($type == 'voucher')){
		                if(!(preg_match("/.+@$suffix$/",$username))){
		                    $username = $username.'@'.$suffix;
		                }
		            }
		        }
		    }
		}

        $q_r	    = $this->Radchecks->find()->where(['Radchecks.username' => $username,'Radchecks.attribute' => 'Rd-User-Type'])->first();
   
        $success    = false;
        $message    = 'User / Voucher Not Found';
		if($q_r){
		    $found_type = $q_r->value;
		}

        $items = [];

		if($found_type == 'user'){
		    $success = true;
			$items = $this->_detail_for_permanent_user($username);
		}

		if($found_type == 'voucher'){
		    $success = true;
		    $items = $this->_detail_for_voucher($username);
		}
		
		$items['type'] = $type;

		$this->set([
            'success'   => $success,
            'data'      => $items,
            'message'   => $message,
            '_serialize' => ['success','data','message']
        ]);

	}

    private function _voucher_status_check($id){

        //Find the count of this username; if zero check if voucher; if voucher change status to 'new';
        $q_r = $this->{'Radaccts'}->find()->contain(['Radchecks'])->where(['Radaccts.radacctid' => $id])->first();
        if($q_r){
            $user_type = 'unknown';
            $un = $q_r->username;
            //Get the user type
            if(count($q_r->radchecks) > 0){
                foreach($q_r->radchecks as $rc){
                    if($rc->attribute == 'Rd-User-Type'){
                        $user_type = $rc->value;
                    }
                }
            }
            //Check if voucher
            if($user_type == 'voucher'){
                $this->loadModel('Vouchers');

                $count = $this->{'Radaccts'}->find()->where(['Radaccts.username' => $un])->count();
                if($count == 1){
                    $qr = $this->Vouchers->find()->where(['Vouchers.name' => $un])->first();
                    if($qr){
                        $dseries = [];
                        $dseries['id'] = $qr->id;
                        $dseries['status'] = 'new';
                        $dseries['perc_data_used'] = null;
                        $dseries['perc_time_used'] = null;

                        $voucherEntity = $this->Vouchers->newEnity($dseries);
                        $this->Vouchers->save($voucherEntity);

                    }
                }
            }
        }
    }

	private function _find_user_profile($username){
        $this->loadModel('Radchecks');
        $profile = false;
        $q_r = $this->Radchecks->find()->where(['Radchecks.username' => $username,'Radchecks.attribute' => 'User-Profile'])->first();
        if($q_r){
            $profile = $q_r->value;
        }
        return $profile;
    }
    
    private function _detail_for_permanent_user($username){
    
        $entity     = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.username' => $username])->first();
        $items      = [];
        
        $fields     = $this->{'PermanentUsers'}->schema()->columns();
        
        foreach($fields as $i){
            if($entity->{$i} !== null){
                $items[$i] = $entity->{$i};
            }
        }
        
        $new_entry = false;
        if(($entity->time_cap == null) && ($entity->data_cap == null)){
			$new_entry = true;
		}
        
        $items['created']   = $this->TimeCalculations->time_elapsed_string($entity->created,false,false);    
        if($entity->last_reject_time){
            $items['last_reject_time']  = $this->TimeCalculations->time_elapsed_string($entity->last_reject_time,false,false);
        }
        
        if($entity->last_accept_time){
            $items['last_accept_time']  = $this->TimeCalculations->time_elapsed_string($entity->last_accept_time,false,false);
        }
        
        if($entity->data_cap){
            $items['data_cap'] = $this->Formatter->formatted_bytes($items['data_cap']);
        }
        
        if($entity->data_used){
            $items['data_used'] = $this->Formatter->formatted_bytes($items['data_used']);
        }
             
        if($entity->time_cap){
            $items['time_cap'] = $this->Formatter->formatted_seconds($items['time_cap']);
        }
        
        if($entity->time_used){
            $items['time_used'] = $this->Formatter->formatted_seconds($items['time_used']);
        }
        
        unset($items['password']);
        unset($items['token']);

        if(($entity->from_date)&&($entity->to_date)){
            $items['always_active'] = false;
            $items['from_date']    = $items['from_date']->format("m/d/Y");
            $items['to_date']      = $items['to_date']->format("m/d/Y");
        }else{
            $items['always_active'] = true;
        }
        
        if($new_entry){
			$profile = $this->_find_user_profile($username);
        	if($profile){
				$counters = $this->Counters->return_counter_data($profile,'voucher');
				if(array_key_exists('time', $counters)){
					$items['time_cap']  = $counters['time']['value'];
					$items['time_used'] = 0;
				}
				if(array_key_exists('data', $counters)){
					$items['data_cap']  = $counters['data']['value'];
					$items['data_used'] = 0;
				}
			}
		}
    
        return $items;
    }
    
    private function _detail_for_voucher($username){
    
        $entity     = $this->{'Vouchers'}->find()->where(['Vouchers.name' => $username])->first();
        $items      = [];
        
        $fields     = $this->{'Vouchers'}->schema()->columns();
        
        foreach($fields as $i){
            if($entity->{$i} !== null){
                $items[$i] = $entity->{$i};
            }
        }
        $new_entry = false;
        if(($entity->time_cap == null) && ($entity->data_cap == null)){
			$new_entry = true;
		}
        
        
        $items['created']   = $this->TimeCalculations->time_elapsed_string($entity->created,false,false);    
        if($entity->last_reject_time){
            $items['last_reject_time']  = $this->TimeCalculations->time_elapsed_string($entity->last_reject_time,false,false);
        }
        
        if($entity->last_accept_time){
            $items['last_accept_time']  = $this->TimeCalculations->time_elapsed_string($entity->last_accept_time,false,false);
        }
        
        if($entity->data_cap){
            $items['data_cap'] = $this->Formatter->formatted_bytes($items['data_cap']);
        }
        
        if($entity->data_used){
            $items['data_used'] = $this->Formatter->formatted_bytes($items['data_used']);
        }
             
        if($entity->time_cap){
            $items['time_cap'] = $this->Formatter->formatted_seconds($items['time_cap']);
        }
        
        if($entity->time_used){
            $items['time_used'] = $this->Formatter->formatted_seconds($items['time_used']);
        }
        
        unset($items['password']);
        unset($items['token']);

        if($new_entry){
			$profile = $this->_find_user_profile($username);
        	if($profile){
				$counters = $this->Counters->return_counter_data($profile,'voucher');
				if(array_key_exists('time', $counters)){
					$items['time_cap']  = $counters['time']['value'];
					$items['time_used'] = 0;
				}
				if(array_key_exists('data', $counters)){
					$items['data_cap']  = $counters['data']['value'];
					$items['data_used'] = 0;
				}
			}
		}
    
        return $items;
    }
    
     private function _getDaily($day){

        $items          = [];
        $total_in       = 0;
        $total_out      = 0;
        $total_in_out   = 0;

        $start  = 0;
        $end    = 24;
        $base_search = $this->_base_search();
        
        $this->_setTimeZone();

        while($start < $end){
            $slot_start  = "$day ".sprintf('%02d', $start).':00:00';
            $slot_end    = "$day ".sprintf('%02d', $start).':59:59';
            $start++;
        
            $conditions = $base_search;
            array_push($conditions, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" =>  $slot_start]);
            array_push($conditions, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <="  => $slot_end]);
            

            $q_r = $this->{$this->main_model}->find()
                ->select($this->fields)
                ->where($conditions)
                ->first();

            if($q_r){
                $d_in           = $q_r->data_in;
                $total_in       = $total_in + $d_in;

                $d_out          = $q_r->data_out;
                $total_out      = $total_out + $d_out;
                $total_in_out   = $total_in_out + ($d_in + $d_out);
                array_push($items, ['id' => $start, 'time_unit' => $start, 'data_in' => $d_in, 'data_out' => $d_out]);
            }
        }
        return(['items' => $items, 'total_in' => $total_in, 'total_out' => $total_out, 'total_in_out' => $total_in_out]);
    }

    private function _getWeekly($day){
        $items          = [];
        $total_in       = 0;
        $total_out      = 0;
        $total_in_out   = 0;

         //With weekly we need to find the start of week for the specified date
        $pieces     = explode('-', $day);
        $start_day  = date('Y-m-d', strtotime('this week', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));

        //Prime the days
        $slot_start = "$start_day 00:00:00";
        $slot_end   = "$start_day 23:59:59";
        $days       = ["Monday", "Tuesday", "Wednesday", "Thusday", "Friday", "Saturday", "Sunday"];
        $count      = 1;

        $base_search = $this->_base_search();
        
        $this->_setTimeZone();
       
        foreach($days as $d){

            $conditions = $base_search;
            array_push($conditions, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
            array_push($conditions, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);

            $q_r = $this->{$this->main_model}->find()
                ->select($this->fields)
                ->where($conditions)
                ->first();

            if($q_r){
                $d_in           = $q_r->data_in;
                $total_in       = $total_in + $d_in;

                $d_out          = $q_r->data_out;
                $total_out      = $total_out + $d_out;
                $total_in_out   = $total_in_out + ($d_in + $d_out);
                array_push($items, ['id' => $count, 'time_unit' => $d, 'data_in' => $d_in, 'data_out' => $d_out]);
            }

            //Get the nex day in the slots (we move one day on)
            $pieces     = explode('-',$start_day);
            $start_day  = date('Y-m-d',strtotime('+1 day', mktime(0, 0, 0, $pieces[1],$pieces[2], $pieces[0])));
            $slot_start = "$start_day 00:00:00";
            $slot_end   = "$start_day 23:59:59";
            $count++;
        }
        return(['items' => $items, 'total_in' => $total_in, 'total_out' => $total_out, 'total_in_out' => $total_in_out]);
    }

    private function _getMonthly($day){
    
        $base_search    = $this->_base_search();
        
        $this->_setTimeZone();  
        
        $items          = [];
        $total_in       = 0;
        $total_out      = 0;
        $total_in_out   = 0;      
        $pieces         = explode('-', $day); //2018-11-15  
             
        if(property_exists($this,'data_limit_active')){ 
             $dt_reset  = FrozenTime::now()
                    ->year($pieces[0])
                    ->month($pieces[1])
                    ->day($this->start_of_month)
                    ->hour($this->start_hour)
                    ->minute($this->start_minute);
        
            if($pieces[2]< $this->start_of_month){
                $dt_reset = $dt_reset->subMonth(1);
            }              
            $slot_start = $dt_reset;
            $end_time   = $slot_start; 
            $slot_end   = $end_time->addHour(24)->subMinute(1); 
        }else{
            $start_time = FrozenTime::now()->year($pieces[0])->month($pieces[1])->startOfMonth(); 
            $slot_start = $start_time->startOfDay(); 
            $slot_end   = $start_time->endOfDay();     
        }
        
        $month_date     = $slot_end->addMonth(1);
       
        $id_counter     = 1;
       
        while($month_date->timestamp > $slot_end->timestamp){
            $where = $base_search;
            array_push($where, ['UserStats.timestamp >=' => $slot_start]);
            array_push($where, ['UserStats.timestamp <=' => $slot_end]);
            //FIXME Somehow it does not like this on the monthly one 
            //Compare with DataUsages
           // array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') >=" => $slot_start]);
           // array_push($where, ["CONVERT_TZ(UserStats.timestamp,'+00:00','".$this->time_zone."') <=" => $slot_end]);
                
            $q_r = $this->{$this->main_model}->find()->select($this->fields)->where($where)->first();
            if($q_r){   
                $d_in           = $q_r->data_in;
                $total_in       = $total_in + $d_in;
                $d_out          = $q_r->data_out;
                $total_out      = $total_out + $d_out;
                $total_in_out   = $total_in_out + ($d_in + $d_out);
                array_push($items, ['id' => $id_counter, 'time_unit' => $slot_start->day, 'data_in' => $d_in, 'data_out' => $d_out]);
            }
            $slot_start = $slot_start->addHour(24);
            $slot_end = $slot_end->addHour(24);
            $id_counter ++;
        }    
        //$base_search    = $this->base_search; //FIXME WE DONT NEED THIS
        return(['items' => $items, 'total_in' => $total_in, 'total_out' => $total_out, 'total_in_out' => $total_in_out]);
    }
    
    
    private function _base_search(){

        $type           = 'permanent';
        $base_search    = [];
        $username       = $this->request->getQuery('username');

        if(null !== $this->request->getQuery('type')){
            $type = $this->request->getQuery('type');
            //Permanent users an vouchers
            if(($type == 'permanent')||($type == 'voucher')||($type == 'user')||($type == 'activity_viewer')){
            
                if($this->request->getQuery('permanent_id')!== null){
                    $p_id = $this->request->getQuery('permanent_id');
                    $this->loadModel('PermanentUsers');
                    $q_r = $this->PermanentUsers->find()->where(['PermanentUsers.id' => $p_id])->first();
                    if($q_r){
                        $username = $q_r->username;
                    }                    
                }
                array_push($base_search, ['UserStats.username' => $username]);
                
            }
            //Devices
            if($type == 'device'){
                array_push($base_search, ['UserStats.callingstationid' => $username]);
            }
            //Realms
            if($type == 'realm'){
                $this->loadModel('Realms');

                $q_r = $this->Realms->find()->where(['Realms.id' => $username])->first();

                if($q_r){
                    $realm_name = $q_r->name;
                    array_push($base_search, ['UserStats.realm' => $realm_name]);
                }
            }
            //Nas
            if($type == 'nas'){
                $this->loadModel('Nas');

                $q_r = $this->Nas->find()->where(['Nas.id' => $username])->first();

                if($q_r){ 
                    $nas_identifier = $q_r->nasidentifier;
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
                    if($q_r->data_limit_active){
                        $this->data_limit_active = $q_r->data_limit_active;
                        $this->start_of_month    = $q_r->data_limit_reset_on;
                        $this->start_hour        = $q_r->data_limit_reset_hour; 
                        $this->start_minute      = $q_r->data_limit_reset_minute;  
                    }
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
            
                 
        }
        $this->base_search = $base_search;
        
        return $base_search;
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
                    $tz_id  = $e_dc->timezone;
                    $ent    = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
                    if($ent){
                        $time_zone = $ent->name;
                    }
                } 
            }
        }
    }
}
