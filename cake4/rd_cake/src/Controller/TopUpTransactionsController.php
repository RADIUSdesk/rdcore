<?php

namespace App\Controller;
use App\Controller\AppController;

class TopUpTransactionsController extends AppController{
  
    public $base         = "Access Providers/Controllers/TopUpTransactions/";   
    protected $owner_tree   = array();
    protected $main_model   = 'TopUpTransactions';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('TopUpTransactions'); 
        $this->loadModel('Users');
          
        $this->loadComponent('Aa');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'                     => 'TopUpTransactions',
            'no_available_to_siblings'  => true,
            'sort_by'                   => 'TopUpTransactions.permanent_user'
        ]); 
             
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');       
    }
      
    public function index(){
    
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_q    = $this->request->getQuery(); //q_data is the query data
        $cloud_id = $req_q['cloud_id'];   
                
        $query = $this->{$this->main_model}->find();

        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['TopUps','PermanentUsers']);//build_common_query($query,$user,['PermanentUsers','Users']);
 
        $limit  = 50;
        $page   = 1;
        $offset = 0;
        if(isset($req_q['limit'])){
            $limit  = $req_q['limit'];
            $page   = $req_q['page'];
            $offset = $req_q['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){
                         
            $row       = [];
            $fields    = $this->{$this->main_model}->getSchema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
            } 
            
            if($i->real_permanent_user == null){
                $row['permanent_user']	= "!! USER DELETED !!"; 
            }else{
                $row['permanent_user']	= $i->real_permanent_user->username;
            }	
            array_push($items,$row);      
        }
       
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => array('items','success','totalCount')
        ));
    }
}
