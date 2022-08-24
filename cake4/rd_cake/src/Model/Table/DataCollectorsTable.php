<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class DataCollectorsTable extends Table
{
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');        
        $this->belongsTo('DynamicDetails', [
            'className' => 'DynamicDetails',
            'foreignKey' => 'dynamic_detail_id'
        ]);  
    }
       
}
