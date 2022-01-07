<?php
namespace App\Model\Table;

use Cake\ORM\Table;

class ApProfileExitApProfileEntriesTable extends Table {

    public function initialize(array $config){
    
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
