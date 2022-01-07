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

use Cake\Mailer\Email;


class AlertsController extends AppController{
  
    public $base  = "Access Providers/Controllers/Alerts/";
    
    protected $owner_tree = array();
    protected $main_model = 'Alerts';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Alerts'); 
        $this->loadModel('Users');
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');  
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('MailTransport');     
    }
    
     //____ BASIC CRUD Manager ________
    public function index(){

        //__ Authentication + Authorization __
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        $user_id    = $user['id'];
        $where      = $this->_common_filter();   
        $query      = $this->{$this->main_model}->find()->where($where)->contain(['Meshes','Nodes','ApProfiles','Aps','Users']);
        $this->_ap_filter_for_available_to_siblings($query,$user);
        
        if(isset($this->request->query['sort'])){       
            $dir    = 'ASC';
            $dir    = isset($this->request->query['dir']) ? $this->request->query['dir'] : $dir;
            $sort = 'Alerts'.'.'.$this->request->query['sort'];
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
        $items      = []; 
          
        foreach ($q_r as $i) {            
            $row        = [];
            $fields     = $this->{$this->main_model}->schema()->columns();
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
            'totalCount'    => $total,
            '_serialize'    => ['items','success','totalCount']
        ]);
    }
    
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'Alerts'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
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

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];
            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{'Alerts'}->find()->where(['Alerts.id' => $this->request->data['id']])->first();
            $this->{'Alerts'}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{'Alerts'}->find()->where(['Alerts.id' => $d['id']])->first();
                $this->{'Alerts'}->delete($entity);
            }
        }

        if($fail_flag == true){
            $this->set(array(
                'success'   => false,
                'message'   => array('message' => __('Could not delete some items')),
                '_serialize' => array('success','message')
            ));
        }else{
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }
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

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];
            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{'Alerts'}->find()->where(['Alerts.id' => $this->request->data['id']])->first();
            if($entity){
                $entity->acknowledged   = FrozenTime::now();
                $entity->user_id        = $user_id;
                $this->{'Alerts'}->save($entity);
            }

        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{'Alerts'}->find()->where(['Alerts.id' => $d['id']])->first();
                if($entity){
                    $entity->acknowledged   = FrozenTime::now();
                    $entity->user_id        = $user_id;
                    $this->{'Alerts'}->save($entity);
                }
            }
        }

        if($fail_flag == true){
            $this->set(array(
                'success'   => false,
                'message'   => array('message' => __('Could not delete some items')),
                '_serialize' => array('success','message')
            ));
        }else{
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        }
	}
	
	public function sendNotifications(){
	
	    $this->loadModel('UserSettings');   
	    $user_settings  = $this->{'UserSettings'}->find()->where(['UserSettings.name' => 'alert_activate','UserSettings.value' => '1'])->contain(['Users'=> ['Groups']])->all();
	    $alerts_cluster = [];
	    
		foreach($user_settings as $us){
		    $username   = $us->user->username;
		    $group      = $us->user->group->name;
		    $email      = $us->user->email;
		    $id         = $us->user->id;
		    $user['id']         = $id;
		    $user['username']   = $username;
		    $user['group_name'] = $group;
		    
		    $freq = 1;
			$q_freq = $this->UserSettings->find()->where(['UserSettings.user_id' => $id,"UserSettings.name" => "alert_frequency"])->first();
			if($q_freq) {
				$freq = $q_freq->value;
			}
			$date_str = date("Y-m-d H:i:s");
			$date_hour = date("h");
			$hour_match = (int)$date_hour%$freq;
			//print_r("$username hour match:".$hour_match." date_hour:".(int)$date_hour);
			
			//--Only if its in an interval which it must be sent!--	    
		    if($hour_match == 0){
		    
		        $query      = $this->{$this->main_model}->find()->where(['resolved IS NULL'])->contain(['Meshes','Nodes','ApProfiles','Aps','Users']);
                $this->_ap_filter_for_available_to_siblings($query,$user);
                $q_r        = $query->all();         
                $alerts     = [];              
                foreach($q_r as $i){           
                    $row        = [];
                    $fields     = $this->{$this->main_model}->schema()->columns();
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
                    array_push($alerts, $row);           
                }
                
                $alerts_cluster[$id] = [
                    'user'      => $user,
                    'email'     => $email,
                    'alerts'    => $alerts    
                ];               
            }
            //--Only if its in an interval which it must be sent!--           
		}
		
		foreach(array_keys($alerts_cluster) as $k){
		    $u          = $alerts_cluster[$k]['user'];
		    $from       = $this->MailTransport->setTransport($u);  
		    $e          = $alerts_cluster[$k]['email'];
		    $base_msg   = 'Test Email Config';
            $subject    = 'Test Email Config';   
		    $email_a    = new Email(['transport'   => 'mail_rd']);
		    $a          = $alerts_cluster[$k]['alerts'];
            $email_a->from($from)
                ->to($e)
                ->subject("$subject")
                ->template('alert_template', 'alert_notify')
                ->viewVars(['alerts'=> $a])
                ->emailFormat('html')
                ->send();
		}		
	    $items = [];
	    $this->set([
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
	}
	
	private function _common_filter(){

        $where_clause   = [];
        $model          = 'Alerts';

        if(isset($this->request->query['filter'])){
            $filter = json_decode($this->request->query['filter']);        
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
    
    private function _ap_filter_for_available_to_siblings($query,$user){
         $model         = 'Meshes';
         $where_clause  = [];
         if($user['group_name'] == Configure::read('group.ap')){  //AP
            $tree_array = [];
            $user_id    = $user['id'];

            //**AP and upward in the tree**
            $this->parents = $this->{'Users'}->find('path',['for' => $user_id]);
 
            //So we loop this results asking for the parent nodes who have available_to_siblings = true
            foreach($this->parents as $i){
                $i_id = $i->id;
                if($i_id != $user_id){ //upstream
                    array_push($tree_array,array($model.'.'.'user_id' => $i_id,$model.'.'.'available_to_siblings' => true));
                    array_push($tree_array,array('ApProfiles.'.'user_id' => $i_id,'ApProfiles.'.'available_to_siblings' => true));
                }else{
                    array_push($tree_array,array($model.'.'.'user_id' => $i_id));
                    array_push($tree_array,array('ApProfiles.'.'user_id' => $i_id));  
                }
            }
                 
            //** ALL the AP's children
            $children = $this->{'Users'}->find('children', ['for' => $user_id]);
            if($children){   //Only if the AP has any children...
                foreach($children as $i){
                    $id = $i->id;
                    array_push($tree_array,array($model.'.'.'user_id' => $id));
                    array_push($tree_array,array('ApProfiles.'.'user_id' => $id));
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
