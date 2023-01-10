<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class RdLoggerComponent extends Component {

	public function initialize(array $config):void{
        $this->SmsHistories  	= TableRegistry::get('SmsHistories');
        $this->EmailHistories 	= TableRegistry::get('EmailHistories'); 
    }
        
    public function addSmsHistory($cloud_id,$to,$for,$message,$reply,$nr){
    	$d	= [
    		'cloud_id' 	=> $cloud_id,
    		'recipient'	=> $to,
    		'reason'	=> $for,
    		'message'	=> $message,
    		'reply'		=> $reply,
    		'sms_provider'	=> $nr		
    	];
    	$e 			= $this->{'SmsHistories'}->newEntity($d);
		$this->{'SmsHistories'}->save($e);
    
    }
    
    public function addEmailHistory($cloud_id,$to,$for,$message){
    	$d	= [
    		'cloud_id' 	=> $cloud_id,
    		'recipient'	=> $to,
    		'reason'	=> $for,
    		'message'	=> $message  		
    	];
    	$e 			= $this->{'EmailHistories'}->newEntity($d);
		$this->{'EmailHistories'}->save($e);
    
    }

}
