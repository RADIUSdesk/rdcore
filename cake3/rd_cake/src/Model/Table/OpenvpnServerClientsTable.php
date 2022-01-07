<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class OpenvpnServerClientsTable extends Table {
	
    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('OpenvpnServers');    
        $this->belongsTo('Meshes');    
        $this->belongsTo('MeshExits');    
        $this->belongsTo('ApProfiles');    
        $this->belongsTo('ApProfileExits');    
        $this->belongsTo('Aps');    
    }
    
       
}
?>
