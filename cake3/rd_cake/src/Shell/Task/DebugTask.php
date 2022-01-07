<?php
namespace App\Shell\Task;

use Cake\Console\Shell;
use Cake\I18n\FrozenTime;

//FIXME Needs more testing

class DebugTask extends Shell {

    public function initialize(){
        parent::initialize();
        $this->loadModel('Checks');
    }

    public function check() {
        $this->_show_header();
        $this->_check();     
    }

    private function _show_header(){
        $this->out('<comment>==============================</comment>');
        $this->out('<comment>---Debug Timeout Checking-----</comment>');
        $this->out('<comment>-------RADIUSdesk 2019--------</comment>');
        $this->out('<comment>______________________________</comment>');
    }
    
    private function _check(){
        $this->out("<info>Debug::Check for entry</info>");
        $q_r = $this->Checks->find()->where(['Checks.name' => 'debug_timeout'])->first();

        if($q_r){
            $this->out("<info>Debug::Found debug trace entry</info>");
            $value  = $q_r->value;
            $id     = $q_r->id;
            $now    = time();
            if($value < $now){
                $this->out("<info>Debug::Debug timed out - disabling it</info>"); 
                exec("sudo /var/www/html/cake3/rd_cake/setup/scripts/radmin_wrapper.pl debug stop",$output);
                $this->out("<info>Debug::Deleting the intry in Checks table</info>");
                $this->Checks->deleteAll(['Checks.name' => 'debug_timeout']);
            }else{
                $timeout = $value - $now;
                $this->out("<info>Debug::Debug expires in ".$timeout." seconds</info>");
            }
        }else{
            $this->out("<info>Debug::No current debug trace found</info>");
        }
    }
}

?>
