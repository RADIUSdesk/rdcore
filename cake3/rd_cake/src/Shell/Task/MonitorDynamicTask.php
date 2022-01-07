<?php
namespace App\Shell\Task;

use Cake\Console\Shell;
use Cake\I18n\FrozenTime;

//FIXME Needs more testing but actually not needed any more

class MonitorDynamicTask extends Shell {

    protected   $heartbeat_dead_after    = 300;

    public function initialize(){
        parent::initialize();
        $this->loadModel('DynamicClients');
        $this->loadModel('DynamicClientStates');
        $this->loadModel('AliveCurrents');
    }

    public function execute() {
        $this->_show_header();
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
        $this->out('<comment>-Monitor DynamicClient Tests--</comment>');
        $this->out('<comment>----------RADIUSdesk 2020-----</comment>');
        $this->out('<comment>______________________________</comment>');
    }

  
    private function _do_heartbeat_tests(){
        $this->out('<info>Monitor::DynamicClients::Heartbeat::Starting</info>');
        $q_r = $this->DynamicClients->find()->where(['DynamicClients.monitor' => 'heartbeat'])->all();
        
        foreach($q_r as $i){
            $id         = $i->id;
            $nasid      = $i->nasidentifier; 
            $dead_after = $this->heartbeat_dead_after;         
            $state_now  = $this->_determine_state_now($nasid,$dead_after);
             
            $ent = $this->{'DynamicClientStates'}->find()
                ->where(['DynamicClientStates.dynamic_client_id' =>$id])
                ->order(['DynamicClientStates.created' => 'DESC'])
                ->first(); 
                
            if(!$ent){//First one
                $this->out("<warning>First State Entry for $nasid (id=$id) as $state_now</warning>"); 
                $e_s = $this->{'DynamicClientStates'}->newEntity([
                    'dynamic_client_id' => $id,
                    'state' => $state_now
                ]);
                $this->{'DynamicClientStates'}->save($e_s);       
            }else{
                $this->{'DynamicClientStates'}->touch($ent);
                $this->{'DynamicClientStates'}->save($ent);
                if($ent->state == $state_now){
                    $this->out("<warning>Update State Entry for $nasid (id=$id) as $state_now</warning>"); 
                    //$this->{'DynamicClientStates'}->touch($ent);
                    //$this->{'DynamicClientStates'}->save($ent);
                }else{
                    $this->out("<warning>New State Entry for $nasid (id=$id) as $state_now</warning>");
                    $e_s = $this->{'DynamicClientStates'}->newEntity([
                        'dynamic_client_id' => $id,
                        'state' => $state_now
                    ]);
                    $this->{'DynamicClientStates'}->save($e_s);
                }     
            }
        }
    } 
    
    private function _determine_state_now($nasid,$dead_after){
    
        $return = 0;
        $ent = $this->{'AliveCurrents'}->find()->where(['AliveCurrents.nasidentifier' =>$nasid])->first();
        if($ent){
            $now = FrozenTime::now(); 
            //print_r($dead_after);
            //print_r($now);
            //print_r($ent->time->addSeconds($dead_after));
            $alive_until = $ent->time->addSeconds($dead_after);
            if($alive_until > $now){
                $return = 1; //Still kicking we assume
            }
        }
        return $return;   
    }
}

?>
