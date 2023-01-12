<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 10-JAN-2023
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\ORM\TableRegistry;
use Cake\Http\Client;

class RdSmsComponent extends Component {

	protected $main_model   = 'UserSettings';
    protected $cloud_model  = 'CloudSettings';
    protected $components    = ['RdLogger'];
  
    public function initialize(array $config):void{
    
        $this->controller = $this->_registry->getController();
        $this->request    = $this->controller->getRequest();
        $this->UserSettings  = TableRegistry::get($this->main_model);
        $this->CloudSettings = TableRegistry::get($this->cloud_model); 
    }
    
    public function sendSms($phone,$message,$nr,$cloud_id,$reason='test_settings'){
    
    	//$nr can be 0 (then whichever is active is used) 1 or 2
    	$success    = false; 	       
	    $config_1   = [];
	    $config_2   = [];
	    $cloud_1	= -1;
	    $cloud_2	= -1;

	    	    
	    if(($nr == 0)||($nr == 1)){ 
	    
	    	//Prime it with system wide settings       
			$q_r_1   = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'sms_1_%' ])->all();			
			foreach($q_r_1 as $ent){
		        $config_1[$ent->name] = $ent->value; 
		    }
		    
		    //See if there are cloud specific ones to override
		    $q_c_enabled = $this->{$this->cloud_model}->find()->where(['CloudSettings.cloud_id' => $cloud_id,  'CloudSettings.name' => 'sms_1_enabled', 'CloudSettings.value' => '1' ])->count();
		    if($q_c_enabled){
		    	$cloud_1 = $cloud_id;
		    	$q_r_1   = $this->{$this->cloud_model}->find()->where(['CloudSettings.cloud_id' => $cloud_id, 'CloudSettings.name LIKE' => 'sms_1_%'])->all();  	
	    		foreach($q_r_1 as $ent){
					$config_1[$ent->name] = $ent->value; 
				}	
		   	}
		}
		
		if(($nr == 0)||($nr == 2)){ 
	
			//Prime it with system wide settings       
			$q_r_2   = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'sms_2_%' ])->all();			
			foreach($q_r_2 as $ent){
		        $config_2[$ent->name] = $ent->value; 
		    }
		    
			//See if there are cloud specific ones to override
		    $q_c_enabled = $this->{$this->cloud_model}->find()->where(['CloudSettings.cloud_id' => $cloud_id,  'CloudSettings.name' => 'sms_2_enabled', 'CloudSettings.value' => '1' ])->count();
		    if($q_c_enabled){
		    	$cloud_2 = $cloud_id;
		    	$q_r_2   = $this->{$this->cloud_model}->find()->where(['CloudSettings.cloud_id' => $cloud_id, 'CloudSettings.name LIKE' => 'sms_2_%'])->all();    	
	    		foreach($q_r_2 as $ent){
					$config_2[$ent->name] = $ent->value; 
				}	
		   	}
		}
		                      
        $active_config  = 0;
        $config         = [];  
        
        if(isset($config_1['sms_1_enabled'])){
            if($config_1['sms_1_enabled'] == 1){          
                $active_config = 1;
                $config = $config_1;
            }     
        }
        
        if(isset($config_2['sms_2_enabled'])){
            if($config_2['sms_2_enabled'] == 1){          
                $active_config = 2;
                $config = $config_2;
            }     
        }
              
        if(($active_config == 1)||($active_config == 2)){
        
            $nr         = $active_config;      
            $url        = $config['sms_'.$nr.'_url'];
            $sender_p   = $config['sms_'.$nr.'_sender_parameter'];
            $sender_v   = $config['sms_'.$nr.'_sender_value'];
            if($sender_p !== ''){
                $query_items[$sender_p] = $sender_v;
            }
            
            $message_p  = $config['sms_'.$nr.'_message_parameter'];
            $query_items[$message_p] = $message;
            
            $key_p   = $config['sms_'.$nr.'_key_parameter'];
            $key_v   = $config['sms_'.$nr.'_key_value'];
            if($key_p !== ''){
                $query_items[$key_p] = $key_v;
            }
            
            $rec_p  = $config['sms_'.$nr.'_receiver_parameter'];
            $query_items[$rec_p] = $phone;
            
            //==Client Options==
            $options = [];
            $v_peer = $config['sms_'.$nr.'_ssl_verify_peer'];
            $v_host = $config['sms_'.$nr.'_ssl_verify_host'];
            if($v_peer == '0'){ //Default is true
                $options['ssl_verify_peer'] = false;
            }
            if($v_host == '0'){ //Default is true
                $options['ssl_verify_host'] = false;
            }
            
            if($config['sms_'.$nr.'_header_content_type'] !== ''){
                $options['type'] = $config['sms_'.$nr.'_header_content_type'];
            }
            
            if($config['sms_'.$nr.'_header_authorization'] !== ''){
                $basic_pwd = $config['sms_'.$nr.'_header_authorization'];
                $options['auth'] = ['type' => 'basic','username' => 'SMS Placeholder', 'password' => $basic_pwd];
            }
            
            $http           = new Client();
            
            // Simple get
            $response       = $http->get($url,$query_items,$options);        
            $data['url']    = $url;
            $data['query']  = http_build_query($query_items);
            
            $reply          = $response->getStringBody();
            $data['reply']  = $reply;
         
         	//Log the action
         	$cloud_active = $cloud_1;
         	if($active_config !== 1){
         		$cloud_active = $cloud_2;
         	}
         	         	        	
         	$this->RdLogger->addSmsHistory($cloud_active,$phone,$reason,$message,$reply,$active_config);
            return $data;      
        
        }	         	
    	return $success;        
    }    
}

