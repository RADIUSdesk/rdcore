<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ApActionsTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('Aps');
    }
}
