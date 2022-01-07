<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;
use Cake\Utility\Hash;

use Cake\Datasource\ConnectionManager;
// &token=29d2a9a7-1018-47a1-9db0-f8976c835348
class MeshNodeStateApiController extends AppController{
  
    public $base         = "Access Providers/Controllers/MeshNodeStateApi/";   
    protected $main_model   = 'Meshes';
    
    protected $tree_level_0 = 'STATE';
    protected $tree_level_1 = 'DISTRICT';
    protected $tree_level_2 = 'BLOCK';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Meshes');
        $this->loadModel('TreeTags'); 
        $this->loadModel('Users');    
        $this->loadComponent('Aa');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'                     => 'Meshes',
            'no_available_to_siblings'  => false,
            'sort_by'                   => 'Meshes.name'
        ]); 
             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');    
    }
    
    public function index(){
    
        //__ Authentication + Authorization __      
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        
        $conditions = ['TreeTags.parent_id IS NULL'];
        $tt_lookup  = [];
        $level      = 0;
        if(isset($this->request->query['tree_tag_id'])){
            $id = $this->request->query['tree_tag_id'];
            if($id != 0){
                $conditions = ['TreeTags.parent_id' => $id];          
            }    
        }              
        $q_tt = $this->{'TreeTags'}->find()->where($conditions)->all();
        $tt_lookup = [];
		$ov_items = [];
        foreach($q_tt as $tt){
			$tree_level = 'Root';
			$tree_tag_id = $tt->id;
            $tt_level  = $this->TreeTags->getLevel($tree_tag_id);
            if($tt_level == 0){
                $tree_level = $this->tree_level_0;
            }
            if($tt_level == 1){
                $tree_level = $this->tree_level_1;
            }
            if($tt_level == 2){
                $tree_level = $this->tree_level_2;
            }
			
			$ov_items[$tt->name] = [ 'id' => "$tt->id",'name' => "$tt->name",'parent_id' => "$tt->parent_id",'kml_file' => "$tt->kml_file",'center_lat' => "$tt->center_lat",'center_lng' => "$tt->center_lng",'clients' => 0, 'level' => "$tree_level"];
            $descendants = $this->{'TreeTags'}->find('children', ['for' => $tt->id]);
            $d_count = 0;
            foreach ($descendants as $tt_0) {
                $tt_lookup[$tt_0->id] = $tt->name;
                $d_count++; 
            }
            if($d_count == 0){
                $tt_lookup[$tt->id] = $tt->name;
            }    
        }
        $query = $this->{$this->main_model}->find();
        $this->CommonQuery->build_common_query($query,$user);
        $q_r  = $query->all();
        $s_mesh_list = '';
        $count = 0;
        foreach($q_r as $q){
            if($count == 0){
                $s_mesh_list = $q->id;
            }else{
                $s_mesh_list = $s_mesh_list.','.$q->id;
            } 
            $count++;     
        }
        $conn = ConnectionManager::get('default');
        
		// Get requested state 
		$req_node_state = 1; //default to "up"
		if(isset($this->request->query['req_node_state'])){
			$req_node_state = $this->request->query['req_node_state'];
		}

        /*
		$timespan = 'hourly'; //
        $seconds  = (60*60)*2; //default is two hours
        if(isset($this->request->query['timespan'])){
            $timespan = $this->request->query['timespan'];
        }
        
        if($timespan == 'daily'){
            $seconds = (60*60)*24*2; //Two days
        }
        if($timespan == 'weekly'){
            $seconds = (60*60)*24*14; //Two weeks
        }
        if($timespan == 'monthly'){
            $seconds = (60*60)*24*60; //60 Days
        }

        $seconds_half = $seconds / 2;
                 
        $hour           = (60*60);
        $day            = $hour*24;
        $modified       = time()-$seconds;
        $modified_half  = time()-$seconds_half;
		*/
        $total_nodes    = 0;
		$items = [];

        if( $s_mesh_list != "") {
			
			// SQl Statement up down totals
			$sql_statement_updown = [
				"select ",
					"m.name as mesh_name, m.id as mesh_id,n_cnts.id as node_id, ",
                	"n_cnts.name, ",
                	"n_cnts.mac, ",
                	"n_cnts.nodes_up as node_state ",
				"from meshes as m ",
				" inner join ( ",
				"	select n.mesh_id,n.id,n.name,n.mac, ",
				"		1 as each_node, ",
				"		case ",
				"			when UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,150) <= UNIX_TIMESTAMP(n.last_contact) then 1 ",
				"			else 0 ",
				"		end as nodes_up ",
				"		from nodes n ",
				"		left outer join node_settings n_set on n_set.mesh_id = n.mesh_id   ",
				"	) as n_cnts on n_cnts.mesh_id = m.id ",
				" where m.id in ($s_mesh_list) ",
				"	and n_cnts.nodes_up = $req_node_state ",
				"limit 0,20000 "
			];
			
			$stmtud = $conn->execute(
				 implode($sql_statement_updown)
			);
			
			$ud_rows = $stmtud->fetchAll('assoc');
			foreach ($ud_rows as $row) {
				array_push($items,[ 'mesh_name' => $row['mesh_name'],'node_name' => $row['name'],'mac' => $row['mac'],'state'=> $row['node_state']]);
				$total_nodes++;
			}
		}
		//Include the level of the filter
		$tree_level = 'Root';
		if(isset($this->request->query['tree_tag_id'])){
			$tree_tag_id    = $this->request->query['tree_tag_id'];
			if($tree_tag_id !== '0'){
				$tt_level  = $this->TreeTags->getLevel($tree_tag_id);
				if($tt_level == 0){
					$tree_level = $this->tree_level_0;
				}
				if($tt_level == 1){
					$tree_level = $this->tree_level_1;
				}
				if($tt_level == 2){
					$tree_level = $this->tree_level_2;
				}
			}
		}
           
        $this->set(array(
            'success'       => true,
            'items'          => $items,
            'metaData'      => [
                'nodesCount'    => $total_nodes    
            ],
            '_serialize'    => array('success','items','metaData')
        ));
        
        
        /* $this->set(array(
            'success'       => true,
            'data'          => $items,
            '_serialize'    => array('success','data')
        ));
		*/
    }
     
    public function totals(){
    
        //__ Authentication + Authorization __      
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $conditions = ['TreeTags.parent_id IS NULL'];
        $tt_lookup  = [];
        $level      = 0;
        if(isset($this->request->query['tree_tag_id'])){
            $id = $this->request->query['tree_tag_id'];
            if($id != 0){
                $conditions = ['TreeTags.parent_id' => $id];          
            }    
        }              
        $q_tt = $this->{'TreeTags'}->find()->where($conditions)->all();
        $tt_lookup = [];
		$ov_items = [];
        foreach($q_tt as $tt){
			$tree_level = 'Root';
			$tree_tag_id = $tt->id;
            $tt_level  = $this->TreeTags->getLevel($tree_tag_id);
            if($tt_level == 0){
                $tree_level = $this->tree_level_0;
            }
            if($tt_level == 1){
                $tree_level = $this->tree_level_1;
            }
            if($tt_level == 2){
                $tree_level = $this->tree_level_2;
            }
			
			$ov_items[$tt->name] = [ 'id' => "$tt->id",'name' => "$tt->name",'parent_id' => "$tt->parent_id",'kml_file' => "$tt->kml_file",'center_lat' => "$tt->center_lat",'center_lng' => "$tt->center_lng",'clients' => 0, 'level' => "$tree_level"];
            $descendants = $this->{'TreeTags'}->find('children', ['for' => $tt->id]);
            $d_count = 0;
            foreach ($descendants as $tt_0) {
                $tt_lookup[$tt_0->id] = $tt->name;
                $d_count++; 
            }
            if($d_count == 0){
                $tt_lookup[$tt->id] = $tt->name;
            }    
        }
        $query = $this->{$this->main_model}->find();
        $this->CommonQuery->build_common_query($query,$user);
        $q_r  = $query->all();
        $s_mesh_list = '';
        $count = 0;
        foreach($q_r as $q){
            if($count == 0){
                $s_mesh_list = $q->id;
            }else{
                $s_mesh_list = $s_mesh_list.','.$q->id;
            } 
            $count++;     
        }
        $conn = ConnectionManager::get('default');
        
        $total_nodes    = 0;
        $t_nodes_up     = 0;
        $t_nodes_down   = 0;
        $t_nodes_dual_radio     = 0;
        $t_nodes_single_radio   = 0;

        if( $s_mesh_list != "") {

			// SQl Statement up down totals
			$sql_statement_updown = [
				"select m.id, ",
				"	m.name, ",
				"	m.tree_tag_id, ",
				"	ifnull(sum(n_cnts.each_node),0) as c_tot_nodes, ",
				"	ifnull(sum(n_cnts.nodes_down),0) as c_tot_nodes_down, ",
				"	ifnull(sum(n_cnts.nodes_up),0) as c_tot_nodes_up, ",
				"	ifnull(sum(n_cnts.dual_radio),0) as c_dual_radios, ",
				"	ifnull(sum(n_cnts.single_radio),0) as c_single_radios  ",
				"from meshes as m ",
				" left outer join ( ",
				"	select n.mesh_id,n.id, ",
				"		1 as each_node, ",
				"		case ",
				"			when (n.last_contact is null OR UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,150) > UNIX_TIMESTAMP(n.last_contact) ) then 1 ",
				"			else 0 ",
				"		end as nodes_down, ",
				"		case ",
				"			when UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,150) <= UNIX_TIMESTAMP(n.last_contact) then 1 ",
				"			else 0 ",
				"		end as nodes_up, ",
				"		case  ",
				"			when (n.hardware like '%ta8h%') then 1  ",
				"			else 0  ",
				"		end as dual_radio,  ",
				"		case  ",
				"			when (n.hardware like '%1907h%') then 1  ",
				"			else 0  ",
				"		end as single_radio  ",
				"		from nodes n ",
				"		left outer join node_settings n_set on n_set.mesh_id = n.mesh_id   ",
				"	group by n.mesh_id,n.id ",
				"	) as n_cnts on n_cnts.mesh_id = m.id ",
				" where m.id in ($s_mesh_list) ",
				"group by m.id,m.name,m.tree_tag_id ",
				"limit 0,5000 "
			];
			
			$stmtud = $conn->execute(
				 implode($sql_statement_updown)
			);
			
			$ud_rows = $stmtud->fetchAll('assoc');
			foreach ($ud_rows as $row) {
				$t_nodes_up 				= $t_nodes_up + $row['c_tot_nodes_up'];
				$t_nodes_down 				= $t_nodes_down + $row['c_tot_nodes_down'];
				$t_nodes_dual_radio     	= $t_nodes_dual_radio + $row['c_dual_radios'];
				$t_nodes_single_radio   	= $t_nodes_single_radio + $row['c_single_radios'];
				$total_nodes 				= $total_nodes + $row['c_tot_nodes'];
			}
        }
		  
        $this->set(array(
            'success'       => true,
            'metaData'      => [
                'nodesCount'    => $total_nodes,
                'nodesUp'       => $t_nodes_up,
                'nodesDown'     => $t_nodes_down,
                'dualRadios'    => $t_nodes_dual_radio,
                'singleRadios'  => $t_nodes_single_radio,
                
            ],
            '_serialize'    => array('success','items','metaData')
        ));
    }
    
    
    private function formatted_bytes($bytes){

        $ret_val=$bytes;
        if($bytes >= 1024){
            $ret_val = round($bytes/1024,2)."K";
        }
        if($bytes >= (1024*1024)){
            $ret_val = round($bytes/1024/1024,2)."M";
        }
         if($bytes >= (1024*1024*1204)){
            $ret_val = round($bytes/1024/1024/1024,2)."G";
        }
        if($bytes >= (1024*1024*1204*1204)){
            $ret_val = round($bytes/1024/1024/1024/1024,2)."T";
        }
         if($bytes >= (1024*1024*1204*1204*1204)){
            $ret_val = round($bytes/1024/1024/1024/1024/1024,2)."P";
        }
        return $ret_val;
    }
     
    private function _get_dead_after($mesh_id){
		$data 		= $this->_getDefaultSettings();
		$dead_after	= $data['heartbeat_dead_after'];
		$n_s        = $this->Meshes->NodeSettings->find()->where(['NodeSettings.mesh_id' => $mesh_id])->first(); 		
        if($n_s){
            $dead_after = $n_s->heartbeat_dead_after;
        }
		return $dead_after;
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
    
	private function _secondsToTime($seconds) {
		$dtF = new \DateTime('@0');
		$dtT = new \DateTime("@$seconds");
		return $dtF->diff($dtT)->format('%a days, %h hours, %i minutes and %s seconds');
	}
}
