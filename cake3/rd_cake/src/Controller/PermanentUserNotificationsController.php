<?php

namespace App\Controller;

use Cake\Core\Configure;

class PermanentUserNotificationsController extends AppController {

    public $name = 'LicensedDevices';
    protected $main_model = 'PermanentUserNotifications';
    public $base = "Access Providers/Controllers/PermanentUserNotifications/";

    public function initialize()
    {
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('Users');
        $this->loadModel('PermanentUsers');
        $this->loadComponent('Aa');
        $this->loadComponent('GridFilter');

        $this->loadComponent('JsonErrors');

    }

    //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
 
        $query  = $this->{$this->main_model}->find();

        $this->_build_common_query($query, $user);

        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        if(null !== $this->request->getQuery('limit')
        ){
            $limit  = $this->request->getQuery('limit');
            $page   = $this->request->getQuery('page');
            $offset = $this->request->getQuery('start');
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items = [];

        foreach($q_r as $i){
            array_push($items, [
                'id'                    => $i->id,
                'permanent_user_id'     => $i->permanent_user_id,
                'username'              => $i['PermanentUsers']['username'],
                'active'                => $i->active,
                'method'                => $i->method,
                'type'                  => $i->type,
                'address_1'             => $i->address_1,
                'address_2'             => $i->address_2,
                'start'                 => $i->start,
                'increment'             => $i->increment,
                'last_value'            => $i->last_value,
                'last_notification'     => $i->last_notification,
            ]);
        }
       
        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
    }

    public function add() {

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];


        if(isset($this->request->data['active'])){
            $this->request->data['active'] = 1;
        }else{
            $this->request->data['active'] = 0;
        }

        $permanentUserNotificationEntity = $this->{$this->main_model}->newEntity($this->request->data);

        if ($this->{$this->main_model}->save($permanentUserNotificationEntity)) {
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        } else {
            $message = 'Error';
            $this->set([
                'errors'    => $this->JsonErrors->entityErros($permanentUserNotificationEntity, $message),
                'success'   => false,
                'message'   => ['message' => __('Could not create item')],
                '_serialize' => ['errors','success','message']
            ]);
        }
	}

    public function delete($id = null) {
		if (! $this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id = $user['id'];
        $fail_flag = false;

	    if(isset($this->data['id'])){   //Single item delete
            $message = "Single item ". $this->data['id'];
            $this->{$this->main_model}->query()->delete()->where(['id' => $this->data['id']])->execute();
        }else{                          //Assume multiple item delete
            foreach($this->data as $d){
                $this->{$this->main_model}->query()->delete()->where(['id' =>$d['id']])->execute();
            }
        }

        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   => ['message' => __('Could not delete some items')],
                '_serialize' => ['success','message']
            ]);
        }else{
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }
	}

	public function edit(){

		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if ($this->request->is('post')) {

            //Unfortunately there are many check items which means they will not be in the POST if unchecked
            //so we have to check for them
            $check_items = [
				'active'
			];

            $data = [];

            foreach($check_items as $i){
                if(isset($data[$i])){
                    $data[$i] = 1;
                }else{
                    $data[$i] = 0;
                }
            }

            $permanentUserNotificationEntity = $this->{$this->main_model}->newEntity($data);

            if ($this->{$this->main_model}->save($permanentUserNotificationEntity)) {
                   $this->set([
                    'success' => true,
                    '_serialize' => ['success']
                ]);
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
                        ['xtype' => 'buttongroup','title' => __('Action'), 'items' => $action_group]
                   ];
        }
        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }

    private function _find_parents($id){
        $q_r = $this->Users->find()->where(['Users.id' => $id])->all();

        $path_string= '';

        if($q_r){
            foreach($q_r as $line_num => $i){
                $username       = $i->username;
                if($line_num == 0){
                    $path_string    = $username;
                }else{
                    $path_string    = $path_string.' -> '.$username;
                }
            }
            if($line_num > 0){
                return $username." (".$path_string.")";
            }else{
                return $username;
            }
        }else{
            return __("orphaned");
        }
    }

    private function _is_sibling_of($parent_id,$user_id){
        $q_r = $this->Users->find()->where(['Users.id' => $user_id])->all();
        foreach($q_r as $i){
            $id = $i->id;
            if($id == $parent_id){
                return true;
            }
        }
        //No match
        return false;
    }

    private function _build_common_query($query, $user){

        $where = [];

        //What should we include....
        $query->contain(['PermanentUsers']);

        //===== SORT =====
        //Default values for sort and dir
        $sort   = 'PermanentUserNotifications.last_notification';
        $dir    = 'DESC';

        if(null !== $this->request->getQuery('sort')){
            if($this->request->getQuery('sort') == 'username'){
                $sort = 'PermanentUsers.username';
            }else{
                $sort = $this->main_model.'.'.$this->request->getQuery('sort');
            }
            $dir  = $this->request->getQuery('dir');
        }

        $query->order([$sort => $dir]);
        //==== END SORT ===


        //====== REQUEST FILTER =====
        if(null !== $this->request->getQuery('filter')){
            $filter = json_decode($this->request->getQuery('filter'));
            foreach($filter as $f){
                $f = $this->GridFilter->xformFilter($f);
                //Strings
                if($f->type == 'string'){
                    if($f->field == 'owner'){
                        array_push($where, ["PermanentUsers.username LIKE" => '%'.$f->value.'%']);
                    }else{
                        $col = $this->main_model.'.'.$f->field;
                        array_push($where, ["$col LIKE" => '%'.$f->value.'%']);
                    }
                }
                //Bools
                if($f->type == 'boolean'){
                     $col = $this->main_model.'.'.$f->field;
                     array_push($where, ["$col" => $f->value]);
                }
            }
        }
        //====== END REQUEST FILTER =====

        //====== AP FILTER =====
        //If the user is an AP; we need to add an extra clause to only show the LicensedDevices which he is allowed to see.
        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $tree_array = [];
            $user_id    = $user['id'];

            //**AP and upward in the tree**
            $this->parents = $this->Users->find('path', ['for' => $user_id, 'fields' => ['Users.id']]);
            //So we loop this results asking for the parent nodes who have available_to_siblings = true
            foreach($this->parents as $i){
                $i_id = $i->id;
                if($i_id != $user_id){ //upstream
                    array_push($tree_array, [$this->main_model.'.user_id' => $i_id,$this->main_model.'.available_to_siblings' => true]);
                }else{
                    array_push($tree_array, ['LicensedDevices.user_id' => $i_id]);
                }
            }
            //** ALL the AP's children
            $this->children = $this->Users->find_access_provider_children($user['id']);
            if($this->children){   //Only if the AP has any children...
                foreach($this->children as $i){
                    $id = $i['id'];
                    array_push($tree_array, [$this->main_model.'.user_id' => $id]);
                }       
            }       
            //Add it as an OR clause
            array_push($where, ['OR' => $tree_array]);
        }       
        //====== END AP FILTER =====      
        return $query->where($where);
    }

    private function _get_action_flags($owner_id,$user){
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            return ['update' => true, 'delete' => true];
        }

        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $user_id = $user['id'];

            //test for self
            if($owner_id == $user_id){
                return ['update' => true, 'delete' => true];
            }
            //Test for Parents
            foreach($this->parents as $i){
                if($i->id == $owner_id){
                    return ['update' => false, 'delete' => false];
                }
            }

            //Test for Children
            foreach($this->children as $i){
                if($i->id == $owner_id){
                    return ['update' => true, 'delete' => true];
                }
            }  
        }
    }

}
