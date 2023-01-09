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
    protected $components 		= ['MailTransport','RdLogger'];
      
    public function initialize(array $config):void{
        $this->UserSettings   	= TableRegistry::get('UserSettings');
        $this->CloudSettings 	= TableRegistry::get('CloudSettings');     
    }

    public function sendEmailUserReg($email_adr,$otp,$cloud_id){  
    	$from       = $this->MailTransport->setTransport(-1,$cloud_id);	    	
    	$username	= $email_adr;	           
        $success    = false;            
        if($from !== false){         
            $email = new Mailer(['transport'   => 'mail_rd']);
            $email->setFrom($from)
            	->setSubject(__("User registration OTP"))
            	->setTo($email_adr)
            	->setViewVars(compact( 'username', 'otp'))
            	->setEmailFormat('html')
             	->viewBuilder()
                    	->setTemplate('otp_permanent_user')
                		->setLayout('user_notify');   
            $email->deliver();
            
            //These two goes together
            $settings_cloud_id = $this->MailTransport->getCloudId();
            $this->RdLogger->addEmailHistory($settings_cloud_id,$email_adr,'user_register_otp',$otp);
            
            $success  = true;
        }	
	    return $success;     
    }
    
    public function sendEmailClickToConnect($email_adr,$otp,$cloud_id){  
    	$from       = $this->MailTransport->setTransport(-1,$cloud_id);	    	
    	$username	= $email_adr;	           
        $success    = false;            
        if($from !== false){         
            $email = new Mailer(['transport'   => 'mail_rd']);
            $email->setFrom($from)
            	->setSubject(__("Click To Connect - OTP"))
            	->setTo($email_adr)
            	->setViewVars(compact( 'username', 'otp'))
            	->setEmailFormat('html')
             	->viewBuilder()
                    	->setTemplate('otp_click_to_connect')
                		->setLayout('user_notify');   
            $email->deliver();
            $success  = true;
            
            //These two goes together
            $settings_cloud_id = $this->MailTransport->getCloudId();
            $this->RdLogger->addEmailHistory($settings_cloud_id,$email_adr,'click_to_connect_otp',$otp);
            
        }	
	    return $success;     
    }
    
    public function sendSms($address,$otp){
    
    
    }
}
