<?php

//as www-data
//cd /var/www/ampcore8/cake3/rd_cake && bin/cake migrate_hardware

namespace App\Shell;

use Cake\Console\Shell;

class MigrateHardwareShell extends Shell{

     public $tasks = ['MigrateHardware'];

     public function initialize(){
        parent::initialize();
        
    }

    public function main(){
        $this->MigrateHardware->main();
    }
}
