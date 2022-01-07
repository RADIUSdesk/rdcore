<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 28/09/2017
 * Time: 00:00
 */

namespace App\Controller;
use GeoIp2\Database\Reader;
use Cake\Core\Configure;


class UnknownApsController extends AppController {

    public $base = "Access Providers/Controllers/UnknownAps/";
    protected $owner_tree = array();
    protected $main_model = 'UnknownAps';

    public function initialize(){
        parent::initialize();
        $this->loadModel('UnknownAps');
        $this->loadModel('FirmwareKeys');
        $this->loadModel('Users');   
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
        
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'FirmwareKeys',
            'sort_by' => 'FirmwareKeys.token_key'
        ]);
    }
    
    public function index(){
        //__ Authentication + Authorization __
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $geo_data   = Configure::read('paths.geo_data');
        $reader     = new Reader($geo_data);
        
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();
        
        $query->contain(['FirmwareKeys']);

        $q_firmware_keys = $this->FirmwareKeys->find();
        $this->CommonQuery->build_common_query($q_firmware_keys, $user, ['Users']);
        
        $q_r_firmware_keys  = $q_firmware_keys->all();
        
        $list_of_key_ids    = [];
        
        foreach($q_r_firmware_keys as $fk){
            array_push($list_of_key_ids,['UnknownAps.firmware_key_id' => $fk->id]);        
        }
        
        $empty_override = false;
        
        if( ($user['group_name'] !== 'Administrators')&&
            (count($list_of_key_ids) > 0)){   
            $query->where(['OR' => $list_of_key_ids]);
        } 
        
        if( ($user['group_name'] !== 'Administrators')&&
            (count($list_of_key_ids) == 0)){   
            $empty_override = true;
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

        foreach ($q_r as $i) {    
            $row        = array();
            $fields     = $this->{$this->main_model}->schema()->columns();
            try {
                $record  = $reader->city($i->{"last_contact_from_ip"});
            } catch (\Exception $e) {
                //Do Nothing
            }
            
            $country_code   = '';
            $country        = '';
            $city           = '';
            $postal_code    = '';
            $state_name     = '';
            $state_code     = '';
                 
             if(!empty($record)){
                $city           = $record->city->name;
                $postal_code    = $record->postal->code;
                $country        = $record->country->name;
                $country_code   = $record->country->isoCode;
                $state_name     = $record->mostSpecificSubdivision->name;
                $state_code     = $record->mostSpecificSubdivision->isoCode;
            }
            
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};   
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            }
            
            if($i->firmware_key){
                $row['token_key'] = $i->firmware_key->token_key;   
            }
            
            $row['city']        = $city;
            $row['postal_code'] = $postal_code;
            $row['state_name']  = $state_name;
            $row['state_code']  = $state_code;
            $row['country_name']= $country;
            $row['country_code']= $country_code;
             
            array_push($items, $row);
        }
        
        //IF There was no firmware_key for the Access Provider, we give them an empty list!
        if( ($user['group_name'] !== 'Administrators')&&
            ($empty_override)){   
            $items = [];
        } 

        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items', 'success', 'totalCount')
        ));
    }

    public function delete() {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
	    if(isset($this->request->data['id'])){   //Single item delete
       
            $entity     = $this->{$this->main_model}->get($this->request->data['id']);   
            $this->{$this->main_model}->delete($entity);  
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                $this->{$this->main_model}->delete($entity);      
            }
        }
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
	}

    public function menuForGrid(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'unknown_ap_or_nodes'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
}
