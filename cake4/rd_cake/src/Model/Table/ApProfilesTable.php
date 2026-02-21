<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class ApProfilesTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Clouds');
        $this->hasMany('Aps', ['dependent' => true]);
        $this->hasMany('ApProfileEntries', ['dependent' => true]);
        $this->hasOne('ApProfileSettings', ['dependent' => true]);
        $this->hasMany('ApProfileSpecifics', ['dependent' => true]);
        $this->hasMany('ApProfileExits', ['dependent' => true]);
    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message'   => 'The name you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'cloud_id']],
                    'provider'  => 'table'
                ]
            ]);
        return $validator;
    }   
}
