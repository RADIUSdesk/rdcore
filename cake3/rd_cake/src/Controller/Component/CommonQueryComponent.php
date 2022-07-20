<?php

//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 31-12-2016
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\ORM\TableRegistry;

class CommonQueryComponent extends Component {
 
    public $components              = ['RealmAcl','JsonErrors'];
    
    //Some default configs
    public $available_to_siblings   = true; //Default is true
    public $sort_by                 = 'name';
    
    public function initialize(array $config){
    
        if($this->config('no_available_to_siblings')){
            $this->available_to_siblings = false;
        }
        
//        if($this->config('sort_by')){
//            $this->sort_by = $this->config('sort_by');
//        }
    }
    
    public function get_meta_data_query($query,$user,$condition = []){
    
        $where_clause = $this->_common_filter();
        array_push($where_clause, $condition);
        
        if($this->available_to_siblings == true){
            $this->_ap_filter_for_available_to_siblings($query,$user,$where_clause);
        }else{
            $this->_ap_filter_for_no_siblings($query,$user,$where_clause);
        }     
    }
    
    public function get_filter_conditions(){
        return $this->_common_filter();
    }
    
    public function build_cloud_query($query,$cloud_id,$contain_array = ['Users'], $model = null, $allowOverride = true, $sort = null){
    
    	$query->where(['cloud_id' => $cloud_id]);
    	$query->contain($contain_array);

        if(!is_null($sort)){
            $this->sort_by = $sort;
        }

        if(is_null($model)){
            $this->_common_sort($query, $this->sort_by, null, $allowOverride);
        } else {
            $this->_common_sort($query, $this->sort_by, $model, $allowOverride);
        }

        $where_clause = $this->_common_filter($model);   
    }

    public function build_common_query($query,$user,$contain_array = ['Users'], $model = null, $allowOverride = true, $sort = null){
        $query->contain($contain_array);

        if(!is_null($sort)){
            $this->sort_by = $sort;
        }

        if(is_null($model)){
            $this->_common_sort($query, $this->sort_by, null, $allowOverride);
        } else {
            $this->_common_sort($query, $this->sort_by, $model, $allowOverride);
        }

        $where_clause = $this->_common_filter($model);

        $model = $this->config('model'); // Just a quick Hack

        if($this->available_to_siblings == true){
            $this->_ap_filter_for_available_to_siblings($query,$user,$where_clause, $model);
        }else{
            $this->_ap_filter_for_no_siblings($query,$user,$where_clause, $model);
        }
    }

    public function build_ap_query($query,$user){
        $contain_array   = [
            'Groups'        
        ];
        $query->contain($contain_array);
        $this->_common_sort($query,'username');
        $where_clause = $this->_common_filter();
        $this->_ap_filter_for_aps($query,$user,$where_clause);
    }

    public function build_with_realm_query($query,$user,$contain_array = ['Users'],$order_column='username',$add_model = ''){ 
    
        $query->contain($contain_array);
        $this->_common_sort($query,$this->sort_by);
        $where_clause = $this->_common_filter();
        
        if($user['group_name'] == Configure::read('group.ap')){ //Admin - return true    
            $realms = $this->RealmAcl->realm_list_for_ap($user['id'],'read',$add_model);
            if(!$realms){
                $this->JsonErrors->errorMessage('Access Provider Not Assigned to any Realms - Please Check');
                return false;
            }else{
                array_push($where_clause,array('OR' => $realms));
            }  
        }  
        $query->where($where_clause);
        return true;
    }
    
    public function build_node_lists_query($query,$user,$contain_array = ['Users'], $model = null, $allowOverride = true, $sort = null){
    
        $query->contain($contain_array);

        if(!is_null($sort)){
            $this->sort_by = $sort;
        }

        if(is_null($model)){
            $this->_common_sort($query, $this->sort_by, null, $allowOverride);
        } else {
            $this->_common_sort($query, $this->sort_by, $model, $allowOverride);
        }

        $where_clause = $this->_common_filter($model);
        $model = $this->config('model'); // Just a quick Hack 
        $this->_ap_filter_for_available_to_siblings($query,$user,$where_clause, 'Meshes');
        return true;
    }
    
