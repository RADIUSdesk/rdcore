<?php

// src/Model/Table/ClientOtpsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class ClientOtpsTable extends Table {
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');    
        $this->belongsTo('Clients');
    }
}
