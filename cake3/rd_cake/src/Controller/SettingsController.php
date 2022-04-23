<?php

namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Mailer\Email;

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
       
    public function primeSlug(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
        $this->Sluggable->primeSlug();
        $this->set([
            'success'       => true,
            '_serialize'    => ['success']
        ]); 
    }
    
    public function getSlug(){
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
    
        $data           = [];
        $data['enc']    = $this->Sluggable->getSlug('MySlug');
        $data['decr']   = $this->Sluggable->getSlug($data['enc'],'d');
        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['data','success']
        ]);
    }
          
    public function viewLicense(){
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
             
        $data           = $this->Sluggable->checkSlug();        
        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['data','success']
        ]);
    }
    
    public function editLicense(){
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
        
        if($this->request->is('post')) {
            $s_l = $this->request->getData('license_key');
            if($this->Sluggable->testSlug($s_l)){
                $q_r = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => 's_l' ])->first();
                if($q_r){
                    $value = $s_l;
                    $this->{$this->main_model}->patchEntity($q_r, ['value'=> $value]);
                    $this->{$this->main_model}->save($q_r);
                }else{
                    $d = [];
                    $d['name']      = 's_l';
                    $d['value']     = $s_l;
                    $d['user_id']   = -1;
                    $entity = $this->{$this->main_model}->newEntity($d);
                    $this->{$this->main_model}->save($entity);
                }
                $this->set([
                    'success'       => true,
                    '_serialize'    => ['success']
                ]);
                
            }else{
                $this->set([
                    'errors'    => ["license_key"   => "Invalid License Key"],
                    'success'   => false,
                    'message'   => "Invalid License Key",
                    '_serialize' => ['errors','success','message']
                ]);
            }
        }
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
        if($this->request->is('post')) {
            $nr         = $this->request->getData('nr');
            $phone      = $this->request->getData('phone');
            $message    = $this->request->getData('phone');
            
            $q_r        = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'sms_'.$nr.'_%' ])->all();
            
            
        
        
        }
        
        $data = [];
      
        $this->set([
            'data'          => $data,
            'success'       => false,
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
    
    public function save(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
       
        if ($this->request->is('post')) {
        
            $items = [];  
            $data  = $this->request->getData();
            
            foreach($this->check_items as $ci){
                if(isset($data[$ci])){
                    $data[$ci] = 1;
                }else{
                    $data[$ci] = 0;
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
