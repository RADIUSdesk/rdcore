<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class ProfileComponentsTable extends Table{


    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');
        $this->hasMany('Radgroupchecks', [
            'className'     => 'Radgroupchecks',
            'foreignKey'	=> 'groupname',
            'bindingKey'    => 'name',
            'sort'          => ['Radgroupchecks.groupname' => 'ASC'],
            'dependent'     => true
        ]);
        
        $this->hasMany('Radgroupreplies', [
            'className'     => 'Radgroupreplies',
            'foreignKey'	=> 'groupname',
            'bindingKey'    => 'name',
            'sort'          => ['Radgroupreplies.groupname' => 'ASC'],
            'dependent'     => true
        ]);
    }
}
