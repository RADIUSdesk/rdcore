<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\ORM\TableRegistry;

class AcosRightsController extends AppController{

    protected $aco_ap  = 'Access Providers';
    public $base    = "Access Providers/Controllers/AcosRights/";   //This is required for Aa component  
  
    public function initialize(){  
        parent::initialize();           
        $this->loadComponent('Aa');    
    }
    
    public function index(){

        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 

        $conditions = ['Acos.parent_id IS NULL','Acos.foreign_key IS NULL'];
        if(isset($this->request->query['node'])){
            if($this->request->query['node'] != 0){
                $id = $this->request->query['node'];
                $conditions = ['Acos.parent_id' => $id,'Acos.foreign_key IS NULL'];
            }
        }
        //We only will list the first level of nodes
        $q_r = $this->Acl->Aco->find()->where($conditions)->all();

        $items = array();
        foreach($q_r as $i){

            $id         = $i->id;
            $parent_id  = $i->parent_id;
            $alias      = $i->alias;
            $comment    = $i->comment;
            $leaf       = false;
            $icon_cls   = '';
            $node = $this->Acl->Aco->get($id);
            if($this->Acl->Aco->childCount($node) == 0){
                $leaf       = true;
                $icon_cls   = 'list';
            }
            array_push($items,array('id' => $id, 'alias' => $alias,'leaf' => $leaf,'comment' => $comment, 'iconCls' => $icon_cls)); 
        }
            
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));

    }
    
    public function indexAp(){
        //Return the default rights of the Access Provider group which is under the 'Access Providers' branch of the tree

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $id = null;
        
        if(isset($this->request->query['node'])){
            if($this->request->query['node'] == 0){
                $ap = $this->aco_ap;
                //Get the Node that is specified as 'Access Providers' directly under the root node
                $qr = $this->Acl->Aco->find()->where(['Acos.parent_id IS NULL','Acos.alias' =>$ap])->first();
                $id = $qr->id;
            }else{
                $id = $this->request->query['node'];
            }
        }
         
        //We only will list the first level of nodes
        $q_r = $this->Acl->Aco->find()->where(['Acos.parent_id' => $id])->all();
        
        //Get the id of the AP Group
        
        $this->Groups   = TableRegistry::get('Groups');
        $g_q            = $this->Groups->find()->where(['Groups.name' => Configure::read('group.ap')])->first();
        $group_id       = $g_q->id;
        
        if(isset($this->request->query['ap_id'])){
            $fk_id = $this->request->query['ap_id'];
            $model = 'Users';
        }else{
            $fk_id = $group_id;
            $model = 'Groups';
        }
        $items = array();
        foreach($q_r as $i){
            $id         = $i->id;
            $parent_id  = $i->parent_id;
            $alias      = $i->alias;
            $comment    = $i->comment;
            $leaf       = false;
            $allowed    = false;
            $group_right= '';   //default for branches
            $icon_cls   = '';
        
            $node = $this->Acl->Aco->get($id);
            if($this->Acl->Aco->childCount($node) == 0){
                $leaf = true;
                $icon_cls = 'list';
                //Check if allowed //We only toggle on leave level
                if($this->Acl->check(array('model' => $model, 'foreign_key' => $fk_id),$this->_return_aco_path($id))){
                    $allowed = true;
                }
                //Add-on to display the default group right if we are showing the rights for an AP person
                if($model == 'Users'){
                    $group_right = 'no';
                    if($this->Acl->check(array('model' => 'Groups', 'foreign_key' => $group_id),$this->_return_aco_path($id))){
                        $group_right = 'yes';
                    }
                }
            }
            
            if($model == 'User'){
                array_push($items,
                    array('id' => $id, 'alias' => $alias,'leaf' => $leaf,'comment' => $comment,'allowed' => $allowed,'group_right' => $group_right,'iconCls' => $icon_cls));
            }else{
                array_push($items,
                    array('id' => $id, 'alias' => $alias,'leaf' => $leaf,'comment' => $comment,'allowed' => $allowed, 'iconCls' => $icon_cls));
            }
            
        }
           
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
    public function add(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
    
        if ($this->request->is('post')) {
            if($this->request->data['parent_id'] == 0){
                $this->request->data['parent_id'] = null;            
            } 
            $entity = $this->Acl->Aco->newEntity($this->request->data());
            if($this->Acl->Aco->save($entity)){
                $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            }
        }
    }
    
    public function edit(){

        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }

        if ($this->request->is('post')) {
            if($this->request->data['parent_id'] == 0){
                $this->request->data['parent_id'] = null;            
            }

            if($this->request->data['id'] == 0){
                $this->set(array(
                    'success' => false,
                    'message' => array('message' => __('Not allowed to change root node')),
                    '_serialize' => array('success','message')
                ));
            }else{
                $entity = $this->Acl->Aco->get($this->request->data['id']);
                $this->Acl->Aco->patchEntity($entity, $this->request->data());  
                if($this->Acl->Aco->save($entity)){
                    $this->set(array(
                        'success' => true,
                        '_serialize' => array('success')
                    ));
                }
            }
        }
    }
     
    public function editAp(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $id             = $this->request->data['id'];
        if(isset($this->request->query['ap_id'])){   //This is specific to an AP
            $fk_id = $this->request->query['ap_id'];
            $model = 'Users';
        }else{ //Assume this is general to the AP Group
            //Get the id of the AP Group
            $this->Groups   = TableRegistry::get('Groups');
            $g_q            = $this->Groups->find()->where(['Groups.name' => Configure::read('group.ap')])->first();
            $fk_id          = $g_q->id;
            $model          = 'Groups';
        }

        if($this->request->data['allowed'] == false){
             $this->Acl->deny(array('model' => $model, 'foreign_key' => $fk_id),$this->_return_aco_path($id));
        }

        if($this->request->data['allowed'] == true){
            $this->Acl->allow(array('model' => $model, 'foreign_key' => $fk_id),$this->_return_aco_path($id));
        }
        
        $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
        ));
    }
    
    public function delete(){
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 

        if(isset($this->request->data['id'])){   //Single item delete
            $entity = $this->Acl->Aco->get($this->request->data['id']); 
            $this->Acl->Aco->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity = $this->Acl->Aco->get($this->request->data['id']);
                $this->Acl->Aco->delete($entity);
            }
        }
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }
     
    private function _return_aco_path($id){
    
        $parents        = $this->Acl->Aco->find('path', ['for' => $id]); 
        $path_string    = '';
        foreach($parents as $line_num => $i){
            if($line_num == 0){
                $path_string = $i->alias;
            }else{
                $path_string = $path_string."/".$i->alias;
            }
        }
        return $path_string;
    }
       
}
