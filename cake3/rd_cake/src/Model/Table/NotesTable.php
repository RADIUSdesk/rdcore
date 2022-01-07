<?php

// src/Model/Table/NotesTable.php

namespace App\Model\Table;
use Cake\ORM\Table;

class NotesTable extends Table
{
    public function initialize(array $config){  
        $this->addBehavior('Timestamp');       
        $this->belongsTo('Users');     
        $this->hasMany('UserNotes',['dependent' => true]);
        $this->hasMany('TagNotes',['dependent' => true]);
        $this->hasMany('RealmNotes',['dependent' => true]);
        $this->hasMany('DynamicDetailNotes',['dependent' => true]);
        $this->hasMany('ProfileNotes',['dependent' => true]);
        
        $this->hasMany('PermanentUserNotes',['dependent' => true]);
        $this->hasMany('DeviceNotes',['dependent' => true]);
        
        $this->hasMany('NaNotes',['dependent' => true]);
        $this->hasMany('DynamicClientNotes',['dependent' => true]);
        
        $this->hasMany('MeshNotes',['dependent' => true]); 
        
        $this->hasMany('ProfileComponentNotes',['dependent' => true]);

        $this->hasMany('ApProfileNotes',['dependent' => true, 'cascadeCallbacks' => true]);
    }
      
}
