<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ChecksTable extends Table {

    public function initialize(array $config)
    {
        $this->setTable('checks');
    }
}