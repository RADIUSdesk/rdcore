<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class DynamicDetailSocialLoginsTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');      
        $this->belongsTo('DynamicDetails');  
        $this->belongsTo('Profiles');
        $this->belongsTo('Realms');             
    }
       
}
