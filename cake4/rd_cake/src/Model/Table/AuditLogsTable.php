<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Database\Schema\TableSchemaInterface;

class AuditLogsTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('Users', [
            'className'     => 'Users',
            'foreignKey'    => 'user_id'
        ]);
        
    }
    protected function _initializeSchema(\Cake\Database\Schema\TableSchemaInterface $schema):TableSchemaInterface{
        $schema->setColumnType('changes', 'json');

        return $schema;
    }
}
