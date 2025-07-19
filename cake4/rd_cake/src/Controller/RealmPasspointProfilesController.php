<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class RealmPasspointProfilesController extends AppController{
  
    protected $main_model   = 'RealmPasspointProfiles';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('RealmPasspointProfiles');   
        $this->loadModel('RealmPasspointNaiRealms');
        $this->loadModel('RealmPasspointRcois');               
        $this->loadComponent('JsonErrors');     
    }
    
    public function view(){    
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $req_q      = $this->request->getQuery(); //q_data is the query data
        
        $realm_id   = $req_q['realm_id'];
        
        $entity = $this->{$this->main_model}->find()
            ->where(['RealmPasspointProfiles.realm_id' => $realm_id])
            ->contain(['RealmPasspointNaiRealms','RealmPasspointRcois'])
            ->first();
            
        $data   = [];
        if($entity){
            $data = $entity;
        }                
        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    } 
    
    public function save(){
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
       
        if ($this->request->is('post')) {         
        	$req_d	    = $this->request->getData();
        	$realm_id   = $req_d['realm_id'];
        	
        	$entity = $this->{$this->main_model}->find()->where(['RealmPasspointProfiles.realm_id' => $realm_id])->first();
        	if($entity){      	
        	    $items = ['RealmPasspointNaiRealms','RealmPasspointRcois'];
                foreach ($items as $item) {
                    $this->{"$item"}->deleteAll(["realm_passpoint_profile_id" =>$entity->id]);
                }     	
        	    $this->{$this->main_model}->patchEntity($entity, $req_d);    	           	
        	}else{       	
        	    $entity = $this->{$this->main_model}->newEntity($req_d);       	
        	}
        	
        	if ($this->{$this->main_model}->save($entity)) {        	
        	    $bool_flag = $this->_add_new_data($req_d, $entity);
                if($bool_flag){            	    
                    $this->set([
                        'success' => true
                    ]);
                } else {
                    $message = __('Domain item could not be created');
                    $this->JsonErrors->errorMessage($message);
                }
            } else {
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($entity,$message);
            }       	
        }
        $this->viewBuilder()->setOption('serialize', true);  
    }
    
     private function _add_new_data($add_data, $entity){
            $bool_flag  = true;
            $new_id     = $entity->id;
            $filtered_data = preg_grep('/^(nai_realm_add_|nai_realm_edit_)\d+$/', array_keys($add_data));
            foreach ($filtered_data as $key){
            	preg_match('/^nai_realm_(add|edit)_(\d+)$/',$key, $matches);
                $nai_realm_data = [
                    'realm_passpoint_profile_id'  => $new_id,
                    'name'                  => $add_data['nai_realm_'.$matches[1].'_'.$matches[2]]
                ];
                $entPpNaiRealm  = $this->RealmPasspointNaiRealms->newEntity($nai_realm_data); //Create a new entity
                $bool_flag      = $this->RealmPasspointNaiRealms->save($entPpNaiRealm) and $bool_flag; //Save this entity
                if(!$bool_flag){
                    break;
                }
            }
            $filtered_data = preg_grep('/^(rcoi_name_add_|rcoi_name_edit_)\d+$/', array_keys($add_data));
            foreach ($filtered_data as $key){
            
                preg_match('/^rcoi_name_(add|edit)_(\d+)$/',$key, $matches);                         
                $rcoi_data = [
                    'realm_passpoint_profile_id'  => $new_id,
                    'name'                  => $add_data[$key],
                    'rcoi_id'               => $add_data['rcoi_id_'.$matches[1].'_'.$matches[2]]
                ];
                $entPpRcoi  = $this->RealmPasspointRcois->newEntity($rcoi_data); //Create a new entity
                $bool_flag  = $this->RealmPasspointRcois->save($entPpRcoi) and $bool_flag; //Save this entity
                if(!$bool_flag){
                    break;
                }
            }
            return $bool_flag;
    }
  
}
