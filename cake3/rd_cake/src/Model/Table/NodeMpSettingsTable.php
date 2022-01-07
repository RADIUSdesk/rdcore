<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class NodeMpSettingsTable extends Table {

    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('Nodes', [
            'className' => 'Nodes',
            'foreignKey' => 'node_id'
        ]);
    }
}
