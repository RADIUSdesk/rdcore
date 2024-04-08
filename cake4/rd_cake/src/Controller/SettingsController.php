<?php

namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Mailer\Mailer;
use Cake\Http\Client;

class SettingsController extends AppController{
  
    protected $main_model   = 'UserSettings';
    protected $cloud_model  = 'CloudSettings';
    protected $check_items  = ['email_enabled','email_ssl'];
  
    public function initialize():void{  
        parent::initialize(); 
        $this->loadModel($this->main_model);
        $this->loadModel($this->cloud_model);
        $this->loadModel('EmailHistories');
        $this->loadModel('SmsHistories');
        $this->loadComponent('Aa');
        $this->loadComponent('MailTransport');
        $this->loadComponent('RdSms');
        $this->loadComponent('RdLogger');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('TimeCalculations');
    }
    
    //===== SMS =====
    public function viewSms(){
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
        $nr         = 1;
        $enabled    = false;
        $req_q      = $this->request->getQuery(); 
        
        if(isset($req_q['nr'])){
            $nr = $req_q['nr'];
        }
        
        $data   = []; 
        $data   = ['sms_'.$nr.'_enabled' => $enabled];    
              
        if(isset($req_q['edit_cloud_id'])){
            $edit_cloud_id = $req_q['edit_cloud_id'];
            if(preg_match("/^Clouds_/", $edit_cloud_id)){
            	$cloud_id = preg_replace('/^Clouds_/', '', $edit_cloud_id);
            }

            //System is (cloud_id -1) UserSettings
            if($edit_cloud_id == -1){             
        		$q_r    = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'sms_'.$nr.'_%' ])->all();
       		}else{       		
       			$q_r    = $this->{$this->cloud_model}->find()->where(['CloudSettings.cloud_id' => $cloud_id, 'CloudSettings.name LIKE' => 'sms_'.$nr.'_%' ])->all();
       		} 
       		
