<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ActionsTable extends Table {

    public function initialize(array $config)
    {
        $this->belongsTo('Nas', [
            'className' => 'Nas',
            'foreignKey' => 'na_id'
        ]);
    }
}
