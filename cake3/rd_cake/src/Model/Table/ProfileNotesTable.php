<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class ProfileNotesTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('Profiles');
        $this->belongsTo('Notes');
    }
       
}
