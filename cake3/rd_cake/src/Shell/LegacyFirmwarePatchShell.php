<?php

//as www-data
//cd /var/www/ampcore8/cake3/rd_cake && bin/cake legacy_firmware_patch

//We can add this to CRON to run every minute since it will only update nodes that have a more recent modified date that the last time this script was run

namespace App\Shell;

use Cake\Console\Shell;

class LegacyFirmwarePatchShell extends Shell{

    public $tasks = ['LegacyFirmwarePatch'];

   public function initialize(){
        parent::initialize();  
    }

    public function main(){
        $this->LegacyFirmwarePatch->main();
    }
}
