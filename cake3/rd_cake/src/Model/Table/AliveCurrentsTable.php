<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class AliveCurrentsTable extends Table
{
    public function initialize(array $config){
        $this->belongsTo('DynamicClients',[
            'foreignKey' => 'nasidentifier',
            'bindingKey' => 'nasidentifier'
        ]);
    }      
}
