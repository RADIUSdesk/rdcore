<?php

// src/Model/Table/SmsHistoriesTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class SmsHistoriesTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');    
        $this->belongsTo('Clouds');
    }
}
