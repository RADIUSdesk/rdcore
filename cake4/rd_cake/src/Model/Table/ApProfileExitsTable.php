<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class ApProfileExitsTable extends Table {

    public function initialize(array $config):void{
    
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('ApProfiles', [
                'className' => 'ApProfiles',
                'foreignKey' => 'ap_profile_id'
            ]);
        $this->belongsTo('DynamicDetails', [
                'className' => 'DynamicDetails',
                'foreignKey' => 'dynamic_detail_id'
            ]);
        $this->belongsTo('OpenvpnServers', [
                'className'     => 'OpenvpnServers',
                'foreignKey'    => 'openvpn_server_id'
            ]);
        $this->belongsTo('FirewallProfiles', [
                'className' => 'FirewallProfiles',
                'foreignKey' => 'firewall_profile_id'
            ]);

        $this->belongsTo('SqmProfiles', [
                'className' => 'SqmProfiles',
                'foreignKey' => 'sqm_profile_id'
            ]);


        $this->hasMany('ApProfileExitApProfileEntries', ['dependent' => true]);
        $this->hasMany('OpenvpnServerClients', ['dependent' => true]);
        $this->hasOne('ApProfileExitCaptivePortals', ['dependent' => true]);
        $this->hasMany('ApProfileExitSettings', ['dependent' => true]);
        $this->hasOne('ApProfileExitPppoeServers', ['dependent' => true]);
    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('type', 'A type is required')
            ->add('vlan', [ 
                'vlanUnique' => [
                    'message' => 'The VLAN you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'ap_profile_id']], 
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
}
