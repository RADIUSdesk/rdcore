<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 23/JUN/2026
 * Time: 00:01
 */

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Mailer\Mailer;
use Cake\Http\Client;
use Cake\I18n\FrozenTime;
use Cake\I18n\I18n;

class RegisterClientsController extends AppController {

	protected $valid_minutes = 10; //The time that an OTP will be valid (in minutes)

    public function initialize():void{
        parent::initialize();
        $this->loadModel('Clients'); 
        $this->loadModel('ClientOtps');    
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('MailTransport');
        $this->loadComponent('RdLogger');
        $this->loadComponent('Otp');
        $this->loadComponent('RdSms'); 
        $this->loadComponent('Formatter');
        $this->Authentication->allowUnauthenticated(['newClient','otpSubmit','otpRequest','otpConfirm','lostPassword']); 
    }
    
    public function newClient(){
    
        $formData   = $this->request->getData();         
        //First see if it exists with and if there is an OTP for it
        $username   = $formData['username'];       
        $client     = $this->Clients->find()
                    ->where(['Clients.username' => $username])
                    ->contain(['ClientOtps'])
                    ->first();
       
        if($client){
            if(($client->client_otp)&&($client->client_otp->status == 'otp_awaiting')){
                $formData['otp_show'] = true;
                $formData['message']  = 'Supply OTP Please';
                $formData['already_registered'] = true;
                $formData['client_id'] = $client->id;
                         
                $this->set([
                    'success'   => true,
                    'data'	    => $formData
	            ]);
	            $this->viewBuilder()->setOption('serialize', true);
	            return;	       
            }          
        }
        
        $entity     = $this->Clients->newEntity($formData);      
        if($this->Clients->save($entity)){
        
            //--- OTP related ---
            $client_id  = $entity->id;
            $username   = $entity->username;
            $otp        =  $this->ClientOtps->newEntity(['client_id' => $client_id,'value' => mt_rand(1111,9999)]);
            if($this->ClientOtps->save($otp)){
                $this->emailOtp($username,$otp,);
            }
            //--- END OTP ---
                 
            $formData['otp_show'] = true;
            $formData['message']  = 'Supply OTP Please'; 
            $formData['client_id'] =  $entity->id;          
            $this->set([
                'success'   => true,
                'data'	    => $formData
	        ]);
	        $this->viewBuilder()->setOption('serialize', true);	    
                 
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);        
        }                        
	}
	
	private function emailOtp($username,$otp){	
	    $this->_email_otp($username,$otp);
	}
	
	public function otpSubmit(){
	
		$p_data 	= $this->request->getData();		
		$success 	= false;
		$message	= "";
				
		if(isset($p_data['client_id'])){
		
			if(isset($p_data['i18n'])){
				I18n::setLocale($p_data['i18n']);
			}
		
			$client_id 	= $p_data['client_id'];
			$form_otp   = $p_data['otp'];
			$otp 		= $this->ClientOtps->find()->where(['ClientOtps.client_id' => $client_id])->first(); //There is supposed to be only one
			if($otp){			
				$time = FrozenTime::now();
				if($time > $otp->modified->addMinutes($this->valid_minutes)){ //We expire the OTP after x minutes
					$message    = __("OTP expired - Request new one please");
					$a          = [ 'otp' => $message ];
					$data       = [
		            	'errors'    => $a,
                        'success'   => false,
                        'message'   => $message
                    ];                   
                    $this->set($data);		    
			        $this->viewBuilder()->setOption('serialize', true);
			        return;
                    
				}else{			
					if($form_otp == $otp->value){
						$success = true;
						$this->ClientOtps->patchEntity($otp, ['status' => 'otp_confirmed']);
						$this->ClientOtps->save($otp);
						//Activate the permanent user account
						$client = $this->Clients->find()->where(['Clients.id' => $client_id])->first();
						if($client){
							$this->Clients->patchEntity($client, ['active' => 1]);
							$this->Clients->save($client);
						} 					
					}else{
						$message = __("OTP mismatch - Try again");
						$a          = [ 'otp' => $message ];
					    $data       = [
		                	'errors'    => $a,
                            'success'   => false,
                            'message'   => $message
                        ];                   
                        $this->set($data);		    
			            $this->viewBuilder()->setOption('serialize', true);
			            return;
					}					
				}
			}
		}
			
		$this->set([
        'success'   => $success,
        'message'	=> $message
	    ]);
	    $this->viewBuilder()->setOption('serialize', true);	
	}
	
	public function otpRequest(){	
		$p_data 	= $this->request->getData();
		$message 	= '';
		 		
		if(isset($p_data['client_id'])){
			
			$client_id  = $p_data['client_id'];	 
			$value      = mt_rand(1111,9999);
			//-> 1.) Update the OTP value
			$otp 	 = $this->{'ClientOtps'}->find()
			    ->where(['ClientOtps.client_id' => $client_id])
			    ->contain(['Clients'])
			    ->first();
			if($otp){
				$this->{'ClientOtps'}->patchEntity($otp, ['value' => $value]);
				if($this->{'ClientOtps'}->save($otp)){
				    $email = $otp->client->username;
				    $this->emailOtp($email,$otp);
				}
			}				
		}
			
		$this->set([
        'success'   => true,
        'message'	=> $message
	    ]);
	    $this->viewBuilder()->setOption('serialize', true);	
	}
	
	//This is the link URL from the email the user get when sending an OTP via email
	public function otpConfirm(){
	
		$success	= false;
		$req_q 		= $this->request->getQuery();
				
		if(isset($req_q['data_id'])){

			$data_id 	= $req_q['data_id'];
			$otp_q   	= $req_q['otp'];
			$otp 		= $this->ClientOtps->find()->where(['ClientOtps.id' => $data_id])->contain(['Clients'])->first(); //There is supposed to be only one
			if($otp){		
				////$time = FrozenTime::now();
				////if($time > $otp->modified->addMinutes($this->valid_minutes)->addMinutes($this->valid_minutes)){ //We expire the OTP after two minutes x2 for email
				////	$message = __("OTP expired - Request new one please");
				////}else{			
					if($otp_q == $otp->value){
						$success = true;
						$this->{'ClientOtps'}->patchEntity($otp, ['status' => 'otp_confirmed']);
						$this->{'ClientOtps'}->save($otp);
						$client_id = $otp->client_id;
						$client = $this->Clients->find()->where(['Clients.id' => $client_id])->first();
						if($client){
							$this->Clients->patchEntity($client, ['active' => 1]);
							$this->Clients->save($client);
						} 								
						$this->set([
                            'success'   => true,
                            'data'      => $otp
                        ]);
                        $this->viewBuilder()->disableAutoLayout();
                        return;
											
					}else{
						$message = __("OTP mismatch - Try again");
						$this->set([
                        'success'   => true,
                        'message'	=> $message,
                        'data'      => []
	                    ]);
	                    $this->viewBuilder()->setOption('serialize', true);	
					}					
				}
			////}
		}
    }

	public function lostPassword(){
	
	    $success = false;
	    $message = 'User Not Found';
	    if(array_key_exists('email',$this->request->getData())){
	    
	        $username = $this->request->getData('email');
	         
	        if($this->request->getData('auto_suffix_check') == 'true'){
	            $username = $username.'@'.$this->request->getData('auto_suffix');
	        }
	     
	        $query = $this->PermanentUsers->find()->contain(['Radchecks']);
	        $q_r = $query->where(['PermanentUsers.username' => $username])->first();
	       
	        $password = false;

	        if($q_r){
	            foreach($q_r->radchecks as $rc){
                    if($rc->attribute == 'Cleartext-Password'){
                        $un = $this->request->getData('email');
                        $password = $rc->value;
                        if($this->request->getData('auto_suffix_check') == 'true'){
	                        $un = $un." ($username)";
	                    }
                        $this->_email_lost_password($un,$password);
                        $success = true;
                        $message = "Email Sent";
                        break;
                    }
	            }
	        }        
	    }
	    
	    if(array_key_exists('phone',$this->request->getData())){
	    
	        $phone      = $this->request->getData('phone');	         	     
	        $query      = $this->PermanentUsers->find()->contain(['Radchecks']);
	        $q_r        = $query->where(['PermanentUsers.phone' => $phone])->first();	       
	        $password   = false;

	        if($q_r){
	        	$cloud_id   = $q_r->cloud_id;
	            foreach($q_r->radchecks as $rc){
                    if($rc->attribute == 'Cleartext-Password'){
                        $un         = $rc->username;
                        $password   = $rc->value;
                        $message    = "Username: $un\nPassword: $password";
                        $success    = $this->_sms_lost_password($phone,$message,$cloud_id);
                        $message    = "SMS Sent";
                        break;
                    }
	            }
	        }        
	    }

		$this->set([
        'success'   => $success,
		'message'   => $message
	    ]);
	    $this->viewBuilder()->setOption('serialize', true);
	}
	
	private function _sms_lost_password($phone,$message,$cloud_id){
	
		$retval = $this->RdSms->sendSms($phone,$message,0,$cloud_id,"lost_password");
		if($retval){
			return true;
		}
	    return $retval;	
	}
		
	private function _email_lost_password($cloud_id,$username,$password){	
	    $meta_data 	= $this->MailTransport->setTransport($cloud_id);           
        $success    = false;            
        if($meta_data !== false){          
            $email 	= new Mailer(['transport'   => 'mail_rd']);
            $from   = $meta_data['from'];
            $email->setFrom($from)
            	->setSubject('Lost Password Retrieval')
            	->setTo($this->request->getData('email'))
            	->setViewVars(compact( 'username', 'password'))
            	->setEmailFormat('html')
             	->viewBuilder()
                    	->setTemplate('user_detail')
                		->setLayout('user_notify');   
            $email->deliver();
            
            $settings_cloud_id = $this->MailTransport->getCloudId();
            $this->RdLogger->addEmailHistory($cloud_id,$this->request->getData('email'),'lost_password',"$username $password");
            
            $success  = true;
        }	
	    return $success;   
	}

	private function _email_user_detail($cloud_id,$username,$password){
        $meta_data = $this->MailTransport->setTransport($cloud_id);           
        $success    = false;            
        if($meta_data !== false){       
		    $email  = new Mailer(['transport'   => 'mail_rd']);
		    $from   = $meta_data['from'];
            $email->setFrom($from)
            	->setSubject('New user registration')
            	->setTo($this->request->getData('username'))
            	->setViewVars(compact( 'username', 'password'))
            	->setEmailFormat('html')
            	->viewBuilder()
                    	->setTemplate('user_detail')
                		->setLayout('user_notify'); 
            $email->deliver();
            
            $settings_cloud_id = $this->MailTransport->getCloudId();
            $this->RdLogger->addEmailHistory($cloud_id,$this->request->getData('username'),'register_user_detail',"$username $password");           
            $success  = true;
        }
        return $success;
    }

    private function _create_permanent_user($url, $postData){
        // Setup cURL
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST            => TRUE,
            CURLOPT_RETURNTRANSFER  => TRUE,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json'
            ],
            CURLOPT_POSTFIELDS => json_encode($postData)
        ]);

        // Send the request
        $response = curl_exec($ch);
        // Check for errors
        if($response === false){
            die(curl_error($ch));
        }
        curl_close($ch);
        return $response;
	}
	
	private function _add_initial_topup($url, $postData){
	    // Setup cURL
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST            => TRUE,
            CURLOPT_RETURNTRANSFER  => TRUE,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json'
            ],
            CURLOPT_POSTFIELDS => json_encode($postData)
        ]);

        // Send the request
        $response = curl_exec($ch);
        // Check for errors
        if($response === false){
            die(curl_error($ch));
        }
        curl_close($ch);
        return $response;	
	}
	
	private function _email_otp($email,$otp){	
		$this->Otp->sendEmailClientReg($email,$otp->value,$otp->id);
	}
	
	private function _sms_otp($phone,$otp,$cloud_id,$reason){
		// public function sendSms($phone,$message,$nr,$cloud_id,$reason='test_settings'){
		$this->RdSms->sendSms($phone,$otp,0,$cloud_id,$reason);
	
	}

}
