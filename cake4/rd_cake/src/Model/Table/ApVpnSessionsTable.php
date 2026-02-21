<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;

class ApVpnSessionsTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->belongsTo('ApVpnConnections');       
    }
}
