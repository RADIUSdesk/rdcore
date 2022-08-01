<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component that makes use of tho sub-components to determine Authentication and Authorization of a request
//---- Date: 24-12-2016
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\ORM\TableRegistry;


class AaComponent extends Component {

    public $components = array('TokenAuth', 'TokenAcl');
    
    protected $parents  = false;
    protected $children = false;
    
    protected $AclCache = [];

    public function user_for_token($controller){
        return $this->TokenAuth->check_if_valid($controller);
    }

    public function fail_no_rights($controller){
        $this->TokenAcl->fail_no_rights($controller);
    }


    public function admin_check($controller,$hard_fail=true){

        //Check if the supplied token belongs to a user that is part of the Configure::read('group.admin') group
        //-- Authenticate check --
        $token_check = $this->TokenAuth->check_if_valid($controller);
        if(!$token_check){
            return false;
        }else{

            if($token_check['group_name'] == Configure::read('group.admin')){ 
                return true;
            }else{
                if($hard_fail){
                    $this->TokenAcl->fail_no_rights($controller);
                }
                return false;
            }
        }
    }

    public function ap_check($controller,$hard_fail=true){
        //-- Authenticate check --
        $token_check = $this->TokenAuth->check_if_valid($controller);
        if(!$token_check){
            return false;
        }else{

            if($token_check['group_name'] == Configure::read('group.ap')){ 
                return true;
            }else{
                if($hard_fail){
                    $this->TokenAcl->fail_no_rights($controller);
                }
                return false;
            }
        }
    }
 
    public function get_action_flags($owner_id,$user){
    
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            return array('view' => true,'update' => true, 'delete' => true);
        }

        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $user_id = $user['id'];
            $users   = TableRegistry::get('Users');
                       
            //==== Quick Hack =====
            $ro_id      = 50; //Read Only User
            $switch_id  = 47; //For User
            $objController = $this->_registry->getController();
            $session    = $objController->getRequest()->getSession();
            if($session->check('Config.act_as')) {         
                return ['view' => true,'update' => false, 'delete' => false ];                            
            }
            //== END Quick Hack ===== 
            

            //test for self
            if($owner_id == $user_id){
                return array('view' => true,'update' => true, 'delete' => true );
            }
            
            //Test for Parents
            //NOTE If parents does not exist -> Get it
            if(!$this->parents){
                $this->parents  = $users->find('path',['for' => $user_id]);
            }
            
            foreach($this->parents as $i){
                if($i->id == $owner_id){
                    return array('view' => false,'update' => false, 'delete' => false );
                }
            }

            //Test for Children
            //NOTE If parents does not exist -> Get it
            if(!$this->children){
                $this->children = $users->find('children', ['for' => $user_id]);
            }
             
            foreach($this->children as $i){
                if($i->id == $owner_id){
                    return array('view' => true,'update' => true, 'delete' => true);
                }
            }  
        }
    }
      
    public function test_for_private_parent($item,$user){
        //Most tables that has entries which belongs to an Access Provider as the user_id also includes
        // and available_to_siblings flag which if not set; makes the entry private
        // This piece of code will take the current user making the request; and compare it with fields in an entry from a table
        // It will then evaluate where it is in the hirarchy and is below the item marked as private; not display it
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            return false;
        }
        
        if($user['group_name'] == Configure::read('group.ap')){  //AP
 
            $user_id = $user['id'];
            $owner_id= $item->user_id;
            $open    = $item->available_to_siblings;

            //test for self
            if($owner_id == $user_id){
                return false;
            }
            
            //Test for Parents
            //NOTE If parents does not exist -> Get it
            if(!$this->parents){
                $users          = TableRegistry::get('Users');
                $this->parents  = $users->find('path',['for' => $user_id]);
            }

            //**AP and upward in the tree**
            foreach($this->parents as $i){
                if($i->id == $owner_id){
                    if($open == false){
                        return true; //private item
                    }else{
                        return false;
                    }
                }
            }
        }
    }

}
