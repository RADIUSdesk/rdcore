<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;
use Cake\Mailer\TransportFactory;

class MailTransportComponent extends Component {

	public function initialize(array $config){
        $this->controller = $this->_registry->getController();
        $this->UserSettings  = TableRegistry::get('UserSettings'); 
    }
        
    public function setTransport($user){
    
        $q_r = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1 ])->all();
        $email_config = [];
        foreach($q_r as $i){
            if(preg_match('/^email_/',$i->name)){
                $email_config[$i->name] = $i->value;
            }  
        } 

        //==Later we will make this more fancy so that the settings can be per Access Provider (if set for them/by them)
        //These should be: email_server email_port email_ssl email_username email_password and (optional email_sendername) 
        $host = $email_config['email_server'];
        if($email_config['email_ssl'] == '1'){
            $host = 'ssl://'.$host;
        }
        $from = $email_config['email_username'];
        if($email_config['email_sendername']){
            $from = [$from => $email_config['email_sendername']];
        }
        TransportFactory::drop('mail_rd'); //Drop this for future requirements (when Access Providers can configure their own Mail Transports)        
        TransportFactory::setConfig('mail_rd', [
          'host'        => $host,
          'port'        => $email_config['email_port'],
          'username'    => $email_config['email_username'],
          'password'    => $email_config['email_password'], // swap with your credentials
          'className'   => 'Smtp'
        ]);
        
        if($email_config['email_enabled'] == '0'){ //Email is disabled!
            $from = false;
        }
        return($from); 
    }

}
