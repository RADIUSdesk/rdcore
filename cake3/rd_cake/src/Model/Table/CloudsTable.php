<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class CloudsTable extends Table {

    public function initialize(array $config){  
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');
        
       	$this->hasMany('TopUps',[
            'dependent' => true
        ]);
        $this->hasMany('Hardwares',[
            'dependent' => true
        ]);
        
        $this->hasMany('Sites',[
            'dependent' => true
        ]);
        
        $this->hasMany('CloudAdmins',['dependent' => true]);
    }
}
