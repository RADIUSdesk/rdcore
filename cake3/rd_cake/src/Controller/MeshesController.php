<?php

namespace App\Controller;
use Cake\Core\Configure;
use GuzzleHttp\Client;
use Cake\I18n\FrozenTime;


use Cake\ORM\Query;
use Cake\Database\Expression\QueryExpression;

class MeshesController extends AppController{
  
    public $base         = "Access Providers/Controllers/Meshes/";   
    protected $owner_tree   = array();
    protected $main_model   = 'Meshes';
    protected $dead_after   = 900; //Default
    protected $node_dead_after   = 600; //Make the node quicker to flag
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('DynamicClients'); 
        $this->loadModel('Users');
        $this->loadModel('TreeTags');
        $this->loadModel('Nodes');
        
        //New change Nov2020
        $this->loadModel('Networks');
        $this->loadModel('Sites');
        $this->loadModel('Clouds');
      
        $this->loadModel('MeshExitCaptivePortals');
        $this->loadModel('MeshExits');
        $this->loadModel('Timezones');   
        $this->loadModel('Hardwares');
                 
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons'); 
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'Meshes'
        ]);
        
        $this->loadComponent('Notes', [
            'model'     => 'MeshNotes',
            'condition' => 'mesh_id'
        ]); 
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');        
    }
    
    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        //Get the default dead_after
        $this->dead_after       = $this->_getDefaultDeadAfter();
        $this->node_dead_after  = $this->_getDefaultDeadAfter();
        
        $query      = $this->{$this->main_model}->find();
        
        
        //==XWF FILTER ADD ON==
        if (($this->request->getQuery('xwf_filter'))&&($this->request->getQuery('xwf_filter') == 'true')) {

            //First get a list of captive portals with the xwf_enable = true;
            $ents_cp        = $this->{'MeshExitCaptivePortals'}->find()->where(['MeshExitCaptivePortals.xwf_enable' =>true])->all();
            $mesh_exit_list = [];
               
            foreach($ents_cp as $e){
                if(!in_array($e->mesh_exit_id,$mesh_exit_list)){
                    array_push($mesh_exit_list,$e->mesh_exit_id);
                }
            }
            
            //Now get a list of mesh exists that these captive portals belong to  
            $query_m = $this->{'MeshExits'}->find();
            $ents_exits = $query_m->where(function (QueryExpression $exp, Query $q)use($mesh_exit_list) {
                    return $exp->in('id',$mesh_exit_list);
                })->all();
                   
            //Now build a list of meshes that these exit points belong to
            $mesh_id_list = [];
            
            foreach($ents_exits as $e_exit){
                if(!in_array($e_exit->mesh_id,$mesh_id_list)){
                    array_push($mesh_id_list,$e_exit->mesh_id);
                }
            }
            
            $query->where(function (QueryExpression $exp, Query $q)use($mesh_id_list) {
                return $exp->in('Meshes.id',$mesh_id_list);
            });            
        }
        //==END XWF FILTER ADD ON==
        
        $this->CommonQuery->build_common_query($query, $user, ['Users','MeshNotes' => ['Notes'],'Nodes']); //AP QUERY is sort of different in a way
        
        $q_no_lomits = $query;

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (null !== $this->request->getQuery('limit')) {
            $limit = $this->request->getQuery('limit');
            $page = $this->request->getQuery('page');
            $offset = $this->request->getQuery('start');
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();
        $q_r    = $query->all();
        $items  = [];
        $ft_now = FrozenTime::now();
        $ft_dead= $ft_now->subSecond($this->dead_after);

        foreach ($q_r as $i) {     
			$now		= time();
			$node_count = 0;
			$nodes_up	= 0;
			$nodes_down	= 0;
			$node_list  = [];
			
			foreach($i->nodes as $node){
			
			    $node->last_contact_human = $this->TimeCalculations->time_elapsed_string($node->last_contact);
			    array_push($node_list,$node);

			    $l_contact      = $node->last_contact;
			    $last_timestamp = strtotime($l_contact);
	            if($last_timestamp+$this->node_dead_after <= $now){
	                $nodes_down++;
	            }else{
					$nodes_up++; 
	            }
				$node_count++;
			}

            $owner_id = $i->user_id;
            if (!array_key_exists($owner_id, $this->owner_tree)) {
                $owner_tree = $this->Users->find_parents($owner_id);
            } else {
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags = $this->Aa->get_action_flags($owner_id, $user);
              
            $notes_flag   = false;
            foreach($i->mesh_notes as $mn){
                if(!$this->Aa->test_for_private_parent($mn->note,$user)){
                    $notes_flag = true;
                    break;
                }
            }
                   
            $row        = [];
            $fields     = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};    
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'last_contact'){
                    $row['last_contact_in_words']   = 'never';
                    $row['last_contact_state']      = 'never';
                    
                    if($i->{"$field"} !== null){
                        $row['last_contact_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                        $row['last_contact_state'] = 'offline';
                        if($i->{"$field"}> $ft_dead){
                            $row['last_contact_state'] = 'online';  
                        }
                    }
                }   
            }
            $tree_tag           = $this->_tree_tags($i);
            $row['tree_tag']    = $tree_tag['value'];
            $row['node_count']  = $node_count;
			$row['nodes_up']    = $nodes_up;
			$row['nodes_down']  = $nodes_down;
			$row['node_list']   = $node_list;
			
			$row['notes']       = $notes_flag;           
            $row['owner']		= $owner_tree;
			$row['update']		= $action_flags['update'];
			$row['view']		= $action_flags['view'];
			$row['delete']		= $action_flags['delete'];
            
            array_push($items, $row);
        }
        
        $mesh_ids       = [0];
        $meshes_total   = $q_no_lomits->where()->all();
        if(count($meshes_total) >0){
            foreach($meshes_total as $m){
                array_push($mesh_ids,$m->id);    
            }
        }
        $meshes_up  = $q_no_lomits->where(['Meshes.last_contact >=' => $ft_dead])->count();
        $nodes_total= $this->{'Nodes'}->find()->where(['Nodes.mesh_id IN' => $mesh_ids])->count();
        $nodes_up   = $this->{'Nodes'}->find()->where(['Nodes.mesh_id IN' => $mesh_ids,'last_contact >=' => $ft_dead])->count();

        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'metaData'      => [
                'meshes_total'  => count($meshes_total),
                'meshes_up'     => $meshes_up,
                'nodes_total'   => $nodes_total,
                'nodes_up'      => $nodes_up,  
            ],
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items', 'success', 'totalCount','metaData')
        ));
    }

    
    public function add(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }    
        $this->_addOrEdit($user,'add');        
    }
    
    public function edit(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->_addOrEdit($user,'edit');
        
    }
    
    private function _addOrEdit($user,$type= 'add') {
    
        $user_id    = $user['id'];
        
        //TreeTag we now use network_id
        if(isset($this->request->data['network_id'])){
            $network_id     = $this->request->data['network_id']; //Will be in format Network_<id>
            $tree_tag_id    =  preg_replace('/^(\w+)_/', '', $network_id);//Then we use that value to populate the tree tag
            $this->request->data['tree_tag_id'] = $tree_tag_id;
        }
        
        $cdata = $this->request->getdata();

        if(isset($cdata['user_id'])){
            if($cdata['user_id'] == '0'){ //This is the holder of the token - override '0'
                $cdata['user_id'] = $user_id;
            }
        }         
        $check_items = [
			'available_to_siblings'
		];		
        foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }

        if($type == 'add'){ 
            $entity = $this->{$this->main_model}->newEntity($cdata);
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($cdata['id']);
            $this->{$this->main_model}->patchEntity($entity, $cdata);
        }
              
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

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);   
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
                $entity     = $this->{$this->main_model}->get($d['id']);  
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
	
	public function view(){
	   
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        $data   = [];
        $id     = $this->request->query['id'];      
        $q_m    =  $this->{'Meshes'}->find()->where(['Meshes.id' => $id ])->first();
        if($q_m){
            $data = $q_m->toArray();
        }
        
        $this->set(array(
            'data'      => $data,
            'success'   => true,
            '_serialize'=> array('success', 'data')
        ));
	}
	
	public function noteIndex(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $items = $this->Notes->index($user); 
    }
    
    public function noteAdd(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }   
        $this->Notes->add($user);
    }
    
    public function noteDel(){  
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->Notes->del($user);
    }
    
    
    //======= MESH entries ============
    public function meshEntriesIndex(){
        $this->loadModel('MeshEntries');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items      = array();
        $total      = 0;

        $mesh_id    = $this->request->getQuery('mesh_id');
        $q_r        = $this->MeshEntries->find()->contain(['MeshExitMeshEntries'])->where(['MeshEntries.mesh_id' => $mesh_id])->all();

        foreach($q_r as $m){
            $connected_to_exit = true;
            if(count($m->mesh_exit_mesh_entries) == 0){
                $connected_to_exit = false;
            }
            array_push($items,array(
                'id'            => $m->id,
                'mesh_id'       => $m->mesh_id,
                'name'          => $m->name,
                'hidden'        => $m->hidden,
                'isolate'       => $m->isolate,
                'apply_to_all'  => $m->apply_to_all,
                'encryption'    => $m->encryption,
                'special_key'   => $m->special_key,
                'auth_server'   => $m->auth_server,
                'auth_secret'   => $m->auth_secret,
                'dynamic_vlan'  => $m->dynamic_vlan,
                'frequency_band'=> $m->frequency_band,
                'connected_to_exit' => $connected_to_exit
            ));
        }
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));
    }

    public function meshEntryAdd(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $this->loadModel('MeshEntries');
        $entity = $this->{'MeshEntries'}->newEntity($this->request->data());
        
        if ($this->{'MeshEntries'}->save($entity)) {
            $id = $entity->id;
            if(isset($this->request->data['auto_nasid'])){ 
                $q_r    = $this->Meshes->find()->where(['Meshes.id' => $this->request->data['mesh_id']])->first();
                $m_name = $q_r->name;
                $mesh_name_underscored = preg_replace('/\s+/', '_', $m_name);
                $mesh_name_underscored = strtolower($mesh_name_underscored);
                $nasid = $mesh_name_underscored.'_meap_'.$id;
                $this->{$this->main_model}->patchEntity($entity, ['nasid' => $nasid]);
                $this->{'MeshEntries'}->save($entity);    
            }
        
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            $this->set(array(
                'errors'    => $this->JsonErrors->entityErros($entity, $message),
                'success'   => false,
                'message'   => array('message' => __('Could not create item')),
                '_serialize' => array('errors','success','message')
            ));
        }
    }
    
     public function meshEntryEdit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if ($this->request->is('post')) {
        
            $this->loadModel('MeshEntries');
        
             //Check if we have to auto gen this nasid
            if(isset($this->request->data['auto_nasid'])){ 
                $q_r = $this->{'Meshes'}->find()->where(['Meshes.id'=> $this->request->data['mesh_id']])->first();
                $m_name = $q_r->name;
                $mesh_name_underscored = preg_replace('/\s+/', '_', $m_name);
                $mesh_name_underscored = strtolower($mesh_name_underscored);
                $this->request->data['nasid'] = $mesh_name_underscored.'_meap_'.$this->request->data['id'];
            }

            $check_items = ['hidden','isolate','apply_to_all','accounting','auto_nasid'];
            foreach($check_items as $i){
                if(isset($this->request->data[$i])){
                    $this->request->data[$i] = 1;
                }else{
                    $this->request->data[$i] = 0;
                }
            }
            
            $entity = $this->{'MeshEntries'}->get($this->request->data['id']);
            $this->{'MeshEntries'}->patchEntity($entity, $this->request->data());

            // If the form data can be validated and saved...
            if ($this->{'MeshEntries'}->save($entity)) {
                   $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            }
        } 
    }
     
    public function meshSsidsView(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $items      = [];      
        $mesh_id    = $this->request->getQuery('mesh_id');
        
        $this->loadModel('MeshEntries');
        $query  = $this->{'MeshEntries'}->find()
                    ->where(['MeshEntries.mesh_id' => $mesh_id])
                    ->order(['MeshEntries.name']);                   
        $q_r      = $query->all();
        array_push($items,['id' => -1,'name'=> '** ALL SSIDs **']);
        foreach ($q_r as $i) {
            array_push($items,['id' => $i->id,'name'=> $i->name]);
        }
        
        $this->set(array(
            'items'     => $items,
            'success'   => true,
            '_serialize'=> array('success', 'items')
        ));
    }
    
    public function meshNodesView(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $items      = [];      
        $mesh_id    = $this->request->getQuery('mesh_id');
        
        $this->loadModel('Nodes');
        $query  = $this->{'Nodes'}->find()
                    ->where(['Nodes.mesh_id' => $mesh_id])
                    ->order(['Nodes.name']);                   
        $q_r      = $query->all();
        array_push($items,['id' => -1,'name'=> '** ALL NODES **']);
        foreach ($q_r as $i) {
            array_push($items,['id' => $i->id,'name'=> $i->name]);
        }
        
        $this->set(array(
            'items'     => $items,
            'success'   => true,
            '_serialize'=> array('success', 'items')
        ));
    }
    
    
    public function meshEntryView(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $this->loadModel('MeshEntries');
        $entity = $this->{'MeshEntries'}->get($this->request->query['entry_id']);
        $data   =  $entity->toArray();
        
        if($entity->macfilter != 'disable'){ 
            $this->loadModel('PermanentUsers');
            $q = $this->{'PermanentUsers'}->find()->where(['PermanentUsers.id' => $entity->permanent_user_id])->first();
            if($q){
                $data['username'] = $q->username;    
            }else{
                $data['username'] = "!!!User Missing!!!";
            }
        }

        $this->set(array(
            'data'     => $data,
            'success'   => true,
            '_serialize'=> array('success', 'data')
        ));
    }
    
    public function meshEntryDelete(){

       if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $fail_flag  = false;
        $this->loadModel('MeshEntries');

	    if(isset($this->request->data['id'])){   //Single item delete
            $entity = $this->{'MeshEntries'}->get($this->request->data['id']); 
            $this->{'MeshEntries'}->delete($entity );
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){    
                $entity = $this->{'MeshEntries'}->get($d['id']); 
                $this->{'MeshEntries'}->delete($entity );
            }
        }  
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }

    //======= MESH settings =======
	public function meshSettingsView(){
		/*$user = $this->_ap_right_check();
        if(!$user){
            return;
        }*/
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $user_id  = $user['id'];
        $tree     = false;     
        $entity = $this->Users->get($user_id); 
        if($this->Users->childCount($entity) > 0){
            $tree = true;
        }

        $id         = $this->request->query['mesh_id'];    
		Configure::load('MESHdesk'); 
        $data       = Configure::read('mesh_settings'); //Read the defaults
        
        $enable_grouping = Configure::read('MEHSdesk.enable_grouping');
        
        $this->loadModel('MeshSettings');
        
        $q_r = $this->{'MeshSettings'}->find()->where(['MeshSettings.mesh_id' => $id])->first(); 
        
        if($q_r){  
            $data = $q_r->toArray();
        }
        
        $q_m =  $this->{'Meshes'}->find()->where(['Meshes.id' => $id ])->contain(['Users'=> ['fields' => ['Users.username']]])->first();
        if($q_m){
            $data['name']                   = $q_m->name;
            $data['user_id']                = $q_m->user_id;
            $data['show_owner']             = $tree;
            $data['enable_grouping']        = $enable_grouping;
            
            if($q_m->user !== null){
                $data['username']  = "<div class=\"fieldBlue\"> <b>".$q_m->user->username."</b></div>";
            }else{
                $data['username']  = "<div class=\"fieldRed\"><i class='fa fa-exclamation'></i> <b>(ORPHANED)</b></div>";
            }
            $data['available_to_siblings']  = $q_m->available_to_siblings;
            $data['enable_alerts']          = $q_m->enable_alerts;
            $data['enable_overviews']       = $q_m->enable_overviews;        
            
            $data['tree_tag_id']            = $q_m->tree_tag_id;
            $tree_tag                       = $this->_tree_tags($q_m);
            if($tree_tag['value'] == 'not_tagged'){
                $data['tag_path']          = "<div class=\"fieldGrey\"><i class='fa fa-check-circle'></i> <b>(NOT IN GROUP)</b></div>";
            }elseif($tree_tag['value'] == 'orphaned'){
                $data['tag_path']          = "<div class=\"fieldRed\"><i class='fa fa-exclamation'></i> <b>(ORPHANED)</b></div>";
            }else{     
                $data['tag_path']   = "<div class=\"fieldBlue\" style=\"text-align:left;\"> <b>".$tree_tag['value']."</b></div>";
            }
            $data['network_id'] = $tree_tag['network_id'];
        }
        
        $this->set([
            'data'      => $data,
            'success'   => true,
            '_serialize'=> ['success', 'data']
        ]);
    }
    
    public function meshChangeTag(){
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $mesh_id        = false;
        $tree_tag_id    = false;

        $cquery = $this->request->getQuery();

        if(isset($cquery['mesh_id'])){
            $mesh_id = $cquery['mesh_id'];
        }
        
        if(isset($cquery['tree_tag_id'])){
            $tree_tag_id = $cquery['tree_tag_id'];
        }
        
        if(($mesh_id)&&($tree_tag_id)){
            $entity = $this->{$this->main_model}->get($mesh_id);
            if($entity){
                $entity->tree_tag_id = $tree_tag_id;
                $this->{$this->main_model}->save($entity);
            }
        }
    
        $this->set(array(
            'success'   => true,
            '_serialize'=> array('success')
        ));
    }
    
    public function meshSettingsEdit(){
        /*
		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }*/
        
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        $cdata = $this->request->getData();

        if ($this->request->is('post')) {

            //Unfortunately there are many check items which means they will not be in the POST if unchecked
            //so we have to check for them
            $check_items = array(
				'aggregated_ogms',
				'ap_isolation',
				'bonding',
				'fragmentation',
				'bridge_loop_avoidance',
				'distributed_arp_table',
				'encryption',
				'available_to_siblings'
			);
            foreach($check_items as $i){
                if(isset($cdata[$i])){
                    $cdata[$i] = 1;
                }else{
                    $cdata[$i] = 0;
                }
            }

            $mesh_id = $cdata['mesh_id'];
            //See if there is not already a setting entry
            $this->loadModel('MeshSettings');
            $entity    = $this->{'MeshSettings'}->find()->where(['MeshSettings.mesh_id' => $mesh_id])->first();
            if($entity){
                $this->{'MeshSettings'}->patchEntity($entity, $cdata);
            }else{
                $entity = $this->{'MeshSettings'}->newEntity($cdata);
            }
            
            if ($this->{'MeshSettings'}->save($entity)) {
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
    
    public function meshGeneralEdit(){
    
        /*
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        */
        

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $user_id    = $user['id'];
         
        if(isset($this->request->data['user_id'])){
            if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
                $this->request->data['user_id'] = $user_id;
            }
        }
        
        //TreeTag we now use network_id
        if(isset($this->request->data['network_id'])){
            $network_id     = $this->request->data['network_id']; //Will be in format Network_<id>
            $tree_tag_id    =  preg_replace('/^(\w+)_/', '', $network_id);//Then we use that value to populate the tree tag
            $this->request->data['tree_tag_id'] = $tree_tag_id;
        }
        
        
        $cdata = $this->request->getData();
        
        $check_items = [
			'available_to_siblings',
			'enable_overviews',
			'enable_alerts'		
		];
		
		foreach($check_items as $i){
            if(isset($cdata[$i])){
                $cdata[$i] = 1;
            }else{
                $cdata[$i] = 0;
            }
        }
         
        if ($this->request->is('post')) {
            $e = $this->{$this->main_model}->get($cdata['mesh_id']);        
            $this->{$this->main_model}->patchEntity($e, $cdata);
            if($this->{$this->main_model}->save($e)){
                $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            
            }else{
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($e,$message);  
            }
        } 
    }
    
    
    //======= MESH exits ============
    public function meshExitsIndex(){
        $this->loadModel('MeshExits');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items      = [];
        $total      = 0;

        $mesh_id    = $this->request->getQuery('mesh_id');

        $q_r        = $this->MeshExits->find()->contain(['MeshExitMeshEntries.MeshEntries'])->where(['MeshExits.mesh_id' => $mesh_id])->all();
        // print_r($q_r);

        foreach($q_r as $m){
            $exit_entries = array();
            foreach($m->mesh_exit_mesh_entries as $m_e_ent){
                if($m_e_ent['mesh_entry_id'] != 0){
                    array_push($exit_entries,['name' => $m_e_ent->mesh_entry->name]);
                }
                if($m_e_ent['mesh_entry_id'] == 0){
                    array_push($exit_entries,['name' => 'LAN']);
                }
            }

            array_push($items,array(
                'id'            => $m->id,
                'mesh_id'       => $m->mesh_id,
                'name'          => $m->name,
                'type'          => $m->type,
                'vlan'          => intval($m->vlan),
                'connects_with' => $exit_entries,
                'auto_detect'   => $m->auto_detect,

            ));
        }
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
    public function meshExitXwfCheck(){
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        Configure::load('MESHdesk');
        $xwf_uamhomepage = Configure::read('MEHSdesk.xwf_uamhomepage'); //Read the defaults
        
        $xwf_enabled = true;
        if($user['group_name'] == 'Access Providers'){
            $xwf_enabled = false;
            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $user['id']), "Access Providers/Controllers/TrafficClasses/index")){
                $xwf_enabled = true;
            }
        }
        
        $this->set(array(
            'data' => [
                'xwf_enabled'       => $xwf_enabled,
                'xwf_uamhomepage'   => $xwf_uamhomepage
            ],
            'success' => true,
            '_serialize' => array('data','success')
        ));
    }
    
    public function meshExitAdd(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $this->loadModel('MeshExitMeshEntries');
        $this->loadModel('MeshExits');
          
        if($this->request->data['type'] == 'captive_portal'){ 
            if(isset($this->request->data['auto_dynamic_client'])){
                $this->request->data['auto_dynamic_client'] = 1; 
            }else{
                $this->request->data['auto_dynamic_client'] = 0;
            }
            
            if(isset($this->request->data['auto_login_page'])){
                $this->request->data['auto_login_page'] = 1;
            }else{
                $this->request->data['auto_login_page'] = 0;
            }
        }
        
        $entity = $this->{'MeshExits'}->newEntity($this->request->data());
        
        if ($this->{'MeshExits'}->save($entity)) {
            $new_id = $entity->id;
            
            //---- openvpn_bridge -----
            if($this->request->data['type'] == 'openvpn_bridge'){
                
                $server_id  = $this->request->data['openvpn_server_id'];
                $this->loadModel('OpenvpnServers');
                $q_r        = $this->{'OpenvpnServers'}->find()->where(['OpenvpnServers.id' => $server_id])->first();
                if($q_r){    
                    $d_vpn_c                    = array();
                    $d_vpn_c['mesh_ap_profile'] = 'mesh';
                    $d_vpn_c['mesh_id']         = $this->request->data['mesh_id'];
                    $d_vpn_c['openvpn_server_id'] = $this->request->data['openvpn_server_id'];
                    $d_vpn_c['mesh_exit_id']    = $new_id;
                
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
                    $ent_c = $this->{'OpenvpnServerClients'}->newEntity($d_vpn_c);
                    $this->{'OpenvpnServerClients'}->save($ent_c);   
                }           
            }
            //---- END openvpn_bridge ------
            
            //===== Captive Portal ==========
            if($this->request->data['type'] == 'captive_portal'){

                $this->request->data['mesh_exit_id'] = $new_id;
                
                //----------- Easy to use enhancement --------------------
                //See if we have to formulate the value of the 'radius_nasid' if the user chose to auto add it 
                if(
                    ($this->request->data['auto_dynamic_client'] == 1)||
                    ($this->request->data['auto_login_page'] == 1)
                ){
                
                    //Get the Mesh so we can get the user_id and available_to_siblings for the said mesh
                    $mesh_id    = $this->request->data['mesh_id']; 
                    $mesh       = $this->{'Meshes'}->find()->where(['Meshes.id' => $mesh_id])->first();
                    $user_id    = $mesh->user_id;
                    $a_to_s     = $mesh->available_to_siblings;
                    $mesh_name  = $mesh->name;
                    $mesh_name  = preg_replace('/\s+/', '_', $mesh_name);
                                      
                    $dc_data                            = array();       	            
	                $dc_data['user_id']                 = $user_id;
	                $dc_data['available_to_siblings']   = $a_to_s;
	                $dc_data['nasidentifier']           = $mesh_name.'_mcp_'.$new_id;
	                
	                //Get a list of realms if the person selected a list - If it is empty that's fine
                    $count      = 0;
                    $dc_data['realm_list'] = ""; //Prime it
                    if (array_key_exists('realm_ids', $this->request->data)) {
                        foreach($this->request->data['realm_ids'] as $r){
                            if($count == 0){
                                $dc_data['realm_list'] = $this->request->data['realm_ids'][$count]; 
                            }else{
                                $dc_data['realm_list'] = $dc_data['realm_list'].",".$this->request->data['realm_ids'][$count];
                            }  
                            $count++;
                        }
                    }
                    
	                if($this->request->data['auto_dynamic_client'] == 1){    	                
                        $this->_add_dynamic($dc_data);
                    }
                    
                    if($this->request->data['auto_login_page'] == 1){ 
	                    $dc_data['dynamic_detail_id'] = $this->request->data['dynamic_detail_id'];
	                    $this->_add_dynamic_pair($dc_data);
	                }
                                      
                    //Set the radius_nasid
                    $this->request->data['radius_nasid'] = $dc_data['nasidentifier'];  
                }
                //----------- END Easy to use enhancement --------------------
                 
                $this->loadModel('MeshExitCaptivePortals');
				$check_items = [
					'swap_octets',
					'mac_auth',
                    'proxy_enable',
                    'dns_manual',
                    'uamanydns',
                    'dnsparanoia',
                    'dnsdesk',
                    'xwf_enable',
                    'xwf_bw_enable'
				];
			    foreach($check_items as $i){
			        if(isset($this->request->data[$i])){
			            $this->request->data[$i] = 1;
			        }else{
			            $this->request->data[$i] = 0;
			        }
			    }
			    
			    if($this->request->data['dns_manual'] == 0){
			        //Clear any values
			        $this->request->data['dns1'] = '';
			        $this->request->data['dns2'] = '';
			    }
			    
			    if(isset($this->request->data['xwf_radiuslocationname'])){
			        if($this->request->data['xwf_radiuslocationname'] !== ''){			    
			            Configure::load('MESHdesk');
                        $xwf_locationprefix = Configure::read('MEHSdesk.xwf_locationprefix'); //Read the defaults
                        $this->request->data['xwf_radiuslocationname'] = $xwf_locationprefix.$this->request->data['xwf_radiuslocationname'];
                    }
                }		    
			    
			    $ent_cp = $this->{'MeshExitCaptivePortals'}->newEntity($this->request->data);
			    
                if(!($this->{'MeshExitCaptivePortals'}->save($ent_cp))){
                    $this->{'MeshExits'}->delete($entity);
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($ent_cp,$message); 
                    return;
                }
            }
            //==== End of Captive Portal ====
                       
            //===== NAT ==========
            //== Remove any existing MeshExitSettings ====
            if($this->request->getData('type') == 'nat'){
                $this->loadModel('MeshExitSettings');
                $nat_data       = $this->request->getData();
                $mesh_exit_id   = $new_id;
            
                if($nat_data['nat_config'] == 'manual'){
                    foreach(array_keys($nat_data) as $key){
                        if(preg_match('/^nat_/',$key)){
                            if($key == 'nat_config'){
                                continue;
                            }
                            if($nat_data[$key] == ''){
                                continue;
                            }
                            $s_data = ['mesh_exit_id' => $mesh_exit_id,'name'  => $key,'value' => $nat_data[$key]];
                            $s = $this->{'MeshExitSettings'}->newEntity($s_data); 
                            $s = $this->{'MeshExitSettings'}->save($s);
                        }
                    }   
                }           
            }       
            //==== END NAT ========

            //Add the entry points
            $count      = 0;
            $entry_ids  = [];
            
            if (array_key_exists('entry_points', $this->request->data)) {
                if(!empty($this->request->data['entry_points'])){
                    foreach($this->request->data['entry_points'] as $e){
                        if($e != ''){
                            array_push($entry_ids,$this->request->data['entry_points'][$count]);
                        }
                        $count++;      
                    }
                }
            }

            foreach($entry_ids as $id){	
                $data = [];
                $data['mesh_exit_id']  = $new_id;
                $data['mesh_entry_id'] = $id; 
                $ent_me_me = $this->{'MeshExitMeshEntries'}->newEntity($data);
                $this->{'MeshExitMeshEntries'}->save($ent_me_me);
            }

            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }else{
            $message = 'Error';
            $this->set(array(
                'errors'    => $this->JsonErrors->entityErros($entity, $message),
                'success'   => false,
                'message'   => array('message' => __('Could not create item')),
                '_serialize' => array('errors','success','message')
            ));
        }
    }
    
     public function meshExitView(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $this->loadModel('MeshExits');  
        $ent_me = $this->{'MeshExits'}->find()
            ->where(['MeshExits.id' => $this->request->query['exit_id']])
            ->contain(['MeshExitMeshEntries','MeshExitCaptivePortals','MeshExitSettings'])
            ->first();

        //entry_points
        $data['MeshExit']['entry_points'] = [];
        foreach($ent_me->mesh_exit_mesh_entries as $i){
            array_push($data['MeshExit']['entry_points'],intval($i->mesh_entry_id));
        }       

        if($ent_me->mesh_exit_captive_portal){
            $this->loadModel('MeshExitCaptivePortals');
            $fields     = $this->{'MeshExitCaptivePortals'}->schema()->columns();
            
            foreach($fields as $item){
                $data['MeshExit']["$item"] = $ent_me->mesh_exit_captive_portal->{"$item"};
            }
            //Upstream VLAN id (if applicable)
            if($ent_me->mesh_exit_captive_portal->mesh_exit_upstream_id){
                $data['MeshExit']['mesh_exit_upstream_id'] = $ent_me->mesh_exit_captive_portal->mesh_exit_upstream_id;
            }else{
                $data['MeshExit']['mesh_exit_upstream_id'] = 0;
            }
            
            Configure::load('MESHdesk');
            if($data['MeshExit']['xwf_uamhomepage'] == ''){
                $xwf_uamhomepage = Configure::read('MEHSdesk.xwf_uamhomepage'); //Read the defaults
                $data['MeshExit']['xwf_uamhomepage'] = $xwf_uamhomepage;
            }
            
            if($data['MeshExit']['xwf_radiuslocationname'] !== ''){     
                $xwf_locationprefix = Configure::read('MEHSdesk.xwf_locationprefix'); //Read the defaults
                $data['MeshExit']['xwf_radiuslocationname'] = preg_replace("/^$xwf_locationprefix/",'', $data['xwf_radiuslocationname']);          
            }       
        }
        
        $fields    = $this->{'MeshExits'}->schema()->columns();
        foreach($fields as $field){  
            $data['MeshExit']["$field"]= $ent_me->{"$field"};
        }
        
        $data['MeshExit']['rb_nat_config'] = ['nat_config' =>'auto']; 
        foreach($ent_me->mesh_exit_settings as $s){
            $data['MeshExit']['rb_nat_config']   = ['nat_config' =>'manual'];    
            $data['MeshExit']["$s->name"]        = $s->value;
        }     
        unset($ent_me->mesh_exit_settings);
          
        $data = $data['MeshExit'];

        $this->set([
            'data'      => $data,
            'success'   => true,
            '_serialize'=> ['success', 'data']
        ]);
    }
    
    public function meshExitDelete(){

       if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $fail_flag  = false;
        
        $this->loadModel('MeshExits');

	    if(isset($this->request->data['id'])){   //Single item delete
            $entity     = $this->{'MeshExits'}->get($this->request->data['id']); 
            $this->{'MeshExits'}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{'MeshExits'}->get($d['id']); 
                $this->{'MeshExits'}->delete($entity);
            }
        }  
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }
    
    public function meshExitEdit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if ($this->request->is('post')) {
        
            $this->loadModel('MeshExits');
            $this->loadModel('MeshExitMeshEntries');
   
            //---- openvpn_bridge -----
            if($this->request->data['type'] == 'openvpn_bridge'){
            
                $this->loadModel('OpenvpnServers');
                $this->loadModel('OpenvpnClients');
                
                $server_id  = $this->request->data['openvpn_server_id'];
                
                //We will only do the following if the selected OpenvpnServer changed
                $ent_exit           = $this->{'MeshExits'}->find()->where(['MeshExits.id' => $this->request->data['id']])->first();
                $current_server_id  = $ent_exit->openvpn_server_id;
                $server_id          = $this->request->data['openvpn_server_id'];
                
                if($current_server_id !== $server_id){
                    //Delete old one 
                    $this->{'OpenvpnServerClients'}->deleteAll(
                        ['OpenvpnServerClients.openvpn_server_id' => $current_server_id]
                    );
                    
                    $ent_s  = $this->{'OpenvpnServers'}->find()->where(['OpenvpnServers.id' => $server_id])->first();
                    if($ent_s){    
                        $d_vpn_c                        = array();
                        $d_vpn_c['mesh_ap_profile']     = 'mesh';
                        $d_vpn_c['mesh_id']             = $this->request->data['mesh_id'];
                        $d_vpn_c['openvpn_server_id']   = $this->request->data['openvpn_server_id'];
                        $d_vpn_c['mesh_exit_id']        = $this->request->data['id'];
                    
                        $next_ip            = $ent_s->vpn_bridge_start_address;
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
                        $ent_c = $this->{'OpenvpnServerClients'}->newEntity($d_vpn_c);
                        $this->{'OpenvpnServerClients'}->save($ent_c);   
                    }    
                }           
            }
            //---- END openvpn_bridge ------
            

            //===== Captive Portal ==========
            //== First see if we can save the captive portal data ====
            if($this->request->data['type'] == 'captive_portal'){
            
                $this->loadModel('MeshExitCaptivePortals');
                $cp_data        = $this->request->data;
                $mesh_exit_id   = $this->request->data['id'];
                
                $ent_cp         = $this->{'MeshExitCaptivePortals'}->find()
                    ->where(['MeshExitCaptivePortals.mesh_exit_id' => $mesh_exit_id])
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
                        'xwf_enable',
                        'xwf_bw_enable'
					];
					foreach($check_items as $i){
					    if(isset($this->request->data[$i])){
					        $cp_data[$i] = 1;
					    }else{
					        $cp_data[$i] = 0;
					    }
					}
					
					 if($cp_data['dns_manual'] == 0){
			            //Clear any values
			            $cp_data['dns1'] = '';
			            $cp_data['dns2'] = '';
			        }
					
				    if(isset($cp_data['xwf_radiuslocationname'])){
					    if($cp_data['xwf_radiuslocationname'] !== ''){
					        Configure::load('MESHdesk');
                            $xwf_locationprefix = Configure::read('MEHSdesk.xwf_locationprefix'); //Read the defaults
                            $cp_data['xwf_radiuslocationname'] = $xwf_locationprefix.$cp_data['xwf_radiuslocationname'];
                        }
                    }

                   // print_r($cp_data);
                   $this->{'MeshExitCaptivePortals'}->patchEntity($ent_cp, $cp_data);
                   
                   if(!($this->{'MeshExitCaptivePortals'}->save($ent_cp))){
                        $message = __('Could not update item');
                        $this->JsonErrors->entityErros($ent_cp,$message); 
                        return;
                    }
                }
            }
            //==== End of Captive Portal ====
            
            //===== NAT ==========
            //== Remove any existing MeshExitSettings ====
            if($this->request->getData('type') == 'nat'){
                $this->loadModel('MeshExitSettings');
                $nat_data       = $this->request->getData();
                $mesh_exit_id   = $nat_data['id'];
            
                $settings = $this->{'MeshExitSettings'}->find()
                    ->where(['MeshExitSettings.mesh_exit_id' => $mesh_exit_id])
                    ->all();
                foreach($settings as $s){
                    if(preg_match('/^nat_/',$s->name)){
                        $this->{'MeshExitSettings'}->delete($s);
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
                            $s_data = ['mesh_exit_id' => $mesh_exit_id,'name'  => $key,'value' => $nat_data[$key]];
                            $s = $this->{'MeshExitSettings'}->newEntity($s_data); 
                            $s = $this->{'MeshExitSettings'}->save($s);
                        }
                    }   
                }           
            }       
            //==== END NAT ========

            // If the form data can be validated and saved...
            $ent_exit = $this->{'MeshExits'}->get($this->request->data['id']);
            $this->{'MeshExits'}->patchEntity($ent_exit, $this->request->data());
            
            
            if ($this->{'MeshExits'}->save($ent_exit)) {

                //Add the entry points
                $count      = 0;
                $entry_ids  = array();
                $new_id     = $this->request->data['id'];

                //Clear previous ones first:
                $this->{'MeshExitMeshEntries'}->deleteAll(['MeshExitMeshEntries.mesh_exit_id' => $new_id]);

                $entry_ids  = [];
            
                if (array_key_exists('entry_points', $this->request->data)) {
                    if(!empty($this->request->data['entry_points'])){
                        foreach($this->request->data['entry_points'] as $e){
                            if($e != ''){
                                array_push($entry_ids,$this->request->data['entry_points'][$count]);
                            }
                            $count++;      
                        }
                    }
                }

                //Only if empty was not specified
                if(count($entry_ids)>0){
                    foreach($entry_ids as $id){
						$data = array();
                        $data['mesh_exit_id']  = $new_id;
                        $data['mesh_entry_id'] = $id;
                        $ent_ent = $this->{'MeshExitMeshEntries'}->newEntity($data);
                        $this->{'MeshExitMeshEntries'}->save($ent_ent);
                    }
                }

                $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            }
        } 
    } 
    
    public function meshExitUpstreamList(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $id     = $this->request->query['mesh_id'];
  
        $this->loadModel('MeshExits');
        
        $ent_exit_list  = $this->{'MeshExits'}->find()
            ->where([
            'MeshExits.mesh_id'  => $id,
            'MeshExits.type'     => 'tagged_bridge_l3',
            ])->all(); 
        
        $items  = [
            ['name'=> 'LAN (Ethernet0)', 'id' => 0 ]
        ];
        
        foreach($ent_exit_list as $i){
            array_push($items,['name' => "VLAN ".$i->vlan,'id' => intval($i->id)]);
        }
        
        $this->set(array(
            'items'     => $items,
            'success'   => true,
            '_serialize'=> array('success', 'items')
        ));
    }
    
    public function meshExitAddDefaults(){
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
            'success'   => true,
            '_serialize'=> ['success', 'data']
        ]);
    }
    //===== Mesh nodes ======
    
    public function meshEntryPoints(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        //Get the mesh id
        $mesh_id    = $this->request->query['mesh_id'];

        $exit_id = false;

        //Check if the exit_id was included
        if(isset($this->request->query['exit_id'])){
            $exit_id = $this->request->query['exit_id'];
        }
            
        $this->loadModel('MeshExits');
        $this->loadModel('MeshEntries');
        $this->loadModel('MeshExitMeshEntries');

        $ent_q_r    = $this->{'MeshEntries'}->find()
            ->where(['MeshEntries.mesh_id' => $mesh_id])
            ->contain(['MeshExitMeshEntries'])
            ->all(); 

        $items = array();
        //array_push($items,array('id' => 0, 'name' => "Eth1 (If Hardware Suports It)")); //Allow the user not to assign at this stage
        foreach($ent_q_r as $i){

            //If this entry point is already associated; we will NOT add it
            if(count($i->mesh_exit_mesh_entries)== 0){
                $id = intval($i->id);
                $n  = $i->name;
                array_push($items,array('id' => $id, 'name' => $n));
            }

            //if $exit_id is set; we add it 
            if($exit_id){
                if(count($i->mesh_exit_mesh_entries)> 0){
                    if($i->mesh_exit_mesh_entries[0]['mesh_exit_id'] == $exit_id){
                        $id = intval($i->id);
                        $n  = $i->name;
                        array_push($items,array('id' => $id, 'name' => $n));
                    }
                }
            }
        }
        
        //LAN check
        $q_eth1_entry = $this->{'MeshExitMeshEntries'}->find()
            ->contain(['MeshExits'])
            ->where(['MeshExits.mesh_id' => $mesh_id,'MeshExitMeshEntries.mesh_entry_id' => 0])
            ->first();
        
        if($q_eth1_entry){
            //Only if it is for this exit
            if($q_eth1_entry->mesh_exit_id == $exit_id){
                array_push($items,array('id' => 0, 'name' => "LAN")); //Used here so we can show it
            }   
        }else{
            array_push($items,array('id' => 0, 'name' => "LAN")); //Not used up yet
        }
        
         
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
    
    //-- List available encryption options --
    public function encryptionOptions(){

        $items = array();
		Configure::load('MESHdesk');
        $ct = Configure::read('encryption');
        foreach($ct as $i){
            if($i['active']){
                array_push($items, $i);
            }
        }

        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }

    //-- List available hardware options --
    
//================PORT MAPS=============
	public function mapPrefView(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        Configure::load('MESHdesk');
        $user_id    = $user['id'];
        $items		= array();
        $mapApiKey  = "";
        $mapType    = "";

		if(!isset($this->request->query['mesh_id'])){
		    $items  = [];
		    $items['zoom']   = Configure::read('mesh_specifics.map.zoom');
		    $items['type']   = Configure::read('mesh_specifics.map.type');
		    $items['lat']    = Configure::read('mesh_specifics.map.lat');
		    $items['lng']    = Configure::read('mesh_specifics.map.lng');
		    $items['map_to_use'] = 'google';
		    $items['google_map_api_key'] = Configure::read('mesh_specifics.map.api_key');
			$this->set([
		        'data'	        => $items,
		        'success'       => true,
		        '_serialize'    => ['success','data']
		    ]);
			return;
		}

		$mesh_id = $this->request->query['mesh_id'];
		
		$this->loadModel('MeshSettings');
        $this->loadModel('MeshSpecifics');
        $this->loadModel('UserSettings');
   	    $q_r = $this->{'MeshSpecifics'}->find()->where(['MeshSpecifics.mesh_id' => $mesh_id,'MeshSpecifics.name' => 'map_zoom'])->first();
   	    
        //Check for personal overrides
        $q_r_google     = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'google_map_api_key'])->first();
        $q_r_baidu      = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'baidu_map_api_key'])->first();
        $q_r_map_pref   = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'map_to_use'])->first();


		
    	$zoom = Configure::read('mesh_specifics.map.zoom');
    	//Check for personal overrides
 
        if($q_r){
            $zoom = intval($q_r->value);
        }

        $type = Configure::read('mesh_specifics.map.type');
        //Check for overrides
        $q_r = $this->{'MeshSpecifics'}->find()->where(['MeshSpecifics.mesh_id' => $mesh_id,'MeshSpecifics.name' => 'map_type'])->first();
        if($q_r){
            $type = $q_r->value;
        }

        $lat = Configure::read('mesh_specifics.map.lat');
        //Check for overrides
        $q_r = $this->{'MeshSpecifics'}->find()->where(['MeshSpecifics.mesh_id' => $mesh_id,'MeshSpecifics.name' => 'map_lat'])->first();
        if($q_r){
            $lat = $q_r->value+0;
        }

        $lng = Configure::read('mesh_specifics.map.lng');
        //Check for overrides
        $q_r = $this->{'MeshSpecifics'}->find()->where(['MeshSpecifics.mesh_id' => $mesh_id,'MeshSpecifics.name' => 'map_lng'])->first();
        if($q_r){
            $lng = $q_r->value+0;
        }

        $items['zoom']      = $zoom;
        $items['type']      = $type;
        $items['lat']       = $lat;
        $items['lng']       = $lng;
        
        $items['map_zoom']  = $zoom;
        $items['map_type']  = $type;
        $items['map_lat']   = $lat;
        $items['map_lng']   = $lng;
        
        $items['google_map_api_key'] = Configure::read('mesh_specifics.map.api_key');
        if($q_r_google){
            $items['google_map_api_key'] = $q_r_google->value;
        }     
        if($q_r_baidu){
            $items['baidu_map_api_key'] = $q_r_baidu->value;
        }
        $items['map_to_use'] = 'google';
        if($q_r_map_pref){
            $items['map_to_use'] = $q_r_map_pref->value;
        }
        $this->set(array(
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => array('success','data')
        ));
    }

	public function mapPrefEdit(){
		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->loadModel('MeshSpecifics');
        $user_id    = $user['id'];
		$mesh_id 	= $this->request->data['mesh_id'];
		$items_to_check = ['map_zoom','map_type','map_lat','map_lng'];
        foreach($items_to_check as $item){
            if(array_key_exists($item,$this->request->data)){
                $ent = $this->{'MeshSpecifics'}->find()->where(['MeshSpecifics.mesh_id' => $mesh_id,'MeshSpecifics.name' => $item])->first();
                if($ent){
                    $this->{'MeshSpecifics'}->patchEntity($ent,['value' => $this->request->data[$item]]);
                }else{
                    $ent = $this->{'MeshSpecifics'}->newEntity(['mesh_id' => $mesh_id,'name' => $item,'value' => $this->request->data[$item]]);                 
                }
                $this->{'MeshSpecifics'}->save($ent);
            }        
        }
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
	}

	public function mapNodeSave(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        if(isset($this->request->query['id'])){
		    $this->loadModel('Nodes');
		    $ent = $this->{'Nodes'}->find()->where(['Nodes.id' => $this->request->query['id']])->first();
		    if($ent){
		        if(isset($this->request->query['lng'])){
		            $this->{'Nodes'}->patchEntity($ent,['lat' => $this->request->query['lat'],'lon' => $this->request->query['lng']]);
		        }else{
		            $this->{'Nodes'}->patchEntity($ent,['lat' => $this->request->query['lat'],'lon' => $this->request->query['lon']]);
		        }
		        $this->{'Nodes'}->save($ent);
		    }
        }

		$this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
	}

	public function mapNodeDelete(){	
		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id']; 
		if(isset($this->request->query['id'])){
		    $this->loadModel('Nodes');
		    $ent = $this->{'Nodes'}->find()->where(['Nodes.id' => $this->request->query['id']])->first();
		    if($ent){
		        $this->{'Nodes'}->patchEntity($ent,['lat' => null,'lon' => null]);
		        $this->{'Nodes'}->save($ent);
		    }
        }
		$this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
	}

	public function nodesAvailForMap(){
		//List all the nodes that has not yet been assigned a lat (and lon) value for a mesh
		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $items		= [];

		if(!isset($this->request->query['mesh_id'])){
			$this->set([
		        'message'	    => ["message"	=>"Mesh ID (mesh_id) missing"],
		        'success'       => false,
		        '_serialize'    => ['success','message']
		    ]);
			return;
		}
	    $this->loadModel('Nodes');
	    
		$mesh_id    = $this->request->query['mesh_id'];
		$ent_nodes  = $this->{'Nodes'}->find()->where(['Nodes.mesh_id' => $mesh_id,'Nodes.lat IS NULL'])->all();
		$items 		= [];
		foreach($ent_nodes as $i){
			array_push($items,[
				'id' 			=> $i->id,
				'name'			=> $i->name,
				'description'	=> $i->description
			]);
		}

		$this->set([
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
	}

//===========END PORT MAPS====================
   
    public function meshNodesIndex(){
        $this->loadModel('Nodes');
        $this->loadModel('NodeSettings');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items      = [];
        $total      = 0;

        $mesh_id    = $this->request->getQuery('mesh_id');

        $q_r        = $this->Nodes->find()->contain([
            'NodeMeshEntries.MeshEntries',
            'NodeMeshExits.MeshExits',
            'NodeConnectionSettings'
        ])->where(['Nodes.mesh_id' => $mesh_id])->all();

        //Create a hardware lookup for proper names of hardware
        $hardware = [];
        
        $q_hw = $this->{'Hardwares'}->find()->where(['Hardwares.for_mesh' => true])->all();
        if($q_hw){
            foreach($q_hw as $hw){
                $id     = $hw->fw_id;
                $name   = $hw->name; 
                $hardware["$id"]= $name;
            }
        }  

        //Check if we need to show the override on the power
        $power_override = false;

        $ns	 = $this->NodeSettings->find()->where(['NodeSettings.mesh_id' => $mesh_id])->first();

        if($ns){
            if($ns->all_power == 1){
                $power_override = true;
                $power 			= $ns->power;
            }
        }else{
            $data       = Configure::read('common_node_settings'); //Read the defaults
            if($data['all_power'] == true){
                $power_override = true;
                $power 			= $data['power'];
            }
        }

        foreach($q_r as $m){
            $static_entries = [];
            $static_exits   = [];
            foreach($m->node_mesh_entries as $m_e_ent){
                array_push($static_entries,array('name' => $m_e_ent->mesh_entry->name));
            }

            foreach($m->node_mesh_exits as $m_e_exit){
                array_push($static_exits,array('name'   => $m_e_exit->mesh_exit->id));
            }

            if($power_override){
                $p = $power;
            }else{
                $p = $m->power;
            }
            $wbw_active = false;
            if($m->node_connection_settings){
                foreach($m->node_connection_settings as $ent_ncs){
                    if($ent_ncs->grouping == 'wbw_setting'){
                        $wbw_active = true;
                        break;
                    }
                }
            }


            $hw_id = $m->hardware;
            array_push($items,array(
                'id'            => $m->id,
                'mesh_id'       => $m->mesh_id,
                'name'          => $m->name,
                'description'   => $m->description,
                'mac'           => $m->mac,
                'hardware'      => $hw_id,
                'hw_human'      => $hardware["$hw_id"],
                'power'         => $p,
                'ip'			=> $m->ip,
                'last_contact'	=> $m->last_contact,
                'lat'			=> $m->lat,
                'lng'			=> $m->lon,
                'static_entries'=> $static_entries,
                'static_exits'  => $static_exits,
                'ip'            => $m->ip,
                'wbw_active'    => $wbw_active
            ));
        }
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));

    }

    public function meshExitViewEthBr(){
        $this->loadModel('MeshExits');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $id    = $this->request->getQuery('mesh_id');
        $q_r   = $this->MeshExits->find()->where(['MeshExits.mesh_id' => $id])->contain(['MeshExitMeshEntries' => ['MeshEntries']])->all();
        $data  = [];
        //array_push($data, ['id' => 0, 'name' => 'LAN']); //First entry

        foreach($q_r as $i){
            $entries = [];
            if(isset($i->mesh_exit_mesh_entries)){
                foreach($i->mesh_exit_mesh_entries as $m_ex_ment){
                    if(isset($m_ex_ment->mesh_entry)){
                        array_push($entries,['name' => $m_ex_ment->mesh_entry->name]);
                    }                 
                }      
            }
            array_push($data, ['id'=> $i->id,'name' => $i->type,'type'=> $i->type,'entries' => $entries]);
        }

        $this->set(array(
            'items'     => $data,
            'success'   => true,
            '_serialize'=> array('success', 'items')
        ));
    }

    public function nodeCommonSettingsView(){
        $this->loadModel('NodeSettings');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $id         = $this->request->getQuery('mesh_id');
        $data       = $this->_getDefaultSettings();
        $q_r        = $this->NodeSettings->find()->where(['NodeSettings.mesh_id' => $id])->contain(['Schedules'])->first();

        if($q_r){
            //print_r($q_r);
            $data = $q_r;
            //We need to find if possible the number for the timezone
            $ent_tz  = $this->{'Timezones'}->find()->where(['Timezones.name' => $q_r->tz_name])->first();
            if($ent_tz){
                $data['timezone']   = $ent_tz->id;
            }    
            $data['eth_br_with']= intval($data['eth_br_with']);
            if($data['schedule_id'] !== null){
                $data['schedule_name'] = $data->schedule->name;
            }
        }
              
        $this->set([
            'data'      => $data,
            'success'   => true,
            '_serialize'=> ['success', 'data']
        ]);
    }
    
     public function nodeCommonSettingsEdit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if ($this->request->is('post')) {

            //Unfortunately there are many check items which means they will not be in the POST if unchecked
            //so we have to check for them
            $check_items = ['all_power','eth_br_chk','eth_br_for_all', 'gw_use_previous','gw_auto_reboot','enable_adv_reporting','enable_schedules'];
            foreach($check_items as $i){
                if(isset($this->request->data[$i])){
                    $this->request->data[$i] = 1;
                }else{
                    $this->request->data[$i] = 0;
                }
            }

            //Try to find the timezone and its value
            $tz_id  = $this->request->getData('timezone');
            $ent_tz  = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
            if($ent_tz){
                $this->request->data['tz_name']     = $ent_tz->name;
                $this->request->data['tz_value']    = $ent_tz->value;
            }     
            
            $mesh_id = $this->request->data['mesh_id'];
            //See if there is not already a setting entry        
            $this->loadModel('NodeSettings');
            
            $ent_setting  = $this->{'NodeSettings'}->find()->where(['NodeSettings.mesh_id' => $mesh_id])->first();
            
            $new_pwd = $this->_make_linux_password($this->request->data['password']);
			$this->request->data['password_hash'] = $new_pwd;

            if($ent_setting){
			    $this->{'NodeSettings'}->patchEntity($ent_setting,$this->request->data);
            }else{ //There was no settings entry so we need to create a new one
                $ent_setting = $this->{'NodeSettings'}->newEntity($this->request->data);
            }          
            
            if ($this->{'NodeSettings'}->save($ent_setting)) {
                   $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            }
        }
    }
    
    public function meshNodeAdd(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        //Unset the id
        unset($this->request->data['id']); //Remove the ID which is set to 0 (Zero) for ADD actions
      
        $this->loadModel('NodeMeshEntries');
        $this->loadModel('NodeMeshExits');
        $this->loadModel('Nodes');
        $this->loadModel('NodeWifiSettings');
        
        $this->loadModel('UnknownNodes');   
        $this->loadModel('NodeActions');
        $this->loadModel('NodeConnectionSettings');
        
        //Determine what the IP Address must be
        $ip = $this->{'Nodes'}->get_ip_for_node($this->request->data['mesh_id']);
        $this->request->data['ip'] = $ip; 
        
        $check_items = [
		    'enable_overviews',
		    'enable_alerts'		
	    ];
	    
	    foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        } 
        
        $ent_node = $this->{'Nodes'}->newEntity($this->request->data); 
        
        if ($this->{'Nodes'}->save($ent_node)) {

            $new_id = $ent_node->id;

            //29March Delete regardless - It might be that they add it even though they did not know it was in
            //unknown nodes
            $mac			= $this->request->data['mac']; 
            $this->{'UnknownNodes'}->deleteAll(['UnknownNodes.mac' => $mac]);

            //Add the entry points
            $count      = 0;
            $entry_ids  = [];
            $empty_flag = false;
                 
            if($this->request->getData('internet_connection') == 'wifi'){
                foreach(array_keys($this->request->data) as $key){
                    if(preg_match('/^wbw_/',$key)){
                        //If it comes from the auto cp it will have wbw_freq whech we have to determine based on the hardware if it will be radio0 or radio1
                        //If it comes from the GUI it will have wbw_device
                        if($key == 'wbw_freq'){
                            $freq       = $this->request->data["$key"];
                            $key        = 'wbw_device'; //We replace wbw_freq with wbw_device
                            $hardware   = $this->request->data['hardware'];
                            $device     = 'radio'.$this->_get_radio_for($hardware,$freq); 
                            $this->request->data["$key"] = $device;
                        }
                    
                        $d_wbw = [];
                        $d_wbw['node_id']    = $new_id;
                        $d_wbw['grouping']   = 'wbw_setting';
                        $d_wbw['name']       = preg_replace('/^wbw_/', '', $key);
                        $d_wbw['value']      = $this->request->data["$key"];
                                        
                        $ent_wbw = $this->{'NodeConnectionSettings'}->newEntity($d_wbw);  
                        $this->{'NodeConnectionSettings'}->save($ent_wbw);    
                    }
                }  
            }
                    
            if($this->request->getData('internet_connection') == 'wan_static'){
                foreach(array_keys($this->request->data) as $key){
                    if(preg_match('/^wan_static_/',$key)){
                        $d_ws = [];
                        $d_ws['node_id']    = $new_id;
                        $d_ws['grouping']   = 'wan_static_setting';
                        $d_ws['name']       = preg_replace('/^wan_static_/', '', $key);
                        $d_ws['value']      = $this->request->data["$key"];
                        $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                        $this->{'NodeConnectionSettings'}->save($ent_ws);    
                    }
                }               
            }
            
            if($this->request->getData('internet_connection') == 'wan_pppoe'){
                foreach(array_keys($this->request->data) as $key){
                    if(preg_match('/^wan_pppoe_/',$key)){
                        $d_ws = [];
                        $d_ws['node_id']    = $new_id;
                        $d_ws['grouping']   = 'wan_pppoe_setting';
                        $d_ws['name']       = preg_replace('/^wan_pppoe_/', '', $key);
                        $d_ws['value']      = $this->request->data["$key"];
                        $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                        $this->{'NodeConnectionSettings'}->save($ent_ws);    
                    }
                }               
            }
            
            if($this->request->getData('internet_connection') == 'wifi_static'){
                foreach(array_keys($this->request->data) as $key){
                    if(preg_match('/^wifi_static_/',$key)){
                        $d_ws = [];
                        $d_ws['node_id']    = $new_id;
                        $d_ws['grouping']   = 'wifi_static_setting';
                        $d_ws['name']       = preg_replace('/^wifi_static_/', '', $key);
                        $d_ws['value']      = $this->request->data["$key"];
                        $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                        $this->{'NodeConnectionSettings'}->save($ent_ws);    
                    }
                }               
            }
            
            if($this->request->getData('internet_connection') == 'wifi_pppoe'){
                foreach(array_keys($this->request->data) as $key){
                    if(preg_match('/^wifi_pppoe_/',$key)){
                        $d_ws = [];
                        $d_ws['node_id']    = $new_id;
                        $d_ws['grouping']   = 'wifi_pppoe_setting';
                        $d_ws['name']       = preg_replace('/^wifi_pppoe_/', '', $key);
                        $d_ws['value']      = $this->request->data["$key"];
                        $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                        $this->{'NodeConnectionSettings'}->save($ent_ws);    
                    }
                }               
            }
            
            if($this->request->getData('internet_connection') == 'qmi'){
                foreach(array_keys($this->request->data) as $key){
                    if(preg_match('/^qmi_/',$key)){
                        $d_ws = [];
                        $d_ws['node_id']    = $new_id;
                        $d_ws['grouping']   = 'qmi_setting';
                        $d_ws['name']       = preg_replace('/^qmi_/', '', $key);
                        $d_ws['value']      = $this->request->data["$key"];
                        $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                        $this->{'NodeConnectionSettings'}->save($ent_ws);    
                    }
                }               
            }
                             
            if (array_key_exists('static_entries', $this->request->data)) {

                foreach($this->request->data['static_entries'] as $e){
                    if($this->request->data['static_entries'][$count] == 0){
                        $empty_flag = true;
                        break;
                    }else{
                        array_push($entry_ids,$this->request->data['static_entries'][$count]);
                    }
                    $count++;
                }
            }

            //Only if empty was not specified
            if((!$empty_flag)&&(count($entry_ids)>0)){  
                foreach($entry_ids as $id){
                	$data = array();
                    $data['node_id']       = $new_id;
                    $data['mesh_entry_id'] = $id;
                    $ent_e = $this->{'NodeMeshEntries'}->newEntity($data);
                    $this->{'NodeMeshEntries'}->save($ent_e);	
                }
            }

            //Add the exit points
            $count      = 0;
            $exit_ids  = array();
            $e_flag = false;

            if (array_key_exists('static_exits', $this->request->data)) {
                foreach($this->request->data['static_exits'] as $e){
                    if($this->request->data['static_exits'][$count] == 0){
                        $e_flag = true;
                        break;
                    }else{
                        array_push($entry_ids,$this->request->data['static_exits'][$count]);
                    }
                    $count++;
                }
            }

            //Only if empty was not specified
            if((!$e_flag)&&(count($exit_ids)>0)){
                foreach($entry_ids as $id){
                    $data = array();
                    $data['node_id']       = $new_id;
                    $data['mesh_exit_id']  = $id;  
					$ent_x = $this->{'NodeMeshExits'}->newEntity($data);
                    $this->{'NodeMeshExits'}->save($ent_x);	
                }
            }

            //---------Add WiFi settings for this node ------
            //--Clean up--
            $n_id = $new_id;
            foreach(array_keys($this->request->data) as $key){
                if(preg_match('/^radio\d+_(disabled|band|mode|width|txpower|include_distance|distance|include_beacon_int|beacon_int|ht_capab|mesh|ap|config|channel_five|channel_two|noscan)/',$key)){           
                    if(preg_match('/^radio\d+_ht_capab/',$key)){
                        $pieces = explode("\n", $this->request->data["$key"]);
                        foreach($pieces as $p){

                            $d_setting = [];
                            $d_setting['node_id']   = $n_id;
                            $d_setting['name']      = $key;
                            $d_setting['value']     = $p;                      
                            $ent_s = $this->{'NodeWifiSettings'}->newEntity($d_setting); 
                            if(!$this->{'NodeWifiSettings'}->save($ent_s)){
                                $message = __('Could not add item');
                                $this->JsonErrors->entityErros($ent_s,$message);
                                return;
                            }
                        }
                    }else{
                        $d_setting = [];
                        $d_setting['node_id']   = $n_id;
                        $d_setting['name']      = $key;
                        $d_setting['value']     = $this->request->data["$key"];
                        $ent_s = $this->{'NodeWifiSettings'}->newEntity($d_setting);  
                        if(!$this->{'NodeWifiSettings'}->save($ent_s)){
                            $message = __('Could not add item');
                            $this->JsonErrors->entityErros($ent_s,$message);
                            return;
                        }
                    }
                }
                
                if($key == 'device_type'){
                    $d_setting = [];
                    $d_setting['node_id']   = $n_id;
                    $d_setting['name']      = $key;
                    $d_setting['value']     = $this->request->data["$key"];
                    $ent_s = $this->{'NodeWifiSettings'}->newEntity($d_setting);  
                    if(!$this->{'NodeWifiSettings'}->save($ent_s)){
                        $message = __('Could not add item');
                        $this->JsonErrors->entityErros($ent_s,$message);
                        return;
                    }
                }  
            }
            //------- END Add settings for this node ---
            
            //-- 6/19 For AutoCaptivePortal we add a reboot command --
            if(isset($this->request->data['auto_cp'])){
                $d_action = [];
                $d_action['node_id']    = $new_id;
                $d_action['command']    = 'reboot';
                $ent_action = $this->{'NodeActions'}->newEntity($d_action);
                if(!$this->{'NodeActions'}->save($ent_action)){
                    $message = __('Could not add item');
                    $this->JsonErrors->entityErros($ent_action,$message);
                    return;
                }
            }
            //-- END AutoCaptivePortal --

            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }else{
            $message = __('Could not create item');
            $this->JsonErrors->entityErros($ent_node,$message);
        }
    }
    
    public function meshNodeEdit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if ($this->request->is('post')) {
            // Load Config
            Configure::load('MESHdesk');
            $cfg = Configure::read('mqtt_settings');

            $client = new Client();
            
            $this->loadModel('NodeMeshEntries');
            $this->loadModel('NodeMeshExits');
            $this->loadModel('Nodes');
            $this->loadModel('NodeNeighbors');
            $this->loadModel('NodeWifiSettings');
            $this->loadModel('NodeUptmHistories');
            $this->loadModel('NodeConnectionSettings');

			$move_meshes	= false;
			
			$check_items = [
		        'enable_overviews',
		        'enable_alerts',
		        'enable_schedules'		
	        ];
	        
	        foreach($check_items as $i){
                if(isset($this->request->data[$i])){
                    $this->request->data[$i] = 1;
                }else{
                    $this->request->data[$i] = 0;
                }
            } 	

			if (array_key_exists('mesh_id', $this->request->data)) {
				$new_mesh_id 	= $this->request->data['mesh_id'];
				$ent_node       = $this->{'Nodes'}->find()->where(['Nodes.id' => $this->request->data['id']])->first();
				if($ent_node){
				    $current_id 	= $ent_node->mesh_id;
				    $node_id        = $ent_node->id;
				    if($current_id != $new_mesh_id){	//Delete it if the mesh changed    
					    $this->{'Nodes'}->delete($ent_node);
					    //Some cleanup
					    $this->{'NodeUptmHistories'}->deleteAll(['NodeUptmHistories.node_id' => $node_id]);
                        $this->{'NodeNeighbors'}->deleteAll(['NodeNeighbors.neighbor_id' => $node_id]);
					    $move_meshes = true;
				    }
			    }
			}

			//We are moving meshes - we need the ip
            if($move_meshes){
			    $ip = $this->{'Nodes'}->get_ip_for_node($this->request->data['mesh_id']);
			    $this->request->data['ip'] = $ip;
			    //Create a new node
			    $ent_node = $this->{'Nodes'}->newEntity($this->request->data);			    
            }else{
                $this->{'Nodes'}->patchEntity($ent_node,$this->request->data);
            }
            
            if ($this->{'Nodes'}->save($ent_node)) {
                $new_id = $ent_node->id;

				//Clear previous ones first:
				$this->{'NodeMeshEntries'}->deleteAll(['NodeMeshEntries.node_id' => $new_id]);

                //Add the entry points
                $count      = 0;
                $entry_ids  = [];
                $empty_flag = false;

                if (array_key_exists('static_entries', $this->request->data)) {
                    foreach($this->request->data['static_entries'] as $e){
                        if($this->request->data['static_entries'][$count] == 0){
                            $empty_flag = true;
                            break;
                        }else{
                            array_push($entry_ids,$this->request->data['static_entries'][$count]);
                        }
                        $count++;
                    }
                }

                //Only if empty was not specified
                if((!$empty_flag)&&(count($entry_ids)>0)){
                    foreach($entry_ids as $id){
                        $data = [];
                        $data['node_id']       = $new_id;
                        $data['mesh_entry_id'] = $id;
                        $ent_se = $this->{'NodeMeshEntries'}->newEntity($data);
                        $this->{'NodeMeshEntries'}->save($ent_se);
                    }
                }

				//Clear previous ones first:
                $this->{'NodeMeshExits'}->deleteAll(['NodeMeshExits.node_id' => $new_id]);

                //Add the exit points
                $count      = 0;
                $exit_ids  = array();
                $e_flag = false;

                if (array_key_exists('static_exits', $this->request->data)) {
                    foreach($this->request->data['static_exits'] as $e){
                        if($this->request->data['static_exits'][$count] == 0){
                            $e_flag = true;
                            break;
                        }else{
                            array_push($entry_ids,$this->request->data['static_exits'][$count]);
                        }
                        $count++;
                    }
                }

                //Only if empty was not specified
                if((!$e_flag)&&(count($exit_ids)>0)){
                    foreach($entry_ids as $id){
                    	$data = array();
                        $data['node_id']       = $new_id;
                        $data['mesh_exit_id']  = $id;      
                        $ent_sx = $this->{'NodeMeshExits'}->newEntity($data);
                        $this->{'NodeMeshExits'}->save($ent_sx);
                    }
                }
                
                //Check if we have web-by-wifi enabled
                $this->{'NodeConnectionSettings'}->deleteAll([ //
                    'NodeConnectionSettings.node_id' => $new_id,
                    'NodeConnectionSettings.grouping' => 'wbw_setting'
                ]);               
                if($this->request->getData('internet_connection') == 'wifi'){
                    foreach(array_keys($this->request->data) as $key){
                        if(preg_match('/^wbw_/',$key)){
                            $d_wbw = [];
                            $d_wbw['node_id']    = $new_id;
                            $d_wbw['grouping']   = 'wbw_setting';
                            $d_wbw['name']       = preg_replace('/^wbw_/', '', $key);
                            $d_wbw['value']      = $this->request->data["$key"];
                            $ent_wbw = $this->{'NodeConnectionSettings'}->newEntity($d_wbw);  
                            $this->{'NodeConnectionSettings'}->save($ent_wbw);    
                        }
                    }  
                }else{
                    //Looks like they disabled it so we need to remove any channel overrides
                    $this->{'NodeConnectionSettings'}->deleteAll([
                        'NodeConnectionSettings.node_id' => $new_id,
                        'NodeConnectionSettings.grouping' => 'wbw_info'
                    ]);  
                }
                
                $this->{'NodeConnectionSettings'}->deleteAll([ //
                    'NodeConnectionSettings.node_id' => $new_id,
                    'NodeConnectionSettings.grouping' => 'wan_static_setting'
                ]);    
                
                if($this->request->getData('internet_connection') == 'wan_static'){
                    foreach(array_keys($this->request->data) as $key){
                        if(preg_match('/^wan_static_/',$key)){
                            $d_ws = [];
                            $d_ws['node_id']    = $new_id;
                            $d_ws['grouping']   = 'wan_static_setting';
                            $d_ws['name']       = preg_replace('/^wan_static_/', '', $key);
                            $d_ws['value']      = $this->request->data["$key"];
                            $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                            $this->{'NodeConnectionSettings'}->save($ent_ws);    
                        }
                    }               
                }
                
                $this->{'NodeConnectionSettings'}->deleteAll([ //
                    'NodeConnectionSettings.node_id' => $new_id,
                    'NodeConnectionSettings.grouping' => 'wan_pppoe_setting'
                ]);    
                
                if($this->request->getData('internet_connection') == 'wan_pppoe'){
                    foreach(array_keys($this->request->data) as $key){
                        if(preg_match('/^wan_pppoe_/',$key)){
                            $d_ws = [];
                            $d_ws['node_id']    = $new_id;
                            $d_ws['grouping']   = 'wan_pppoe_setting';
                            $d_ws['name']       = preg_replace('/^wan_pppoe_/', '', $key);
                            $d_ws['value']      = $this->request->data["$key"];
                            $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                            $this->{'NodeConnectionSettings'}->save($ent_ws);    
                        }
                    }               
                }
                
                $this->{'NodeConnectionSettings'}->deleteAll([ //
                    'NodeConnectionSettings.node_id' => $new_id,
                    'NodeConnectionSettings.grouping' => 'wifi_static_setting'
                ]);    
                
                if($this->request->getData('internet_connection') == 'wifi_static'){
                    foreach(array_keys($this->request->data) as $key){
                        if(preg_match('/^wifi_static_/',$key)){
                            $d_ws = [];
                            $d_ws['node_id']    = $new_id;
                            $d_ws['grouping']   = 'wifi_static_setting';
                            $d_ws['name']       = preg_replace('/^wifi_static_/', '', $key);
                            $d_ws['value']      = $this->request->data["$key"];
                            $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                            $this->{'NodeConnectionSettings'}->save($ent_ws);    
                        }
                    }               
                }      
                               
                $this->{'NodeConnectionSettings'}->deleteAll([ //
                    'NodeConnectionSettings.node_id' => $new_id,
                    'NodeConnectionSettings.grouping' => 'wifi_pppoe_setting'
                ]);    
                
                if($this->request->getData('internet_connection') == 'wifi_pppoe'){
                    foreach(array_keys($this->request->data) as $key){
                        if(preg_match('/^wifi_pppoe_/',$key)){
                            $d_ws = [];
                            $d_ws['node_id']    = $new_id;
                            $d_ws['grouping']   = 'wifi_pppoe_setting';
                            $d_ws['name']       = preg_replace('/^wifi_pppoe_/', '', $key);
                            $d_ws['value']      = $this->request->data["$key"];
                            $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                            $this->{'NodeConnectionSettings'}->save($ent_ws);    
                        }
                    }               
                }
                                
                $this->{'NodeConnectionSettings'}->deleteAll([ //
                    'NodeConnectionSettings.node_id' => $new_id,
                    'NodeConnectionSettings.grouping' => 'qmi_setting'
                ]);    
                
                if($this->request->getData('internet_connection') == 'qmi'){
                    foreach(array_keys($this->request->data) as $key){
                        if(preg_match('/^qmi_/',$key)){
                            $d_ws = [];
                            $d_ws['node_id']    = $new_id;
                            $d_ws['grouping']   = 'qmi_setting';
                            $d_ws['name']       = preg_replace('/^qmi_/', '', $key);
                            $d_ws['value']      = $this->request->data["$key"];
                            $ent_ws = $this->{'NodeConnectionSettings'}->newEntity($d_ws);  
                            $this->{'NodeConnectionSettings'}->save($ent_ws);    
                        }
                    }               
                }                                             
                
                //Check if any of the reboot things are specified
                $this->{'NodeConnectionSettings'}->deleteAll([
                    'NodeConnectionSettings.node_id' => $new_id,
                    'NodeConnectionSettings.grouping' => 'reboot_setting'
                ]);       
                
                if(isset($this->request->data['chk_no_controller'])){
                    $d_wbw['node_id']    = $new_id;
                    $d_wbw['grouping']   = 'reboot_setting';
                    $d_wbw['name']       = 'controller_reboot_time';
                    $d_wbw['value']      = $this->request->data['controller_reboot_time'];
                    $ent_wbw = $this->{'NodeConnectionSettings'}->newEntity($d_wbw);  
                    $this->{'NodeConnectionSettings'}->save($ent_wbw);
                }
                
                if(isset($this->request->data['chk_daily_reboot'])){
                    $d_wbw['node_id']    = $new_id;
                    $d_wbw['grouping']   = 'reboot_setting';
                    $d_wbw['name']       = 'reboot_at';
                    $d_wbw['value']      = $this->request->data['reboot_at'];
                    $ent_wbw = $this->{'NodeConnectionSettings'}->newEntity($d_wbw);  
                    $this->{'NodeConnectionSettings'}->save($ent_wbw);
                }

                //---------Add WiFi settings for this node ------
                //--Clean up--
                $n_id = $this->request->data['id'];
                $this->{'NodeWifiSettings'}->deleteAll(['NodeWifiSettings.node_id' => $n_id]);
                
                foreach(array_keys($this->request->data) as $key){
                    if(preg_match('/^radio\d+_(disabled|band|mode|width|txpower|include_distance|distance|include_beacon_int|beacon_int|ht_capab|mesh|ap|config|channel_five|channel_two|noscan)/',$key)){  
                        if(preg_match('/^radio\d+_ht_capab/',$key)){
                            $pieces = explode("\n", $this->request->data["$key"]);
                            foreach($pieces as $p){
                                $d_setting = [];
                                $d_setting['node_id']   = $n_id;
                                $d_setting['name']      = $key;
                                $d_setting['value']     = $p;
                                $ent_s = $this->{'NodeWifiSettings'}->newEntity($d_setting);  
                                $this->{'NodeWifiSettings'}->save($ent_s);
                            }
                        }else{
                            $d_setting = [];
                            $d_setting['node_id']   = $n_id;
                            $d_setting['name']      = $key;
                            $d_setting['value']     = $this->request->data["$key"];
                            $ent_s = $this->{'NodeWifiSettings'}->newEntity($d_setting);  
                            $this->{'NodeWifiSettings'}->save($ent_s);
                        }
                    }
                    
                    if($key == 'device_type'){
                        $d_setting = [];
                        $d_setting['node_id']   = $n_id;
                        $d_setting['name']      = $key;
                        $d_setting['value']     = $this->request->data["$key"];
                        $ent_s = $this->{'NodeWifiSettings'}->newEntity($d_setting);  
                        $this->{'NodeWifiSettings'}->save($ent_s);
                    }      
                }

                if ($cfg['enable_realtime']){
                    // Talk to MQTT Broker
                    $mesh_ssid  = $this->_get_mesh_ssid($this->request->data['mesh_id']);
                    $ssid       = $mesh_ssid->ssid;
                    $ent_node   = $this->{'Nodes'}->find()->where(['Nodes.id' => $this->request->data['id']])->first();

                    $payload = [
                        'node_id' => $ent_node->id,
                        'mac'  => strtoupper($ent_node->mac),
                        'mesh_id' => strtoupper(str_replace('_','-',$ssid)),
                        'cmd' => 'fetch_config',
                    ];

                    if($this->_check_server($client, $cfg['api_gateway_url'], 5)){
                        $client->request('POST', $cfg['api_gateway_url'] . '/mesh/config', ['form_params' => ['message' => json_encode($payload)]]);
                    }

                }
                //------- END Add settings for this node ---

                $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            }else{
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($ent_node,$message);
            }
        } 
    }
    
    public function meshNodeDelete(){

       if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $fail_flag  = false;   
        $this->loadModel('Nodes');
        $this->loadModel('NodeNeighbors');

	    if(isset($this->request->data['id'])){   //Single item delete
            $ent_node = $this->{'Nodes'}->find()->where(['Nodes.id' => $this->request->data['id']])->first();
            if($ent_node){
                $this->{'Nodes'}->delete($ent_node);
                $this->{'NodeNeighbors'}->deleteAll(['NodeNeighbor.neighbor_id' => $this->request->data['id']]);
            }
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){       
                $ent_node = $this->{'Nodes'}->find()->where(['Nodes.id' => $d['id']])->first();
                if($ent_node){
                    $this->{'Nodes'}->delete($ent_node);
                    $this->{'NodeNeighbors'}->deleteAll(['NodeNeighbor.neighbor_id' => $d['id']]);
                }
            }
        }  
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }

    public function meshNodeView(){
        $this->loadModel('Nodes');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $id    = $this->request->getQuery('node_id');
        $q_r   = $this->Nodes->find()
            ->contain(['NodeMpSettings','NodeWifiSettings','NodeMeshEntries','NodeConnectionSettings','Schedules'])
            ->where(['Nodes.id' => $id])
            ->first();
            
        if($q_r->schedule !== null){
            $q_r['schedule_name'] = $q_r->schedule->name;
        }
        
        $remove_items = [ 
            'radio0_enable',  'radio0_mesh',        'radio0_entry',     'radio0_band',
            'radio0_two_chan', 'radio0_five_chan',   'radio1_enable',    'radio1_mesh',
            'radio1_entry',   'radio1_band',        'radio1_two_chan',	'radio1_five_chan'  
        ];
        
        foreach($remove_items as $item){
            unset($q_r->{$item});
        }

        $hardware = $q_r->hardware;
        
        $nme_list = [];
        
        $q_r['internet_connection'] = 'auto_detect';
        
        foreach($q_r->node_connection_settings as $ncs){
            if($ncs->grouping == 'wbw_setting'){
                $q_r['internet_connection'] = 'wifi';
                $wbw_n          = 'wbw_'.$ncs->name;
                $q_r[$wbw_n]    = $ncs->value;
            }
            
            if($ncs->grouping == 'wan_static_setting'){
                $q_r['internet_connection'] = 'wan_static';
                $ws_n          = 'wan_static_'.$ncs->name;
                $q_r[$ws_n]    = $ncs->value;
            }
            
            if($ncs->grouping == 'wan_pppoe_setting'){
                $q_r['internet_connection'] = 'wan_pppoe';
                $ws_n          = 'wan_pppoe_'.$ncs->name;
                $q_r[$ws_n]    = $ncs->value;
            }
            
            if($ncs->grouping == 'wifi_static_setting'){
                $q_r['internet_connection'] = 'wifi_static';
                $ws_n          = 'wifi_static_'.$ncs->name;
                $q_r[$ws_n]    = $ncs->value;
            }
            
            if($ncs->grouping == 'wifi_pppoe_setting'){
                $q_r['internet_connection'] = 'wifi_pppoe';
                $ws_n          = 'wifi_pppoe_'.$ncs->name;
                $q_r[$ws_n]    = $ncs->value;
            }
            
            if($ncs->grouping == 'qmi_setting'){
                $q_r['internet_connection'] = 'qmi';
                $ws_n          = 'qmi_'.$ncs->name;
                $q_r[$ws_n]    = $ncs->value;
            }
            
            if($ncs->grouping == 'reboot_setting'){
                if($ncs->name == 'controller_reboot_time'){
                    $q_r['chk_no_controller'] = 'on';
                    $q_r['controller_reboot_time'] = $ncs->value;
                }
                
                if($ncs->name == 'reboot_at'){
                    $q_r['chk_daily_reboot'] = 'on';
                    $q_r['reboot_at'] = $ncs->value;  
                }             
            }      
        }
        foreach($q_r->node_mesh_entries as $nme){
            array_push($nme_list,$nme->mesh_entry_id);
        }
        $q_r['static_entries[]'] = $nme_list;

        //Return the Advanced WiFi Settings...
        if(count($q_r->node_wifi_settings)>0){

            $radio1_flag    = false;
            $r0_ht_capab    = array();
            $r1_ht_capab    = array();

            foreach($q_r->node_wifi_settings as $s){
                $s_name     = $s->name;
                $s_value    = $s->value;
                if($s_name == 'radio1_txpower'){
                    $radio1_flag = true;
                }

                if(!(preg_match('/^radio\d+_ht_capab/',$s_name))){
                    $q_r["$s_name"] = "$s_value";
                }else{
                    if($s_name == 'radio0_ht_capab'){
                        array_push($r0_ht_capab,$s_value);
                    }
                    if($s_name == 'radio1_ht_capab'){
                        array_push($r1_ht_capab,$s_value);
                    }
                }
            }

            $q_r['radio0_ht_capab'] = implode("\n",$r0_ht_capab);
            if($radio1_flag){
                $q_r['radio1_ht_capab'] = implode("\n",$r1_ht_capab);
            }
        }else{
        
            //Get the defaults from the DB---
            $radio_fields = [
                'disabled','band','mode','width','txpower','include_beacon_int',
                'beacon_int','include_distance','distance','ht_capab','mesh','ap','config'
            ];          
            $q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hardware])->contain(['HardwareRadios'])->first();         
            if($q_e){
                foreach($q_e->hardware_radios as $hr){    
                    $radio_number   = $hr->radio_number;
                    foreach($radio_fields as $fr){
                    
                        if($fr == 'hwmode'){
                            
                            if($hr[$fr] == '11g'){
                                $q_r['radio'.$radio_number.'_band'] = '24';
                            }
                            
                            if($hr[$fr] == '11a'){
                                $q_r['radio'.$radio_number.'_band'] = '5';
                            } 
                            if($hr[$fr] == '11a_ac'){
                                $q_r['radio'.$radio_number.'_band']   = '5';
                                $q_r['device_type']                   = 'ac';
                            } 
                              
                        }elseif($fr == 'disabled'){
                            $q_r['radio'.$radio_number.'_enabled'] = !$hr[$fr];
                        }else{
                            $q_r['radio'.$radio_number.'_'.$fr] = $hr[$fr];
                        }
                    }  
                }
            } 
        }

        $q_r['mesh_id'] = intval($q_r->mesh_id);

        $this->set(array(
            'data'      => $q_r,
            'success'   => true,
            '_serialize'=> array('success', 'data')
        ));
    }

    public function advancedSettingsForModel(){
        $this->loadModel('Nodes');

        $data   = [];
        $model  = $this->request->getQuery('model');

        $no_overrides = true;

        $cquery = $this->request->getQuery();

        //Check if there is a node_id in the request and if so check the current hardware type
        //If the same as the model requested, check if we have overrides
        if(array_key_exists('node_id', $cquery)){
            $node_id = $this->request->getQuery('node_id');
            $q_r     = $this->Nodes->find()
                ->contain(['NodeWifiSettings'])
                ->where(['Nodes.id' => $node_id,'Nodes.hardware' => $model])
                ->first();
            if($q_r){
                $q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $model])->contain(['HardwareRadios'])->first();
                $data['radio_count'] = $q_e->radio_count;
                if(count($q_r->node_wifi_settings) > 0){
                    $no_overrides = false;
                    $ht_capab_zero  = '';
                    $ht_capab_one   = '';
                    $ht_capab_two   = '';   
                    
                    foreach($q_r->node_wifi_settings as $s){ 
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
                'disabled',
                'txpower','include_beacon_int',
                'beacon_int','include_distance',
                'distance','ht_capab',
                'mesh','ap','config',
                'band',
                'mode',
                'width'
            ];
            
            $data                   = [];
            $data['radio_count']    = 0;
            
            if(isset($this->request->query['model'])){
                $model = $this->request->query['model'];
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
         
            //FIXME We need to see if there was a node_id but then the node had no wifi specific settings...
            //IF so we need to use the common node setting's channel if not using mesh in a radio channel_two (hwmode == 11n) channel_five (hwmode == 11a /ac) 
            //(Typically comes with auto-captive-portal additions)
        }

        $this->set(array(
            'data' => $data,
            'success' => true,
            '_serialize' => array('data','success')
        ));
    }

    public function staticEntryOptions(){
        $this->loadModel('MeshEntries');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $where = ['MeshEntries.apply_to_all' => 0];

        if(null !== $this->request->getQuery('mesh_id')){
            $mesh_id = $this->request->getQuery('mesh_id');
            array_push($where,['MeshEntries.mesh_id' => $mesh_id]);
        }

        $q_r    = $this->MeshEntries->find()->where($where)->all();

        $items = array();
        foreach($q_r as $i){
            $id = $i->id;
            $n  = $i->name;
            array_push($items,array('id' => $id, 'name' => $n));
        }

        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }

    public function staticExitOptions(){
        $this->loadModel('MeshExits');

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if(null !== $this->request->getQuery('mesh_id')){
            $mesh_id = $this->request->getQuery('mesh_id');
        }

        $q_r    = $this->MeshExits->find()->where(['MeshExits.auto_detect' => 0])->all();

        $items = array();
        array_push($items,array('id' => 0, 'name' => "LAN")); //Allow the user not to assign at this stage
        foreach($q_r as $i){
            $id = $i->id;
            $n  = $i->name;
            array_push($items,array('id' => $id, 'name' => $n));
        }

        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));

    }
