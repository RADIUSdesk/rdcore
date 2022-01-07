<?php

namespace App\Model\Table;

use Cake\Log\LogTrait;
use Cake\ORM\Table;

class ApProfileNotesTable extends Table {

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('ApProfiles', [
            'className' => 'ApProfiles',
            'foreignKey' => 'ap_profile_id'
        ]);
        $this->belongsTo('Notes', [
            'className' => 'Notes',
            'foreignKey' => 'note_id'
        ]);
    }

    /* FFC
        Determine behaviour of events
    */

    //Get the note ID before we delete it
    public function beforeDelete($event, $entity){
        if($entity->id){
            $q_r = $this->get($entity->id);
            $entity->note_id  = $q_r->note_id;
        }
        return true;
    }

    public function afterDelete($event, $entity){
        if($entity->note_id){
            $dltEntity = $this->Notes->get($entity->note_id);
            $this->Notes->delete($dltEntity);
        }
    }
}
