<?php
/**
 * Created by PhpStorm.
 * User: stevenkusters
 * Date: 19/01/2017
 * Time: 01:20
 */

namespace App\Model\Table;


use Cake\ORM\Table;

class RadgroupchecksTable extends Table
{
    public function initialize(array $config)
    {
        $this->addBehavior('Timestamp');
        $this->table('radgroupcheck'); 
        $this->belongsTo('ProfileComponents',[
            'className'    => 'ProfileComponents',
            'foreignKey'   => 'groupname',
            'bindingKey'   => 'name'
        ]);   
    }
}
