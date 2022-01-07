<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class DynamicClientsTable extends Table
{
    public function initialize(array $config)
    {
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Users');
        $this->hasMany('DynamicClientNotes',['dependent' => true]);
        $this->hasMany('DynamicClientRealms',['dependent' => true]);
       
        //Limits does not work in cakephp3 so we can actually leave this out and just do a manual query
        //$this->hasMany('DynamicClientStates',['dependent' => true]);
       // $this->hasOne('AliveCurrents',['foreignKey' => 'nasidentifier','bindingKey' => 'nasidentifier','dependent' => true]);
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
