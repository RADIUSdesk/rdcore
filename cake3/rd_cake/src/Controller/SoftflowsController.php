<?php

namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class SoftflowsController extends AppController{
  
    protected $main_model   = 'Softflows';
    protected $check_items  = ['email_enabled','email_ssl'];
    
    public function initialize(){  
        parent::initialize();
        $this->loadModel('DynamicClients');
        $this->loadModel('Devices');
        $this->loadModel($this->main_model);
        $this->loadComponent('Aa');
    }
       
    public function report(){   
        $data =  $this->request->getData();
        //$data = json_decode($this->sample,true); 
        //$data = $data['data'];
        if(array_key_exists('nasid',$data)){    
            $dc = $this->DynamicClients->find()->where(['DynamicClients.nasidentifier' => $data['nasid']])->first();
            if($dc){
                $dynamic_client_id = $dc->id;
                foreach($data['flows'] as $flow){
                    if($flow["username"] !== '-'){
                        if(preg_match('/([a-fA-F0-9]{2}[:|\-]?){6}/', $flow["username"])){ //IF IT WAS MAC AUTH WE DO A LOOKUP (USERNAME = MAC)
                            $q_d = $this->{'Devices'}->find()->where(['Devices.name' => $flow["username"]])->contain(['PermanentUsers'])->first();
                            if($q_d){
                                if($q_d->permanent_user){
                                    $flow["username"] = $q_d->permanent_user->username; 
                                }                            
                            } 
                        }                    
                        $flow['dynamic_client_id'] = $dynamic_client_id;
                        unset($flow['id']);
                        if(($flow['pckt_out'] !== '0')&&($flow['pckt_in'] !== '0')){
                            $entity = $this->{$this->main_model}->newEntity($flow);
                            $this->{$this->main_model}->save($entity);
                        }                 
                    }              
                }
            }       
        }
        
        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['success','data']
        ]); 
    }
    
    
    public function index(){
    
        $items  = []; 
        $cquery = $this->request->getQuery();
        if(!array_key_exists('dynamic_client_id',$cquery)){
            $this->set([
                'items'         => $items,
                'success'       => true,
                '_serialize'    => ['success','items']
            ]);   
            return; //return empty set
        }
                
        $dc_id      = $cquery['dynamic_client_id'];
        $where      = $this->_common_filter();
        
        $ft_now = FrozenTime::now();
        $span   = $this->request->getQuery('timespan');  
        if($span == 'now'){
            $ft_start       = $ft_now->subHour(1);
        }
        if($span == 'daily'){
            $ft_start    = $ft_now->subHour(24);
        }
        if($span == 'weekly'){
            $ft_start    = $ft_now->subHour((24*7));
        }
         
        $query      = $this->{$this->main_model}->find()->where($where)->where(['start >=' => $ft_start])->where(['dynamic_client_id' => $dc_id ]);
        
        $fields     = $this->{$this->main_model}->schema()->columns();
        
        if(isset($this->request->query['sort'])){       
            $dir    = 'ASC';
            $dir    = isset($this->request->query['dir']) ? $this->request->query['dir'] : $dir;
            $sort   = 'Softflows'.'.'.$this->request->query['sort'];
            $query->order([$sort => $dir]);    
        }

        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
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

        $total      = $query->count();       
        $q_r        = $query->all();

        foreach($q_r as $i){
             foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                if(
                    ($field == 'start')||
                    ($field == 'finish')||
                    ($field == 'created')||
                    ($field == 'modified')
                ){
                    if($i->{"$field"} == null){
                        $i->{"$field".'_in_words'} = 'Never';
                    }else{
                        $i->{"$field".'_in_words'} = $i->{"$field"}->diffForHumans();
                    }
                }
            }
            //$hostname = gethostbyaddr($i->dst_ip); 
            //$i->{'hostname'} = $hostname;  
            array_push($items,$i);
        
        }
              
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => ['items','success','totalCount']
        ]);  
    }
      
    private function _common_filter(){

        $where_clause   = [];
        $model          = 'Softflows';

        if(isset($this->request->query['filter'])){
            $filter = json_decode($this->request->query['filter']);        
            foreach($filter as $f){ 
            
                //Strings (like)
                if($f->operator == 'like'){
                    $col = $model.'.'.$f->property;
                    if(($f->property == 'src_port')||($f->property == 'dst_port')||($f->property == 'proto')){    
                        array_push($where_clause,["$col" => $f->value]);
                    }else{
                        array_push($where_clause,["$col LIKE" => '%'.$f->value.'%']);
                    }                     
                }
                
                if(($f->operator == 'gt')||($f->operator == 'lt')||($f->operator == 'eq')){
                    $col = $model.'.'.$f->property;
                    $date_array = ['detected','acknowledged','resolved','created', 'modified'];    
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
        return $where_clause;
    }
}
