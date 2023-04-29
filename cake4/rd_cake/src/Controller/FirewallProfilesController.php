<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 17/April/2023
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

class FirewallProfilesController extends AppController {

    public $base            = "Access Providers/Controllers/FirewallProfiles/";
    protected $owner_tree   = [];
    protected $main_model   = 'FirewallProfiles';
    
    public function initialize():void{
        parent::initialize();
        
        $this->loadModel($this->main_model);
        $this->loadModel('Users');
        $this->loadModel('FirewallProfileEntries');
        $this->loadModel('FirewallProfileEntryFirewallApps');

        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'     => 'FirewallProfiles',
            'sort_by'   => 'FirewallProfiles.name'
        ]);
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');    
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('Schedule');
    }
    
    public function indexCombo(){
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
        if (isset($req_q['limit'])) {
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
        
        if(isset($req_q['include_all_option'])){
		    if($req_q['include_all_option'] == true){
		    	array_push($items, ['id' => 0,'name' => '**All Firewall Profiles**']);      
		    }
		}

        foreach ($q_r as $i) {
	        array_push($items, ['id' => $i->id,'name' => $i->name]);        
        }

        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total
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
        $this->CommonQueryFlat->cloud_with_system($query,$cloud_id,['FirewallProfileEntries'=>['FirewallProfileEntryFirewallApps'=>['FirewallApps']]]);
        
        if(isset($req_q['id'])){
        	if($req_q['id'] > 0){
        		$query->where(['FirewallProfiles.id' => $req_q['id']]);
        	}	   
        }

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
       
            $row            = [];       
			$row['id']      = $i->id.'_0'; //Signifies Firewall Profile
			$row['name']	= $i->name;
			$row['type']	= 'firewall_profile';
			$row['firewall_profile_id'] = $i->id;
			
			$for_system = false;
            if($i->cloud_id == -1){
            	$for_system = true;
            }
            $row['for_system']  = $for_system;
			
					
			array_push($items, $row);
			
			foreach($i->firewall_profile_entries as $fp_e){
			
				if($fp_e->action == 'limit'){
					$bw_up_suffix = 'kbps';
					$bw_up = ($fp_e->bw_up * 8);
					if($bw_up >= 1000){
						$bw_up = $bw_up / 1000;
						$bw_up_suffix = 'mbps';
					}
					$fp_e->bw_up_suffix = $bw_up_suffix;
					$fp_e->bw_up = $bw_up;
					
					$bw_down_suffix = 'kbps';
					$bw_down = ($fp_e->bw_down * 8);
					if($bw_down >= 1000){
						$bw_down = $bw_down / 1000;
						$bw_down_suffix = 'mbps';
					}
					$fp_e->bw_down_suffix = $bw_down_suffix;
					$fp_e->bw_down = $bw_down;
				}
				
				if($fp_e->schedule !== 'always'){
				
					$human_span = '0 minutes';
					if($fp_e->start_time > $fp_e->end_time){
						$span 		= (1440- $fp_e->start_time) + $fp_e->end_time; //Whats left from the first day PLUS second day
						$human_span = $this->forHumans($span,'%02d hours, %02d minutes');        
					}
						 
					if($fp_e->start_time < $fp_e->end_time){
						$span 			= $fp_e->end_time - $fp_e->start_time;
						$human_span 	= $this->forHumans($span,'%02d hours, %02d minutes');
					}     
				
					$fp_e->start_time_human = $this->timeFormat($fp_e->start_time);
					$fp_e->end_time_human 	= $this->timeFormat($fp_e->end_time);
					$fp_e->human_span 		= $human_span;	
				}
				
				if($fp_e->schedule == 'one_time'){
					$fp_e->one_time_date = $fp_e->one_time_date->i18nFormat('yyyy-MM-dd');			
				}
			
				$fp_e->type 		= 'firewall_profile_entry';			
				$fp_e->for_system 	= $for_system;				
				array_push($items, $fp_e);		
			}					
			array_push($items,[ 'id' => '0_'.$i->id, 'type'	=> 'add','name' => 'Firewall Profile Entry', 'firewall_profile_id' =>  $i->id, 'firewall_profile_name' => $i->name, 'for_system' =>  $for_system ]);			
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
                    $this->set(array(
                        'success' => true
                    ));
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($entity,$message);
                }   
            }
        }
    }
	    
    public function addFirewallProfileEntry(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        /*
        	Mbps : Megabit per second (Mbit/s or Mb/s)
			kB/s : Kilobyte per second
			1 byte = 8 bits
			1 bit  = (1/8) bytes
			1 bit  = 0.125 bytes
			1 kilobyte = 10001 bytes
			1 megabit  = 10002 bits
			1 megabit  = (1000 / 8) kilobytes
			1 megabit  = 125 kilobytes
			1 megabit/second = 125 kilobytes/second
			1 Mbps = 125 kB/s
        */
              
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
            
            //--Speed Calculations--
            if($req_data['action'] == 'limit'){       	      	
		   		$d_amount 	= $req_data['limit_download_amount'];
		   		$d_unit 	= $req_data['limit_download_unit'];
		   		if($d_unit == 'mbps'){
		   			$bw_down = ($d_amount * 1000) / 8;
		   		}
		   		if($d_unit == 'kbps'){
		   			$bw_down = $d_amount / 8;
		   		}
		   		$req_data['bw_down']	= $bw_down;
		   		
		   		//Upload
		   		$u_amount 	= $req_data['limit_upload_amount'];
		   		$u_unit 	= $req_data['limit_upload_unit'];
		   		if($u_unit == 'mbps'){
		   			$bw_up = ($u_amount * 1000) / 8;
		   		}
		   		if($u_unit == 'kbps'){
		   			$bw_up = $u_amount / 8;
		   		}
		   		$req_data['bw_up']	= $bw_up;		   			   		
		   	}
		   	
		   	if($req_data['schedule'] == 'one_time'){			   	
		   		$req_data['one_time_date'] = new FrozenTime($req_data['one_time_date']." 00:00:00");			   	
		   	}
                                                      
            $entity = $this->{'FirewallProfileEntries'}->newEntity($req_data); 
            if ($this->{'FirewallProfileEntries'}->save($entity)) {
                $this->set([
                    'success' => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            } else {
                $message = __('Could not add item');
                $this->JsonErrors->entityErros($entity,$message);
            }    
        }
    }
    
    public function viewFirewallProfileEntry(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
               
        $req_q      = $this->request->getQuery();
        $id         = $req_q['firewall_profile_entry_id'];  
        $data       = [];
        $entity     = $this->{'FirewallProfileEntries'}->find()->where(['FirewallProfileEntries.id' => $id])->contain(['FirewallProfileEntryFirewallApps'])->first();
        if($entity){          
            if($entity->action == 'limit'){
				$bw_up_suffix = 'kbps';
				$bw_up = ($entity->bw_up * 8);
				if($bw_up >= 1000){
					$bw_up = $bw_up / 1000;
					$bw_up_suffix = 'mbps';
				}
				$entity->limit_upload_unit 		= $bw_up_suffix;
				$entity->limit_upload_amount 	= $bw_up;
				
				$bw_down_suffix = 'kbps';
				$bw_down = ($entity->bw_down * 8);
				if($bw_down >= 1000){
					$bw_down = $bw_down / 1000;
					$bw_down_suffix = 'mbps';
				}
				$entity->limit_download_unit 	= $bw_down_suffix;
				$entity->limit_download_amount 	= $bw_down;
			}
			
			if($entity->schedule == 'one_time'){
				$entity->one_time_date = $entity->one_time_date->i18nFormat('yyyy-MM-dd');			
			}
			
			if($entity->firewall_profile_entry_firewall_apps){
				$entity->apps = [];			
				foreach($entity->firewall_profile_entry_firewall_apps as $a){
					array_push($entity->apps, $a->firewall_app_id);		
				}
				unset($entity->firewall_profile_entry_firewall_apps);				
			}
            
            $data       =  $entity;
            if(isset($data['apps'])){
            	$data['apps[]'] = $data['apps'];
            }
            
            
        }
        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function editFirewallProfileEntry(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
           
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
            $id = $req_data['firewall_profile_entry_id'];
            
            $entity = $this->{'FirewallProfileEntries'}->find()->where(['FirewallProfileEntries.id' => $id])->first();
            if($entity){
            
            	//Clean up the FirewallProfileEntyFirewallApps entries 
            	$this->{'FirewallProfileEntryFirewallApps'}->deleteAll(['FirewallProfileEntryFirewallApps.firewall_profile_entry_id' => $entity->id]);
            	
            	if(isset($req_data['apps'])){          	
            		foreach($req_data['apps'] as $app){            		
            			$a = $this->{'FirewallProfileEntryFirewallApps'}->newEntity(['firewall_profile_entry_id' => $entity->id, 'firewall_app_id' => $app]);            			 
            			$this->{'FirewallProfileEntryFirewallApps'}->save($a);            		
            		}
            	}
            	           
            	if($req_data['action'] == 'limit'){       	  	      	
			   		$d_amount 	= $req_data['limit_download_amount'];
			   		$d_unit 	= $req_data['limit_download_unit'];
			   		if($d_unit == 'mbps'){
			   			$bw_down = ($d_amount * 1000) / 8;
			   		}
			   		if($d_unit == 'kbps'){
			   			$bw_down = $d_amount / 8;
			   		}
			   		
			   		$u_amount 	= $req_data['limit_upload_amount'];
			   		$u_unit 	= $req_data['limit_upload_unit'];
			   		if($u_unit == 'mbps'){
			   			$bw_up = ($u_amount * 1000) / 8;
			   		}
			   		if($u_unit == 'kbps'){
			   			$bw_up = $u_amount / 8;
			   		}
				
			   		$req_data['bw_up'] 	= $bw_up;
			   		$req_data['bw_down'] 	= $bw_down; 			   		
			   	}
			   	
			   	if($req_data['action'] == 'block'){
			   		$req_data['bw_up'] 	= null;
			   		$req_data['bw_down'] 	= null;  	
			   	}
			   	
			   	if($req_data['schedule'] == 'one_time'){			   	
			   		$req_data['one_time_date'] = new FrozenTime($req_data['one_time_date']." 00:00:00");			   	
			   	}
                                
                $this->{'FirewallProfileEntries'}->patchEntity($entity, $req_data);  
                if ($this->{'FirewallProfileEntries'}->save($entity)) {
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
    
    public function deleteFirewallProfileEntry() {
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

	    if(isset($req_d['id'])){   //Single item delete
            $message = "Single item ".$req_d['id'];       
            $entity     = $this->{'FirewallProfileEntries'}->get($req_d['id']);   
            $this->{'FirewallProfileEntries'}->delete($entity);
             
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity     = $this->{'FirewallProfileEntries'}->get($d['id']);     
                $this->{'FirewallProfileEntries'}->delete($entity);                
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
	
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'FirewallProfiles');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
        
    public function defaultSchedule(){
    
    	$user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
           
        $this->set([
            'items'			=> $this->Schedule->getSchedule(30),
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);  
    }
    
    private function timeFormat($event_time){   
    	$m       = $event_time % 60;
        $h       = ($event_time-$m)/60;
        $hrs_mins= $h.":".str_pad($m, 2, "0", STR_PAD_LEFT);
        return $hrs_mins;   
    }
    
    private function forHumans($span , $format = '%02d:%02d'){

		if ($span < 1) {
		    return;
		}
		$hours = floor($span / 60);
		$minutes = ($span % 60);
		return sprintf($format, $hours, $minutes);   
    }
    
}
