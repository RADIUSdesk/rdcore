<?php
/**
 * Created by PhpStorm.
 * User: stevenkusters
 * Date: 18/01/2017
 * Time: 15:00
 */

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Event\Event;
use Cake\Utility\Inflector;


class ProfilesController extends AppController
{
    public $base = "Access Providers/Controllers/Profiles/";
    protected $owner_tree = array();
    protected $main_model = 'Profiles';
    protected $profCompPrefix = 'SimpleAdd_';

    public function initialize()
    {
        parent::initialize();

        $this->loadModel('Profiles');
        $this->loadModel('Users');
        $this->loadModel('Groups');
        
        $this->loadModel('ProfileComponents');
        $this->loadModel('Radusergroups');
        
        $this->loadModel('Radgroupchecks');
        $this->loadModel('Radgroupreplies');
        
        $this->loadModel('PermanentUsers');
        $this->loadModel('Vouchers');
        $this->loadModel('Devices');
        $this->loadModel('Radchecks');
        
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'Profiles'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('Notes', [
            'model' => 'ProfileNotes',
            'condition' => 'profile_id'
        ]);
        
              
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');  
    }

    public function indexAp(){
    
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        if (isset($this->request->query['ap_id'])) {
            $ap_id = $this->request->query['ap_id'];  
            if($ap_id !== '0'){       
                //Now we have to make the ap_id the 'user'
                $q_ap = $this->Users->find()->where(['Users.id' => $ap_id])->contain(['Groups'])->first();
                $ap_user                = [];
                $ap_user['id']          = $q_ap->id;
                $ap_user['group_name']  = $q_ap->group->name;
                $ap_user['group_id']    = $q_ap->group->id;
                //Override the user
                $user = $ap_user;
            }  
        }
        
        $query      = $this->{$this->main_model}->find();
        $this->CommonQuery->build_common_query($query, $user, ['Radusergroups'=> ['Radgroupchecks']]);
        $q_r        = $query->all();
        
        $items      = array();
        
        foreach($q_r as $i){    
            $data_cap_in_profile    = false; 
            $time_cap_in_profile    = false;   
            $id                     = $i->id;
            $name                   = $i->name;
            $data_cap_in_profile    = false; 
            $time_cap_in_profile    = false; 

            foreach ($i->radusergroups as $cmp){
                foreach ($cmp->radgroupchecks as $radgroupcheck) {
                    if($radgroupcheck->attribute == 'Rd-Reset-Type-Data'){
                        $data_cap_in_profile = true;
                    }
                    if($radgroupcheck->attribute == 'Rd-Reset-Type-Time'){
                        $time_cap_in_profile = true;
                    }              
                }
            }
            array_push($items,
                        array(
                            'id'                    => $id, 
                            'name'                  => $name,
                            'data_cap_in_profile'   => $data_cap_in_profile,
                            'time_cap_in_profile'   => $time_cap_in_profile
                        )
                    );
        } 
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));

    }

    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query, $user, ['Users', 'ProfileNotes' => ['Notes'],'Radusergroups'=> ['Radgroupchecks']]); //AP QUERY is sort of different in a way

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($this->request->query['limit'])) {
            $limit = $this->request->query['limit'];
            $page = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items = array();

        foreach ($q_r as $i) {

            $owner_id = $i->user_id;
            if (!array_key_exists($owner_id, $this->owner_tree)) {
                $owner_tree = $this->Users->find_parents($owner_id);
            } else {
                $owner_tree = $this->owner_tree[$owner_id];
            }

            //Add the components (already from the highest priority
            $components = [];
            $data_cap_in_profile = false; // A flag that will be set if the profile contains a component with Rd-Reset-Type-Data group check attribute.
            $time_cap_in_profile = false; // A flag that will be set if the profile contains a component with Rd-Reset-Type-Time group check attribute.

            foreach ($i->radusergroups as $cmp){
                foreach ($cmp->radgroupchecks as $radgroupcheck) {
                    if($radgroupcheck->attribute == 'Rd-Reset-Type-Data'){
                        $data_cap_in_profile = true;
                    }
                    if($radgroupcheck->attribute == 'Rd-Reset-Type-Time'){
                        $time_cap_in_profile = true;
                    }              
                }
                $a = $cmp->toArray();
                unset($a['radgroupchecks']);
                array_push($components,$a);     
            }
            
            $action_flags = $this->Aa->get_action_flags($owner_id, $user);
            $notes_flag = false;
            foreach ($i->profile_notes as $un) {
                if (!$this->Aa->test_for_private_parent($un->note, $user)) {
                    $notes_flag = true;
                    break;
                }
            }
            
            array_push($items, array(
                'id'                    => $i->id,
                'name'                  => $i->name,
                'owner'                 => $owner_tree,
                'available_to_siblings' => $i->available_to_siblings,
                'profile_components'    => $components,
                'data_cap_in_profile'   => $data_cap_in_profile,
                'time_cap_in_profile'   => $time_cap_in_profile,
                'notes'                 => $notes_flag,
                'update'                => $action_flags['update'],
                'delete'                => $action_flags['delete']
            ));
        }

        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items', 'success', 'totalCount')
        ));
    }

    public function add(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];

        // get creators id
        if(isset($this->request->data['user_id'])){
            if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
                $this->request->data['user_id'] = $user_id;
            }
        } 
        $check_items = array(
			'available_to_siblings'
		);
		
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
        

        $entity = $this->{$this->main_model}->newEntity($this->request->data());
        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
        
            $errors = $entity->errors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }
            
            $this->set(array(
                'errors'    => $a,
                'success'   => false,
                'message'   => array('message' => __('Could not create item')),
                '_serialize' => array('errors','success','message')
            ));
            
        }
    }

    public function manageComponents(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $rb         = $this->request->data['rb']; 

        if(($rb == 'add')||($rb == 'remove')){
            $component_id   = $this->request->data['component_id'];
            $entity         = $this->ProfileComponents->get($this->request->data['component_id']);  
            $component_name = $entity->name;
        }
        
        foreach(array_keys($this->request->data) as $key){
            if(preg_match('/^\d+/',$key)){

                if($rb == 'sub'){
                    $entity = $this->{$this->main_model}->get($key);
                    $entity->set('available_to_siblings', 1);
                    $this->{$this->main_model}->save($entity);
                }

                if($rb == 'no_sub'){
                    $entity = $this->{$this->main_model}->get($key);
                    $entity->set('available_to_siblings', 0);
                    $this->{$this->main_model}->save($entity);
                }

                if($rb == 'remove'){
                    $entity         = $this->{$this->main_model}->get($key);
                    $profile_name   = $entity->name;
                    $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name,'Radusergroups.groupname' => $component_name]);
                }
               
                if($rb == 'add'){
                    $entity         = $this->{$this->main_model}->get($key);
                    $profile_name   = $entity->name;
                    
                    $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name,'Radusergroups.groupname' => $component_name]);
                    
                    $priority = $this->request->data['priority'];
                    $ne = $this->Radusergroups->newEntity(
                        [
                            'username'  => $profile_name,
                            'groupname' => $component_name,
                            'priority'  => $priority
                        ]
                    );
                    $this->Radusergroups->save($ne);
                }
                
            }
        }

        $this->set(array(
            'success'       => true,
            '_serialize'    => array('success')
        ));
       
	}
	  
    public function delete($id = null) {
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

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity         = $this->{$this->main_model}->get($this->request->data['id']);
            $profile_name   = $entity->name;   
            $owner_id       = $entity->user_id;
            
            if($owner_id != $user_id){
                if($this->Users->is_sibling_of($user_id,$owner_id)== true){
                    $this->{$this->main_model}->delete($entity);
                    $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name]);
                }else{
                    $fail_flag = true;
                }
            }else{
                $this->{$this->main_model}->delete($entity);
                $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name]);
            }
            
            //There might be an associated ProfileComponent also (if we used the simplified profiles)
            $simple_pc_name = $this->profCompPrefix.$this->request->data['id'];
            $this->{'ProfileComponents'}->deleteAll(['ProfileComponents.name' =>$simple_pc_name]);
            $this->_removeRadius($simple_pc_name); 
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity         = $this->{$this->main_model}->get($d['id']);
                $profile_name   = $entity->name;
                $profile_id     = $entity->id;   
                $owner_id       = $entity->user_id;
                
                if($owner_id != $user_id){
                    if($this->Users->is_sibling_of($user_id,$owner_id) == true){
                        $this->{$this->main_model}->delete($entity);
                        $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name]);
                        //There might be an associated ProfileComponent also (if we used the simplified profiles)
                        $simple_pc_name = $this->profCompPrefix.$profile_id;
                        $this->{'ProfileComponents'}->deleteAll(['ProfileComponents.name' =>$simple_pc_name]);
                        $this->_removeRadius($simple_pc_name); 
                    }else{
                        $fail_flag = true;
                    }
                }else{
                    $this->{$this->main_model}->delete($entity);
                    $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name]);
                    //There might be an associated ProfileComponent also (if we used the simplified profiles)
                    $simple_pc_name = $this->profCompPrefix.$profile_id;
                    $this->{'ProfileComponents'}->deleteAll(['ProfileComponents.name' =>$simple_pc_name]);
                    $this->_removeRadius($simple_pc_name);                   
                }
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
	
	public function simpleAdd(){
	
	    if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $user_id    = $user['id'];

        //Get the creator's id
        if(isset($this->request->data['user_id'])){
            if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
                $this->request->data['user_id'] = $user_id;
            }
        }

        $check_items = [
			'available_to_siblings',
			'data_limit_mac',
			'time_limit_mac'	
		];
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
        
        $t_f_settings = [
            'speed_limit_enabled',
            'time_limit_enabled',
            'data_limit_enabled',
            'session_limit_enabled',
            'adv_data_limit_enabled',
            'adv_time_limit_enabled'
        ];
        
        foreach($t_f_settings as $i){
            if($this->request->data[$i] === 'true'){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
       
        $entity = $this->{$this->main_model}->newEntity($this->request->data());
        
        if ($this->{$this->main_model}->save($entity)) {
        
            //Also add a profile component (Our Convention will have it contain 'SimpleAdd_'+<profile_ID>)
            $pc_name    = $this->profCompPrefix.$entity->id;
            $e_pc       = $this->{'ProfileComponents'}->newEntity(['name' => $pc_name,'user_id' => $entity->user_id,'available_to_siblings' => 0]);
            $this->{'ProfileComponents'}->save($e_pc);
            //Now attach this to the Profile
            $ne = $this->{'Radusergroups'}->newEntity(
                [
                    'username'  => $entity->name,
                    'groupname' => $e_pc->name,
                    'priority'  => 5
                ]
            );
            $this->{'Radusergroups'}->save($ne);
            
            $this->_doRadius($e_pc->name);
                       
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }    
	}
	
	public function simpleEdit(){
	
	    if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        
        //Get the creator's id
        if(isset($this->request->data['user_id'])){
            if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
                $this->request->data['user_id'] = $user_id;
            }
        }

        $check_items = array(
			'available_to_siblings',
			'data_limit_mac',
			'time_limit_mac'	
		);
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
        
        $t_f_settings = [
            'speed_limit_enabled',
            'time_limit_enabled',
            'data_limit_enabled',
            'session_limit_enabled',
            'adv_data_limit_enabled',
            'adv_time_limit_enabled',
        ];
        
        foreach($t_f_settings as $i){
            if($this->request->data[$i] === 'true'){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
        
        $entity = $this->{$this->main_model}->get($this->request->data['id']);     
        
        $pc_name    = $this->profCompPrefix.$entity->id;
        
        if($this->request->data['name'] !== $entity->name){
            
            $this->{'Radusergroups'}->deleteAll(['Radusergroups.groupname' =>$pc_name]);
            $ne = $this->{'Radusergroups'}->newEntity(
                [
                    'username'  => $this->request->data['name'],
                    'groupname' => $pc_name,
                    'priority'  => 5
                ]
            );
            $this->{'Radusergroups'}->save($ne);
            
            //== HEADS UP ==
            //==UPDATE ALL THE Permanet users
            $this->{'PermanentUsers'}->updateAll(
                [  
                    'profile'       => $this->request->data['name']
                ],
                [  
                    'profile'       => $entity->name,
                    'profile_id'    => $this->request->data['id']
                ]
            );   
            $this->{'Vouchers'}->updateAll(
                [  
                    'profile'       => $this->request->data['name']
                ],
                [  
                    'profile'       => $entity->name,
                    'profile_id'    => $this->request->data['id']
                ]
            ); 
            
            $this->{'Devices'}->updateAll(
                [  
                    'profile'       => $this->request->data['name']
                ],
                [  
                    'profile'       => $entity->name,
                    'profile_id'    => $this->request->data['id']
                ]
            );
            
            $this->{'Radchecks'}->updateAll(
                [  
                    'value'       => $this->request->data['name']
                ],
                [  
                    'attribute'     => 'User-Profile',
                    'value'         => $entity->name
                ]
            );     
        }
        
        //Small fix (wizard had this bit missing)
        $count_ug = $this->{'Radusergroups'}->find()->where(['Radusergroups.groupname' =>$pc_name])->count();
        if($count_ug == 0){
            $ne = $this->{'Radusergroups'}->newEntity(
                [
                    'username'  => $this->request->data['name'],
                    'groupname' => $pc_name,
                    'priority'  => 5
                ]
            );
            $this->{'Radusergroups'}->save($ne);    
        }
        
          
        $this->{$this->main_model}->patchEntity($entity, $this->request->data());      
        if ($this->{$this->main_model}->save($entity)) {
            $this->_doRadius($pc_name);     
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
	}
	
	public function simpleView(){
	
	    //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        //Turn everything off by default
        $data = [
            'speed_limit_enabled'   => false,
            'time_limit_enabled'    => false,
            'data_limit_enabled'    => false,
            'session_limit_enabled' => false,
            'adv_data_limit_enabled'=> false,
            'adv_time_limit_enabled'=> false,
        ];
        
        if(isset($this->request->query['profile_id'])){
            $profile_id = $this->request->query['profile_id'];
            
            $ent = $this->{$this->main_model}->find()
                ->contain(['Users'=> ['fields' => ['Users.username']]])
                ->where(['Profiles.id' => $profile_id])
                ->first();
            if($ent){ 
                $pc_name        = $this->profCompPrefix.$ent->id;
                $data           = $this->_getRadius($pc_name);
                             
                $data['id']     = $ent->id;
                $data['name']   = $ent->name;
                $data['available_to_siblings'] = $ent->available_to_siblings;
                $data['user_id']= $ent->user_id;
                if($ent->user !== null){
                    $data['username'] = "<div class=\"fieldBlue\"> <b>".$ent->user->username."</b></div>";
                }else{
                    $data['username'] = "<div class=\"fieldRed\"><i class='fa fa-exclamation'></i> <b>(ORPHANED)</b></div>";
                }                
            }    
        } 
	
	    $this->set(array(
            'success' => true,
            'data' => $data,
            '_serialize' => array('success','data')
        ));
	}
	

    public function noteIndex()
    {
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $items = $this->Notes->index($user);
    }

    public function noteAdd()
    {
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $this->Notes->add($user);
    }

    public function noteDel()
    {
        if (!$this->request->is('post')) {
            throw new MethodNotAllowedException();
        }
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $this->Notes->del($user);
    }

    public function menuForGrid()
    {
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'profiles'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
    private function _doRadius($groupname){
    
        //Clear any posible left-overs
        $this->{'Radgroupchecks'}->deleteAll(['groupname' => $groupname]);
        $this->{'Radgroupreplies'}->deleteAll(['groupname' => $groupname]);
        
        if($this->request->data['data_limit_enabled']){
         
            //Reset
            $data_reset = $this->request->data['data_reset'];
            $data_top_up    = false;
            if($data_reset == 'top_up'){
                $data_reset = 'never';
                $data_top_up    = true;
            }
            
            //Data Cap Type
            $data_cap       = 'hard';
            if($this->request->getData('data_cap')){
                $data_cap = $this->request->getData('data_cap');
            }
            
            $d_reset = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Reset-Type-Data',
                'op'        => ':=',
                'value'     => $data_reset,
                'comment'   => 'SimpleProfile'
            ];
            $e_data_reset = $this->{'Radgroupchecks'}->newEntity($d_reset);
            $this->{'Radgroupchecks'}->save($e_data_reset);
            
            if($data_top_up == false){
                //Data Amount
                $data_amount    = $this->request->data['data_amount'];
                $data_unit      = $this->request->data['data_unit'];
                $data           = $data_amount * 1024 * 1024; //(Mega by default)
                if($data_unit == 'gb'){
                    $data = $data * 1024; //Giga
                }
                $d_amount = [
                    'groupname' => $groupname,
                    'attribute' => 'Rd-Total-Data',
                    'op'        => ':=',
                    'value'     => $data,
                    'comment'   => 'SimpleProfile'
                ];
                $e_data_amount = $this->{'Radgroupchecks'}->newEntity($d_amount);
                $this->{'Radgroupchecks'}->save($e_data_amount);
            }
            
            //Data Cap Type
            $d_cap = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Cap-Type-Data',
                'op'        => ':=',
                'value'     => $data_cap,
                'comment'   => 'SimpleProfile'
            ];
            $e_data_cap = $this->{'Radgroupchecks'}->newEntity($d_cap);
            $this->{'Radgroupchecks'}->save($e_data_cap);
            
            if($this->request->data['data_limit_mac']){
                //Data Cap Type
                $d_mac = [
                    'groupname' => $groupname,
                    'attribute' => 'Rd-Mac-Counter-Data',
                    'op'        => ':=',
                    'value'     => '1',
                    'comment'   => 'SimpleProfile'
                ];
                $e_data_mac = $this->{'Radgroupchecks'}->newEntity($d_mac);
                $this->{'Radgroupchecks'}->save($e_data_mac);
            }  
        }
        
        if($this->request->data['time_limit_enabled']){
            
            //Reset
            $time_reset     = $this->request->data['time_reset'];
            $time_top_up    = false;
            if($time_reset == 'top_up'){
                $time_reset     = 'never';
                $time_top_up    = true;
            }
            
            //Time Cap Type
            $time_cap       = 'hard';
            if($this->request->getData('time_cap')){
                $time_cap = $this->request->getData('time_cap');
            }
               
            $t_reset = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Reset-Type-Time',
                'op'        => ':=',
                'value'     => $time_reset,
                'comment'   => 'SimpleProfile'
            ];
            $e_time_reset = $this->{'Radgroupchecks'}->newEntity($t_reset);
            $this->{'Radgroupchecks'}->save($e_time_reset);
            
            if($time_top_up == false){
                //Time Amount
                $time_amount    = $this->request->data['time_amount'];
                $time_unit      = $this->request->data['time_unit'];
                $time           = $time_amount * 60; //(Seconds by default)
                if($time_unit == 'hour'){
                    $time = $time * 60; //60 Minutes in an hour
                }
                if($time_unit == 'day'){
                    $time = $time * 60 * 24; //60 Minutes in an hour and 24 hours in a day
                }
                $t_amount = [
                    'groupname' => $groupname,
                    'attribute' => 'Rd-Total-Time',
                    'op'        => ':=',
                    'value'     => $time,
                    'comment'   => 'SimpleProfile'
                ];
                $e_time_amount = $this->{'Radgroupchecks'}->newEntity($t_amount);
                $this->{'Radgroupchecks'}->save($e_time_amount);
            }
            
            
            $t_cap = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Cap-Type-Time',
                'op'        => ':=',
                'value'     => $time_cap,
                'comment'   => 'SimpleProfile'
            ];
            $e_time_cap = $this->{'Radgroupchecks'}->newEntity($t_cap);
            $this->{'Radgroupchecks'}->save($e_time_cap);
            
            if($this->request->getData('time_limit_mac')){
                //Data Cap Type
                $t_mac = [
                    'groupname' => $groupname,
                    'attribute' => 'Rd-Mac-Counter-Time',
                    'op'        => ':=',
                    'value'     => '1',
                    'comment'   => 'SimpleProfile'
                ];
                $e_time_mac = $this->{'Radgroupchecks'}->newEntity($t_mac);
                $this->{'Radgroupchecks'}->save($e_time_mac);
            }  
        }
    
        if($this->request->data['speed_limit_enabled']){ //IF it is there    
            $speed_upload_amount    = $this->request->data['speed_upload_amount'];
            $speed_upload_unit      = $this->request->data['speed_upload_unit'];
            $speed_upload           = $speed_upload_amount * 1024; //Default is kbps
            if($speed_upload_unit == 'mbps'){
                $speed_upload = $speed_upload * 1024;   
            }
            
            $d_up = [
                'groupname' => $groupname,
                'attribute' => 'WISPr-Bandwidth-Max-Up',
                'op'        => ':=',
                'value'     => $speed_upload,
                'comment'   => 'SimpleProfile'
            ];
            
            $e_up = $this->{'Radgroupreplies'}->newEntity($d_up);
            $this->{'Radgroupreplies'}->save($e_up);
            
            $speed_download_amount  = $this->request->data['speed_download_amount'];
            $speed_download_unit    = $this->request->data['speed_download_unit'];
            $speed_download         = $speed_download_amount * 1024; //Default is kbps
            if($speed_download_unit == 'mbps'){
                $speed_download = $speed_download * 1024;   
            }
            
            $d_down = [
                'groupname' => $groupname,
                'attribute' => 'WISPr-Bandwidth-Max-Down',
                'op'        => ':=',
                'value'     => $speed_download,
                'comment'   => 'SimpleProfile'
            ];
            
            $e_down = $this->{'Radgroupreplies'}->newEntity($d_down);
            $this->{'Radgroupreplies'}->save($e_down);

        }
        
        //===LOGINTIME===
        //Test the three timeslots
        $logintime_string = '';
        for ($x = 1; $x <= 3; $x++) {
            $slot_span = $this->request->getData('logintime_'.$x.'_span');
            if($slot_span !== 'disabled'){
                $slot_start = str_replace(':','',$this->request->getData('logintime_'.$x.'_start'));
                $slot_end   = str_replace(':','',$this->request->getData('logintime_'.$x.'_end'));
                if(($slot_span == 'Al')||($slot_span == 'Wk')){
                    $logintime_string = $logintime_string.$slot_span.$slot_start.'-'.$slot_end.'|';  
                
                }else{
                    $dat = $this->request->getData();                   
                    $match_day_string   = 'logintime_'.$x.'_days_';
                    $day_string         = "";
                    foreach(array_keys($dat) as $d){
                        if(preg_match("/^$match_day_string/",  $d)){
                            $day = $dat[$d];
                            $day_string = $day_string.$day.",";
                        }                   
                    }                   
                    if($day_string !== ''){
                        $day_string = rtrim($day_string, ',');
                    }
                    $logintime_string = $logintime_string.$day_string.$slot_start.'-'.$slot_end.'|'; 
                }                          
            }
        }
        if($logintime_string !== ''){
            $logintime_string = rtrim($logintime_string, '|');
            $d_logintime = [
                'groupname' => $groupname,
                'attribute' => 'Login-Time',
                'op'        => ':=',
                'value'     => $logintime_string,
                'comment'   => 'SimpleProfile'
            ];
            $e_logintime = $this->{'Radgroupchecks'}->newEntity($d_logintime);
            $this->{'Radgroupchecks'}->save($e_logintime);        
        }
        //=== END LOGINTIME ===
                
        //===Session Limit===
        if($this->request->data['session_limit_enabled']){ //IF it is there 
            $session_limit = $this->request->data['session_limit'];
            $d_session = [
                'groupname' => $groupname,
                'attribute' => 'Simultaneous-Use',
                'op'        => ':=',
                'value'     => $session_limit,
                'comment'   => 'SimpleProfile'
            ];
            $e_session = $this->{'Radgroupchecks'}->newEntity($d_session);
            $this->{'Radgroupchecks'}->save($e_session);               
        }
        //===END Session Limit=== 
        
        //===Adv Data Limit=== (basic data limit should NOT be enabled if this one is on)
        if($this->request->data['adv_data_limit_enabled']){ //IF it is there
        
            //Data Amount
            $data_amount    = $this->request->data['adv_data_amount'];
            $data_unit      = $this->request->data['adv_data_unit'];
            $data           = $data_amount * 1024 * 1024; //(Mega by default)
            if($data_unit == 'gb'){
                $data = $data * 1024; //Giga
            }
            $d_amount = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Adv-Data',
                'op'        => ':=',
                'value'     => $data,
                'comment'   => 'SimpleProfile'
            ];
            $e_data_amount = $this->{'Radgroupchecks'}->newEntity($d_amount);
            $this->{'Radgroupchecks'}->save($e_data_amount);
                    
            $data_day_sessions =  $this->request->data['adv_data_per_day'];            
            $d_d_day = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Adv-Data-Per-Day',
                'op'        => ':=',
                'value'     => $data_day_sessions,
                'comment'   => 'SimpleProfile'
            ];
            $e_d_day = $this->{'Radgroupchecks'}->newEntity($d_d_day);
            $this->{'Radgroupchecks'}->save($e_d_day);
            
            $data_month_sessions =  $this->request->data['adv_data_per_month'];            
            $d_d_month = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Adv-Data-Per-Month',
                'op'        => ':=',
                'value'     => $data_month_sessions,
                'comment'   => 'SimpleProfile'
            ];
            $e_d_month = $this->{'Radgroupchecks'}->newEntity($d_d_month);
            $this->{'Radgroupchecks'}->save($e_d_month);  
        }
        
        //===Adv Time Limit=== (basic time limit should NOT be enabled if this one is on)
        if($this->request->data['adv_time_limit_enabled']){ //IF it is there
        
            //Time Amount
            $time_amount    = $this->request->data['adv_time_amount'];
            $time_unit      = $this->request->data['adv_time_unit'];
            $time           = $time_amount * 60; //(Seconds by default)
            if($time_unit == 'hour'){
                $time = $time * 60; //60 Minutes in an hour
            }
            $t_amount = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Adv-Time',
                'op'        => ':=',
                'value'     => $time,
                'comment'   => 'SimpleProfile'
            ];
            $e_time_amount = $this->{'Radgroupchecks'}->newEntity($t_amount);
            $this->{'Radgroupchecks'}->save($e_time_amount);       
        
            $time_day_sessions =  $this->request->data['adv_time_per_day'];            
            $d_t_day = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Adv-Time-Per-Day',
                'op'        => ':=',
                'value'     => $time_day_sessions,
                'comment'   => 'SimpleProfile'
            ];
            $e_t_day = $this->{'Radgroupchecks'}->newEntity($d_t_day);
            $this->{'Radgroupchecks'}->save($e_t_day);
            
            $time_month_sessions =  $this->request->data['adv_time_per_month'];            
            $d_t_month = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Adv-Time-Per-Month',
                'op'        => ':=',
                'value'     => $time_month_sessions,
                'comment'   => 'SimpleProfile'
            ];
            $e_t_month = $this->{'Radgroupchecks'}->newEntity($d_t_month);
            $this->{'Radgroupchecks'}->save($e_t_month);        
        }
        
        //Fall Through      
        $d_fall_through = [
            'groupname' => $groupname,
            'attribute' => 'Fall-Through',
            'op'        => ':=',
            'value'     => 'Yes',
            'comment'   => 'SimpleProfile'        
        ];
        $e_ff = $this->{'Radgroupreplies'}->newEntity($d_fall_through );
        $this->{'Radgroupreplies'}->save($e_ff );       
    }
    
    private function _getRadius($groupname){
    
        $e_list = $this->{'Radgroupreplies'}->find()->where(['Radgroupreplies.groupname' => $groupname])->all();
        
        $data = [
            'speed_limit_enabled'   => false,
            'time_limit_enabled'    => false,
            'data_limit_enabled'    => false,
            'session_limit_enabled' => false,
            'adv_data_limit_enabled'=> false,
            'adv_time_limit_enabled'=> false,
            'logintime_1_span'      => 'disabled',
            'logintime_2_span'      => 'disabled',
            'logintime_3_span'      => 'disabled',
        ];
                   
        $bw_up_check    = false;
        $bw_down_check  = false;
           
        foreach($e_list as $e){
            if($e->attribute == 'WISPr-Bandwidth-Max-Up'){
                $bw_up_check = true;
                if(intval($e->value) >= 1048576){
                    $speed_upload_amount = $e->value / 1024 / 1024;
                    $speed_upload_unit   = 'mbps';
                }else{
                    $speed_upload_amount = $e->value / 1024;
                    $speed_upload_unit   = 'kbps';
                }
            }
            if($e->attribute == 'WISPr-Bandwidth-Max-Down'){
                $bw_down_check = true;
                if(intval($e->value) >= 1048576){
                    $speed_download_amount = $e->value / 1024 / 1024;
                    $speed_download_unit   = 'mbps';
                }else{
                    $speed_download_amount = $e->value / 1024;
                    $speed_download_unit   = 'kbps';
                }
            }   
        }
    
        if(($bw_up_check)&&($bw_down_check)){ 
            unset($data['speed_limit_enabled']);
            $data['speed_upload_amount']    = $speed_upload_amount;
            $data['speed_upload_unit']      = $speed_upload_unit;
            $data['speed_download_amount']  = $speed_download_amount;
            $data['speed_download_unit']    = $speed_download_unit;
        }
        
        //$login_time = 'Al0800-1600|Wk1301-1402|Mo,Sa,Su1500-2000';
        $login_time = '';
        
        $e_chk = $this->{'Radgroupchecks'}->find()->where(['Radgroupchecks.groupname' => $groupname])->all();
        foreach($e_chk as $e){       
            if($e->attribute == 'Rd-Reset-Type-Data'){
                unset($data['data_limit_enabled']);
                $data['data_reset'] = $e->value;  
            } 
            if($e->attribute == 'Rd-Cap-Type-Data'){
                $data['data_cap'] = $e->value;  
            }
            if($e->attribute == 'Rd-Mac-Counter-Data'){
                $data['data_limit_mac'] = true;  
            }
            if($e->attribute == 'Rd-Total-Data'){
                $d = $e->value;
                if(($d/1024) >= 1048576){
                    $data['data_amount'] = ($d/1048576)/1024;
                    $data['data_unit'] = 'gb';
                }else{
                    $data['data_amount'] = $d/1048576;
                    $data['data_unit'] = 'mb';
                }
            }            
            
            if($e->attribute == 'Rd-Reset-Type-Time'){
                unset($data['time_limit_enabled']);
                $data['time_reset'] = $e->value;  
            }           
            if($e->attribute == 'Rd-Cap-Type-Time'){
                $data['time_cap'] = $e->value;  
            }
            if($e->attribute == 'Rd-Mac-Counter-Time'){
                $data['time_limit_mac'] = true;  
            }
            
            if($e->attribute == 'Rd-Total-Time'){
                $t = $e->value;
                if(($t/24/60/60) > 1){
                    $data['time_amount'] = $t/24/60/60;
                    $data['time_unit'] = 'day';
                }elseif(($t/60/60) > 1){
                    $data['time_amount'] = $t/60/60;
                    $data['time_unit'] = 'hour';
                }else{
                    $data['time_amount'] = $t/60;
                    $data['time_unit'] = 'min';
                }
            }
            
            if($e->attribute == 'Login-Time'){
                $login_time = $e->value;
            }
            
            if($e->attribute == 'Simultaneous-Use'){
                unset($data['session_limit_enabled']);
                $data['session_limit'] = $e->value;  
            }                       
        }
        
        //Logintime  
        if($login_time){
            $pieces = preg_split("/,|\|/", $login_time);
            $days   = [];
            $count = 0;
            foreach($pieces as $i){
                $pattern = '/^(Wk|Mo|Tu|We|Th|Fr|Sa|Su|Any|Al)/';
                if(preg_match($pattern, $i,$matches_main)){
                    $j = $i;
                    if(preg_match('/^(Wk|Mo|Tu|We|Th|Fr|Sa|Su|Any|Al)([0-9]{4}-[0-9]{4})/',$j,$matches)){
                        $count++;
                        $span                       = $matches[2];
                        [$span_start,$span_end]     = explode("-",$span);
                        $span_start_hour            = substr($span_start, 0, 2);
                        $span_start_min             = substr($span_start, 2, 4);
                        $span_end_hour              = substr($span_end, 0, 2);
                        $span_end_min               = substr($span_end, 2, 4);
                        if($span_end_hour < $span_start_hour){
                            [$span_start_hour, $span_end_hour]  = [$span_end_hour, $span_start_hour]; #Swap them
                            [$span_start_min, $span_end_min]    = [$span_end_min, $span_start_min]; #Swap them   
                        }
                        array_push($days,$matches[1]);          
                        if(($matches[1] == 'Al')||($matches[1] == 'Any')||($matches[1] == 'Wk')){
                            $data['logintime_'.$count.'_span'] = $matches[1];
                        }else{
                            $data['logintime_'.$count.'_span']  = 'specific';
                            foreach($days as $j){
                                $data['logintime_'.$count.'_days_'.$j]  = $j;
                            }                          
                        }
                        $data['logintime_'.$count.'_start'] =  $span_start_hour.":".$span_start_min;
                        $data['logintime_'.$count.'_end']   =  $span_end_hour.":".$span_end_min;
                        
                        $days = [];          
                    }else{
                        array_push($days,$matches_main[1]);        
                    }   
                }
            }
            
        }
             
        if((!array_key_exists('data_amount',$data))&&(array_key_exists('data_reset',$data))){
            $data['data_reset'] = 'top_up';        
        }
        if((!array_key_exists('time_amount',$data))&&(array_key_exists('time_reset',$data))){
            $data['time_reset'] = 'top_up';        
        }                
        return $data;
    }
    
    private function _removeRadius($groupname){
        $this->{'Radgroupchecks'}->deleteAll(['groupname' => $groupname]);
        $this->{'Radgroupreplies'}->deleteAll(['groupname' => $groupname]);
    }
}
