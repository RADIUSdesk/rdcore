<?php
// src/Model/Table/IpPoolsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class IpPoolsTable extends Table
{
    public function initialize(array $config)
    {
        $this->setTable('radippool');

        $this->addBehavior('Timestamp');
        $this->belongsTo('Users', [
            'className'     => 'PermanentUser',
            'foreignKey' => 'permanent_user_id'
        ]);
    }
}

