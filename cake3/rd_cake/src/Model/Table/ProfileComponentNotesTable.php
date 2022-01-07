<?php

namespace App\Model\Table;
use Cake\ORM\Table;

class ProfileComponentNotesTable extends Table{

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');       
        $this->belongsTo('ProfileComponents');
        $this->belongsTo('Notes');     
    }    
}
