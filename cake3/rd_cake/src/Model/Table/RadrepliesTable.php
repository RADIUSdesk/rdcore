<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RadrepliesTable extends Table
{
    public function initialize(array $config)
    {
        $this->table('radreply');
    }
       
}
