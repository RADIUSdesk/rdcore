<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 06/MAR/2023
 * Time: 00:00
 */

namespace App\Controller;


class DynamicClientMacsController extends AppController {


	protected $main_model   = 'DynamicClientMacs';
	
    public function initialize():void{
        parent::initialize();
        $this->loadModel('DynamicClientMacs');
        $this->loadModel('DynamicClients');
        $this->loadModel('MacAliases');
        $this->loadModel('ClientMacs');
        $this->loadModel('MacAliases');
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('JsonErrors');      
    }
       
    public function index(){
    
    	//__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_q    	= $this->request->getQuery();      
       	$cloud_id 	= $req_q['cloud_id'];
       	
       	$dynamic_client_ids	= [];

       	
       	$dynamic_clients	= $this->{'DynamicClients'}->find()->where(['DynamicClients.cloud_id' => $cloud_id])->all();
       	foreach($dynamic_clients as $dc){
       		array_push($dynamic_client_ids, $dc->id);
       	}
       	       
        $query 		= $this->{'DynamicClientMacs'}->find();
        
        if(count($dynamic_client_ids) == 0){
        	$this->set([
		        'items' 	=> [],
		        'success' 	=> true,
		        'totalCount' => 0
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);
		   	return;
        
        }
        
        $where_clause	= [ 'OR' => [
    		['dynamic_client_id IN' 			=> $dynamic_client_ids] 		
    	]];
    	       
     	if(isset($req_q['filter'])){
     		$filter = json_decode($req_q['filter']);
     		foreach($filter as $f){
     			if($f->property == 'mac'){
     				array_push($where_clause,["ClientMacs.mac LIKE" => '%'.$f->value.'%']);     			
     			} 
     			if($f->property == 'dynamic_client_name'){
     				array_push($where_clause,["DynamicClients.name LIKE" => '%'.$f->value.'%']);     			
     			}
     			if($f->property == 'nasidentifier'){
     				array_push($where_clause,["DynamicClients.nasidentifier LIKE" => '%'.$f->value.'%']);     			
     			}    		
     		}
     		
            
            if(($f->operator == 'gt')||($f->operator == 'lt')||($f->operator == 'eq')){
                //date we want it in "2018-03-12"
                $col = 'DynamicClientMacs'.'.'.$f->property;
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
     	   	              
        $query->contain(['DynamicClients','ClientMacs']);
    
    
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
        
        $vendor_file        = APP."StaticData".DS."mac_lookup.txt";
        $this->vendor_list  = file($vendor_file);
        
        foreach($q_r as $q){
        
        	$q->mac			= $q->client_mac->mac;
        	$q->vendor		= $this->_lookup_vendor($q->mac);	
        	$q_alias = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $q->mac])->first();
        	if($q_alias){
        		$q->alias = $q_alias->alias;
        	}
        	
        	if($q->dynamic_client){
        		$q->dynamic_client_name = $q->dynamic_client->name;
        		$q->nasidentifier		= $q->dynamic_client->nasidentifier;
        	}
        	$q->alias		= $this->_find_alias($q->mac);
        	
        	unset($q->dynamic_client);
        		
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
    
     public function attach(){
    	//__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
           	
	   	$this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);    	   		   	   
	}
		
	public function delete() {
   	
   		$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
   	
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		$req_d  = $this->request->getData();
	    if(isset($req_d['id'])){   //Single item delete
	           
            $entity     = $this->{$this->main_model}->find()->where(['DynamicClientMacs.id' => $req_d['id']])->first();     
            $this->{$this->main_model}->delete($entity);
   
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
            	$entity =	$this->{$this->main_model}->find()->where(['DynamicClientMacs.id' => $d['id']])->first();                
              	$this->{$this->main_model}->delete($entity);
            }
        }
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
       
     public function menuForGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if(!$user){   
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'DynamicClientMacs'); 
        $this->set([
            'items' => $menu,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    private function _lookup_vendor($mac){
        //Convert the MAC to be in the same format as the file
        $mac    = strtoupper($mac);
        $pieces = explode("-", $mac);

        $big_match      = $pieces[0].":".$pieces[1].":".$pieces[2].":".$pieces[3].":".$pieces[4];
        $small_match    = $pieces[0].":".$pieces[1].":".$pieces[2];
        $lines          = $this->vendor_list;

        $big_match_found = false;
        foreach ($lines as $i) {
            if (preg_match("/^$big_match/", $i)) {
                $big_match_found = true;
                //Transform this line
                $vendor = preg_replace("/$big_match\s?/", "", $i);
                $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                $vendor = rtrim($vendor);
                return $vendor;
            }
        }
       
        if (!$big_match_found) {
            foreach ($lines as $i) {
                if (preg_match("/^$small_match/", $i)) {
                    //Transform this line
                    $vendor = preg_replace("/$small_match\s?/", "", $i);
                    $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                    $vendor = rtrim($vendor);
                    return $vendor;
                }
            }
        }
        $vendor = "Unkown";
    }
    
    private function _find_alias($mac){
    
    	$req_q    = $this->request->getQuery();    
       	$cloud_id = $req_q['cloud_id'];
      
        $alias = '';
        $qr = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $mac,'MacAliases.cloud_id'=> $cloud_id])->first();
        if($qr){
        	$alias = $qr->alias;
        } 
        return $alias;
    }

}
