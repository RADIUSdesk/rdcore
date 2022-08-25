<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 25/Aug/2022
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\ORM\TableRegistry;
use Exception;
use GeoIp2\Database\Reader;

class DynamicClientsController extends AppController{
  
    public $base            = "Access Providers/Controllers/DynamicClients/";   
    protected $owner_tree   = array();
    protected $main_model   = 'DynamicClients';
  
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('DynamicClients'); 
        $this->loadModel('Users');              
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'DynamicClients'
        ]);                
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');       
    }

    //____ BASIC CRUD Manager ________
    public function index(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $geo_data   = Configure::read('paths.geo_data');
        $reader     = new Reader($geo_data);     
        $cquery     = $this->request->getQuery();  
        $cloud_id 	= $cquery['cloud_id'];
        $query 	  	= $this->{$this->main_model}->find();
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id,['DynamicClientRealms.Realms']);
        
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
            	$r_id= $dcr->realm->id;
              	$r_n = $dcr->realm->name;       
                array_push($realms,
                    [
                        'id'                    => $r_id,
                        'name'                  => $r_n
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
    
    public function add() {
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
        $this->loadModel('UnknownDynamicClients');

        $cdata = $this->request->getData();

        $check_items = ['active', 'on_public_maps', 'session_auto_close','data_limit_active'];
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
        
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
          
        $cdata = $this->request->getData();
        if(isset($cdata['id'])){ 
            $deleteEntity = $this->{$this->main_model}->get($cdata['id']);
            $this->{$this->main_model}->delete($deleteEntity);
        }else{                          //Assume multiple item delete
            foreach($this->request->getData() as $d){
                $deleteEntity = $this->{$this->main_model}->get($d['id']);
                $this->{$this->main_model}->delete($deleteEntity);
            }
        }
        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
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
                'active', 'on_public_maps', 'session_auto_close','data_limit_active','daily_data_limit_active'
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
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
    
        $data = [];
        if(null !== $this->request->getQuery('dynamic_client_id')){

            $q_r = $this->{$this->main_model}->find()
                ->where(['DynamicClients.id' => $this->request->getQuery('dynamic_client_id')])
                ->first();
            if($q_r){
                $data = $q_r;
            }         
        }
        $this->set([
            'data'   => $data,
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
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }

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
           	$this->set([
		        'success' 			=> true,
		        'id'      			=> $uploadEntity->id,
		        'photo_file_name'	=> $unique.'.'.$path_parts['extension'],
		        '_serialize' => ['success','id','photo_file_name']
		    ]);           
            
        }else{
            $message = 'Error';
            $this->set([
		        'success' 	=> false,
		        'errors'  	=> $this->JsonErrors->entityErros($uploadEntity, $message),
		        'message'	=> array("message"   => __('Problem uploading photo')),
		        '_serialize' => ['success','errors','message']
		    ]);           
        }
        //$this->set('json_return',$json_return);
    }
     
    public function menuForGrid(){
    
    	$user = $this->_ap_right_check();
        if(!$user){
            return;
        }
         
        $menu = $this->GridButtonsFlat->returnButtons(false, 'DynamicClients'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
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
        
}
