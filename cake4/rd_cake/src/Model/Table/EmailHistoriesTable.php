<?php

// src/Model/Table/EmailHistoriesTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class EmailHistoriesTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');    
        $this->belongsTo('Clouds');
    }
}
