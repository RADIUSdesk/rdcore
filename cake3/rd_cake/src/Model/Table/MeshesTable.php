<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class MeshesTable extends Table{

    public function initialize(array $config){
        
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Users');
        //$this->belongsTo('TreeTags');
        
        $this->belongsTo('Networks',[
             'foreignKey' => 'tree_tag_id',
        ]);
        
        $this->hasMany('Nodes',['dependent' => true]);
        $this->hasOne('NodeSettings',['dependent' => true]);
        $this->hasOne('MeshSettings',['dependent' => true]);
        $this->hasMany('MeshEntries',['dependent' => true]);
        $this->hasMany('MeshExits',['dependent' => true]);
        $this->hasMany('MeshSpecifics',['dependent' => true]);
        $this->hasMany('MeshNotes',['dependent' => true]);
        $this->hasMany('RollingLastHours',['dependent' => true]);
        $this->hasMany('RollingLastDays',['dependent' => true]);
        $this->hasMany('RollingLastSevenDays',['dependent' => true]);
        $this->hasMany('RollingLastThirtyDays',['dependent' => true]);
 
        $this->addBehavior('NamingConvention',
            [
                'convention' => 'RD'
            ]
        );
    }
    
    public function validationDefault(Validator $validator){
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message' => 'The name you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
            
        return $validator;
    }
    
    public function beforeSave($event, $entity, $options){
    
    
    }
    
    public function afterSave($event, $entity, $options){
        //-----
        if ($entity->isNew()){
        
            $id     = $entity->id;
            $format = '%04X';
            $args   = $id;
            $result = sprintf ($format, $args);
            
            if(strlen($result) > 4){
                $result = substr($result,0,4);
            }
            $formatted = str_split($result,2);
               
            Configure::load('MESHdesk');
            $initial_value  = Configure::read('MEHSdesk.bssid');
          
            $pieces         = explode(":", $initial_value);
            $new_bssid      = $pieces[0].":".$pieces[1].":".$pieces[2].":".$pieces[3].":".$formatted[0].":".$formatted[1];
            $new_ssid       = str_replace(":", "_", "$new_bssid");
            
            $entity->ssid   = $new_ssid;
            $entity->bssid  = $new_bssid;      
            $this->save($entity);
        }  
    }   
}
