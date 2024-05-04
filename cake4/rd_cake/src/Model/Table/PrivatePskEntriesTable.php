<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class PrivatePskEntriesTable extends Table {

    public function initialize(array $config):void{ 
        $this->addBehavior('Timestamp');
        $this->belongsTo('PrivatePsks');    
    }
 
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
          ->notEmpty('name', 'A PSK is required')
          ->allowEmpty('mac')
          ->add('mac', [ 
                'macUnique' => [
                    'message' => 'The MAC you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'private_psk_id']], 
                    'provider' => 'table'
                ]
            ])
            ->add('name', [ 
                'nameUnique' => [
                    'message' => 'The PSK you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'private_psk_id']], 
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
    
       
}
