<?php

//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 27-JUL-2022
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\ORM\TableRegistry;

class CommonQueryFlatComponent extends Component {
 
    public $components 	= ['JsonErrors'];

    public $sort_by   	= 'name';
    
    public function initialize(array $config):void{       
        //if($this->config('sort_by')){
       //     $this->sort_by = $this->config('sort_by');
       // }
    }
    
    public function get_filter_conditions(){
        return $this->_common_filter();
    }
    
    public function get_clouds_for_user($query){
    
    
    }
    
    public function build_simple_cloud_query($query,$user){   
    	$user_id = $user['id'];  	
    	//---Access Providers- Special where clause--
    	if($user['group_name'] == Configure::read('group.ap')){    		      		
			$clouds_OR_list		= [['Clouds.user_id' => $user_id]]; //This is the basic search item
			$ca   = TableRegistry::get('CloudAdmins');
			$q_ca = $ca->find()->where(['CloudAdmins.user_id'=>$user_id])->all();//The access provider (ap) might also be admin to other clouds
			foreach($q_ca as $e_ca){
				array_push($clouds_OR_list,['Clouds.id' => $e_ca->cloud_id]);
			}      	
			$query->where(['OR' => $clouds_OR_list]);
    	}
    	//---END--- 
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
        
        $query->where($where_clause);   
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

}