/*
    private function _tree_tags($entity){
        $tag_path = 'not_tagged'; 
        if($entity->tree_tag_id !== null){    
            //Make sure the TreeTag exists
            $tt_check = $this->{'TreeTags'}->find()->where(['TreeTags.id' => $entity->tree_tag_id])->first();
            if($tt_check){
                $tag_path = ''; 
                $crumbs = $this->{'TreeTags'}->find('path', ['for' => $entity->tree_tag_id]);     
                foreach ($crumbs as $crumb) {
                    if($crumb->id == $entity->tree_tag_id){
                        $tag_path = $tag_path.$crumb->name;
                    }else{
                        $tag_path = $tag_path.$crumb->name . ' > ';
                    }
                }
            }else{
                $tag_path = "orphaned";
            }
        }  
        return $tag_path;
    }
*/
    
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

        $menu = $this->GridButtons->returnButtons($user, false, 'Meshes'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
    public function menuForEntriesGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'MeshEntries'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
     public function menuForExitsGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'MeshExits'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }

    public function menuForNodesGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'MeshNodes'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
    public function menuForNodeDetailsGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'NodeDetails'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    // Update Node's config_fetched column (MQTT real time)
    public function nodeConfigFetch(){

        if($this->request->is('put')){
            $data = $this->request->getData();
            if(!empty($data['node_id'])){
            
                $node_id        = $data['node_id'];
                $this->Nodes    = TableRegistry::get('Nodes');
                $ent_node       = $this->Nodes->find()->where(['Nodes.id' => $node_id])->first();
                if($ent_node){
                    $data = [];
		            $data['id'] 			        = $node_id;
		            $data['config_fetched']         = date("Y-m-d H:i:s", time());
		            $data['last_contact_from_ip']   = $this->request->clientIp();
                    $this->Nodes->patchEntity($ent_node, $data);
                    $this->Nodes->save($ent_node);         
                }
                $this->set(array(
                    'data'         => $data,
                    'success'       => true,
                    '_serialize'    => array('data','success')
                ));
            } else {
                $this->set(array(
                    'message'     => 'Node ID not found',
                    'success'       => false,
                    '_serialize'    => array('message','success')
                ));
            }

        } else {
            $this->set(array(
                'message'         => 'Send only PUT request',
                'success'       => false,
                '_serialize'    => array('message','success')
            ));
        }
    }

    public function meshExperimentalCheck(){
        Configure::load('RadiusDesk');
        $active = Configure::read('experimental.active'); //Read the defaults
        $this->set(array(
            'active'     => $active,
            'success'   => true,
            '_serialize'=> array('success', 'active')
        ));
    }
    
    private function _getDefaultSettings(){
    
        Configure::load('MESHdesk'); 
        $data  = Configure::read('common_node_settings'); //Read the defaults

        $this->loadModel('UserSettings');   
        $q_r = $this->{'UserSettings'}->find()->where(['user_id' => -1])->all();
        if($q_r){
            foreach($q_r as $s){
                //ALL Captive Portal Related default settings will be 'cp_<whatever>'
                if(preg_match('/^cp_/',$s->name)){
                    $name           = preg_replace('/^cp_/', '', $s->name);
                    $data[$name]    = $s->value;     
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

    private function _getDefaultDeadAfter(){   
        $this->loadModel('UserSettings');   
        $us = $this->{'UserSettings'}->find()->where(['user_id' => -1,'name' =>'heartbeat_dead_after'])->first();
        $dead_after = 900;
        if($us){          
            $dead_after = $us->value;
        }
        return $dead_after;
    }
	
	private function _get_radio_count_for($hardware){
		$radio_count 	= 1; //Default
		$q_rc           = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hardware])->first();	
		if($q_rc){
		    $radio_count = $q_rc->radio_count;
		}
		return $radio_count;
	}
	
	private function _add_dynamic($dc_data){
    
        //--Formulate a name
        $dc_data['name'] = 'MESHdesk_'.$dc_data['nasidentifier'];
        
        $this->loadModel('DynamicClients');
        $this->loadModel('DynamicClientRealms');
        
        $entity = $this->{'DynamicClients'}->newEntity($dc_data);
         
        if ($this->{'DynamicClients'}->save($entity)) {
            //After this we can add the Realms if there are any
            $new_id = $entity->id;
            $pieces = explode(",", $dc_data['realm_list']);
            foreach($pieces as $p){
                if(is_numeric($p)){
                    $dcr                = [];
                    $dcr['dynamic_client_id'] = $new_id;
                    $dcr['realm_id']    = $p;
                    $ent_dcr            = $this->{'DynamicClientRealms'}->newEntity($dcr);
                    $this->{'DynamicClientRealms'}->save($ent_dcr);
                }
            }   
        }
    }
    
    private function _add_dynamic_pair($nas_data){  
        $this->loadModel('DynamicPairs');   
        $data = array();
        $data['name']               = 'nasid';
        $data['value']              = $nas_data['nasidentifier'];
        $data['dynamic_detail_id']  = $nas_data['dynamic_detail_id'];
        $data['priority']           = 1;  
        $entity = $this->{'DynamicPairs'}->newEntity($data);  
        $this->{'DynamicPairs'}->save($entity);
    }
    
    private function _check_if_available($openvpn_server_id,$ip){
    
        $this->loadModel('OpenvpnServerClients');
        $count = $this->{'OpenvpnServerClients'}->find()
            ->where([
                'OpenvpnServerClients.openvpn_server_id'    => $openvpn_server_id,
                'OpenvpnServerClients.ip_address'           => $ip,
            ])
            ->count();

        if($count == 0){
            return true;
        }else{
            return false;
        }
    }
    
    private function _make_linux_password($pwd){
		return exec("openssl passwd -1 $pwd");
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
    
    private function _get_mesh_ssid($mesh_id){
    
        $entity = $this->{'Meshes'}->find()->where(['Meshes.id' => $mesh_id])->first();
        return $entity;
    }

    private function _check_server($client, $url, $timeout = 30){

        try {
            $client->request('GET', $url, ['timeout' => $timeout]);
            return true;

        } catch (\Exception $e) {
            // Fail silently
            return false;
        }
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
    
}
