<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class LanguagesTable extends Table {

    public function initialize(array $config)
    {
        //parent::initialize(array $config);

        $this->hasMany('PhraseValues', ['dependent' => true]);
        $this->hasMany('Users', ['dependent' => true]);
    }

    public function validationDefault(Validator $validator)
    {
        $validator = new Validator();
        $validator
            ->notBlank('name','Language name is required')
            ->add('name', [
                'nameUnique' => [
                    'message' => 'You already have an entry',
                    'rule' => 'validateUnique',
                    'provider' => 'table'
                ]
            ])
            ->notBlank('iso_code', 'ISO code is required')
            ->add('iso_code', [
                'nameUnique' => [
                    'message' => 'You already have an entry',
                    'rule' => 'validateUnique',
                    'provider' => 'table'
                ],
                'minLength' => [
                    'rule' => ['minLength', 2],
                    'message' => 'Minimum length of 2 characters'
                ],
                'maxLength' => [
                    'rule' => ['maxLength', 2],
                    'message' => 'ISO codes can not be more than two characters'
                ]
            ]);
        return $validator;
    }
}
