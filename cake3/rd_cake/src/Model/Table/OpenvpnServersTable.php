<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class OpenvpnServersTable extends Table {

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users', [
            'className'     => 'Users',
            'foreignKey'    => 'user_id'
        ]);
    }

    public function validationDefault(Validator $validator)
    {
        $validator = new Validator();
        $validator
            ->notBlank('name','Value is required')
            ->add('name', [
                'nameUnique' => [
                    'message' => 'This name is already taken',
                    'rule' => 'validateUnique',
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }

}
