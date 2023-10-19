<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class AccelSessionsTable extends Table{

    public function initialize(array $config):void{
        
        $this->addBehavior('Timestamp');  
        $this->belongsTo('AccelServers');
    }
}
