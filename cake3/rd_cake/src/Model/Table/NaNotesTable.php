<?php

namespace App\Model\Table;
use Cake\ORM\Table;

class NaNotesTable extends Table{

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');       
        $this->belongsTo('Nas');
        $this->belongsTo('Notes');     
    }    
}
