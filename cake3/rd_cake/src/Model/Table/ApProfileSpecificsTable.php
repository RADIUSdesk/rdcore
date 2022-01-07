<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ApProfileSpecificsTable extends Table {

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('ApProfiles',[
            'className' => 'ApProfiles',
            'foreignKey' => 'ap_profile_id'
        ]);
    }
}
