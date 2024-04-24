<?php
/**
 * Edited by Gedit.
 * User: dirkvanderwalt
 * Date: 02/08/2022
 * Time: 15:00
 */

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Event\Event;
use Cake\Utility\Inflector;


class ProfilesController extends AppController
{
    public $base 			= "Access Providers/Controllers/Profiles/";
    protected $owner_tree 	= [];
    protected $main_model 	= 'Profiles';
    protected $profCompPrefix = 'SimpleAdd_';
    protected $profCompPrefixFup = 'FupAdd_';
    protected $reqData		= [];

    public function initialize():void{
        parent::initialize();

        $this->loadModel('Profiles');
        $this->loadModel('Users');
        $this->loadModel('Groups');
        
        $this->loadModel('ProfileComponents');
        $this->loadModel('ProfileFupComponents');
        $this->loadModel('Radusergroups');
        
        $this->loadModel('Radgroupchecks');
        $this->loadModel('Radgroupreplies');
        
        $this->loadModel('PermanentUsers');
        $this->loadModel('Vouchers');
        $this->loadModel('Devices');
        $this->loadModel('Radchecks');
        
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'Profiles'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');  
    }

    public function indexAp(){
    
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $req_q    = $this->request->getQuery(); //q_data is the query data      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,['Radusergroups'=> ['Radgroupchecks']]);
        $q_r        = $query->all();
        
        $items      = array();
        
        foreach($q_r as $i){    
            $data_cap_in_profile    = false; 
            $time_cap_in_profile    = false;   
            $id                     = $i->id;
            $name                   = $i->name;
            $data_cap_in_profile    = false; 
            $time_cap_in_profile    = false; 
            
            $for_system = false;
            if($i->cloud_id == -1){
            	$for_system = true;
            } 

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
                            'time_cap_in_profile'   => $time_cap_in_profile,
                            'for_system'			=> $for_system
                        )
                    );
        } 
        $this->set(array(
            'items' => $items,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);

    }

    public function index(){
    
    	$req_q    = $this->request->getQuery(); //q_data is the query data      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,['Radusergroups'=> ['Radgroupchecks']]);
       
        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($req_q['limit'])) {
            $limit = $req_q['limit'];
            $page = $req_q['page'];
            $offset = $req_q['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total 	= $query->count();
        $q_r 	= $query->all();
        $items 	= [];

        foreach ($q_r as $i) {

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
            
            $for_system = false;
            if($i->cloud_id == -1){
            	$for_system = true;
            } 
            
            array_push($items, array(
                'id'                    => $i->id,
                'name'                  => $i->name,
                'for_system'			=> $for_system,
                'profile_components'    => $components,
                'data_cap_in_profile'   => $data_cap_in_profile,
                'time_cap_in_profile'   => $time_cap_in_profile,
                'update'                => true,
                'delete'                => true
            ));
        }

        //___ FINAL PART ___
        $this->set([
            'items' 		=> $items,
            'success' 		=> true,
            'totalCount' 	=> $total,
            'metaData'		=> [
            	'total'	=> $total
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function manageComponents(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $this->reqData 	= $this->request->getData();
        $cloud_id		= $this->reqData['cloud_id'];
        if(isset($this->reqData['for_system'])){
            if($this->reqData['for_system'] == 'null'){
            	$cloud_id = $this->reqData['cloud_id'];
            }else{
            	$cloud_id = -1;
            }              
        }
        
        if(isset($this->reqData['id'])){
		    $e_profile = $this->{'Profiles'}->find()->where(['Profiles.id' => $this->reqData['id']])->first();     
		    if($e_profile){      
		    	$e_profile->cloud_id = $cloud_id;
		    	$this->{$this->main_model}->save($e_profile);     
		    }
		}
             
        $user_id    = $user['id'];
        $rb         = $this->request->getData('rb'); 

        if(($rb == 'add')||($rb == 'remove')){
            $component_id   = $this->request->getData('component_id');
            $entity         = $this->ProfileComponents->get($this->request->getData('component_id'));  
            $component_name = $entity->name;
        }
        
        foreach(array_keys($this->request->getData()) as $key){
            if(preg_match('/^\d+/',$key)){
                if($rb == 'remove'){
                    $entity         = $this->{$this->main_model}->get($key);
                    $entity->cloud_id = $cloud_id;
		    		$this->{$this->main_model}->save($entity);
                    $profile_name   = $entity->name;
                    $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name,'Radusergroups.groupname' => $component_name]);
                }
               
                if($rb == 'add'){
                    $entity         = $this->{$this->main_model}->get($key);
                    $entity->cloud_id = $cloud_id;
		    		$this->{$this->main_model}->save($entity);
                    $profile_name   = $entity->name;
                    
                    $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name,'Radusergroups.groupname' => $component_name]);
                    
                    $priority = $this->request->getData('priority');
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
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
       
	}
	  
    public function delete($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$req_d	= $this->request->getData();
		
	    if(isset($req_d['id'])){   //Single item delete      
            $entity         = $this->{$this->main_model}->get($req_d['id']);
            $profile_name   = $entity->name;         
          	$this->{$this->main_model}->delete($entity);
           	$this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name]);           
            //There might be an associated ProfileComponent also (if we used the simplified profiles)
            $simple_pc_name = $this->profCompPrefix.$req_d['id'];
            $this->{'ProfileComponents'}->deleteAll(['ProfileComponents.name' =>$simple_pc_name]);
            $this->_removeRadius($simple_pc_name); 
   
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity         = $this->{$this->main_model}->get($d['id']);
                $profile_name   = $entity->name;
                $profile_id     = $entity->id;   
                $owner_id       = $entity->user_id;
                
                $this->{$this->main_model}->delete($entity);
                $this->Radusergroups->deleteAll(['Radusergroups.username' => $profile_name]);
                //There might be an associated ProfileComponent also (if we used the simplified profiles)
                $simple_pc_name = $this->profCompPrefix.$profile_id;
                $this->{'ProfileComponents'}->deleteAll(['ProfileComponents.name' =>$simple_pc_name]);
                $this->_removeRadius($simple_pc_name); 
            }
        }
		$this->set([
            'success' 		=> true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	//== SIMPLE ITEMS ==
	public function simpleAdd(){
	
	    if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$this->reqData = $this->request->getData();
		
        $check_items = [
			'data_limit_mac',
			'time_limit_mac',
			'for_system'	
		];
        foreach($check_items as $i){
            if(isset($this->reqData[$i])){
                if($this->reqData[$i] == 'null'){
                	$this->reqData[$i] = 0;
                }else{
                	$this->reqData[$i] = 1;
                }  
            }else{
                $this->reqData[$i] = 0;
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
        	if(isset($this->reqData[$i])){
		        if($this->reqData[$i] === 'true'){
		            $this->reqData[$i] = 1;
		        }else{
		            $this->reqData[$i] = 0;
		        }
		  	}else{
		  		$this->reqData[$i] = 0;
		  	}
        }
        
        if($this->reqData['for_system'] == 1){
        	$this->reqData['cloud_id'] = -1;
        }else{
        	$this->reqData['cloud_id'] = $this->request->getData('cloud_id');
        }
        
       
        $entity = $this->{$this->main_model}->newEntity($this->reqData);
        
        if ($this->{$this->main_model}->save($entity)) {
        
            //Also add a profile component (Our Convention will have it contain 'SimpleAdd_'+<profile_ID>)
            $pc_name    = $this->profCompPrefix.$entity->id;
            $e_pc       = $this->{'ProfileComponents'}->newEntity(['name' => $pc_name,'cloud_id' => $entity->cloud_id]);
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
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }        
	}
	
	public function simpleEdit(){
	
	    if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$this->reqData	= $this->request->getData();

        $check_items = [
			'data_limit_mac',
			'time_limit_mac',
			'for_system'	
		];
        foreach($check_items as $i){
            if(isset($this->reqData[$i])){
                if($this->reqData[$i] == 'null'){
                	$this->reqData[$i] = 0;
                }else{
                	$this->reqData[$i] = 1;
                }              
            }else{
                $this->reqData[$i] = 0;
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
        	if(isset($this->reqData[$i])){
		        if($this->reqData[$i] === 'true'){
		            $this->reqData[$i] = 1;
		        }else{
		            $this->reqData[$i] = 0;
		        }
		   	}else{
		   		$this->reqData[$i] = 0;
		   	}
        }
        
        if($this->reqData['for_system'] == 1){
        	$this->reqData['cloud_id'] = -1;
        }else{
        	$this->reqData['cloud_id'] = $this->request->getData('cloud_id');
        }
        
        $entity = $this->{$this->main_model}->get($this->reqData['id']);     
        
        $pc_name    = $this->profCompPrefix.$entity->id;
        
        if($this->reqData['name'] !== $entity->name){
            
            $this->{'Radusergroups'}->deleteAll(['Radusergroups.groupname' =>$pc_name]);
            $ne = $this->{'Radusergroups'}->newEntity(
                [
                    'username'  => $this->reqData['name'],
                    'groupname' => $pc_name,
                    'priority'  => 5
                ]
            );
            $this->{'Radusergroups'}->save($ne);
            
            //== HEADS UP ==
            //==UPDATE ALL THE Permanet users
            $this->{'PermanentUsers'}->updateAll(
                [  
                    'profile'       => $this->reqData['name']
                ],
                [  
                    'profile'       => $entity->name,
                    'profile_id'    => $this->reqData['id']
                ]
            );   
            $this->{'Vouchers'}->updateAll(
                [  
                    'profile'       => $this->reqData['name']
                ],
                [  
                    'profile'       => $entity->name,
                    'profile_id'    => $this->reqData['id']
                ]
            ); 
            
            $this->{'Devices'}->updateAll(
                [  
                    'profile'       => $this->reqData['name']
                ],
                [  
                    'profile'       => $entity->name,
                    'profile_id'    => $this->reqData['id']
                ]
            );
            
            $this->{'Radchecks'}->updateAll(
                [  
                    'value'       => $this->reqData['name']
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
                    'username'  => $this->reqData['name'],
                    'groupname' => $pc_name,
                    'priority'  => 5
                ]
            );
            $this->{'Radusergroups'}->save($ne);    
        }
              
        $this->{$this->main_model}->patchEntity($entity, $this->reqData);      
        if ($this->{$this->main_model}->save($entity)) {
            $this->_doRadius($pc_name);     
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
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
        
        if($this->request->getQuery('profile_id')){
            $profile_id = $this->request->getQuery('profile_id');
            
            $ent = $this->{$this->main_model}->find()
                ->where(['Profiles.id' => $profile_id])
                ->first();
           	
           	
           	
            if($ent){ 
            
            	$for_system = false;
           		if($ent->cloud_id == -1){
           			$for_system = true;
           		}
            
                $pc_name        = $this->profCompPrefix.$ent->id;
                $data           = $this->_getRadius($pc_name);                          
                $data['id']     = $ent->id;
                $data['name']   = $ent->name;
              	$data['for_system'] = $for_system;         
            }    
        } 
	
	    $this->set([
            'success' => true,
            'data' => $data
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	//== FUP ITEMS ==
	
	public function fupView(){
	
	    //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
       
        if($this->request->getQuery('profile_id')){
            $profile_id = $this->request->getQuery('profile_id');     
            $ent = $this->{$this->main_model}->find()
            	->contain(['ProfileFupComponents'])
                ->where(['Profiles.id' => $profile_id])
                ->first();   
        } 
        
        $pc_name 	= $this->profCompPrefixFup.$ent->id;
       	$data       = $this->_getRadiusFup($pc_name);
       	
       	foreach(array_keys($data) as $k){
       		$ent->{$k} = $data[$k];
       	} 
       	
       	$ent->{'for_system'} = false;
   		if($ent->cloud_id == -1){
   			$ent->{'for_system'} = true;
   		}           
        	
	    $this->set([
            'success' 	=> true,
            'data' 		=> $ent
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	
	public function fupEdit(){
	
	    if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$this->reqData	= $this->request->getData();	
		
		$check_items = [
			'for_system'	
		];
        foreach($check_items as $i){
            if(isset($this->reqData[$i])){
            	if($this->reqData[$i] == 'null'){
                	$this->reqData[$i] = 0;
                }else{
                	$this->reqData[$i] = 1;
                }
            }else{
                $this->reqData[$i] = 0;
            }
        }		

        $t_f_settings = [
			'fup_enabled',
		];
		
		
		foreach($t_f_settings as $i){
        	if(isset($this->reqData[$i])){
		        if($this->reqData[$i] === 'true'){
		            $this->reqData[$i] = 1;
		        }else{
		            $this->reqData[$i] = 0;
		        }
		   	}else{
		   		$this->reqData[$i] = 0;
		   	}
        }
        
        if($this->reqData['for_system'] == 1){
        	$this->reqData['cloud_id'] = -1;
        }else{
        	$this->reqData['cloud_id'] = $this->request->getData('cloud_id');
        }
		    
        $profile_id		= $this->reqData['id'];
        $pc_name 		= $this->profCompPrefixFup.$profile_id;
		$pc_name_simple = $this->profCompPrefix.$profile_id;
        
        if($this->reqData['fup_enabled'] == 0){
        	//Delete all the FUP Components
        	$this->{'ProfileComponents'}->deleteAll(['ProfileComponents.name' => $pc_name, 'ProfileComponents.cloud_id' =>$this->reqData['cloud_id']]);
        	$this->{'Radusergroups'}->deleteAll(['Radusergroups.groupname' =>$pc_name]);
        	$this->{'Radgroupchecks'}->deleteAll(['groupname'  => $pc_name]);
        	$this->{'Radgroupreplies'}->deleteAll(['groupname' => $pc_name]);      	
        	$this->{'ProfileFupComponents'}->deleteAll(['ProfileFupComponents.profile_id' => $profile_id]);
        	$this->set([
		        'success' 	=> true
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);
		    return;
        }
        
        //=== FUP Components ===
        $add_numbers 	= [];
        $edit_numbers 	= [];
        
        foreach(array_keys($this->reqData) as $key){      
        	if(preg_match("/^add_.+_name/",  $key)){
        		//Get the number
        		$add_nr = str_replace('add_','', $key);
        		$add_nr = preg_replace('/_.*/', '', $add_nr);
        		array_push($add_numbers,$add_nr);
        	}
        	if(preg_match("/^edit_.+_name/",  $key)){
        		//Get the number
        		$edit_nr = str_replace('edit_','', $key);
        		$edit_nr = preg_replace('/_.*/', '', $edit_nr);
        		array_push($edit_numbers,$edit_nr);
        	}        
        }       
		
		//Now we have our edit items we can edit them...
        foreach($edit_numbers as $en){
        	$edit_data = [];
		    foreach(array_keys($this->reqData) as $key){ 
		    	if(preg_match("/^edit_".$en."_/",  $key)){
		    		$item = str_replace('edit_'.$en.'_','', $key);
		    		$edit_data[$item] = $this->reqData[$key];		    	
		    	}		    
		    }
		    $edit_e = $this->{'ProfileFupComponents'}->find()->where(['ProfileFupComponents.id' => $en])->first();
		    if($edit_e){
		    	$this->{'ProfileFupComponents'}->patchEntity($edit_e, $edit_data);
		    	$this->{'ProfileFupComponents'}->save($edit_e);      
		    }              
		}
		
		//We also need to loop through the existing ones and if its not in the edit list - delete it
		$existing = $this->{'ProfileFupComponents'}->find()->where(['ProfileFupComponents.profile_id' => $profile_id])->all();
		foreach($existing as $ex){
			if(!in_array($ex->id,$edit_numbers)){
				$this->{'ProfileFupComponents'}->delete($ex);
			}		
		}
		
		//Now we have our add items we can add them...
        foreach($add_numbers as $an){
        	$add_data = [];
        	$add_data['profile_id'] = $profile_id;
		    foreach(array_keys($this->reqData) as $key){ 
		    	if(preg_match("/^add_".$an."_/",  $key)){
		    		$item = str_replace('add_'.$an.'_','', $key);
		    		$add_data[$item] = $this->reqData[$key];		    	
		    	}		    
		    }
		    $ne = $this->{'ProfileFupComponents'}->newEntity($add_data);
            $this->{'ProfileFupComponents'}->save($ne);    
		}
		
		//===Find the count of FupComponents
		$fup_comp_count = $this->{'ProfileFupComponents'}->find()->where(['ProfileFupComponents.profile_id' => $profile_id])->count();
		
		
		
		//===The RADIUS side===
		//Also add a profile component (Our Convention will have it contain 'FupAdd_'+<profile_ID>)
		//First check if it is not already added
		$e_pc		= $this->{'ProfileComponents'}->find()
			->where(['ProfileComponents.name' => $pc_name, 'ProfileComponents.cloud_id' =>$this->reqData['cloud_id']])
			->first();
		if(!$e_pc){
			$e_pc       = $this->{'ProfileComponents'}->newEntity(['name' => $pc_name,'cloud_id' => $this->reqData['cloud_id']]);
        	$this->{'ProfileComponents'}->save($e_pc);
        }
        
        $this->{'ProfileComponents'}->deleteAll(['ProfileComponents.name' => $pc_name_simple, 'ProfileComponents.cloud_id' =>$this->reqData['cloud_id']]);
        $this->{'Radgroupchecks'}->deleteAll(['groupname'  => $pc_name_simple]);
        $this->{'Radgroupreplies'}->deleteAll(['groupname' => $pc_name_simple]);
        $this->{'Radusergroups'}->deleteAll(['Radusergroups.groupname' =>$pc_name_simple]);
        
		$this->{'Radusergroups'}->deleteAll(['Radusergroups.groupname' =>$pc_name]);		
        $ne = $this->{'Radusergroups'}->newEntity(
            [
                'username'  => $this->reqData['name'],
                'groupname' => $pc_name,
                'priority'  => 5
            ]
        );
        $this->{'Radusergroups'}->save($ne);                		
		$entity =  $this->{$this->main_model}->find()->where(['Profiles.id' => $profile_id])->first();
		$this->{$this->main_model}->patchEntity($entity, $this->reqData); 		
		if ($this->{$this->main_model}->save($entity)) {
            $this->_doRadiusFup($pc_name,$profile_id,$fup_comp_count);     
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
	}
	
    public function menuForGrid(){

        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'profiles'); 
        $this->set([
            'items' => $menu,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    private function _doRadiusFup($groupname,$profile_id,$count=0){
    
    	//Clear any posible left-overs
        $this->{'Radgroupchecks'}->deleteAll(['groupname' => $groupname]);
        $this->{'Radgroupreplies'}->deleteAll(['groupname' => $groupname]);
        
        if($this->reqData['fup_enabled']){ //IF it is there    
            $speed_upload_amount    = $this->reqData['fup_upload_amount'];
            $speed_upload_unit      = $this->reqData['fup_upload_unit'];
            $speed_upload           = $speed_upload_amount * 1024; //Default is kbps
            if($speed_upload_unit == 'mbps'){
                $speed_upload = $speed_upload * 1024;   
            }
            
            $d_up = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Fup-Bw-Up',
                'op'        => ':=',
                'value'     => $speed_upload,
                'comment'   => 'FupProfile'
            ];
            
            $e_up = $this->{'Radgroupchecks'}->newEntity($d_up);
            $this->{'Radgroupchecks'}->save($e_up);
            
            $speed_download_amount  = $this->reqData['fup_download_amount'];
            $speed_download_unit    = $this->reqData['fup_download_unit'];
            $speed_download         = $speed_download_amount * 1024; //Default is kbps
            if($speed_download_unit == 'mbps'){
                $speed_download = $speed_download * 1024;   
            }
            
            $d_down = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Fup-Bw-Down',
                'op'        => ':=',
                'value'     => $speed_download,
                'comment'   => 'FupProfile'
            ];
            
            $e_down = $this->{'Radgroupchecks'}->newEntity($d_down);
            $this->{'Radgroupchecks'}->save($e_down);
            
             $d_count = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Fup-Comp-Count',
                'op'        => ':=',
                'value'     => $count,
                'comment'   => 'FupProfile'
            ];
            
            $e_count = $this->{'Radgroupchecks'}->newEntity($d_count);
            $this->{'Radgroupchecks'}->save($e_count);
            
            $d_p_id = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Fup-Profile-Id',
                'op'        => ':=',
                'value'     => $profile_id,
                'comment'   => 'FupProfile'
            ];
            
            $e_p_id = $this->{'Radgroupchecks'}->newEntity($d_p_id);
            $this->{'Radgroupchecks'}->save($e_p_id);                                       
        }
        
        if(isset($this->reqData['fup_bursting_on'])){ //IF bursting
        
      
        	if(!($this->reqData['fup_bursting_on'] == "null")){ //ExtJS Modern sets it to null if not selected
        
		    	$d_bl = [
		            'groupname' => $groupname,
		            'attribute' => 'Rd-Fup-Burst-Limit',
		            'op'        => ':=',
		            'value'     => $this->reqData['fup_burst_limit'],
		            'comment'   => 'FupProfile'
		        ];
		        
		        $e_bl = $this->{'Radgroupchecks'}->newEntity($d_bl);
		        $this->{'Radgroupchecks'}->save($e_bl); 
		        
		        $d_bt = [
		            'groupname' => $groupname,
		            'attribute' => 'Rd-Fup-Burst-Time',
		            'op'        => ':=',
		            'value'     => $this->reqData['fup_burst_time'],
		            'comment'   => 'FupProfile'
		        ];
		        
		        $e_bt = $this->{'Radgroupchecks'}->newEntity($d_bt);
		        $this->{'Radgroupchecks'}->save($e_bt);
		        
		        $d_bth = [
		            'groupname' => $groupname,
		            'attribute' => 'Rd-Fup-Burst-Threshold',
		            'op'        => ':=',
		            'value'     => $this->reqData['fup_burst_threshold'],
		            'comment'   => 'FupProfile'
		        ];
		        
		        $e_bth = $this->{'Radgroupchecks'}->newEntity($d_bth);
		        $this->{'Radgroupchecks'}->save($e_bth); 
		        
		  	}                 
        }
        
        if((isset($this->reqData['fup_ip_pool']))&&($this->reqData['fup_ip_pool'] !== '')){ //IP Pool
        	$d_ip = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Fup-Ip-Pool',
                'op'        => ':=',
                'value'     => $this->reqData['fup_ip_pool'],
                'comment'   => 'FupProfile'
            ];
            
            $e_ip = $this->{'Radgroupchecks'}->newEntity($d_ip);
            $this->{'Radgroupchecks'}->save($e_ip);        
        } 
        
        if((isset($this->reqData['fup_vlan']))&&($this->reqData['fup_vlan'] !== '')){ //IP Pool
        	$d_vlan = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Fup-Vlan',
                'op'        => ':=',
                'value'     => $this->reqData['fup_vlan'],
                'comment'   => 'FupProfile'
            ];
            
            $e_vlan = $this->{'Radgroupchecks'}->newEntity($d_vlan);
            $this->{'Radgroupchecks'}->save($e_vlan);        
        } 
        
        
        //Fall Through      
        $d_fall_through = [
            'groupname' => $groupname,
            'attribute' => 'Fall-Through',
            'op'        => ':=',
            'value'     => 'Yes',
            'comment'   => 'FupProfile'        
        ];
        $e_ff = $this->{'Radgroupreplies'}->newEntity($d_fall_through );
        $this->{'Radgroupreplies'}->save($e_ff );       
                    
    }
    
    private function _doRadius($groupname){
    
        //Clear any posible left-overs
        $this->{'Radgroupchecks'}->deleteAll(['groupname' => $groupname]);
        $this->{'Radgroupreplies'}->deleteAll(['groupname' => $groupname]);
      
        if($this->reqData['data_limit_enabled']){
         
            //Reset
            $data_reset = $this->reqData['data_reset'];
            $data_top_up    = false;
            if($data_reset == 'top_up'){
                $data_reset = 'never';
                $data_top_up    = true;
            }
            
            //Data Cap Type
            $data_cap       = 'hard';
            if($this->reqData['data_cap']){
                $data_cap = $this->reqData['data_cap'];
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
                $data_amount    = $this->reqData['data_amount'];
                $data_unit      = $this->reqData['data_unit'];
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
            
            if($this->reqData['data_limit_mac']){
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
        
        if($this->reqData['time_limit_enabled']){
            
            //Reset
            $time_reset     = $this->reqData['time_reset'];
            $time_top_up    = false;
            if($time_reset == 'top_up'){
                $time_reset     = 'never';
                $time_top_up    = true;
            }
            
            //Time Cap Type
            $time_cap       = 'hard';
            if($this->reqData['time_cap']){
                $time_cap = $this->reqData['time_cap'];
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
                $time_amount    = $this->reqData['time_amount'];
                $time_unit      = $this->reqData['time_unit'];
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
            
            if($this->reqData['time_limit_mac']){
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
    
        if($this->reqData['speed_limit_enabled']){ //IF it is there    
            $speed_upload_amount    = $this->reqData['speed_upload_amount'];
            $speed_upload_unit      = $this->reqData['speed_upload_unit'];
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
            
            $speed_download_amount  = $this->reqData['speed_download_amount'];
            $speed_download_unit    = $this->reqData['speed_download_unit'];
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
        if(isset($this->reqData['logintime_1_span'])){
        
		    $logintime_string = '';
		    for ($x = 1; $x <= 3; $x++) {
		        $slot_span = $this->reqData['logintime_'.$x.'_span'];
		        if($slot_span !== 'disabled'){
		            $slot_start = str_replace(':','',$this->reqData['logintime_'.$x.'_start']);
		            $slot_end   = str_replace(':','',$this->reqData['logintime_'.$x.'_end']);
		            if(($slot_span == 'Al')||($slot_span == 'Wk')){
		                $logintime_string = $logintime_string.$slot_span.$slot_start.'-'.$slot_end.'|';  
		            
		            }else{
		                $dat 				= $this->reqData;                   
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
		    
		}
        //=== END LOGINTIME ===
                
        //===Session Limit===
        if($this->reqData['session_limit_enabled']){ //IF it is there 
            $session_limit = $this->reqData['session_limit'];
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
        if($this->reqData['adv_data_limit_enabled']){ //IF it is there
        
            //Data Amount
            $data_amount    = $this->reqData['adv_data_amount'];
            $data_unit      = $this->reqData['adv_data_unit'];
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
                    
            $data_day_sessions =  $this->reqData['adv_data_per_day'];            
            $d_d_day = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Adv-Data-Per-Day',
                'op'        => ':=',
                'value'     => $data_day_sessions,
                'comment'   => 'SimpleProfile'
            ];
            $e_d_day = $this->{'Radgroupchecks'}->newEntity($d_d_day);
            $this->{'Radgroupchecks'}->save($e_d_day);
            
            $data_month_sessions =  $this->reqData['adv_data_per_month'];            
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
        if($this->reqData['adv_time_limit_enabled']){ //IF it is there
        
            //Time Amount
            $time_amount    = $this->reqData['adv_time_amount'];
            $time_unit      = $this->reqData['adv_time_unit'];
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
        
            $time_day_sessions =  $this->reqData['adv_time_per_day'];            
            $d_t_day = [
                'groupname' => $groupname,
                'attribute' => 'Rd-Adv-Time-Per-Day',
                'op'        => ':=',
                'value'     => $time_day_sessions,
                'comment'   => 'SimpleProfile'
            ];
            $e_t_day = $this->{'Radgroupchecks'}->newEntity($d_t_day);
            $this->{'Radgroupchecks'}->save($e_t_day);
            
            $time_month_sessions =  $this->reqData['adv_time_per_month'];            
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
    
    private function _getRadiusFup($groupname){
    
   		$data 	= [
            'fup_enabled'   	=> false,
            'fup_bursting_on'   => false
        ]; 
    
    	$e_list = $this->{'Radgroupchecks'}->find()->where(['Radgroupchecks.groupname' => $groupname])->all();  
    	
    	$bw_up_check    = false;
        $bw_down_check  = false;
           
        foreach($e_list as $e){

            if($e->attribute == 'Rd-Fup-Bw-Up'){
                $bw_up_check = true;
                if(intval($e->value) >= 1048576){
                    $speed_upload_amount = $e->value / 1024 / 1024;
                    $speed_upload_unit   = 'mbps';
                }else{
                    $speed_upload_amount = $e->value / 1024;
                    $speed_upload_unit   = 'kbps';
                }
            }
            if($e->attribute == 'Rd-Fup-Bw-Down'){
                $bw_down_check = true;
                if(intval($e->value) >= 1048576){
                    $speed_download_amount = $e->value / 1024 / 1024;
                    $speed_download_unit   = 'mbps';
                }else{
                    $speed_download_amount = $e->value / 1024;
                    $speed_download_unit   = 'kbps';
                }
            }
            
            if($e->attribute == 'Rd-Fup-Burst-Limit'){
            	$data['fup_bursting_on']    = true;
            	$data['fup_burst_limit']    = intval($e->value);           
            }
            
            
            if($e->attribute == 'Rd-Fup-Burst-Time'){
            	$data['fup_burst_time']    = intval($e->value);           
            }
            
            if($e->attribute == 'Rd-Fup-Burst-Threshold'){
            	$data['fup_burst_threshold']    = intval($e->value);           
            }
             
            if($e->attribute == 'Rd-Fup-Ip-Pool'){
            	$data['fup_ip_pool']    = $e->value;           
            }
            
            if($e->attribute == 'Rd-Fup-Vlan'){
            	$data['fup_vlan']    = $e->value;           
            }                  
        }
    
        if(($bw_up_check)&&($bw_down_check)){ 
            unset($data['fup_enabled']);
            $data['fup_upload_amount']    = $speed_upload_amount;
            $data['fup_upload_unit']      = $speed_upload_unit;
            $data['fup_download_amount']  = $speed_download_amount;
            $data['fup_download_unit']    = $speed_download_unit;
        }   	   
    	return $data;
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
                //$data['data_limit_enabled'] = true;
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
            
            //Advanced Data
            if($e->attribute == 'Rd-Adv-Data'){
                $adv_data_limit_enabled = $e->value;
                unset($data['adv_data_limit_enabled']);
                $d_adv_data = $e->value;
                if(($d_adv_data/1024) >= 1048576){
                    $data['adv_data_amount'] = ($d_adv_data/1048576)/1024;
                    $data['adv_data_unit'] = 'gb';
                }else{
                    $data['adv_data_amount'] = $d_adv_data/1048576;
                    $data['adv_data_unit'] = 'mb';
                }
            }
            
            if($e->attribute == 'Rd-Adv-Data-Per-Day'){
                $data['adv_data_per_day'] = $e->value;  
            }
            if($e->attribute == 'Rd-Adv-Data-Per-Month'){
                $data['adv_data_per_month'] = $e->value;  
            }
            
            //Advanced Time
            if($e->attribute == 'Rd-Adv-Time'){
                $adv_time_limit_enabled = $e->value;
                unset($data['adv_time_limit_enabled']);
                $adv_time = $e->value;
                if(($adv_time/24/60/60) > 1){
                    $data['adv_time_amount'] = $adv_time/24/60/60;
                    $data['adv_time_unit'] = 'day';
                }elseif(($adv_time/60/60) > 1){
                    $data['adv_time_amount'] = $adv_time/60/60;
                    $data['adv_time_unit'] = 'hour';
                }else{
                    $data['adv_time_amount'] = $adv_time/60;
                    $data['adv_time_unit'] = 'min';
                }
            }
            
            if($e->attribute == 'Rd-Adv-Time-Per-Day'){
                $data['adv_time_per_day'] = $e->value;  
            }
            if($e->attribute == 'Rd-Adv-Time-Per-Month'){
                $data['adv_time_per_month'] = $e->value;  
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
