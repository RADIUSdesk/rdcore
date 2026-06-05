<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class PasspointNaiRealmsTable extends Table {

    public function initialize(array $config):void{  
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('PasspointProfiles'); 
        $this->hasMany('PasspointNaiRealmPasspointEapMethods',['dependent' => true]);     
    }
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message'   => 'The name you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'passpoint_profile_id']],
                    'provider'  => 'table'
                ]
            ]);           
        return $validator;
    } 
}

