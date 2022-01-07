<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class CloudsTable extends Table {

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');
        $this->hasMany('Sites',[
            'dependent' => true
        ]);
    }
}
