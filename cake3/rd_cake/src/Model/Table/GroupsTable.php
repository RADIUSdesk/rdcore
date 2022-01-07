<?php

// src/Model/Table/GroupsTable.php

namespace App\Model\Table;

use Cake\ORM\Table;

class GroupsTable extends Table
{
    public function initialize(array $config)
    {
        $this->addBehavior('Timestamp'); 
        $this->addBehavior('Acl.Acl', ['type' => 'requester']); 
        $this->hasMany('Users');    
    }
}
