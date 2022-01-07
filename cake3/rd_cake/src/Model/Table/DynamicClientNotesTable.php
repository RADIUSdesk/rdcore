<?php

namespace App\Model\Table;
use Cake\ORM\Table;

class DynamicClientNotesTable extends Table{

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');       
        $this->belongsTo('DynamicClients');
        $this->belongsTo('Notes');     
    }    
}
