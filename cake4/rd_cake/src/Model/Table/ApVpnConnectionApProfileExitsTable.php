<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;

class ApVpnConnectionApProfileExitsTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->addBehavior('Timestamp');
        $this->belongsTo('ApVpnConnections', [
            'className'     => 'ApVpnConnections',
            'foreignKey'    => 'ap_vpn_connection_id'
        ]);
        $this->belongsTo('ApProfileExits', [
            'className'     => 'ApProfileExits',
            'foreignKey'    => 'ap_profile_exit_id'
        ]);        
    }
}
