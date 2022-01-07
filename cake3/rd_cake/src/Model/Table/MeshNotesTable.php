<?php

namespace App\Model\Table;
use Cake\ORM\Table;

class MeshNotesTable extends Table{

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');       
        $this->belongsTo('Mesh');
        $this->belongsTo('Notes');     
    }    
}
