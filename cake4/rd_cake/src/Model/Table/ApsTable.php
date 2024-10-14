<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;
use Cake\I18n\FrozenTime;

class ApsTable extends Table {

    public function initialize(array $config):void{
    
        $this->addBehavior('Timestamp');
        //$this->addBehavior('Sluggable');
        $this->belongsTo('ApProfiles', [
            'className' => 'ApProfiles',
            'foreignKey' => 'ap_profile_id'
        ]);
        $this->belongsTo('Schedules');
        
        $this->belongsTo('Networks',[
             'foreignKey' => 'tree_tag_id',
        ]);

        $this->hasMany('ApSystems', ['dependent' => true]);
        $this->hasMany('ApActions', [
                'limit'     => 1
            ]);
            
        $this->hasMany('ApWifiSettings', ['dependent' => true]);
        $this->hasMany('OpenvpnServerClients', ['dependent' => true]);

        $this->hasOne('ApLoads', [['dependent' => true]]);
        $this->hasMany('ApUptmHistories',  [
				//'dependent' => true, //Had to remove the dependent since it failed due to conditions FIXME for further investigation
				'foreignKey'	=> 'ap_id',
				'limit' 		=> '100',
				'order'			=> [
					'ApUptmHistories.state_datetime ASC'
				],
				'conditions'	=> [
					'ApUptmHistories.modified >' => FrozenTime::now()->subHour(24)
				]
			]);
         $this->hasMany('Notifications',  [
				//'dependent' => true, //Had to remove the dependent since it failed due to conditions FIXME for further investigation
				'foreignKey'	=> 'item_id',
				'order'			=> [
					'Notifications.notification_datetime ASC'
				],
				'conditions'	=> [
					"Notifications.item_table = 'aps'"
				]
			]);
         $this->hasMany('ViewNotifications',  [
				'foreignKey'	=> 'object_id',
				'order'			=> [
					'ViewNotifications.notification_datetime ASC'
				],
				'conditions'	=> [
					"ViewNotifications.object_type = 'aps'"
				]
			]);	
			
		$this->hasMany('ApApProfileEntries',  ['dependent' => true]);
        $this->hasMany('ApStaticEntryOverrides',  ['dependent' => true]);		
	    $this->hasMany('ApConnectionSettings', ['dependent' => true]);
	    $this->hasMany('ApSqmStats', ['dependent' => true]);   
    }

    public function validationDefault(Validator $validator):Validator
    {
        $validator = new Validator();
        $validator
            ->notBlank('name','Value is required')
            ->add('name', [
                'nameUnique' => [
                    'message' => 'This Device name is already taken',
                    'rule'    => ['validateUnique', ['scope' => 'ap_profile_id']],
                    'provider' => 'table'
                ]
            ])
            ->notBlank('mac', 'Value is required')
            ->add('mac', [
                'nameUnique' => [
                    'message' => 'This MAC is already taken',
                    'rule' => 'validateUnique',
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
}

