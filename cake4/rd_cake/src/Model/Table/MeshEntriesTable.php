<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class MeshEntriesTable extends Table
{
    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Meshes');
        $this->hasMany('MeshExitMeshEntries',['dependent' => true]);
        $this->hasMany('NodeMeshEntries',['dependent' => true]);
        $this->hasMany('NodeStations',['dependent' => true]);
        $this->hasMany('MeshEntrySchedules',['dependent' => true]);
        $this->belongsTo('Realms');
        $this->belongsTo('PrivatePsks');
        $this->belongsTo('PasspointProfiles');
    }
        
}
