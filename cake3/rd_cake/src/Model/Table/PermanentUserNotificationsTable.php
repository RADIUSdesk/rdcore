<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class PermanentUserNotificationsTable extends Table {

    public function initialize(array $config)
    {
        $this->belongsTo('PermanentUsers', [
            'className' => 'PermanentUsers',
            'foreignKey' => 'permanent_user_id'
        ]);
    }

}
