<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;

class ApProfileEntriesTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('ApProfiles', [
            'className'     => 'ApProfiles',
            'foreignKey'    => 'ap_profile_id'
        ]);
        $this->hasMany('ApProfileExitApProfileEntries', ['dependent' => true]);
        $this->hasMany('ApProfileEntrySchedules', ['dependent' => true]);
        $this->belongsTo('Realms');
        $this->belongsTo('PrivatePsks');
        $this->belongsTo('PasspointProfiles');
    }           
}
