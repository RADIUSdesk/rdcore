<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 01/07/2026
 * Time: 00:00
 */
 

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Auth\DefaultPasswordHasher;
use Cake\Http\Exception\UnauthorizedException;
use Cake\Utility\Text;


class RdClientsController extends AppController{
  
   
    public function initialize():void{ 
        parent::initialize();
        $this->loadModel('Clients'); 
        $this->loadComponent('Aa');            
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
        $this->Authentication->allowUnauthenticated([
            'authenticate',
            'checkToken', 
            'changePassword',
        ]);       
    }
    
    public function authenticate(){

        $this->request->allowMethod(['post']);
        $data   = $this->request->getData();             
        $client = $this->Clients->find()
            ->where(['username' => $data['username']])
            ->first();

        if ($client && (new DefaultPasswordHasher())->check($data['password'], $client->password)) {          
            $data = [
                'token' => $client->token,
                'user'  => [
                    'id'        => $client->id,
                    'username'  => $client->username
                ]
            ];
        
            $this->set([
                'data'          => $data,
                'success'       => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }else{
            //throw new UnauthorizedException('Invalid credentials');
            // Authentication failed
             $this->set([
                'errors'        => ['username' => __('Confirm this name'),'password'=> __('Type the password again')],
                'success'       => false,
                'message'       => __('Authentication failed'),
            ]);
            $this->viewBuilder()->setOption('serialize', true);   
        }
    }
    
    public function checkToken(){
    	
		$q_data = $this->request->getQuery();

        if((isset($q_data['token']))&&($q_data['token'] != '')){
        
            $token  = $q_data['token'];           
            $client = $this->Clients->find()->where(['Clients.token' => $token])->first();          
            if(!$client){
                $this->set([
                    'errors'    => ['token'=>'invalid'],
                    'success'   => false
                ]);
                $this->viewBuilder()->setOption('serialize', true);            
            }else{
                $data = [
                    'token' => $client->token,
                    'user'  => [
                        'id'        => $client->id,
                        'username'  => $client->username,
                    ]
                ];                             
                $this->set([
                    'data'      => $data,
                    'success'   => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            }
                     
        }else{

            $this->set([
                'errors'        => ['token'=>'missing'],
                'success'       => false
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }      
    }
    
     public function changePassword(){
        
        $this->request->allowMethod(['post']);
        $data = $this->request->getData();
        $client = $this->Clients->find()
            ->where(['token' => $data['token']])
            ->first();     
        $client->set('password',$this->request->getData('password'));
        $client->set('token',''); //Setting it ti '' will trigger a new token generation
        $this->Clients->save($client); 
        $data['token']  = $client->get('token');        
        $this->set([
            'success' => true,
            'data'    => $data
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
}
