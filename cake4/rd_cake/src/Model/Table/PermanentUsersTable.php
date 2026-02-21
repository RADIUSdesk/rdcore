<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;
use Cake\Event\EventInterface;
use Cake\I18n\FrozenTime;
use Cake\Datasource\EntityInterface;

class PermanentUsersTable extends Table{

    public function initialize(array $config): void{
        parent::initialize($config);

        $this->addBehavior('Timestamp');
        $this->addBehavior('FreeRadius', [
            'for_model' => 'PermanentUsers'
        ]);
        $this->addBehavior('Ppsk');

        $this->belongsTo('Clouds');
        $this->belongsTo('Countries');
        $this->belongsTo('Languages');
        $this->belongsTo('Profiles', ['propertyName' => 'real_profile']);
        $this->belongsTo('Realms', ['propertyName' => 'real_realm']);
        $this->belongsTo('RealmVlans');

        $this->hasMany('Devices', ['dependent' => true, 'cascadeCallbacks' => true]);
        $this->hasMany('TopUps', ['dependent' => true, 'cascadeCallbacks' => true]);

        $this->hasMany('Radchecks', [
            'dependent' => true,
            'cascadeCallbacks' => true,
            'foreignKey' => 'username',
            'bindingKey' => 'username'
        ]);

        $this->hasMany('Radreplies', [
            'dependent' => true,
            'cascadeCallbacks' => true,
            'foreignKey' => 'username',
            'bindingKey' => 'username'
        ]);

        $this->hasOne('PermanentUserOtps', ['dependent' => true]);
    }

    public function beforeMarshal(
        EventInterface $event,
        \ArrayObject $data,
        \ArrayObject $options
    ): void {
        if (!empty($data['mac_address'])) {
            $data['mac_address'] = strtoupper((string)$data['mac_address']);
        }
    }

    public function validationDefault(Validator $validator): Validator {
    
        $validator
            ->notEmptyString('username', 'A name is required')
            ->add('username', [
                'nameUnique' => [
                    'message' => 'The username you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique',
                    'provider' => 'table'
                ]
            ])
            ->allowEmptyString('static_ip')
            ->add('static_ip', [
                'nameUnique' => [
                    'message' => 'The Static IP Address is already taken',
                    'rule' => ['validateUnique', ['scope' => 'realm_id']],
                    'provider' => 'table'
                ]
            ])
            ->allowEmptyString('mac_address')
            ->add('mac_address', [
                'nameUnique' => [
                    'message' => 'The MAC Address is already taken',
                    'rule' => ['validateUnique'],
                    'provider' => 'table'
                ],
            ])
            ->add('mac_address', 'format', [
                'rule' => ['custom', '/^([0-9A-F]{2}-){5}[0-9A-F]{2}$/'],
                'message' => 'Invalid MAC address format'
            ])
            ->allowEmptyString('ppsk')
            ->add('ppsk', [
                'nameUnique' => [
                    'message' => 'The PPSK you provided is already taken. Please provide another one.',
                    'rule' => ['validateUnique', ['scope' => 'realm_id']],
                    'provider' => 'table'
                ]
            ]);

        return $validator;
    }

    public function beforeSave(
        EventInterface $event,
        EntityInterface $entity,
        \ArrayObject $options
    ): void {
        if ($entity->to_date instanceof FrozenTime) {
            if ($entity->to_date < FrozenTime::now()) {
                $entity->admin_state = 'expired';
            } elseif ($entity->admin_state === 'expired') {
                $entity->admin_state = 'active';
            }
        }
    }
}
