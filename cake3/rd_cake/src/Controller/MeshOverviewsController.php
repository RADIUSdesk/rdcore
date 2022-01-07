<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class MeshOverviewsController extends AppController{
  
    public $base         = "Access Providers/Controllers/MeshOverviews/";   
    protected $main_model   = 'Meshes';
    
    protected $tree_level_0 = 'STATE';
    protected $tree_level_1 = 'DISTRICT';
    protected $tree_level_2 = 'BLOCK';
    protected $dead_after   = 600; //Default
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Meshes');
        $this->loadModel('Nodes');
        $this->loadModel('NodeStations');
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
         
        $data 		        = Configure::read('common_node_settings'); //Read the defaults
		$this->dead_after	= $data['heartbeat_dead_after'];
           
    }
    
     public function exportCsv(){

        $query              = $this->{$this->main_model}->find(); 
        $q_r                = $query->all();
        //Headings
		// From Vinod request 5/23/18
		// Columns: GP Name, GP Node Count, GP Online Node Count, GP Offline Node Count, GP Last Contact Time, GP Last Contact Time in Words
        $columns = ['id','name','last_contact','last_contact_in_words'];  
        $heading_line   = array();
        foreach($columns as $c){
            array_push($heading_line,$c);
        }
        
        $data = [
            $heading_line
        ];
        
        foreach($q_r as $i){
            $csv_line   = array();  
            foreach($columns as $c){
                $column_name = $c;
                array_push($csv_line,$i->{$column_name});
                  
                if($c == 'last_contact'){
                    if($i->{'last_contact'} !== null){
                        $lc_words = $this->TimeCalculations->time_elapsed_string($i->{'last_contact'});
                        array_push($csv_line,$lc_words);
                    }       
                }
              
            }
            array_push($data,$csv_line);
        }
        
        $_serialize = 'data';
        $this->setResponse($this->getResponse()->withDownload('export.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(compact('data', '_serialize'));  

    } 
    
    public function index(){
    
        //__ Authentication + Authorization __      
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $timespan   = 'daily'; //Default = hourly but we double it to give comparitive stats   
        $query      = $this->{$this->main_model}->find();
        
        $this->CommonQuery->build_common_query($query,$user,['Users','RollingLastHours','RollingLastDays','RollingLastSevenDays','RollingLastThirtyDays']);
        
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

        $total  = $query->count();       
        $q_r    = $query->all(); 
        $items  = [];
        
        $timespan = 'hourly'; //
		$rolling_table = 'rolling_last_hours';
        $seconds  = (60*60); //default is two hours
		
        if(isset($this->request->query['timespan'])){
            $timespan = $this->request->query['timespan'];
        }
        if($timespan == 'hourly'){
            $seconds = (60*60); 
			$rolling_table = 'rolling_last_hours';
        }
        if($timespan == 'daily'){
            $seconds = (60*60)*24; 
			$rolling_table = 'rolling_last_days';
        }
        if($timespan == 'weekly'){
            $seconds = (60*60)*24*7; 
			$rolling_table = 'rolling_last_seven_days';
        }
        if($timespan == 'monthly'){
            $seconds = (60*60)*24*30;
			$rolling_table = 'rolling_last_thirty_days';
        }
                 
        $modified = date("Y-m-d H:i:s", time()-$seconds);
        
        foreach($q_r as $i){
            $row        = [];
            $mesh_id    = $i->id;
        
            //Get the 'dead_after' value
			$dead_after = $this->_get_dead_after($mesh_id);
			$now		= time();
			$node_count = 0;
			$nodes_up	= 0;
			$nodes_down	= 0;
			
			$data       = 0;
			$users      = 0;
			foreach($i->{"$rolling_table"} as $mrlx){
			    $users      = $mrlx->tot_clients;
				$node_count	= $mrlx->tot_nodes;
				$nodes_up	= $mrlx->tot_nodes_up;
				$nodes_down	= $mrlx->tot_nodes_down;
				$data		= $mrlx->tot_bytes;
			}
			
			$row['id']          = $i->id;
			$row['name']        = $i->name;
			$row['node_count']  = $node_count;
			$row['nodes_up']    = $nodes_up;
			$row['nodes_down']  = $nodes_down;
			$row['data']        = $this->formatted_bytes($data);
			$row['users']       = $users;
			
			$row['last_contact']= $i->last_contact;
			
            array_push($items,$row);
        }
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));
    }
    
    private function formatted_bytes($bytes){

        $ret_val=$bytes;
        if($bytes >= 1024){
            $ret_val = round($bytes/1024,0)." Kb";
        }
        if($bytes >= (1024*1024)){
            $ret_val = round($bytes/1024/1024,0)." Mb";
        }
         if($bytes >= (1024*1024*1204)){
            $ret_val = round($bytes/1024/1024/1024,0)." Gb";
        }
        if($bytes >= (1024*1024*1204*1204)){
            $ret_val = round($bytes/1024/1024/1024,0)." Tb";
        }
         if($bytes >= (1024*1024*1204*1204*1204)){
            $ret_val = round($bytes/1024/1024/1024,0)." Pb";
        }
        return $ret_val;
    }
    
    
    private function _get_dead_after($mesh_id){
		$dead_after	= $this->dead_after;
		//FIXME A Hack to make it faster
		///$n_s = $this->Meshes->NodeSettings->find()->where(['NodeSettings.mesh_id' => $mesh_id])->first(); 
        ///if($n_s){
        ///    $dead_after = $n_s->heartbeat_dead_after;
        ///}
		return $dead_after;
	}
    
}
