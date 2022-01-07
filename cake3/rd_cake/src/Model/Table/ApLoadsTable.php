<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ApLoadsTable extends Table {

    public function initialize(array $config){
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('Aps',[
            'className' => 'Aps',
            'foreignKey' => 'ap_id'
        ]);
    }
}
