<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RollingLastThirtyDaysTable extends Table
{
    public function initialize(array $config)
    {
        $this->table('rolling_last_thirty_days');
    }
       
}