    public function build_ap_lists_query($query,$user,$contain_array = ['Users'], $model = null, $allowOverride = true, $sort = null){
    
        $query->contain($contain_array);

        if(!is_null($sort)){
            $this->sort_by = $sort;
        }

        if(is_null($model)){
            $this->_common_sort($query, $this->sort_by, null, $allowOverride);
        } else {
            $this->_common_sort($query, $this->sort_by, $model, $allowOverride);
        }

        $where_clause = $this->_common_filter($model);
        $model = $this->config('model'); // Just a quick Hack 
        $this->_ap_filter_for_available_to_siblings($query,$user,$where_clause, 'ApProfiles');
        return true;
    }
 
 
    private function _common_sort($query, $default_column = 'name', $model = null, $allowSortOverride =  true){

        //Defaults
        $model  = is_null($model) ? $this->config('model') : $model;
        $sort   = $model.'.'.$default_column;
        $dir    = 'ASC';

        //This is to owerride the default sort order
        if($this->config('sort_by') && $allowSortOverride == true){
            $sort = $this->config('sort_by');
        }

        if(isset($this->request->query['sort'])){
            if($this->request->query['sort'] == 'owner'){
                $sort = 'Users.username';
            }elseif(
                ($this->request->query['sort'] == 'nodes_down')||
                ($this->request->query['sort'] == 'nodes_up')
            ){
                $sort = $model.'.last_contact';
            }else{
                $sort = $model.'.'.$this->request->query['sort'];
            }
            
            //Special case for IP Address
            if($this->request->query['sort'] == 'static_ip'){
                $sort = 'INET_ATON(static_ip)';
            }
            
            //Special case for Meshes
            if($this->request->query['sort'] == 'mesh'){
                $sort = 'Meshes.name';
            }
            
            //Special case for Ap Profiles
            if($this->request->query['sort'] == 'ap_profile'){
                $sort = 'ApProfiles.name';
            }
            
            $dir  = isset($this->request->query['dir']) ? $this->request->query['dir'] : $dir;
        }
        $query->order([$sort => $dir]); 
    }

    private function _common_filter($model = null){

        $where_clause   = [];
        $model          = is_null($model) ? $this->config('model') : $model;

        if(isset($this->request->query['filter'])){
            $filter = json_decode($this->request->query['filter']); 
            
            foreach($filter as $f){ 
            
                //Strings (like)
                if($f->operator == 'like'){
                    if($f->property == 'owner'){
                        if($this->config('model') == 'Users'){ //For Access Providers
                            array_push($where_clause,array("Owners.username LIKE" => '%'.$f->value.'%'));  
                        }else{
                            array_push($where_clause,array("Users.username LIKE" => '%'.$f->value.'%'));
                        }   
                    }elseif($f->property == 'permanent_user'){ //For Devices                       
                        array_push($where_clause,array("PermanentUsers.username LIKE" => '%'.$f->value.'%'));
                        
                    }elseif($f->property == 'mesh'){ //For Meshes                      
                        array_push($where_clause,array("Meshes.name LIKE" => '%'.$f->value.'%'));
                    }elseif($f->property == 'ap_profile'){ //For ApProfiles                      
                        array_push($where_clause,array("ApProfiles.name LIKE" => '%'.$f->value.'%'));
                    }else{
                    
                        $col = $model.'.'.$f->property;
                        array_push($where_clause,array("$col LIKE" => '%'.$f->value.'%'));
                    }
                }
                
                //Bools
                if($f->operator == '=='){
                     $col = $model.'.'.$f->property;
                     array_push($where_clause,array("$col" => $f->value));
                }
                
                if($f->operator == 'in'){
                    $list_array = array();
                    foreach($f->value as $filter_list){
                        $col = $model.'.'.$f->property;
                        array_push($list_array,array("$col" => "$filter_list"));
                    }
                    array_push($where_clause,array('OR' => $list_array));
                }
                
                if(($f->operator == 'gt')||($f->operator == 'lt')||($f->operator == 'eq')){
                    //date we want it in "2018-03-12"
                    $col = $model.'.'.$f->property;
                    $date_array = ['created', 'modified'];
                    if(in_array($f->property,$date_array)){
                        if($f->operator == 'eq'){
                            array_push($where_clause,array("DATE($col)" => $f->value));
                        }

                        if($f->operator == 'lt'){
                            array_push($where_clause,array("DATE($col) <" => $f->value));
                        }
                        if($f->operator == 'gt'){
                            array_push($where_clause,array("DATE($col) >" => $f->value));
                        }
                    }else{
                        if($f->operator == 'eq'){
                            array_push($where_clause,array("$col" => $f->value));
                        }

                        if($f->operator == 'lt'){
                            array_push($where_clause,array("$col <" => $f->value));
                        }
                        if($f->operator == 'gt'){
                            array_push($where_clause,array("$col >" => $f->value));
                        }
                    }
                }
            }
        }
        
        if(isset($this->request->query['tree_tag_id'])){
            $tree_tag_id = $this->request->query['tree_tag_id'];
            //$tree_tag_id = 269;
            if($tree_tag_id !== '0'){ //The root value (0)we simply ignore = no filter

                //See which level we are at
                $tree_tags = TableRegistry::get('TreeTags');

                $children  = $tree_tags->find('children', ['for' => $tree_tag_id]);
                $tree_tag_clause = [];
                foreach($children as $i){
                    array_push($tree_tag_clause,array('Meshes.tree_tag_id' => $i->id));
                }
               
                if(count($tree_tag_clause) > 0){      
                    array_push($where_clause,array('OR' => $tree_tag_clause));  
                }else{
                    array_push($where_clause,['Meshes.tree_tag_id' => $tree_tag_id]);  
                }
                
            }
        }
        
        //=== Combo Filter if present ====
        if(isset($this->request->query['query'])){
            $query = $this->request->query['query'];
            if($query !== '[null]'){
                if($model == 'PermanentUsers'){
                    array_push($where_clause,[$model.".username LIKE" => '%'.$query.'%']);
                }else{
                    array_push($where_clause,[$model.".name LIKE" => '%'.$query.'%']);
                }
            } 
        } 
        //================================
        
        return $where_clause;
    }

