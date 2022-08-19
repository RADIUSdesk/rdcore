<?php
namespace App\Shell\Task;

use Cake\Console\Shell;
use Cake\I18n\FrozenTime;

//FIXME Needs more testing but actually not needed any more

class MonitorTask extends Shell {

    public function initialize(){
        parent::initialize();
        $this->loadModel('Nas');
        $this->loadModel('NaStates');
    }

    public function execute() {
        $this->_show_header();
        $this->_do_ping_tests();
        $this->_do_heartbeat_tests();   
    }


    public function ping(){
        $this->_show_header();
        $this->_do_ping_tests();
    }

    public function heartbeat(){
        $this->_show_header();
        $this->_do_heartbeat_tests();
    }

    private function _show_header(){
        $this->out('<comment>==============================</comment>');
        $this->out('<comment>----------Monitor Tests-------</comment>');
        $this->out('<comment>----------RADIUSdesk 2019-----</comment>');
        $this->out('<comment>______________________________</comment>');
    }

    private function _do_ping_tests(){
        //Get a list of all the ping test ones.
        $this->out('<info>Monitor::Ping::Starting</info>');
        $q_r = $this->Nas->find()->contain(['NaStates'])->where(['Nas.monitor' => 'ping'])->all();
       // print_r($q_r);
        foreach($q_r as $i){
            $id             = $i->id;
            $ip             = $i->nasname;
            $last_contact   = $i->last_contact;
            $lc_seconds     = strtotime($last_contact);
            $ping_interval  = $i->ping_interval;

            if($last_contact == null){ //First time
                $this->out('<info>Monitor::Ping::Empty record add one</info>');
                $this->_test_device(0,$ip,$id);
                //Add a timestamp....
                $now  = FrozenTime::now();
                $this->{'Nas'}->patchEntity($i,['last_contact' => $now]);
                $this->{'Nas'}->save($i); 
            }else{ //Follow ups....
                $time_now = time();
                if($time_now > ($lc_seconds+$ping_interval)){
                    $this->out("<warning>Monitor::Ping::Doing a follow-up test for $ip</warning>");
                    $last_state = 0;
                    if($i->na_states){
                        $l_state    = $i->na_states[0];
                        $last_state = $l_state->state;    
                    }
                    $this->_test_device($last_state,$ip,$id);
                    //Add a timestamp....
                    $this->{'Nas'}->patchEntity($i,['last_contact' => $now]);
                    $this->{'Nas'}->save($i); 

                }else{
                    $this->out("<warning>Monitor::Ping::Interval not expired -> $ip</warning>");
                }
            }  
        }
    }

    private function _do_heartbeat_tests(){
        $this->out('<info>Monitor::Heartbeat::Starting</info>');
        $q_r = $this->Nas->find()->contain(['NaStates'])->where(['Nas.monitor' => 'heartbeat'])->all();
       // print_r($q_r);
        foreach($q_r as $i){
            $id             = $i->id;
            $ip             = $i->nasname;
            $last_contact   = $i->last_contact;
            $lc_seconds     = strtotime($last_contact);
            $dead_after     = $i->heartbeat_dead_after;

            if($last_contact == null){ //First time
                $state = 0;
            }else{ //Follow ups....
                $time_now = time();
                if($time_now > ($lc_seconds+$dead_after)){
                    $this->out("<warning>Monitor::Heartbeat::Marking $ip as dead</warning>");
                    $state = 0;
                }else{
                    $this->out("<warning>Monitor::Heartbeat::$ip still alive</warning>");
                    $state = 1;
                }
     
                $last_state = 0;
                if($i->na_states){  
                    $l_state    = $i->na_states[0];
                    $last_state = $l_state->state;  
                }

                if($last_state != $state){
                    $data['na_id']  = $id;
                    $data['state']  = $state;
                    $e_s = $this->{'NaStates'}->newEntity($data); 
                    $this->{'NaStates'}->save($e_s);
                } 
            }  
        }
    }

    private function _test_device($last_state, $nasname,$id){
    
        $ping_count = '1';
        $this->out("<info>Monitor::Ping::Testing $nasname $last_state $id</info>");
        $feedback   = array();
        $state      = '0'; //Start with fail
        exec("ping -c $ping_count -q $nasname",$feedback);
        foreach($feedback as $line){
          //  print $line."\n";
            if(preg_match("/$ping_count packets transmitted/",$line)){
                $pieces = explode(', ',$line);
                $p      = explode(' ',$pieces[1]);
                if($p[0] > 0){
                    $state = '1';
                }
            }
        }

        //Add an entry to the state table
        if($last_state != $state){
            $data['na_id']  = $id;
            $data['state']  = $state;
            $e_s = $this->{'NaStates'}->newEntity($data); 
            $this->{'NaStates'}->save($e_s);
        }
    }
}

?>
