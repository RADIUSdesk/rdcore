<?php

namespace App\Controller;

use Cake\Core\Configure;

class LimitsController extends AppController {

    public $main_model  = 'Limits';
    public $base     = "Access Providers/Controllers/Limits/";

//------------------------------------------------------------------------

    public function initialize()
    {
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('Users');

        $this->loadComponent('Aa');
    }

    //____ BASIC CRUD Manager ________
    
    public function limitCheck(){
    
        //Check if the limits is actually turned on
        Configure::load('Limits');
        $is_active = Configure::read('Limits.Global.Active');
        $this->set([
            'data' => ['enabled' => $is_active],
            'success' => true,
            '_serialize' => ['data','success']
        ]);
    }
    
    
    
    
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        
        $items      = [];
        //Check if the limits is actually turned on
        Configure::load('Limits');
        $is_active = Configure::read('Limits.Global.Active');
        if($is_active){
        
            $ap_id = false;
            if(array_key_exists('ap_id', $this->request->getQuery())){
                $ap_id = $this->request->getQuery('ap_id');
            }
            
            if($ap_id){
                $items = $this->_find_limits_for($ap_id);
            }
        }
         
        
        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            '_serialize' => ['items','success']
        ]);
    }

	public function edit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $cdata = $this->request->getData();

        if ($this->request->is('post')) {
            if(array_key_exists('ap_id', $this->request->getQuery())){
                $ap_id      = $this->request->getQuery('ap_id');
                $alias      = $this->request->getData('alias');
                $cdata['user_id'] = $ap_id;
             
                //See if there is already and entry for this one
                $q_r = $this->Limits->find()->where(['Limits.user_id' => $ap_id,'Limits.alias' => $alias])->first();

                if($q_r){
                    $cdata['id']      = $q_r->id;
                }else{
                    unset($cdata['id']);
                }

                $limitEntity = $this->Limits->newEntity($cdata);

                if ($this->Limits->save($limitEntity)) {
                       $this->set([
                        'success' => true,
                        '_serialize' => ['success']
                    ]);
                }
            }       
        }
    }

    //----- Menus ------------------------
    public function menuForGrid(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        //Empty by default
        $menu = [];

        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin

            $menu = [
                ['xtype' => 'buttongroup','title' => __('Action'), 'items' => [
                    ['xtype' => 'button', 'iconCls' => 'b-reload',  'glyph'     => Configure::read('icnReload'), 'scale' => 'large', 'itemId' => 'reload',   'tooltip'=> __('Reload')],
                    ['xtype' => 'button', 'iconCls' => 'b-add',     'glyph'     => Configure::read('icnAdd'), 'scale' => 'large', 'itemId' => 'add',      'tooltip'=> __('Add')],
                    ['xtype' => 'button', 'iconCls' => 'b-delete',  'glyph'     => Configure::read('icnDelete'), 'scale' => 'large', 'itemId' => 'delete',   'tooltip'=> __('Delete')],
                    ['xtype' => 'button', 'iconCls' => 'b-edit',    'glyph'     => Configure::read('icnEdit'), 'scale' => 'large', 'itemId' => 'edit',     'tooltip'=> __('Edit')]
                ]],
            ];
        }

        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $action_group   = [];

            array_push($action_group, [
                'xtype'     => 'button',
                'iconCls'   => 'b-reload',
                'glyph'     => Configure::read('icnReload'),   
                'scale'     => 'large', 
                'itemId'    => 'reload',   
                'tooltip'   => __('Reload')]);

            //Add
            if($this->Acl->check(['model' => 'Users', 'foreign_key' => $id], $this->base."add")){
                array_push($action_group,[
                    'xtype'     => 'button', 
                    'iconCls'   => 'b-add',
                    'glyph'     => Configure::read('icnAdd'),      
                    'scale'     => 'large', 
                    'itemId'    => 'add',      
                    'tooltip'   => __('Add')]);
            }
            //Delete
            if($this->Acl->check(['model' => 'Users', 'foreign_key' => $id], $this->base.'delete')){
                array_push($action_group,[
                    'xtype'     => 'button', 
                    'iconCls'   => 'b-delete',
                    'glyph'     => Configure::read('icnDelete'),   
                    'scale'     => 'large', 
                    'itemId'    => 'delete',
                    'disabled'  => true,   
                    'tooltip'   => __('Delete')]);
            }

            //Edit
            if($this->Acl->check(['model' => 'Users', 'foreign_key' => $id], $this->base.'edit')){
                array_push($action_group,[
                    'xtype'     => 'button', 
                    'iconCls'   => 'b-edit',
                    'glyph'     => Configure::read('icnEdit'),     
                    'scale'     => 'large', 
                    'itemId'    => 'edit',
                    'disabled'  => true,     
                    'tooltip'   => __('Edit')]);
            }

            $menu = [
                        ['xtype' => 'buttongroup','title' => __('Action'),        'items' => $action_group]
                   ];
        }
        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }
    
    private function _find_limits_for($ap_id){
    
        $limits_return = [];
    
        //Get the default list; run through it and see if there are overrides
        Configure::load('Limits');
        $is_active      = Configure::read('Limits.Global.Active');
        $limits_data    = Configure::read('Limits');
        $id             = 1;
        
        foreach(array_keys($limits_data) as $key){
            if($key != 'Global'){
                $alias  = $key;
                $overrides = $this->_find_overrides_for($ap_id,$alias);
                if(count($overrides)>0){
                    $active = $overrides[0];
                    $count  = $overrides[1];
                }else{
                    $active = $limits_data["$key"]['Active'];
                    $count  = $limits_data["$key"]['Count'];
                }
                $desc   = $limits_data["$key"]['Description'];
                array_push($limits_return, ['id' =>$id, 'alias' => $alias, 'active' => $active, 'count' => $count, 'description' => $desc ]);
                $id ++;
            }
        }
        return $limits_return;
    }
    
    private function _find_overrides_for($ap_id, $alias){
        $overrides = [];
        $q_r = $this->Limits->find()->where(['Limits.user_id' => $ap_id,'Limits.alias' => $alias])->first();

        if($q_r){
            $overrides[0] = $q_r->active;
            $overrides[1] = $q_r->count;
        }
        return $overrides;
    }
}
