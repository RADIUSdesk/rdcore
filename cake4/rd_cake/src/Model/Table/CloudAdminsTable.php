<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;

class CloudAdminsTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->addBehavior('Timestamp');           
     	$this->belongsTo('Clouds', [
            'className'     => 'Clouds',
            'foreignKey'    => 'cloud_id'
        ]);
        $this->belongsTo('Users', [
            'className'     => 'Users',
            'foreignKey'    => 'user_id'
        ]);                   
    }      
}
