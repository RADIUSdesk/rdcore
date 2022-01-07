<?php

//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 02-01-2017
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\ORM\TableRegistry;


class NotesComponent extends Component { 

    public $components = array('Aa'); 

    public function index($user){
    
        $model      = $this->config('model');
        $condition  = $this->config('condition');
        $items      = array();
        
        if(isset($this->request->query['for_id'])){
            $id     = $this->request->query['for_id'];
            $query  = TableRegistry::get($model)->find();
            $users  = TableRegistry::get('Users');
            $clause = $model.'.'.$condition;
            $q_r    = $query->contain(['Notes'])->where([$clause => $id])->all();
            
            foreach($q_r as $i){
                if(!$this->Aa->test_for_private_parent($i,$user)){
                    $owner_id   = $i->note->user_id;
                    $owner_tree = $users->find_parents($owner_id);
                    array_push($items,
                        array(
                            'id'        => $i->note->id, 
                            'note'      => $i->note->note, 
                            'available_to_siblings' => $i->note->available_to_siblings,
                            'owner'     => $owner_tree,
                            'delete'    => true
                        )
                    );
                }
            }
            
        } 
        
        $controller = $this->_registry->getController();
        
        $controller->set(array(
            'items'     => $items,
            'success'   => true,
            '_serialize'=> array('success', 'items')
        ));    
        return;
    }
    
    public function add($user){
    
        $model      = $this->config('model');
        $condition  = $this->config('condition');
        $user_id    = $user['id'];
        
        //Get the creator's id
        if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
            $this->request->data['user_id'] = $user_id;
        }

        //Make available to siblings check
        if(isset($this->request->data['available_to_siblings'])){
            $this->request->data['available_to_siblings'] = 1;
        }else{
            $this->request->data['available_to_siblings'] = 0;
        }

        $success= false;
        $notes  = TableRegistry::get('Notes');
        $m      = TableRegistry::get($model);  
        $n      = $notes->newEntity($this->request->data());
        
        if ($notes->save($n)) {
            $me                 = $m->newEntity();
            $me->{"$condition"} = $this->request->data['for_id'];
            $me->note_id        = $n->id;
            if ($m->save($me)) {
                $success = true;
            }
        } 
        
        $controller = $this->_registry->getController();
        
        if($success){
            $controller->set(array(
                'success' => $success,
                '_serialize' => array('success')
            ));
        }else{
             $controller->set(array(
                'success' => $success,
                'message' => __('Could not create note'),
                '_serialize' => array('success','message')
            ));
        }   
        return;
    }
    
    public function del($user){
    
        $model      = $this->config('model');
        $condition  = $this->config('condition');
        $user_id    = $user['id'];
        
        $notes      = TableRegistry::get('Notes');
        $users      = TableRegistry::get('Users');
        
        $fail_flag  = false;

	    if(isset($this->request->data['id'])){   //Single item delete

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:   
            $entity     = $notes->get($this->request->data['id']);   
            $owner_id   = $entity->user_id;
                  
            if($owner_id != $user_id){
                if($users->is_sibling_of($user_id,$owner_id)== true){
                    $notes->delete($entity);
                }else{
                    $fail_flag = true;
                }
            }else{
                $notes->delete($entity);
            }
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){

                $entity     = $notes->get($d['id']);
                $owner_id   = $entity->user_id;

                if($owner_id != $user_id){
                    if($users->is_sibling_of($user_id,$owner_id) == true){
                        $notes->delete($entity);
                    }else{
                        $fail_flag = true;
                    }
                }else{
                    $notes->delete($entity);
                }
            }
        }
        
        $controller = $this->_registry->getController();
        
        if($fail_flag == true){
            $controller->set(array(
                'success'   => false,
                'message'   => array('message' => __('Could not delete some items')),
                '_serialize' => array('success','message')
            ));
        }else{
            $controller->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }
            
        return;
    }  
}

