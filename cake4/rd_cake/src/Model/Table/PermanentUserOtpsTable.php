<?php

// src/Model/Table/PermanentUserOtpsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class PermanentUserOtpsTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');    
        $this->belongsTo('PermanentUsers');
    }
}
