<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class AlertsTable extends Table {
    public function initialize(array $config){
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('Aps');
        $this->belongsTo('ApProfiles');
        $this->belongsTo('Nodes');
        $this->belongsTo('Meshes');
        $this->belongsTo('Users');
    }
}
