<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 27/09/2017
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;

use Geo\Geocoder\Geocoder;


class NaStatesController extends AppController {

    public $base = "Access Providers/Controllers/NaStates/";
    protected $owner_tree = array();
    protected $main_model = 'NaStates';

    public function initialize(){
        parent::initialize();
        $this->loadModel('Users');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => $this->main_model,
            'sort_by' => $this->main_model . '.id'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('Formatter');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }

    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query, $user, ['Nas']); //AP QUERY is sort of different in a way

		$nas_id		= false;
        if(isset($this->request->query['nas_id'])){
			$nas_id 	= $this->request->query['nas_id'];
		}
		if($nas_id) {
            $query->where(['na_id' => $nas_id]);
        }

        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($this->request->query['limit'])) {
            $limit = $this->request->query['limit'];
            $page = $this->request->query['page'];
            $offset = $this->request->query['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items = array();
        //If there is only one entry - we take it from that entry till now
        if(count($q_r) == 1){
            $state_time = $this->Formatter->diff_in_time($q_r[0]['created']);
            array_push($items,array(
                'id'                    => $q_r[0]['id'], 
                'state'                 => $q_r[0]['state'],
                'time'                  => $state_time,
                'start'                 => $q_r[0]['created']
            ));
        }
        //If there are more than one
        if(count($q_r) > 1){

            $counter = 0;
            foreach($q_r as $item){
                if($counter != 0){
                    $previous_time  = $q_r[($counter-1)]['created'];
                    $previous_state = $q_r[($counter-1)]['state'];
                    $id             = $q_r[($counter-1)]['id'];
                    $state_time     = $this->Formatter->diff_in_time($q_r[$counter]['created'],$previous_time);
                    array_push($items,array('id' =>  $id,'state'=>$previous_state,'time'=> $state_time,'start' =>$previous_time,'end' => $q_r[$counter]['created'])); 
                }
                $counter++;
            }

            //Add the last one
            $state_now      = $q_r[($counter-1)]['state'];
            $state_since    = $q_r[($counter-1)]['created'];
            $id             = $q_r[($counter-1)]['id'];
            $state_time     = $this->Formatter->diff_in_time($state_since);
            array_push($items,array('id' =>  $id,'state'=>$state_now,'time'=> $state_time,'start' => $q_r[($counter-1)]['created'])); 
        }

        $items = array_reverse($items); //Put the last state at the top!
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));
    }
	    

    public function delete() {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $user_id   = $user['id'];
        $fail_flag = false;

	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];

            //NOTE: we first check of the user_id is the logged in user OR a sibling of them:         
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);   
            $owner_id   = $entity->user_id;
            
            if($owner_id != $user_id){
                if($this->Users->is_sibling_of($user_id,$owner_id)== true){
                    $this->{$this->main_model}->delete($entity);
                }else{
                    $fail_flag = true;
                }
            }else{
                $this->{$this->main_model}->delete($entity);
            }
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                $owner_id   = $entity->user_id;
                if($owner_id != $user_id){
                    if($this->Users->is_sibling_of($user_id,$owner_id) == true){
                        $this->{$this->main_model}->delete($entity);
                    }else{
                        $fail_flag = true;
                    }
                }else{
                    $this->{$this->main_model}->delete($entity);
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

  
    public function menuForGrid()
    {
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, true, 'fr_acct_and_auth'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }

}
