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
use GeoIp2\Database\Reader;


//use Geo\Geocoder\Geocoder;


class UnknownDynamicClientsController extends AppController {

    public $base = "Access Providers/Controllers/UnknownDynamicClients/";
    protected $owner_tree = array();
    protected $main_model = 'UnknownDynamicClients';

    public function initialize(){
        parent::initialize();
        $this->loadModel('UnknownDynamicClients');
        $this->loadModel('Users');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'UnknownDynamicClients',
            'sort_by' => 'UnknownDynamicClients.id'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }

    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
		
		$geo_data   = Configure::read('paths.geo_data');
        $reader     = new Reader($geo_data);

		//$Geocoder   = new Geocoder(['allowInconclusive' => true, 'minAccuracy' => Geocoder::TYPE_POSTAL]);

        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        //$this->CommonQuery->build_common_query($query, $user, ['Users']); //AP QUERY is sort of different in a way

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
        //App::uses('GeoIpLocation', 'GeoIp.Model');
        //$GeoIpLocation = new GeoIpLocation();

        foreach ($q_r as $i) {
            try {
                $record         = $reader->city($i->{"last_contact_ip"});
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

              
            array_push($items,array(
                'id'                    => $i['id'],
                'nasidentifier'         => $i['nasidentifier'],
                'calledstationid'       => $i['calledstationid'],
                'last_contact'          => $i['last_contact'], 
                'last_contact_ip'       => $i['last_contact_ip'],
                'last_contact_human'    => $this->TimeCalculations->time_elapsed_string($i['last_contact']), 
                'country_code'          => $country_code,
                'country_name'          => $country,
                'city'                  => $city,
                'postal_code'           => $postal_code
            ));
        }
       
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

  
    public function menuForGrid()
    {
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        $menu = $this->GridButtons->returnButtons($user, false, 'unknown_dynamic'); 
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
}
