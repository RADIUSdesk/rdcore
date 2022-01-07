<?php

namespace App\Controller;

use Cake\Core\Configure;
use Cake\I18n\FrozenTime;

class DynamicClientStatesController extends AppController {

    public $main_model      = 'DynamicClientStates';
    public $base            = "Access Providers/Controllers/DynamicClientStates/";
    protected   $timezone   = 'UTC'; //Default for timezone

//------------------------------------------------------------------------

    public function initialize()
    {
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('Users');
        $this->loadModel('DynamicClients');
        $this->loadModel('Timezones');

        $this->loadComponent('Aa');
        $this->loadComponent('Formatter');
        $this->loadComponent('GridFilter');
    }

    //____ BASIC CRUD DynamicClientStates Manager ________
    public function index(){

        //Display a list of nas tags with their owners
        //This will be dispalyed to the Administrator as well as Access Providers who has righs

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $timezone   = $this->timezone;
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->_build_common_query($query, $user);

        if(null !== $this->request->getQuery('dynamic_client_id')){
        
            //Find the timezone
            $client_id  = $this->request->getQuery('dynamic_client_id');
            $ent_cl     = $this->{'DynamicClients'}->find()->where(['DynamicClients.id' => $client_id])->first();
            if($ent_cl){
                $tz_id = $ent_cl->timezone;
                $ent_tz = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
                if($ent_tz){
                    $timezone = $ent_tz->name;
                }
            }
        
            $query->where(["DynamicClientStates.dynamic_client_id" => $this->request->getQuery('dynamic_client_id')]);
        }
        
        if($this->request->getQuery('timezone_id')){   
            $ent_tz = $this->{'Timezones'}->find()->where(['Timezones.id' => $this->request->getQuery('timezone_id')])->first();
            if($ent_tz){
                $timezone = $ent_tz->name;
            } 
        }


        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        if(null !== $this->request->getQuery('limit')){
            $limit  = $this->request->getQuery('limit');
            $page   = $this->request->getQuery('page');
            $offset = $this->request->getQuery('start');
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();
        $q_r    = $query->all();

        $items  = [];
        
        foreach($q_r as $ent){  
            $state_time     = $this->Formatter->diff_in_time($ent->created,$ent->modified);
            $ago            = $ent->created->diffForHumans($ent->modified);
            $ago            = str_replace(" before","",$ago);
            $state_time     = $state_time .' (~'.$ago.')';
            array_push($items, [
                'id'        => $ent->id,
                'state'     => $ent->state,
                'time'      => $state_time,
                'created'   => $ent->created->setTimezone($timezone),
                'modified'  => $ent->modified->setTimezone($timezone)
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

    //FIXME check rights
    public function delete($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id    = $user['id'];
        $fail_flag = false;

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->data['id'];
            $entity = $this->{$this->main_model}->find()->where(['DynamicClientStates.id' => $this->request->data['id']])->first();
            $this->{$this->main_model}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity = $this->{$this->main_model}->find()->where(['DynamicClientStates.id' => $d['id']])->first(); 
                $this->{$this->main_model}->delete($entity);
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

    //----- Menus ------------------------
    public function menuForGrid(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $timezone_id    = 316; //London by default  
        $e_user         = $this->{'Users'}->find()->where(['Users.id' => $user['id']])->first();
        if($e_user->timezone_id){
            $timezone_id = $e_user->timezone_id;
        } 

        //Empty by default
        $menu = [];

        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin

            $menu = [
                ['xtype' => 'buttongroup','title' => null, 'items' => [
                    ['xtype' => 'button', 'glyph'     => Configure::read('icnReload'), 'scale' => 'large', 'itemId' => 'reload',   'tooltip'=> __('Reload'),'ui'=> 'button-orange'],
                    ['xtype' => 'button', 'glyph'     => Configure::read('icnDelete'), 'scale' => 'large', 'itemId' => 'delete',   'tooltip'=> __('Delete'),'ui'=> 'button-red'],
                    [
                        'xtype'         => 'cmbTimezones', 
                        'name'          => 'timezone_id',
                        'labelClsExtra' => 'lblRdReq',
                        'labelWidth'    => 75,
                        'width'         => 300,
                        'margin'        => '5 0 0 5',
                        'value'         => $timezone_id
                    ],
                ]]
                
            ];
        }

        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $action_group   = [];
            $document_group = [];
            $specific_group = [];

            array_push($action_group, [
                'xtype'     => 'button',
                'glyph'     => Configure::read('icnReload'),   
                'scale'     => 'large', 
                'itemId'    => 'reload',
                'ui'        => 'button-orange',   
                'tooltip'   => __('Reload')]);

            //Delete
            if($this->Acl->check(['model' => 'Users', 'foreign_key' => $id], $this->base.'delete')){
                array_push($action_group, [
                    'xtype'     => 'button', 
                    'glyph'     => Configure::read('icnDelete'),   
                    'scale'     => 'large', 
                    'itemId'    => 'delete',
                    'disabled'  => true,
                    'ui'        => 'button-red',   
                    'tooltip'   => __('Delete')]);
            }
            
            array_push($action_group, [
                'xtype'         => 'cmbTimezones', 
                'name'          => 'timezone_id',
                'labelClsExtra' => 'lblRdReq',
                'labelWidth'    => 75,
                'width'         => 300,
                'margin'        => '5 0 0 5',
                'value'         => $timezone_id 
            ]);

            $menu = [
                        ['xtype' => 'buttongroup','title' => null,        'items' => $action_group]
                   ];
        }
        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }

  

    private function _is_sibling_of($parent_id,$user_id){
        $q_r        = $this->Users->find('path', ['for' => $user_id]);
        foreach($q_r as $i){
            $id = $i->id;
            if($id == $parent_id){
                return true;
            }
        }
        //No match
        return false;
    }

    function _build_common_query($query, $user){

        $where = [];

        //What should we include..
        $query->contain(['DynamicClients']);

        //===== SORT =====
        //Default values for sort and dir
        $sort   = 'DynamicClientStates.created';
        $dir    = 'DESC';
        $s      = [$sort => $dir];   
        if(isset($this->request->query['sort'])){
            $s = []; 
            $sort_array = json_decode($this->request->query['sort']);
            foreach($sort_array as $sort_item){
                $s[$this->main_model.'.'.$sort_item->property] = $sort_item->direction;
            }
        }    
        $query->order($s);
        //==== END SORT ===


        //====== REQUEST FILTER =====
        if(null !== $this->request->getQuery('filter')){
            $filter = json_decode($this->request->getQuery('filter'));
            foreach($filter as $f){

                $f = $this->GridFilter->xformFilter($f);

                //Strings
                if($f->type == 'string'){
                    $col = $this->main_model.'.'.$f->field;
                    array_push($where, ["$col LIKE" => '%'.$f->value.'%']);
                }
                //Bools
                if($f->type == 'boolean'){
                     $col = $this->main_model.'.'.$f->field;
                     array_push($where, ["$col" => $f->value]);
                }
            }
        }
        //====== END REQUEST FILTER =====
//FIXME Is this needed?
/*
        //====== AP FILTER =====
        //If the user is an AP; we need to add an extra clause to only show the NaStates which he is allowed to see.
        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $tree_array = array();
            $user_id    = $user['id'];

            //**AP and upward in the tree**
            $this->parents = $this->User->getPath($user_id,'User.id');
            //So we loop this results asking for the parent nodes who have available_to_siblings = true
            foreach($this->parents as $i){
                $i_id = $i['User']['id'];
                if($i_id != $user_id){ //upstream
                    array_push($tree_array,array('Na.user_id' => $i_id,'Na.available_to_siblings' => true));
                }else{
                    array_push($tree_array,array('Na.user_id' => $i_id));
                }
            }
            //** ALL the AP's children
            $ap_children    = $this->User->find_access_provider_children($user['id']);
            if($ap_children){   //Only if the AP has any children...
                foreach($ap_children as $i){
                    $id = $i['id'];
                    array_push($tree_array,array($this->main_model.'.user_id' => $id));
                }       
            }   
            //Add it as an OR clause
            print_r($tree_array);
            array_push($c['conditions'],array('OR' => $tree_array));  
        } 
*/      
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
