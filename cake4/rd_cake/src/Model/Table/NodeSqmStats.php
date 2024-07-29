<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class NodeSqmStatsTable extends Table {

    public function initialize(array $config):void{
    
        $this->addBehavior('Timestamp');  
        $this->belongsTo('MeshExits');
        $this->belongsTo('Nodes');
    }
         
}

?>

