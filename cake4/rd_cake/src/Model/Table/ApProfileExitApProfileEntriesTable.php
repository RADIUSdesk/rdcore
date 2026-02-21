<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;

class ApProfileExitApProfileEntriesTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('ApProfileExits', [
                'className' => 'ApProfileExits',
                'foreignKey' => 'ap_profile_exit_id'
            ]);
        $this->belongsTo('ApProfileEntries', [
                'className' => 'ApProfileEntries',
                'foreignKey' => 'ap_profile_entry_id'
            ]);
    }
}
