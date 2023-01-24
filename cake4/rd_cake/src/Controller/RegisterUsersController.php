<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Mailer\Mailer;
use Cake\Http\Client;
use Cake\I18n\FrozenTime;
use Cake\I18n\I18n;

class RegisterUsersController extends AppController {

	protected $valid_minutes = 2; //The time that an OTP will be valid (in minutes)

    public function initialize():void{
        parent::initialize();
        $this->loadModel('Users');
        $this->loadModel('Profiles');
        $this->loadModel('Realms');
        $this->loadModel('PermanentUsers');
        $this->loadModel('Radchecks');
        $this->loadModel('PermanentUserOtps');
        $this->loadModel('DynamicDetails');
        $this->loadModel('UserSettings');
        $this->loadModel('Clouds');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('MailTransport');
        $this->loadComponent('RdLogger');
        $this->loadComponent('Otp');
        $this->loadComponent('RdSms'); 
        $this->loadComponent('Formatter');
    }
    
    public function newPermanentUser(){

		//--No login_page_id no reg --
		if(array_key_exists('login_page_id',$this->request->getData())){
		    $page_id = $this->request->getData('login_page_id');
		    $q_r = $this->DynamicDetails->find()->where(['DynamicDetails.id' => $page_id])->first();
		    if(!$q_r){
		         $this->set([
				    'success'   => false,
				    'errors'	=> ['Login Page ID' => 'Page not found in database']
			    ]);
			    $this->viewBuilder()->setOption('serialize', true);
			    return;
		    }
		}else{
		    $this->set([
				'success'   => false,
				'errors'	=> ['Login Page ID' => 'Login Page ID missing']
			]);
			$this->viewBuilder()->setOption('serialize', true);
			return;
		}
		
		if(!$q_r->register_users){
		    $this->set([
				'success'   => false,
				'errors'	=> ['Registration forbidden' => 'User Registration not allowed'],
			]);
			$this->viewBuilder()->setOption('serialize', true);
			return; 
		}
		
		

		//--Do the MAC test --
		$mac_name   = '';
		$mac_value  = '';
		
		if($q_r->reg_mac_check){
		    if(array_key_exists('mac',$this->request->getData())){
				$mac = $this->request->getData('mac');
				$mac_value = $mac;
				$mac_name  = 'mac';
				if($mac == ''){//Can't use empty MACs
				    $this->set([
				        'success'   => false,
				        'errors'	=> ['Address not specified' => 'MAC Address not specified']
			        ]);
			        $this->viewBuilder()->setOption('serialize', true);
			        return;
				}

				$q = $this->PermanentUsers->find()
					->where(['PermanentUsers.extra_name' 	=> 'mac', 'PermanentUsers.extra_value' => $mac,])
					->contain(['PermanentUserOtps'])
					->first();

				if($q){
				
					if($q->permanent_user_otp){
						if($q->permanent_user_otp->status == 'otp_awaiting'){						
							$data_awaiting = [
								'id'		=> $q->id,
								'otp_show'  => true,
								'message'	=> "Supply OTP Please"
							];
							$pu_id   = $q_r->permanent_user_id;
							if(($pu_id != 0)&($q_r->reg_otp_email)){
								$e_pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.id' => $pu_id])->first();
								if($e_pu){
									$e_rd = $this->{'Radchecks'}->find()->where(['Radchecks.username' => $e_pu->username,'Radchecks.attribute' => 'Cleartext-Password'])->first();
									if($e_rd){
										$message = __("OTP sent to").' '.$this->Formatter->hide_email($q->email)."<br><b>Temporary Internet Access Given To Retrieve OTP Through Email</b>";
										$data_awaiting['temp_username'] 	= $e_pu->username;
										$data_awaiting['temp_password'] 	= $e_rd->value;
										$data_awaiting['message'] 			= $message;
									}
								}                   						
							}								
						
							$this->set([
								'success'   => true,
								'data'		=> $data_awaiting
							]);
							$this->viewBuilder()->setOption('serialize', true);
							return;						
						}					
					}
				
					$already_username = $q->username;
					$this->set([
						'success'   => false,
						'errors'	=> ['username' => "MAC Address $mac in use by $already_username"]
					]);
					$this->viewBuilder()->setOption('serialize', true);
					return;
				}
			}else{

				$this->set([
					'success'   => false,
					'errors'	=> ['Device ID Missing' => 'Device MAC not in request']
				]);
				$this->viewBuilder()->setOption('serialize', true);
				return;
			}
		}
		

		//Get the token of the Owner of the Cloud
		$cloud_id	= $q_r->cloud_id;
		$e_cloud    = $this->{'Clouds'}->find()->where(['Clouds.id' => $cloud_id])->first();		
		$q_u 		= $this->Users->find()->where(['id' => $e_cloud->user_id])->first();

		$token		= $q_u->token;

		//Realm id
		$realm_id	= $q_r->realm_id;

		//Profile id
		$profile_id	= $q_r->profile_id;
		
		
		//---- Dec 2022 -- Allow the option to specify an overriding Profile based on other_profile_id / or other_profile_name --
		//-- Case stude e.g. we want to give a user that specified a certain thing e.g. certain provider for mobile phone a better profile ---
		
		$p_data = $this->request->getData();
		
		if(isset($p_data['i18n'])){
			I18n::setLocale($p_data['i18n']);
		}
		 
		if((array_key_exists('other_profile_id',$p_data))||(array_key_exists('other_profile_name',$p_data))){
			if(array_key_exists('other_profile_name',$p_data)){			
				$e_other_profile = $this->{'Profiles'}->find()->where(['Profiles.name' => $p_data['other_profile_name']])->first();
				if($e_other_profile){
					$profile_id = $e_other_profile->id;
				}			
			}
			
			if(array_key_exists('other_profile_id',$p_data)){			
				$profile_id = $p_data['other_profile_id'];		
			}		
		}
		//---- END Dec 2022 --
		
				
		//Determine the Data / Time cap
		$e_profile = $this->{'Profiles'}->find()->where(['Profiles.id' => $profile_id])->contain(['Radusergroups'=> ['Radgroupchecks']])->first();
		
		$data_cap_in_profile    = false; 
        $time_cap_in_profile    = false; 

        foreach ($e_profile->radusergroups as $cmp){
            foreach ($cmp->radgroupchecks as $radgroupcheck) {
                if($radgroupcheck->attribute == 'Rd-Cap-Type-Data'){
                    $data_cap_in_profile = $radgroupcheck->value;
                }
                if($radgroupcheck->attribute == 'Rd-Cap-Type-Time'){
                    $time_cap_in_profile = $radgroupcheck->value;
                }              
            }
        }
        	
        $active   	= 'active';
        $cap_data 	= 'hard';
        $language   = '4_4';     
        $url        = 'http://127.0.0.1/cake4/rd_cake/permanent-users/add.json'; 
        $username	= $this->request->getData('username');
		$password	= $this->request->getData('password');
		$email		= $this->request->getData('username');	
		
		//--- ADD ON ---- Expire them after 30 days
		/*
		$from_date	=  date("n/j/Y");
		$plus_30  	= mktime(0, 0, 0, date("m"),   date("d")+31,   date("Y")); //We actually put 31 since today is already gone
		$to_date	=  date("n/j/Y",$plus_30);
		
		'from_date'		=> $from_date,
	    'to_date'		=> $to_date,
	    */
         
        // The data to send to the API
        $postData = [
            'active'        => $active,
            'cap_data'      => $cap_data,
            'language'      => $language,
            'cloud_id'     	=> $cloud_id,
            'profile_id'    => $profile_id,
            'realm_id'      => $realm_id,
            'token'         => $token,
            'username'      => $username,
            'password'      => $password,
            'email'         => $username, //Email and username will be the same / email required
			'extra_name'	=> $mac_name,
			'extra_value'	=> $mac_value,
			'name'          => $this->request->getData('name'),
			'surname'       => $this->request->getData('surname'),
			'phone'         => $this->request->getData('phone')
        ];
               
		if($q_r->reg_auto_add){
		    $postData['auto_add'] = 1;
		}
        
        //Add the Cap Type if defined
        if($data_cap_in_profile){
            $postData['data_cap_type'] = $data_cap_in_profile;
        }
        if($time_cap_in_profile){
            $postData['time_cap_type'] = $time_cap_in_profile;
        }
        
        //== Dec 2022==
        //We add OTP functinality reg_otp_sms or reg_otp_email
        if(($q_r->reg_otp_sms)||($q_r->reg_otp_email)){
        	unset($postData['active']); //With OTP user is disabled by default       
        }
     
        $response = $this->_create_permanent_user($url, $postData);

		$responseData = json_decode($response, true);
		//print_r($responseData);

        if($responseData['success'] == false){  
        
        	//Check here if the invalid_username is set 
        	if(isset($responseData['invalid_username'])){    	
        		$existing_check = $responseData['invalid_username'];
        		$q_pu = $this->{'PermanentUsers'}->find()
        			->where(['PermanentUsers.username' => $existing_check])
        			->contain(['PermanentUserOtps'])
        			->first();
        		
        		if($q_pu){
					if($q_pu->permanent_user_otp){
		    			if($q_pu->permanent_user_otp->status == 'otp_awaiting'){
		    				$message = '';
		    				$data    = [];
		    				if($q_r->reg_otp_sms){
								$message = __("OTP sent to").' '.$this->Formatter->hide_phone($this->request->getData('phone'))."<br>";
							}
							if($q_r->reg_otp_email){
								$message = $message.__("OTP sent to").' '.$this->Formatter->hide_email($username)."<br><b>Temporary Internet Access Given To Retrieve OTP Through Email</b>";
								$pu_id   = $q_r->permanent_user_id;
								if($pu_id != 0){
									$e_pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.id' => $pu_id])->first();
									if($e_pu){
										$e_rd = $this->{'Radchecks'}->find()->where(['Radchecks.username' => $e_pu->username,'Radchecks.attribute' => 'Cleartext-Password'])->first();
										if($e_rd){
											$data['temp_username'] 			= $e_pu->username;
											$data['temp_password'] 			= $e_rd->value;
										}
									}                   						
								}					
							}
							
							$data['message'] 	= $message;
							$data['otp_show']  	= true;
							$data['id']			= $q_pu->id;
									    			
		    				$this->set([
								'success'   => true,
								'data'		=> $data
							]);
							$this->viewBuilder()->setOption('serialize', true);
							return;        			
		    			}
		    		}        		
        		}       	
        	}
           
			$this->set([
	        'success'   => $responseData['success'],
			'errors'	=> $responseData['errors'],
			'message'	=> $responseData['message']
			]);
			$this->viewBuilder()->setOption('serialize', true);

		}

		if($responseData['success'] == true){

			//Check if we need to email them
			if($q_r->reg_email){
				$this->_email_user_detail($cloud_id,$username,$password);
			}
			
			//IF we need to do OTP add an antry for the newly created (and disabled user in the PermanentUserOtps table)
			if(($q_r->reg_otp_sms)||($q_r->reg_otp_email)){
				$d_otp 			= [];
				$d_otp['value']	= mt_rand(1111,9999);
				$d_otp['permanent_user_id'] = $responseData['data']['id'];
				$e_utp 			= $this->{'PermanentUserOtps'}->newEntity($d_otp);
				$this->{'PermanentUserOtps'}->save($e_utp);
				
				$postData['otp_show'] = true; //**This will be the cue for the login page to pop-up the OTP Screen**
				$postData['id']		  = $responseData['data']['id']; //Send the ID of the newly created user in the reply
				
				$message = '';
				
				if($q_r->reg_otp_sms){
					$this->_sms_otp($this->request->getData('phone'),$d_otp['value'],$q_r->cloud_id,'user_registration');
					$message = __("OTP sent to").' '.$this->Formatter->hide_phone($this->request->getData('phone'))."<br>";
				}
				if($q_r->reg_otp_email){
					$this->_email_otp($username,$d_otp['value'],$q_r->cloud_id,$e_utp->id);
					$message = $message.__("OTP sent to").' '.$this->Formatter->hide_email($username)."<br><b>Temporary Internet Access Given To Retrieve OTP Through Email</b>";
					
					$pu_id   = $q_r->permanent_user_id;
					if($pu_id != 0){
						$e_pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.id' => $pu_id])->first();
						if($e_pu){
							$e_rd = $this->{'Radchecks'}->find()->where(['Radchecks.username' => $e_pu->username,'Radchecks.attribute' => 'Cleartext-Password'])->first();
							if($e_rd){
								$postData['temp_username'] 	= $e_pu->username;
								$postData['temp_password'] 	= $e_rd->value;
							}
						}                   						
					}	
										
				}
				$postData['message'] = $message;				
			}
									
			//============== SMALL HACK 26 MAY 2022 ===============
			//==== USE THIS TO ADD THE INITIAL DATA / TIME FOR USER REGISTRATION WITH **TOP-UP** PROFILES ====
			//=====================================================
			
            $add_topup = false;
            if($add_topup){
                $postTopupData  = [
                    'cloud_id'          => $cloud_id, //We make the Cloud of the Login Page the Cloud of the Top-Up 
                    'permanent_user_id' => $responseData['data']['id'], //Permanent User who gets the Top-Up
                    'type'              => 'data',  //Type (data, time or days_to_use)
                    'value'             => '10', //**Change VALUE**
                    'data_unit'         => 'mb', //**Change VALUE**
                    'comment'           => 'User Reg First TopUp', //Comment to ID them
                    'token'             => $token //Token of the Login Page owner                
                ];
                $topup_add_url  = 'http://127.0.0.1/cake4/rd_cake/top-ups/add.json';
                $topup_response = $this->_add_initial_topup($topup_add_url,$postTopupData);
                $postData['top_up'] = $topup_response;          
            }
            //-----------------------------------------------
            //======== SMALL HACK 26 MAY 2022 ===============
            //----------------------------------------------
                    
			$this->set([
            'success'   => $responseData['success'],
			'data'		=> $postData
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);
		}
	}
	
	public function otpSubmit(){
	
		$p_data 	= $this->request->getData();		
		$success 	= false;
		$message	= "";
				
		if(isset($p_data['permanent_user_id'])){
		
			if(isset($p_data['i18n'])){
				I18n::setLocale($p_data['i18n']);
			}
		
			$user_id 	= $p_data['permanent_user_id'];
			$otp		= $p_data['otp'];
			$q_r 		= $this->{'PermanentUserOtps'}->find()->where(['PermanentUserOtps.permanent_user_id' => $user_id])->first(); //There is supposed to be only one
			if($q_r){			
				$time = FrozenTime::now();
				if($time > $q_r->modified->addMinutes($this->valid_minutes)){ //We expire the OTP after two minutes
					$message = __("OTP expired - Request new one please");
				}else{			
					if($otp == $q_r->value){
						$success = true;
						$this->{'PermanentUserOtps'}->patchEntity($q_r, ['status' => 'otp_confirmed']);
						$this->{'PermanentUserOtps'}->save($q_r);
						//Activate the permanent user account
						$q_pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.id' =>$user_id])->first();
						if($q_pu){
							$this->{'PermanentUsers'}->patchEntity($q_pu, ['active' => 1]);
							$this->{'PermanentUsers'}->save($q_pu);
						} 					
					}else{
						$message = __("OTP mismatch - Try again");
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
		 		
		if(isset($p_data['permanent_user_id'])){
		
			if(isset($p_data['i18n'])){
				I18n::setLocale($p_data['i18n']);
			}
			
			$user_id = $p_data['permanent_user_id'];
			$dd_id   = $p_data['login_page_id'];		 
			$value   = mt_rand(1111,9999);
			//-> 1.) Update the OTP value
			$q_r 	 = $this->{'PermanentUserOtps'}->find()->where(['PermanentUserOtps.permanent_user_id' => $user_id])->first();
			if($q_r){
				$this->{'PermanentUserOtps'}->patchEntity($q_r, ['value' => $value]);
				$this->{'PermanentUserOtps'}->save($q_r);
			}
			//-> 2.) Get the way to send the OTP
			$q_dd 	= $this->{'DynamicDetails'}->find()->where(['DynamicDetails.id' => $dd_id])->first();
			if($q_dd){
					
				//Get the Permanent User's Detail
				$q_pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.id' =>$user_id])->first();
				if($q_pu){
				
					$email = $q_pu->email;
					$phone = $q_pu->phone;					
													
					if($q_dd->reg_otp_sms){
						$message = __("New OTP sent to").' '.$this->Formatter->hide_phone($phone)."<br>";
						$this->_sms_otp($phone,$value,$q_dd->cloud_id,'user_registration_two');
					}
					
					if($q_dd->reg_otp_email){
						$message = $message.__("New OTP sent to").' '.$this->Formatter->hide_email($email);
						$this->_email_otp($email,$value,$q_dd->cloud_id,$q_r->id);
					}
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
			$otp		= $req_q['otp'];
			$q_r 		= $this->{'PermanentUserOtps'}->find()->where(['PermanentUserOtps.id' => $data_id])->first(); //There is supposed to be only one
			if($q_r){		
				$time = FrozenTime::now();
				if($time > $q_r->modified->addMinutes($this->valid_minutes)->addMinutes($this->valid_minutes)){ //We expire the OTP after two minutes x2 for email
					$message = __("OTP expired - Request new one please");
				}else{			
					if($otp == $q_r->value){
						$success = true;
						$this->{'PermanentUserOtps'}->patchEntity($q_r, ['status' => 'otp_confirmed']);
						$this->{'PermanentUserOtps'}->save($q_r);
						$user_id = $q_r->permanent_user_id;
						$q_pu = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.id' =>$user_id])->first();
						if($q_pu){
							$this->{'PermanentUsers'}->patchEntity($q_pu, ['active' => 1]);
							$this->{'PermanentUsers'}->save($q_pu);
						} 								
						$this->response = $this->response->withHeader('Location', "http://1.0.0.0"); //For Coova Log User Out FIXME We still have to figure out how to handle Mikrotik since it does not have this feature
        			
        			return $this->response;
											
					}else{
						$message = __("OTP mismatch - Try again");
					}					
				}
			}
		}
		
		$this->set([
        'success'   => true,
        'message'	=> $message
	    ]);
	    $this->viewBuilder()->setOption('serialize', true);				 	
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
	
	private function _email_otp($email,$otp,$cloud_id,$data_id){	
		$this->Otp->sendEmailUserReg($email,$otp,$cloud_id,$data_id);
	}
	
	private function _sms_otp($phone,$otp,$cloud_id,$reason){
		// public function sendSms($phone,$message,$nr,$cloud_id,$reason='test_settings'){
		$this->RdSms->sendSms($phone,$otp,0,$cloud_id,$reason);
	
	}

}
