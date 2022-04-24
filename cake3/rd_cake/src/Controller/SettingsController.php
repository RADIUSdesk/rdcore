<?php

namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Mailer\Email;
use Cake\Http\Client;

class SettingsController extends AppController{
  

    protected $main_model   = 'UserSettings';
    protected $check_items  = ['email_enabled','email_ssl'];
  
    public function initialize(){  
        parent::initialize(); 
        $this->loadModel($this->main_model);
        $this->loadComponent('Aa');
        $this->loadComponent('Sluggable');
        $this->loadComponent('MailTransport');
    }
    
    public function viewSms(){
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
        $nr         = 1;
        $enabled    = false;
        if(isset($this->request->query['nr'])){
            $nr = $this->request->query['nr'];
        }
        $data   = []; 
        $data   = ['sms_'.$nr.'_enabled' => $enabled];        
        $q_r    = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'sms_'.$nr.'_%' ])->all();
 
        foreach($q_r as $ent){
            $data[$ent->name] = $ent->value; 
        }
             
              
        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['data','success']
        ]);
    }
    
    public function editSms(){
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
        
        if($this->request->is('post')) {
            $nr     = $this->request->getData('nr');
            $data   = $this->request->getData();
            
            $check_items = [
			    'sms_'.$nr.'_enabled',
			    'sms_'.$nr.'_ssl_verify_peer',
			    'sms_'.$nr.'_ssl_verify_host'		    
		    ];		
            foreach($check_items as $i){
                if(isset($data[$i])){
                    $data[$i] = 1;
                }else{
                    $data[$i] = 0;
                }
            }
            foreach(array_keys($data) as $key){
                if(substr($key, 0, 6) === 'sms_'.$nr.'_'){
                    $value = $data[$key];
                    $q_r = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => $key ])->first();
                    
                    if($q_r){
                        $this->{$this->main_model}->patchEntity($q_r, ['value'=> $value]);
                        $this->{$this->main_model}->save($q_r);
                    }else{
                        $d = [];
                        $d['name']      = $key;
                        $d['value']     = $value;
                        $d['user_id']   = -1;
                        $entity = $this->{$this->main_model}->newEntity($d);
                        $this->{$this->main_model}->save($entity);
                    }
                }          
            }
                                
            $this->set([
                'data'          => $data,
                'success'       => true,
                '_serialize'    => ['success','data']
            ]);       
        }
    }
    
     public function testSms(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
        $user = $this->_ap_right_check();
        $data = [];
        
        if($this->request->is('post')) {
            $nr         = $this->request->getData('nr');
            $phone      = $this->request->getData('phone');
            $message    = $this->request->getData('message');
            
            $q_r        = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'sms_'.$nr.'_%' ])->all();
            $config     = [];
            
            foreach($q_r as $ent){
                $config[$ent->name] = $ent->value; 
            }
            
            //===Query Items===
            $query_items = [];
            
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
                
            $http = new Client();

            // Simple get
            $response = $http->get($url,$query_items,$options);
            
            $data['url']    = $url;
            $data['query']  = http_build_query($query_items);
            
            $reply          = $response->getStringBody();
            $data['reply']  = $reply;        
        }
            
        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['data','success']
        ]); 
          
    } 
           
    public function view(){
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
        $q_r = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1 ])->all();  
        $data = [];
        foreach($q_r as $i){
             $data[$i->{'name'}] = $i->{'value'};
        }
        
        $this->set(array(
            'data' => $data,
            'success' => true,
            '_serialize' => array('data','success')
        ));
    }
    
    public function saveDefaults(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
       
        if ($this->request->is('post')) {
        
            $items = [];  
            $data  = $this->request->getData();       
            $check_items = [
			    'cp_swap_octet',
			    'cp_mac_auth'		    
		    ];		
            foreach($check_items as $i){
                if(isset($data[$i])){
                    $data[$i] = 1;
                }else{
                    $data[$i] = 0;
                }
            }
                 
            foreach(array_keys($data) as $k){
                $q_r = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => $k ])->first();
                if($q_r){
                    array_push($items,$k);
                    $value = $data[$k];
                    $this->{$this->main_model}->patchEntity($q_r, ['value'=> $value]);
                    $this->{$this->main_model}->save($q_r);
                }else{
                    if(($k !== 'token')&&($k !== 'sel_language')){
                        $d = [];
                        $d['name']      = $k;
                        $d['value']     = $data[$k];
                        $d['user_id']   = -1;
                        $entity = $this->{$this->main_model}->newEntity($d);
                        $this->{$this->main_model}->save($entity);
                    }
                }
            }

            $this->set([
                'items' => $items,
                'success' => true,
                '_serialize' => ['items','success']
            ]);
               
        }
    }
    
    public function saveSms(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
       
        if ($this->request->is('post')) {
        
            $items = [];  
            $data  = $this->request->getData();       
            $check_items = [
			    'email_enabled',
			    'email_ssl'	    
		    ];		
            foreach($check_items as $i){
                if(isset($data[$i])){
                    $data[$i] = 1;
                }else{
                    $data[$i] = 0;
                }
            }
                 
            foreach(array_keys($data) as $k){
                $q_r = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => $k ])->first();
                if($q_r){
                    array_push($items,$k);
                    $value = $data[$k];
                    $this->{$this->main_model}->patchEntity($q_r, ['value'=> $value]);
                    $this->{$this->main_model}->save($q_r);
                }else{
                    if(($k !== 'token')&&($k !== 'sel_language')){
                        $d = [];
                        $d['name']      = $k;
                        $d['value']     = $data[$k];
                        $d['user_id']   = -1;
                        $entity = $this->{$this->main_model}->newEntity($d);
                        $this->{$this->main_model}->save($entity);
                    }
                }
            }

            $this->set([
                'items' => $items,
                'success' => true,
                '_serialize' => ['items','success']
            ]);
               
        }
    }
    
     public function saveMqtt(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
       
        if ($this->request->is('post')) {
        
            $items = [];  
            $data  = $this->request->getData();       
            $check_items = [
			    'mqtt_enabled'  
		    ];		
            foreach($check_items as $i){
                if(isset($data[$i])){
                    $data[$i] = 1;
                }else{
                    $data[$i] = 0;
                }
            }
                 
            foreach(array_keys($data) as $k){
                $q_r = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => $k ])->first();
                if($q_r){
                    array_push($items,$k);
                    $value = $data[$k];
                    $this->{$this->main_model}->patchEntity($q_r, ['value'=> $value]);
                    $this->{$this->main_model}->save($q_r);
                }else{
                    if(($k !== 'token')&&($k !== 'sel_language')){
                        $d = [];
                        $d['name']      = $k;
                        $d['value']     = $data[$k];
                        $d['user_id']   = -1;
                        $entity = $this->{$this->main_model}->newEntity($d);
                        $this->{$this->main_model}->save($entity);
                    }
                }
            }

            $this->set([
                'items' => $items,
                'success' => true,
                '_serialize' => ['items','success']
            ]);
               
        }
    }
    
    public function testEmail(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
        $user = $this->_ap_right_check();
        
        if ($this->request->is('post')) {
        
            $base_msg   = 'Test Email Config';
            $subject    = 'Test Email Config';
            $data       = $this->request->getData();
            $email_to   = $data['email'];
            $message    = $data['message'];
            $base_msg   = $base_msg."\n".$message;           
            $from       = $this->MailTransport->setTransport($user);           
            $success    = false;            
            if($from !== false){         
                $email = new Email(['transport'   => 'mail_rd']);
                $email->from($from)
                    ->to($email_to)
                    ->subject("$subject")
                    ->send("$base_msg");
                $success    = true;
                $this->set([
                    'data'          => $data,
                    'success'       => $success,
                    '_serialize'    => ['data','success']
                ]); 
            }else{                     
                $this->set([
                    'data'          => $data,
                    'success'       => $success,
                    'message'       => 'Email Disabled / Not Configured',
                    '_serialize'    => ['data','success','message']
                ]);
            }            
        }
    } 
}
