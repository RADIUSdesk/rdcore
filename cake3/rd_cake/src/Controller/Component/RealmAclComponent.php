<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component which groups the realm related Acl function together
//---- Date: 13-05-2017
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\ORM\TableRegistry;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class RealmAclComponent extends Component {

    public $components = ['Acl'];
    
    public function initialize(array $config){
        $this->controller   = $this->_registry->getController();
        $this->Users        = TableRegistry::get('Users');
        $this->Realms       = TableRegistry::get('Realms');
    }
    
    //This is only called if the user is an AP - we then check if the action they try to do is allowed for the realm (is he assigned to the realm)
    public function can_manage_realm($user_id,$owner_id,$id){
    
        //If the realm belongs to the user or any of its children we return true
        $children_list  = [];  
        $children       = $this->Users->find('children', ['for' => $user_id]);
        if($children){   //Only if the AP has any children...
            foreach($children as $i){
                $id = $i->id;                   
                array_push($children_list,$id);
            }       
        } 
        //If it is in the children list we have rights
        if(in_array($owner_id,$children_list)){
            return true;
        }
        
        //Alternatively we need to check if this realm has been assigned to the use since it belongs to a parent...
        $read       = false;
        $temp_debug = Configure::read('debug');
        Configure::write('debug', 0); // turn off debugging     
        try{
            $read = $this->Acl->check(
                array('model' => 'Users', 'foreign_key' => $user_id), 
                array('model' => 'Realms','foreign_key' => $id), 'read'); //Only if they have create right             
        }catch(\Exception $e){               
            $read = false;  
        }       
        Configure::write('debug', $temp_debug); // return previous setting 
        return $read;        
    }
    
    public function realm_list_for_ap($ap_id,$right='read',$add_model = ''){
    
        //This method takes an user id (which is suppose to be an access provider) it will go through all the PARENTS
        //finding all the REALMS belonging to the PARENTS with AVAILABLE_TO_SIBLINGS = TRUE
        //Loop through that list and check it the user_id HAS RIGHTS to those REALMS
        //Finally it will list ALL REALMS owned by the ap_id or its children
    
        $realm_list     = [];
        $upstream_aps   = [];
       
        //___ FIRST PART ____
        $parents        = $this->Users->find('path',['for' => $ap_id]); 
        foreach($parents as $i){
            $i_id = $i->id;
            if($i_id != $ap_id){ //upstream so we have to be exclusively be given rights to realms belonging to them.
                array_push($upstream_aps,['user_id' => $i_id]);
            }
        }
        if($upstream_aps){
            $qr      = $this->Realms->find()->where(['OR' => $upstream_aps,'available_to_siblings' => true])->all();   
            foreach($qr as $r){ if($this->children){   //Only if the AP has any children...
            foreach($this->children as $i){
                $id = $i->id;                   
                array_push($tree_array,['Realms.user_id' => $id]);
            }       
        } 
                $temp_debug = Configure::read('debug');
                Configure::write('debug', 0); // turn off debugging
                try{
                    $result = $this->Acl->check(
                        array('model' => 'Users',    'foreign_key' => $ap_id), 
                        array('model' => 'Realms',  'foreign_key' => $r->id), $right); //Only if they have the right
                }catch(\Exception $e){               
                     $result = false;  
                }
                Configure::write('debug', $temp_debug); // turn off debugging
                if($result){
                    if($add_model !== ''){
                        array_push($realm_list,["$add_model.realm_id" => $r->id]);
                    }else{
                        array_push($realm_list,["realm_id" => $r->id]);
                    }
                }           
            }
        }
        
        //____ SECOND PART ____
        
        //All the realms owned by anyone this access provider created (and also itself) 
        //will automatically be under full controll of this access provider           
        $this->children = $this->Users->find('children', ['for' => $ap_id]);
        
        $tree_array     = array(['Realms.user_id' => $ap_id]); //Start with itself
        
        if($this->children){   //Only if the AP has any children...
            foreach($this->children as $i){
                $id = $i->id;                   
                array_push($tree_array,['Realms.user_id' => $id]);
            }       
        } 
        $r_sub  = $this->Realms
                ->find()
                ->where(['OR' => $tree_array])
                ->all();
                
        foreach($r_sub  as $j){
            $id     = $j->id;
            $name   = $j->name;
            if($add_model !== ''){
                array_push($realm_list,["$add_model.realm_id" => $id]);
            }else{
                array_push($realm_list,['realm_id' => $id]);
            }
        }   
         
        return $realm_list;

    }

}
