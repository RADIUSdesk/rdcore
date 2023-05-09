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
       	
       	$mesh_ids	= [];
       	$ap_p_ids	= [];
       	
       	$meshes	= $this->{'Meshes'}->find()->where(['Meshes.cloud_id' => $cloud_id])->all();
       	foreach($meshes as $m){
       		array_push($mesh_ids, $m->id);
       	}
       	
       	$ap_profiles	= $this->{'ApProfiles'}->find()->where(['ApProfiles.cloud_id' => $cloud_id])->all();
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
            	if(($f->property == 'cloud_wide')&&($f->value == true)){
                 	array_push($where_clause,['MacActions.cloud_id' => $cloud_id]);
                }
                if(($f->property == 'cloud_wide')&&($f->value == false)){
                 	array_push($where_clause,['MacActions.cloud_id IS' => null]);
                }
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
     	   	
                
        $query->contain(['Meshes','ApProfiles','ClientMacs','FirewallProfiles']);
    
    
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
        	if($q->ap_profile_id){
        		$q->ap_profile_name = $q->ap_profile->name;
        	}
        	if($q->mesh_id){
        		$q->mesh_name = $q->mesh->name;
        	}
        	
        	$q_alias = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $q->mac])->first();
        	if($q_alias){
        		$q->alias = $q_alias->alias;
        	}
        	
        	if($q->action == 'limit'){
    			$bw_up_suffix = 'kbps';
    			$bw_up = ($q->bw_up * 8);
    			if($bw_up >= 1000){
    				$bw_up = $bw_up / 1000;
    				$bw_up_suffix = 'mbps';
    			}
    			$q->bw_up_suffix = $bw_up_suffix;
    			$q->bw_up = $bw_up;
    			
    			$bw_down_suffix = 'kbps';
    			$bw_down = ($q->bw_down * 8);
    			if($bw_down >= 1000){
    				$bw_down = $bw_down / 1000;
    				$bw_down_suffix = 'mbps';
    			}
    			$q->bw_down_suffix = $bw_down_suffix;
    			$q->bw_down = $bw_down;
    		}
    		
    		if($q->action == 'firewall'){
    		
    			$q->fw_profile = $q->firewall_profile->name;
    		
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
    
     public function add(){
    	//__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        /*
        	Mbps : Megabit per second (Mbit/s or Mb/s)
			kB/s : Kilobyte per second
			1 byte = 8 bits
			1 bit  = (1/8) bytes
			1 bit  = 0.125 bytes
			1 kilobyte = 10001 bytes
			1 megabit  = 10002 bits
			1 megabit  = (1000 / 8) kilobytes
			1 megabit  = 125 kilobytes
			1 megabit/second = 125 kilobytes/second
			1 Mbps = 125 kB/s
        */
        
        $add_data	= [];
        $req_d 		= $this->request->getData();
       	$cloud_id 	= $req_d['cloud_id'];   	
       	
       	if($req_d['scope'] == 'cloud_wide'){
   			$add_data['cloud_id']	= $cloud_id;
   		}
       	if(isset($req_d['ap_profile_id'])){      		
       		$add_data['ap_profile_id']	= $req_d['ap_profile_id'];
       	}       	     	
       	if(isset($req_d['mesh_id'])){
       		$add_data['mesh_id']	= $req_d['mesh_id'];      		
       	}
       	    	
       	$mac = str_replace('-', ':', $req_d['mac']);
       	$mac = strtoupper($mac);
       	
       	//Test the MAC Address
       	if($req_d['alias'] == ''){
        	$ad = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $mac,'MacAliases.cloud_id' => $cloud_id])->first();
        	if($ad){
        		$this->{'MacAliases'}->delete($ad);
        	}          	
       	}
       	     	
       	if($req_d['alias'] !== ''){
       		$alias = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $mac,'MacAliases.cloud_id' => $cloud_id])->first();
       		if($alias){
       			$alias->alias = $req_d['alias'];//Update it
       			$this->{'MacAliases'}->save($alias);
       		}else{
       			$a = $this->{'MacAliases'}->newEntity(['mac' => $mac,'cloud_id' => $cloud_id,'alias' => $req_d['alias']]);
       			$this->{'MacAliases'}->save($a);
       		}
       	}       	      	
       	      	
       	$e_mac = $this->{'ClientMacs'}->find()->where(['ClientMacs.mac' => $mac])->first();
		if(!$e_mac){			
			$e_mac = $this->{'ClientMacs'}->newEntity(['mac' => $mac]);
			$this->{'ClientMacs'}->save($e_mac);
		}       	
       	$add_data['client_mac_id'] = $e_mac->id;

  		$add_data['action'] = $req_d['action'];
       	
       	if($req_d['action'] == 'limit'){
       	      	
	   		$d_amount 	= $req_d['limit_download_amount'];
	   		$d_unit 	= $req_d['limit_download_unit'];
	   		if($d_unit == 'mbps'){
	   			$bw_down = ($d_amount * 1000) / 8;
	   		}
	   		if($d_unit == 'kbps'){
	   			$bw_down = $d_amount / 8;
	   		}
	   		$add_data['bw_down']	= $bw_down;
	   		
	   		//Upload
	   		$u_amount 	= $req_d['limit_upload_amount'];
	   		$u_unit 	= $req_d['limit_upload_unit'];
	   		if($u_unit == 'mbps'){
	   			$bw_up = ($u_amount * 1000) / 8;
	   		}
	   		if($u_unit == 'kbps'){
	   			$bw_up = $u_amount / 8;
	   		}
	   		$add_data['bw_up']	= $bw_up;
	   			   		
	   	}
	   	
	   	//Now we also have to check if it not already there ....
	   	
	   	$e_mac_action = $this->{'MacActions'}->find()->where(['MacActions.client_mac_id' => $e_mac->id,'MacActions.cloud_id' => $cloud_id])->first();
	   	if($e_mac_action){
	   		$this->JsonErrors->errorMessage('Cloud Wide Entry Already Present');
	   		return;
	   	}
	   	
	   	if(isset($req_d['ap_profile_id'])){
	   		$e_mac_action_ap_profile = $this->{'MacActions'}->find()->where(['MacActions.client_mac_id' => $e_mac->id,'MacActions.ap_profile_id' => $req_d['ap_profile_id']])->first();
	   		if($e_mac_action_ap_profile){
		   		$this->JsonErrors->errorMessage('AP Profile Entry Already Present');
		   		return;
		   	}
	   	}
	   	
	   	if(isset($req_d['mesh_id'])){
	   		$e_mac_action_mesh = $this->{'MacActions'}->find()->where(['MacActions.client_mac_id' => $e_mac->id,'MacActions.mesh_id' => $req_d['mesh_id']])->first();
	   		if($e_mac_action_mesh){
		   		$this->JsonErrors->errorMessage('Mesh Entry Already Present');
		   		return;
		   	}
	   	}
	   	
	   	//If we reached here we can add it 
	   	$e_ma = $this->{'MacActions'}->newEntity($add_data);
	   	$this->{'MacActions'}->save($e_ma);
	   	
	   	$this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
        	   		   	   
	}
	
	public function edit(){
    	//__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $req_d 		= $this->request->getData();        
        $id			= $req_d['id'];
        $cloud_id 	= $req_d['cloud_id'];
        $scope		= $req_d['scope'];
        
        $current_ent = $this->{'MacActions'}->find()->where(['MacActions.id' => $id])->first();
        if(!$current_ent){
        	$this->JsonErrors->errorMessage('Item Not Found');
		   	return;                     
        }
        
        $mac = str_replace('-', ':', $req_d['mac']);
       	$mac = strtoupper($mac);
        
        
        //Test the MAC Address
        if($req_d['alias'] == ''){
        	$a_delete = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $mac,'MacAliases.cloud_id' => $cloud_id])->first();
        	if($a_delete){
        		$this->{'MacAliases'}->delete($a_delete);
        	}          	
       	}
       	
       	if($req_d['alias'] !== ''){     	
       		$a_view = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $mac,'MacAliases.cloud_id' => $cloud_id])->first();
       		if($a_view){
       			$a_view->alias = $req_d['alias'];//Update it
       			$this->{'MacAliases'}->save($a_view);
       		}else{
       			$a_add = $this->{'MacAliases'}->newEntity(['mac' => $mac,'cloud_id' => $cloud_id,'alias' => $req_d['alias']]);
       			$this->{'MacAliases'}->save($a_add);
       		}
       	}
       	
       	//Update / change of MAC Address
       	$e_mac = $this->{'ClientMacs'}->find()->where(['ClientMacs.mac' => $mac])->first();
		if(!$e_mac){			
			$e_mac = $this->{'ClientMacs'}->newEntity(['mac' => $mac]);
			$this->{'ClientMacs'}->save($e_mac);
			$current_ent->client_mac_id = $e_mac->id;
			$this->{'MacActions'}->save($current_ent);	
		}else{
			if($e_mac->id !== $current_ent->client_mac_id){
				$current_ent->client_mac_id = $e_mac->id;
				$this->{'MacActions'}->save($current_ent);		
			}
		}       
       	           
        //If the orig one has cloud ID and the new one has mesh_id
        if(isset($req_d['mesh_id'])){
       		if($current_ent->cloud_id){
       			$current_ent->cloud_id = null;
       			$current_ent->ap_profile_id = null;
       			$current_ent->mesh_id =	$req_d['mesh_id'];
       			$this->{'MacActions'}->save($current_ent);		
       		}
       		if($current_ent->ap_profile_id){
       			$current_ent->ap_profile_id = null;
       			$current_ent->cloud_id = null;
       			$current_ent->mesh_id  = $req_d['mesh_id'];
       			$this->{'MacActions'}->save($current_ent);		
       		}      		
       	}
       	
       	//If the origin one has cloud ID and the new one has ap profile
       	if(isset($req_d['ap_profile_id'])){
       		if($current_ent->cloud_id){
       			$current_ent->cloud_id = null;
       			$current_ent->mesh_id = null;
       			$current_ent->ap_profile_id  =	$req_d['ap_profile_id'];
       			$this->{'MacActions'}->save($current_ent);		
       		}
       		if($current_ent->mesh_id){
       			$current_ent->mesh_id = null;
       			$current_ent->cloud_id = null;
       			$current_ent->ap_profile_id  =	$req_d['ap_profile_id'];
       			$this->{'MacActions'}->save($current_ent);		
       		}     		
       	}
       	
       	if($scope == 'cloud_wide'){
       		if($current_ent->mesh_id){
       			$current_ent->mesh_id = null;
       			$current_ent->cloud_id = $cloud_id;
       			$this->{'MacActions'}->save($current_ent);
       		}
       		if($current_ent->ap_profile_id){
       			$current_ent->ap_profile_id = null;
       			$current_ent->cloud_id = $cloud_id;
       			$this->{'MacActions'}->save($current_ent);
       		}   	
       	}
       	
       	if($req_d['action'] == 'limit'){ 
       	  	      	
	   		$d_amount 	= $req_d['limit_download_amount'];
	   		$d_unit 	= $req_d['limit_download_unit'];
	   		if($d_unit == 'mbps'){
	   			$bw_down = ($d_amount * 1000) / 8;
	   		}
	   		if($d_unit == 'kbps'){
	   			$bw_down = $d_amount / 8;
	   		}
	   		
	   		$u_amount 	= $req_d['limit_upload_amount'];
	   		$u_unit 	= $req_d['limit_upload_unit'];
	   		if($u_unit == 'mbps'){
	   			$bw_up = ($u_amount * 1000) / 8;
	   		}
	   		if($u_unit == 'kbps'){
	   			$bw_up = $u_amount / 8;
	   		}
		
	   		$current_ent->action = 'limit';
	   		$current_ent->bw_up = $bw_up;
	   		$current_ent->bw_down = $bw_down;
	   		$this->{'MacActions'}->save($current_ent);	   			   		
	   	}
	   	
	   	if($req_d['action'] == 'block'){
	   		$current_ent->action = 'block';
	   		$current_ent->bw_up = null;
	   		$current_ent->bw_down = null;
	   		$this->{'MacActions'}->save($current_ent);	   	
	   	}
	   	
	   	if($req_d['action'] == 'firewall'){
	   		$current_ent->action = 'firewall';
	   		$current_ent->firewall_profile_id = $req_d['firewall_profile_id'];
	   		$current_ent->bw_up = null;
	   		$current_ent->bw_down = null;
	   		$this->{'MacActions'}->save($current_ent);	   	
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
	           
            $entity     = $this->{$this->main_model}->find()->where(['MacActions.id' => $req_d['id']])->first();     
            $this->{$this->main_model}->delete($entity);
   
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
            	$entity =	$this->{$this->main_model}->find()->where(['MacActions.id' => $d['id']])->first();                 
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

        $menu = $this->GridButtonsFlat->returnButtons(false, 'basic'); 
        $this->set([
            'items' => $menu,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
}
