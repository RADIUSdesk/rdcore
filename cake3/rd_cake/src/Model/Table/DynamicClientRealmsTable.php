<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class DynamicClientRealmsTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');  
        $this->belongsTo('DynamicClients',[
            'foreign_key' => 'dynamic_client_id'
        ]);
        $this->belongsTo('Realms');      
    }      
}
