<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Network\Http\Client;

class RuckusProxyController extends AppController {

    private $Vendor             = 'ruckus';
    private $APIVersion         = '1.0';
    private $RequestCategory    = 'UserOnlineControl';
    private $protocol           = 'http';
    private $port               = 9080; //(For http it is 9080 and https it is 9443)
    private $error_check        = false;
    private $error_message      = '';
    private $northbound         = '';
    private $error_found        = false;
    private $api_url;
    private $nbiIP;
    private $client_mac;


    public function initialize()
    {
        parent::initialize();
        $this->nbiIP = $this->request->getQuery['nbiIP'];
        $this->client_mac = $this->request->getQuery['client_mac'];

        $this->api_url = $this->protocol.'://'. $this->nbiIP .':'. $this->port .'/portalintf';
    }

    /*
        Vendor: 'ruckus',
        RequestPassword: 'stayoutnow123!',
        APIVersion: '1.0',
        RequestCategory: 'UserOnlineControl',
        RequestType: 'Status',
        UE-MAC: 'ENC57a0d375604154793f3a60784be967037a8dbb9754dde0ab'
    */

	public function status(){
	
	    $this->_query_check();
	    if($this->error_found == true){
	        $this->set([
                'items'     => [],
                'success'   => false,
                'message'   => $this->error_message,
                '_serialize' => ['items','success','message']
            ]);
            return;
	    }
	    
	    $this->_get_nbi_password();
	    if($this->error_found == true){
	        $this->set([
                'items'     => [],
                'success'   => false,
                'message'   => $this->error_message,
                '_serialize' => ['items','success','message']
            ]);
            return;
	    }

        $data = [
            'Vendor'            => $this->Vendor,
            'RequestPassword'   => $this->northbound,
            'APIVersion'        => $this->APIVersion,
            'RequestCategory'   => $this->RequestCategory,
            'RequestType'       => 'Status',
            'UE-MAC'            => $this->client_mac
        ];

        $data       = json_encode($data);

        $results        = $this->_api_http_call($this->api_url, $data);

        $return_array   = (array) json_decode($results->body()); 

        $this->set([
            'data' => $return_array,
            'success' => true,
            '_serialize' => ['data','success']
        ]);
	}
	
	/*
        Vendor: 'ruckus',
        RequestPassword: 'stayoutnow123!',
        APIVersion: '1.0',
        RequestCategory: 'UserOnlineControl',
        RequestType: 'Logout',
        UE-MAC: 'ENC57a0d375604154793f3a60784be967037a8dbb9754dde0ab'	
	*/

	public function logout(){
	
	    $this->_query_check();
	    if($this->error_found == true){
	        $this->set([
                'items'     => [],
                'success'   => false,
                'message'   => $this->error_message,
                '_serialize' => ['items','success','message']
            ]);
            return;
	    }
	    
	    $this->_get_nbi_password();
	    if($this->error_found == true){
	        $this->set([
                'items'     => [],
                'success'   => false,
                'message'   => $this->error_message,
                '_serialize' => ['items','success','message']
            ]);
            return;
	    }

        $data = array(
            'Vendor'            => $this->Vendor,
            'RequestPassword'   => $this->northbound,
            'APIVersion'        => $this->APIVersion,
            'RequestCategory'   => $this->RequestCategory,
            'RequestType'       => 'Logout',
            'UE-MAC'            => $this->client_mac
        );
         
        $data       = json_encode($data); 

        $results = $this->_api_http_call($this->api_url, $data);

        $return_array   = (array) json_decode($results->body());

        $this->set([
            'data' => $return_array,
            'success' => true,
            '_serialize' => ['data','success']
        ]);
	}
	
	/*
        Vendor: 'ruckus',
        RequestPassword: 'stayoutnow123!',
        APIVersion: '1.0',
        RequestCategory: 'UserOnlineControl',
        RequestType: 'Login',
        UE-MAC: 'ENC57a0d375604154793f3a60784be967037a8dbb9754dde0ab',
        UE-Proxy: '0',
        UE-Username: 'dvdwalt',
        UE-Password: 'dvdwalt'
	*/

	public function login(){
	
	    $this->_query_check();
	    if($this->error_found == true){
	        $this->set([
                'items'     => [],
                'success'   => false,
                'message'   => $this->error_message,
                '_serialize' => ['items','success','message']
            ]);
            return;
	    }
	    
	    $this->_get_nbi_password();
	    if($this->error_found == true){
	        $this->set([
                'items'     => [],
                'success'   => false,
                'message'   => $this->error_message,
                '_serialize' => ['items','success','message']
            ]);
            return;
	    }

        if(
	     (! isset($this->request->getQuery['username'])) or
	     (! isset($this->request->getQuery['pwd']))
	     ){
                $this->error_message = "Username and / or Password missing";
                $this->set([
                    'items'     => array(),
                    'success'   => false,
                    'message'   => $this->error_message,
                    '_serialize' => array('items','success','message')
                ]);
                return;
	    }
	    
	    $username   = $this->request->getQuery['username'];
	    $pwd        = $this->request->getQuery['pwd'];

        $data = [
            'Vendor'            => $this->Vendor,
            'RequestPassword'   => $this->northbound,
            'APIVersion'        => $this->APIVersion,
            'RequestCategory'   => $this->RequestCategory,
            'RequestType'       => 'Login',
            'UE-MAC'            => $this->client_mac,
            'UE-Proxy'          => '0',
            'UE-Username'       => $username,
            'UE-Password'       => $pwd
        ];
         
        $data       = json_encode($data);
       
        $results = $this->_api_http_call($this->api_url, $data);

        $return_array   = (array) json_decode($results->body());

        $this->set([
            'data' => $return_array,
            'success' => true,
            '_serialize' => ['data','success']
        ]);
	}
	
	
	//_____________ PRIVATE FUNCTIONS________
	
	private function _query_check(){
	    //We need the following to be in the query string
	    if(
	     (! isset($this->request->getQuery['nbiIP'])) or
	     (! isset($this->request->getQuery['client_mac']))
	     ){
            $this->error_found     = true;
            $this->error_message   = "Missing items in query string";
	    }
	}
	
	private function _get_nbi_password(){
	    //Ruckus Northbound interface - Later we might add a field to the DynamicDetail entry for this
		Configure::load('DynamicLogin');
		if(Configure::read('DynamicLogin.ruckus.northbound.password')){
		    $this->northbound = Configure::read('DynamicLogin.ruckus.northbound.password');
		}else{	
		    $this->error_found     = true;
	        $this->error_message   = 'Northbound Portal Interface password not configured';
		}
	}

	private function _api_http_call($url, $data){
        $HttpSocket = new Client();

        $request    = [
            'header' => ['Content-Type' => 'application/json',
            ],
        ];

        return $HttpSocket->post($url, $data, $request);
    }
}
