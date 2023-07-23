<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class IspSpecificsTable extends Table
{
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Clouds'); 
    }
    
    public function validationDefault(Validator $validator): Validator{
        $validator = new Validator();
        $validator->notEmpty('name', 'A name is required');     
        return $validator;
    }      
}
