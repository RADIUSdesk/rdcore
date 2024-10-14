<?php
/**
 * Created by G-edit.
 * User: Mbazooka 
 * Date: 03/Oct/2024
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

class MultiWanProfilesController extends AppController {

    protected $main_model   = 'MultiWanProfiles';
    
    public function initialize():void{
        parent::initialize();  
        $this->loadModel($this->main_model);
        $this->loadModel('Users');
	$this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
		    'model'     => 'MultiWanProfiles',
		    'sort_by'   => 'MultiWanProfiles.name'
		]);       
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');    
        $this->loadComponent('JsonErrors');
    }
    
    public function indexCombo(){
        // Authentication + Authorization
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

        $req_q      = $this->request->getQuery();
        $cloud_id   = $req_q['cloud_id'] ?? null;

        $query      = $this->{$this->main_model}->find();
        $this->CommonQueryFlat->cloud_with_system($query, $cloud_id, []);


        $limit      = $req_q['limit'] ?? 50; // Default limit to 50 if not set
        $page       = $req_q['page'] ?? 1;
        $offset     = $req_q['start'] ?? 0;

        $query->page($page)
              ->limit($limit)
              ->offset($offset);

        $total      = $query->count();
        $items      = [];

        // Include all option if requested
        if (!empty($req_q['include_all_option'])) {
             if($req_q['include_all_option'] == true){
		    	$items[] = ['id' => 0, 'name' => '**All Multi-Wan Profiles**'];    
		    }         
        }

        // Fetch results and build items array
        foreach ($query->all() as $i) {
            $items[] = ['id' => $i->id, 'name' => $i->name];
        }

        // Final response
        $this->set([
            'items'      => $items,
            'success'    => true,
            'totalCount' => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
             
  	public function indexDataView(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,[]);
        

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($req_qy['limit'])) {
            $limit  = $req_q['limit'];
            $page   = $req_q['page'];
            $offset = $req_q['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();
        $q_r    = $query->all();
        $items  = [];

        foreach ($q_r as $i) {		
			array_push($items, $i);
        }
        
        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function add(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
           
        if ($this->request->is('post')) {         
        	$req_d	  = $this->request->getData();       	        	      
        	if($this->request->getData('for_system')){
        		$req_d['cloud_id'] = -1;
		    }
		               
            $entity = $this->{$this->main_model}->newEntity($req_d); 
            if ($this->{$this->main_model}->save($entity)) {
                $this->set([
                    'success' => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            } else {
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($entity,$message);
            }    
        }
    }
    
    public function delete() {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $fail_flag 	= false;
        $req_d 		= $this->request->getData();
        $ap_flag 	= true;		
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}

	    if(isset($req_d['id'])){   //Single item delete
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
            $this->set([
                'success'   => false,
                'message'   => __('Could not delete some items'),
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }else{
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }
	}
    
    public function edit(){
	   
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $ap_flag 	= true;	
		if($user['group_name'] == Configure::read('group.admin')){
			$ap_flag = false; //clear if admin
		}
				   
        if ($this->request->is('post')) { 
            $req_d  = $this->request->getData();
                    
		    if($this->request->getData('for_system')){
        		$req_d['cloud_id'] = -1;
		    }
		    		    		    
            $ids            = explode("_", $this->request->getData('id'));  
            $req_d['id']    = $ids[0];
            $entity         = $this->{$this->main_model}->find()->where(['id' => $req_d['id']])->first();
            
            if($entity){
            
            	if($ap_flag && ($entity->cloud_id == -1)){
            		$this->JsonErrors->errorMessage('Not enough rights for action');
					return;          	
            	}
            	
                        
                $this->{$this->main_model}->patchEntity($entity, $req_d); 
                if ($this->{$this->main_model}->save($entity)) {
                    $this->set([
                        'success' => true
                    ]);
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($entity,$message);
                }   
            }
        }
    }
    	    	
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'basic');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }   
}
