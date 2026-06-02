<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 26/05/2026
 * Time: 00:00
 */
 

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class ClientsController extends AppController{
  
    protected $main_model   = 'Clients';
    
    public function initialize():void{ 
        parent::initialize();
        
        $this->loadModel('Clients'); 
        $this->loadModel('Aps');
        $this->loadModel('Nodes');
        $this->loadModel('PermanentUsers');       
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'Clients'
        ]);             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');    
    }
    
     //____ BASIC CRUD Manager ________
     
      public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
                
        $query 		= $this->{$this->main_model}->find();
		$cquery     = $this->request->getQuery();
        $limit  = 50;
        $page   = 1;
        $offset = 0;
        if(null !== $cquery['limit']){
            $limit  = $cquery['limit'];
            $page   = $cquery['page'];
            $offset = $cquery['start'];
        }
        
        $query->contain(
            [
                'Aps' => 'ApProfiles',
                'Nodes' => 'Meshes',
                'PermanentUsers'
            ]
        );
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){ 
            unset($i->password);               
            $i->created_in_words    = $this->TimeCalculations->time_elapsed_string($i->created);
            $i->modified_in_words   = $this->TimeCalculations->time_elapsed_string($i->modified);                    
            $i->update = true;
            $i->delete = true;
            array_push($items,$i);      
        }
              
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
        ]);
        $this->viewBuilder()->setOption('serialize', true);        
    }
      
    public function add(){ 
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
             
        $cdata  = $this->request->getData(); 
        
        $check_items = [
			'active'
		];
        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }    
                      
        //Zero the token to generate a new one for this user:
        $cdata['token'] = '';
             
        $entity = $this->{$this->main_model}->newEntity($cdata);
        
        if($this->{$this->main_model}->save($entity)){     
             $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);        
                 
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($entity,$message);        
        }        
    }
    
    public function edit(){  
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->_edit($user);      
    }
    
    private function _edit($user) {
        
        $cdata = $this->request->getData();
        
        $check_items = [
			'active'
		];
        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }    
        
        $entity = $this->{$this->main_model}->get($cdata['id']);                 
        $this->{$this->main_model}->patchEntity($entity, $cdata);   
              
        if ($this->{$this->main_model}->save($entity)) {            
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
	}
	
    public function delete(){
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id   = $user['id'];
        $fail_flag = false;
        
        $req_d		= $this->request->getData();
        $ap_flag 	= true;		
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}

	    if(isset($req_d['id'])){
            $entity     = $this->{$this->main_model}->get($req_d['id']);         
            if(($entity->cloud_id == -1)&&($ap_flag == true)){
	    		$this->set([
					'message' 	=> 'Not enough rights for action',
					'success'	=> false
				]);
				$this->viewBuilder()->setOption('serialize', true);
				return;
	    	} 
            $this->{$this->main_model}->delete($entity);
  
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){           
                $entity     = $this->{$this->main_model}->get($d['id']);
                if(($entity->cloud_id == -1)&&($ap_flag == true)){
					$this->set([
							'message' 	=> 'Not enough rights for action',
							'success'	=> false
						]);
					$this->viewBuilder()->setOption('serialize', true);	
					return;
				}      
                $this->{$this->main_model}->delete($entity); 
            }
        }

        if($fail_flag == true){
            $this->set(array(
                'success'   => false,
                'message'   => array('message' => __('Could not delete some items')),
                '_serialize' => array('success','message')
            ));
        }else{
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }
	}
	
	public function changePassword(){
	
		if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }

        $success 	= false;
        $req_d		= $this->request->getData();
        if(isset($req_d['id'])){
            $entity = $this->{$this->main_model}->get($req_d['id']); 
            $data = [
                'password'  => $req_d['password'],
                'token'     => ''
            ];
            $this->{$this->main_model}->patchEntity($entity, $data);
            $this->{$this->main_model}->save($entity);
            $success               = true;  
        }

        $this->set([
            'success' => $success
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
    public function clientAps(){
    
        $cquery   = $this->request->getQuery();
        
        $aps = $this->Aps->find()
            ->where([
                'ApProfiles.cloud_id' => $cquery['cloud_id'],
                'OR' => [
                    'Aps.client_id IS NULL',
                    'Aps.client_id' => $cquery['client_id']
                ]
            ])
            ->contain(['ApProfiles'])
            ->select(['Aps.id', 'Aps.name'])
            ->all();
    
        $this->set([
            'items' => $aps,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
    
    public function clientApsView(){
    
        $data = [];
        
        $cquery   = $this->request->getQuery();
        
        $aps = $this->Aps->find()
            ->where([
                'ApProfiles.cloud_id'   => $cquery['cloud_id'],
                'Aps.client_id'         => $cquery['id']
            ])
            ->contain(['ApProfiles'])
            ->select(['Aps.id', 'Aps.name'])
            ->all();
       
        $ap_list=[];
        foreach($aps as $ap){
            $ap_list[] = $ap->id;
        }
        
        $data['aps[]']  = $ap_list;
        $data['id']     = $cquery['id'];
    
        $this->set([
            'data' => $data,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    
    }
    
     public function clientApsEdit(){
    
        $req_d = $this->request->getData();
        
        //-- Clear old ones first --
        $aps = $this->Aps->find()
            ->where([
                'ApProfiles.cloud_id'  => $req_d['cloud_id'],
                'Aps.client_id'        => $req_d['id']
            ])
            ->contain(['ApProfiles'])
            ->select(['Aps.id', 'Aps.name'])
            ->all();
        
        foreach($aps as $ap){
            $ap->set('client_id', null);
            $this->Aps->save($ap);
        }
        
        //--Assign the client_id
        foreach($req_d['aps'] as $ap_id){
            if($ap_id === 'Select APs'){
                continue;
            }
            $ap = $this->Aps->find()
                ->where([
                    'Aps.id'    => $ap_id
                ])
                ->first();
            if($ap){
                $ap->set('client_id', $req_d['id']);
                $this->Aps->save($ap);           
            }    
        }
            
        $this->set([
            'data'    => $req_d,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    
    }

    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons( false, 'basic');
        array_push($menu,[
            'xtype' => "buttongroup",
            'title' => null,
            'items' => [
                [
                    'xtype'     => "splitbutton",
                    'glyph'     => Configure::read('icnAttach'),
                    'scale'     => 'large',
                    'itemId'    => 'attach',
                    'tooltip'   => 'Attach',
                    'ui'        => 'button-blue',
                    'menu'      => [
                        'items' => [
                            [ 'text'  => __('AP'),              'itemId'    => 'ap',             'group' => 'attach', 'checked' => true ],
                            [ 'text'  => __('Mesh Node'),       'itemId'    => 'node',           'group' => 'attach', 'checked' => false],
                            [ 'text'  => __('Permanent User'),  'itemId'    => 'permanent_user', 'group' => 'attach', 'checked' => false ]
                        ]
                    ]
                ],
                [
                    'xtype'     => 'button',
                    'glyph'     => Configure::read('icnLock'),
                    'scale'     => 'large',
                    'itemId'    => 'password',
                    'tooltip'   => 'Change Password',               
                ]        
            ]
        ]);
         
         
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
      
}
