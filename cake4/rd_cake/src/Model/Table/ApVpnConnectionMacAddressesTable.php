<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;

class ApVpnConnectionMacAddressesTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->addBehavior('Timestamp');
        $this->belongsTo('ApVpnConnections', [
            'className'     => 'ApVpnConnections',
            'foreignKey'    => 'ap_vpn_connection_id'
        ]);
        $this->belongsTo('MacAddresses', [
            'className'     => 'MacAddresses',
            'foreignKey'    => 'mac_address_id'
        ]);        
    }
}
