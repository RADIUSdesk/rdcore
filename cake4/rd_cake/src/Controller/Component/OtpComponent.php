<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 12-Dec-2022
//------------------------------------------------------------

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\Core\Configure;
use Cake\ORM\TableRegistry;
use Cake\Http\Client;
use Cake\Mailer\Mailer;


class OtpComponent extends Component {

    protected $ap_action_add 	= 'http://127.0.0.1/cake4/rd_cake/ap-actions/add.json';    
    protected $components 		= ['MailTransport'];
      
    public function initialize(array $config):void{
        $this->UserSettings   	= TableRegistry::get('UserSettings');
        $this->CloudSettings 	= TableRegistry::get('CloudSettings');     
    }

    public function sendEmail($email_adr,$otp,$cloud_id){  
    	$from       = $this->MailTransport->setTransport(-1,$cloud_id);	    	
    	$username	= $email_adr;
    	$password	= $otp;  	           
        $success    = false;            
        if($from !== false){         
            $email = new Mailer(['transport'   => 'mail_rd']);
            $email->setFrom($from)
            	->setSubject('Lost Password Retrieval')
            	->setTo($email_adr)
            	->setViewVars(compact( 'username', 'password'))
            	->setEmailFormat('html')
             	->viewBuilder()
                    	->setTemplate('user_detail')
                		->setLayout('user_notify');   
            $email->deliver();
            $success  = true;
        }	
	    return $success;     
    }
    
    public function sendSms($address,$otp){
    
    
    }
}
