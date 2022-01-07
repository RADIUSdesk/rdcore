<?php

namespace App\Controller;
use App\Controller\AppController;

class TopUpTransactionsController extends AppController{
  
    public $base         = "Access Providers/Controllers/TopUpTransactions/";   
    protected $owner_tree   = array();
    protected $main_model   = 'TopUpTransactions';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('TopUpTransactions'); 
        $this->loadModel('Users');
          
        $this->loadComponent('Aa');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model'                     => 'TopUpTransactions',
            'no_available_to_siblings'  => true,
            'sort_by'                   => 'PermanentUsers.username'
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
                
        $query = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query,$user,['PermanentUsers','Users']);
 
        $limit  = 50;
        $page   = 1;
        $offset = 0;
        if(isset($this->request->query['limit'])){
            $limit  = $this->request->query['limit'];
            $page   = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = array();

        foreach($q_r as $i){
              
            $owner_id   = $i->user_id;
            if(!array_key_exists($owner_id,$this->owner_tree)){
                $owner_tree     = $this->Users->find_parents($owner_id);
            }else{
                $owner_tree = $this->owner_tree[$owner_id];
            }
                
            $row        = array();
            $fields    = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
            } 
            
            $row['user']	        = $i->user->username;
            if($i->real_permanent_user == null){
                $row['permanent_user']	= "!! USER DELETED !!"; 
            }else{
                $row['permanent_user']	= $i->real_permanent_user->username;
            }
              
            $row['owner']           = $owner_tree;
		
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
