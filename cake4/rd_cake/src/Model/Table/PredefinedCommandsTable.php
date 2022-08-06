<?php

namespace App\Model\Table;
use Cake\ORM\Table;
class PredefinedCommandsTable extends Table {
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Clouds');  
        $this->hasMany('ScheduleEntries');
    }
}
