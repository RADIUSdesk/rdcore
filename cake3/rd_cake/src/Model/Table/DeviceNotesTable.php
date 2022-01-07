<?php

// src/Model/Table/PermenentUserNotesTable.php

namespace App\Model\Table;
use Cake\ORM\Table;

class DeviceNotesTable extends Table
{
    public function initialize(array $config){
    
        $this->addBehavior('Timestamp');       
        $this->belongsTo('Devices');
        $this->belongsTo('Notes');    
    }     
}
