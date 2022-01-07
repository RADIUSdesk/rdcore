<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RadchecksTable extends Table
{
    public function initialize(array $config)
    {
        $this->setTable('radcheck');
    }
       
}
