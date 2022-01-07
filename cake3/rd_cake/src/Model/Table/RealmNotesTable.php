<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RealmNotesTable extends Table
{
    public function initialize(array $config){
        $this->addBehavior('Timestamp');       
        $this->belongsTo('Notes');
        $this->belongsTo('Realms');     
    }
      
}
