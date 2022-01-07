<?php

// src/Model/Table/PermenentUserNotesTable.php

namespace App\Model\Table;
use Cake\ORM\Table;

class PermanentUserNotesTable extends Table
{
    public function initialize(array $config){
    
        $this->addBehavior('Timestamp');       
        $this->belongsTo('PermanentUsers');
        $this->belongsTo('Notes');    
    }     
}