       		foreach($q_r as $ent){
		        $data[$ent->name] = $ent->value;
		   	}  		    		         
        }
                                
        $this->set([
            'data'          => $data,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
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
                    
                    if(isset($data['edit_cloud_id'])){
						$edit_cloud_id = $data['edit_cloud_id'];
						$cloud_id	   = -1;
						if(preg_match("/^Clouds_/", $edit_cloud_id)){
							$cloud_id = preg_replace('/^Clouds_/', '', $edit_cloud_id);
						}
						
						$model = $this->main_model;

						//System is (cloud_id -1) UserSettings
						if($edit_cloud_id == -1){             
							$q_r   = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => $key ])->first();
							$model = $this->main_model;
				   		}else{       		
				   			$q_r   = $this->{$this->cloud_model}->find()->where(['CloudSettings.cloud_id' => $cloud_id, 'CloudSettings.name' => $key ])->first();
				   			$model = $this->cloud_model;
				   		} 	    		         
					}
                                                           
                    if($q_r){
                        $this->{$model}->patchEntity($q_r, ['value'=> $value]);
                        $this->{$model}->save($q_r);
                    }else{
                        $d = [];
                        $d['name']      = $key;
                        $d['value']     = $value;
                        $d['user_id']   = -1;
                        $d['cloud_id']  = $cloud_id;
                        $entity = $this->{$model}->newEntity($d);
                        $this->{$model}->save($entity);
                    }
                }          
            }
                                
            $this->set([
                'data'          => $data,
                'success'       => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);       
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
            $data		= $this->request->getData();
            $cloud_id	= -1;
            
            if(isset($data['edit_cloud_id'])){
				$edit_cloud_id = $data['edit_cloud_id'];
				if(preg_match("/^Clouds_/", $edit_cloud_id)){
					$cloud_id = preg_replace('/^Clouds_/', '', $edit_cloud_id);
				}   		 	    		         
			}
                       
            $retval = $this->RdSms->sendSms($phone,$message,$nr,$cloud_id,'test_settings');
    		if($retval){
    			$this->set([
				    'success' 	=> true,
				    'data'		=> $retval
				]);   	
			}else{
				$this->set([
				    'success' 	=> false
				]);       	
			}			   
		    $this->viewBuilder()->setOption('serialize', true);                   
        }          
    }
    
     public function smsHistoriesIndex(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $req_q    = $this->request->getQuery();    
       	
       	
       	if(isset($req_q['edit_cloud_id'])){
            $cloud_id = $req_q['edit_cloud_id'];
            if(preg_match("/^Clouds_/", $cloud_id)){
            	$cloud_id = preg_replace('/^Clouds_/', '', $cloud_id);
            }
       	}
       	$nr		  = 1;
       	if(isset($req_q['nr'])){
       	 $nr = $req_q['nr'];
       	}
       	
       	
        $query 	  = $this->{'SmsHistories'}->find()->where(['SmsHistories.cloud_id' => $cloud_id,'SmsHistories.sms_provider' => $nr]);

        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
        if(isset($req_q['limit'])){
            $limit  = $req_q['limit'];
            $page   = $req_q['page'];
            $offset = $req_q['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total      = $query->count();       
        $q_r        = $query->all();
        $items      = [];
        
   		foreach ($q_r as $i){ 
   		
   			$fields     = $this->{'SmsHistories'}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            }
   		
   			array_push($items, $row);
   		}
    
    	$this->set([
            'items' 		=> $items,
            'success' 		=> true,
            'totalCount' 	=> $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
       
    }
    
   	public function smsHistoriesDelete(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
    
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$req_d		= $this->request->getData();	
		$ap_flag 	= true;		
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}
        
	    if(isset($req_d['id'])){   
            $entity     = $this->{'SmsHistories'}->get($req_d['id']);          
            if(($entity->cloud_id == -1)&&($ap_flag == true)){
	    		$this->set([
					'message' 	=> 'Not enough rights for action',
					'success'	=> false
				]);
				$this->viewBuilder()->setOption('serialize', true);
				return;
	    	}          
            $this->{'SmsHistories'}->delete($entity);

        }else{ 
            foreach($req_d as $d){
                $entity     = $this->{'SmsHistories'}->get($d['id']);
                if(($entity->cloud_id == -1)&&($ap_flag == true)){
					$this->set([
							'message' 	=> 'Not enough rights for action',
							'success'	=> false
						]);
						$this->viewBuilder()->setOption('serialize', true);
					return;
				}      
                $this->{'SmsHistories'}->delete($entity);
            }
        }
 
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
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
        
        $this->set([
            'data' => $data,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
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
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
               
        }
    }
    
    
    //=== EMAIL ======   
     public function viewEmail(){
     
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $ap_flag 	= true;
     
        if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}
     
        $nr         = 1;
        $enabled    = false;
        $req_q      = $this->request->getQuery(); 
        
        if(isset($req_q['nr'])){
            $nr = $req_q['nr'];
        }
        
        $data   = []; 
        $data   = ['email_enabled' => $enabled];    
              
        if(isset($req_q['edit_cloud_id'])){
            $edit_cloud_id = $req_q['edit_cloud_id'];
            if(preg_match("/^Clouds_/", $edit_cloud_id)){
            	$cloud_id = preg_replace('/^Clouds_/', '', $edit_cloud_id);
            }
            
            if(($edit_cloud_id == -1)&&($ap_flag == true)){
	    		$this->set([
					'message' 	=> 'Not enough rights for action',
					'success'	=> false
				]);
				$this->viewBuilder()->setOption('serialize', true);
				return;
	    	} 
            

            //System is (cloud_id -1) UserSettings
            if($edit_cloud_id == -1){             
        		$q_r    = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'email_%' ])->all();
       		}else{       		
       			$q_r    = $this->{$this->cloud_model}->find()->where(['CloudSettings.cloud_id' => $cloud_id, 'CloudSettings.name LIKE' => 'email_%' ])->all();
       		} 
       		
       		foreach($q_r as $ent){
		        $data[$ent->name] = $ent->value;
		   	}  		    		         
        }
                                
        $this->set([
            'data'          => $data,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
      
    public function saveEmail(){
    
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $ap_flag 	= true;
     
        if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
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
                 
          	foreach(array_keys($data) as $key){
          	
          		if(preg_match("/^email_/", $key)){ //Only things that starts with email_
                    $value = $data[$key];
            
		        	if(isset($data['edit_cloud_id'])){
						$edit_cloud_id = $data['edit_cloud_id'];
						$cloud_id	   = -1;
						if(preg_match("/^Clouds_/", $edit_cloud_id)){
							$cloud_id = preg_replace('/^Clouds_/', '', $edit_cloud_id);
						}
						
						$model = $this->main_model;
						
						if(($edit_cloud_id == -1)&&($ap_flag == true)){
	                		$this->set([
					            'message' 	=> 'Not enough rights for action',
					            'success'	=> false
				            ]);
				            $this->viewBuilder()->setOption('serialize', true);
				            return;
	                	} 
	                							

						//System is (cloud_id -1) UserSettings
						if($edit_cloud_id == -1){             
							$q_r   = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => $key ])->first();
							$model = $this->main_model;
				   		}else{       		
				   			$q_r   = $this->{$this->cloud_model}->find()->where(['CloudSettings.cloud_id' => $cloud_id, 'CloudSettings.name' => $key ])->first();
				   			$model = $this->cloud_model;
				   		}
				   		
				   		if($q_r){
		                    $this->{$model}->patchEntity($q_r, ['value'=> $value]);
		                    $this->{$model}->save($q_r);
		                }else{
		                    $d = [];
		                    $d['name']      = $key;
		                    $d['value']     = $value;
		                    $d['user_id']   = -1;
		                    $d['cloud_id']  = $cloud_id;
		                    $entity = $this->{$model}->newEntity($d);
		                    $this->{$model}->save($entity);
		                }
				   					   		 	    		         
					}
				}
								
            }

            $this->set([
                'items' => $items,
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
               
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
            
            $meta_data 	= $this->MailTransport->setTransport(); 
                    
            if(isset($data['edit_cloud_id'])){
            	$edit_cloud_id = $data['edit_cloud_id'];
            	if($data['edit_cloud_id'] == -1){
            		//do nothing
            	}else{
            		if(preg_match("/^Clouds_/", $edit_cloud_id)){
						$cloud_id = preg_replace('/^Clouds_/', '', $edit_cloud_id);
						$meta_data     = $this->MailTransport->setTransport($cloud_id); 
					}
            	}     	
        	}
                                       
            $success    = false;            
            if($meta_data !== false){         
                $email = new Mailer(['transport'   => 'mail_rd']);
                $from  = $meta_data['from'];
                $email->setFrom($from)
                    ->setTo($email_to)
                    ->setSubject("$subject")
                    ->deliver("$base_msg");
                
                $settings_cloud_id = $this->MailTransport->getCloudId();
            	$this->RdLogger->addEmailHistory($settings_cloud_id,$email_to,'test_email',$base_msg);
                               
                $success    = true;
                $this->set([
                    'data'          => $data,
                    'success'       => $success
                ]);
                $this->viewBuilder()->setOption('serialize', true); 
            }else{                     
                $this->set([
                    'data'          => $data,
                    'success'       => $success,
                    'message'       => 'Email Disabled / Not Configured'
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            }            
        }
    }
    
    public function emailHistoriesIndex(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $req_q    = $this->request->getQuery();    
       	
       	
       	if(isset($req_q['edit_cloud_id'])){
            $cloud_id = $req_q['edit_cloud_id'];
            if(preg_match("/^Clouds_/", $cloud_id)){
            	$cloud_id = preg_replace('/^Clouds_/', '', $cloud_id);
            }
       	}
        $query 	  = $this->{'EmailHistories'}->find()->where(['EmailHistories.cloud_id' => $cloud_id]);

        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
        if(isset($req_q['limit'])){
            $limit  = $req_q['limit'];
            $page   = $req_q['page'];
            $offset = $req_q['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total      = $query->count();       
        $q_r        = $query->all();
        $items      = [];
        
   		foreach ($q_r as $i){ 
   		
   			$fields     = $this->{'EmailHistories'}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            }
   		
   			array_push($items, $row);
   		}
    
    	$this->set([
            'items' 		=> $items,
            'success' 		=> true,
            'totalCount' 	=> $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
       
    }
    
   	public function emailHistoriesDelete(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
    
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$req_d		= $this->request->getData();	
		$ap_flag 	= true;		
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}
        
	    if(isset($req_d['id'])){   
            $entity     = $this->{'EmailHistories'}->get($req_d['id']);          
            if(($entity->cloud_id == -1)&&($ap_flag == true)){
	    		$this->set([
					'message' 	=> 'Not enough rights for action',
					'success'	=> false
				]);
				$this->viewBuilder()->setOption('serialize', true);
				return;
	    	}          
            $this->{'EmailHistories'}->delete($entity);

        }else{ 
            foreach($req_d as $d){
                $entity     = $this->{'EmailHistories'}->get($d['id']);
                if(($entity->cloud_id == -1)&&($ap_flag == true)){
					$this->set([
							'message' 	=> 'Not enough rights for action',
							'success'	=> false
						]);
						$this->viewBuilder()->setOption('serialize', true);
					return;
				}      
                $this->{'EmailHistories'}->delete($entity);
            }
        }
 
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
     
             
   	public function saveMqtt(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }
       
        if ($this->request->is('post')) {
        
            $items = [];  
            $data  = $this->request->getData();       
            $check_items = [
			    'mqtt_enabled',
			    'api_mqtt_enabled' 
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
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
               
        }
    }
    
    public function testMqtt(){
    
        $q_r        = $this->{$this->main_model}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => 'api_mqtt_gateway_url' ])->first();
        if($q_r){       
            $url        = $q_r->value;
            $http       = new Client();
            $response   = $http->get($url);       
            $data['url']= $url; 
            $reply      = $response->getStringBody();
            preg_match("/<body[^>]*>(.*?)<\/body>/is", $reply, $matches);
            $data['reply']  = $matches[1];                        
        }else{      
            $data['reply'] = "<h1>API Gateway URL Not Found</h1><p><b>Please check your settings -> save and test again</b></p>";       
        }    
        $this->set([
            'data' => $data,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);  
    }
    
    function menuForEmailHistories(){

       $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'ReloadDelete');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
    function menuForSmsHistories(){

       $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'ReloadDelete');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
    public function mailTransports(){
        $items = [];
        $ct = Configure::read('mail_transports');
        foreach($ct as $i){

        	array_push($items, $i);

        }
        
        $this->set([
            'items' 	=> $items,
            'success' 	=> true
        ]);      
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function wip(){
    
    	
    	$retval = $this->RdSms->sendSms('0725963050',"Gooi Hom",0,-1,"WippieEnSnippie");
    	if($retval){
    		$this->set([
		        'success' 	=> true,
		        'data'		=> $retval
		    ]); 
    	
    	}else{
    		$this->set([
		        'success' 	=> false
		    ]);       	
    	}
    	$this->set([
            'success' 	=> true
        ]);      
        $this->viewBuilder()->setOption('serialize', true);
    
    }
     
}
