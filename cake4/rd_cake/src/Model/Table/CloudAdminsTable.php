<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class CloudAdminsTable extends Table
{
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');           
     	$this->belongsTo('Clouds', [
            'className' => 'Clouds',
            'foreignKey' => 'cloud_id'
        ]);
        $this->belongsTo('Users', [
            'className' => 'Users',
            'foreignKey' => 'user_id'
        ]);                   
    }      
}
