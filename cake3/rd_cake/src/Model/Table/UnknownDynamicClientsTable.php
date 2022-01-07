<?php
namespace App\Model\Table;
use Cake\ORM\Table;

class UnknownDynamicClientsTable extends Table {
    public function initialize(array $config){
        $this->addBehavior('Timestamp');
    }
}   
