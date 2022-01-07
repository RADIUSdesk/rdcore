<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class FirmwareKeysTable extends Table {
    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');    
    }
    
    public function validationDefault(Validator $validator){
        $validator = new Validator();
        $validator
            ->notEmpty('token_key', 'A value is required')
            ->add('token_key', [ 
                'tokenKeyUnique' => [
                    'message' => 'The value you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
       
}
