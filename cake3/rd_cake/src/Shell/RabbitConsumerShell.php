<?php
namespace App\Shell;

use Cake\Console\Shell;
use RabbitMQ\CakephpRabbitMQ as MQ;

class RabbitConsumerShell extends Shell{
 
    public $tasks = ['Consumer'];
    
     public function initialize(){
        parent::initialize();
    }
    
     

    public function main(){
        $this->out('Specify an Action');
        return true;
    }
    
    public function singleMeshReport($report){
        //You need to return true to avoid retries

        $this->Consumer->main(); //Prime it 
        $this->Consumer->singleMeshReport($report);
        return true;
    }
    
}
