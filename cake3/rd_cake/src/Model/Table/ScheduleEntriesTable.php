<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ScheduleEntriesTable extends Table{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Schedules');
        $this->belongsTo('PredefinedCommands');
    }
}
