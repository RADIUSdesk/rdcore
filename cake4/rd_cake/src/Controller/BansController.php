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
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat'); 
        
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
        
        $query->where([ 'OR' => [
        		['mesh_id IN' 			=> $mesh_ids],
        		['ap_profile_id IN' 	=> $ap_p_ids],
        		['MacActions.cloud_id'	=> $cloud_id],      		
        	],
        	['MacActions.cloud_id'		=> $cloud_id]
        	//['ClientMacs.mac'		=> '22:65:25:E1:57:4A'] Here we add the filter ...
        ]);
        
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
        
        
        }
      
    	
      	$this->set([
            'items' => $q_r,
            'success' => true,
            'totalCount' => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    } 
}
