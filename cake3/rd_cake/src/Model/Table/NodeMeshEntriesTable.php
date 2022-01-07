<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class NodeMeshEntriesTable extends Table {

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');
        $this->belongsTo('Nodes', [
                'className' => 'Nodes',
                'foreignKey' => 'node_id'
            ]);
        $this->belongsTo('MeshEntries', [
            'className' => 'MeshEntries',
            'foreignKey' => 'mesh_entry_id'
        ]);
    }
}
