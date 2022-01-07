<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class NodeStationsTable extends Table{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Nodes');
        $this->belongsTo('MeshEntries');
        $this->hasMany('NodeEntries');
    }  
}
