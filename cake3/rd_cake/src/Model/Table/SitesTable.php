<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class SitesTable extends Table {

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');
        $this->belongsTo('Clouds');
        $this->hasMany('Networks',[
            'dependent' => true
        ]);
    }
}
