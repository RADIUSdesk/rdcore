<?php

namespace App\Model\Table;

use Cake\ORM\Table;

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
        $this->hasMany('ApProfileExitApProfileEntries', ['dependent' => true]);
        $this->hasMany('OpenvpnServerClients', ['dependent' => true]);
        $this->hasOne('ApProfileExitCaptivePortals', ['dependent' => true]);
        $this->hasMany('ApProfileExitSettings', ['dependent' => true]);
        $this->hasOne('ApProfileExitPppoeServers', ['dependent' => true]);
    }
}
