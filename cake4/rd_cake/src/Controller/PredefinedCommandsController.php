<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 10/08/2021
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

class PredefinedCommandsController extends AppController {

    public $base            = "Access Providers/Controllers/PredefinedCommands/";
    protected $owner_tree   = [];
    protected $main_model   = 'PredefinedCommands';
    
    public function initialize():void{
        parent::initialize();
        
        $this->loadModel($this->main_model);
        $this->loadModel('Users');

        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'     => 'PredefinedCommands',
            'sort_by'   => 'PredefinedCommands.name'
        ]);
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');    
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
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
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,[]);
        
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

        foreach ($q_r as $i) {
	        array_push($items, ['id' => $i->id,'name' => $i->name, 'action' => $i->action]);        
        }

        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => ['items', 'success', 'totalCount']
        ]);
    }
    
    
    
    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
       	$query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,[]);


        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
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

        foreach ($q_r as $i) {
       
            $row            = [];
            $fields         = $this->{$this->main_model}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};             
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            } 

			$row['update']		= true;
			$row['delete']		= true; 
            
            array_push($items, $row);
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
        
        $this->_addOrEdit('add');
        
    }
    
    public function edit(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->_addOrEdit('edit');
        
    }
    
    private function _addOrEdit($type= 'add') {

        //__ Authentication + Authorization __       
        $req_d 		= $this->request->getData();
        $check_items = [
			'active'
		];
        foreach($check_items as $i){
            if(isset($req_d[$i])){
                $req_d[$i] = 1;
            }else{
                $req_d[$i] = 0;
            }
        }
       
        if($type == 'add'){ 
            $entity = $this->{$this->main_model}->newEntity($req_d);
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->find()->where(['PredefinedCommands.id' => $req_d['id']])->first();
            if($entity){
                $this->{$this->main_model}->patchEntity($entity, $req_d);
            }
        }
              
        if ($this->{$this->main_model}->save($entity)) {
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
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
        
        $req_d 		= $this->request->getData();
        $fail_flag 	= false;

	    if(isset($req_d['id'])){   //Single item delete      
            $entity     = $this->{$this->main_model}->get($req_d['id']);          
         	$this->{$this->main_model}->delete($entity);  
        }else{                          
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);    
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

    public function menuForGrid()
    {
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'basic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
}
