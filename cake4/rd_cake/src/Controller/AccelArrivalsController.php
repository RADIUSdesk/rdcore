<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 01/11/2023
 * Time: 00:00
 */

namespace App\Controller;
use GeoIp2\Database\Reader;
use Cake\Core\Configure;

class AccelArrivalsController extends AppController {

    protected $main_model = 'AccelArrivals';

    public function initialize():void{
        parent::initialize();
        $this->loadModel('AccelArrivals');
        $this->loadModel('Users');   
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
    }
      
    public function index(){
        //__ Authentication + Authorization __
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $req_q    	= $this->request->getQuery();    
        $geo_data   = Configure::read('paths.geo_data');
        $reader     = new Reader($geo_data);
        
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();
               
        //===== PAGING (MUST BE LAST) ======
        $limit = 50;   //Defaults
        $page = 1;
        $offset = 0;
        if (isset($req_q['limit'])) {
            $limit 	= $req_q['limit'];
            $page 	= $req_q['page'];
            $offset = $req_q['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items = [];

        foreach ($q_r as $i) {    
            $row        = [];
            $fields     = $this->{$this->main_model}->getSchema()->columns();
            try {
                $record         = $reader->city($i->{"last_contact_from_ip"});
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
                if($field == 'last_contact'){
                    $row['last_contact_human'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }  
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            }
                      
            $row['city']        = $city;
            $row['postal_code'] = $postal_code;
            $row['state_name']  = $state_name;
            $row['state_code']  = $state_code;
            $row['country_name']= $country;
            $row['country_code']= $country_code;
             
            array_push($items, $row);
        }

        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            'metaData'		=> [
            	'total'	=> $total
            ]
        ));
        $this->viewBuilder()->setOption('serialize', true); 
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
        $req_d 	= $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
       
            $entity     = $this->{$this->main_model}->get($req_d['id']);   
            $this->{$this->main_model}->delete($entity);  
   
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                $entity     = $this->{$this->main_model}->get($d['id']);  
                $this->{$this->main_model}->delete($entity);      
            }
        }
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
	}

    public function menuForGrid(){
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $menu = $this->GridButtonsFlat->returnButtons( false, 'unknown_dynamic'); 
        $this->set([
            'items' => $menu,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true); 
    }
}
