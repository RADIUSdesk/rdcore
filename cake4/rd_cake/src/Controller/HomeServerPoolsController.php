<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 21/02/2024
 * Time: 00:00
 */
 

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class HomeServerPoolsController extends AppController{
  
    public $base            = "Access Providers/Controllers/HomeServerPools/";
    protected $owner_tree   = [];
    protected $main_model   = 'HomeServerPools';
    protected $short_name   = 'home_server_';
    
    public function initialize():void{ 
        parent::initialize();
        
        $this->loadModel('HomeServerPools'); 
        $this->loadModel('HomeServers');      
        $this->loadModel('Nas');
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'HomeServerPools'
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
		$cloud_id 	= $cquery['cloud_id'];
		$this->CommonQueryFlat->cloud_with_system($query,$cloud_id,['HomeServers']);
        $limit  = 50;
        $page   = 1;
        $offset = 0;
        if(null !== $cquery['limit']){
            $limit  = $cquery['limit'];
            $page   = $cquery['page'];
            $offset = $cquery['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){
                                       
            $i->for_system = false;
            if($i->cloud_id == -1){
            	$i->for_system = true;
            }
            
            $count = 1;
            foreach($i->{"home_servers"} as $ent_hs){
                
                $i->{'hs_'.$count.'_id'}        = $ent_hs->id;
                $i->{'hs_'.$count.'_type'}      = $ent_hs->type;
                $i->{'hs_'.$count.'_ipaddr'}    = $ent_hs->ipaddr;
                $i->{'hs_'.$count.'_port'}      = $ent_hs->port;
                $i->{'hs_'.$count.'_secret'}    = $ent_hs->secret;
                $i->{'hs_'.$count.'_accept_coa'}= $ent_hs->accept_coa;
                $count++;
            }       
                   
            $i->created_in_words    = $this->TimeCalculations->time_elapsed_string($i->created);
            $i->modified_in_words   = $this->TimeCalculations->time_elapsed_string($i->modified); 
            $i->home_server_count   = count($i->{"home_servers"});                     
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
             
        $cdata = $this->request->getData();
        
        $check_items = [
        	'for_system'
        ];
        
        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }
            
        if($cdata['for_system'] == 1){
	    	$cdata['cloud_id'] = -1;
	    }else{
	    	$cdata['cloud_id'] = $this->request->getData('cloud_id');
	    }
	         
        $entity = $this->{$this->main_model}->newEntity($cdata);
        
        if($this->{$this->main_model}->save($entity)){
        
            //Now we have the home_server_pool we can use its id to add the home_server
            $d_hs = [];
            $d_hs['home_server_pool_id'] = $entity->id;
            $d_hs['ipaddr'] = $cdata['ipaddr'];
            $d_hs['port']   = $cdata['port'];
            $d_hs['secret'] = $cdata['secret'];
            $e_hs = $this->{'HomeServers'}->newEntity($d_hs);
            if($this->{'HomeServers'}->save($e_hs)){
            
                //With ADD we automatically add an entry to the nas table
                $d_nas                  = [];
                $d_nas['nasname']       = $e_hs->ipaddr;
                $d_nas['shortname']     = $this->short_name.$e_hs->id;
                $d_nas['nasidentifier'] = $this->short_name.$e_hs->id;
                $d_nas['ports']         = 3799;
                $d_nas['secret']        = $e_hs->secret;
                $d_nas['cloud_id']      = $cdata['cloud_id'];
                $e_nas                  = $this->{'Nas'}->newEntity($d_nas);      
                if($this->{'Nas'}->save($e_nas )){          
                     $this->set([
                        'success' => true,
                        '_serialize' => ['success']
                    ]);        
                }else{
                    $message = __('Could not NAS (FOR COA)');
                    $this->JsonErrors->entityErros($entity,$message);          
                }                
            }else{
                $message = __('Could not create item');
                $this->JsonErrors->entityErros($entity,$message);
            }
                        
            $entity->setRedoConfigFile();
            //Check if we need to redo config file (which is NOT remove anything since its not yet added and append the new entry)
            $this->{$this->main_model}->checkConfigFileRedo($entity);
                 
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
            'for_system'
        ];

        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }
        
        if($cdata['for_system'] == 1){
	    	$cdata['cloud_id'] = -1;
	    }else{
	    	$cdata['cloud_id'] = $this->request->getData('cloud_id');
	    }
       
        $entity = $this->{$this->main_model}->get($cdata['id']);
        
        //We only need to redo it IF the type field changed
        if($cdata['type'] !== $entity->type){       
            $entity->setRedoConfigFile();
        }
                  
        $this->{$this->main_model}->patchEntity($entity, $cdata);   
              
        if ($this->{$this->main_model}->save($entity)) {
            $redo_config_file = $this->_processHomeServers(); //Do the home servers
            if($redo_config_file){
                $entity->setRedoConfigFile(); //Flag it to redo config file if there was a condition for it                   
            }     
            //Check if we need to redo config file
            $this->{$this->main_model}->checkConfigFileRedo($entity);
            
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
            $this->{$this->main_model}->removeHsPool($entity);
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
                $this->{$this->main_model}->removeHsPool($entity);
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
		
	private function _processHomeServers(){
	
	    $redo_config_file = false;
	    
	    $req_d		= $this->request->getData();
	
	    $hsp_id     = $req_d['id'];
	    $current    = $this->{$this->main_model}->find()->where(['HomeServerPools.id' => $hsp_id])->contain(['HomeServers'])->first();
	    
	    //How many home servers did the user save
	    $hs_save_count = 1;
	    if(isset($req_d['hs_2_id'])){
	        $hs_save_count = 2;
	    }
	    if(isset($req_d['hs_3_id'])){
	        $hs_save_count = 3;
	    }
	    
	    $check_items = ['accept_coa'];  
	    $items = [
            'type',   'ipaddr',   'port',      'secret',   'response_window',   
            'zombie_period', 'revive_interval', 'accept_coa'        
        ];   
	    
	    if($current){
	        $hs_list = $current->home_servers;
	        foreach($hs_list as $hs){
	            $no_match = true;
	            for ($x = 1; $x <= $hs_save_count; $x++){
	                //Match
	                if($req_d['hs_'.$x.'_id'] == $hs->id){
	                    $no_match       = false;
	                    $changed_flag   = false;
	                    $new_data       = [];
                        if(isset($req_d['hs_'.$x.'_accept_coa'])){
                            $req_d['hs_'.$x.'_accept_coa'] = 1;
                        }else{
                            $req_d['hs_'.$x.'_accept_coa'] = 0;
                        }  	                    
	                    foreach($items as $item){
	                        $new_data[$item] = $req_d['hs_'.$x.'_'.$item];
	                        if($req_d['hs_'.$x.'_'.$item] != $hs->{$item}){             
	                            $changed_flag = true;
	                        }
	                    }	                    
	                    if($changed_flag == true){
	                        $this->{'HomeServers'}->patchEntity($hs, $new_data);
	                        $this->{'HomeServers'}->save($hs);
	                        $shortname = 'home_server_'.$hs->id;
	                        //Also if $new_data['accept_coa'] ==0 remove it from Nas and if ==1 save nas
	                        if($new_data['accept_coa']){
	                            //With ADD we automatically add an entry to the nas table
                                $d_nas                  = [];
                                $d_nas['nasname']       = $new_data['ipaddr'];
                                $d_nas['shortname']     = 'home_server_'.$hs->id;
                                $d_nas['nasidentifier'] = 'home_server_'.$hs->id;
                                $d_nas['ports']         = 3799;
                                $d_nas['secret']        = $new_data['secret'];
                                
                                $e_nas                  = $this->{'Nas'}->find()->where(['Nas.shortname' => $d_nas['shortname']])->first();
                                if($e_nas){
                                    $this->{'Nas'}->patchEntity($e_nas,$d_nas);
                                }else{
                                    $e_nas             = $this->{'Nas'}->newEntity($d_nas);
                                }
                                $this->{'Nas'}->save($e_nas);                  
	                        
	                        }else{
	                            $e_nas = $this->{'Nas'}->find()->where(['Nas.shortname' => $shortname])->first();
	                            if($e_nas){
	                                $this->{'Nas'}->delete($e_nas);
	                            }	                        
	                        }	                        	                        
	                        $redo_config_file = true; 
	                    }      
	                }
	            }
	            if($no_match){
	                $this->{'HomeServers'}->delete($hs);
	                $redo_config_file = true;
	            }	        
	        }    
	    }
	    
	    for ($x = 1; $x <= $hs_save_count; $x++){
	        if($req_d['hs_'.$x.'_id'] == ''){
	            $new_data = [];
	            
	            if(isset($req_d['hs_'.$x.'_accept_coa'])){
                    $req_d['hs_'.$x.'_accept_coa'] = 1;
                }else{
                    $req_d['hs_'.$x.'_accept_coa'] = 0;
                }  
	            	            
	            foreach($items as $item){
	                $new_data[$item] = $req_d['hs_'.$x.'_'.$item];	                       
	            }
	            $new_data['home_server_pool_id'] = $hsp_id;
	            $new_hs_ent =  $this->{'HomeServers'}->newEntity($new_data);
	            $this->{'HomeServers'}->save($new_hs_ent);
	            if($new_data['accept_coa']){
                    //With ADD we automatically add an entry to the nas table
                    $d_nas                  = [];
                    $d_nas['nasname']       = $new_data['ipaddr'];
                    $d_nas['shortname']     = 'home_server_'.$new_hs_ent->id;
                    $d_nas['nasidentifier'] = 'home_server_'.$new_hs_ent->id;
                    $d_nas['ports']         = 3799;
                    $d_nas['secret']        = $new_data['secret'];
                    
                    $e_nas                  = $this->{'Nas'}->find()->where(['Nas.shortname' => $d_nas['shortname']])->first();
                    if($e_nas){
                        $this->{'Nas'}->patchEntity($e_nas,$d_nas);
                    }else{
                        $e_nas             = $this->{'Nas'}->newEntity($d_nas);
                    }
                    $this->{'Nas'}->save($e_nas);                                  
                }	            	            
	            $redo_config_file = true;   
	        }    
	    }
	    
	    return $redo_config_file;
	}

    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons( false, 'basic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
      
}
