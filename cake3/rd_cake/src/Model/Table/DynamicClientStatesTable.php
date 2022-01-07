<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class DynamicClientStatesTable extends Table {

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('DynamicClients', [
            'className'     => 'DynamicClients',
            'foreignKey'    => 'dynamic_client_id'
        ]);
    }
}
