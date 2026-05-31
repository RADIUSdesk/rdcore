<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 26/06/2021
 * Time: 00:00
 */

namespace App\Controller;
use App\Controller\AppController;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

//use Cake\Mailer\Email;
use Cake\Mailer\Mailer;

class AlertsController extends AppController{
  
    protected $main_model 	= 'Alerts';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('Alerts'); 
        $this->loadModel('Users');
        $this->loadModel('Clouds');
        $this->loadModel('CloudAdmins');
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');  
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('MailTransport');
        $this->loadComponent('RdLogger'); 
        
        //$this->Authentication->allowUnauthenticated(['sendNotifications']);            
    }
    
     //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
                       
        $req_q    	= $this->request->getQuery(); //q_data is the query data      
       	$cloud_id 	= $req_q['cloud_id'];
        
        $user_id    = $user['id'];
        $where      = $this->_common_filter();   
        $query      = $this->{$this->main_model}->find()->where($where)->contain(['Meshes','Nodes','ApProfiles','Aps','Users']);
       
        $scope      = $this->request->getQuery('scope');
        
        if($scope && $scope == 'cloud'){
            $query->where(['OR' => ['Meshes.cloud_id' => $cloud_id , 'ApProfiles.cloud_id' => $cloud_id]]);   
        }else{
            
            //We add this filter for non-root users
            if($user_id !== 44){ //Create extra clause for NON Root users
                $list_of_clouds = [];
                //Get all the clouds this user has accees to or that he owns
                
                $own_clouds = $this->Clouds->find()->where(['Clouds.user_id' => $user_id])->all();
                foreach($own_clouds as $cloud){
                    $list_of_clouds[] = $cloud->id;     
                }
            
                $cloud_admins   = $this->CloudAdmins->find()->where(['CloudAdmins.user_id' => $user_id])->all();
                foreach($cloud_admins as $cloud_admin){
                    $list_of_clouds[] = $cloud_admin->cloud_id;
                }
                
                $list_of_clouds = is_array($list_of_clouds) ? $list_of_clouds : [$list_of_clouds];    
                $query->where(['OR' => [
                    'Meshes.cloud_id IN'        => $list_of_clouds,
                    'ApProfiles.cloud_id IN'    => $list_of_clouds
                ]]);                          
            }                     
                   
        }      
        
        //$this->_ap_filter_for_available_to_siblings($query,$user);
        
        if(isset($req_q['sort'])){       
            $dir    = 'ASC';
            $dir    = isset($req_q['dir']) ? $req_q['dir'] : $dir;
            $sort = 'Alerts'.'.'.$req_q['sort'];
            $query->order([$sort => $dir]);    
        }

        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
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

        $total      = $query->count();       
        $q_r        = $query->all();
        $items      = []; 
          
        foreach ($q_r as $i) {            
            $row        = [];
            $fields     = $this->{$this->main_model}->getSchema()->columns();
            if($i->mesh){
                $row['network'] = $i->mesh->name;
                $row['type'] = 'mesh';
                if($i->node){
                    $row['device']    = $i->node->name;
                }
            }
            if($i->ap_profile){
                $row['network'] = $i->ap_profile->name;
                $row['type']    = 'ap_profile';
                if($i->ap){
                    $row['device']    = $i->ap->name;
                }
            }
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                if(
                    ($field == 'detected')||
                    ($field == 'created')||
                    ($field == 'modified')||
                    ($field == 'acknowledged')||
                    ($field == 'resolved')
                ){
                    if($i->{"$field"} == null){
                        $row["$field".'_in_words'] = 'Never';
                    }else{
                        $row["$field".'_in_words'] = $i->{"$field"}->diffForHumans();
                        if($field == 'acknowledged'){
                            $row['before_acknowledged_in_words'] = $i->{"detected"}->diffForHumans($i->{"$field"},true); // 1 hour ago;
                            $row['acknowledged_by'] = $i->user->username;
                        }
                        if($field == 'resolved'){
                            $row['before_resolved_in_words'] = $i->{"detected"}->diffForHumans($i->{"$field"},true); // 1 hour ago;
                        }
                    }
                }      
            }
            array_push($items, $row);
        }
       
        //___ FINAL PART ___
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtonsFlat->returnButtons(false, 'Alerts'); 
        $this->set([
            'items' => $menu,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
      
    public function delete($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $user_id    = $user['id'];
        $fail_flag  = false;
        $req_d		= $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
            $message = "Single item ".$req_d['id'];
            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{'Alerts'}->find()->where(['Alerts.id' => $req_d['id']])->first();
            $this->{'Alerts'}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity     = $this->{'Alerts'}->find()->where(['Alerts.id' => $d['id']])->first();
                $this->{'Alerts'}->delete($entity);
            }
        }

        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   =>  __('Could not delete some items')
            ]);
            
        }else{
            $this->set([
                'success' => true
            ]);
        }
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function acknowledged($id = null){
	
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
        //__ Authentication + Authorization __
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $user_id    = $user['id'];
        $fail_flag  = false;
        $req_d		= $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
            $message = "Single item ".$req_d['id'];
            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{'Alerts'}->find()->where(['Alerts.id' => $req_d['id']])->first();
            
            if(($entity)&&($entity->category == 'alert')){ //Silently ignore the others categories
                $entity->acknowledged   = FrozenTime::now();
                $entity->user_id        = $user_id;
                $this->{'Alerts'}->save($entity);
            }

        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity     = $this->{'Alerts'}->find()->where(['Alerts.id' => $d['id']])->first();
                
                if(($entity)&&($entity->category == 'alert')){ //Silently ignore the others categories
                    $entity->acknowledged   = FrozenTime::now();
                    $entity->user_id        = $user_id;
                    $this->{'Alerts'}->save($entity);
                }
            }
        }

        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   => __('Could not acknowledge some items'),
            ]);
        }else{
            $this->set([
                'success' => true
            ]);
        }
        $this->viewBuilder()->setOption('serialize', true);
	}
		
	private function _common_filter(){

        $where_clause   = [];
        $model          = 'Alerts';
        
        $req_q    		= $this->request->getQuery(); //q_data is the query data 

        if(isset($req_q['filter'])){
            $filter = json_decode($req_q['filter']);        
            foreach($filter as $f){ 
            
                //Strings (like)
                if($f->operator == 'like'){
                    if($f->property == 'network'){
                        array_push($where_clause,['OR' => ["Meshes.name LIKE" => '%'.$f->value.'%',"ApProfiles.name LIKE" => '%'.$f->value.'%']]);
                    }
                    if($f->property == 'device'){
                        array_push($where_clause,['OR' => ["Nodes.name LIKE" => '%'.$f->value.'%',"Aps.name LIKE" => '%'.$f->value.'%']]);
                    }   
                }
                
                if($f->operator == 'in'){
                    $list_array = [];
                    foreach($f->value as $filter_list){
                        $col = $model.'.'.$f->property;
                        array_push($list_array,["$col" => "$filter_list"]);
                    }
                    array_push($where_clause,['OR' => $list_array]);
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
