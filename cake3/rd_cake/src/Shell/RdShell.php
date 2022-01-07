<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake rd mon_dynamic|mon|debug_check|auto_close

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;

class RdShell extends Shell {

    public $tasks = ['Monitor','Debug','AutoClose','MonitorDynamic'];

    public function main() {

        if($this->args[0] == 'mon'){

            if ($this->params['heartbeat']) {
                $this->Monitor->heartbeat();
                return;
            }

            if ($this->params['ping']) {
                $this->Monitor->ping();
                return;
            }

            $this->Monitor->execute();
        }

        //Check if a debug trace was started and stop it after timeout.
        if($this->args[0] == 'debug_check'){
            $this->Debug->check();     
        }

        //Check if a debug trace was started and stop it after timeout.
        if($this->args[0] == 'auto_close'){
            $this->AutoClose->check();     
        }
        
        //This is an informal addition to do on dynamic-client-states if there might be such a requirmement
        if($this->args[0] == 'mon_dynamic'){
            $this->MonitorDynamic->execute();      
        }
         
    }
    
    public function getOptionParser(){
        // Get an empty parser from the framework.
        $parser = parent::getOptionParser();
        $parser->description(__('RADIUSdesk console for various tasks'));
        
        $parser->addOption('ping', array(
            'help' => 'Do a ping monitor test',
            'boolean' => true
        ));
        $parser->addOption('heartbeat', array(
            'help' => 'Do a heartbeat monitor test',
            'boolean' => true
        ));

        $parser->addArgument('action', array(
            'help' => 'The action to do',
            'required' => true,
            'choices' => array('mon','restart_check','debug_check','auto_close','mon_dynamic')
        ));
        
        $parser->epilog('Have alot of fun....');
        return $parser;
    }
}


?>
