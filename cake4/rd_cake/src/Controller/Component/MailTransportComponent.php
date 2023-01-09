<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;
use Cake\Mailer\TransportFactory;

class MailTransportComponent extends Component {

	protected $cloud_id = -1; //Default is system wide setting

	public function initialize(array $config):void{
        $this->controller = $this->_registry->getController();
        $this->UserSettings  = TableRegistry::get('UserSettings');
        $this->CloudSettings = TableRegistry::get('CloudSettings'); 
    }
    
    public function getCloudId(){   
    	return $this->cloud_id;    
    }
          
    public function setTransport($cloud_id = false){  	  		
    	//Get system wide settings first 
       	$q_r = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1 ])->all();   
        $email_config = [];
        foreach($q_r as $i){
            if(preg_match('/^email_/',$i->name)){
                $email_config[$i->name] = $i->value;
            }  
        }
        
        //OVERRIDE with cloud settings (if present)
        if($cloud_id != false){        
        	//==!!==FIRST check if it is enabled==!!== (if not we're not overriding)
        	$q_c_enabled = $this->{'CloudSettings'}->find()->where(['CloudSettings.cloud_id' => $cloud_id,  'CloudSettings.name' => 'email_enabled', 'CloudSettings.value' => '1' ])->count();
        	if($q_c_enabled){
		    	$q_c = $this->{'CloudSettings'}->find()->where(['CloudSettings.cloud_id' => $cloud_id ])->all();
		    	if($q_c){      	
		    		$email_config = [];
					foreach($q_c as $i){
						if(preg_match('/^email_/',$i->name)){
						    $email_config[$i->name] = $i->value;
						    $this->cloud_id = $cloud_id; //Set the cloud ID (We need it for reporting email_histories)
						}  
					}   	
		    	}
		   	}      
        }
        
        TransportFactory::drop('mail_rd'); //Drop this for future requirements (when Access Providers can configure their own Mail Transports) 
        
        //Default is smtp
        $transport = 'smtp';
        if(isset($email_config['email_transport'])){       
        	$transport = $email_config['email_transport'];
        }
        
        if($transport == 'smtp'){
        
        	$host = $email_config['email_server'];
		    if($email_config['email_ssl'] == '1'){
		        $host = 'ssl://'.$host;
		    }
		    $meta_data['from'] = $email_config['email_username'];
		    if($email_config['email_sendername']){
		        $meta_data['from'] = [$email_config['email_username'] => $email_config['email_sendername']];
		    }
		    
		    TransportFactory::setConfig('mail_rd', [
		      'host'        => $host,
		      'port'        => $email_config['email_port'],
		      'username'    => $email_config['email_username'],
		      'password'    => $email_config['email_password'], // swap with your credentials
		      'className'   => 'Smtp'
		    ]);   
        
        }
        
        if($transport == 'sendgrid'){      
        	TransportFactory::setConfig('mail_rd', [
		      	'className' => 'SendGrid.SendGrid',
		  		'apiKey' 	=> $email_config['email_sg_api']
		    ]);		    
		    $meta_data['from'] = $email_config['email_sg_sendername'];
		    if($email_config['email_sg_template'] !== ''){
		    	$meta_data['sg_template'] = $email_config['email_sg_template'];
		    }      
        }
               
        if($email_config['email_enabled'] == '0'){ //Email is disabled!
            $meta_data = false;
        }
                
        return($meta_data); 
    }

}
