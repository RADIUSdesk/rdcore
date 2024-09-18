<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class NodeStationHourliesTable extends Table{
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Nodes');
        $this->belongsTo('MeshEntries');  
        $this->belongsTo('MacAddresses', [
            'className' => 'MacAddresses',
            'foreignKey' => 'mac_address_id'
        ]);
    }  
}
