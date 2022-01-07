<?php
namespace App\Shell\Task;

use Cake\Console\Shell;
use Cake\I18n\FrozenTime;
use Cake\Datasource\ConnectionManager;

class AutoCloseTask extends Shell {

    public function initialize(){
        parent::initialize();
        $this->loadModel('Radaccts');
        $this->loadModel('Nas');
        $this->loadModel('DynamicClients');     
    }
  
    public function check() {
        $this->_show_header();
        $this->_check();     
    }

    private function _show_header(){
        $this->out('<comment>==============================</comment>');
        $this->out('<comment>---Stale Session Checking-----</comment>');
        $this->out('<comment>-------RADIUSdesk 2019--------</comment>');
        $this->out('<comment>______________________________</comment>');
    }
    
    private function _check(){

        $this->out("<info>AutoClose::Find NAS with Auto close enabled</info>");

        $q_r = $this->Nas->find()->where(['Nas.session_auto_close' => '1'])->all();

        if($q_r){
            foreach($q_r as $item){
                $nasname        = $item->nasname;
                $close_after    = $item->session_dead_time;
                $this->out("<info>AutoClose::Auto closing potential stale sessions on $nasname after $close_after dead time</info>");
                $conn = ConnectionManager::get('default');
                
                $conn->execute("UPDATE radacct set acctstoptime=ADDDATE(acctstarttime, INTERVAL acctsessiontime SECOND), acctterminatecause='Clear-Stale-Session' where nasipaddress='$nasname' AND acctstoptime is NULL AND ((UNIX_TIMESTAMP(now()) - (UNIX_TIMESTAMP(acctstarttime)+acctsessiontime))> $close_after)");
                
                //It may be that the nasidentifier is actually the unique attribute 
                //and not the nasipaddress (espacially when doing Miktoritk!!!)
                $nasidentifier  = $item->nasidentifier;
                $conn->execute("UPDATE radacct set acctstoptime=ADDDATE(acctstarttime, INTERVAL acctsessiontime SECOND), acctterminatecause='Clear-Stale-Session' where nasidentifier='$nasidentifier' AND acctstoptime is NULL AND ((UNIX_TIMESTAMP(now()) - (UNIX_TIMESTAMP(acctstarttime)+acctsessiontime))> $close_after)");


            }
        }else{
           $this->out("<info>AutoClose::No NAS devices configured for auto session closing</info>");
        }
          
        $this->out("<info>AutoClose::Find DynamicClients with Auto close enabled</info>");

        $q_r = $this->DynamicClients->find()->where(['DynamicClients.session_auto_close' => '1'])->all();

        if($q_r){
            foreach($q_r as $item){
                $nasidentifier  = $item->nasidentifier;
                $calledstationid= $item->calledstationid;
                $close_after    = $item->session_dead_time;
                $this->out("<info>AutoClose::Auto closing potential stale sessions on NASID $nasidentifier after $close_after dead time</info>");
                $conn = ConnectionManager::get('default');
                
                if($nasidentifier != ''){
                  $conn->execute("UPDATE radacct set acctstoptime=ADDDATE(acctstarttime, INTERVAL acctsessiontime SECOND), acctterminatecause='Clear-Stale-Session' where nasidentifier='$nasidentifier' AND acctstoptime is NULL AND ((UNIX_TIMESTAMP(now()) - (UNIX_TIMESTAMP(acctstarttime)+acctsessiontime))> $close_after)");
                }
                
                 if($calledstationid != ''){
                 $conn->execute("UPDATE radacct set acctstoptime=ADDDATE(acctstarttime, INTERVAL acctsessiontime SECOND), acctterminatecause='Clear-Stale-Session' where calledstationid='$calledstationid' AND acctstoptime is NULL AND ((UNIX_TIMESTAMP(now()) - (UNIX_TIMESTAMP(acctstarttime)+acctsessiontime))> $close_after)");
                }
            }
        }else{
           $this->out("<info>AutoClose::No DynamicClients configured for auto session closing</info>");
        }       
    }
}

?>
