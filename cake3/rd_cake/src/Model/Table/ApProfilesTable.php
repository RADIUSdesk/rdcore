<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class ApProfilesTable extends Table
{
    public function initialize(array $config)
    {
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Users');

        $this->hasMany('Aps', ['dependent' => true]);
        $this->hasMany('ApProfileNotes', ['dependent' => true]);
        $this->hasMany('ApProfileEntries', ['dependent' => true]);
//        $this->hasMany('ApProfileSettings', ['dependent' => true]);
        $this->hasOne('ApProfileSettings', ['dependent' => true]);
        $this->hasMany('ApProfileSpecifics', ['dependent' => true]);
        $this->hasMany('ApProfileExits', ['dependent' => true]);
//        $this->hasOne('ApProfileEntries', ['dependent' => true]);
//        $this->hasOne('ApProfileSettings', ['dependent' => true]);
//        $this->hasOne('ApProfileSpecifics', ['dependent' => true]);
//        $this->hasOne('ApProfileExits', ['dependent' => true]);
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
