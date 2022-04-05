<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class DynamicDetailsTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp'); 
         
        $this->belongsTo('Users');
         
        $this->belongsTo('PermanentUsers', [
            'className' => 'PermanentUsers',
            'foreignKey' => 'social_temp_permanent_user_id'
        ]); 
        
        $this->hasMany('DynamicPhotos',['dependent' => true]); 
        $this->hasMany('DynamicPairs',['dependent' => true]);
        $this->hasMany('DynamicPages',['dependent' => true]); 
        $this->hasMany('DataCollectors',['dependent' => true]); 
        $this->hasMany('DynamicDetailNotes',['dependent' => true]);
        $this->hasMany('DynamicDetailSocialLogins',['dependent' => true]);
        $this->hasMany('DynamicDetailPrelogins',['dependent' => true]); 
        $this->hasOne('DynamicDetailMobiles',['dependent' => true]); 
        $this->hasOne('DynamicDetailCtcs',['dependent' => true]);           
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
