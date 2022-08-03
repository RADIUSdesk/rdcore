<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class RadgrouprepliesTable extends Table {
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->setTable('radgroupreply');
        $this->belongsTo('ProfileComponents',[
            'className'    => 'ProfileComponents',
            'foreignKey'   => 'groupname',
            'bindingKey'   => 'name'
        ]);   
    }
}
