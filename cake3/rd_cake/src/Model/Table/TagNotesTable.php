<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Text;

class TagNotesTable extends Table
{

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp');       
        $this->belongsTo('Tags');
        $this->belongsTo('Notes');
        
    }
      
}
