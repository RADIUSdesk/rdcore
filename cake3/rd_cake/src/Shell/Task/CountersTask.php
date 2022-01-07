<?php

namespace App\Shell\Task;

use Cake\Console\Shell;
use Cake\I18n\FrozenTime;
use Cake\Datasource\ConnectionManager;

class CountersTask extends Shell {
 
    public function initialize(){
        parent::initialize();
        $this->loadModel('Radusergroups');
        $this->loadModel('Radgroupchecks');
    }

    public function return_counter_data($profile_name,$type) {
        $counters = array();
        $this->_show_header($profile_name);
        if(($type == 'voucher')||($type == 'user')||($type == 'device')){ //nothing fancy here initially
            $counters = $this->_find_counters($profile_name);
        }
        return $counters;    
    }

    private function _show_header($profile_name){
        $this->out('<comment>=============================-=</comment>');
        $this->out('<comment>--Find potential counters for--</comment>');
        $this->out("<comment>-------$profile_name---------</comment>");
        $this->out('<comment>______________________________</comment>');
    }

    private function _find_counters($username){

        $counters = array();
        //First we need to find all the goupnames associated with this profile
        $q_r = $this->{'Radusergroups'}->find()
            ->where(['Radusergroups.username' => $username])
            ->order(['Radusergroups.priority ASC']) //So smallese numbers first. then bigger numbers can override the smaller numbers
            ->all();
        
        $counters_info = [];

        foreach($q_r as $i){       
            $g  = $i->groupname;
            
            $q_gchk = $this->{'Radgroupchecks'}->find()
                ->where(['Radgroupchecks.groupname' => $g])
                ->all();
            
            foreach($q_gchk as $j){
                $attribute  = $j->attribute;
                $value      = $j->value;
                $counters_info[$attribute] = $value;
            }
        }
        
        //Once we accumalated all the data; we can now go through them to determine if wnad what counters are there
        $tc = $this->_look_for_time_counters($counters_info);
        if($tc){
            $counters['time'] = $tc;
        }

        $dc = $this->_look_for_data_counters($counters_info);
        if($dc){
            $counters['data'] = $dc;
        }
        
        return $counters;
    }


    private function _look_for_time_counters($counters_info){
        $counter = false;
        
        if(array_key_exists('Rd-Cap-Type-Time', $counters_info)){
            $counter            = array();
            $counter['cap']     = $counters_info['Rd-Cap-Type-Time'];
            $counter['reset']   = $counters_info['Rd-Reset-Type-Time'];
            $counter['value']   = $counters_info['Rd-Total-Time'];

			//Defaults for mac_counter and reset_interval
			$mac_counter		= false;
			$reset_interval		= false;
			if($counter['reset'] == 'dynamic'){
				$reset_interval = $counters_info['Rd-Reset-Interval-Time'];
			}
			if(array_key_exists('Rd-Mac-Counter-Time', $counters_info)){
			    $mac_counter		= $counters_info['Rd-Mac-Counter-Time'];
		    }
			$counter['reset_interval'] 	= $reset_interval;
			$counter['mac_counter'] 	= $mac_counter;
        }
        return $counter;
    }

    private function _look_for_data_counters($counters_info){
        $counter = false;

        if(array_key_exists('Rd-Cap-Type-Data', $counters_info)){
            $counter            = array();
            $counter['cap']     = $counters_info['Rd-Cap-Type-Data'];
            $counter['reset']   = $counters_info['Rd-Reset-Type-Data'];
            $counter['value']   = $counters_info['Rd-Total-Data'];

			//Defaults for mac_counter and reset_interval
			$mac_counter		= false;
			$reset_interval		= false;
			if($counter['reset'] == 'dynamic'){
				$reset_interval = $counters_info['Rd-Reset-Interval-Data'];
			}
			
			if(array_key_exists('Rd-Mac-Counter-Data', $counters_info)){
			    $mac_counter		= $counters_info['Rd-Mac-Counter-Data'];
		    }
			
			$counter['reset_interval'] 	= $reset_interval;
			$counter['mac_counter'] 	= $mac_counter;
        }
        return $counter;
    }
}

?>
