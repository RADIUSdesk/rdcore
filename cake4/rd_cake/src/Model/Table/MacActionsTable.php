<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class MacActionsTable extends Table {
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->belongsTo('ClientMacs');
        $this->belongsTo('Meshes');
        $this->belongsTo('ApProfiles');
    }
}
