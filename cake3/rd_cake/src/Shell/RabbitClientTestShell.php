<?php
namespace App\Shell;

use Cake\Console\Shell;
use RabbitMQ\CakephpRabbitMQ as MQ;
// su www-data
// cd /var/www/radiusdesk/cake3/rd_cake
// bin/cake rabbit_client_test 

class RabbitClientTestShell extends Shell{

    public $tasks = [];  
    private $files  = [  
        "uttar_pradesh.csv"
    ];

    public function initialize(){
        parent::initialize();
        //$this->loadModel('Meshes');
        //$this->loadModel('TreeTags');  
    }

    public function main(){
        $this->out('Testing Rabbit Client');
        //MQ::listen();

        //MQ::send('email', 'this is a message');
        MQ::send('dirk_test', 'this is a message');
        return true;
    }
    
}
