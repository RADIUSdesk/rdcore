<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class MeshExitsTable extends Table{

    public function initialize(array $config){
    
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Meshes');
        $this->hasMany('MeshExitMeshEntries',['dependent' => true]);
        $this->hasOne('MeshExitCaptivePortals',['dependent' => true]);
        $this->hasOne('OpenvpnServerClients',['dependent' => true]); 
        $this->hasMany('NodeMeshExits',['dependent' => true]);  
        $this->hasMany('MeshExitSettings',['dependent' => true]);    
    }
        
}
