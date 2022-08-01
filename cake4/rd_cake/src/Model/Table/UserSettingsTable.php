<?php

// src/Model/Table/UserSettingsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class UserSettingsTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');    
        $this->belongsTo('Users');
    }
}
