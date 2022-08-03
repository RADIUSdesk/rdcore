<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RadpostauthsTable extends Table
{
    public function initialize(array $config):void
    {
        $this->setTable('radpostauth');
    }
       
}
