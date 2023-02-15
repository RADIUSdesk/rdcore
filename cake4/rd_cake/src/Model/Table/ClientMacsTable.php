<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ClientMacsTable extends Table {

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->hasMany('MacActions', ['dependent' => true]);
    }
}
