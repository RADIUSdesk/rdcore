<?php
/**
 * Created by PhpStorm.
 * User: stevenkusters
 * Date: 19/01/2017
 * Time: 01:18
 */

namespace App\Model\Table;
use Cake\ORM\Table;

class RadusergroupsTable extends Table{

    public function initialize(array $config){
       $this->table('radusergroup');
        
       $this->belongsTo('Profiles', [
            'foreignKey' => 'username'
        ]);
       
        $this->hasMany('Radgroupchecks',[
            'className'     => 'Radgroupchecks',
            'foreignKey'	=> 'groupname',
            'bindingKey'    => 'groupname',
            'sort'          => ['Radgroupchecks.attribute' => 'ASC'],
            'dependent'     => true
        ]);
               
    }
}
