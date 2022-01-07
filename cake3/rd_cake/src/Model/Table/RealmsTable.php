<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class RealmsTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Users');   
        $this->hasMany('RealmNotes',['dependent' => true]);
        $this->hasMany('NaRealms',['dependent' => true]);
        $this->hasMany('DynamicClientRealms',['dependent' => true]);
        $this->hasMany('DynamicDetailSocialLogins',['dependent' => true]);
        
        
        $this->addBehavior('Acl.Acl',['type' => 'controlled']);
    
        $this->hasMany('PermanentUsers',['dependent' => true]);
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
    
    public function entityBasedOnPost($post_data){
        $entity = false;
        if(isset($post_data['realm_id'])){
            $entity = $this->get($post_data['realm_id']);
        }
        if(isset($post_data['realm'])){ //This is a bit different we will find the entity based on the name provided
            $r_name = $post_data['realm'];          
            $entity = $this->find()->where(['Realms.name' => $r_name])->first();
        }
        return $entity;
    }
       
}
