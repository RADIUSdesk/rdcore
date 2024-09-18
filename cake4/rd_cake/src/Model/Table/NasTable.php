<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class NasTable extends Table
{
    public function initialize(array $config):void
    {
        $this->addBehavior('Timestamp');
        $this->belongsTo('Clouds');      
        $this->hasMany('NaRealms',['dependent' => true]); //Do not delete Realms when deleting NAS 
        $this->hasMany('NaSettings',['dependent' => true]);
        $this->hasMany('NaStates',   [
				'dependent' => true,
				'limit'     => 1,
				'order'			=> [
					'NaStates.created DESC'
				]
			]);
        $this->setTable('nas');
    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('nasname', 'A name is required')
            ->add('nasname', [ 
                'nameUnique' => [
                    'message' => 'The nasname you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ])
            ->notEmpty('shortname', 'A value is required')
            ->add('shortname', [ 
                'nameUnique' => [
                    'message' => 'The shortname you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'cloud_id']],
                    'provider'  => 'table'
                ]
            ]);
        return $validator;
    }
}
       
