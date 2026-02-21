<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;

class AlertsTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('Aps');
        $this->belongsTo('ApProfiles');
        $this->belongsTo('Nodes');
        $this->belongsTo('Meshes');
        $this->belongsTo('Users');
    }
}
