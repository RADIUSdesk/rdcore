<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class ApProfileExitPppoeServersTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->belongsTo('ApProfileExits');
        $this->belongsTo('AccelProfiles');    
    }
}
