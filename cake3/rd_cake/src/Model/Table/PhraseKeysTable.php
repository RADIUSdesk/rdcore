<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class PhraseKeysTable extends Table {

    public function initialize(array $config)
    {
        parent::initialize();

        $this->hasMany('PhraseValues', ['dependent' => true]);
    }

    public function validationDefault(Validator $validator)
    {
        $validator = new Validator();
        $validator
            ->notBlank('name','Value is required')
            ->add('name', [
                'nameUnique' => [
                    'message' => 'This key is already defined',
                    'rule' => 'validateUnique',
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
}
