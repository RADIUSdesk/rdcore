<?php
/**
 * Created by PhpStorm.
 * User: stevenkusters
 * Date: 18/01/2017
 * Time: 16:48
 */

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class ProfilesTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');
        $this->hasMany('ProfileNotes');
        $this->hasMany('Radusergroups', [
            'className'     => 'Radusergroups',
            'foreignKey'	=> 'username',
            'bindingKey'    => 'name',
            'sort'          => ['Radusergroups.priority' => 'ASC'],
            'dependent'     => true
        ]);
        
        $this->hasMany('PermanentUsers',[
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
    
    public function entityBasedOnPost($post_data){
        $entity = false;
        if(isset($post_data['profile_id'])){
            $entity = $this->get($post_data['profile_id']);
        }
        if(isset($post_data['profile'])){ //This is a bit different we will find the entity based on the name provided
            $p_name = $post_data['profile'];          
            $entity = $this->find()->where(['Profiles.name' => $p_name])->first();
        }
        return $entity;
    }
}
