<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

use Cake\Utility\Inflector;

class DataCollectorsController extends AppController{

    protected $main_model = 'DataCollectors';
  
    public function initialize(){  
        parent::initialize(); 
        $this->loadModel($this->main_model);
        
        $this->loadModel('DynamicDetails');
        $this->loadModel('DynamicPairs');
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons'); 
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
         
    }
    
    public function macCheck(){
    
        $data   = $this->request->data;      
        $q_r    = $this->_find_dynamic_detail_id();
        
        $data['ci_required']  = false; // By defaul don't ask for customer info;
                 
        if($q_r){

            //Once we found the Dynamic Login Page; We need to figure out if we need pop up the require customer info dialog
            //For that we need to look for a combo **dynamic_detail_id** and **mac**
            //IF found look at the modify timestamp and if it 'expired' ask for it again
            //If not found ask for it (ci_required == true)
            //Else we set ci_required == false since we found the combo and it has not expired yet  
            $dd_id          = $q_r->dynamic_detail_id;
            $dd_resuply_int = $q_r->dynamic_detail->dynamic_detail_ctc->ci_resupply_interval;
            $data['dd_id']  = $dd_id;          
            if($q_r->dynamic_detail->dynamic_detail_ctc->cust_info_check == true){
            
                if($dd_resuply_int == -1){
                    $data['ci_required'] = true; // Every time == -1 //No need to check if expired
                }else{       
                    $q_dd = $this->{$this->main_model}->find()
                        ->where([$this->main_model.'.dynamic_detail_id' => $dd_id,$this->main_model.'.mac' => $this->request->data['mac']])
                        ->order(['modified' => 'DESC']) //Get the most recent one 
                        ->first();
                    if($q_dd){
                        if($dd_resuply_int > 0){ //This has an expiry date lets compare           
                            $expiry_time    = $q_dd->modified->toUnixString()+($dd_resuply_int * 24 * 60 *60);
                            $now            = new FrozenTime();
                            if($expiry_time < $now->toUnixString()){
                                //It already expired ask for a new one
                                $data['ci_required'] = true;
                            }   
                        }
                    }else{
                        $data['ci_required'] = true; //We did not found it so have to supply customer info
                    }
                }
            }                                
        } 
        
        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['data','success']
        ]);
        
    }
    
    public function addMac(){
        if ($this->request->is('post')) { 
            if($this->request->getData('email')){
                if(!$this->_test_email($this->request->data['email'])){
                    return;
                }
            }
            $dd = $this->_find_dynamic_detail_id();
            
            if(!$dd){
                $this->set(array(
                    'errors'    => ['email' => "Dynamic Login Page Not Found"],
                    'success'   => false,
                    'message'   => "Dynamic Login Page Not Found",
                    '_serialize' => array('errors','success','message')
                ));
                return;
            }else{
                $this->request->data['dynamic_detail_id'] = $dd->dynamic_detail->id;
            }
               
            $this->request->data['public_ip'] = $this->request->clientIp();
            $this->request->data['is_mobile'] = $this->request->isMobile();
            
            //See if there are not perhaps one already that just needs refreshing
            //== Record EVERY TIME ==
          /*  $q_dd = $this->{$this->main_model}->find()
                    ->where([
                        $this->main_model.'.dynamic_detail_id' => $dd->dynamic_detail->id,
                        $this->main_model.'.mac' => $this->request->data['mac']
                    ])
                    ->first();
            if($q_dd){
                $this->{$this->main_model}->patchEntity($q_dd, $this->request->data);
                $this->{$this->main_model}->save($q_dd);
            }else{ */     
                $entity = $this->{$this->main_model}->newEntity($this->request->data);
                $this->{$this->main_model}->save($entity);
          //  }
            
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }    
    }
    
     public function exportCsv(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $dd_id      = $this->request->query['dynamic_detail_id'];
        $query      = $this->{$this->main_model}->find()->where(['DataCollectors.dynamic_detail_id'=> $dd_id]);
        
        $q_r    = $query->all();

       

        //Headings
        $heading_line   = array();
        if(isset($this->request->query['columns'])){
            $columns = json_decode($this->request->query['columns']);
            foreach($columns as $c){
                array_push($heading_line,$c->name);
            }
        }
        $data = [
            $heading_line
        ];
        
        foreach($q_r as $i){
            $columns    = array();
            $csv_line   = array();
            if(isset($this->request->query['columns'])){
                $columns = json_decode($this->request->query['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                    array_push($csv_line,$i->{$column_name});
                }
                array_push($data,$csv_line);
            }
        }
                
        $_serialize = 'data';
        $this->setResponse($this->getResponse()->withDownload('export.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(compact('data', '_serialize'));  
         
    } 
    
    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $dd_id      = $this->request->query['dynamic_detail_id'];
        $query      = $this->{$this->main_model}->find()
            ->where(['DataCollectors.dynamic_detail_id'=> $dd_id])
            ->contain(['DynamicDetails']);

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($this->request->query['limit'])) {
            $limit = $this->request->query['limit'];
            $page = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items = array();

        foreach ($q_r as $i) {         
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
            } 
            $row['dynamic_detail_name'] = $i->dynamic_detail->name;
                 
			$row['update']		= 'true';
			$row['delete']		= 'true';       
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
        
        $this->_addOrEdit($user,'add');
        
    }
    
    public function edit(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->_addOrEdit($user,'edit');
        
    }
    
    private function _test_email($email){
    
        //Do some validity test for email
        $pieces = explode("@", $email);
        $domain = $pieces[1]; 
        if(!checkdnsrr($domain)){
            $this->set(array(
                'errors'    => ['email' => "Domain $domain is not valid"],
                'success'   => false,
                'message'   => "Domain $domain is not valid",
                '_serialize' => array('errors','success','message')
            ));
            return false;
        }     
        return true;  
    }
    
    private function _find_dynamic_detail_id(){
    
        $result = false;
        $conditions = array("OR" =>array());
        foreach(array_keys($this->request->data) as $key){
            array_push($conditions["OR"],
                array("DynamicPairs.name" => $key, "DynamicPairs.value" =>  $this->request->data[$key])
            ); //OR query all the keys
        }
       	
		$q_r = $this->DynamicPairs
            ->find()
            ->contain([
                'DynamicDetails' => ['DynamicDetailCtcs']
            ])
            ->where([$conditions])
            ->order(['DynamicPairs.priority' => 'DESC'])
            ->first();
      
        if($q_r){
            $result = $q_r;
            return $result;
        }
    }
    
    
    private function _addOrEdit($user,$type= 'add') {

        //__ Authentication + Authorization __
        
        $user_id    = $user['id'];
        
        if($this->request->getData('email')){
            if(!$this->_test_email($this->request->data['email'])){
                return;
            }
        }
        
        $this->request->data['public_ip'] = $this->request->clientIp();
        $this->request->data['is_mobile'] = $this->request->isMobile();
       
        if($type == 'add'){ 
            $entity = $this->{$this->main_model}->newEntity($this->request->data);
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($this->request->data['id']);
            $this->{$this->main_model}->patchEntity($entity, $this->request->data);
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
            $entity  = $this->{$this->main_model}->get($this->request->data['id']);   
            $this->{$this->main_model}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
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
}
