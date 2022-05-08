<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class ApProfileExitCaptivePortalsTable extends Table {

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp');      
        $this->belongsTo('ApProfileExits', array(
                'className' => 'ApProfileExits',
                'foreignKey' => 'ap_profile_exit_id'
            ));
        $this->belongsTo('ApProfileExitUpstreams', [
                'className'     => 'ApProfileExits',
                'foreignKey'    => 'ap_profile_exit_upstream_id'
            ]);
    }

    public function validationDefault(Validator $validator)
    {
        $validator = new Validator();
        $validator
            ->notBlank('radius_nasid','Value is required')
            ->add('name', [
                'nameUnique' => [
                    'message' => 'This value is already taken',
                    'rule' => 'validateUnique',
                    'provider' => 'table'
                ]
            ])
            ->notBlank('radius1', 'Value is required')
            ->notBlank('secret', 'Value is required')
            ->notBlank('uam_url', 'Value is required');
        return $validator;
    }
}
