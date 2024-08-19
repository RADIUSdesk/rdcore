<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class MacAddressesTable extends Table{
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');  
        $this->hasMany('NodeStations');
        $this->hasMany('ApStations');
        $this->hasMany('MacActions');
        $this->hasMany('MacAliases');
        
    }  
}
