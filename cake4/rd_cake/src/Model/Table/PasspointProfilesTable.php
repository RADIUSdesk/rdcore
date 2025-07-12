<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class PasspointProfilesTable extends Table {

    public function initialize(array $config):void{  
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Clouds');
        $this->belongsTo('PasspointNetworkTypes'); 
        $this->belongsTo('PasspointVenueGroups');
        $this->belongsTo('PasspointVenueGroupTypes');
        
        //Delete the 'hasMany' items...
        $this->hasMany('PasspointDomains',['dependent' => true]);
        $this->hasMany('PasspointNaiRealms',['dependent' => true]); 
        $this->hasMany('PasspointRcois',['dependent' => true]); 
        $this->hasMany('PasspointCellNetworks',['dependent' => true]);
        $this->hasMany('PasspointProfileSettings',['dependent' => true]);
        
        //Dont delete these ones
        $this->hasMany('ApProfileEntries',['dependent' => false]);
        $this->hasMany('MeshEntries',['dependent' => false]);
    }
      
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message'   => 'The name you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'cloud_id']],
                    'provider'  => 'table'
                ]
            ]);           
        return $validator;
    }      
}

