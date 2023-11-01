<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class AccelServersTable extends Table{

    public function initialize(array $config):void{
        
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Clouds'); 
        $this->belongsTo('AccelProfiles');       
        $this->hasOne('AccelStats',['dependent' => true]);
    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message' => 'The name you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ])
            ->notEmpty('mac', 'A name is required')
            ->add('mac', [ 
                'nameUnique' => [
                    'message' => 'The MAC you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
                       
        return $validator;
    }
    
}
