<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 17/FEB/2023
 * Time: 00:00
 */

namespace App\Controller;


class BansController extends AppController {


	protected $main_model   = 'MacActions';
	
    public function initialize():void{
        parent::initialize();
        $this->loadModel('MacActions');
        $this->loadModel('Meshes');
        $this->loadModel('ApProfiles');
        $this->loadModel('MacAliases');
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('TimeCalculations');  
        
    }
       
    public function index(){
    
    	//__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_q    	= $this->request->getQuery();      
       	$cloud_id 	= $req_q['cloud_id'];
       	
       	$mesh_ids	= [];
       	$ap_p_ids	= [];
       	
       	$meshes	= $this->{'Meshes'}->find()->where(['Meshes.cloud_id' => $cloud_id])->all();
       	foreach($meshes as $m){
       		array_push($mesh_ids, $m->id);
       	}
       	
       	$ap_profiles	= $this->{'Meshes'}->find()->where(['Meshes.cloud_id' => $cloud_id])->all();
       	foreach($ap_profiles as $a){
       		array_push($ap_p_ids, $a->id);
       	}
                
        $query 		= $this->{$this->main_model}->find();
        
        $where_clause	= [ 'OR' => [
    		['mesh_id IN' 			=> $mesh_ids],
    		['ap_profile_id IN' 	=> $ap_p_ids],
    		['MacActions.cloud_id'	=> $cloud_id],      		
    	]];
    	       
     	if(isset($req_q['filter'])){
     		$filter = json_decode($req_q['filter']);
     		foreach($filter as $f){
     			if($f->property == 'mac'){
     				array_push($where_clause,["ClientMacs.mac LIKE" => '%'.$f->value.'%']);     			
     			} 
     			if($f->property == 'mesh_name'){
     				array_push($where_clause,["Meshes.name LIKE" => '%'.$f->value.'%']);     			
     			}
     			if($f->property == 'ap_profile_name'){
     				array_push($where_clause,["ApProfiles.name LIKE" => '%'.$f->value.'%']);     			
     			}    		
     		}
     		
     		//Bools
            if($f->operator == '=='){
                 array_push($where_clause,['MacActions.cloud_id' => $cloud_id]);
            }
            
            if(($f->operator == 'gt')||($f->operator == 'lt')||($f->operator == 'eq')){
                //date we want it in "2018-03-12"
                $col = 'MacActions'.'.'.$f->property;
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
     	$query->where($where_clause);
     	
     	$sort = 'ClientMacs.mac';
     	$dir  = 'ASC';
     	
     	if(isset($req_q['sort'])){
     		$dir    = 'ASC';
    
            if($req_q['sort'] == 'mac'){
                $sort = 'ClientMacs.mac';
            }elseif($req_q['sort'] == 'mesh_name'){
                $sort = 'Meshes.name';
            }elseif($req_q['sort'] == 'ap_profile_name'){
                $sort = 'ApProfiles.name';
            }else{
            	$sort = 'MacActions'.'.'.$req_q['sort'];
            }                          
            $dir  = isset($req_q['dir']) ? $req_q['dir'] : $dir;
        }
        $query->order([$sort => $dir]); 
     	   	
                
        $query->contain(['Meshes','ApProfiles','ClientMacs']);
    
    
    	//===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (null !== $this->request->getQuery('limit')) {
            $limit = $this->request->getQuery('limit');
            $page = $this->request->getQuery('page');
            $offset = $this->request->getQuery('start');
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();
        $q_r    = $query->all();
        $items  = [];
        
        foreach($q_r as $q){
        
        	$q->mac			= $q->client_mac->mac;
        	$q->cloud_wide 	= true;
        	if($q->cloud_id == null){
        		$q->cloud_wide = false;
        	}
        	if($q->ap_profile_idl){
        		$q->ap_profile_name = $q->ap_profile->name;
        	}
        	if($q->mesh_id){
        		$q->mesh_name = $q->mesh->name;
        	}
        	
        	$q_alias = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $q->mac])->first();
        	if($q_alias){
        		$q->alias = $q_alias->alias;
        	}
        	
        	$q->created_in_words  = $this->TimeCalculations->time_elapsed_string($q->{"created"});
        	$q->modified_in_words = $this->TimeCalculations->time_elapsed_string($q->{"modified"});
        	
        	array_push($items,$q);
        
        }
         	
      	$this->set([
            'items' 	=> $items,
            'success' 	=> true,
            'totalCount' => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
     public function menuForGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){   
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'basic'); 
        $this->set([
            'items' => $menu,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
}
