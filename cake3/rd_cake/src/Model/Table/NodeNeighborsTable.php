<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class NodeNeighborsTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Nodes', [
            'className'     => 'Nodes',
            'foreignKey'    => 'node_id'
        ]);
        
        $this->belongsTo('Neighbors', [
            'className'     => 'Nodes',
            'foreignKey'    => 'neighbor_id'
        ]);
        
    }  
}
