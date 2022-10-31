<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 23/JUL/2022
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;

class ProfileComponentsController extends AppController {

    public $base = "Access Providers/Controllers/ProfileComponents/";
    protected $owner_tree = array();
    protected $main_model = 'ProfileComponents';

    public function initialize():void{
        parent::initialize();
        $this->loadModel('ProfileComponents');
        $this->loadModel('Users');
        
        $this->loadModel('Radgroupchecks');
        $this->loadModel('Radgroupreplies');
        
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'ProfileComponents',
            'sort_by' => 'ProfileComponents.name'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        
        $this->loadComponent('Freeradius'); 
    }
    
    
    public function vendors(){
    //Gives a list of Vendors from the dictionaries including a few special ones that is not defined but used to group the attributes
        $v = $this->Freeradius->getVendors();
        $items = [];
        foreach($v as $i){
            array_push($items, ['id' => $i, 'name' => $i]);
        }
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function attributes(){
    //Gives the attributes based on the name of the 'vendor' query attribute
        $items 	= [];
        $req_q  = $this->request->getQuery(); //q_data is the query data 
        if(isset($req_q['vendor'])){
            $a  = $this->Freeradius->getAttributes($req_q['vendor']);
            foreach($a as $i){
                array_push($items, array('id' => $i, 'name' => $i));
            }
        }
        $this->set(array(
            'items' => $items,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function indexComp(){
    //Returns a list of vendor attributes based on the tmpl_id query attribute.
        $items 	= [];
        $req_q  = $this->request->getQuery(); //q_data is the query data  
        if(isset($req_q['comp_id'])){
            $comp_id = $req_q['comp_id'];
            $q_r = $this->ProfileComponents->find()
                ->where(['ProfileComponents.id' =>$comp_id])
                ->contain(['Radgroupchecks','Radgroupreplies'])
                ->first();
            
            if($q_r){
                $id_prefix = 'chk_';
                foreach($q_r->radgroupchecks as $i){
                    array_push($items, array(
                        'id'            => $id_prefix.$i->id,
                        'type'          => 'check',
                        'groupname'     => $i->groupname,
                        'attribute'     => $i->attribute,
                        'op'            => $i->op,
                        'value'         => $i->value,
                        'comment'       => $i->comment
                    ));
                }

                //Then the radreply's
                $id_prefix = 'rpl_';
                foreach($q_r->radgroupreplies as $i){
                    array_push($items, array(
                        'id'            => $id_prefix.$i->id,
                        'type'          => 'reply',
                        'groupname'     => $i->groupname,
                        'attribute'     => $i->attribute,
                        'op'            => $i->op,
                        'value'         => $i->value,
                        'comment'       => $i->comment
                    ));
                }
            }       
        }
        $this->set(array(
            'items' => $items,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function addComp(){
    
    	$req_q  = $this->request->getQuery(); //q_data is the query data 
    	$req_d  = $this->request->getData(); //q_data is the query data 

        if(isset($req_q['comp_id'])){
            $comp_id    = $req_q['comp_id'];
            $e_pc       = $this->ProfileComponents->find()->where(['ProfileComponents.id' => $comp_id])->first();
            $req_d['groupname'] = $e_pc->name;
            $req_d['id'] = ''; //Wipe it since ExtJs 6 add some random stuff here

            //CHECK
            if($req_d['type'] == 'check'){
                $entity = $this->Radgroupchecks->newEntity($req_d);  
                if ($this->Radgroupchecks->save($entity)) {
                    $id = 'chk_'.$entity->id;
                    $req_d['id'] = $id;
                    $this->set(array(
                        'items'     => $req_d,
                        'success' => true
                    ));
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not create item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }

            //REPLY
            if($req_d['type'] == 'reply'){
                $entity = $this->Radgroupreplies->newEntity($req_d);
                if ($this->Radgroupreplies->save($entity)) {
                    $id = 'rpl_'.$entity->id;
                    $req_d['id'] = $id;
                    $this->set(array(
                        'items'     => $req_d,
                        'success'   => true
                    ));
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not create item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }
        }
    }
    
     public function editComp(){
     
     	$req_q  = $this->request->getQuery(); 
     	$req_d  = $this->request->getData(); 

         if(isset($req_q['comp_id'])){

            //Check if the type check was not changed
            if((preg_match("/^chk_/",$req_d['id']))&&($req_d['type']=='check')){ //check Type remained the same
                //Get the id for this one
                $type_id            = explode( '_', $req_d['id']);
                $req_d['id']   = $type_id[1]; 
                $entity = $this->Radgroupchecks->get($req_d['id']);
                $this->Radgroupchecks->patchEntity($entity, $req_d);
                
                if ($this->Radgroupchecks->save($entity)){
                    $id = 'chk_'.$entity->id;
                    $req_d['id'] = $id;
                    $this->set(array(
                        'items'     => $req_d,
                        'success'   => true
                    ));
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not edit item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }

            //Check if the type reply was not changed
            if((preg_match("/^rpl_/",$req_d['id']))&&($req_d['type']=='reply')){ //reply Type remained the same
                //Get the id for this one
                $type_id            = explode( '_', $req_d['id']);
                $req_d['id']   = $type_id[1];
                $entity = $this->Radgroupreplies->get($req_d['id']);
                $this->Radgroupreplies->patchEntity($entity, $req_d);
                
                if ($this->Radgroupreplies->save($entity)){
                    $id = 'rpl_'.$entity->id;
                    $req_d['id'] = $id;
                    $this->set(array(
                        'items'     => $req_d,
                        'success'   => true
                    ));
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not edit item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }

            //____ Attribute Type changes ______
            if((preg_match("/^chk_/",$req_d['id']))&&($req_d['type']=='reply')){

                //Delete the check; add a reply
                $type_id = explode( '_', $req_d['id']);
                $entity  = $this->Radgroupchecks->get($type_id[1]);
                if($entity){
                    $this->Radgroupchecks->delete($entity);
                }

                //Create
                $e_repl = $this->Radgroupreplies->newEntity($req_d);
                
                if ($this->Radgroupreplies->save($e_repl)) {
                    $id = 'rpl_'.$e_repl->id;
                    $req_d['id'] = $id;
                    $this->set(array(
                        'items'     => $req_d,
                        'success'   => true
                    ));
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not edit item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }

            if((preg_match("/^rpl_/",$req_d['id']))&&($req_d['type']=='check')){

                //Delete the check; add a reply
                $type_id = explode( '_', $req_d['id']);
                $entity  = $this->Radgroupreplies->get($type_id[1]);
                if($entity){
                    $this->Radgroupreplies->delete($entity);
                }
                
                //Create
                $e_chk = $this->Radgroupchecks->newEntity($req_d);
                
                if ($this->Radgroupchecks->save($e_chk)) {
                    $id = 'chk_'.$e_chk->id;
                    $req_d['id'] = $id;
                    $this->set(array(
                        'items'     => $req_d,
                        'success'   => true
                    ));
                    $this->viewBuilder()->setOption('serialize', true);
                } else {
                    $message = __('Could not edit item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }
        }
    }
    
    public function deleteComp(){

        $fail_flag = true;
        $req_d  = $this->request->getData(); 
        
        if(isset($req_d['id'])){   //Single item delete
            $type_id            = explode( '_', $req_d['id']);
            if(preg_match("/^chk_/",$req_d['id'])){
                $entity  = $this->Radgroupchecks->get($type_id[1]);
                if($entity){
                    $this->Radgroupchecks->delete($entity);
                }
            }

            if(preg_match("/^rpl_/",$req_d['id'])){   
                $entity  = $this->Radgroupreplies->get($type_id[1]);
                if($entity){
                    $this->Radgroupreplies->delete($entity);
                }
            }
            $fail_flag = false;
   
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $type_id            = explode( '_', $d['id']);
                if(preg_match("/^chk_/",$d['id'])){
                    $entity  = $this->Radgroupchecks->get($type_id[1]);
                    if($entity){
                        $this->Radgroupchecks->delete($entity);
                    }
                }
                if(preg_match("/^rpl_/",$d['id'])){   
                    $entity  = $this->Radgroupreplies->get($type_id[1]);
                    if($entity){
                        $this->Radgroupreplies->delete($entity);
                    }
                }          
                $fail_flag = false;  
            }
        }

        if($fail_flag == true){
            $message = __('Could not delete some items');
            $this->JsonErrors->entityErros($entity,$message);
        }else{
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
    }

    public function index(){
              
        $req_q    = $this->request->getQuery(); //q_data is the query data      
       	$cloud_id = $req_q['cloud_id'];
       	
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['Radgroupchecks','Radgroupreplies']);

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($req_q['limit'])) {
            $limit 	= $req_q['limit'];
            $page 	= $req_q['page'];
            $offset = $req_q['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items = [];

        foreach ($q_r as $i) {
                              
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
                          
            $row['check_attribute_count'] = count($i->{"radgroupchecks"});
            $row['reply_attribute_count'] = count($i->{"radgroupreplies"});			
			$row['update']		= true;
			$row['delete']		= true; 
            
            array_push($items, $row);
        }

        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function add(){   
        $this->_addOrEdit('add');        
    }
    
    public function edit(){    
        $this->_addOrEdit('edit');      
    }
    
    private function _addOrEdit($type= 'add') {
                  
        if($type == 'add'){ 
            $entity = $this->{$this->main_model}->newEntity($this->request->getData());
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($this->request->getData('id'));
            $this->{$this->main_model}->patchEntity($entity, $this->request->getData());
        }
              
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

    public function delete() {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

	    if($this->request->getData('id')){       
            $entity     = $this->{$this->main_model}->get($this->request->getData('id'));   
            $this->{$this->main_model}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($this->request->getData() as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);                 
              	$this->{$this->main_model}->delete($entity);
            }
        }
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}

    public function menuForGrid()
    {
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons( false, 'basic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
}
