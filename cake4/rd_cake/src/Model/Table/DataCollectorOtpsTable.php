<?php

// src/Model/Table/DataCollectorOtpsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class DataCollectorOtpsTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');    
        $this->belongsTo('DataCollectors');
    }
}
