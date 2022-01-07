<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake migrate_radiusdesk

namespace App\Shell;

use Cake\Console\Shell;

class MigrateRadiusdeskShell extends Shell{

     public $tasks = ['Migrate'];

     public function initialize(){
        parent::initialize();
        
    }

    public function main(){
        $this->Migrate->main();
    }
}
