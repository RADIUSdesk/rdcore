<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;


class DynamicDetailsController extends AppController{
  
    public $base  				= "Access Providers/Controllers/DynamicDetails/";   
    protected $main_model 		= 'DynamicDetails'; 
    protected $theme_default    = 'Default';
	protected $theme_selected   = 'Default';	
	protected $default_language = 'en_GB';
    
     
    public function initialize():void{  
        parent::initialize();          
        $this->loadModel('DynamicDetails');
        $this->loadModel('DynamicPairs'); 
        $this->loadModel('DynamicPhotos');
        $this->loadModel('DynamicPages');
        $this->loadModel('DynamicDetailSocialLogins'); 
        $this->loadModel('DynamicDetailCtcs');
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => $this->main_model
        ]);
        $this->loadComponent('JsonErrors');

    }
        
    public function infoFor(){

        $items      = [];
		$sl_items	= [];
		$social_enable = false;
		
		$req_q    	= $this->request->getQuery(); 

        if(isset($req_q['dynamic_id'])){ //preview link will call this page ?dynamic_id=<id>
        
            $dynamic_id = $req_q['dynamic_id'];

            $q_r = $this->{$this->main_model}
                ->find()
                ->contain([
                    'DynamicPages',
                    'DynamicPhotos' => function ($q) {
                       return $q
                            ->where(['DynamicPhotos.active' => true]);
                    },
                    'DynamicDetailSocialLogins',
                    'DynamicDetailCtcs'
                ])
                ->where([$this->main_model.'.id' =>$dynamic_id])
                ->first();                

            if($q_r){
                //Modify the photo path:
                $c = 0;
                foreach($q_r->dynamic_photos as $i){
                
                    $full_file_name = Configure::read('paths.absolute_photo_path').$i->file_name;
                    $info           = getimagesize($full_file_name);
                    $width          = $info[0];
                    $height         = $info[1];
                    
                    $layout = 'landscape';
                    if($width == $height){
                        $layout = 'block';
                    }
                    if($width < $height){
                        $layout = 'portrait';
                    }
                    
                    $q_r->dynamic_photos[$c]['file_name']   = Configure::read('paths.dynamic_photos').$i->file_name;
                    $q_r->dynamic_photos[$c]['width']       = $width;
                    $q_r->dynamic_photos[$c]['height']      = $height;
                    $q_r->dynamic_photos[$c]['layout']      = $layout;
                    $c++;
                }
                
                $items['photos']    = $q_r->dynamic_photos;
                $items['pages']     = $q_r->dynamic_pages;
                $items['mobile_app']= $q_r->dynamic_detail_mobile;
				$sl_items           = $q_r->dynamic_detail_social_logins;
				$icon_file_name     = Configure::read('paths.dynamic_detail_icon').$q_r->icon_file_name;
				if($q_r->social_enable == true){
				    $social_enable = true;
				}
				if($q_r->dynamic_detail_ctc){
				    $items['settings']['click_to_connect'] =  $q_r->dynamic_detail_ctc;
			    }else{
			        $items['settings']['click_to_connect'] =  [];
			    }
            }

        }else{ //Build a query since it was not called from the preview link
            $conditions = ["OR" =>[]];
      
            foreach(array_keys($req_q) as $key){
                array_push($conditions["OR"],
                    ["DynamicPairs.name" => $key, "DynamicPairs.value" =>  $req_q[$key]]
                ); //OR query all the keys
            }
           	
			$q_r = $this->DynamicPairs
                ->find()
                ->contain([
                    'DynamicDetails' => 
                        [
                            'DynamicPhotos' => function ($q) {
                               return $q
                                    ->where(['DynamicPhotos.active' => true]);
                            },
                            'DynamicPages',
                            'DynamicDetailSocialLogins',
                            'DynamicDetailCtcs'
                        ]
                ])
                ->where([$conditions])
                ->order(['DynamicPairs.priority' => 'DESC'])
                ->first();                

            //print_r($q_r);

            if($q_r){
                
                //Modify the photo path:
                $c = 0;
                foreach($q_r->dynamic_detail->dynamic_photos as $i){
                    $full_file_name = Configure::read('paths.absolute_photo_path').$i->file_name;
                    $info           = getimagesize($full_file_name);
                    $width          = $info[0];
                    $height         = $info[1];
                    
                    $layout = 'landscape';
                    if($width == $height){
                        $layout = 'block';
                    }
                    if($width < $height){
                        $layout = 'portrait';
                    }
                    
                    $q_r->dynamic_detail->dynamic_photos[$c]['file_name']   = Configure::read('paths.dynamic_photos').$i->file_name;
                    $q_r->dynamic_detail->dynamic_photos[$c]['width']       = $width;
                    $q_r->dynamic_detail->dynamic_photos[$c]['height']      = $height;
                    $q_r->dynamic_detail->dynamic_photos[$c]['layout']      = $layout;
                    $c++;

                }
                
                
                $items['photos']    = $q_r->dynamic_detail->dynamic_photos;
                $items['pages']     = $q_r->dynamic_detail->dynamic_pages;
                $items['mobile_app']= $q_r->dynamic_detail->dynamic_detail_mobile;
				$sl_items           = $q_r->dynamic_detail->dynamic_detail_social_logins;
				$icon_file_name     = Configure::read('paths.dynamic_detail_icon').$q_r->dynamic_detail->icon_file_name;
				if($q_r->dynamic_detail->social_enable == true){
				    $social_enable = true;
				}
				if($q_r->dynamic_detail->dynamic_detail_ctc){
				    $items['settings']['click_to_connect'] =  $q_r->dynamic_detail->dynamic_detail_ctc;
			    }else{
			        $items['settings']['click_to_connect'] =  [];
			    }
            }
            
        }
        
        $detail_fields  = [
			'id',		'name',			'phone',		'fax',			'cell',		'email',
			'url',		'street_no',	'street',		'town_suburb',	'city',		'country',
			'lat',		'lon',	       
		];
		
		$settings_fields    = [
			't_c_check',	        't_c_url',	        'redirect_check',   'redirect_url',
			'slideshow_check',      'seconds_per_slide','connect_check',    'connect_username', 'connect_suffix',
			'connect_delay',        'connect_only',     'user_login_check', 'voucher_login_check',
			'auto_suffix_check',    'auto_suffix',      'usage_show_check', 'usage_refresh_interval', 
			'register_users',       'lost_password',    'lost_password_method',
			'slideshow_enforce_watching',
			'slideshow_enforce_seconds',
			'available_languages',
			'prelogin_check',
			'show_screen_delay',
			'show_logo',
			'show_name',
			'name_colour',
			'chilli_json_unavailable',
			'chilli_use_chap'
		];
        
		//print_r($q_r);

        //Get the detail for the page
        if($q_r){
        
                $direct_flag = true;
                if($q_r->dynamic_detail != null){
                    $direct_flag = false;
                }
        
                foreach($detail_fields as $field){
                    if($direct_flag){
                        $items['detail']["$field"]= $q_r->{"$field"};  
                    }else{
                        $items['detail']["$field"]= $q_r->dynamic_detail->{"$field"}; 
                    }
                }
                $items['detail']['icon_file_name'] = $icon_file_name;
                
                foreach($settings_fields as $field){
                    if($direct_flag){
                        $items['settings']["$field"]= $q_r->{"$field"};  
                    }else{
                        $items['settings']["$field"]= $q_r->dynamic_detail->{"$field"}; 
                    } 
                }
                
                //IF the available languages are selected we need to get more data on them
                if($items['settings']["available_languages"] !== ''){
                    $final_array = [];
                    $selected_array = explode(",",$items['settings']["available_languages"]);
                    Configure::load('DynamicLogin','default'); 
                    $i18n = Configure::read('DynamicLogin.i18n');
                    foreach($i18n as $i){
                        if($i['active']){
                            if(in_array($i['id'],$selected_array)){
                                array_push($final_array,['value' => $i['name'],'id'=>$i['id']]);   
                            }
                        }
                    }
                    $items['settings']["available_languages"] = $final_array;
                }
                
			if($social_enable){
				$items['settings']['social_login']['active'] = true;			
				//Find the temp username and password
				if($direct_flag){
                    $temp_user_id   = $q_r->social_temp_permanent_user_id;  
                }else{
                    $temp_user_id   = $q_r->dynamic_detail->social_temp_permanent_user_id; 
                }
				
				$user_detail  = $this->_find_username_and_password($temp_user_id);
				$items['settings']['social_login']['temp_username'] = $user_detail['username'];
				$items['settings']['social_login']['temp_password'] = $user_detail['password'];
				//Find if there are any defined
				$items['settings']['social_login']['items'] = array();
				foreach($sl_items as $i){
					$n = $i->name;
					array_push($items['settings']['social_login']['items'], array('name' => $n));
				}

			}else{
				$items['settings']['social_login']['active'] = false;
			}

        }

        $success = true;
        if(count($items) == 0){ //Not found
            $success    = false;
            $key_val    = [];
            $q_string   = $this->request->getQuery();
            foreach(array_keys($q_string) as $key){
                $key_val[$key] = $q_string[$key];
            }
            $items      = $key_val;          
        }
        
        $client_info                = []; 
        $client_info['userAgent']   = $this->request->getHeaderLine('User-Agent');   
        $client_info['isMobile']    = $this->request->is('mobile');
        $client_info['isAndroid']   = stripos($client_info['userAgent'], 'Android');
        $client_info['isIPhone']    = stripos($client_info['userAgent'], 'iPhone');
        $client_info['isIPad']      = stripos($client_info['userAgent'], 'iPad');  
        $items['client_info']       = $client_info;
        
        $this->set([
            'data' => $items,
            'success' => $success
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function idMe(){  
        $info               = []; 
        $info['userAgent']  = $this->request->getHeaderLine('User-Agent');    
        $info['isMobile']   = $this->request->is('mobile');
        $info['isAndroid']  = stripos($info['userAgent'], 'Android');
        $info['isIPhone']   = stripos($info['userAgent'], 'iPhone');
        $info['isIPad']     = stripos($info['userAgent'], 'iPad');
        if(isset($_SERVER['HTTP_X_REQUESTED_WITH'])){ 
            $info['HTTP_X_REQUESTED_WITH'] = $_SERVER['HTTP_X_REQUESTED_WITH'];
        }
        $this->set([
            'data'          => $info,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    ///cake4/rd_cake/dynamic-details/chilli-session-write/
    public function chilliSessionWrite(){  
        $session    = $this->getRequest()->getSession();
        $req_q    	= $this->request->getQuery();  
        foreach(array_keys($req_q) as $key){
            $session->write('coova_'.$key, $req_q[$key]);
       	}
		$this->response =  $this->response->withHeader('Location', '/vpn_login');
        return $this->response;	
    }
    
    public function chilliSessionRead(){  
        $session    = $this->getRequest()->getSession();
        $s_data     = $session->read();
        $data       = [];
        if($s_data){
            foreach(array_keys($s_data) as $key){
            
                if (preg_match('#^coova_#', $key) === 1) {
                    // Starts with http (case sensitive).
                    $value  = $s_data[$key];
                    $item   = str_replace("coova_", "", "$key");
                    $data[$item] = $value;
                }
            }
        }
        
        $this->set([
            'data'          => $data,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
    public function chilliBrowserDetect(){  
		$redir_to = $this->_doBrowserDetectFor('coova');
		print_r($redir_to);
		$this->response = $this->response->withHeader('Location', $redir_to);
        return $this->response;	
    }
    
    public function mikrotikBrowserDetect(){  
		$redir_to = $this->_doBrowserDetectFor('coova');
		$this->response = $this->response->withHeader('Location', $redir_to);
        return $this->response;	
    }
    
    public function ruckusBrowserDetect(){  
		$redir_to = $this->_doBrowserDetectFor('ruckus');
		$this->response = $this->response->withHeader('Location', $redir_to);
        return $this->response;	
    }
    
    //----- Give better preview pages -----
    public function previewChilliDesktop(){
        $redir_to = $this->_doPreviewChilli('desktop');
		$this->response = $this->response->withHeader('Location', $redir_to);
        return $this->response;	
    }
    
    public function previewChilliMobile(){
        $redir_to = $this->_doPreviewChilli('mobile');
		$this->response = $this->response->withHeader('Location', $redir_to);
        return $this->response;	
    }
    
    public function i18n(){
        $items = array();
        Configure::load('DynamicLogin','default');
        $i18n = Configure::read('DynamicLogin.i18n');
        foreach($i18n as $i){
            if($i['active']){
                array_push($items, $i);
            }
        }

        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
       
    public function exportCsv(){

		$req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      

        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id); 
        $q_r    = $query->all();
        //Headings
        $heading_line   = [];
        $req_q    	    = $this->request->getQuery(); 
        if(isset($req_q['columns'])){
            $columns = json_decode($req_q['columns']);
            foreach($columns as $c){
                array_push($heading_line,$c->name);
            }
        }
        $data = [
            $heading_line
        ];
        foreach($q_r as $i){

            $columns    = array();
            $csv_line   = array();
            if(isset($req_q['columns'])){
                $columns = json_decode($req_q['columns']);
                foreach($columns as $c){
                    $column_name = $c->name;
                     array_push($csv_line,$i->{$column_name});  
                }
                array_push($data,$csv_line);
            }
        }
        
        $this->setResponse($this->getResponse()->withDownload('export.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');     
        $this->set([
            'data'   => $data,
        ]);    
        $this->viewBuilder()->setOption('serialize', true);  
               
    } 
       
    //____ BASIC CRUD Manager ________
    public function index(){
    

        //Fields
		$fields  	= [
			'id',		'name',			'user_id',
			'phone',    'fax',			'cell',		    'email',
			'url',		'street_no',	'street',		'town_suburb',	'city',		'country',
			'lat',		'lon',			't_c_check',	't_c_url',		'theme',	'register_users',
			'lost_password', 'lost_password_method'
		];
		
        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];
        $query 	  = $this->{$this->main_model}->find();      
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);
 
        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;
        if(isset($cloud_id['limit'])){
            $limit  = $cloud_id['limit'];
            $page   = $cloud_id['page'];
            $offset = $cloud_id['start'];
        }
        
        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total  = $query->count();       
        $q_r    = $query->all();

        $items      = [];

        foreach($q_r as $i){              
            $row = [];
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
            }            
			$row['update']		= true;
			$row['delete']		= true;
            array_push($items,$row);
        }

        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
     
    public function indexForFilter(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_q    = $this->request->getQuery();      
       	$cloud_id = $req_q['cloud_id'];        
        $query    = $this->{$this->main_model}->find();
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id);        
        $q_r    = $query->all();
        $items      = [];
        foreach($q_r as $i){
            array_push($items,[
                'id'                    => $i->id, 
                'text'                  => $i->name
            ]);
        }   

        $this->set(array(
            'items' => $items,
            'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
      
    public function add() {
    
    	$req_d	= $this->request->getData();
          
        $check_items = [ 't_c_check', 'register_users', 'lost_password'];
        foreach($check_items as $ci){
            if(isset($req_d[$ci])){
                $req_d[$ci] = 1;
            }else{
                $req_d[$ci] = 0;
            }
        }
        
        //The rest of the attributes should be same as the form..
        $entity = $this->{$this->main_model}->newEntity($req_d); 
        if($this->{$this->main_model}->save($entity)){
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }else{
            $message = 'Error';
            $errors = $entity->getErrors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }   
            $this->set([
                'errors'    => $a,
                'success'   => false,
                'message'   => __('Could not create item')
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }   
	}
      
    public function edit() {    

		$req_d	= $this->request->getData();
		$entity = $this->{$this->main_model}->get($req_d['id']);
        $this->{$this->main_model}->patchEntity($entity, $req_d);

        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true
            ));
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = 'Error';
            
            $errors = $entity->getErrors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }
            
            $this->set([
                'errors'    => $a,
                'success'   => false,
                'message'   => __('Could not update item')
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }
	}
	
	
    public function editSettings(){
    
    	$req_d	= $this->request->getData();

        $check_items = [
            'reg_email',
            'reg_auto_add',
            'reg_mac_check',
            'register_users',
            't_c_check',
            'redirect_check',
            'slideshow_check',
            'user_login_check',
            'voucher_login_check',
            'auto_suffix_check',
            'usage_show_check',
            'lost_password',
            'slideshow_enforce_watching',
            'prelogin_check',
            'show_logo',
			'show_name',
			'chilli_json_unavailable',
			'chilli_use_chap'
	    ];
	    
        foreach($check_items as $i){
            if(isset($req_d[$i])){
                $req_d[$i] = 1;
            }else{
                $req_d[$i] = 0;
            }
        }
        
        $count      = 0;
        
        if (array_key_exists('available_languages', $req_d)) {
            $comma_separated = implode(",", $req_d['available_languages']);
            if($comma_separated == 'Just The Default Language'){
                $comma_separated = '';
            }else{
                if (strpos($comma_separated, $req_d['default_language']) == false) {
                    $comma_separated = $comma_separated.','.$req_d['default_language'];
                } 
            }
            $req_d['available_languages'] = $comma_separated;
        }
        
        
        $entity = $this->{$this->main_model}->get($req_d['id']);
        $this->{$this->main_model}->patchEntity($entity, $req_d);

        if ($this->{$this->main_model}->save($entity)) {
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = 'Error';
            
            $errors = $entity->getErrors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }
            
            $this->set([
                'errors'    => $a,
                'success'   => false,
                'message'   => __('Could not update item')
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }
    }
    
    public function viewClickToConnect(){

        $data = [];
        $entity = $this->{'DynamicDetailCtcs'}->find()->where(['dynamic_detail_id' =>$this->request->getQuery('dynamic_detail_id')])->first();
        if($entity){
            $data = $entity->toArray();
        }
                   
        $this->set([
            'data'     => $data,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
      
    public function editClickToConnect(){
    
    	$req_d	= $this->request->getData();
     
        $check_items = [
			'connect_check',
			'connect_only',
			'cust_info_check',
			'ci_first_name',
			'ci_first_name_required',
			'ci_last_name',
			'ci_last_name_required',
			'ci_email',
			'ci_email_required',
			'ci_email_opt_in',
		    'ci_gender',
			'ci_gender_required',
		    'ci_birthday',
			'ci_birthday_required',
		    'ci_company',
			'ci_company_required',
			'ci_address',
			'ci_address_required',
			'ci_city',
			'ci_city_required',
		    'ci_country',
			'ci_country_required',
			'ci_phone',
			'ci_phone_required',
			'ci_phone_opt_in',
			'ci_room',
			'ci_room_required',
			'ci_custom1',
			'ci_custom1_required',
			'ci_custom2',
			'ci_custom2_required',
			'ci_custom3',
			'ci_custom3_required',
		];
        foreach($check_items as $i){
            if(isset($req_d[$i])){
                $req_d[$i] = 1;
            }else{
                $req_d[$i] = 0;
            }
        }
        
        $entity = $this->{'DynamicDetailCtcs'}->find()->where(['dynamic_detail_id' =>$req_d['dynamic_detail_id']])->first();
        if(!$entity){
             $entity = $this->{'DynamicDetailCtcs'}->newEntity($req_d); 
        }
        $this->{'DynamicDetailCtcs'}->patchEntity($entity, $req_d);

        if ($this->{'DynamicDetailCtcs'}->save($entity)) {
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = 'Error';
            
            $errors = $entity->getErrors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }
            
            $this->set([
                'errors'    => $a,
                'success'   => false,
                'message'   => __('Could not update item'),
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }
    }
    
    public function delete() {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
		
		$req_d	= $this->request->getData();
           
	    if(isset($req_d['id'])){   //Single item delete

            //First find all the photos for this item then delete them           
            $q_r = $this->DynamicPhotos
                ->find()
                ->where(['DynamicPhotos.dynamic_detail_id' => $req_d['id']])
                ->all();
            foreach($q_r as $i){
                $file_to_delete = WWW_ROOT."img/dynamic_photos/".$i->file_name;
                $entity = $this->DynamicPhotos->get($i->id);
                if($this->DynamicPhotos->delete($entity)){
                    if(file_exists($file_to_delete)){
                        unlink($file_to_delete);
                    }
                }
            }
                    
            $this->DynamicDetail->id = $req_d['id'];
            $this->DynamicDetail->delete($this->DynamicDetail->id,true);
      
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){

                //First find all the photos for this item then delete them             
                $q_r = $this->DynamicPhotos
                    ->find()
                    ->where(['DynamicPhotos.dynamic_detail_id' => $d['id']])
                    ->all();
                foreach($q_r as $i){
                    $file_to_delete = WWW_ROOT."img/dynamic_photos/".$i->file_name;
                    $entity = $this->DynamicPhotos->get($i->id);
                    if($this->DynamicPhotos->delete($entity)){
                        if(file_exists($file_to_delete)){
                            unlink($file_to_delete);
                        }
                    }
                }
                $e = $this->{$this->main_model}->get($d['id']);
                $this->{$this->main_model}->delete($e);
            }
        }

        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}

    public function view(){

        $items    = []; 
        $req_q    = $this->request->getQuery();    
        if(isset($req_q['dynamic_detail_id'])){

            $q_r = $this->{$this->main_model}->find()
                ->where(['DynamicDetails.id' => $req_q['dynamic_detail_id'] ])
                ->first();
            if($q_r){
            
            	$fields = $this->{$this->main_model}->getSchema()->columns();
            	
                $realm  = '';
                       
                if($q_r->realm_id != null){
                    $this->loadModel('Realms'); 
                    $q_realm    = $this->Realms->find()->where(['Realms.id' =>$q_r->realm_id])->first();
                    if($q_r){
                        $realm = $q_realm->name;
                    }
                }
                
                $profile = '';
                
                if($q_r->profile_id != null){
                    $this->loadModel('Profiles');
                    $q_profile    = $this->Profiles->find()->where(['Profiles.id' => $q_r->profile_id])->first();
                    if($q_profile){
                        $profile = $q_profile->name;
                    }
                }
                                
                foreach($fields as $field){
	                $items["$field"]= $q_r->{"$field"};
		        } 
		        
		        if($items['default_language'] == ''){
		            $items['default_language'] = $this->default_language;
		        }
		        
		        if($items['available_languages'] !== ''){
		            $items['available_languages[]'] = explode(',',$items['available_languages']);
		        }
		        
                $items['realm']     = $realm;
                $items['profile']   = $profile;               
            }
        }
        
        $this->set([
            'data'     => $items,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function uploadLogo($id = null){   
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_d	= $this->request->getData();

        //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.    
        $this->viewBuilder()->setLayout('ext_file_upload');

        $path_parts     = pathinfo($_FILES['photo']['name']);
        $unique         = time();
        $dest           = WWW_ROOT."img/dynamic_details/".$unique.'.'.$path_parts['extension'];
        $dest_www       = "/cake4/rd_cake/webroot/img/dynamic_details/".$unique.'.'.$path_parts['extension'];
       
        $entity         = $this->{$this->main_model}->get($req_d['id']);
        $icon_file_name = $unique.'.'.$path_parts['extension'];
        $old_file       = $entity->icon_file_name;
        $entity->icon_file_name = $icon_file_name;
        
        if($this->{$this->main_model}->save($entity)){
            move_uploaded_file ($_FILES['photo']['tmp_name'] , $dest);           
            //Remove old file (if not logo.jpg)
            if($old_file !== 'logo.jpg'){
                $file_to_delete = WWW_ROOT."img/dynamic_details/".$old_file;
                if(file_exists($file_to_delete)){
                    unlink($file_to_delete);
                }
            }
            
            $this->set([
		        'success' 			=> true,
		        'id'      			=> $req_d['id'],
		        'icon_file_name'	=> $icon_file_name
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);         
    
        }else{       
            $errors = $entity->getErrors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }
            
            $this->set([
		        'errors' 	=> $a,
		        'message' 	=> __('Problem uploading photo'),
		        'success'	=> false
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);        
        }

    }
    
    public function indexPhoto(){   

        $this->_genericIndex("DynamicPhotos");
    }
    
    public function uploadPhoto($id = null){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_d	= $this->request->getData();
        
        $check_items = ['active','include_title','include_description'];
        foreach($check_items as $ci){
            if(isset($req_d[$ci])){
                $req_d[$ci] = 1;
            }else{
                $req_da[$ci] = 0;
            }
        }
        
        //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
        //are posted to the server.
        $this->viewBuilder()->setLayout('ext_file_upload');

        $path_parts   = pathinfo($_FILES['photo']['name']);
        $unique       = time();
        $dest         = WWW_ROOT."img/dynamic_photos/".$unique.'.'.$path_parts['extension'];
        $dest_www     = "/cake4/rd_cake/img/dynamic_photos/".$unique.'.'.$path_parts['extension'];
        
        $req_d['file_name'] = $unique.'.'.$path_parts['extension'];
        
        $entity = $this->DynamicPhotos->newEntity($req_d); 
        if($this->DynamicPhotos->save($entity)){
            move_uploaded_file ($_FILES['photo']['tmp_name'] , $dest);
            $this->set([
		        'success' 			=> true,
		        'id'      			=> $entity->id
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);                              
        }else{
            $message = 'Error';
            $errors = $entity->getErrors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            } 
            
            $this->set([
		        'errors' 	=> $a,
		        'message' 	=> __('Problem uploading photo'),
		        'success'	=> false
		    ]);
		    $this->viewBuilder()->setOption('serialize', true);         
        }
        
    }
    
    public function deletePhoto($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        if(!$this->_ap_right_check()){
            return;
        }
        
        $req_d	= $this->request->getData();

	    if(isset($req_d['id'])){   //Single item delete
            //Get the filename to delete
            $entity = $this->DynamicPhotos->get($req_d['id']);
            if($entity){
                $file_to_delete = WWW_ROOT."img/dynamic_photos/".$entity->file_name;
                if($this->DynamicPhotos->delete($entity)){
                    if(file_exists($file_to_delete)){
                        unlink($file_to_delete);
                    }
                }
            }     
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                //Get the filename to delete
                $entity = $this->DynamicPhotos->get($d['id']);
                if($entity){
                    $file_to_delete = WWW_ROOT."img/dynamic_photos/".$entity->file_name;
                    if($this->DynamicPhotos->delete($entity)){
                        if(file_exists($file_to_delete)){
                            unlink($file_to_delete);
                        }
                    }
                }
            }
        }

        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function editPhoto(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $req_d	= $this->request->getData();
        
        $this->viewBuilder()->setLayout('ext_file_upload'); 
        $entity = $this->DynamicPhotos->get($req_d['id']);
        
        $check_items = ['active','include_title','include_description'];
        foreach($check_items as $ci){
            if(isset($req_d[$ci])){
                $req_d[$ci] = 1;
            }else{
                $req_d[$ci] = 0;
            }
        }
        
        if($entity){ 
            $new_photo = false;
            if($_FILES['photo']['size'] > 0){  
                $file_name      = $entity->file_name;
                $file_to_delete = WWW_ROOT."img/dynamic_photos/".$file_name;
                unlink($file_to_delete);

                $path_parts     = pathinfo($_FILES['photo']['name']);
                $unique         = time();
                $dest           = WWW_ROOT."img/dynamic_photos/".$unique.'.'.$path_parts['extension'];
                move_uploaded_file ($_FILES['photo']['tmp_name'] , $dest);
                $new_photo = true;
            }
             
            $this->DynamicPhotos->patchEntity($entity, $req_d);
            if($new_photo){
                $entity->file_name = $unique.'.'.$path_parts['extension']; 
            }  
            $this->DynamicPhotos->save($entity);
        }
        
     	$this->set([
	        'success' 	 => true
	    ]); 
	    $this->viewBuilder()->setOption('serialize', true); 
    }
    
    public function shufflePhoto(){
    
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        if(!$this->_ap_right_check()){
            return;
        }
        $table 	= 'DynamicPhotos';
        $req_d	= $this->request->getData();
        $req_q  = $this->request->getQuery();
        
        if(isset($req_q['dynamic_detail_id'])){
            $dd_id = $req_q['dynamic_detail_id'];   
            foreach($req_d as $d){       
                $entity     = $this->{$table}->get($d['id']);
                $e_data     = $entity->toArray();
                
                $new_entity = $this->{$table}->newEntity($e_data);
                $new_entity->unsetProperty('id');
                $this->{$table}->save($new_entity);
                
                $this->{$table}->delete($entity);
            }    
        }
          
        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
    public function indexPage(){

        $this->_genericIndex("DynamicPages");  
    }

    public function addPage() {

        if(!$this->_ap_right_check()){
            return;
        }
        
        $this->_genericAdd('DynamicPages');
 
       
	}
	
	public function editPage() {

        if(!$this->_ap_right_check()){
            return;
        }
             
        $this->_genericEdit('DynamicPages');
	}
	
	public function deletePage($id = null) {
		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        if(!$this->_ap_right_check()){
            return;
        }

	    $this->_genericDelete('DynamicPages');
	}
	
	
	public function indexPair(){

        $this->_genericIndex("DynamicPairs");   
    }
    
    public function addPair(){

        $this->_genericAdd("DynamicPairs");   
    }
    
    public function editPair(){

        $this->_genericEdit("DynamicPairs");   
    }
    
    public function deletePair(){

        $this->_genericDelete("DynamicPairs");   
    }
    
    private function _genericIndex($table){
    
        $fields     = $this->{$table}->getSchema()->columns();
        $items      = [];
        $contain    = [];
        if($table == 'DynamicPhotos'){       
            $contain = ['DynamicPhotoTranslations' => 'DynamicDetailLanguages'];
        }
        
        if($table == 'DynamicPages'){       
            $contain = ['DynamicDetailLanguages'];
        }
        
        $req_q  = $this->request->getQuery();
        
        if(isset($req_q['dynamic_detail_id'])){
            $dd_id = $req_q['dynamic_detail_id'];
            $q_r = $this->{$table}
                ->find()
       	        ->where([$table.'.dynamic_detail_id' =>$dd_id])
       	        ->contain($contain)
       	        ->all();
       	        
       	    $this->loadModel('DynamicDetailLanguages');
       	    
       	    foreach($q_r as $i){ 
           	    $row = [];
                foreach($fields as $field){
                    $row["$field"]= $i->{"$field"};
                } 
                
                //Special clause for DynamicPhotos
                if($table == 'DynamicPhotos'){
                    $f          = $i->file_name;
                    $location   = Configure::read('paths.real_photo_path').$f;
                    $row['img'] = "/cake4/rd_cake/webroot/files/image.php?width=400&height=100&image=".$location;
                    
                    $row['translations'] = [];
                    foreach($i->dynamic_photo_translations as $t){
                        $language_iso   = $t->dynamic_detail_language->iso_code;
                        $language_name  = $t->dynamic_detail_language->name;
                        $arr_t  = [
                            'id'            => $t->id, 
                            'title'         => $t->title, 
                            'description'   => $t->description, 
                            'language_name' => $language_name,
                            'language_iso'  => $language_iso
                        ];
                        array_push($row['translations'],$arr_t);
                    }
                    
                    //Check if we need to remove spaces
                    if(isset($req_q['remove_whitespace'])){ 
                        $row['title']       = preg_replace('/^\s+$/','', $row['title']);
                        $row['description'] = preg_replace('/^\s+$/','', $row['description']);
                    }     
                }
                
                if($table == 'DynamicPages'){
                    if($i->dynamic_detail_language){
                        $row['language_full'] = $i->dynamic_detail_language->name;
                    }else{ //dynamic_detail_language is not yet set (as an id)
                        //$row['language'] shoulf be then the default of 'en'
                        $language_iso = $row['language'];
                        $qr = $this->{'DynamicDetailLanguages'}->find()->where(['iso_code' => $language_iso])->first();
                        if($qr){
                            //Artificially set it
                            $row['language_full'] = $qr->name;
                            $row['dynamic_detail_language_id'] = $qr->id;
                        }
                    }
                }
                              
           	    array_push($items,$row);
            }
        }
               
        $this->set(array(
            'items'     => $items,
            'success'   => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    private function _genericAdd($table){
    
        $data   = $this->request->getData();
       
        if($table == 'DynamicPages'){
            $this->loadModel('DynamicDetailLanguages');
            $language_id = $data['dynamic_detail_language_id'];
            $qr = $this->{'DynamicDetailLanguages'}->find()->where(['id' => $language_id])->first();
            if($qr){
                $data['language'] = $qr->iso_code;
            }     
        }
    
        //The rest of the attributes should be same as the form..
        $entity = $this->{$table}->newEntity($data); 
        if($this->{$table}->save($entity)){
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }else{
            $message = 'Error';
            $errors = $entity->getErrors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }   
            $this->set([
                'errors'    => $a,
                'success'   => false,
                'message'   => __('Could not create item'),
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }   
    }
    
    private function _genericEdit($table){
    
        $data = $this->request->getData();
        
        if($table == 'DynamicPages'){
            $this->loadModel('DynamicDetailLanguages');
            $language_id = $data['dynamic_detail_language_id'];
            $qr = $this->{'DynamicDetailLanguages'}->find()->where(['id' => $language_id])->first();
            if($qr){
                $data['language'] = $qr->iso_code;
            }     
        }
        
        $entity = $this->{$table}->get($data['id']);
        $this->{$table}->patchEntity($entity, $data);

        if ($this->{$table}->save($entity)) {
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        } else {
            $message = 'Error';
            
            $errors = $entity->getErrors();
            $a = [];
            foreach(array_keys($errors) as $field){
                $detail_string = '';
                $error_detail =  $errors[$field];
                foreach(array_keys($error_detail) as $error){
                    $detail_string = $detail_string." ".$error_detail[$error];   
                }
                $a[$field] = $detail_string;
            }
            
            $this->set(array(
                'errors'    => $a,
                'success'   => false,
                'message'   => __('Could not update item'),
            ));
            $this->viewBuilder()->setOption('serialize', true);
        }
    }
    
    private function _genericDelete($table){
    
    	$req_d	= $this->request->getData();
    	
        if(isset($req_d['id'])){ 
            $entity = $this->{$table}->get($req_d['id']);
            $this->{$table}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($req_d as $d){
                //Get the filename to delete
                $entity = $this->{$table}->get($d['id']);
                $this->{$table}->delete($entity);
            }
        }

        $this->set([
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
    public function viewSocialLogin(){

        $items  = [];
        $req_q  = $this->request->getQuery();
        if(isset($req_q['dynamic_detail_id'])){
        
            $dd_id = $req_q['dynamic_detail_id'];
            $q_r = $this->{$this->main_model}
                ->find()
                ->contain(['DynamicDetailSocialLogins' => ['Realms','Profiles'],'PermanentUsers'])
                ->where(['DynamicDetails.id' => $dd_id])
                ->first();

            if($q_r){
                           
				$items['social_enable']    					= $q_r->social_enable;
				$items['id']    							= $q_r->id;
				$items['social_temp_permanent_user_id'] 	= $q_r->social_temp_permanent_user_id;
				
				$items['social_temp_permanent_user_name']   = '';
				if($q_r->permanent_user){				
				    $items['social_temp_permanent_user_name'] 	= $q_r->permanent_user->username;
			    }
				
				foreach($q_r->dynamic_detail_social_logins as $i){
				
				    if($i->name == 'Facebook'){
				        $prefix = 'fb';
				    } 
				    if($i->name == 'Google'){
				        $prefix = 'gp';
				    }
				    if($i->name == 'Twitter'){
				        $prefix = 'tw';
				    }
					$items[$prefix.'_enable'] 		= $i->enable;
					$items[$prefix.'_record_info'] 	= $i->record_info;
					$items[$prefix.'_id'] 			= $i->special_key;
					$items[$prefix.'_secret'] 		= $i->secret;
					$items[$prefix.'_active'] 		= $i->enable;
					$items[$prefix.'_profile'] 	    = intval($i->profile_id);
					$items[$prefix.'_profile_name'] = $i->profile->name;
					$items[$prefix.'_realm'] 		= intval($i->realm_id);
					$items[$prefix.'_realm_name'] 	= $i->realm->name;
					$items[$prefix.'_voucher_or_user']= $i->type;

				}
            }
            
        }
        
        $this->set([
            'data'     => $items,
            'success'   => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
	}
	
	public function editSocialLogin(){
	
	    //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $req_d	= $this->request->getData();
        
        $check_items = [
			'social_enable',
			'fb_enable',
			'gp_enable',
			'tw_enable',
			'fb_record_info',
			'gp_record_info',
			'tw_record_info'
		];
		
        foreach($check_items as $i){
            if(isset($req_d[$i])){
                $req_d[$i] = 1;
            }else{
                $req_d[$i] = 0;
            }
        }
        
        $prefixes = ['fb','gp','tw'];

		//We have to have a temp user else we fail it
		if(($req_d['social_enable'] == 1)&&($req_d['social_temp_permanent_user_id'] == '')){
			 $this->set([
                'errors'    => ['social_temp_permanent_user_id' => "Temp user cannot be empty"],
                'success'   => false,
                'message'   => 'Could not save data',
            ]);
            $this->viewBuilder()->setOption('serialize', true);
			return;
		}


        //Sanity checks
        foreach($prefixes as $p){
            if(
			    ($req_d['social_enable'] == 1)&&
			    ($req_d[$p.'_enable'] == 1)
		    ){

			    $fb_check_for  = [$p.'_voucher_or_user',$p.'_secret',$p.'_id',$p.'_realm',$p.'_profile'];
			    foreach($fb_check_for as $i){
				    if($req_d["$i"] == ''){
					    $this->set([
				            'errors'    => ["$i" => $i." is required"],
				            'success'   => false,
				            'message'   => 'Could not save data'
				        ]);
				        $this->viewBuilder()->setOption('serialize', true);
					    return;
				    }
			    }
		    }
        
        }

		//If it got here without a return we can surely then add the social logins the user defined
		//First we delete the existing ones:
		$id = $req_d['id'];
		
		$entity = $this->{$this->main_model}->get($req_d['id']);
        $this->{$this->main_model}->patchEntity($entity, $req_d);
		
		$this->DynamicDetailSocialLogins->deleteAll(['DynamicDetailSocialLogins.dynamic_detail_id' => $id], true);


		if ($this->{$this->main_model}->save($entity)) {
			if($req_d['social_enable'] == 0){
			
				//if not enabled we don't care ....
				$this->set([
		            'success' => true
		        ]);
		        $this->viewBuilder()->setOption('serialize', true);
				return;
			}
			
			foreach($prefixes as $p){
			
			    if($req_d[$p.'_enable'] == 1){
				    //Facebook
				    
				    if($p == 'fb'){
				        $name = 'Facebook';   
				    }
				    if($p == 'gp'){
				        $name = 'Google';   
				    }
				    if($p == 'tw'){
				        $name = 'Twitter';   
				    }
				    
				    $data = array();
				    $data['name'] 				= $name;
				    $data['dynamic_detail_id'] 	= $id;
				    $data['profile_id'] 		= $req_d["$p"."_profile"];
				    $data['type'] 				= $req_d["$p"."_voucher_or_user"];   
				    $data['special_key'] 		= $req_d["$p"."_id"];   
				    $data['secret'] 			= $req_d["$p"."_secret"]; 
				    $data['realm_id'] 			= $req_d["$p"."_realm"];
				    $data['secret'] 			= $req_d["$p"."_secret"];
				    $data['record_info']		= $req_d["$p"."_record_info"];
				    $data['enable']				= $req_d["$p"."_enable"];					    	    
				    $entity                     = $this->DynamicDetailSocialLogins->newEntity($data);  
                    $this->DynamicDetailSocialLogins->save($entity);             
			    }
			}
			
            $this->set([
                'success' => true
            ]);
            $this->viewBuilder()->setOption('serialize', true);

        } else {

            $message = 'Error';
            $this->set([
                'errors'    => $this->JsonErrors->entityErros($entity, $message),
                'success'   => false,
                'message'   => 'Could not save data',
            ]);
            $this->viewBuilder()->setOption('serialize', true);
        }
	}
    
    

    public function availableThemes(){
 
        $items = [];
        Configure::load('DynamicLogin','default'); 
        $data       = Configure::read('DynamicLogin.theme');
        foreach(array_keys($data) as $i){
            array_push($items, array('name' => $i,'id' => $i));   
        }
        $req_q  = $this->request->getQuery();
        
        if(
            (isset($req_q['exclude_custom']))&&
            ($req_q['exclude_custom'] == 'true')
        ){
           array_shift($items); //Remove the first item which will be "Custom" in the config file
        }
            
        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

	 
    public function menuForGrid(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'dynamic_details');
        $this->set([
            'items'         => $menu,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForPhotos(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'basic');
        
        array_push($menu[0]['items'],[
             'xtype'     => 'button',  
            'glyph'     => Configure::read('icnGlobe'),  
            'scale'     => 'large', 
            'itemId'    => 'translate',    
            'tooltip'   => __('ManageTranslations')
        ]);
        
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForDynamicPages(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'basic');
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForDynamicPairs(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'basic');
             
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForDynamicEmails(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $menu = $this->GridButtonsFlat->returnButtons(false,'basic');
        
         $items_new = [];
        
        foreach($menu[0]['items'] as $m){
        
        	if($m['itemId'] !== 'edit'){
        		array_push($items_new,$m);      	
        	}
        }
                 
        array_push($items_new,[
            'xtype'     => 'button',     
            'glyph'     => Configure::read('icnCsv'), 
            'scale'     => 'large', 
            'itemId'    => 'csv',      
            'tooltip'   => __('Export CSV')
        ]);
        
        $menu[0]['items'] = $items_new;
        
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function menuForDynamicTranslations(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }  
        $menu = $this->GridButtons->returnButtons(false,'dynamic_translations');
        $this->set(array(
            'items'         => $menu,
            'success'       => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    
    private function _find_username_and_password($id){
    
        $this->loadModel('PermanentUsers');

		$q_r = $this->PermanentUsers->get($id);
		$user_data = array('username' => 'notfound','password' => 'notfound');
		if($q_r){
			$un                     = $q_r->username;
			$user_data['username']  = $un;	
			$this->loadModel('Radchecks');
			$q_pw = $this->Radchecks
			    ->find() 
				->where(['Radchecks.username' => $un,'Radchecks.attribute' => 'Cleartext-Password'])
				->first();

			if($q_pw){
				$user_data['password'] = $q_pw->value;
			}
		}
		return $user_data;
	}
	
	private function _doBrowserDetectFor($captive_portal = 'coova' ){ //Can be 'coova' / 'mikrotik' / 'ruckus'
   
        $conditions     = array("OR" =>array());
		$query_string   = $_SERVER['QUERY_STRING'];
		$req_d	        = $this->request->getData();
		$req_q          = $this->request->getQuery();
				
		if($this->request->is('post')){
		    $q_array = [];
		    foreach(array_keys($req_d) as $key){
		        $q_array[$key] = $req_d[$key];
		        array_push($conditions["OR"],
                    ["DynamicPairs.name" => $key, "DynamicPairs.value" =>  $req_d[$key]]
                ); //OR query all the keys
		     }     
		     $query_string =  http_build_query($q_array);
		}else{
		    foreach(array_keys($req_q) as $key){
                    array_push($conditions["OR"],
                        ["DynamicPairs.name" => $key, "DynamicPairs.value" =>  $req_q[$key]]
                    ); //OR query all the keys
           	}
        }

       	$q_r = $this->DynamicPairs
       	    ->find()
       	    ->contain('DynamicDetails')
       	    ->where($conditions)
       	    ->order(['DynamicPairs.priority' => 'DESC'])
       	    ->first();
       	
      	
		//See which Theme are selected
		$theme          = 'Default';
		$theme_selected = 'Default';	
		$i18n           = 'en_GB';
		if($q_r){
            $theme_selected =  $q_r->dynamic_detail->theme;
            if($q_r->dynamic_detail->default_language != ''){
                $i18n = $q_r->dynamic_detail->default_language;
            }
		}
		if (strpos($query_string, '&i18n') == false){
		    $query_string = $query_string."&i18n=$i18n";
	    }
		
        if($theme_selected == 'Custom'){ //With custom themes we read the valuse out of the DB
        
            //ruckus is special
            if($captive_portal == 'ruckus'){
                $captive_portal = 'coova'; //We use Coova's URLs for the Custom Ruckus
            }
        
		    $redir_to = $q_r->dynamic_detail->{$captive_portal."_desktop_url"}.'?'.$query_string;
		    if($this->request->is('mobile')){
                $redir_to = $q_r->dynamic_detail->{$captive_portal."_mobile_url"}.'?'.$query_string;
            }    
		}else{  //Else we fetch the 'global' theme's value from the file

     	    Configure::load('DynamicLogin','default');
            $pages       = Configure::read('DynamicLogin.theme.'.$theme_selected); //Read the defaults
		    if(!$pages){
			    $pages       = Configure::read('DynamicLogin.theme.'.$theme); //Read the defaults
		    }

		    $redir_to = $pages[$captive_portal.'_desktop'].'?'.$query_string;
            if($this->request->is('mobile')){
                $redir_to = $pages[$captive_portal.'_mobile'].'?'.$query_string;
            }
        }     
        return $redir_to;     
    }
    
    private function _doPreviewChilli(){
    
    	$req_q 	= $this->request->getQuery();
	
	    if(isset($req_q['wizard_name'])){
	        $w_name = $req_q['wizard_name'];
	        $q_r = $this->{$this->main_model}
                ->find()
                ->where([$this->main_model.'.name' => $w_name])
                ->first();
		    if($q_r){
		        $req_q['dynamic_id'] = $q_r->id;
		        $_SERVER['QUERY_STRING'] = $_SERVER['QUERY_STRING'].'&dynamic_id='.$req_q['dynamic_id'].'&uamip=10.1.0.1&uamport=3990';
		    }   
	    }else{
		    $q_r = $this->{$this->modelClass}->get($req_q['dynamic_id']);
        }
      	
		//See which Theme are selected
		$theme = 'Default';
		$i18n = 'en_GB';
		if($q_r){
            $theme_selected =  $q_r->theme;
            if($q_r->default_language != ''){
                $i18n = $q_r->default_language;
            }
		}
		

		if($theme_selected == 'Custom'){ //With custom themes we read the valuse out of the DB		
		    $redir_to = $q_r->coova_desktop_url.'?'.$_SERVER['QUERY_STRING']."&i18n=$i18n";	    
        }else{   
		    Configure::load('DynamicLogin','default'); 
            $pages       = Configure::read('DynamicLogin.theme.'.$theme_selected); //Read the defaults
		    if(!$pages){
			    $pages       = Configure::read('DynamicLogin.theme.'.$theme); //Read the defaults
		    }
		    $redir_to = $pages['coova_desktop'].'?'.$_SERVER['QUERY_STRING']."&i18n=$i18n";
		}
        return $redir_to;
	}	
}
