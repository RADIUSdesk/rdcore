<?php

// src/Model/Table/DynamicDetailMobilesTable.php

namespace App\Model\Table;
use Cake\ORM\Table;

class DynamicDetailMobilesTable extends Table{
    public function initialize(array $config){  
        $this->addBehavior('Timestamp');       
        $this->belongsTo('DynamicDetails'); 
    }     
}
