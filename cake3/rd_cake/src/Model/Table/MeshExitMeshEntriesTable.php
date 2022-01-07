<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class MeshExitMeshEntriesTable extends Table {

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp');
    
        $this->belongsTo('MeshExits', [
                'className' => 'MeshExits',
                'foreignKey' => 'mesh_exit_id'
            ]);
        $this->belongsTo('MeshEntries', [
                'className' => 'MeshEntries',
                'foreignKey' => 'mesh_entry_id'
            ]);
    }
}