    private function _ap_filter_for_aps($query,$user,$where_clause){

        $model   = $this->config('model');
        //== ONLY Access Providers ==
        $ap_name = Configure::read('group.ap');
        array_push($where_clause,array('Groups.name' => $ap_name ));
        
        //If the user is an AP; we need to add an extra clause to only show all the AP's downward from its position in the tree
        if($user['group_name'] == Configure::read('group.ap')){  //AP 
        
            $user_id    = $user['id'];
            $users      = TableRegistry::get('Users')->find();  
            $children   = $users->find('children', ['for' => $user_id]);
            
            $ap_clause      = array();
            foreach($children as $i){
                array_push($ap_clause,array($model.'.parent_id' => $i->parent_id));
            }
               
            if(count($ap_clause) > 0){      
                array_push($where_clause,array('OR' => $ap_clause));  
            }
        }      

        $query->where($where_clause);
    }

    private function _ap_filter_for_available_to_siblings($query,$user,$where_clause, $model = null){
        $model   = is_null($model) ? $this->config('model') : $model;
         if($user['group_name'] == Configure::read('group.ap')){  //AP
            $tree_array = array();
            $user_id    = $user['id'];

            //**AP and upward in the tree**
            $users         = TableRegistry::get('Users');
            $this->parents = $users->find('path',['for' => $user_id]);
 
            //So we loop this results asking for the parent nodes who have available_to_siblings = true
            foreach($this->parents as $i){
                $i_id = $i->id;
                if($i_id != $user_id){ //upstream
                    array_push($tree_array,array($model.'.'.'user_id' => $i_id,$model.'.'.'available_to_siblings' => true));
                }else{
                    array_push($tree_array,array($model.'.'.'user_id' => $i_id)); //That is the access provider self
                }
            }
                 
            //** ALL the AP's children
            $children = $users->find('children', ['for' => $user_id]);
            if($children){   //Only if the AP has any children...
                foreach($children as $i){
                    $id = $i->id;
                    array_push($tree_array,array($model.'.'.'user_id' => $id));
                }       
            }      
            //Add it as an OR clause
            if(count($tree_array) > 0){
                array_push($where_clause,array('OR' => $tree_array));
            }  
        }
        $query->where($where_clause);
    }
    
    private function _ap_filter_for_no_siblings($query,$user,$where_clause, $model = null){
         $model   = is_null($model) ? $this->config('model') : $model;
         if($user['group_name'] == Configure::read('group.ap')){  //AP
            $tree_array = array();
            $user_id    = $user['id'];
            
            array_push($tree_array,array($model.'.'.'user_id' => $user_id)); //That is the access provider self
                
            //** ALL the AP's children
            $users    = TableRegistry::get('Users');
            $children = $users->find('children', ['for' => $user_id]);
            if($children){   //Only if the AP has any children...
                foreach($children as $i){
                    $id = $i->id;
                    array_push($tree_array,array($model.'.'.'user_id' => $id));
                }       
            }      
            //Add it as an OR clause
            if(count($tree_array) > 0){
                array_push($where_clause,array('OR' => $tree_array));
            }  
        }
        $query->where($where_clause);
    }

}

