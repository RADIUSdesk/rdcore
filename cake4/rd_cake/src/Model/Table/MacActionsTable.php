<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class MacActionsTable extends Table {
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->belongsTo('MacAddresses');
        $this->belongsTo('Meshes');
        $this->belongsTo('ApProfiles');
        $this->belongsTo('FirewallProfiles');
    }
}
