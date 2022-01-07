<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class TopUpTransactionsTable extends Table
{
    public function initialize(array $config)
    {
        $this->addBehavior('Timestamp');  
        $this->belongsTo('TopUps'); 
        $this->belongsTo('PermanentUsers',['propertyName'  => 'real_permanent_user']);
        $this->belongsTo('Users');   
    }
}
