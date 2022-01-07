<?php

// src/Model/Table/GlobalDomainGlobalTagsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class NaTagsTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Nas'); 
        $this->belongsTo('Tags');      
    }      
}
