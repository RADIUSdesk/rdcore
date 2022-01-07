<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class RegistrationRequestsTable extends Table {
    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');    
    }     
}
