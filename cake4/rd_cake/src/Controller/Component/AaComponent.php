<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component used to determine Authentication and Authorization of a request
//---- Date: 26-AUG-2022
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\ORM\TableRegistry;


class AaComponent extends Component {


	public function user_for_token_with_cloud(){
        return $this->_check_if_valid(true);
    }
  
    public function user_for_token(){
        return $this->_check_if_valid(false);
    }

    public function fail_no_rights($message=false){
        $this->_fail_no_rights($message);
    }

    public function admin_check($controller,$hard_fail=true){

        //Check if the supplied token belongs to a user that is part of the Configure::read('group.admin') group
        //-- Authenticate check --
        $token_check = $this->_check_if_valid(false);
        if(!$token_check){
            return false;
        }else{

            if($token_check['group_name'] == Configure::read('group.admin')){ 
                return true;
            }else{
                if($hard_fail){
                    $this->_fail_no_rights();
                }
                return false;
            }
        }
    }

    public function ap_check($controller,$hard_fail=true){
        //-- Authenticate check --
        $token_check = $this->_check_if_valid($controller);
        if(!$token_check){
            return false;
        }else{

            if($token_check['group_name'] == Configure::read('group.ap')){ 
                return true;
            }else{
                if($hard_fail){
                    $this->_fail_no_rights();
                }
                return false;
            }
        }
    }
       
    private function _check_if_valid($with_cloud=true){
        //First we will ensure there is a token in the request
        $controller = $this->getController();
        $request 	= $controller->getRequest();
        $r_data		= $request->getData();
        $q_data		= $request->getQuery();    
        $token 		= false;
        $cloud_id	= false;

		//==IS TOKEN PRESENT AND VALID==
        if(isset($r_data['token'])){
            $token = $r_data['token'];
        }elseif(isset($q_data['token'])){ 
            $token = $q_data['token'];
        }       
        
        if($token != false){
            if(strlen($token) != 36){
                $result = ['success' => false, 'message' => __('Token in wrong format')];
            }else{
                //Find the owner of the token
                $result = $this->_find_token_owner($token);
            }
        }else{
            $result = ['success' => false, 'message' => __('Token missing')];
        }
        //==END IS TOKEN PRESENT AND VALID==
        
        if($with_cloud == true){
		    //==IS cloud_id PRESENT AND VALID==
		    if(isset($r_data['cloud_id'])){
		        $cloud_id = $r_data['cloud_id'];
		    }elseif(isset($q_data['cloud_id'])){ 
		        $cloud_id = $q_data['cloud_id'];
		    }      
		    if($cloud_id == false){
		    	$result = ['success' => false, 'message' => __('Cloud ID Missing')];
		    }
		    //==END IS cloud_id PRESENT AND VALID==
		}
        
        //If it failed - set the controller up
        if($result['success'] == false){
            $controller->set([
                'success'   => $result['success'],
                'message'   => $result['message'],
                '_serialize' => ['success', 'message']
            ]);
            return false;
        }else{
        	if($result['user']['group_name'] == Configure::read('group.admin')){         	
            	return $result['user']; //Admin does not have any problems :-)
           	}elseif($result['user']['group_name'] == Configure::read('group.ap')){
           		if($with_cloud == true){
		       		$user_id = $result['user']['id'];
		       		if($this->_can_manage_cloud($user_id,$cloud_id)){
		       			return $result['user']; //User are allowed on Cloud
		       		}else{
		       			$this->fail_no_rights();
		       			return false;
		       		}
		      	}else{
		      		return $result['user']; //No need to check the cloud_id
		      	}
           	}else{
           		$this->fail_no_rights();
           		return false;
           	}
        }   
    }
      
    private function _can_manage_cloud($user_id,$cloud_id){
    
    	$cloud_admins  = TableRegistry::get('CloudAdmins');
    	$count = $cloud_admins->find()->where(['CloudAdmins.user_id' => $user_id,'CloudAdmins.cloud_id' => $cloud_id])->count();
    	if($count > 0){
    		return true;
    	}
    	return false;
    }
    
    private function _find_token_owner($token){
    
        $users  = TableRegistry::get('Users');
        $user   = $users->find()->contain(['Groups'])->where(['Users.token' => $token])->first();

        if(!$user){
            return ['success' => false, 'message' =>  __('No user for token')];
        }else{

            //Check if account is active or not:
            if($user->active==0){
                return ['success' => false, 'message' =>  __('Account disabled')];
            }else{
                $user = [
                    'id'            => $user->id,
                    'group_name'    => $user->group->name,
                    'group_id'      => $user->group->id
                ];  
                return ['success' => true, 'user' => $user];
            }
        }
    }
    
    private function _fail_no_rights($message = ''){
        if(empty($message)){
            $message = __('You do not have rights for this action');
        }
        $controller = $this->getController();
        $controller->set([
            'success'       => false,
            'message'       => $message,
            '_serialize'    => ['success', 'message']
        ]);
    }
    
}
