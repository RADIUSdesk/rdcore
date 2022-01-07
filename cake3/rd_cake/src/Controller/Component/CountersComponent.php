<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class CountersComponent extends Component {

	public function return_counter_data($profile_name,$type) {
        $counters = [];
        if(($type == 'voucher')||($type == 'user')||($type == 'device')){ //nothing fancy here initially
			$this->_init_models();
            $counters = $this->_find_counters($profile_name);
        }
        return $counters;    
    }

	private function _init_models(){
		$this->Radusergroups  = TableRegistry::get('Radusergroups');
		$this->Radgroupchecks = TableRegistry::get('Radgroupchecks');
	}

	private function _find_counters($username){

        $counters = [];
        //First we need to find all the goupnames associated with this profile
        $q_r = $this->Radusergroups->find()->where(['Radusergroups.username' => $username])->all();

        foreach($q_r as $i){
            $g  = $i->groupname;
            $tc = $this->_look_for_time_counters($g);
            if($tc){
                $counters['time'] = $tc;
            }

            $dc = $this->_look_for_data_counters($g);
            if($dc){
                $counters['data'] = $dc;
            }
        }
        return $counters;
    }


    private function _look_for_time_counters($groupname){
        $counter = false;
        $cap     = $this->_query_radgroupcheck($groupname,'Rd-Cap-Type-Time');
        if($cap){
            $counter            = [];
            $counter['cap']     = $cap;
            $counter['reset']   = $this->_query_radgroupcheck($groupname,'Rd-Reset-Type-Time');
            $counter['value']   = $this->_query_radgroupcheck($groupname,'Rd-Total-Time');

			//Defaults for mac_counter and reset_interval
			$mac_counter		= false;
			$reset_interval		= false;
			if($counter['reset'] == 'dynamic'){
				$reset_interval = $this->_query_radgroupcheck($groupname,'Rd-Reset-Interval-Time');
			}
			$mac_counter		= $this->_query_radgroupcheck($groupname,'Rd-Mac-Counter-Time');
			$counter['reset_interval'] 	= $reset_interval;
			$counter['mac_counter'] 	= $mac_counter;

            //Rd-Used-Time := "%{sql:SELECT IFNULL(SUM(AcctSessionTime),0) FROM radacct WHERE username='%{request:User-Name}'}"
        }
        return $counter;
    }

    private function _look_for_data_counters($groupname){
        $counter = false;
        $cap     = $this->_query_radgroupcheck($groupname,'Rd-Cap-Type-Data');
        if($cap){
            $counter = array();
            $counter['cap']     = $cap;
            $counter['reset']   = $this->_query_radgroupcheck($groupname,'Rd-Reset-Type-Data');
            $counter['value']   = $this->_query_radgroupcheck($groupname,'Rd-Total-Data');

			//Defaults for mac_counter and reset_interval
			$mac_counter		= false;
			$reset_interval		= false;
			if($counter['reset'] == 'dynamic'){
				$reset_interval = $this->_query_radgroupcheck($groupname,'Rd-Reset-Interval-Data');
			}
			$mac_counter		= $this->_query_radgroupcheck($groupname,'Rd-Mac-Counter-Data');
			$counter['reset_interval'] 	= $reset_interval;
			$counter['mac_counter'] 	= $mac_counter;
        }
        return $counter;
    }

    private function _query_radgroupcheck($groupname,$attribute){
        $retval = false;
        $q_r = $this->Radgroupchecks->find()->where(['Radgroupchecks.groupname' => $groupname, 'Radgroupchecks.attribute' => $attribute])->first();
        if($q_r){
            $retval = $q_r->value;
        }
        return $retval;
    }
}
