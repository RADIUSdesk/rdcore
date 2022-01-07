<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class NodeSystemsTable extends Table {

    public function initialize(array $config){
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Nodes');
    }  
}
