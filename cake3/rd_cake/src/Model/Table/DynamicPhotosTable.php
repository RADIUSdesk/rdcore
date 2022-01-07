<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class DynamicPhotosTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');      
        $this->belongsTo('DynamicDetails');    
        $this->hasMany('DynamicPhotoTranslations',['dependent' => true]);             
    }
       
}
