<?php

// src/Model/Table/DynamicClientSettingsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class DynamicClientSettingsTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');    
        $this->belongsTo('DynamicClients');
    }
}
