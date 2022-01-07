<?php

namespace App\Model\Behavior;

use Cake\ORM\Behavior;
use Cake\ORM\TableRegistry;
use Cake\Routing\Router;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class NamingConventionBehavior extends Behavior {

    protected $_defaultConfig = [
        'convention' => '555' //In future we can add more conventions
    ];
    protected $conventionActive = false;
    
    protected $indiaStates = [
    	'ANDHRAPRADESH',
        'ARUNACHALPRADESH',
        'ASSAM',
        'BIHAR',
        'CHHATTISGARH',
        'KARNATAKA',
        'MADHYAPRADESH',
        'ORISSA',
        'UTTARAKHAND'
    ];
    
    protected $treeTagId = null;

    public function initialize(array $config){
        // Some initialization code here
        $this->TreeTags    = TableRegistry::get('TreeTags'); 
        Configure::load('MESHdesk');
        $this->conventionActive =  Configure::read('MEHSdesk.enforce_naming_convention');  
    }
    
    public function buildValidator($event, $validator, $name){
        $naming_convention = Configure::read('MEHSdesk.enforce_naming_convention');  
        if($this->conventionActive){ //We are enforcing a naming convention
            $config = $this->config();
            if($config['convention']== '555'){
                $this->_forCscBuildValidator($validator);
            }
        }
    }
    
    public function beforeSave($event, $entity){   
        if($this->conventionActive){ //We are enforcing a naming convention
            $config = $this->config();
            if($config['convention']== '555'){
                $this->_forCscBeforeSave($entity);
            }
        }  
    }
    
    private function _forCscBuildValidator($validator){
        $validator->add('name', 'custom', [
                'rule' => function ($value, $context){
                // Custom logic that returns true/false
                return $this->_cscRules($value);
            },
            'message' => 'Name not in format of [STATE] [DISTRICT] [BLOCK] GP [GP]'
        ]);
    } 
    
    private function  _forCscBeforeSave($entity){
        $entity->name           = strtoupper($entity->name); //Upper Case
        $entity->name           = trim($entity->name); //Remove leading and trailing spaces
        $entity->name           = preg_replace('/\s+/', ' ',$entity->name); //Remove double spaces
        $entity->tree_tag_id    = $this->treeTagId; //Tree Tag Id should have been set with the Valid check
    }
  
    private function _cscRules($value){
       
        $pieces  = explode(" ", $value);
        if(count($pieces) < 5 ){
            return false;
        }
        $state      = $pieces[0];
        $district   = $pieces[1];
        $block      = $pieces[2];
        $gp         = $pieces[3]; 

        if (in_array($state, $this->indiaStates) == false) {
            return false;
        }    
        
        if($gp !== 'GP'){
            //Try the KARNATAKA BENGALURU RURAL DEVANHALLI GP KUNDANA
            if(($pieces[2] == 'RURAL')||($pieces[2] == 'URBAN')){
                $state      = $pieces[0];
                $district   = $pieces[1].' '.$pieces[2];
                $block      = $pieces[3];
                if(count($pieces) < 6 ){
                    return false;
                }
                $this->_cscDoTreeTag($state,$district,$block);
                return true;          
            }
        }else{
            $this->_cscDoTreeTag($state,$district,$block);
            return true;
        }
        return false;
    }
    
    private function _cscDoTreeTag($state,$district,$block){
        $q_state = $this->{'TreeTags'}->find()->where(['TreeTags.name' => $state])->first();  
        $state_id = false;
        
        if($q_state){
            $state_id = $q_state->id;     
        }else{
            $d              =[];
            $d['parent_id'] = null;
            $d['name']      = $state;
            $e_state        = $this->{'TreeTags'}->newEntity($d);
            if ($this->{'TreeTags'}->save($e_state)) {
                $state_id = $e_state->id;
            }
        }
        
        if($state_id){
            $district_id = false;
            $q_district = $this->{'TreeTags'}->find()->where(['TreeTags.name' => $district,'TreeTags.parent_id' => $state_id])->first();
            if($q_district){
                $district_id = $q_district->id;
            }else{
                $d              =[];
                $d['parent_id'] = $state_id;
                $d['name']      = $district;
                $e_district     = $this->{'TreeTags'}->newEntity($d);
                if ($this->{'TreeTags'}->save($e_district)) {
                    $district_id = $e_district->id;
                }
            }
            
            if($district_id){
                $block_id = false;
                $q_block = $this->{'TreeTags'}->find()->where(['TreeTags.name' => $block,'TreeTags.parent_id' => $district_id])->first();
                if($q_block){
                    $block_id = $q_block->id;
                }else{
                    $d              =[];
                    $d['parent_id'] = $district_id;
                    $d['name']      = $block;
                    $e_block        = $this->{'TreeTags'}->newEntity($d);
                    if ($this->{'TreeTags'}->save($e_block)) {
                        $block_id = $e_block->id;
                    }
                }
                
                if($block_id){
                    $this->treeTagId = $block_id;
                }   
            }
        }
    }
}

?>
