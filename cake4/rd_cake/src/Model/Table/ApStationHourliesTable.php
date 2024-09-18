<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ApStationHourliesTable extends Table {

    public function initialize(array $config):void{
    
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('Aps', [
            'className' => 'Aps',
            'foreignKey' => 'ap_id'
        ]);
        
        $this->belongsTo('ApProfileEntries', [
            'className' => 'ApProfileEntries',
            'foreignKey' => 'ap_profile_entry_id'
        ]);
        
        $this->belongsTo('MacAddresses', [
            'className' => 'MacAddresses',
            'foreignKey' => 'mac_address_id'
        ]);
    }
}
