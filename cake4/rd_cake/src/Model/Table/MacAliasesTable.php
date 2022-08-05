<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class MacAliasesTable extends Table
{
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('mac', 'A MAC is required')
            ->notEmpty('alias', 'An Alias is required');
        return $validator;
    }       
}
