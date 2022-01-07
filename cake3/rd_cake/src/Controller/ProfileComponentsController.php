<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 07/09/2018
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

    public function initialize(){
        parent::initialize();
        $this->loadModel('ProfileComponents');
        $this->loadModel('Users');
        
        $this->loadModel('Radgroupchecks');
        $this->loadModel('Radgroupreplies');
        
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'ProfileComponents',
            'sort_by' => 'ProfileComponents.name'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        
        $this->loadComponent('Freeradius'); 
        
        $this->loadComponent('Notes', [
            'model' => 'ProfileComponentNotes',
            'condition' => 'profile_component_id'
        ]); 
    }
    
    
    public function vendors(){
    //Gives a list of Vendors from the dictionaries including a few special ones that is not defined but used to group the attributes
        $v = $this->Freeradius->getVendors();
        $items = array();
        foreach($v as $i){
            array_push($items, array('id' => $i, 'name' => $i));
        }
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
    public function attributes(){
    //Gives the attributes based on the name of the 'vendor' query attribute
        $items = array();
        if(isset($this->request->query['vendor'])){
            $a  = $this->Freeradius->getAttributes($this->request->query['vendor']);
            foreach($a as $i){
                array_push($items, array('id' => $i, 'name' => $i));
            }
        }
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
    public function indexComp(){
    //Returns a list of vendor attributes based on the tmpl_id query attribute.
        $items = array();
        if(isset($this->request->query['comp_id'])){
            $comp_id = $this->request->query['comp_id'];
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
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
    public function addComp(){

        if(isset($this->request->query['comp_id'])){
            $comp_id    = $this->request->query['comp_id'];
            $e_pc       = $this->ProfileComponents->find()->where(['ProfileComponents.id' => $comp_id])->first();
            $this->request->data['groupname'] = $e_pc->name;
            $this->request->data['id'] = ''; //Wipe it since ExtJs 6 add some random stuff here

            //CHECK
            if($this->request->data['type'] == 'check'){
                $entity = $this->Radgroupchecks->newEntity($this->request->data);  
                if ($this->Radgroupchecks->save($entity)) {
                    $id = 'chk_'.$entity->id;
                    $this->request->data['id'] = $id;
                    $this->set(array(
                        'items'     => $this->request->data,
                        'success' => true,
                        '_serialize' => array('success','items')
                    ));
                } else {
                    $message = __('Could not create item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }

            //REPLY
            if($this->request->data['type'] == 'reply'){
                $entity = $this->Radgroupreplies->newEntity($this->request->data);
                if ($this->Radgroupreplies->save($entity)) {
                    $id = 'rpl_'.$entity->id;
                    $this->request->data['id'] = $id;
                    $this->set(array(
                        'items'     => $this->request->data,
                        'success'   => true,
                        '_serialize' => array('success','items')
                    ));
                } else {
                    $message = __('Could not create item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }
        }
    }
    
     public function editComp(){

         if(isset($this->request->query['comp_id'])){

            //Check if the type check was not changed
            if((preg_match("/^chk_/",$this->request->data['id']))&&($this->request->data['type']=='check')){ //check Type remained the same
                //Get the id for this one
                $type_id            = explode( '_', $this->request->data['id']);
                $this->request->data['id']   = $type_id[1]; 
                $entity = $this->Radgroupchecks->get($this->request->data['id']);
                $this->Radgroupchecks->patchEntity($entity, $this->request->data);
                
                if ($this->Radgroupchecks->save($entity)){
                    $id = 'chk_'.$entity->id;
                    $this->request->data['id'] = $id;
                    $this->set(array(
                        'items'     => $this->request->data,
                        'success'   => true,
                        '_serialize' => array('success','items')
                    ));
                } else {
                    $message = __('Could not edit item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }

            //Check if the type reply was not changed
            if((preg_match("/^rpl_/",$this->request->data['id']))&&($this->request->data['type']=='reply')){ //reply Type remained the same
                //Get the id for this one
                $type_id            = explode( '_', $this->request->data['id']);
                $this->request->data['id']   = $type_id[1];
                $entity = $this->Radgroupreplies->get($this->request->data['id']);
                $this->Radgroupreplies->patchEntity($entity, $this->request->data);
                
                if ($this->Radgroupreplies->save($entity)){
                    $id = 'rpl_'.$entity->id;
                    $this->request->data['id'] = $id;
                    $this->set(array(
                        'items'     => $this->request->data,
                        'success'   => true,
                        '_serialize' => array('success','items')
                    ));
                } else {
                    $message = __('Could not edit item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }

            //____ Attribute Type changes ______
            if((preg_match("/^chk_/",$this->request->data['id']))&&($this->request->data['type']=='reply')){

                //Delete the check; add a reply
                $type_id = explode( '_', $this->request->data['id']);
                $entity  = $this->Radgroupchecks->get($type_id[1]);
                if($entity){
                    $this->Radgroupchecks->delete($entity);
                }

                //Create
                $e_repl = $this->Radgroupreplies->newEntity($this->request->data);
                
                if ($this->Radgroupreplies->save($e_repl)) {
                    $id = 'rpl_'.$e_repl->id;
                    $this->request->data['id'] = $id;
                    $this->set(array(
                        'items'     => $this->request->data,
                        'success'   => true,
                        '_serialize' => array('success','items')
                    ));
                } else {
                    $message = __('Could not edit item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }

            if((preg_match("/^rpl_/",$this->request->data['id']))&&($this->request->data['type']=='check')){

                //Delete the check; add a reply
                $type_id = explode( '_', $this->request->data['id']);
                $entity  = $this->Radgroupreplies->get($type_id[1]);
                if($entity){
                    $this->Radgroupreplies->delete($entity);
                }
                
                //Create
                $e_chk = $this->Radgroupchecks->newEntity($this->request->data);
                
                if ($this->Radgroupchecks->save($e_chk)) {
                    $id = 'chk_'.$e_chk->id;
                    $this->request->data['id'] = $id;
                    $this->set(array(
                        'items'     => $this->request->data,
                        'success'   => true,
                        '_serialize' => array('success','items')
                    ));
                } else {
                    $message = __('Could not edit item');
                    $this->JsonErrors->entityErros($entity,$message);
                }
            }
        }
    }
    
    public function deleteComp(){

        $fail_flag = true;
        if(isset($this->request->data['id'])){   //Single item delete
            $type_id            = explode( '_', $this->request->data['id']);
            if(preg_match("/^chk_/",$this->request->data['id'])){
                $entity  = $this->Radgroupchecks->get($type_id[1]);
                if($entity){
                    $this->Radgroupchecks->delete($entity);
                }
            }

            if(preg_match("/^rpl_/",$this->request->data['id'])){   
                $entity  = $this->Radgroupreplies->get($type_id[1]);
                if($entity){
                    $this->Radgroupreplies->delete($entity);
                }
            }
            $fail_flag = false;
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
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
                'success' => true,
                '_serialize' => array('success')
            ));
        }
    }



    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query, $user, ['Users','Radgroupchecks','Radgroupreplies','ProfileComponentNotes' => ['Notes']]); //AP QUERY is sort of different in a way

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
                          
            $row['check_attribute_count'] = count($i->{"radgroupchecks"});
            $row['reply_attribute_count'] = count($i->{"radgroupreplies"});
            
            $notes_flag = false;
            foreach ($i->profile_component_notes as $pc_n) {
                if (!$this->Aa->test_for_private_parent($pc_n->note, $user)) {
                    $notes_flag = true;
                    break;
                }
            }
            
                 
            $row['owner']		= $owner_tree;
            $row['owner']		= $owner_tree;
			$row['notes']		= $notes_flag;
			
			$row['update']		= $action_flags['update'];
			$row['delete']		= $action_flags['delete']; 
            
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
    
    private function _addOrEdit($user,$type= 'add') {

        //__ Authentication + Authorization __
        
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
       
        if($type == 'add'){ 
            $this->request->data['token_key'] = Text::uuid();
            $entity = $this->{$this->main_model}->newEntity($this->request->data());
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($this->request->data['id']);
            $this->{$this->main_model}->patchEntity($entity, $this->request->data());
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

    public function menuForGrid()
    {
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'basic_and_doc'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
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
}
