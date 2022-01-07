<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component that determines if an Access Provider is assignesd to a realm and also if the user that authenticated
//---- is actually allowed to do do this action (be it on themself as a normal user group member or for a realm as an access provider
//---- Date: 24-12-2016
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

class TokenAclComponent extends Component {

    public $components = ['Acl'];

    public function action_check($controller,$action){

        return true;

    }

    public function fail_no_rights($controller,$message = ''){
        if(empty($message)){
            $message = __('You do not have rights for this action');
        }
        $controller->set(array(
                'success'       => false,
                'message'       => array('message' => $message),
                '_serialize'    => array('success', 'message')
            ));
    }
    
    //This is checking the right of the person to do this - users will only be able to do things on themselves

}
