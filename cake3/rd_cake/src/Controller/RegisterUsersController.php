<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Mailer\Email;

class RegisterUsersController extends AppController {

    public function initialize(){
        parent::initialize();
        $this->loadModel('Users');
        $this->loadModel('Profiles');
        $this->loadModel('Realms');
        $this->loadModel('PermanentUsers');
        $this->loadModel('DynamicDetails');
        $this->loadComponent('CommonQuery');
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('JsonErrors');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('MailTransport');
    }


    public function newPermanentUser(){

		//--No login_page_id no reg --
		if(array_key_exists('login_page_id',$this->request->getData())){
		    $page_id = $this->request->getData('login_page_id');

		    $q_r = $this->DynamicDetails->find()->where(['DynamicDetails.id' => $page_id])->first();

		    if(!$q_r){
		         $this->set([
				    'success'   => false,
				    'errors'	=> ['Login Page ID' => 'Page not found in database'],
					    '_serialize' => ['success','errors']
			    ]);
			    return;
		    }
		}else{
		    $this->set([
				'success'   => false,
				'errors'	=> ['Login Page ID' => 'Login Page ID missing'],
					'_serialize' => ['success','errors']
			]);
			return;
		}
		
		if(!$q_r->register_users){
		    $this->set([
				'success'   => false,
				'errors'	=> ['Registration forbidden' => 'User Registration not allowed'],
					'_serialize' => ['success','errors']
			]);
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
				        'errors'	=> ['Address not specified' => 'MAC Address not specified'],
					        '_serialize' => ['success','errors']
			        ]);
			        return;
				}

				$q = $this->PermanentUsers->find()->where(['PermanentUsers.extra_name' 	=> 'mac', 'PermanentUsers.extra_value' => $mac,])->first();

				if($q){
					$already_username = $q->username;
					$this->set([
						'success'   => false,
						'errors'	=> ['username' => "MAC Address $mac in use by $already_username"],
							'_serialize' => ['success','errors']
					]);
					return;
				}
			}else{

				$this->set([
					'success'   => false,
					'errors'	=> ['Device ID Missing' => 'Device MAC not in request'],
						'_serialize' => ['success','errors']
				]);
				return;
			}
		}
		

		//Get the token of the Dynamic Login Page owner
		$q_u = $this->Users->find()->where(['id' => $q_r->user_id])->first();

		$token		= $q_u->token;

		//Realm id
		$realm_id	= $q_r->realm_id;

		//Profile id
		$profile_id	= $q_r->profile_id;
		
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
        $parent_id  = 0;        
        $url        = 'http://127.0.0.1/cake3/rd_cake/permanent-users/add.json'; 
        $username	= $this->request->getData('username');
		$password	= $this->request->getData('password');
		
		
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
            'user_id'     	=> $parent_id,
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
        
     
        $response = $this->_create_permanent_user($url, $postData);

		$responseData = json_decode($response, true);
		//print_r($responseData);

        if($responseData['success'] == false){     
			$this->set([
            'success'   => $responseData['success'],
			'errors'	=> $responseData['errors'],
			'message'	=> $responseData['message'],
		        '_serialize' => ['success','errors','message']
		    ]);
		}

		if($responseData['success'] == true){

			//Check if we need to email them
			if($q_r->reg_email){
				$this->_email_user_detail($username,$password);
			}
			
			
			//============== SMALL HACK 26 MAY 2022 ===============
			//==== USE THIS TO ADD THE INITIAL DATA / TIME FOR USER REGISTRATION WITH **TOP-UP** PROFILES ====
			//=====================================================
			
            $add_topup = false;
            if($add_topup){
                $postTopupData  = [
                    'user_id'           => $q_u->id, //We make the owner of the Login Page the owner or the Top-Up 
                    'permanent_user_id' => $responseData['data']['id'], //Permanent User who gets the Top-Up
                    'type'              => 'data',  //Type (data, time or days_to_use)
                    'value'             => '10', //**Change VALUE**
                    'data_unit'         => 'mb', //**Change VALUE**
                    'comment'           => 'User Reg First TopUp', //Comment to ID them
                    'token'             => $token //Token of the Login Page owner                
                ];
                $topup_add_url  = 'http://127.0.0.1/cake3/rd_cake/top-ups/add.json';
                $topup_response = $this->_add_initial_topup($topup_add_url,$postTopupData);
                $postData['top_up'] = $topup_response;          
            }
            //-----------------------------------------------
            //======== SMALL HACK 26 MAY 2022 ===============
            //----------------------------------------------
            
            
			$this->set([
            'success'   => $responseData['success'],
			'data'		=> $postData,
		        '_serialize' => ['success','data']
		    ]);
		}
	}

	public function lostPassword(){
	
	    $success = false;
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
                        break;
                    }
	            }
	        }        
	    }

		$this->set([
            'success'   => $success,
			'message'   => 'User Not Found',
		        '_serialize' => ['success','message']
		    ]);
	}
		
	private function _email_lost_password($username,$password){	
	    $from       = $this->MailTransport->setTransport(-1);           
        $success    = false;            
        if($from !== false){         
            $email = new Email(['transport'   => 'mail_rd']);
            $email->setFrom($from);
            $email->setSubject('Lost Password Retrieval');
            $email->setTo($this->request->getData('email'));
            $email->setViewVars(compact( 'username', 'password'));
            $email->setTemplate('user_detail', 'user_notify');
            $email->setEmailFormat('html');
            $email->send();
            $success  = true;
        }	
	    return $success;   
	}

	private function _email_user_detail($username,$password){
        $from       = $this->MailTransport->setTransport(-1);           
        $success    = false;            
        if($from !== false){       
		    $email = new Email(['transport'   => 'mail_rd']);
            $email->setFrom($from);
            $email->setSubject('New user registration');
            $email->setTo($this->request->getData('username'));
            $email->setViewVars(compact( 'username', 'password'));
            $email->setTemplate('user_detail', 'user_notify');
            $email->setEmailFormat('html');
            $email->send();
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

}
