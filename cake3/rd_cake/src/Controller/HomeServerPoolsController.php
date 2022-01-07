<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 09/12/2020
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
    
    public function initialize(){  
        parent::initialize();
        $this->loadModel('HomeServerPools'); 
        $this->loadModel('HomeServers');      
        $this->loadModel('Users'); 
        $this->loadModel('Nas');
          
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
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
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query,$user,['Users','HomeServers']);
 
        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
        if(isset($this->request->query['limit'])){
            $limit  = $this->request->query['limit'];
            $page   = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total      = $query->count();       
        $q_r        = $query->all();
        $items      = []; 
        
        foreach ($q_r as $i) {
            $owner_id = $i->user_id;
            if (!array_key_exists($owner_id, $this->owner_tree)) {
                $owner_tree = $this->Users->find_parents($owner_id);
            } else {
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags = $this->Aa->get_action_flags($owner_id, $user);
              
            $row        = array();
            $fields     = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            }
            $row['home_server_count'] = count($i->{"home_servers"});
            $count = 1;
            foreach($i->{"home_servers"} as $ent_hs){
                
                $row['hs_'.$count.'_id']        = $ent_hs->id;
                $row['hs_'.$count.'_type']      = $ent_hs->type;
                $row['hs_'.$count.'_ipaddr']    = $ent_hs->ipaddr;
                $row['hs_'.$count.'_port']      = $ent_hs->port;
                $row['hs_'.$count.'_secret']    = $ent_hs->secret;
                $row['hs_'.$count.'_accept_coa']= $ent_hs->accept_coa;
                $count++;
            }       
            
            $row['home_servers']= $i->{"home_servers"};               
            $row['owner']		= $owner_tree;
			$row['update']		= $action_flags['update'];
			$row['delete']		= $action_flags['delete'];
            array_push($items, $row);
        }
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));
    }
  
    public function add(){ 
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
        
        if($this->{$this->main_model}->save($entity)){
        
            //Now we have the home_server_pool we can use its id to add the home_server
            $d_hs = [];
            $d_hs['home_server_pool_id'] = $entity->id;
            $d_hs['ipaddr'] = $this->request->data['ipaddr'];
            $d_hs['port']   = $this->request->data['port'];
            $d_hs['secret'] = $this->request->data['secret'];
            $e_hs = $this->{'HomeServers'}->newEntity($d_hs);
            if($this->{'HomeServers'}->save($e_hs)){
            
                //With ADD we automatically add an entry to the nas table
                $d_nas                  = [];
                $d_nas['nasname']       = $e_hs->ipaddr;
                $d_nas['shortname']     = $this->short_name.$e_hs->id;
                $d_nas['nasidentifier'] = $this->short_name.$e_hs->id;
                $d_nas['ports']         = 3799;
                $d_nas['secret']        = $e_hs->secret;
                $e_nas                  = $this->{'Nas'}->newEntity($d_nas);      
                if($this->{'Nas'}->save($e_nas )){          
                     $this->set(array(
                        'success' => true,
                        '_serialize' => array('success')
                    ));        
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

        //__ Authentication + Authorization __
        
        $user_id    = $user['id'];

        //Get the creator's id
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
       
        $entity = $this->{$this->main_model}->get($this->request->data['id']);
        
        //We only need to redo it IF the type field changed
        if($this->request->data['type'] !== $entity->type){       
            $entity->setRedoConfigFile();
        }
                  
        $this->{$this->main_model}->patchEntity($entity, $this->request->data());   
              
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

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);   
            $owner_id   = $entity->user_id;
            
            if($owner_id != $user_id){
                if($this->Users->is_sibling_of($user_id,$owner_id)== true){               
                    $this->{$this->main_model}->removeHsPool($entity);
                    $this->{$this->main_model}->delete($entity);
                }else{
                    $fail_flag = true;
                }
            }else{
                $this->{$this->main_model}->removeHsPool($entity);
                $this->{$this->main_model}->delete($entity);
            }
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                $owner_id   = $entity->user_id;            
                if($owner_id != $user_id){
                    if($this->Users->is_sibling_of($user_id,$owner_id) == true){
                        $this->{$this->main_model}->removeHsPool($entity);
                        $this->{$this->main_model}->delete($entity);   
                    }else{
                        $fail_flag = true;
                    }
                }else{
                    $this->{$this->main_model}->removeHsPool($entity);
                    $this->{$this->main_model}->delete($entity);
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
		
	private function _processHomeServers(){
	
	    $redo_config_file = false;
	
	    $hsp_id     = $this->request->data['id'];
	    $current    = $this->{$this->main_model}->find()->where(['HomeServerPools.id' => $hsp_id])->contain(['HomeServers'])->first();
	    
	    //How many home servers did the user save
	    $hs_save_count = 1;
	    if(isset($this->request->data['hs_2_id'])){
	        $hs_save_count = 2;
	    }
	    if(isset($this->request->data['hs_3_id'])){
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
	                if($this->request->data['hs_'.$x.'_id'] == $hs->id){
	                    $no_match       = false;
	                    $changed_flag   = false;
	                    $new_data       = [];
                        if(isset($this->request->data['hs_'.$x.'_accept_coa'])){
                            $this->request->data['hs_'.$x.'_accept_coa'] = 1;
                        }else{
                            $this->request->data['hs_'.$x.'_accept_coa'] = 0;
                        }  	                    
	                    foreach($items as $item){
	                        $new_data[$item] = $this->request->data['hs_'.$x.'_'.$item];
	                        if($this->request->data['hs_'.$x.'_'.$item] != $hs->{$item}){             
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
	        if($this->request->data['hs_'.$x.'_id'] == ''){
	            $new_data = [];
	            
	            if(isset($this->request->data['hs_'.$x.'_accept_coa'])){
                    $this->request->data['hs_'.$x.'_accept_coa'] = 1;
                }else{
                    $this->request->data['hs_'.$x.'_accept_coa'] = 0;
                }  
	            	            
	            foreach($items as $item){
	                $new_data[$item] = $this->request->data['hs_'.$x.'_'.$item];	                       
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

        $menu = $this->GridButtons->returnButtons($user, false, 'basic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
      
}
