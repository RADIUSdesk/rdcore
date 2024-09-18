<?php

namespace App\Controller;

use Cake\Core\Configure;
use Exception;
use GeoIp2\Database\Reader;

class ApProfilesController extends AppController {

    public $main_model          = 'ApProfiles';
    public $base             = "Access Providers/Controllers/ApProfiles/";

    public function initialize():void
    {
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('Users');
        $this->loadModel('DynamicClients');
        $this->loadModel('DynamicPairs');
        $this->loadModel('DynamicClientRealms');
        $this->loadModel('Realms');
        $this->loadModel('OpenvpnServers');
        $this->loadModel('OpenvpnServerClients');
        $this->loadModel('ApProfileEntries');
        $this->loadModel('ApProfileSettings');
        $this->loadModel('ApProfileEntrySchedules');
        $this->loadModel('ApApProfileEntries');
        $this->loadModel('ApStaticEntryOverrides');
        
        //New change May2021
        $this->loadModel('Networks');
        $this->loadModel('Sites');
        $this->loadModel('Clouds');
        
        $this->loadModel('Hardwares');
        $this->loadModel('Timezones');
        
        $this->loadModel('ApWifiSettings');

        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat'); 
        $this->loadComponent('GridFilter');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('JsonErrors');
        $this->loadComponent('Schedule');
        
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'ApProfiles'
        ]);
    }

    //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['Aps']);

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

        $items      = [];
        
        $meta_ap_total     	= 0;    
        $meta_ap_up 		= 0;
        $meta_ap_profile_up = 0;

        foreach($q_r as $i){
            
			$ap_profile_id  = $i->id;

			$now		= time();

			$ap_count 	= 0;
			$aps_up		= 0;
			$aps_down   = 0;
			$last_contact_in_words 	= "never";
            $last_contact_state 	= "never";
			foreach($i->aps as $ap){
			    //Get the 'dead_after' value
			    $dead_after = $this->_get_dead_after($ap->ap_profile_id);
			
				$l_contact  = $ap->last_contact;
				if($l_contact != null){
			        $last_timestamp = strtotime($l_contact);
	                if($last_timestamp+$dead_after <= $now){
	                    $aps_down++;
	                }else{
					    $aps_up++;  
	                }
	            }else{
	                $aps_down++;
	            }				
				$ap_count++;
			}
			
			$meta_ap_total = $meta_ap_total+$ap_count;
			$meta_ap_up = $meta_ap_up+$aps_up;
			if($aps_up > 0){
				$meta_ap_profile_up++;
			}

            array_push($items, [
                'id'                    => $i->id,
                'name'                  => $i->name,
                'ap_count'              => $ap_count,
                'aps_up'                => $aps_up,
                'aps_down'              => $aps_down,
                'last_contact_in_words' => $last_contact_in_words,
            	'last_contact_state'	=> $last_contact_state,
                'update'                => true,
                'delete'                => true,
                'view'                  => true
            ]);
        }
       
        //___ FINAL PART ___
        $this->set([
            'items' 		=> $items,
            'metaData'      => [
                'ap_profiles_total' => $total,
                'ap_profiles_up'    => $meta_ap_profile_up,
                'aps_total'   		=> $meta_ap_total,
                'aps_up'      		=> $meta_ap_up,  
            ],
            'success' 		=> true,
            'totalCount' 	=> $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
    public function add() {

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id = $user['id'];
        $cdata   = $this->request->getData();
        $apProfileEntity = $this->{$this->main_model}->newEntity($cdata);

        if ($this->{$this->main_model}->save($apProfileEntity)) {
            $this->set([
                'success' => true
            ]);
        }else {
            $message = 'Error';
            $this->set([
                'errors'    => $this->JsonErrors->entityErros($apProfileEntity, $message),
                'success'   => false,
                'message'   => __('Could not create item')
            ]);
        }
        $this->viewBuilder()->setOption('serialize', true);
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

        $user_id   	= $user['id'];
        $fail_flag 	= false;
        $req_d 		= $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
    
            $entity     = $this->{$this->main_model}->get($this->$req_d['id']);   
            $this->{$this->main_model}->delete($entity);

   
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);              
                $this->{$this->main_model}->delete($entity);
            }
        }

        if($fail_flag == true){
            $this->set(array(
                'success'   => false,
                'message'   => __('Could not delete some items'),
            ));
        }else{
            $this->set(array(
                'success' => true,
            ));
        }
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	
	//======= AP Profile entries ============
    public function apProfileEntriesIndex(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items          = [];
        $total          = 0;
        $ap_profile_id  = $this->request->getQuery('ap_profile_id');
        $q_r = $this->ApProfileEntries->find()->contain(['ApProfileExitApProfileEntries','ApProfileEntrySchedules'])->where(['ApProfileEntries.ap_profile_id' => $ap_profile_id])->all();

        foreach($q_r as $m){
            $connected_to_exit = true;
            $chk_schedule = true;   
            if(count($m->ap_profile_exit_ap_profile_entries) == 0){
                $connected_to_exit = false;
            }
            
            if(count($m->ap_profile_entry_schedules) == 0){
                $chk_schedule = false;
            }
   
            array_push($items,array( 
                'id'            => $m->id,
                'ap_profile_id' => $m->ap_profile_id,
                'name'          => $m->name,
                'hidden'        => $m->hidden,
                'isolate'       => $m->isolate,
                'encryption'    => $m->encryption,
                'special_key'   => $m->special_key,
                'auth_server'   => $m->auth_server,
                'auth_secret'   => $m->auth_secret,
                'dynamic_vlan'  => $m->dynamic_vlan,
                'apply_to_all'  => $m->apply_to_all,
                'frequency_band'  => $m->frequency_band,
                'hotspot2_enable' => $m->hotspot2_enable,
                'ieee802r'		=> $m->ieee802r,
                'mobility_domain' => $m->mobility_domain,
                'connected_to_exit' => $connected_to_exit,
                'chk_schedule'	=> $chk_schedule
            ));
        }
        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function apProfileEntryAdd(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $cdata = $this->request->getData();
        
        $check_items = ['hidden','isolate','apply_to_all','chk_maxassoc','accounting','auto_nasid','chk_schedule','hotspot2_enable','ieee802r','ft_pskgenerate_local','ft_auto_nasid'];
        foreach($check_items as $i){
            if(isset($cdata[$i])){
				if($cdata[$i] == 'null'){
					$cdata[$i] = 0;
				}else{
					$cdata[$i] = 1;
				}  
			}else{
				$cdata[$i] = 0;
			}
        }
        
        if(isset($cdata['ft_auto_nasid'])){
	    	if($cdata['ft_auto_nasid'] == 1){
	   			$cdata['auto_nasid'] = $cdata['ft_auto_nasid']; 
	    	}
	    }
        
        $entryEntity = $this->ApProfileEntries->newEntity($cdata);
        if ($this->ApProfileEntries->save($entryEntity)) {
            $id = $entryEntity->id;
            if($cdata['auto_nasid'] == 1){
                $ssid_underscored = preg_replace('/\s+/', '_', $cdata['name']);
                $ssid_underscored = strtolower($ssid_underscored);
                $ssid_underscored = (strlen($ssid_underscored) > 5) ? substr($ssid_underscored,0,5): $ssid_underscored;//Not longer than 5 chars
                $client_type = '_apeap_';
                if($cdata['encryption'] == 'ppsk'){
                	$client_type = '_apppsk_';
                }
                $cdata['nasid'] = $ssid_underscored.$client_type.$this->request->getData('id');
                $client_type = '_apeap_';
                if($cdata['encryption'] == 'ppsk'){
                	$client_type = '_apppsk_';
                }
                $nasid = $ssid_underscored.$client_type.$id;
                $entryEntity->nasid = $nasid;
                $this->ApProfileEntries->save($entryEntity);
            }
            
            $id = $entryEntity->id;            
            if($cdata['chk_schedule'] == 1){          	
            	$schedule 	= $this->request->getData('schedules'); 
            	$this->_entry_schedule($id,$schedule);
            }
                  
            $this->set([
                'success' => true
            ]);
        } else {
            $message = 'Error';
            $this->set([
                'errors'    => $this->JsonErrors->entityErros($entryEntity, $message),
                'success'   => false,
                'message'   => __('Could not create item')
            ]);
        }
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function apProfileEntryEdit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $cdata = $this->request->getData();
        $check_items = ['hidden','isolate','apply_to_all','chk_maxassoc','accounting','auto_nasid','chk_schedule','hotspot2_enable','ieee802r','ft_pskgenerate_local','ft_auto_nasid'];
        foreach($check_items as $i){
            if(isset($cdata[$i])){
				if($cdata[$i] == 'null'){
					$cdata[$i] = 0;
				}else{
					$cdata[$i] = 1;
				}  
			}else{
				$cdata[$i] = 0;
			}
        }
        
     	if(isset($cdata['ft_auto_nasid'])){
			if($cdata['ft_auto_nasid'] == 1){
	   			$cdata['auto_nasid'] = $cdata['ft_auto_nasid']; 
			}
		}

        if ($this->request->is('post')) {
        
             //Check if we have to auto gen this nasid
            if($cdata['auto_nasid'] == 1){
                $ssid_underscored = preg_replace('/\s+/', '_', $cdata['name']);
                $ssid_underscored = strtolower($ssid_underscored);
                $ssid_underscored = (strlen($ssid_underscored) > 5) ? substr($ssid_underscored,0,5): $ssid_underscored;//Not longer than 5 chars
                $client_type = '_apeap_';
                if($cdata['encryption'] == 'ppsk'){
                	$client_type = '_apppsk_';
                }
                $cdata['nasid'] = $ssid_underscored.$client_type.$this->request->getData('id');
            }
        
            $entity = $this->{'ApProfileEntries'}->get($cdata['id']);
            $this->{'ApProfileEntries'}->patchEntity($entity, $cdata);
            if ($this->{'ApProfileEntries'}->save($entity)) {
                   $this->set([
                    'success' => true
                ]);
            }
                        
            $id 		= $cdata['id'];            
            if($cdata['chk_schedule'] == 1){         	
            	$schedule 	= $cdata['schedules']; 
            	$this->_entry_schedule($id,$schedule);
            }else{
            	$this->ApProfileEntrySchedules->deleteAll(['ApProfileEntrySchedules.ap_profile_entry_id' => $id]); 
            }                       
            $this->viewBuilder()->setOption('serialize', true);
        } 
    }
   
   
    public function apProfileSsidsView(){  
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }       
        $items          = [];      
        $ap_id          = $this->request->getQuery('ap_id');
        
        $this->loadModel('Aps');
        
        $q_ap = $this->{'Aps'}->find()->where(['id' => $ap_id])->contain(['ApStaticEntryOverrides'])->first();
        if($q_ap){
            $ap_profile_id = $q_ap->ap_profile_id;
        }
        
        
        //Build a lookup table for overrides
        $override_table = [];
        foreach($q_ap->ap_static_entry_overrides as $override){               
            if($override->item == 'ssid'){
                $override_table[$override->ap_profile_entry_id] =  $override->value;  
            }               
        }
        
        $this->loadModel('ApProfileEntries');
        $query  = $this->{'ApProfileEntries'}->find()
                    ->where(['ApProfileEntries.ap_profile_id' => $ap_profile_id])
                    ->contain(['ApProfileEntrySchedules'])
                    ->order(['ApProfileEntries.name']);                   
        $q_r      = $query->all();
        array_push($items,['id' => -1,'name'=> '** ALL SSIDs **','chk_schedule' => false]);
        foreach ($q_r as $i) {
        	$chk_schedule = false;
        	if(count($i->ap_profile_entry_schedules) > 0){
            	$chk_schedule  = true;
            }
            
            $name = $i->name;
            if(isset($override_table[$i->id])){
                $name = $override_table[$i->id];
            }  
                                
            array_push($items,['id' => $i->id,'name'=> $name,'chk_schedule' => $chk_schedule]);
        }
        
        $this->set(array(
            'items'     => $items,
            'success'   => true
        ));
        $this->viewBuilder()->setOption('serialize', true);   
    }

    public function apProfileEntryView(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $id    = $this->request->getQuery('entry_id');
        $q_r   = $this->ApProfileEntries->find()->where(['id' => $id])->first();
        
        if($q_r->macfilter != 'disable'){
            $this->loadModel('PermanentUsers');
            $q = $this->PermanentUsers->find()->where(['id' => $q_r->permanent_user_id])->first();
            if($q){
                $q_r->username = $q->username;
            }else{
                $q_r->username = "!!!User Missing!!!";
            }
        }
        
        $ent_schedules = $this->ApProfileEntrySchedules->find()->where(['ApProfileEntrySchedules.ap_profile_entry_id' => $id])->all(); 
        if(count($ent_schedules)>0){
        	$q_r->chk_schedule = true;
        	$schedule   	= $this->Schedule->getSchedule(30);
        	$new_schedule 	= [];
        	$days	= ['mo','tu','we','th','fr','sa','su'];
        	$currently_off = [];
        	foreach($schedule as $s){
        		//Start with everything 'on'
        		foreach($days as $day){
        			$s[$day] = true;
        		}
        		
        		//Is there some we need to set 'off'?
        		$ent_off = $this->ApProfileEntrySchedules->find()
        			->where(['ApProfileEntrySchedules.ap_profile_entry_id' => $id,'event_time' => $s['begin'],'action' => 'off'])
        			->all();
        		foreach($ent_off as $off){
        			foreach($days as $day){
        				if($off->{$day}){
        					$currently_off[$day]=true; // Add them to the current on list
        				}
        			}
        		}
        		
        		//Is there some that needs to stay off?
        		foreach($days as $day){
        			if(isset($currently_off[$day])){
        				$s[$day] = false;
        			}
        		}
        		
        		//Is there some we need to turn on again
        		$ent_on = $this->ApProfileEntrySchedules->find()
        			->where(['ApProfileEntrySchedules.ap_profile_entry_id' => $id,'event_time' => $s['begin'],'action' => 'on'])
        			->all();
        		foreach($ent_on as $on){
        			foreach($days as $day){
        				if($on->{$day}){
        					$s[$day] = false;
        					unset($currently_off[$day]);
        					$s[$day] = true;
        				}
        			}
        		}
        		       		
        		//See if there is any 'offs' for this slot
        		array_push($new_schedule,$s);       		        		
        	}        	
        	$q_r->schedule = $new_schedule; 
        	       	        	
        }
        
        if($q_r->ft_over_ds){
		   	$q_r->ft_over_ds = 1;
		}else{
		   	$q_r->ft_over_ds = 0;
		} 
           
        $this->set([
            'data'     => $q_r,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function apStaticEntryOverridesView(){
    
        $date = [];
    
        //We send it the ap_profile_entry_id and also ap_id 
        $entry_id   = $this->request->getQuery('ap_profile_entry_id');
        $ap_id      = $this->request->getQuery('ap_id');
        
        $ent_entry = $this->{'ApProfileEntries'}->find()->where(['ApProfileEntries.id' =>$entry_id])->contain(['ApProfileExitApProfileEntries' =>['ApProfileExits']])->first();

        if($ent_entry){
              
            $check      = false;
            $ssid       = '';
            $show_key   = false;
            $key        = '';
            $show_vlan  = false;
            $vlan       = 0;
            
            $ent_exit = $ent_entry->ap_profile_exit_ap_profile_entries[0];
            if(($ent_exit->ap_profile_exit->type == 'tagged_bridge')||($ent_exit->ap_profile_exit->type == 'tagged_bridge_l3')){
                $show_vlan = true;
                $ent_vlan = $this->{'ApStaticEntryOverrides'}->find()->where([
                    'ApStaticEntryOverrides.ap_profile_entry_id' => $entry_id,
                    'ApStaticEntryOverrides.ap_id'               => $ap_id,
                    'ApStaticEntryOverrides.item'                => 'vlan',          
                ])->first();
                
                if($ent_vlan){
                    $vlan = $ent_vlan->value;        
                }    
            }
                        
            if(($ent_entry->encryption == 'wep')||($ent_entry->encryption == 'psk')||($ent_entry->encryption == 'psk2')){
                $show_key = true;
                $ent_key = $this->{'ApStaticEntryOverrides'}->find()->where([
                    'ApStaticEntryOverrides.ap_profile_entry_id' => $entry_id,
                    'ApStaticEntryOverrides.ap_id'               => $ap_id,
                    'ApStaticEntryOverrides.item'                => 'key',          
                ])->first();
                
                if($ent_key){
                    $key = $ent_key->value;        
                }                           
            }            
        
            //ssid            
            $ent_ssid = $this->{'ApStaticEntryOverrides'}->find()->where([
                'ApStaticEntryOverrides.ap_profile_entry_id' => $entry_id,
                'ApStaticEntryOverrides.ap_id'               => $ap_id,
                'ApStaticEntryOverrides.item'                => 'ssid',          
            ])->first();
            
            if($ent_ssid){
                $check = true;
                $ssid = $ent_ssid->value;        
            } 
                           
            $data = [
                'entry_name'            => $ent_entry->name,
                'check'                 => $check,
                'ap_proile_entry_id'    => $entry_id,
                'key'                   => $key,
                'show_key'              => $show_key,
                'vlan'                  => $vlan,
                'show_vlan'             => $show_vlan,
                'ssid'                  => $ssid
            ];
            
        }
    
        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    
    }

    public function apProfileEntryDelete(){

       if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $fail_flag  = false;
        $req_d 		= $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
            $ent_entry       = $this->{'ApProfileEntries'}->find()->where(['ApProfileEntries.id' => $req_d['id']])->first();
            if($ent_entry){
                $this->{'ApProfileEntries'}->delete($ent_entry);        
            }        
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $ent_entry       = $this->{'ApProfileEntries'}->find()->where(['ApProfileEntries.id' => $d['id']])->first();
                if($ent_entry){
                    $this->{'ApProfileEntries'}->delete($ent_entry);        
                } 
            }
        }  
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    //======= AP Profile exits ============
    public function apProfileExitsIndex(){
        $this->loadModel('ApProfileExits');
//        $this->loadModel('ApProfileExitApProfileEntries');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items          = [];
        $total          = 0;
        $ap_profile_id  = $this->request->getQuery('ap_profile_id'); 
        
        if(!$ap_profile_id){
        	$this->set([
		        'items' 	=> [],
		        'success' 	=> true
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);
		    return;     
        }
              
        $add_no_exit    = $this->request->getQuery('add_no_exit');
        
        if($add_no_exit == 'true'){        
            array_push($items, [
                'id'            => 0,
                'ap_profile_id' => $ap_profile_id,
                'type'          => 'no_bridge',
                'connects_with' => []
            ]);       
        }       
        $q_r = $this->ApProfileExits->find()
            ->contain(['ApProfileExitApProfileEntries.ApProfileEntries','FirewallProfiles','SqmProfiles'])
            ->where(['ApProfileExits.ap_profile_id' => $ap_profile_id])
            ->all();

        foreach($q_r as $m){
            $exit_entries = [];

            foreach($m->ap_profile_exit_ap_profile_entries as $m_e_ent){
                if($m_e_ent->ap_profile_entry_id > 0){
                    array_push($exit_entries, ['name' => $m_e_ent->ap_profile_entry->name]);
                }
                if($m_e_ent->ap_profile_entry_id == 0){
                    array_push($exit_entries, ['name' => 'LAN (If Hardware Supports It)']);
                } 
                //OCT 2022
                if(preg_match('/^-9/',$m_e_ent->ap_profile_entry_id)){ 	
                	$dynamic_vlan = $m_e_ent->ap_profile_entry_id;
                	$dynamic_vlan = str_replace("-9","",$dynamic_vlan);
                	array_push($exit_entries, ['name' => "Dynamic VLAN $dynamic_vlan"]);
                
                }
            }
            
            $firewall_profile_name  = 'Unknown Firewall Profile';            
            if($m->apply_firewall_profile){
            	$firewall_profile_name = $m->firewall_profile->name;
            }
            
            $sqm_profile_name  = 'Unknown SQM Profile';            
            if($m->apply_sqm_profile){
            	$sqm_profile_name = $m->sqm_profile->name;
            }

            array_push($items, [
                'id'            => $m->id,
                'ap_profile_id' => $m->ap_profile_id,
                'type'          => $m->type,
                'vlan'          => intval($m->vlan),
                'connects_with' => $exit_entries,
                'apply_firewall_profile' 	=> $m->apply_firewall_profile,
                'firewall_profile_id' 		=> $m->firewall_profile_id,
                'firewall_profile_name'		=> $firewall_profile_name,
                'apply_sqm_profile' 	    => $m->apply_sqm_profile,
                'sqm_profile_id' 		    => $m->sqm_profile_id,
                'sqm_profile_name'		    => $sqm_profile_name
            ]);
        }
        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function apProfileExitAdd(){
        $this->loadModel('ApProfileExitApProfileEntries');
        $this->loadModel('ApProfileExits');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

		$req_d 		= $this->request->getData();
		
		$check_items = [
			'apply_firewall_profile',
			'apply_sqm_profile'
		];       
        foreach($check_items as $i){
	        if(isset($req_d[$i])){
	        	if($req_d[$i] == 'null'){
	            	$req_d[$i] = 0;
	            }else{
	            	$req_d[$i] = 1;
	            }  
	        }else{
	            $req_d[$i] = 0;
	        }
	    }
		
        if($this->request->getData('type') == 'captive_portal'){
            if(null !== $this->request->getData('auto_dynamic_client')){
                $req_d['auto_dynamic_client'] = 1;
                
                //Get a list of realms if the person selected a list - If it is empty that's fine
                $count      = 0;
                $req_d['realm_list'] = ""; //Prime it
                if (array_key_exists('realm_ids', $req_d)) {
                    foreach($this->request->getData('realm_ids') as $r){
                        if($count == 0){
                            $req_d['realm_list'] = $req_d['realm_ids'][$count];
                        }else{
                            $req_d['realm_list'] = $req_d['realm_list'].",".$req_d['realm_ids'][$count];
                        }  
                        $count++;
                    }
                }
                
            }else{
                $req_d['auto_dynamic_client'] = 0;
            }
            
            if(null !== $this->request->getData('auto_login_page')){
                $req_d['auto_login_page'] = 1;
            }else{
                $req_d['auto_login_page'] = 0;
            }
        }
        
        $exitEntity = $this->ApProfileExits->newEntity($req_d);
        
        if ($this->ApProfileExits->save($exitEntity)) {
            $new_id         = $exitEntity->id;
            $ap_profile_id  = $this->request->getData('ap_profile_id');
            
            //---- openvpn_bridge -----
            if($this->request->getData('type') == 'openvpn_bridge'){

                $this->loadModel('OpenvpnServers');
                $this->loadModel('Aps');

                $server_id  = $this->request->getData('openvpn_server_id');
                $q_s        = $this->OpenvpnServers->find()->where(['OpenvpnServers.id' => $server_id])->first();
                $next_ip    = $q_s->vpn_bridge_start_address;

                $q_aps      = $this->Aps->find()->where(['Aps.ap_profile_id' => $ap_profile_id])->all();
 
                //We need to add a VPN entry for all the existing ones so we do not need to add them again
                foreach($q_aps as $ap){
                    $ap_id = $ap->id;
                    $not_available      = true;
                    while($not_available){
                        if($this->_check_if_available($server_id,$next_ip)){
                            $d_vpn_c['ip_address'] = $next_ip;
                            $not_available = false;
                            break;
                        }else{
                            $next_ip = $this->_get_next_ip($next_ip);
                        }
                    }
                    $d_new                      = array();
                    $d_new['mesh_ap_profile']   = 'ap_profile';
                    $d_new['openvpn_server_id'] = $server_id;
                    $d_new['ip_address']        = $next_ip;
                    $d_new['ap_profile_id']     = $ap_profile_id;
                    $d_new['ap_profile_exit_id']= $new_id;
                    $d_new['ap_id']             = $ap->id;
                    
                    $ovpnClientEntity = $this->OpenvpnServerClients->newEntity($d_new);
                    $this->OpenvpnServerClients->save($ovpnClientEntity);
                }
            }
            //---- END openvpn_bridge ------ 

            //===== Captive Portal ==========
            if($this->request->getData('type') == 'captive_portal'){
                $this->loadModel('ApProfileExitCaptivePortals');
                
                $req_d['ap_profile_exit_id'] = $new_id;
				$check_items = [
					'swap_octets',
					'mac_auth',
                    'proxy_enable',
                    'dns_manual',
                    'uamanydns',
                    'dnsparanoia',
                    'dnsdesk',
                    'softflowd_enabled'
				];
			    foreach($check_items as $i){
			        if(isset($req_d[$i])){
						if($req_d[$i] == 'null'){
					    	$req_d[$i] = 0;
					    }else{
					    	$req_d[$i] = 1;
					    }  
					}else{
					    $req_d[$i] = 0;
					}
			    }
			    
			    if($req_d['dns_manual'] == 0){
			        //Clear any values
			        $req_d['dns1'] = '';
			        $req_d['dns2'] = '';
			    }
			    
			    $ent_cp = $this->ApProfileExitCaptivePortals->newEntity($req_d);
			    
			    if(!($this->{'ApProfileExitCaptivePortals'}->save($ent_cp))){
                    $this->{'ApProfileExits'}->delete($entity);
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($ent_cp,$message); 
                    return;
                }
            }
            //==== End of Captive Portal ====
            
            //===== NAT ==========
            //== Remove any existing ApProfileExitSettings ====
            if($this->request->getData('type') == 'nat'){
                $this->loadModel('ApProfileExitSettings');
                $nat_data               = $this->request->getData();
                $ap_profile_exit_id     = $new_id;
            
                if($nat_data['nat_config'] == 'manual'){
                    foreach(array_keys($nat_data) as $key){
                        if(preg_match('/^nat_/',$key)){
                            if($key == 'nat_config'){
                                continue;
                            }
                            if($nat_data[$key] == ''){
                                continue;
                            }
                            $s_data = ['ap_profile_exit_id' => $ap_profile_exit_id,'name'  => $key,'value' => $nat_data[$key]];
                            $s = $this->{'ApProfileExitSettings'}->newEntity($s_data); 
                            $s = $this->{'ApProfileExitSettings'}->save($s);
                        }
                    }   
                }           
            }       
            //==== END NAT ========
            
            
            //===== PPPoE ==========
            if($this->request->getData('type') == 'pppoe_server'){
                $this->loadModel('ApProfileExitPppoeServers');
                $d_ppp  = [
                   'ap_profile_exit_id' => $new_id,
                   'accel_profile_id'   => $req_d['accel_profile_id']         
                ];
                $ent_ppp = $this->{'ApProfileExitPppoeServers'}->newEntity($d_ppp);
                $this->{'ApProfileExitPppoeServers'}->save($ent_ppp);         
            }       
            //==== END PPPoE ========         

            //Add the entry points
            $count      = 0;
            $entry_ids  = [];
                           
            if (array_key_exists('entry_points', $req_d)) {
            	if(is_string($req_d['entry_points'])){ //Modern = string (with commas)
            		if($req_d['entry_points'] !== 'null'){
            			if(str_contains($req_d['entry_points'], ',')) {
		            		$entry_ids = explode(',',$req_d['entry_points']);
		            	}else{		            	
		            		$entry_ids  = [$req_d['entry_points']]; //One item (no comma)
		            	}           		
            		}           	
            	}else{	//Classic = array	            	     
	                foreach($req_d['entry_points'] as $e){
	                    if($e != ''){
	                        array_push($entry_ids,$req_d['entry_points'][$count]);
	                    }
	                    $count++;      
	                }
		      	}
            }         
            
            foreach($entry_ids as $id){	
                $data = [];
                $data['ap_profile_exit_id']  = $new_id;
                $data['ap_profile_entry_id'] = $id;

                $entryPointEntity = $this->ApProfileExitApProfileEntries->newEntity($data);
                $this->ApProfileExitApProfileEntries->save($entryPointEntity);
            }

            $this->set([
                'success' => true
            ]);
        }else{
            $message = 'Error';
            $this->JsonErrors->entityErros($exitEntity, $message);
            return;
        }
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function apProfileExitEdit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if ($this->request->is('post')) {
        
        	$req_d 			= $this->request->getData();
        	$g_check_items 	= [
				'apply_firewall_profile',
				'apply_sqm_profile'
			];
			foreach($g_check_items as $i){
			   	if(isset($req_d[$i])){
					if($req_d[$i] == 'null'){
				    	$req_d[$i] = 0;
				    }else{
				    	$req_d[$i] = 1;
				    }  
				}else{
				    $req_d[$i] = 0;
				}
			}
        	       
            $this->loadModel('ApProfileExitApProfileEntries');
            $this->loadModel('ApProfileExits');
            $this->loadModel('OpenvpnServers');
            
            //---- openvpn_bridge -----
            if($this->request->getData('type') == 'openvpn_bridge'){
                
                //We will only do the following if the selected OpenvpnServer changed
                $q_exit             = $this->ApProfileExits->find()->where(['ApProfileExits' => $this->request->getData('id')]);
                $current_server_id  = $q_exit->openvpn_server_id;
                $server_id          = $this->request->getData('openvpn_server_id');
                $ap_profile_exit_id = $this->request->getData('id');
                
                if($current_server_id !== $server_id){
                    //Update current list 
                    $current_aps = $this->OpenvpnServerClients->find()->where([
                        'OpenvpnServerClients.openvpn_server_id'     => $current_server_id,
                        'OpenvpnServerClients.mesh_ap_profile'       => 'ap_profile',
                        'OpenvpnServerClients.ap_profile_exit_id'    => $ap_profile_exit_id,

                    ])->all();

                    $q_r        = $this->OpenvpnServers->find()->where(['id' => $server_id])->first();
                        
                    foreach($current_aps as $ap){
                        $next_ip            = $q_r->vpn_bridge_start_address;

                        $not_available      = true;
                        while($not_available){
                            if($this->_check_if_available($server_id,$next_ip)){
                                $d_vpn_c['ip_address'] = $next_ip;
                                $not_available = false;
                                break;
                            }else{
                                $next_ip = $this->_get_next_ip($next_ip);
                            }
                        }      
                        //Update the record
                        $d_apdate                       = [];
                        $d_update['id']                 = $ap->id;
                        $d_update['openvpn_server_id']  = $server_id;
                        $d_update['ip_address']         = $next_ip;

                        $dUpdateEntity = $this->OpenvpnServerClients->newEntity($d_apdate);
                        $this->OpenvpnServerClients->save($dUpdateEntity);
                    }          
                }            
            }
            //---- END openvpn_bridge ------
            

            //===== Captive Portal ==========
            //== First see if we can save the captive portal data ====
            if($this->request->getData('type') == 'captive_portal'){
            
                $this->loadModel('ApProfileExitCaptivePortals');
                $cp_data                = $req_d;
                $ap_profile_exit_id     = $this->request->getData('id');
                $ent_cp                 = $this->ApProfileExitCaptivePortals->find()
                    ->where(['ApProfileExitCaptivePortals.ap_profile_exit_id' => $ap_profile_exit_id])
                    ->first();

                if($ent_cp){
                    $cp_id          = $ent_cp->id;
                    $cp_data['id']  = $cp_id;

					$check_items = [
						'swap_octets',
						'mac_auth',
                        'proxy_enable',
                        'dns_manual',
                        'uamanydns',
                        'dnsparanoia',
                        'dnsdesk',
                        'softflowd_enabled'
					];
					foreach($check_items as $i){
						 if(isset($req_d[$i])){
							if($req_d[$i] == 'null'){
								$cp_data[$i] = 0;
							}else{
								$cp_data[$i] = 1;
							}  
						}else{
							$cp_data[$i] = 0;
						}
					}
					
					if( $cp_data['dns_manual'] == 0){
			            //Clear any values
			            $cp_data['dns1'] = '';
			            $cp_data['dns2'] = '';
			        }

                   // print_r($cp_data);
                   $this->{'ApProfileExitCaptivePortals'}->patchEntity($ent_cp, $cp_data);
                   
                   if(!($this->{'ApProfileExitCaptivePortals'}->save($ent_cp))){
                        $message = __('Could not update item');
                        $this->JsonErrors->entityErros($ent_cp,$message); 
                        return;
                    }
                }
            }
            //==== End of Captive Portal ====
            
            //===== NAT ==========
            //== Remove any existing ApProfileExitSettings ====
            if($this->request->getData('type') == 'nat'){
                $this->loadModel('ApProfileExitSettings');
                $nat_data               = $this->request->getData();
                $ap_profile_exit_id     = $nat_data['id'];
            
                $settings = $this->{'ApProfileExitSettings'}->find()
                    ->where(['ApProfileExitSettings.ap_profile_exit_id' => $ap_profile_exit_id])
                    ->all();
                foreach($settings as $s){
                    if(preg_match('/^nat_/',$s->name)){
                        $this->{'ApProfileExitSettings'}->delete($s);
                    }
                }
            
                if($nat_data['nat_config'] == 'manual'){
                    foreach(array_keys($nat_data) as $key){
                        if(preg_match('/^nat_/',$key)){
                            if($key == 'nat_config'){
                                continue;
                            }
                            if($nat_data[$key] == ''){
                                continue;
                            }
                            $s_data = ['ap_profile_exit_id' => $ap_profile_exit_id,'name'  => $key,'value' => $nat_data[$key]];
                            $s = $this->{'ApProfileExitSettings'}->newEntity($s_data); 
                            $s = $this->{'ApProfileExitSettings'}->save($s);
                        }
                    }   
                }           
            }       
            //==== END NAT ========
                     
            //===== PPPoE ==========
            if($this->request->getData('type') == 'pppoe_server'){
                $this->loadModel('ApProfileExitPppoeServers');
                $ent_ppp = $this->{'ApProfileExitPppoeServers'}->deleteAll(['ApProfileExitPppoeServers.ap_profile_exit_id' => $req_d['id']]);
                $d_ppp  = [
                   'ap_profile_exit_id'     => $req_d['id'],
                   'accel_profile_id'       => $req_d['accel_profile_id']         
                ];
                $ent_ppp = $this->{'ApProfileExitPppoeServers'}->newEntity($d_ppp);
                $this->{'ApProfileExitPppoeServers'}->save($ent_ppp);         
            }       
            //==== END PPPoE ========                    
            
            $req_d['realm_list'] = ""; //Prime it
            
            if($this->request->getData('type') == 'captive_portal'){
                if(null !== $this->request->getData('auto_dynamic_client')){
                    $req_d['auto_dynamic_client'] = 1;
                    
                    //Get a list of realms if the person selected a list - If it is empty that's fine
                    $count      = 0;
                    if (array_key_exists('realm_ids', $req_d)) {
                        foreach($this->request->getData('realm_ids') as $r){
                            if($count == 0){
                                $req_d['realm_list'] = $req_d['realm_ids'][$count];
                            }else{
                                $req_d['realm_list'] = $req_d['realm_list'].",".$req_d['realm_ids'][$count];
                            }  
                            $count++;
                        }
                    }   
                    
                }else{
                    $req_d['auto_dynamic_client'] = 0;
                }
                
                if(null !== $this->request->getData('auto_login_page')){
                    $req_d['auto_login_page'] = 1;
                }else{
                    $req_d['auto_login_page'] = 0;
                }
            }
            
            $ent_exit = $this->{'ApProfileExits'}->get($req_d['id']);
            $this->{'ApProfileExits'}->patchEntity($ent_exit, $req_d);
            
            // If the form data can be validated and saved..
            if ($this->{'ApProfileExits'}->save($ent_exit)) {

                //Add the entry points
                $count      = 0;
                $entry_ids  = [];
                $new_id     = $this->request->getData('id');

                //Clear previous ones first:
                $this->{'ApProfileExitApProfileEntries'}->deleteAll(['ApProfileExitApProfileEntries.ap_profile_exit_id' => $new_id]);

                if (array_key_exists('entry_points', $req_d)) {
		        	if(is_string($req_d['entry_points'])){ //Modern = string (with commas)
		        		if($req_d['entry_points'] !== 'null'){
		        			if(str_contains($req_d['entry_points'], ',')) {
				        		$entry_ids = explode(',',$req_d['entry_points']);
				        	}else{		            	
				        		$entry_ids  = [$req_d['entry_points']]; //One item (no comma)
				        	}           		
		        		}           	
		        	}else{	//Classic = array	            	     
			            foreach($req_d['entry_points'] as $e){
			                if($e != ''){
			                    array_push($entry_ids,$req_d['entry_points'][$count]);
			                }
			                $count++;      
			            }
				  	}
		        }            

                foreach($entry_ids as $id){
					$data = [];
                    $data['ap_profile_exit_id']  = $new_id;
                    $data['ap_profile_entry_id'] = $id;

                    $entryPointEntity = $this->ApProfileExitApProfileEntries->newEntity($data);
                    $this->ApProfileExitApProfileEntries->save($entryPointEntity);
                }

                $this->set([
                    'success' => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            }else{
            
                $message = 'Error';
                $this->JsonErrors->entityErros($ent_exit, $message);
                return;
            
            }
        } 
    }
    
    public function apProfileExitAddDefaults(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }    
        $data = [];
        $this->loadModel('UserSettings');   
        $q_r = $this->{'UserSettings'}->find()->where(['user_id' => -1])->all();
        if($q_r){
            foreach($q_r as $s){
                //ALL Captive Portal Related default settings will be 'cp_<whatever>'
                if(preg_match('/^cp_/',$s->name)){
                    $name           = preg_replace('/^cp_/', '', $s->name);
                    $data[$name]    = $s->value;     
                }
            
            }
        }
        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function apExperimentalCheck(){
        Configure::load('RadiusDesk'); 
        $active = Configure::read('experimental.active'); //Read the defaults
        $this->set([
            'active'     => $active,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function apProfileExitView(){
        $this->loadModel('ApProfileExits');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $id    = $this->request->getQuery('exit_id');

        $q_r   = $this->ApProfileExits->find()->contain([
            'ApProfileExitApProfileEntries',
            'ApProfileExitCaptivePortals',
            'DynamicDetails',
            'ApProfileExitSettings',
            'ApProfileExitPppoeServers'
        ])->where(['ApProfileExits.id' => $id])->first();

        //Get the realm list
        if($q_r->realm_list != ''){
            $q_r['realm_records'] = [];
            $q_r['realm_ids'] = [];

            $this->loadModel('Realms');

            if($q_r->realm_list){
                $pieces = explode(",", $q_r->realm_list);

                foreach($pieces as $p){
                    if(is_numeric($p)){
                        //Get the name and id of this realm
                        $q_realm = $this->Realms->find()->where(['Realms.id' => $p])->first();
                        if($q_realm){
                            $r_name = $q_realm->name;
                            array_push($q_r['realm_records'], ['id' => $p, 'name' => $r_name]);
                            array_push($q_r['realm_ids'],$p);
                        }
                    }
                }
            }
        }
        
        //entry_points
        $q_r['entry_points'] = [];

        foreach($q_r->ap_profile_exit_ap_profile_entries as $i){
            array_push($q_r['entry_points'],intval($i->ap_profile_entry_id));
        }

        if($q_r->ap_profile_exit_captive_portal){
        
            $this->loadModel('ApProfileExitCaptivePortals');
            $fields     = $this->{'ApProfileExitCaptivePortals'}->getSchema()->columns();
            foreach($fields as $item){
            	if($item !== 'id'){
                	$q_r["$item"] = $q_r->ap_profile_exit_captive_portal->{"$item"};
               	}
            }
            
            //Upstream VLAN id (if applicable)
            if($q_r->ap_profile_exit_captive_portal->ap_profile_exit_upstream_id){
                $q_r['ap_profile_exit_upstream_id'] = $q_r->ap_profile_exit_captive_portal->ap_profile_exit_upstream_id;
            }else{
                $q_r['ap_profile_exit_upstream_id'] = 0;
            }

        }
        
        if($q_r->ap_profile_exit_pppoe_server){
            $q_r['accel_profile_id'] =   $q_r->ap_profile_exit_pppoe_server->accel_profile_id;   
        }  
        
        
        if($q_r->dynamic_detail){
           $q_r['dynamic_detail'] =  $q_r->dynamic_detail->name;
        }
        $q_r->rb_nat_config = ['nat_config' =>'auto']; 
        foreach($q_r->ap_profile_exit_settings as $s){
            $q_r->rb_nat_config = ['nat_config' =>'manual'];    
            $q_r->{$s->name}    = $s->value;
        }
        
        $data = $q_r;
        
        unset($data->ap_profile_exit_settings);

        $this->set([
            'data'     => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function apProfileExitUpstreamList(){
        $this->loadModel('ApProfileExits');

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $id     = $this->request->getQuery('ap_profile_id');

        $exit_q_r  = $this->ApProfileExits->find()->where([
            'ApProfileExits.ap_profile_id'   => $id,
            'ApProfileExits.type'            => 'tagged_bridge_l3',
        ])->all();

        $items  = [
            ['name'=> 'LAN (Ethernet0)', 'id' => 0 ]
        ];
        
        foreach($exit_q_r as $i){
            //print_r($i);
            array_push($items,['name' => "VLAN ".$i->vlan, 'id' => intval($i->id)]);
        }
        
        $this->set([
            'items'     => $items,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function apProfileExitDelete(){
        $this->loadModel('ApProfileExits');

       if (! $this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $fail_flag  = false;
        $req_d 		= $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
            $message = "Single item ".$req_d['id'];

            $id     = $req_d['id'];
            $q_r    = $this->ApProfileExits->find()->contain(['ApProfiles'])->where(['ApProfileExits.id' => $req_d['id']])->first();

            if($q_r){
                if($q_r->type == 'captive_portal'){
                    $ap_profile_name    = $q_r->ap_profile->name;
                    $ap_profile_name    = preg_replace('/\s+/', '_', $ap_profile_name);

                    $this->DynamicClients->deleteAll(['DynamicClients.nasidentifier LIKE' => "%_cp_".$id]);

                    $this->DynamicPairs->deleteAll([
                        'DynamicPairs.value LIKE' => "%_cp_".$id,
                        'DynamicPairs.name' => 'nasid',
                    ]);
                }              
                $this->ApProfileExits->delete($q_r); // Go delete yourself!
            }     

        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $id                 = $d['id'];
                $q_r                = $this->ApProfileExits->find()->contain(['ApProfiles'])->where(['ApProfileExits.id' => $d['id']])->first();
                if($q_r){
                    if($q_r->type == 'captive_portal'){
                        $ap_profile_name    = $q_r->ap_profile->name;
                        $ap_profile_name    = preg_replace('/\s+/', '_', $ap_profile_name);
                        $this->DynamicClients->deleteAll(['DynamicClients.nasidentifier LIKE' => "%_cp_".$id]);
                        $this->DynamicPairs->deleteAll([
                            'DynamicPairs.value LIKE' => "%_cp_".$id,
                            'DynamicPairs.name' => 'nasid',
                        ]);
                    }
                    $this->ApProfileExits->delete($q_r); // Go delete yourself!
                }
            }
        }  
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function apProfileEntryPoints(){
        $this->loadModel('ApProfileExits');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        //Get the ap profile id
        $ap_profile_id    = $this->request->getQuery('ap_profile_id');

        $exit_id = false;

        //Check if the exit_id was included
        if(null !== $this->request->getQuery('exit_id')){
            $exit_id = $this->request->getQuery('exit_id');
        }

        $ent_q_r    = $this->ApProfileEntries->find()->contain(['ApProfileExitApProfileEntries'])->where(['ApProfileEntries.ap_profile_id' => $ap_profile_id])->all();
        //print_r($ent_q_r);

        $items = [];

        foreach($ent_q_r as $i){

            //If this entry point is already associated; we will NOT add it
            if(count($i->ap_profile_exit_ap_profile_entries) == 0){
                $id = intval($i->id);
                $n  = $i->name;
                array_push($items, ['id' => $id, 'name' => $n]);
            }

            //if $exit_id is set; we add it 
            if($exit_id){
                if(count($i->ap_profile_exit_ap_profile_entries) > 0){
                    if($i->ap_profile_exit_ap_profile_entries[0]->ap_profile_exit_id == $exit_id){
                        $id = intval($i->id);
                        $n  = $i->name;
                        array_push($items, ['id' => $id, 'name' => $n]);
                    }
                }
            }
        }
        
        //Eth1 check
        $this->loadModel('ApProfileExitApProfileEntries');

        $q_eth1_entry = $this->ApProfileExitApProfileEntries->find()->contain(['ApProfileExits'])->where([
            'ApProfileExits.ap_profile_id' => $ap_profile_id,
            'ApProfileExitApProfileEntries.ap_profile_entry_id' => 0
        ])->first();
        
        if($q_eth1_entry){
            //Only if it is for this exit
            if($q_eth1_entry->ap_profile_exit_id == $exit_id){
                array_push($items, ['id' => 0, 'name' => "LAN (If Hardware Suports It)"]);
            }   
        }else{
            array_push($items, ['id' => 0, 'name' => "LAN (If Hardware Suports It)"]); //Allow the user not to assign at this stage
        }
        
        //==Oct 2022 Add support for Dynamic VLANs==
        $ap_s = $this->{'ApProfileSettings'}->find()->where(['ApProfileSettings.ap_profile_id' => $ap_profile_id])->first();
        if($ap_s){
		    if($ap_s->vlan_enable == 1){
		    	//Find out the list of vlans.
		    	if($ap_s->vlan_range_or_list == 'range'){
		    		$start 	= $ap_s->vlan_start;
		    		$end 	= $ap_s->vlan_end;
		    		while($start <= $end){
		    			$vlan_id = intval('-9'.$start);
		    			        			
		    			array_push($items, ['id' => $vlan_id, 'name' => "Dynamic VLAN $start"]); //Allow the user not to assign at this stage
		    			$start++;
		    		}        		
		    	}
		    	if($ap_s->vlan_range_or_list == 'list'){
		    		$list 	= $ap_s->vlan_list;
		    		$pieces = explode(",", $list);
		    		foreach($pieces as $p){
		    			$vlan_id = intval('-9'.$p);        			
		    			array_push($items, ['id' => $vlan_id, 'name' => "Dynamic VLAN $p"]); //Allow the user not to assign at this stage
		    		}        		
		    	}       
		    }
		}
        //==END OCT 2022 ADD ON===
                      
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function  apProfileSettingsView(){   
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $data 	= [];
        $req_q  = $this->request->getQuery();

        $id = $req_q['ap_profile_id'];         
        $q  = $this->{'ApProfiles'}->find()->where(['ApProfiles.id' => $id ])->first(); 
        
        if($q){
            $data['name']                   = $q->name;
            $data['enable_alerts']          = $q->enable_alerts;
            $data['enable_overviews']       = $q->enable_overviews;        
        }
        
        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function apProfileSettingsEdit(){
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $user_id    = $user['id'];        
        $cdata 		= $this->request->getData();      
        $check_items = [
			'enable_overviews',
			'enable_alerts'		
		];
		
		foreach($check_items as $i){
			if(isset($cdata[$i])){
				if($cdata[$i] == 'null'){
			    	$cdata[$i] = 0;
			    }else{
			    	$cdata[$i] = 1;
			    }  
			}else{
			    $cdata[$i] = 0;
			}
        }
         
        if ($this->request->is('post')) {
            $e = $this->{$this->main_model}->get($cdata['ap_profile_id']);        
            $this->{$this->main_model}->patchEntity($e, $cdata);
            if($this->{$this->main_model}->save($e)){
                $this->set([
                    'success' => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);           
            }else{
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($e,$message);  
            }
        } 
    }
    
    
    //====== Common AP settings ================
    //-- View common ap settings --
    public function apCommonSettingsView(){
        $this->loadModel('ApProfileSettings');

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $id     = $this->request->getQuery('ap_profile_id');
        $data   = $this->_getCommonSettings();
        $q_r    = $this->ApProfileSettings->find()->where(['ApProfileSettings.ap_profile_id' => $id])->contain(['Schedules'])->first();

        if($q_r){  
            //print_r($q_r);
            $data = $q_r;
            //We need to find if possible the number for the timezone
            $ent_tz  = $this->{'Timezones'}->find()->where(['Timezones.name' => $q_r->tz_name])->first();
            if($ent_tz){
                $data['timezone']   = $ent_tz->id;
            }
            if($data['schedule_id'] !== null){
                $data['schedule_name'] = $data->schedule->name;
            }    
        }

        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    private function _getCommonSettings(){
        Configure::load('ApProfiles'); 
        $data       = Configure::read('common_ap_settings'); //Read the defaults
        
        $this->loadModel('UserSettings');
        $want_these = ['password','country','timezone','heartbeat_dead_after'];          
        $q_r   = $this->{'UserSettings'}->find()->where(['user_id' => -1])->all();
        if($q_r){
            foreach($q_r as $s){
            
            	//ALL Report Adv Related default settings will be 'report_adv_<whatever>'
                if(preg_match('/^report_adv_/',$s->name)){
                    $data[$s->name]    = $s->value;     
                }
                
                if($s->name == 'password'){
                    $data[]         = $s->value;
                    $data['password_hash']  = $this->_make_linux_password($s->value);   
                }
                
                if($s->name == 'country'){
                    $data[$s->name]  = $s->value;
                } 
                if($s->name == 'heartbeat_dead_after'){
                    $data[$s->name]  = $s->value;
                } 
                if($s->name == 'timezone'){
                    $data[$s->name]  = $s->value;
                    $ent_tz = $this->{'Timezones'}->find()->where(['Timezones.id' => $s->value])->first();
                    if($ent_tz){
                        $data['tz_name'] = $ent_tz->name;
                        $data['tz_value']= $ent_tz->value;
                    }
                }
            }
        }
        return $data;
    }
    
    public function apCommonSettingsEdit(){
        $this->loadModel('ApProfileSettings');

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $cdata = $this->request->getData();

        if ($this->request->is('post')) {

            $check_items = ['gw_use_previous','gw_auto_reboot','enable_schedules','vlan_enable'];
            foreach($check_items as $i){
                if(isset($cdata[$i])){
					if($cdata[$i] == 'null'){
						$cdata[$i] = 0;
					}else{
						$cdata[$i] = 1;
					}  
				}else{
					$cdata[$i] = 0;
				}
            }

            //Try to find the timezone and its value
            $tz_id  = $this->request->getData('timezone');
            $ent_tz = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
            if($ent_tz){
                    $cdata['tz_name'] = $ent_tz->name;
                    $cdata['tz_value']= $ent_tz->value;
            }
            
            $new_pwd = $this->_make_linux_password($this->request->getData('password'));
		    $cdata['password_hash'] = $new_pwd;
                 
            $ap_profile_id = $this->request->getData('ap_profile_id');

            //See if there is not already a setting entry
            $ent_setting    = $this->ApProfileSettings->find()->where(['ApProfileSettings.ap_profile_id' => $ap_profile_id])->first();
            
            if($ent_setting){
			    $this->{'ApProfileSettings'}->patchEntity($ent_setting,$cdata);
            }else{ //There was no settings entry so we need to create a new one
                $ent_setting = $this->{'ApProfileSettings'}->newEntity($cdata);
            }    
            
            if ( $this->ApProfileSettings->save($ent_setting)) {
                   $this->set([
                    'success' => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            }
        }
    }
    
    //=== APs Special ====
     public function advancedSettingsForModel(){
        $data   = [];
        $model  = $this->request->getQuery('model');
        $cdata  = $this->request->getQuery();
        $no_overrides = true;

        //Check if there is a ap_id in the request and if so check the current hardware type
        //If the same as the model requested, check if we have overrides
        if(array_key_exists('ap_id', $cdata)){
            $ap_id = $this->request->getQuery('ap_id');
            $this->loadModel('Aps');    
            $q_r  = $this->Aps->find()
                ->contain(['ApWifiSettings'])
                ->where(['Aps.id' => $ap_id,'Aps.hardware' => $model])->first(); //It has to match the id and the model else the person actually selected another model
            if($q_r){
                $q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
                $data['radio_count'] = $q_e->radio_count;
                if(count($q_r->ap_wifi_settings) > 0){
                    $no_overrides = false;
                    foreach($q_r->ap_wifi_settings as $s){ 
                        $s_name     = $s->name;
                        $s_value    = $s->value;
                        
                        if(preg_match('/^radio\d+_ht_capab/',$s_name)){
                            if($s_value !== ''){
                                if(isset($data["$s_name"])){
                                    $data["$s_name"] = $data["$s_name"]."\n".$s_value;
                                }else{
                                    $data["$s_name"] = $s_value;
                                }
                            }
                        }else{
                             
                            //Small fix to make boolean from string....
                            if($s_value == 'false'){
                                $s_value = false;
                            }
                            if($s_value == 'true'){
                                $s_value = true;
                            }
                            if($s_value == 'on'){
                                $s_value = true;
                            }
                            $data["$s_name"] = $s_value;
                        }
                    }
                }
            }
        }
             
        if($no_overrides){
            $radio_fields = [
                'disabled','band','mode','width','txpower'
            ];    
            $data   = [];
            
            $data['radio_count'] =0;
            $req_q    = $this->request->getQuery(); 
            
            if(isset($req_q['model'])){
                $model = $req_q['model'];
                $q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
                if($q_e){
                    $data['radio_count'] = $q_e->radio_count;
                    foreach($q_e->hardware_radios as $hr){    
                        $radio_number   = $hr->radio_number;
                        foreach($radio_fields as $fr){
                            $data['radio'.$radio_number.'_'.$fr] = $hr[$fr];
                        }  
                    }
                } 
            }
        }
       
        $this->set([
            'data' => $data,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function staticEntryOptions(){
        $this->loadModel('ApProfileEntries');

        $user = $this->Aa->user_for_token($this);
        if(!$user){   
            return;
        }

        $where = ['ApProfileEntries.apply_to_all' => 0];

        if(null !== $this->request->getQuery('ap_profile_id')){
            $ap_profile_id = $this->request->getQuery('ap_profile_id');
            array_push($where,['ApProfileEntries.ap_profile_id' => $ap_profile_id]);
        }

        $q_r    = $this->ApProfileEntries->find()->where($where)->all();

        $items = [];
        foreach($q_r as $i){
            $id = $i->id;
            $n  = $i->name;
            array_push($items,['id' => $id, 'name' => $n]);
        }

        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    //=== APs CRUD ===
    public function apProfileApIndex(){

        $geo_data   = Configure::read('paths.geo_data');
        $reader     = new Reader($geo_data);

        $this->loadModel('Aps');
        $this->loadModel('ApProfileSettings');

        $user = $this->_ap_right_check();

        if(!$user){
            return;
        }

        $items          = [];
        $total          = 0;
        $ap_profile_id  = $this->request->getQuery('ap_profile_id');
        
        $conditions     = ['Aps.ap_profile_id' => $ap_profile_id];      
        $c_filter       = $this->CommonQueryFlat->get_filter_conditions('Aps');
        
        $conditions     = array_merge($conditions,$c_filter);
        $query          = $this->Aps->find(); 
        
        if($this->request->getQuery('sort')){
            $sort = $this->request->getQuery('sort');
            $dir  = $this->request->getQuery('dir');
            $query->order([$sort => $dir]);   
        }                
        $q_r   = $query->where($conditions)->all();

        //Create a hardware lookup for proper names of hardware
        $hardware = [];
	    $q_hw = $this->{'Hardwares'}->find()->where(['Hardwares.for_ap' => true])->all();
        if($q_hw){
            foreach($q_hw as $hw){
                $id     = $hw->fw_id;
                $name   = $hw->name; 
                $hardware["$id"]= $name;
            }
        }

        foreach($q_r as $m){

            $m->last_contact_human = '';

            if($m->last_contact != null){
                $m->last_contact_human  = $this->TimeCalculations->time_elapsed_string($m->last_contact);
            }

            //----              
            //Some defaults:
            $country_code   = '';
            $country_name  = '';
            $city           = '';
            $postal_code    = '';
            $state_name     = '';
            $state_code     = '';
            
            if($m->last_contact_from_ip != null){

                try {
                    $location = $reader->city($m->last_contact_from_ip);
                } catch (\Exception $e) {
                    //Do Nothing
                }

                if(! empty($location)){
                    if($location->country->isoCode != ''){
                        $country_code = $location->country->isoCode;
                    }
                    if($location->country->name != ''){
                        $country_name = $location->country->name;
                    }
                    if($location->city->name != ''){
                        $city = $location->city->name;
                    }
                    if($location->postal->code != ''){
                        $postal_code = $location->postal->code;
                    }
                    if($location->mostSpecificSubdivision->name != ''){
                        $state_name = $location->mostSpecificSubdivision->name;
                    }
                    if($location->mostSpecificSubdivision->isoCode != ''){
                        $state_code = $location->mostSpecificSubdivision->isoCode;
                    }
                }
            }   
            //----    

            array_push($items, [
                'id'                    => $m->id,
                'ap_profile_id'         => $m->ap_profile_id,
                'name'                  => $m->name,
                'description'           => $m->description,
                'mac'                   => $m->mac,
                'hardware'	            => $m->hardware,
                'hw_human'              => $hardware["$m->hardware"],
                'last_contact_from_ip'	=> $m->last_contact_from_ip,
                'on_public_maps'	    => $m->on_public_maps,
				'last_contact'	        => $m->last_contact,
				"last_contact_human"    => $m->last_contact_human,
				'lat'			        => $m->lat,
				'lng'			        => $m->lon,
				'photo_file_name'	    => $m->photo_file_name,
				'country_code'          => $country_code,
                'country_name'          => $country_name,
                'city'                  => $city,
                'postal_code'           => $postal_code,
            ]);
        }
        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function apProfileApAdd(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $cdata = $this->request->getData();
        //Unset the id
        unset($cdata['id']); //Remove the ID which is set to 0 (Zero) for ADD actions
        
        //TreeTag we now use network_id
        if(isset($cdata['network_id'])){
            $network_id     = $cdata['network_id']; //Will be in format Network_<id>
            $tree_tag_id    =  preg_replace('/^(\w+)_/', '', $network_id);//Then we use that value to populate the tree tag
            $cdata['tree_tag_id'] = $tree_tag_id;
        }
        
        $check_items = [
		    'enable_overviews',
		    'enable_alerts'		
	    ];
	    
	    foreach($check_items as $i){
            if(isset($cdata[$i])){
				if($cdata[$i] == 'null'){
			    	$cdata[$i] = 0;
			    }else{
			    	$cdata[$i] = 1;
			    }  
			}else{
			    $cdata[$i] = 0;
			}
        }
        
        //Set the reboot flag when add
	    $cdata['reboot_flag'] = 1;	
        
        
        $this->loadModel('Aps');
        $this->loadModel('ApProfileSettings');
        $this->loadModel('ApProfileExits');
        $this->loadModel('OpenvpnServerClients');
        $this->loadModel('ApWifiSettings');
        $this->loadModel('ApConnectionSettings');


        //Get the ApProfile so we can get the cloud_id  for the said ap_profile
        $ap_profile_id  = $this->request->getData('ap_profile_id');

        $ap_profile     = $this->{$this->main_model}->find()->where(['ApProfiles.id' => $ap_profile_id])->first();
        $cloud_id       = $ap_profile->cloud_id;
        $ap_profile_name= $ap_profile->name;
        $ap_profile_name= preg_replace('/\s+/', '_', $ap_profile_name);
        
        $apEntity = $this->Aps->newEntity($cdata);

        if ($this->Aps->save($apEntity)) {

            $new_id = $apEntity->id;
            
            //Delete regardless - it might be there it might be not
	        $this->loadModel('UnknownNodes');
		    $mac = $this->request->getData('mac');
            $this->UnknownNodes->deleteAll(['UnknownNodes.mac' => $mac]);

			
			//__ OpenVPN Bridges _____
			$q_e_vpnb = $this->ApProfileExits->find()->contain(['OpenvpnServers'])->where([
                'ApProfileExits.ap_profile_id'   => $ap_profile_id,
                'ApProfileExits.type'            => 'openvpn_bridge',
            ])->all();
		    
		    foreach($q_e_vpnb as $e){
		        //Get the OpenvpnServer's detail of reach
		        $vpn_server_id  = $e->openvpn_server->id;
		        $exit_id        = $e->id;
		        
		        $d_vpn_c                        = [];
                $d_vpn_c['mesh_ap_profile']     = 'ap_profile';
                $d_vpn_c['openvpn_server_id']   = $vpn_server_id;
                $d_vpn_c['ap_profile_id']       = $ap_profile_id;
                $d_vpn_c['ap_profile_exit_id']  = $exit_id;
                $d_vpn_c['ap_id']               = $new_id;
            
                $next_ip        = $e->openvpn_server->vpn_bridge_start_address;
                $not_available  = true;
                
                while($not_available){
                    if($this->_check_if_available($vpn_server_id,$next_ip)){
                        $d_vpn_c['ip_address'] = $next_ip;
                        $not_available = false;
                        break;
                    }else{
                        $next_ip = $this->_get_next_ip($next_ip);
                    }
                }

                $ovpnServerClientEntity = $this->OpenvpnServerClients->newEntity($d_vpn_c);
                $this->OpenvpnServerClients->save($ovpnServerClientEntity);
		    }	
			//__ END OpenVPN Bridges ___
			
			
			//______________________________________________________________________			
	        //We need to see if there are captive portals defined on the ap_profile
	        //_______________________________________________________________________

	        $q_exits = $this->{$this->main_model}->ApProfileExits->find()->contain(['ApProfileExitCaptivePortals'])->where([
                'ApProfileExits.ap_profile_id'   => $ap_profile_id,
                'ApProfileExits.type'            => 'captive_portal'
            ])->all();

	        foreach($q_exits as $qe){
	            	        
	            $exit_id = $qe->id;
	            
	            $name_no_spaces = $this->request->getData('name');
	            $name_no_spaces = preg_replace('/\s+/', '_', $name_no_spaces);          
	            $dc_data                    = [];
	            $dc_data['cloud_id']        = $cloud_id;
	            $dc_data['name'] 			= 'APdesk_'.$ap_profile_name.'_'.$name_no_spaces.'_cp_'.$exit_id;
	            $dc_data['nasidentifier']   = 'ap_'.$new_id.'_cp_'.$exit_id;
	            $dc_data['realm_list']     	= $qe->realm_list;
	            $dc_data['type']            = 'CoovaMeshdesk';
	            
	            if($qe->auto_dynamic_client == 1){  //It has to be enabled
	                $this->_add_dynamic($dc_data);
	            }
	            
	            if($qe->auto_login_page == 1){  //It has to be enabled
	                $dc_data['dynamic_detail_id'] = $qe->dynamic_detail_id;
	                $this->_add_dynamic_pair($dc_data);
	            }
	        }
	        //_______________________________________________________________________
	        
	        //vlan_admin settings                       
            if($this->request->getData('vlan_admin') !== ''){
            	$d_vlan = [];
                $d_vlan['ap_id']   	= $new_id;
                $d_vlan['grouping'] = 'vlan_setting';
                $d_vlan['name']     = 'vlan_admin';
                $d_vlan['value']    = $this->request->getData('vlan_admin');
                $ent_vlan = $this->{'ApConnectionSettings'}->newEntity($d_vlan);  
                $this->{'ApConnectionSettings'}->save($ent_vlan);                        
            } 
	        	        
	        if($this->request->getData('internet_connection') == 'wifi'){
                foreach(array_keys($cdata) as $key){
                    if(preg_match('/^wbw_/',$key)){
                        //If it comes from the auto cp it will have wbw_freq whech we have to determine based on the hardware if it will be radio0 or radio1
                        //If it comes from the GUI it will have wbw_device
                        if($key == 'wbw_freq'){
                            $freq       = $cdata["$key"];
                            $key        = 'wbw_device'; //We replace wbw_freq with wbw_device
                            $hardware   = $cdata['hardware'];
                            $device     = 'radio'.$this->_get_radio_for($hardware,$freq); 
                            $cdata["$key"] = $device;
                        }
                    
                        $d_wbw = [];
                        $d_wbw['ap_id']      = $new_id;
                        $d_wbw['grouping']   = 'wbw_setting';
                        $d_wbw['name']       = preg_replace('/^wbw_/', '', $key);
                        $d_wbw['value']      = $cdata["$key"];
                                        
                        $ent_wbw = $this->{'ApConnectionSettings'}->newEntity($d_wbw);  
                        $this->{'ApConnectionSettings'}->save($ent_wbw);    
                    }
                }  
            }
            
            if($this->request->getData('internet_connection') == 'wan_static'){
                foreach(array_keys($cdata) as $key){
                    if(preg_match('/^wan_static_/',$key)){
                        $d_ws = [];
                        $d_ws['ap_id']      = $new_id;
                        $d_ws['grouping']   = 'wan_static_setting';
                        $d_ws['name']       = preg_replace('/^wan_static_/', '', $key);
                        $d_ws['value']      = $cdata["$key"];
                        $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                        $this->{'ApConnectionSettings'}->save($ent_ws);    
                    }
                }               
            }
            
            if($this->request->getData('internet_connection') == 'wan_pppoe'){
                foreach(array_keys($cdata) as $key){
                    if(preg_match('/^wan_pppoe_/',$key)){
                        $d_ws = [];
                        $d_ws['ap_id']      = $new_id;
                        $d_ws['grouping']   = 'wan_pppoe_setting';
                        $d_ws['name']       = preg_replace('/^wan_pppoe_/', '', $key);
                        $d_ws['value']      = $cdata["$key"];
                        $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                        $this->{'ApConnectionSettings'}->save($ent_ws);    
                    }
                }               
            } 
            
            if($this->request->getData('internet_connection') == 'wifi_static'){
                foreach(array_keys($cdata) as $key){
                    if(preg_match('/^wifi_static_/',$key)){
                        $d_ws = [];
                        $d_ws['ap_id']      = $new_id;
                        $d_ws['grouping']   = 'wifi_static_setting';
                        $d_ws['name']       = preg_replace('/^wifi_static_/', '', $key);
                        $d_ws['value']      = $cdata["$key"];
                        $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                        $this->{'ApConnectionSettings'}->save($ent_ws);    
                    }
                }               
            }
            
            if($this->request->getData('internet_connection') == 'wifi_pppoe'){
                foreach(array_keys($cdata) as $key){
                    if(preg_match('/^wifi_pppoe_/',$key)){
                        $d_ws = [];
                        $d_ws['ap_id']      = $new_id;
                        $d_ws['grouping']   = 'wifi_pppoe_setting';
                        $d_ws['name']       = preg_replace('/^wifi_pppoe_/', '', $key);
                        $d_ws['value']      = $cdata["$key"];
                        $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                        $this->{'ApConnectionSettings'}->save($ent_ws);    
                    }
                }               
            } 
            
            if($this->request->getData('internet_connection') == 'qmi'){
                foreach(array_keys($cdata) as $key){
                    if(preg_match('/^qmi_/',$key)){
                        $d_ws = [];
                        $d_ws['ap_id']      = $new_id;
                        $d_ws['grouping']   = 'qmi_setting';
                        $d_ws['name']       = preg_replace('/^qmi_/', '', $key);
                        $d_ws['value']      = $cdata["$key"];
                        $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                        $this->{'ApConnectionSettings'}->save($ent_ws);    
                    }
                }               
            }        
            
            if(isset($cdata['chk_no_controller'])){
                $d_wbw['ap_id']    = $new_id;
                $d_wbw['grouping']   = 'reboot_setting';
                $d_wbw['name']       = 'controller_reboot_time';
                $d_wbw['value']      = $cdata['controller_reboot_time'];
                $ent_wbw = $this->{'ApConnectionSettings'}->newEntity($d_wbw);  
                $this->{'ApConnectionSettings'}->save($ent_wbw);
            }
            
            if(isset($cdata['chk_daily_reboot'])){
                $d_wbw['ap_id']    = $new_id;
                $d_wbw['grouping']   = 'reboot_setting';
                $d_wbw['name']       = 'reboot_at';
                $d_wbw['value']      = $cdata['reboot_at'];
                $ent_wbw = $this->{'ApConnectionSettings'}->newEntity($d_wbw);  
                $this->{'ApConnectionSettings'}->save($ent_wbw);
            }
            
            $entry_ids = [];
            
            if (array_key_exists('static_entries', $cdata)) {
                foreach($cdata['static_entries'] as $e){
                	if(is_numeric($e)){
                		array_push($entry_ids,$e);
                	}                
                }
            }
            //Only if empty was not specified
            if(count($entry_ids)>0){  
                foreach($entry_ids as $id){
                	$data = [];
                    $data['ap_id']       = $new_id;
                    $data['ap_profile_entry_id'] = $id;
                    $ent_e = $this->{'ApApProfileEntries'}->newEntity($data);
                    $this->{'ApApProfileEntries'}->save($ent_e);	
                }
                
                //See if there are overrides
                foreach(array_keys($cdata) as $key){
                     if(preg_match('/^(ent_override_)(\d+)(_check)/',$key,$matches)){

                        $ap_profile_entry_id = $matches[2];
                        $override_list      = ['ssid','key','vlan'];
                        foreach($override_list as $o){
                            $o_item = 'ent_override_'.$ap_profile_entry_id.'_'.$o;
                            if(isset($cdata[$o_item])){
                                $o_value = $cdata[$o_item];
                                $o_data  = [
                                    'ap_profile_entry_id' => $ap_profile_entry_id,
                                    'ap_id' => $new_id,
                                    'item'  => $o,
                                    'value' => $o_value                                           
                                ];
                                $ent_o = $this->{'ApStaticEntryOverrides'}->newEntity($o_data);
                                $this->{'ApStaticEntryOverrides'}->save($ent_o);                                        
                            }
                        }                                                                   
                     }                          
                }              
            }
            
            //---------Add WiFi settings for this ap ------
            //--Clean up--
            $a_id = $new_id;
            foreach(array_keys($cdata) as $key){                
                if(preg_match('/^radio\d+_(disabled|band|mode|width|txpower|include_distance|distance|include_beacon_int|beacon_int|ht_capab|mesh|ap|config|channel_five|channel_two|noscan|cell_density)/',$key)){           
                    if(preg_match('/^radio\d+_ht_capab/',$key)){
                        $pieces = explode("\n", $cdata["$key"]);
                        foreach($pieces as $p){

                            $d_setting = [];
                            $d_setting['ap_id']     = $a_id;
                            $d_setting['name']      = $key;
                            $d_setting['value']     = $p;                      
                            $ent_s = $this->{'ApWifiSettings'}->newEntity($d_setting); 
                            if(!$this->{'ApWifiSettings'}->save($ent_s)){
                                $message = __('Could not add item');
                                $this->JsonErrors->entityErros($ent_s,$message);
                                return;
                            }
                        }
                    }else{
                        $d_setting = [];
                        $d_setting['ap_id']     = $a_id;
                        $d_setting['name']      = $key;
                        $d_setting['value']     = $cdata["$key"];
                        $ent_s = $this->{'ApWifiSettings'}->newEntity($d_setting);  
                        if(!$this->{'ApWifiSettings'}->save($ent_s)){
                            $message = __('Could not add item');
                            $this->JsonErrors->entityErros($ent_s,$message);
                            return;
                        }
                    }
                    
                    if($key == 'device_type'){
		                $d_setting = [];
		                $d_setting['ap_id'] = $n_id;
		                $d_setting['name'] 	= $key;
		                $d_setting['value'] = $cdata["$key"];
		                $ent_s = $this->{'ApWifiSettings'}->newEntity($d_setting);  
		                if(!$this->{'ApWifiSettings'}->save($ent_s)){
		                    $message = __('Could not add item');
		                    $this->JsonErrors->entityErros($ent_s,$message);
		                    return;
		                }
		            }                    
                }                                
            }
            //------- END Add settings for this ap ---

            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($apEntity,$message);
        }
    }
    
    public function apProfileApDelete(){

        $this->loadModel('Aps');
        $this->loadModel('DynamicClients');
        $this->loadModel('DynamicPairs');

        if (! $this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $fail_flag  = false;

        $cdata = $this->request->getData();
	    if(isset($cdata['id'])){   //Single item delete
            $message  = "Single item ". $cdata['id'];

            $q_r = $this->Aps->find()->contain(['ApProfiles'])->where(['Aps.id' => $cdata['id']])->first();

            if($q_r){
            	$ap_id				= $q_r->id;
                $ap_profile_name    = $q_r->ap_profile->name;
                $ap_profile_name    = preg_replace('/\s+/', '_', $ap_profile_name);
                $ap_name            = $q_r->name;
                $ap_name            = preg_replace('/\s+/', '_', $ap_name);

                $this->DynamicClients->deleteAll(['DynamicClients.nasidentifier LIKE' => "ap_".$ap_id."_cp_%"]);
                $this->DynamicPairs->deleteAll(
                            [
                                'DynamicPairs.value LIKE' 	=> "ap_".$ap_id."_cp_%",
                                'DynamicPairs.name' 		=> 'nasid',
                            ]);

                $this->Aps->delete($q_r);
            }
        }else{                          //Assume multiple item delete
            foreach($cdata as $d){
                $id     = $d['id'];
                $q_r    = $this->Aps->find()->contain(['ApProfiles'])->where(['Aps.id' => $d['id']])->first();
                if($q_r){
                	$ap_id				= $q_r->id;
                    $ap_profile_name    = $q_r->ap_profile->name;
                    $ap_profile_name    = preg_replace('/\s+/', '_', $ap_profile_name);
                    $ap_name            = $q_r->name;
                    $ap_name            = preg_replace('/\s+/', '_', $ap_name);

                    $this->DynamicClients->deleteAll(['DynamicClients.nasidentifier LIKE' => "ap_".$ap_id."_cp_%"]);
                    $this->DynamicPairs->deleteAll(
                        [
                            'DynamicPairs.value LIKE' 	=> "ap_".$ap_id."_cp_%",
                            'DynamicPairs.name' 		=> 'nasid',
                        ]);

                    $this->Aps->delete($q_r);
                }
            }
        }  
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
    public function apProfileApEdit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $this->loadModel('Aps');
        $this->loadModel('ApProfileSettings');
        $this->loadModel('ApProfileExits');
        $this->loadModel('OpenvpnServerClients');
        $this->loadModel('ApWifiSettings');
        $this->loadModel('ApConnectionSettings');
        $this->loadModel('DynamicClients');
        $this->loadModel('DynamicPairs');

        $cdata = $this->request->getData();

        if ($this->request->is('post')) {

			$move_ap_profiles	= false;
			
			$check_items = [
			    'enable_overviews',
			    'enable_alerts',
			    'enable_schedules'	
		    ];
		    
		    foreach($check_items as $i){
                if(isset($cdata[$i])){
					if($cdata[$i] == 'null'){
						$cdata[$i] = 0;
					}else{
						$cdata[$i] = 1;
					}  
				}else{
					$cdata[$i] = 0;
				}
            }
			
			//TreeTag we now use network_id
            if(isset($cdata['network_id'])){
                $network_id     = $cdata['network_id']; //Will be in format Network_<id>
                $tree_tag_id    =  preg_replace('/^(\w+)_/', '', $network_id);//Then we use that value to populate the tree tag
                $cdata['tree_tag_id'] = $tree_tag_id;
            }
			
            //Moving an Access Point from one Profile to another is more involved
            //For this we will do the following
            // 1.) Delete the Ap
            // 2.) Flag it as a move between profiles
            // 3.) Delete related DynamicPair and DynamicClient entries
            
			if (array_key_exists('ap_profile_id', $cdata)) {
				$new_ap_profile_id 	= $this->request->getData('ap_profile_id');

				$q_r = $this->Aps->find()->contain(['ApProfiles'])->where(['Aps.id' => $this->request->getData('id')])->first();

				if($q_r){
                    $current_id = $q_r->ap_profile_id;
                    $current_ap_id = $q_r->id;

                    if($current_id != $new_ap_profile_id){	//Delete it if the ap profile changed
                        $this->Aps->deleteAll(['Aps.id' => $current_ap_id]);

                        $move_ap_profiles   = true;

                        $ap_profile_name    = $q_r->name;
                        $ap_profile_name    = preg_replace('/\s+/', '_', $ap_profile_name);

                        $this->DynamicClients->deleteAll(['DynamicClient.nasidentifier LIKE' => "ap_".$current_ap_id."_cp_%"]);
                        $this->DynamicPairs->deleteAll(
                            [
                                'DynamicPairs.value LIKE' 	=> "ap_".$current_ap_id."_cp_%",
                                'DynamicPairs.name' 		=> 'nasid',
                            ]);
                    }

                    //See if we have a change in the name of the AP
                    $old_name = $q_r->name;
                    $new_name = $this->request->getData('name');
                    if($old_name != $new_name){
                        $ap_profile_name = $q_r->ap_profile->name;
                        $ap_profile_name = preg_replace('/\s+/', '_', $ap_profile_name);
                        $this->_change_dynamic_shortname($ap_profile_name,$old_name,$new_name); //This is on the NAS Devices
                    }

                    //if(true){
                    $editEntity = $this->Aps->get($current_ap_id);

                    $apEntity = $this->Aps->patchEntity($editEntity, $cdata);

                    if ($this->Aps->save($apEntity)) {
                        $new_id = $apEntity->id;
                        
                        
                        //vlan_admin settings
                        $this->{'ApConnectionSettings'}->deleteAll([
                            'ApConnectionSettings.ap_id' => $new_id,
                            'ApConnectionSettings.grouping' => 'vlan_setting'
                        ]); 
                        
                        if($this->request->getData('vlan_admin') !== ''){
                        	$d_vlan = [];
                            $d_vlan['ap_id']   	= $new_id;
                            $d_vlan['grouping'] = 'vlan_setting';
                            $d_vlan['name']     = 'vlan_admin';
                            $d_vlan['value']    = $this->request->getData('vlan_admin');
                            $ent_vlan = $this->{'ApConnectionSettings'}->newEntity($d_vlan);  
                            $this->{'ApConnectionSettings'}->save($ent_vlan);                        
                        } 
                                                                  
                        //Check if we have web-by-wifi enabled
                        $this->{'ApConnectionSettings'}->deleteAll([
                            'ApConnectionSettings.ap_id' => $new_id,
                            'ApConnectionSettings.grouping' => 'wbw_setting'
                        ]);               
                        if($this->request->getData('internet_connection') == 'wifi'){
                            foreach(array_keys($cdata) as $key){
                                if(preg_match('/^wbw_/',$key)){
                                    $d_wbw = [];
                                    $d_wbw['ap_id']      = $new_id;
                                    $d_wbw['grouping']   = 'wbw_setting';
                                    $d_wbw['name']       = preg_replace('/^wbw_/', '', $key);
                                    $d_wbw['value']      = $cdata["$key"];
                                    $ent_wbw = $this->{'ApConnectionSettings'}->newEntity($d_wbw);  
                                    $this->{'ApConnectionSettings'}->save($ent_wbw);    
                                }
                            }  
                        }else{
                            //Looks like they disabled it so we need to remove any channel overrides
                            $this->{'ApConnectionSettings'}->deleteAll([
                                'ApConnectionSettings.ap_id' => $new_id,
                                'ApConnectionSettings.grouping' => 'wbw_info'
                            ]);  
                        }
                        
                        $this->{'ApConnectionSettings'}->deleteAll([ //
                            'ApConnectionSettings.ap_id' => $new_id,
                            'ApConnectionSettings.grouping' => 'wan_static_setting'
                        ]);    
                        
                        if($this->request->getData('internet_connection') == 'wan_static'){
                            foreach(array_keys($cdata) as $key){
                                if(preg_match('/^wan_static_/',$key)){
                                    $d_ws = [];
                                    $d_ws['ap_id']      = $new_id;
                                    $d_ws['grouping']   = 'wan_static_setting';
                                    $d_ws['name']       = preg_replace('/^wan_static_/', '', $key);
                                    $d_ws['value']      = $cdata["$key"];
                                    $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                                    $this->{'ApConnectionSettings'}->save($ent_ws);    
                                }
                            }               
                        } 
                        
                        $this->{'ApConnectionSettings'}->deleteAll([ //
                            'ApConnectionSettings.ap_id' => $new_id,
                            'ApConnectionSettings.grouping' => 'wan_pppoe_setting'
                        ]);    
                        
                        if($this->request->getData('internet_connection') == 'wan_pppoe'){
                            foreach(array_keys($cdata) as $key){
                                if(preg_match('/^wan_pppoe_/',$key)){
                                    $d_ws = [];
                                    $d_ws['ap_id']      = $new_id;
                                    $d_ws['grouping']   = 'wan_pppoe_setting';
                                    $d_ws['name']       = preg_replace('/^wan_pppoe_/', '', $key);
                                    $d_ws['value']      = $cdata["$key"];
                                    $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                                    $this->{'ApConnectionSettings'}->save($ent_ws);    
                                }
                            }               
                        }
                        
                        $this->{'ApConnectionSettings'}->deleteAll([ //
                            'ApConnectionSettings.ap_id' => $new_id,
                            'ApConnectionSettings.grouping' => 'wifi_static_setting'
                        ]);    
                        
                        if($this->request->getData('internet_connection') == 'wifi_static'){
                            foreach(array_keys($cdata) as $key){
                                if(preg_match('/^wifi_static_/',$key)){
                                    $d_ws = [];
                                    $d_ws['ap_id']      = $new_id;
                                    $d_ws['grouping']   = 'wifi_static_setting';
                                    $d_ws['name']       = preg_replace('/^wifi_static_/', '', $key);
                                    $d_ws['value']      = $cdata["$key"];
                                    $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                                    $this->{'ApConnectionSettings'}->save($ent_ws);    
                                }
                            }               
                        }                           
                        
                        $this->{'ApConnectionSettings'}->deleteAll([ //
                            'ApConnectionSettings.ap_id' => $new_id,
                            'ApConnectionSettings.grouping' => 'wifi_pppoe_setting'
                        ]);    
                        
                        if($this->request->getData('internet_connection') == 'wifi_pppoe'){
                            foreach(array_keys($cdata) as $key){
                                if(preg_match('/^wifi_pppoe_/',$key)){
                                    $d_ws = [];
                                    $d_ws['ap_id']      = $new_id;
                                    $d_ws['grouping']   = 'wifi_pppoe_setting';
                                    $d_ws['name']       = preg_replace('/^wifi_pppoe_/', '', $key);
                                    $d_ws['value']      = $cdata["$key"];
                                    $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                                    $this->{'ApConnectionSettings'}->save($ent_ws);    
                                }
                            }               
                        } 
                        
                        $this->{'ApConnectionSettings'}->deleteAll([ //
                            'ApConnectionSettings.ap_id' => $new_id,
                            'ApConnectionSettings.grouping' => 'qmi_setting'
                        ]);    
                        
                        if($this->request->getData('internet_connection') == 'qmi'){
                            foreach(array_keys($cdata) as $key){
                                if(preg_match('/^qmi_/',$key)){
                                    $d_ws = [];
                                    $d_ws['ap_id']      = $new_id;
                                    $d_ws['grouping']   = 'qmi_setting';
                                    $d_ws['name']       = preg_replace('/^qmi_/', '', $key);
                                    $d_ws['value']      = $cdata["$key"];
                                    $ent_ws = $this->{'ApConnectionSettings'}->newEntity($d_ws);  
                                    $this->{'ApConnectionSettings'}->save($ent_ws);    
                                }
                            }               
                        }                                  
                        
                        //Check if any of the reboot things are specified
                        $this->{'ApConnectionSettings'}->deleteAll([
                            'ApConnectionSettings.ap_id' => $new_id,
                            'ApConnectionSettings.grouping' => 'reboot_setting'
                        ]);       
                        
                        if(isset($cdata['chk_no_controller'])){
                            $d_wbw['ap_id']    = $new_id;
                            $d_wbw['grouping']   = 'reboot_setting';
                            $d_wbw['name']       = 'controller_reboot_time';
                            $d_wbw['value']      = $cdata['controller_reboot_time'];
                            $ent_wbw = $this->{'ApConnectionSettings'}->newEntity($d_wbw);  
                            $this->{'ApConnectionSettings'}->save($ent_wbw);
                        }
                        
                        if(isset($cdata['chk_daily_reboot'])){
                            $d_wbw['ap_id']    = $new_id;
                            $d_wbw['grouping']   = 'reboot_setting';
                            $d_wbw['name']       = 'reboot_at';
                            $d_wbw['value']      = $cdata['reboot_at'];
                            $ent_wbw = $this->{'ApConnectionSettings'}->newEntity($d_wbw);  
                            $this->{'ApConnectionSettings'}->save($ent_wbw);
                        }
                        
                        //Clear previous ones first:
				        $this->{'ApApProfileEntries'}->deleteAll(['ApApProfileEntries.ap_id' => $new_id]);
				        $this->{'ApStaticEntryOverrides'}->deleteAll(['ApStaticEntryOverrides.ap_id' => $new_id]);

                        //Add the entry points
                        $count      = 0;
                        $entry_ids  = [];               
                        
                        if (array_key_exists('static_entries', $cdata)) {
                            foreach($cdata['static_entries'] as $e){
                            	if(is_numeric($e)){
                            		array_push($entry_ids,$e);
                            	}                
                            }
                        }
                        
                        //Only if empty was not specified
                        if(count($entry_ids)>0){
                            foreach($entry_ids as $id){
                                $data = [];
                                $data['ap_id']       = $new_id;
                                $data['ap_profile_entry_id'] = $id;
                                $ent_se = $this->{'ApApProfileEntries'}->newEntity($data);
                                $this->{'ApApProfileEntries'}->save($ent_se);
                            }
                            //See if there are overrides
                            foreach(array_keys($cdata) as $key){
                                 if(preg_match('/^(ent_override_)(\d+)(_check)/',$key,$matches)){

                                    $ap_profile_entry_id = $matches[2];
                                    $override_list      = ['ssid','key','vlan'];
                                    foreach($override_list as $o){
                                        $o_item = 'ent_override_'.$ap_profile_entry_id.'_'.$o;
                                        if(isset($cdata[$o_item])){
                                            $o_value = $cdata[$o_item];
                                            $o_data  = [
                                                'ap_profile_entry_id' => $ap_profile_entry_id,
                                                'ap_id' => $new_id,
                                                'item'  => $o,
                                                'value' => $o_value                                           
                                            ];
                                            $ent_o = $this->{'ApStaticEntryOverrides'}->newEntity($o_data);
                                            $this->{'ApStaticEntryOverrides'}->save($ent_o);                                        
                                        }
                                    }                                                                   
                                 }                          
                            }                                                                               
                       }                      

                        //---------Add WiFi settings for this ap ------
                        //--Clean up--
                        $a_id = $this->request->getData('id');
                        $this->ApWifiSettings->deleteAll(['ApWifiSettings.ap_id' => $a_id]);

                        foreach(array_keys($cdata) as $key){
                            if(preg_match('/^radio\d+_(disabled|band|mode|width|txpower|include_distance|distance|include_beacon_int|beacon_int|ht_capab|mesh|ap|config|channel_five|channel_two|noscan|cell_density)/',$key)){  
                                if(preg_match('/^radio\d+_ht_capab/',$key)){
                                    $pieces = explode("\n", $cdata["$key"]);
                                    foreach($pieces as $p){
                                        $d_setting = [];
                                        $d_setting['ap_id']     = $a_id;
                                        $d_setting['name']      = $key;
                                        $d_setting['value']     = $p;
                                        $ent_s = $this->{'ApWifiSettings'}->newEntity($d_setting);  
                                        $this->{'ApWifiSettings'}->save($ent_s);
                                    }
                                }else{
                                    $d_setting = [];
                                    $d_setting['ap_id']     = $a_id;
                                    $d_setting['name']      = $key;
                                    $d_setting['value']     = $cdata["$key"];
                                    $ent_s = $this->{'ApWifiSettings'}->newEntity($d_setting);  
                                    $this->{'ApWifiSettings'}->save($ent_s);
                                }
                            }
                            
                            if($key == 'device_type'){
				                $d_setting = [];
				                $d_setting['ap_id'] 	= $a_id;
				                $d_setting['name']      = $key;
				                $d_setting['value']     = $cdata["$key"];
				                $ent_s = $this->{'ApWifiSettings'}->newEntity($d_setting);  
				                $this->{'ApWifiSettings'}->save($ent_s);
				            }                                
                        }
                }

                //------- END Add settings for this ap ---

                $this->set([
                    'success' => true
                ]);
                $this->viewBuilder()->setOption('serialize', true);
			}

            }else{
                $message = 'Error';
                $this->set([
                    'errors'    => $this->JsonErrors->entityErros($apEntity, $message),
                    'success'   => false,
                    'message'   => __('Could not create item'),
                ]);
                $this->viewBuilder()->setOption('serialize', true);
            }
        } 
    }
      
    public function apProfileApImport(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $this->loadModel('Aps');
               
        $tmpName    = $_FILES['csv_file']['tmp_name'];
        $csvAsArray = array_map('str_getcsv', file($tmpName));        
        foreach ($csvAsArray as $index => $row) {         
            if($this->_testCsvRow($row)){    
                $ap_data    = [
                    'ap_profile_id' => $this->request->getData('ap_profile_id'),
                    'name'          => $row[0],
                    'description'   => $row[1],
                    'hardware'      => $row[2],
                    'mac'           => $row[3]
                ];
                $ap_e  = $this->{'Aps'}->newEntity($ap_data);
                if($this->{'Aps'}->save($ap_e)){      
                    $this->_ssidOverrides($ap_e,$row);
                    $this->_radioSettings($ap_e,$row);                
                }                                   
            }        
        }
    
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);      
    }
    
    private function _radioSettings($ap_e,$row){
    
        $hw = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $row[2],'Hardwares.for_ap' => true])->contain(['HardwareRadios'])->first();
        
        $radios = [];
        
        foreach($hw->hardware_radios as $hr){     
            $radios[$hr->band] = $hr;              
        }
               
        $wifi_items = ['disabled','band','mode','txpower','width','cell_density','ht_capab'];
        $wifi_hash_2g  = [];
        $wifi_hash_5g  = [];

        if($radios['2g']){
            $radio_number = $radios['2g']['radio_number'];
            foreach($wifi_items as $item_2g){
                $wifi_hash_2g['radio'.$radio_number.'_'.$item_2g] =  $radios['2g'][$item_2g]; //populate if with the defaults           
            }
            $wifi_hash_2g['radio'.$radio_number.'_channel_two'] = 'auto';
            
            //Check for 2g overrides
            if (isset($row[8]) && 'off' === $row[8]) {
                $wifi_hash_2g['radio' . $radio_number . '_disabled'] = true;
            }
            
            if (isset($row[10])) {
                $wifi_hash_2g['radio' . $radio_number . '_channel_two'] = $row[10];
            }
            
            if (isset($row[12])) {
                $wifi_hash_2g['radio' . $radio_number . '_txpower'] = $row[12];
            }
            
            if (isset($row[14])) {
                $wifi_hash_2g['radio' . $radio_number . '_width'] = $row[14];
            }
                    
            foreach(array_keys($wifi_hash_2g) as $key_2g){
                $d_setting = [];
                $d_setting['ap_id']     = $ap_e->id;
                $d_setting['name']      = $key_2g;
                $d_setting['value']     = $wifi_hash_2g["$key_2g"];
                $ent_s = $this->{'ApWifiSettings'}->newEntity($d_setting);  
                $this->{'ApWifiSettings'}->save($ent_s);                      
            }           
        }
        
        if($radios['5g']){
            $radio_number = $radios['5g']['radio_number'];
            foreach($wifi_items as $item_5g){
                $wifi_hash_5g['radio'.$radio_number.'_'.$item_5g] =  $radios['5g'][$item_5g]; //populate if with the defaults           
            }
            $wifi_hash_5g['radio'.$radio_number.'_'.'channel_five'] = 'auto';
            
            //Check for 5g overrides
            if (isset($row[9]) && 'off' === $row[9]) {
                $wifi_hash_5g['radio' . $radio_number . '_disabled'] = true;
            }
            
            if (isset($row[11])) {
                $wifi_hash_5g['radio' . $radio_number . '_channel_five'] = $row[11];
            }
            
            if (isset($row[13])) {
                $wifi_hash_5g['radio' . $radio_number . '_txpower'] = $row[13];
            }
            
            if (isset($row[15])) {
                $wifi_hash_5g['radio' . $radio_number . '_width'] = $row[15];
            }
            
            foreach(array_keys($wifi_hash_5g) as $key_5g){
                $d_setting = [];
                $d_setting['ap_id']     = $ap_e->id;
                $d_setting['name']      = $key_5g;
                $d_setting['value']     = $wifi_hash_5g["$key_5g"];
                $ent_s = $this->{'ApWifiSettings'}->newEntity($d_setting);  
                $this->{'ApWifiSettings'}->save($ent_s);                      
            }                  
        }                                
    }
        
    private function _ssidOverrides($ap_e,$row){
    
        if (strlen($row[4]) > 1) { //2.4G static entry points
              
            //select * from ap_profile_entries where ap_profile_id=17 and frequency_band='two' and apply_to_all=0;
            $two_g = $this->{'ApProfileEntries'}->find()->where([
                'ApProfileEntries.ap_profile_id'    => $ap_e->ap_profile_id,
                'ApProfileEntries.frequency_band'   => 'two',
                'ApProfileEntries.apply_to_all'     => false
            ])->first();
            if($two_g){
                //Apply the static one and apply an override
                $data['ap_id']       = $ap_e->id;
                $data['ap_profile_entry_id'] = $two_g->id;
                $ent_se = $this->{'ApApProfileEntries'}->newEntity($data);
                $this->{'ApApProfileEntries'}->save($ent_se);
                
                //---Do the SSID---
                $o_data  = [
                    'ap_profile_entry_id' => $two_g->id,
                    'ap_id' => $ap_e->id,
                    'item'  => 'ssid',
                    'value' => $row[4]                                           
                ];
                $ent_o = $this->{'ApStaticEntryOverrides'}->newEntity($o_data);
                $this->{'ApStaticEntryOverrides'}->save($ent_o);
                
                //IF   $row[5] is bigger or equal than 8 chars AND ApProfileEntries encryption = 'psk2'
                if ((strlen($row[5]) >= 8)&&($two_g->encryption == 'psk2')){ //Key
                    //---Do the Key---
                    $o_data  = [
                        'ap_profile_entry_id' => $two_g->id,
                        'ap_id' => $ap_e->id,
                        'item'  => 'key',
                        'value' => $row[5]                                           
                    ];
                    $ent_o = $this->{'ApStaticEntryOverrides'}->newEntity($o_data);
                    $this->{'ApStaticEntryOverrides'}->save($ent_o);   
                }
            }       
        } 
        
        if (strlen($row[6]) > 1) { //5G static entry points
              
            //select * from ap_profile_entries where ap_profile_id=17 and frequency_band='two' and apply_to_all=0;
            $five_g = $this->{'ApProfileEntries'}->find()->where([
                'ApProfileEntries.ap_profile_id'    => $ap_e->ap_profile_id,
                'ApProfileEntries.apply_to_all'     => false,
                'ApProfileEntries.frequency_band LIKE'   => 'five%' //five or five_upper or five_lower
            ])->first();
            if($five_g){
                //Apply the static one and apply an override
                $data['ap_id']       = $ap_e->id;
                $data['ap_profile_entry_id'] = $five_g->id;
                $ent_se = $this->{'ApApProfileEntries'}->newEntity($data);
                $this->{'ApApProfileEntries'}->save($ent_se);
                
                //---Do the SSID---
                $o_data  = [
                    'ap_profile_entry_id' => $five_g->id,
                    'ap_id' => $ap_e->id,
                    'item'  => 'ssid',
                    'value' => $row[6]                                           
                ];
                $ent_o = $this->{'ApStaticEntryOverrides'}->newEntity($o_data);
                $this->{'ApStaticEntryOverrides'}->save($ent_o);
                
                //IF   $row[7] is bigger or equal than 8 chars AND ApProfileEntries encryption = 'psk2'
                if ((strlen($row[7]) >= 8)&&($five_g->encryption == 'psk2')){ //Key
                    //---Do the Key---
                    $o_data  = [
                        'ap_profile_entry_id' => $five_g->id,
                        'ap_id' => $ap_e->id,
                        'item'  => 'key',
                        'value' => $row[7]                                           
                    ];
                    $ent_o = $this->{'ApStaticEntryOverrides'}->newEntity($o_data);
                    $this->{'ApStaticEntryOverrides'}->save($ent_o);   
                }
            }       
        }          
    }
    
    
    private function _testCsvRow($row){
        $pass = true;   
        if (strlen($row[0]) < 1) { //Name must be at least longer that 1 character
            $pass = false;
        }
        
        if (strlen($row[2]) > 1) { //Hardware Model must be present
            $pass = false;
            $hw = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $row[2],'Hardwares.for_ap' => true])->first();
            if($hw){
                $pass = true;
            }          
        }else{
            $pass = false;
        }
        
        if (!filter_var($row[3], FILTER_VALIDATE_MAC)){
            $pass = false;
        }
                      
        return $pass;   
    }
        
     public function apProfileApView(){

        $this->loadModel('Aps');
        $this->loadModel('ApWifiSettings');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $data = [];

        $id   = $this->request->getQuery('ap_id');
        $q_r  = $this->Aps->find()->contain(['ApWifiSettings','ApApProfileEntries','ApConnectionSettings','Schedules'])->where(['Aps.id' => $id])->first();
        
        if($q_r){
        
            if($q_r->schedule !== null){
                $data['schedule_name'] = $q_r->schedule->name;
            }       
            $fields     = $this->{'Aps'}->getSchema()->columns();
            foreach($fields as $field){
                $data["$field"] = $q_r->{"$field"};  
            }
            $hardware = $q_r->hardware;
            $data['internet_connection'] = 'auto_detect';
        
            foreach($q_r->ap_connection_settings as $ncs){
                if($ncs->grouping == 'wbw_setting'){
                    $data['internet_connection'] = 'wifi';
                    $wbw_n           = 'wbw_'.$ncs->name;
                    $data[$wbw_n]    = $ncs->value;
                }
                
                if($ncs->grouping == 'wan_static_setting'){
                    $data['internet_connection'] = 'wan_static';
                    $ws_n           = 'wan_static_'.$ncs->name;
                    $data[$ws_n]    = $ncs->value;
                }
                
                if($ncs->grouping == 'wan_pppoe_setting'){
                    $data['internet_connection'] = 'wan_pppoe';
                    $ws_n           = 'wan_pppoe_'.$ncs->name;
                    $data[$ws_n]    = $ncs->value;
                }
                
                if($ncs->grouping == 'wifi_static_setting'){
                    $data['internet_connection'] = 'wifi_static';
                    $ws_n           = 'wifi_static_'.$ncs->name;
                    $data[$ws_n]    = $ncs->value;
                }
                
                if($ncs->grouping == 'wifi_pppoe_setting'){
                    $data['internet_connection'] = 'wifi_pppoe';
                    $ws_n           = 'wifi_pppoe_'.$ncs->name;
                    $data[$ws_n]    = $ncs->value;
                }
                
                if($ncs->grouping == 'qmi_setting'){
                    $data['internet_connection'] = 'qmi';
                    $ws_n           = 'qmi_'.$ncs->name;
                    $data[$ws_n]    = $ncs->value;
                }
                
                if($ncs->grouping == 'vlan_setting'){
                    $data[$ncs->name]    = intval($ncs->value);
                }
                
                if($ncs->grouping == 'reboot_setting'){
                    if($ncs->name == 'controller_reboot_time'){
                        $data['chk_no_controller'] = 'on';
                        $data['controller_reboot_time'] = $ncs->value;
                    }
                    
                    if($ncs->name == 'reboot_at'){
                        $data['chk_daily_reboot'] = 'on';
                        $data['reboot_at'] = $ncs->value;  
                    }             
                }      
            }
            
            //Grouping
            $data['tree_tag_id']            = $q_r->tree_tag_id;
            $tree_tag                       = $this->_tree_tags($q_r);
            if($tree_tag['value'] == 'not_tagged'){
                $data['tag_path']          = "<div class=\"fieldGrey\"><i class='fa fa-check-circle'></i> <b>(NOT IN GROUP)</b></div>";
            }elseif($tree_tag['value'] == 'orphaned'){
                $data['tag_path']          = "<div class=\"fieldRed\"><i class='fa fa-exclamation'></i> <b>(ORPHANED)</b></div>";
            }else{     
                $data['tag_path']   = "<div class=\"fieldBlue\" style=\"text-align:left;\"> <b>".$tree_tag['value']."</b></div>";
            }
            $data['network_id'] = $tree_tag['network_id'];
            
            $ap_ap_profile_e_list = [];
            foreach($q_r->ap_ap_profile_entries as $ap_ap_profile_e){
                array_push($ap_ap_profile_e_list,$ap_ap_profile_e->ap_profile_entry_id);
            }
            $data['static_entries[]'] = $ap_ap_profile_e_list;                                 
        } 
       
        //Return the Advanced WiFi Settings...
        if(count($q_r->ap_wifi_settings) > 0){             
            $radio1_flag    = false;
            $r0_ht_capab    = [];
            $r1_ht_capab    = [];

            foreach($q_r->ap_wifi_settings as $s){
                $s_name     = $s->name;
                $s_value    = $s->value;
                if($s_name == 'radio1_txpower'){
                    $radio1_flag = true;
                }

                if(!(preg_match('/^radio\d+_ht_capab/',$s_name))){
                    $data["$s_name"] = "$s_value";
                }else{
                    if($s_name == 'radio0_ht_capab'){
                        array_push($r0_ht_capab,$s_value);
                    }
                    if($s_name == 'radio1_ht_capab'){
                        array_push($r1_ht_capab,$s_value);
                    }
                }
            }

            $data['radio0_ht_capab'] = implode("\n",$r0_ht_capab);
            if($radio1_flag){
                $data['radio1_ht_capab'] = implode("\n",$r1_ht_capab);
            }
        
        }else{ 
            //Get the defaults from the DB---
            $radio_fields = [
                'disabled','band','mode','width','txpower','include_beacon_int',
                'beacon_int','include_distance','distance','ht_capab','mesh','ap','config','cell_density'
            ];          
            $q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hardware])->contain(['HardwareRadios'])->first();         
            if($q_e){
                foreach($q_e->hardware_radios as $hr){    
                    $radio_number   = $hr->radio_number;
                    foreach($radio_fields as $fr){
                    
                        if($fr == 'hwmode'){
                            
                            if($hr[$fr] == '11g'){
                                $data['radio'.$radio_number.'_band'] = '24';
                            }
                            
                            if($hr[$fr] == '11a'){
                                $data['radio'.$radio_number.'_band'] = '5';
                            } 
                            if($hr[$fr] == '11a_ac'){
                                $data['radio'.$radio_number.'_band']   = '5';
                                $data['device_type']                   = 'ac';
                            } 
                              
                        }elseif($fr == 'disabled'){
                            $data['radio'.$radio_number.'_enabled'] = !$hr[$fr];
                        }else{
                            $data['radio'.$radio_number.'_'.$fr] = $hr[$fr];
                        }
                    }  
                }
            } 
        }

		$q_r->ap_profile_id = intval($q_r->ap_profile_id);
		

        $this->set([
            'data'      => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
   
    
    private function _make_linux_password($pwd){
		return exec("openssl passwd -1 $pwd");
	}
    
    private function _get_dead_after($ap_profile_id){
    
		$this->loadModel('UserSettings');        
        $q_r   = $this->{'UserSettings'}->find()->where(['user_id' => -1,'name' => 'heartbeat_dead_after'])->first();
        if($q_r){
            $dead_after = $q_r->value;
        }
		$ap_s = $this->{$this->main_model}->find()->contain(['ApProfileSettings'])->where(['ApProfileSettings.ap_profile_id' => $ap_profile_id])->first();

		if($ap_s){
            $dead_after = $ap_s->ap_profile_setting->heartbeat_dead_after;
        }
		return $dead_after;
	}
	
	private function _tree_tags($entity){
	    $tag_path = [];    
        $tag_path['value'] = 'not_tagged';
        $tag_path['network_id'] = '';  
        if($entity->tree_tag_id !== null){    
            //Make sure the TreeTag exists
            $networks_check = $this->{'Networks'}->find()->where(['Networks.id' => $entity->tree_tag_id])->first();
            if($networks_check){
                $tag_path['network_id'] = 'network_'.$networks_check->id;
                $site_check = $this->{'Sites'}->find()->where(['Sites.id' => $networks_check->site_id])->first();
                if($site_check){
                    $cloud_check = $this->{'Clouds'}->find()->where(['Clouds.id' => $site_check->cloud_id])->first();
                    if($cloud_check){
                        $tag_path['value'] =  ' <i class="fa fa-cloud"></i> '.
                            $cloud_check->name.'<br>'.
                            ' <i class="fa fa-building"></i> '.
                            $site_check->name.'<br>'.
                            ' <i class="fa fa-sitemap"></i> '.
                            $networks_check->name;
                    }
                    //$tag_path =  ' <i class="fa fa-building"></i> '.$site_check->name.'<br> <i class="fa fa-sitemap"></i> '.$networks_check->name;
                }
                 
               
            }else{
                $tag_path['value'] = "orphaned";
            }
        }  
        return $tag_path;
    }
	
	//----- Menus ------------------------
	
    public function menuForGrid(){
    
         $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'ApProfiles'); 
        $this->set(array(
            'items' => $menu,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForEntriesGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'ApProfileEntries'); 
        $this->set(array(
            'items' => $menu,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForExitsGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'ApProfileExits'); 
        $this->set(array(
            'items' => $menu,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
    public function menuForApsGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'Aps'); 
        $this->set(array(
            'items' => $menu,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForDevicesGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'ApProfileDevices'); 
        $this->set(array(
            'items' => $menu,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    private function _add_dynamic($dc_data){
    
        //--Formulate a name
        $dynClientEntity = $this->DynamicClients->newEntity($dc_data);
        if ($this->DynamicClients->save($dynClientEntity)) {
            //After this we can add the Realms if there are any
            $new_id = $dynClientEntity->id;
            $pieces = explode(",", $dc_data['realm_list']);
            foreach($pieces as $p){
                if(is_numeric($p)){
                    $dcr = [];
                    $dcr['dynamic_client_id'] = $new_id;
                    $dcr['realm_id'] = $p;

                    $dynClientRealmEntity = $this->DynamicClientRealms->newEntity($dcr);
                    $this->DynamicClientRealms->save($dynClientRealmEntity);
                }
            }   
        }
    }
    
    private function _add_dynamic_pair($nas_data){
        $data = [];
        $data['name']               = 'nasid';
        $data['value']              = $nas_data['nasidentifier'];
        $data['dynamic_detail_id']  = $nas_data['dynamic_detail_id'];
        $data['priority']           = 1;

        $dynPairEntity = $this->DynamicPairs->newEntity($data);
        $this->DynamicPairs->save($dynPairEntity);
    }
    
    private function _change_dynamic_shortname($ap_profile_name,$old_name,$new_name){ 
        $search_for = $ap_profile_name.'_'.$old_name.'_cp_';

        $q_r = $this->DynamicClients->find()->where(['DynamicClients.nasidentifier LIKE' => "$search_for%"])->all();

        foreach($q_r as $n){
            $current_name   = $n->nasidentifier;
            $id             = $n->id;
            $newname        = str_replace("$old_name","$new_name","$current_name");
            $d              = [];
            $d['id']        = $id;
            $d['nasidentifier'] = $newname;

            $dynClientEntity = $this->DynamicClients->newEntity($d);
            $this->DynamicClients->save($dynClientEntity);
        }
    }
    
     private function _check_if_available($openvpn_server_id,$ip){
        $count = $this->OpenvpnServerClients->find()->where([
            'OpenvpnServerClients.openvpn_server_id' => $openvpn_server_id,
            'OpenvpnServerClients.ip_address' => $ip,
        ])->count();

        if($count == 0){
            return true;
        }else{
            return false;
        }
    }

    private function _get_next_ip($ip){
        $pieces     = explode('.',$ip);
        $octet_1    = $pieces[0];
        $octet_2    = $pieces[1];
        $octet_3    = $pieces[2];
        $octet_4    = $pieces[3];

        if($octet_4 >= 254){
            $octet_4 = 1;
            $octet_3 = $octet_3 +1;
        }else{

            $octet_4 = $octet_4 +1;
        }
        $next_ip = $octet_1.'.'.$octet_2.'.'.$octet_3.'.'.$octet_4;
        return $next_ip;
    }
    
    private function _get_radio_for($hardware,$frequency){
        $q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hardware])->contain(['HardwareRadios'])->first();         
        if($q_e){
            foreach($q_e->hardware_radios as $hr){    
                $radio_number   = $hr->radio_number;
                if(($frequency == 5)&&(($hr->hwmode == '11a')||($hr->hwmode == '11a_ac'))){
                    return $hr->radio_number;
                }
                if(($frequency == 2.4)&&($hr->hwmode == '11g')){
                    return $hr->radio_number;
                }     
            }
        }    
        return 0;//Default = radio0;
    }
    
    private function _entry_schedule($id,$schedule){
    
    	//Delete any old entries;
    	$this->ApProfileEntrySchedules->deleteAll(['ApProfileEntrySchedules.ap_profile_entry_id' => $id]); 
    	   
    	//Default is on
        $day_defaults  = ['mo' => true, 'tu' => true, 'we' => true, 'th' => true, 'fr' => true, 'sa' => true, 'su' => true ];
        
        foreach($schedule as $s){
        	foreach(array_keys($day_defaults) as $key){
        		if($s[$key] != $day_defaults[$key]){
        			$d = [];
        			if($s[$key]){
		    			$d['action'] = 'on';
		    		}else{
		    			$d['action'] = 'off';
		    		}
        			$d['event_time'] = $s['begin'];
        			$d['ap_profile_entry_id'] = $id;
        			$d[$key] = true;
        			$day_defaults[$key] = $s[$key];
        			
        			$e_s = $this->ApProfileEntrySchedules->newEntity($d);
        			$this->ApProfileEntrySchedules->save($e_s);       			      		
        		}       		       	
        	}
        }
        
        foreach($schedule as $s){
        	
        	//if end of day, check status of next day if we need to turn it off or on
			if($s['end'] == 1440){			
				$next_day = $schedule[0];			
				if($next_day['mo'] !== $next_day['tu']){
					$d =[];
					$d['event_time'] = 0;
					$d['ap_profile_entry_id'] = $id;
					if($next_day['tu']){
						$d['action'] = 'on';
					}else{
						$d['action'] = 'off';
					}
					$d['tu'] = true;
					$e_s = $this->ApProfileEntrySchedules->find()->where($d)->first();
					if(!$e_s){
						$e_s = $this->ApProfileEntrySchedules->newEntity($d);
        				$this->ApProfileEntrySchedules->save($e_s);
        			}				
				}
				
				if($next_day['tu'] !== $next_day['we']){
					$d =[];
					$d['event_time'] = 0;
					$d['ap_profile_entry_id'] = $id;
					if($next_day['we']){
						$d['action'] = 'on';
					}else{
						$d['action'] = 'off';
					}
					$d['we'] = true;
					$e_s = $this->ApProfileEntrySchedules->find()->where($d)->first();
					if(!$e_s){
						$e_s = $this->ApProfileEntrySchedules->newEntity($d);
        				$this->ApProfileEntrySchedules->save($e_s);
        			}				
				}
				
				if($next_day['we'] !== $next_day['th']){
					$d =[];
					$d['event_time'] = 0;
					$d['ap_profile_entry_id'] = $id;
					if($next_day['th']){
						$d['action'] = 'on';
					}else{
						$d['action'] = 'off';
					}
					$d['th'] = true;
					$e_s = $this->ApProfileEntrySchedules->find()->where($d)->first();
					if(!$e_s){
						$e_s = $this->ApProfileEntrySchedules->newEntity($d);
        				$this->ApProfileEntrySchedules->save($e_s);
        			}		
				}
				
				if($next_day['th'] !== $next_day['fr']){
					$d =[];
					$d['event_time'] = 0;
					$d['ap_profile_entry_id'] = $id;
					if($next_day['fr']){
						$d['action'] = 'on';
					}else{
						$d['action'] = 'off';
					}
					$d['fr'] = true;
					$e_s = $this->ApProfileEntrySchedules->find()->where($d)->first();
					if(!$e_s){
						$e_s = $this->ApProfileEntrySchedules->newEntity($d);
        				$this->ApProfileEntrySchedules->save($e_s);
        			}				
				}
				
				if($next_day['fr'] !== $next_day['sa']){
					$d =[];
					$d['event_time'] = 0;
					$d['ap_profile_entry_id'] = $id;
					if($next_day['sa']){
						$d['action'] = 'on';
					}else{
						$d['action'] = 'off';
					}
					$d['sa'] = true;
					$e_s = $this->ApProfileEntrySchedules->find()->where($d)->first();
					if(!$e_s){
						$e_s = $this->ApProfileEntrySchedules->newEntity($d);
        				$this->ApProfileEntrySchedules->save($e_s);
        			}				
				}
				
				if($next_day['sa'] !== $next_day['su']){
					$d =[];
					$d['event_time'] = 0;
					$d['ap_profile_entry_id'] = $id;
					if($next_day['su']){
						$d['action'] = 'on';
					}else{
						$d['action'] = 'off';
					}
					$d['su'] = true;
					$e_s = $this->ApProfileEntrySchedules->find()->where($d)->first();
					if(!$e_s){
						$e_s = $this->ApProfileEntrySchedules->newEntity($d);
        				$this->ApProfileEntrySchedules->save($e_s);
        			}			
				}
				
				if($next_day['su'] !== $next_day['mo']){
					$d =[];
					$d['event_time'] = 0;
					$d['ap_profile_entry_id'] = $id;
					if($next_day['mo']){
						$d['action'] = 'on';
					}else{
						$d['action'] = 'off';
					}
					$d['mo'] = true;
					$e_s = $this->ApProfileEntrySchedules->find()->where($d)->first();
					if(!$e_s){
						$e_s = $this->ApProfileEntrySchedules->newEntity($d);
        				$this->ApProfileEntrySchedules->save($e_s);
        			}					
				}	       			
			}       	      	
        }            
    }   
}
