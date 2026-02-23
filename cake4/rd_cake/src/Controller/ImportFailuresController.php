<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;

class ImportFailuresController extends AppController{

    protected $main_model   = 'ImportFailures';
    protected $tmpName;
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('ImportFailures');                
        $this->loadComponent('Aa');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'     => 'ImportFailures',
            'sort_by'   => 'ImportFailures.created'
        ]);    
        $this->loadComponent('TimeCalculations');
        
        $this->tmpName = WWW_ROOT . 'files' . DS . 'imagecache'. DS . 'users.csv';
    }
    
    public function exportCsv(){
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }       
        $req_q    	= $this->request->getQuery(); //q_data is the query data      
       	$cloud_id 	= $req_q['cloud_id'];
        
        $query = $this->{$this->main_model}->find(); 
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);
        
        $q_r    = $query->all();

        //Headings
        $heading_line   = [];
        if(isset($req_q['columns'])){
            $columns = json_decode($req_q['columns']);
            foreach($columns as $c){
                array_push($heading_line,$c->name);
            }
        }
        $data = [
            $heading_line
        ];
        foreach($q_r as $i){

            $columns    = [];
            $csv_line   = [];
            if(isset($req_q['columns'])){
                $columns = json_decode($req_q['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    array_push($csv_line,$i->{$column_name});  
                }
                array_push($data,$csv_line);
            }
        }
        
        $this->setResponse($this->getResponse()->withDownload('Realms.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(['data' => $data]);   
        $this->viewBuilder()->setOption('serialize', true);  
        
    } 

	public function index(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
    
    	$req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();         
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);
        
        if(isset($req_q['model'])){
            $query->where(['ImportFailures.model' => $req_q['model']]);    
        }
              
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
        if(isset($req_q['limit'])){
            $limit  = $req_q['limit'];
            $page   = $req_q['page'];
            $offset = $req_q['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all()
            ->map(function ($entity) {
                $entity->error_message = json_decode($entity->error_message, true);
                $entity->payload       = json_decode($entity->payload, true);
                return $entity;
            });
        
        $items  = [];
        
        $update = true;
        $delete = true;
        
        foreach($q_r as $i){               
            $row        = [];
            $fields     = $this->{$this->main_model}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            } 
            
			$row['update']		= $update;
			$row['delete']		= $delete;
            array_push($items,$row);
        }
        
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            'metaData'		=> [
            	'total'	=> $total
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
   
    public function menuForGrid(){
    
        $disable_lock = true;
        if (file_exists($this->tmpName)) {
            $disable_lock = false;
        }
     
        $a = ['xtype' => 'buttongroup', 'title' => null, 'items' => [
                [
                    'xtype'     =>  'button', 
                    'glyph'     => Configure::read('icnReload'),
                    'scale'     => 'large',
                    'itemId'    => 'reload',
                    'tooltip'   => __('Reload'),
                    'ui'        => 'button-orange'
                ],
                [
                    'xtype'     =>  'button', 
                    'glyph'     => Configure::read('icnDelete'),
                    'text'      => 'Clear report',
                    'scale'     => 'large',
                    'itemId'    => 'delete',
                    'tooltip'   => __('Clear report'),
                    'ui'        => 'button-orange'
                ],
                [
                    'xtype'     =>  'button', 
                    'glyph'     => Configure::read('icnUnlock'),
                    'text'      => 'Clear lock',
                    'disabled'  => $disable_lock,
                    'scale'     => 'large',
                    'itemId'    => 'clear_lock',
                    'tooltip'   => __('Clear lock'),
                    'ui'        => 'button-orange'
                ]
            ]
        ];
        
        $b = ['xtype' => 'buttongroup', 'title' => null, 'items' => [
                [
                    'xtype'     => 'button',     
                    'glyph'     => Configure::read('icnCsv'), 
                    'scale'     => 'large', 
                    'itemId'    => 'csv',      
                    'tooltip'   => __('Export CSV'),
                    'ui'        => 'default'
                ]
            ]
        ];      
        $menu = [$a];            
      
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
 
    public function delete($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        		
		$req_d		= $this->request->getData();
		$req_q		= $this->request->getQuery();
		
		if(isset($req_q['cloud_id']) && isset($req_d['model'])){
		    $where = [
		        'ImportFailures.cloud_id' => $req_q['cloud_id'],
		        'ImportFailures.model'    => $req_d['model'],
		    ];
		    $this->{$this->main_model}->deleteAll($where);
		}
		       
        $this->set([
            'data'      => $req_d,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function clearLock() {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        if (file_exists($this->tmpName)) {
            unlink($this->tmpName);
        }
        				       
        $this->set([
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
}
