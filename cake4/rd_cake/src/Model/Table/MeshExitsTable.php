<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class MeshExitsTable extends Table{

    public function initialize(array $config):void{
    
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Meshes');
    	$this->belongsTo('FirewallProfiles', [
            'className' => 'FirewallProfiles',
            'foreignKey' => 'firewall_profile_id'
        ]);

        $this->belongsTo('SqmProfiles', [
            'className' => 'SqmProfiles',
            'foreignKey' => 'sqm_profile_id'
        ]);

        $this->hasMany('MeshExitMeshEntries',['dependent' => true]);
        $this->hasOne('MeshExitCaptivePortals',['dependent' => true]);
        $this->hasOne('OpenvpnServerClients',['dependent' => true]); 
        $this->hasMany('NodeMeshExits',['dependent' => true]);  
        $this->hasMany('MeshExitSettings',['dependent' => true]);
        $this->hasOne('MeshExitPppoeServers',['dependent' => true]);     
    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();     
        $validator
            ->notEmptyString('type', 'A type is required')
            ->add('vlan', [
                'vlanUnique' => [
                    'message' => 'The VLAN you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'mesh_id']],
                    'provider' => 'table'
                ]
            ]);

        return $validator;
    }
            
}
