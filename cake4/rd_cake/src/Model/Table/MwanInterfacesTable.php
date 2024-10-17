<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class MwanInterfacesTable extends Table {

    public function initialize(array $config):void{  
        $this->addBehavior('Timestamp');  
        $this->belongsTo('MultiWanProfiles');
        $this->hasMany('MwanInterfaceSettings',  ['dependent' => true]);        
    }
      
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->notEmpty('metric', 'A metric is required')
            ->add('metric', [ 
                'metricUnique' => [
                    'message'   => 'The Metric you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'multi_wan_profile_id']],
                    'provider'  => 'table'
                ]
            ])
            ->add('name', [ 
                'nameUnique' => [
                    'message'   => 'The name you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'multi_wan_profile_id']],
                    'provider'  => 'table'
                ]
            ]);           
        return $validator;
    }      
}

