<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class DynamicClientMacsTable extends Table {
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->belongsTo('ClientMacs');
        $this->belongsTo('DynamicClients');
    }
}
