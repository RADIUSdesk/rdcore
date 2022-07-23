<?php

namespace App\Controller;
use Cake\Core\Configure;
use Cake\ORM\TableRegistry;
use Exception;
use GeoIp2\Database\Reader;

class DynamicClientsController extends AppController{
  
    public $base            = "Access Providers/Controllers/DynamicClients/";   
    protected $owner_tree   = array();
    protected $main_model   = 'DynamicClients';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('DynamicClients'); 
        $this->loadModel('Users');              
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('GridFilter');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'DynamicClients'
        ]);
                
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');       
    }

    //____ BASIC CRUD Manager ________
    public function index(){

        $geo_data   = Configure::read('paths.geo_data');
        $reader     = new Reader($geo_data);     
        $cquery     = $this->request->getQuery();  
        $cloud_id 	= $this->request->query['cloud_id'];
        $query 	  	= $this->{$this->main_model}->find();
        $this->CommonQuery->build_cloud_query($query,$cloud_id,['DynamicClientRealms']);
        
        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        if(isset($cquery['limit'])){
            $limit  = $cquery['limit'];
            $page   = $cquery['page'];
            $offset = $cquery['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items      = [];

        foreach($q_r as $i){

            $country_code   = '';
            $country_name   = '';
            $city           = '';
            $postal_code    = '';
            $state_name     = '';
            $state_code     = '';

            if($i->last_contact_ip != ''){
                try {
                    $location         = $reader->city($i->last_contact_ip);
                } catch (\Exception $e) {
                    //Do Nothing
                }

                if(!empty($location)){
                    $city           = $location->city->name;
                    $postal_code    = $location->postal->code;
                    $country_name   = $location->country->name;
                    $country_code   = $location->country->isoCode;
                    $state_name     = $location->mostSpecificSubdivision->name;
                    $state_code     = $location->mostSpecificSubdivision->isoCode;
                }
            }

            $realms     = [];
            foreach($i->dynamic_client_realms as $dcr){               
                array_push($realms,
                    [
                        'id'                    => $r_id,
                        'name'                  => $r_n,
                        'available_to_siblings' => $r_s
                    ]);
            }

            $i->country_code = $country_code;
            $i->country_name = $country_name;
            $i->city         = $city;
            $i->postal_code  = $postal_code;
            if($i->last_contact != null){
                $i->last_contact_human    = $this->TimeCalculations->time_elapsed_string($i->last_contact);
            }

            $i->realms = $realms;
            $i->update = true;
            $i->delete = true;
            
            //Check if there is data cap on unit
            if($i->data_limit_active){
                $d_limit_bytes = $this->_getBytesValue($i->data_limit_amount,$i->data_limit_unit);
                $i->data_cap = $d_limit_bytes;
                if($i->data_used >0){
                    $i->perc_data_used =  round($i->data_used /$d_limit_bytes,2) ;
                    if($i->perc_data_used > 1){
                        $i->perc_data_used = 1;
                    }
                }else{
                    $i->perc_data_used = 0;
                }
            }
            
            //Check if there is daily data cap on unit
            if($i->daily_data_limit_active){
                $daily_limit_bytes = $this->_getBytesValue($i->daily_data_limit_amount,$i->daily_data_limit_unit);
                $i->daily_data_cap = $daily_limit_bytes;
                if($i->daily_data_used >0){
                    $i->daily_perc_data_used =  round($i->daily_data_used /$daily_limit_bytes,2) ;
                    if($i->daily_perc_data_used > 1){
                        $i->daily_perc_data_used = 1;
                    }
                }else{
                    $i->daily_perc_data_used = 0;
                }
            }         
            
            array_push($items,$i);
        }

        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
    }

    public function clientsAvailForMap() {

        $cquery = $this->request->getQuery();

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];

        $query = $this->{$this->main_model}->find();

        $this->_build_common_query($query, $user);

        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        if(isset($cquery['limit'])){
            $limit  = $cquery['limit'];
            $page   = $cquery['page'];
            $offset = $cquery['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items  = [];

        foreach($q_r as $i){
            $id     = $i->id;
            $name   = $i->name;
            $item = ['id' => $id,'name' => $name];
            array_push($items,$item);
        }

        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
    }

    public function add() {
        $this->loadModel('UnknownDynamicClients');

        $cdata = $this->request->getData();

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];

        //Get the creator's id
        if($cdata['user_id'] == '0'){ //This is the holder of the token - override '0'
            $cdata['user_id'] = $user_id;
        }

        $check_items = ['active', 'available_to_siblings', 'on_public_maps', 'session_auto_close','data_limit_active'];
        foreach($check_items as $ci){
            if(isset($cdata[$ci])){
                $cdata[$ci] = 1;
            }else{
                $cdata[$ci] = 0;
            }
        }

        $unknown_flag = false;
        //Check if it was an attach!
        if(array_key_exists('unknown_dynamic_client_id',$cdata)){
            //Now we need to do a lookup
            $u = $this->UnknownDynamicClients->findById($cdata['unknown_dynamic_client_id'])->first();
            if($u){
                $unknown_flag   = true;
                $nas_id         = $u->nasidentifier;
                $called         = $u->calledstationid;

                $cdata['nasidentifier']   = $nas_id;
                $cdata['calledstationid'] = $called;
            }
        }


        $modelEntity = $this->{$this->main_model}->newEntity($cdata);

        if ($this->{$this->main_model}->save($modelEntity)) {
            //Check if we need to add na_realms table
            if(isset($cdata['avail_for_all'])){
                //Available to all does not add any dynamic_client_realm entries
            }else{
                foreach(array_keys($cdata) as $key){
                    if(preg_match('/^\d+/',$key)){
                        //----------------
                        $this->_add_dynamic_client_realm($modelEntity->id, $key);
                        //-------------
                    }
                }
            }
            $cdata['id'] = $modelEntity->id;

            //If it was an unknown attach - remove the unknown
            if($unknown_flag){
                //$modelEntity->id = $cdata['unknown_dynamic_client_id'];
                $deleteEntity = $this->UnknownDynamicClients->get($cdata['unknown_dynamic_client_id']);
                $this->UnknownDynamicClients->delete($deleteEntity);
            }


            $this->set([
                'success' => true,
                'data'      => $cdata,
                '_serialize' => ['success','data']
            ]);
        } else {
            $message = 'Error';
            $this->JsonErrors->entityErros($modelEntity,$message);
        }
    }

    public function delete($id = null) {
        if (!$this->request->is('post')) {
            throw new MethodNotAllowedException();
        }

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $cdata = $this->request->getData();

        $user_id    = $user['id'];
        $fail_flag  = false;

        if(isset($cdata['id'])){   //Single item delete
            $message = "Single item ".$cdata['id'];

            $deleteEntity = $this->{$this->main_model}->get($cdata['id']);

            $this->{$this->main_model}->delete($deleteEntity);
        }else{                          //Assume multiple item delete
            foreach($this->request->getData() as $d){
                $deleteEntity = $this->{$this->main_model}->get($d['id']);

                $this->{$this->main_model}->delete($deleteEntity);
            }
        }

        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   => ['message' => __('Could not delete some items')],
                '_serialize' => ['success','message']
            ]);
        }else{
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }
    }

    public function edit(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $cdata = $this->request->getData();

        if ($this->request->is('post')) {

            //Unfortunately there are many check items which means they will not be in the POST if unchecked
            //so we have to check for them
            $check_items = [
                'active', 'available_to_siblings', 'on_public_maps', 'session_auto_close','data_limit_active','daily_data_limit_active'
            ];

            foreach($check_items as $i){
                if(isset($cdata[$i])){
                    $cdata[$i] = 1;
                }else{
                    $cdata[$i] = 0;
                }
            }

            $modelEntity = $this->{$this->main_model}->get($cdata['id']);
            // Update Entity with Request Data
            $modelEntity = $this->{$this->main_model}->patchEntity($modelEntity, $cdata);

            if ($this->{$this->main_model}->save($modelEntity)) {
                $this->set([
                    'success' => true,
                    '_serialize' => ['success']
                ]);
            }
        }
    }


    public function view(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        
        $tree     = false;     
        $entity = $this->Users->get($user_id); 
        if($this->Users->childCount($entity) > 0){
            $tree = true;
        }
        
        $data = [];

        if(null !== $this->request->getQuery('dynamic_client_id')){

            $q_r = $this->{$this->main_model}->find()
                ->where(['DynamicClients.id' => $this->request->getQuery('dynamic_client_id')])
                ->contain(['Users'=> ['fields' => ['Users.username']]])
                ->first();
            // print_r($q_r);
            if($q_r){
                $data = $q_r;
            }
            
            if($q_r->user !== null){
                $data['username']  = "<div class=\"fieldBlue\"> <b>".$q_r->user->username."</b></div>";
            }else{
                $data['username']  = "<div class=\"fieldRed\"><i class='fa fa-exclamation'></i> <b>(ORPHANED)</b></div>";
            }
            $data['show_owner']  = $tree;
            
        }

        $this->set([
            'data'   => $data, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => ['success','data']
        ]);
    }


    public function viewPhoto(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        $items = [];

        if(null !== $this->request->getQuery('id')){
            $q_r = $this->{$this->main_model}->find()->where(['id' => $this->request->getQuery('id')])->first();

            if($q_r){
                $items['photo_file_name'] = $q_r->photo_file_name;
            }
        }

        $this->set([
            'data'   => $items, //For the form to load we use data instead of the standard items as for grids
            'success' => true,
            '_serialize' => ['success','data']
        ]);
    }

    public function uploadPhoto($id = null){

       //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.
        $this->viewBuilder()->setLayout('ext_file_upload');

        $path_parts     = pathinfo($_FILES['photo']['name']);
        $unique         = time();
        $dest           = WWW_ROOT."img/nas/".$unique.'.'.$path_parts['extension'];
        $dest_www       = "/cake3/rd_cake/webroot/img/nas/".$unique.'.'.$path_parts['extension'];

        //Now add....
        $data['id']  = $this->request->getData('id');
        $data['photo_file_name']  = $unique.'.'.$path_parts['extension'];

        $uploadEntity = $this->{$this->main_model}->newEntity($data);
        if($this->{$this->main_model}->save($uploadEntity)){
            move_uploaded_file ($_FILES['photo']['tmp_name'] , $dest);
            $json_return['id']                  = $uploadEntity->id;
            $json_return['success']             = true;
            $json_return['photo_file_name']     = $unique.'.'.$path_parts['extension'];
        }else{
            $message = 'Error';
            $json_return['errors']      = $this->JsonErrors->entityErros($uploadEntity, $message);
            $json_return['message']     = array("message"   => __('Problem uploading photo'));
            $json_return['success']     = false;
        }
        $this->set('json_return',$json_return);
    }

    public function noteIndex(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $items = $this->Notes->index($user);
    }

    public function noteAdd(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->Notes->add($user);
    }

    public function noteDel(){
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->Notes->del($user);
    }
    //----- Menus ------------------------
    function _build_common_query($query, $user){

        $where = [];

        $query->contain([
            'Users',
            'DynamicClientRealms.Realms',
            'DynamicClientNotes.Notes',
           // 'AliveCurrents'
        ]);

        //===== SORT =====
        //Default values for sort and dir
        $sort   = $this->main_model.'.last_contact';
        $dir    = 'DESC';

        if(null !== $this->request->getQuery('sort')){
            if($this->request->getQuery('sort') == 'username'){
                $sort = 'Users.username';
            }else{
                $sort = $this->main_model.'.'.$this->request->getQuery('sort');
            }
            $dir  = $this->request->getQuery('dir');
        }

        $query->order([$sort => $dir]);
        //==== END SORT ===


        //====== REQUEST FILTER =====
        if(null !== $this->request->getQuery('filter')){
            $filter = json_decode($this->request->getQuery('filter'));
            foreach($filter as $f){

                $f = $this->GridFilter->xformFilter($f);

                //Strings
                if($f->type == 'string'){
                    if($f->field == 'owner'){
                        array_push($where, ["Users.username LIKE" => '%'.$f->value.'%']);
                    }else{
                        $col = $this->main_model.'.'.$f->field;
                        array_push($where, ["$col LIKE" => '%'.$f->value.'%']);
                    }
                }
                //Bools
                if($f->type == 'boolean'){
                    $col = $this->main_model.'.'.$f->field;
                    array_push($where, ["$col" => $f->value]);
                }
            }
        }
        
       //=== Combo Filter if present ====
        if(isset($this->request->query['query'])){
            $q = $this->request->query['query'];
            if($q !== '[null]'){            
                array_push($where,["DynamicClients.name LIKE" => '%'.$q.'%']);
            } 
        } 
          
        //====== END REQUEST FILTER =====

        //====== AP FILTER =====
        //If the user is an AP; we need to add an extra clause to only show the LicensedDevices which he is allowed to see.
        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $tree_array = [];
            $user_id    = $user['id'];

            //**AP and upward in the tree**
            $this->parents = $this->Users->find('path', ['for' => $user_id, 'fields' => 'Users.id']);
            //So we loop this results asking for the parent nodes who have available_to_siblings = true
            foreach($this->parents as $i){
                $i_id = $i->id;
                if($i_id != $user_id){ //upstream
                    array_push($tree_array,[$this->main_model.'.user_id' => $i_id,$this->main_model.'.available_to_siblings' => true]);
                }else{
                    array_push($tree_array,[$this->main_model.'.user_id' => $i_id]);
                }
            }
            //** ALL the AP's children
            $this->children    = $this->Users->find_access_provider_children($user['id']);
            if($this->children){   //Only if the AP has any children...
                foreach($this->children as $i){
                    $id = $i['id'];
                    array_push($tree_array,[$this->main_model.'.user_id' => $id]);
                }
            }
            //Add it as an OR clause
            array_push($where, ['OR' => $tree_array]);
        }
        //====== END AP FILTER =====
        return $query->where($where);
    }

    private function _get_action_flags($owner_id,$user){
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            return ['update' => true, 'delete' => true];
        }

        if($user['group_name'] == Configure::read('group.ap')){  //AP
            $user_id = $user['id'];

            //test for self
            if($owner_id == $user_id){
                return ['update' => true, 'delete' => true ];
            }
            //Test for Parents
            foreach($this->parents as $i){
                if($i->id == $owner_id){
                    return ['update' => false, 'delete' => false ];
                }
            }

            //Test for Children
            foreach($this->children as $i){
                if($i['id'] == $owner_id){
                    return ['update' => true, 'delete' => true];
                }
            }
        }
    }

    private function _add_dynamic_client_realm($dynamic_client_id,$realm_id){

        $d                                              = [];
        $d['DynamicClientRealms']['id']                  = '';
        $d['DynamicClientRealms']['dynamic_client_id']   = $dynamic_client_id;
        $d['DynamicClientRealms']['realm_id']            = $realm_id;

        $dynClientRealmEntity = $this->DynamicClients->DynamicClientRealms->newEntity($d);

        $this->DynamicClients->DynamicClientRealms->save($dynClientRealmEntity);
    }
    
    private function _getBytesValue($total_data,$unit){
    
        if(strpos($unit, 'kb') !== false){
           $total_data = $total_data * 1024; 
        }
        if(strpos($unit, 'mb') !== false){
           $total_data = $total_data * 1024 * 1024; 
        }
        if(strpos($unit, 'gb') !== false){
           $total_data = $total_data * 1024 * 1024 * 1024; 
        }
        if(strpos($unit, 'tb') !== false){
           $total_data = $total_data * 1024 * 1024 * 1024 * 1024; 
        }
           
        return $total_data;
    }
    
    public function menuForGrid(){
        
        $menu = $this->GridButtonsFlat->returnButtons(false, 'DynamicClients'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
}
