<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class DynamicDetailTransKeysTable extends Table {

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');
        $this->belongsTo('DynamicDetailLanguages');
        $this->belongsTo('DynamicDetails');
        $this->belongsTo('DynamicDetailTransKeys');
        $this->hasMany('DynamicDetailTranslations',[
            'dependent' => true
        ]);
    }
    
    public function validationDefault(Validator $validator){
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message' => 'The name you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
            
        return $validator;
    }
}
