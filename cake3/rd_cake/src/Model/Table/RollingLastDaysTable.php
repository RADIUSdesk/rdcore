<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RollingLastDaysTable extends Table
{
    public function initialize(array $config)
    {
        $this->table('rolling_last_day');
    }
       
}
