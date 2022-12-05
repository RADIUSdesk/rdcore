<?php

// src/Model/Table/NaSettingsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class NaSettingsTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');    
        $this->belongsTo('Nas');
    }
}
