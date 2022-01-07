<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class NodeStationsDailiesTable extends Table{
    public function initialize(array $config){
        //$this->belongsTo('Meshes'); 
        $this->belongsTo('Nodes');
        //$this->belongsTo('MeshEntries');
    }  
}
