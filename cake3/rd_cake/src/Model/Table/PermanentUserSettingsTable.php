<?php

// src/Model/Table/PermanentUserSettingsTable.php

namespace App\Model\Table;
use Cake\ORM\Table;

class PermanentUserSettingsTable extends Table
{
    public function initialize(array $config){  
        $this->addBehavior('Timestamp');       
        $this->belongsTo('PermanentUsers');        
    }     
}
