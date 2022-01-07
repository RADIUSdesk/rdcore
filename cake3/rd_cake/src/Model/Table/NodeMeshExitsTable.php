<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class NodeMeshExitsTable extends Table {

    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('Nodes', [
                'className' => 'Nodes',
                'foreignKey' => 'node_id'
            ]);
        $this->belongsTo('MeshExits', [
                'className' => 'MeshExits',
                'foreignKey' => 'mesh_exit_id'
            ]);

    }
}

