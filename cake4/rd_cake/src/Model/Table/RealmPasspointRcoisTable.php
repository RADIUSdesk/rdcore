<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class RealmPasspointRcoisTable extends Table {

    public function initialize(array $config):void{  
        $this->addBehavior('Timestamp');
        $this->belongsTo('RealmPasspointProfiles');            
    }    
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
         $validator
            ->notEmpty('name', 'A name is required')
            ->add('rcoi_id', [ 
                'nameUnique' => [
                    'message'   => 'The RCOI ID you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'realm_passpoint_profile_id']],
                    'provider'  => 'table'
                ]
            ])
            ->add('name', [ 
                'nameUnique' => [
                    'message'   => 'The name you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'realm_passpoint_profile_id']],
                    'provider'  => 'table'
                ]
            ]);           
        return $validator;
    }                
}

