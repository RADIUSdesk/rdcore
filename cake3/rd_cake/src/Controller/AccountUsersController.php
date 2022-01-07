<?php

namespace App\Controller;

use Cake\Core\Configure;
use MethodNotAllowedException;

class AccountUsersController extends AppController {

    public $main_model  = 'AccountUsers';
    public $base     = "Access Providers/Controllers/AccountUsers/";

//------------------------------------------------------------------------

    public function initialize(){
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadComponent('JsonErrors');
    }
    
    public function authenticate(){
    
        $this->loadComponent('Auth', [
            'authenticate' => [
                'Form' => [
                    'userModel' => 'AccountUsers',
                    'fields' => ['username' => 'username', 'password' => 'password'],
                ]
            ]
        ]);
    
        if ($this->request->is('post')) {
            $user = $this->Auth->identify();
            if ($user){
                //We can get the detail for the user
                $u = $this->Users->find()->contain(['Groups'])->where(['Users.id' => $user['id']])->first();
               
                //Check for auto-compact setting
                $auto_compact = false;
                if(isset($this->request->data['auto_compact'])){
                    if($this->request->data['auto_compact']=='true'){ //Carefull with the query's true and false it is actually a string
                        $auto_compact = true;
                    }
                }
                
                $data = [];
                   
                //$data = $this->_get_user_detail($u,$auto_compact);
                          
                $this->set(array(
                    'data'          => $data,
                    'success'       => true,
                    '_serialize' => array('data','success')
                ));
                
            }else{
                        
                $this->set(array(
                    'errors'        => array('username' => __('Confirm this name'),'password'=> __('Type the password again')),
                    'success'       => false,
                    'message'       => __('Authentication failed'),
                    '_serialize' => array('errors','success','message')
                ));
                
            }
        }
    }

    //____ BASIC CRUD Actions Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];

        $query  = $this->{$this->main_model}->find();

        $this->_build_common_query($query, $user);

        if(null !== $this->request->getQuery('nas_id')){
            $query->where(["Actions.na_id" => $this->request->getQuery('nas_id')]);
        }

        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        if(null !== $this->request->getQuery('limit')){
            $limit  = $this->request->getQuery('limit');
            $page   = $this->request->getQuery('page');
            $offset = $this->request->getQuery('start');
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items  = [];

        //If there are more than one
        if($q_r){
            foreach($q_r as $item){          
                array_push($items, [
                    'id'        =>  $item->id,
                    'action'    =>  $item->action,
                    'command'   =>  $item->command,
                    'status'    =>  $item->status,
                    'created'   =>  $item->created,
                    'modified'  =>  $item->modified,
                ]);
            }
        }
        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
    }

    public function add() {

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $actionEntity = $this->{$this->main_model}->newEntity($this->request->getData());
        
        if ($this->{$this->main_model}->save($actionEntity)) {
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        } else {
            $message = 'Error';
            $this->set([
                'errors'    => $this->JsonErrors->entityErros($actionEntity, $message),
                'success'   => false,
                'message'   => ['message' => __('Could not create item')],
                '_serialize' => ['errors','success','message']
            ]);
        }
	}

   
    //FIXME check rights
    public function delete($id = null) {
		if (! $this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id = $user['id'];
        $fail_flag = false;

	    if(isset($this->data['id'])){   //Single item delete
            $message = "Single item ".$this->data['id'];
            $this->{$this->main_model}->query()->delete()->where(['id' => $this->data['id']])->execute();
            }else{                          //Assume multiple item delete
            foreach($this->data as $d){
                $this->{$this->main_model}->query()->delete()->where(['id' => $d['id']])->execute();
            }
        }

        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   => ['message' => __('Could not delete some items')],
                '_serialize' => ['success','message']
            ]);
        }else{
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }
	}
}
