<?php

namespace App\Shell;

use Cake\Console\Shell;

class HelloShell extends Shell{

    public function main(){
        $this->out("Specify something");
    }
    
    public function singleMeshReport($report){
        $this->out("Doing Single Mesh Report $report");
        $this->log("REPORT $report", 'debug');    
    }
}

?>
