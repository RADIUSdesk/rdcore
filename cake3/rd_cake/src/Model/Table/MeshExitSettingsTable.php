<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class MeshExitSettingsTable extends Table{

    public function initialize(array $config){ 
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('MeshExits', [
            'className'     => 'MeshExits',
            'foreignKey'    => 'mesh_exit_id'
        ]);
    }
        
}
