<?php

// src/Model/Table/UserNotesTable.php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Text;

class UserNotesTable extends Table
{

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp');       
        $this->belongsTo('Users');
        $this->belongsTo('Notes');
        
    }
      
}
