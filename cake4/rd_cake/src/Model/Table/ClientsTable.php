<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;


class ClientsTable extends Table
{
    /**
     * Initialize method
     *
     * @param array<string, mixed> $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('clients');
        $this->setDisplayField('username');
        $this->setPrimaryKey('id');
        $this->addBehavior('Timestamp');
        
        $this->hasMany('PermanentUsers',[
            'dependent' => false
        ]);
        
        $this->hasMany('Aps',[
            'dependent' => false
        ]);
        
        $this->hasMany('Nodes',[
            'dependent' => false
        ]);
        
        $this->hasOne('ClientOtps', ['dependent' => true]);
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator): Validator
    {
        $validator
        //    ->username('email')
            ->requirePresence('username', 'create')
            ->notEmptyString('username')
            ->add('username', [ 
                'nameUnique' => [
                    'message' => 'The username you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);

        $validator
            ->scalar('password')
            ->maxLength('password', 255)
            ->requirePresence('password', 'create')
            ->notEmptyString('password');

        $validator
            ->uuid('token')
            ->allowEmptyString('token'); // This makes it optional

        return $validator;
    }
      
}
