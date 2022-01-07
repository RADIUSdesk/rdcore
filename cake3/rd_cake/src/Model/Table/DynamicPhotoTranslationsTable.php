<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class DynamicPhotoTranslationsTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');      
        $this->belongsTo('DynamicPhotos');
        $this->belongsTo('DynamicDetailLanguages');           
    }
       
}
