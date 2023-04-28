<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class FirewallAppsTable extends Table{

    public function initialize(array $config):void{  
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Clouds');
        $this->hasMany('FirewallProfileEntryFirewallApps',['dependent' => true]);
    }
        
}
