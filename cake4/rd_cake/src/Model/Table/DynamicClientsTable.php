<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class DynamicClientsTable extends Table
{
    public function initialize(array $config):void
    {
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Clouds');
        $this->hasMany('DynamicClientRealms',['dependent' => true]);
        $this->hasMany('DynamicClientSettings',['dependent' => true]);
    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message'   => 'The name you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'cloud_id']],
                    'provider'  => 'table'
                ]
            ]);
           /* ->add('nasidentifier', [ 
                'nameUnique' => [
                    'message' => 'The nas identifier you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
          /*  ->add('calledstationid', [ 
                'nameUnique' => [
                    'message' => 'The called stationid you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);*/
        return $validator;
    }  
}
