<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ApStationsTable extends Table {

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('Aps', [
            'className' => 'Aps',
            'foreignKey' => 'ap_id'
        ]);
        $this->belongsTo('ApProfileEntries', [
            'className' => 'ApProfileEntries',
            'foreignKey' => 'ap_profile_entry_id'
        ]);
    }
}
