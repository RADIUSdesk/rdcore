<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RadacctsTable extends Table
{
    public function initialize(array $config)
    {
        $this->table('radacct');
        $this->hasMany('UserStats',['dependent' => true]);
    }
       
}
