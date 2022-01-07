<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RollingLastSevenDaysTable extends Table
{
    public function initialize(array $config)
    {
        $this->table('rolling_last_seven_days');
    }
       
}
