<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 10/08/2021
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

class SchedulesController extends AppController {

    public $base            = "Access Providers/Controllers/Schedules/";
    protected $owner_tree   = [];
    protected $main_model   = 'Schedules';
    
    public function initialize(){
        parent::initialize();
        
        $this->loadModel($this->main_model);
        $this->loadModel('Users');
        $this->loadModel('ScheduleEntries');

        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'     => 'Schedules',
            'sort_by'   => 'Schedules.name'
        ]);
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');    
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
    }
    
    public function indexCombo(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query, $user, ['Users']); //AP QUERY is sort of different in a way

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($this->request->query['limit'])) {
            $limit  = $this->request->query['limit'];
            $page   = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();
        $q_r    = $query->all();
        $items  = [];

        foreach ($q_r as $i) {
	        array_push($items, ['id' => $i->id,'name' => $i->name]);        
        }

        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => ['items', 'success', 'totalCount']
        ]);
    }
    
    
    
    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query, $user, ['Users','ScheduleEntries']); //AP QUERY is sort of different in a way

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($this->request->query['limit'])) {
            $limit  = $this->request->query['limit'];
            $page   = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();
        $q_r    = $query->all();
        $items  = [];

        foreach ($q_r as $i) {

            $owner_id = $i->user_id;
            if (!array_key_exists($owner_id, $this->owner_tree)) {
                $owner_tree = $this->Users->find_parents($owner_id);
            } else {
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags   = $this->Aa->get_action_flags($owner_id, $user);             
            $row            = [];
            $fields         = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            } 
                
            $row['owner']   = $owner_tree;
			$row['update']  = $action_flags['update'];
			$row['delete']  = $action_flags['delete']; 
			$row['id']      = $row['id'].'_0'; //Signifies empty
			$row['description'] = '';
			
			$columns = ['description','type', 'gpio_number', 'gpio_state','command', 'mo', 'tu','we','th','fr','sa','su','event_time'];					
			if(count($i->schedule_entries) > 0){
			    foreach($i->schedule_entries as $se){
			        $row['id']   = $i->id.'_'.$se->id;
			        foreach($columns as $c){
                        $row[$c] = $se->{$c};
                    }
			        array_push($items, $row);   
			    }
	        }else{
	            array_push($items, $row);
	        }          
        }

        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => ['items', 'success', 'totalCount']
        ]);
    }
    
    public function add(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user_id    = $user['id'];
    
        if ($this->request->is('post')) {
        
            if(isset($this->request->data['user_id'])){
                if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
                    $this->request->data['user_id'] = $user_id;
                }
            }   
            $check_items = [
			    'available_to_siblings'
		    ];
            foreach($check_items as $i){
                if(isset($this->request->data[$i])){
                    $this->request->data[$i] = 1;
                }else{
                    $this->request->data[$i] = 0;
                }
            }
            
            $entity = $this->{$this->main_model}->newEntity($this->request->data()); 
            if ($this->{$this->main_model}->save($entity)) {
                $this->set([
                    'success' => true,
                    '_serialize' => ['success']
                ]);
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

        $user_id   = $user['id'];
        $fail_flag = false;

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];
            $ids = explode("_", $this->request->data['id']);

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($ids[0]);   
            $owner_id   = $entity->user_id;
            
            if($owner_id != $user_id){
                if($this->Users->is_sibling_of($user_id,$owner_id)== true){
                    $this->{$this->main_model}->delete($entity);
                }else{
                    $fail_flag = true;
                }
            }else{
                $this->{$this->main_model}->delete($entity);
            }
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $ids        = explode("_", $d['id']);
                $entity     = $this->{$this->main_model}->get($ids[0]);  
                $owner_id   = $entity->user_id;
                if($owner_id != $user_id){
                    if($this->Users->is_sibling_of($user_id,$owner_id) == true){
                        $this->{$this->main_model}->delete($entity);
                    }else{
                        $fail_flag = true;
                    }
                }else{
                    $this->{$this->main_model}->delete($entity);
                }
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
	
    public function edit(){
	   
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id   = $user['id'];

        if ($this->request->is('post')) { 
            $req_d  = $this->request->getData();        
            $check_items = [
			    'available_to_siblings'
		    ];
            foreach($check_items as $i){
                if(isset($req_d[$i])){
                    $req_d[$i] = 1;
                }else{
                    $req_d[$i] = 0;
                }
            }
            $ids            = explode("_", $this->request->getData('id'));  
            $req_d['id']    = $ids[0];
            $entity         = $this->{$this->main_model}->find()->where(['id' => $req_d['id']])->first();
            
            if($entity){
                $this->{$this->main_model}->patchEntity($entity, $req_d); 
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
        }
    }
    
    public function addScheduleEntry(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user_id    = $user['id'];
    
        if ($this->request->is('post')) {
        
            $req_data = $this->request->getData();
        
            $check_items = [
			    'mo', 'tu', 'we', 'th','fr','sa','su'
		    ];
            foreach($check_items as $i){
                if(isset($req_data[$i])){
                    $req_data[$i] = 1;
                }else{
                    $req_data[$i] = 0;
                }
            }
            
            $entity = $this->{'ScheduleEntries'}->newEntity($req_data); 
            if ($this->{'ScheduleEntries'}->save($entity)) {
                $this->set([
                    'success' => true,
                    '_serialize' => ['success']
                ]);
            } else {
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($entity,$message);
            }    
        }
    }
    
    public function viewScheduleEntry(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user_id    = $user['id'];
        $id         = $this->request->query['schedule_entry_id'];  
        $data       = [];
        $entity     = $this->{'ScheduleEntries'}->find()->where(['ScheduleEntries.id' => $id])->contain(['PredefinedCommands'])->first();
        if($entity){
            $data       =  $entity->toArray();
            if($entity->predefined_command !== null){
                $data['predefined_command_name'] = $entity->predefined_command->name;
            }
        }
        $this->set([
            'data'      => $data,
            'success'   => true,
            '_serialize'=> ['success', 'data']
        ]);
    }
    
    public function editScheduleEntry(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user_id    = $user['id'];
    
        if ($this->request->is('post')) {
        
            $req_data = $this->request->getData();   
            $check_items = [
			    'mo', 'tu', 'we', 'th','fr','sa','su'
		    ];
            foreach($check_items as $i){
                if(isset($req_data[$i])){
                    $req_data[$i] = 1;
                }else{
                    $req_data[$i] = 0;
                }
            }
            $id = $req_data['schedule_entry_id'];
            
            $entity = $this->{'ScheduleEntries'}->find()->where(['ScheduleEntries.id' => $id])->first();
            if($entity){
                $this->{'ScheduleEntries'}->patchEntity($entity, $req_data);  
                if ($this->{'ScheduleEntries'}->save($entity)) {
                    $this->set([
                        'success' => true,
                        '_serialize' => ['success']
                    ]);
                } else {
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }    
        }
    }
    
    public function deleteScheduleEntry() {
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

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];
            $ids = explode("_", $this->request->data['id']);
            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{'ScheduleEntries'}->get($ids[1]);   
            $this->{'ScheduleEntries'}->delete($entity);
             
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $ids        = explode("_", $d['id']);
                $entity     = $this->{'ScheduleEntries'}->get($ids[1]);     
                $this->{'ScheduleEntries'}->delete($entity);                
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
	
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtons->returnButtons($user,false,'Schedules');
        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }
    
}
