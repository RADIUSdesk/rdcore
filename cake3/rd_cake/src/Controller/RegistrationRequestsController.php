<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 15/01/2019
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;

use Cake\I18n\FrozenTime;

use Cake\Network\Exception\MethodNotAllowedException;

use Cake\Mailer\Email;

class RegistrationRequestsController extends AppController {

    public $base = "Access Providers/Controllers/RegistrationRequests/";
    protected $owner_tree = array();
    protected $main_model = 'RegistrationRequests';

    public function initialize(){
        parent::initialize();
        $this->loadModel('RegistrationRequests');
        $this->loadModel('Users');
        $this->loadModel('UserSettings');
        
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'RegistrationRequests',
            'sort_by' => 'RegistrationRequests.email'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('VoucherGenerator');
    }
    
    public function getCode(){
    
        if (!$this->request->is('post')) {
            throw new MethodNotAllowedException();
        }
        
        if(isset($this->request->data['email'])){
            $email = $this->request->data['email'];
            if($this->_test_email($this->request->data['email'])){
				// Now check if user already exists (don't let them register again) 
				$q_chk_user = $this->{'Users'}->find()->where(['Users.email' => $email])->first();
				if($q_chk_user){
                    $this->set(array(
                        'success'   => false,
                        'message'   => "A Registered User already exists with this Email address.<br>Try <a href='#login'>Logging</a> in.",
                        '_serialize' => array('success','message')
                    ));    
                }else{
					//Now check it we have not yet added it before perhaps
					$e_email = $this->{'RegistrationRequests'}->find()->where(['RegistrationRequests.email' => $email])->first();
					if($e_email){
						$ago = $this->TimeCalculations->time_elapsed_string($e_email->created);
						$this->set(array(
							'success'   => false,
							'message'   => "Email address $email already submitted $ago",
							'_serialize' => array('success','message')
						));    
					}else{
						$this->request->data['user_id']             = 44; //Root user's ID
						//$this->request->data['registration_code']   = mt_rand(1000,9999);
						//$this->request->data['state']               = 'allocated';
						$entity = $this->{$this->main_model}->newEntity($this->request->data);
						if($this->{$this->main_model}->save($entity)){
							$this->set(array(
								'success'       => true,
								'message'       => "Email address $email submitted for registration code",
								'_serialize' => array('success','message')
							));
						}
					}
				}
            }
        }else{
            $this->set(array(
                'success'   => false,
                'message'   => 'Required data - email',
                '_serialize' => array('success','message')
            ));
        }
    }

    public function giveCode(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        if (isset($this->request->query['id'])){
            $id = $this->request->query['id'];
            $e_email = $this->{'RegistrationRequests'}->find()->where(['RegistrationRequests.id' => $id])->first();
            if($e_email){
                //Check the state
                if($e_email->state == 'not_allocated'){
                    $code = $this->VoucherGenerator->generateVoucher();
                    //We also add an expiry date to it....
                    $expire = new FrozenTime('+4 Weeks');
                    $this->{$this->main_model}->patchEntity($e_email, ['registration_code' => $code,'state' => 'allocated','expire' => $expire]);
                    $this->{$this->main_model}->save($e_email);
                    $this->set(array(
                        'success'   => true,
                        'message'   => "Code generated",
                        '_serialize' => array('success','message')
                    )); 
                }else{
                    $this->set(array(
                        'success'   => false,
                        'message'   => "State Of ".$e_email->state." Not Allowed for this action",
                        '_serialize' => array('success','message')
                    )); 
                }    
            }
        }else{
            $this->set(array(
                'success'   => false,
                'message'   => "Required paramaters missing",
                '_serialize' => array('success','message')
            )); 
        }
    }
    
     public function sendCode(){
     
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        if (isset($this->request->query['id'])){
            $id = $this->request->query['id'];
            $e_email = $this->{'RegistrationRequests'}->find()->where(['RegistrationRequests.id' => $id])->first();
            if($e_email){
                //Check the state
                if(($e_email->state == 'allocated')||($e_email->state == 'email_sent') ||($e_email->state == 'verified')){
                
                    $b64 = strtr(base64_encode($e_email->email), '+/=', ':-_'); // URI Safe base64
					$ref_url = $_SERVER['HTTP_REFERER'];
                    $url = "".$ref_url."#register/".$b64;
                
                    $email = new Email([
						'transport'   => 'sendgrid',
						'template'    => 'registration_code',
						'emailFormat' => 'html',
						'from'        => 'do-not-reply@radiusdesk.com',
						'subject'     => 'You\'re almost Registered...',
						'to'          => $e_email->email,
						'viewVars'    => ['email' => $e_email->email , 'registration_code' => $e_email->registration_code, 'url' => $url],
				    ]);
				    $email->send();
                
                    $timestamp = date("Y-m-d H:i:s", time());
                    $this->{$this->main_model}->patchEntity($e_email, ['email_sent' => $timestamp,'state' => 'email_sent']);
                    $this->{$this->main_model}->save($e_email);
                    $this->set([
                        'success'   => true,
                        'message'   => "Code generated",
                        '_serialize' => array('success','message')
                    ]); 
                }else{
                    $this->set(array(
                        'success'   => false,
                        'message'   => "State Of ".$e_email->state." Not Allowed for this action",
                        '_serialize' => array('success','message')
                    )); 
                }    
            }
        }else{
            $this->set(array(
                'success'   => false,
                'message'   => "Required paramaters missing",
                '_serialize' => array('success','message')
            )); 
        }
    }
    
    public function completeRegistration(){
    
        if (!$this->request->is('post')) {
            throw new MethodNotAllowedException();
        }
        
        if(
        (isset($this->request->data['email']))&&
        (isset($this->request->data['registration_code']))
        ){
            $email = $this->request->data['email'];
            $code  = $this->request->data['registration_code'];
            $e_email = $this->{'RegistrationRequests'}->find()
                ->where(['RegistrationRequests.email' => $email,'RegistrationRequests.registration_code' => $code])
                ->first();
          
            if($e_email){
            
                //Make sure the person have not perhaps already completed registration
                if($e_email->state == 'registration_completed'){
                    $this->set(array(
                        'success'   => false,
                        'message'   => "Registration already completed",
                        '_serialize' => array('success','message')
                    ));
                    return; 
                }
                
                if($e_email->state == 'expired'){
                    $this->set(array(
                        'success'   => false,
                        'message'   => "Registration request Expired",
                        '_serialize' => array('success','message')
                    ));
                    return; 
                }
            
                $this->request->data['token_key'] = Text::uuid();
                $this->request->data['state']     = 'verified';
                $this->{'RegistrationRequests'}->patchEntity($e_email, $this->request->data());
                $this->{'RegistrationRequests'}->save($e_email);
                $this->set(array(
                    'success'   => true,
                    'message'   => "Email $email And Code $code Valid",
                    'token_key' => $this->request->data['token_key'],
                    '_serialize' => array('success','message','token_key')
                )); 
            
            }else{
                $this->set(array(
                    'success'   => false,
                    'message'   => "Email $email And Code $code Not a Valid Combination",
                    '_serialize' => array('success','message')
                )); 
            }
        }else{
            $this->set(array(
                'success'   => false,
                'message'   => "Required parameters missing",
                '_serialize' => array('success','message')
            )); 
        }
    }
    
    
    public function completeRegistrationCreateUser(){
    
        if (!$this->request->is('post')) {
            throw new MethodNotAllowedException();
        }
        
         if(
            (isset($this->request->data['email']))&&
            (isset($this->request->data['token']))
         ){
            $email = $this->request->data['email'];
            $token = $this->request->data['token'];
            $e_email = $this->{'RegistrationRequests'}->find()
                ->where(['RegistrationRequests.token_key' => $token])
                ->first();
          
            if($e_email){
                $current_email = $e_email->email;
                if($current_email !== $email){
                    $this->set(array(
                        'success'   => false,
                        'message'   => "Email $email match the given token code",
                        '_serialize' => array('success','message')
                    ));
                    return;
                }
                //FIXME Add the code to actually add the Access Provider
                if($e_email->state == 'verified'){
                 
                    $this->_add_access_provider();
                    
                    $this->request->data['state']  = 'registration_completed';
                    $this->{'RegistrationRequests'}->patchEntity($e_email, $this->request->data());
                    $this->{'RegistrationRequests'}->save($e_email);
                      $this->set(array(
                        'success'   => true,
                        'message'   => "User $email added to system",
                        '_serialize' => array('success','message')
                    ));      
                }
                  
            }else{
                $this->set(array(
                    'success'   => false,
                    'message'   => "Email $email Not Found",
                    '_serialize' => array('success','message')
                )); 
            }
        }else{
            $this->set(array(
                'success'   => false,
                'message'   => "Required paramaters missing",
                '_serialize' => array('success','message')
            )); 
        }
    }
   
    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $query      = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query, $user, ['Users']); //AP QUERY is sort of different in a way

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

            $owner_id = $i->user_id;
            if (!array_key_exists($owner_id, $this->owner_tree)) {
                $owner_tree = $this->Users->find_parents($owner_id);
            } else {
                $owner_tree = $this->owner_tree[$owner_id];
            }
            
            $action_flags = $this->Aa->get_action_flags($owner_id, $user);
              
            $row        = array();
            $fields     = $this->{$this->main_model}->schema()->columns();
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
                
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                
                if($field == 'email_sent'){
                    if($i->{"$field"} !== null){
                        $row['email_sent_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                    }
                } 
                
                if($field == 'expire'){
                    if($i->{"$field"} !== null){
                        if($i->{"$field"}->wasWithinLast('4 years')){
                            $row['expire_flag']     = true;
                            $row['expire_in_words'] = "Expired ".$i->{"$field"}->timeAgoInWords(); 
                        }else{
                            $row['expire_in_words'] = $i->{"$field"}->timeAgoInWords();
                            $row['expire_flag']     = false;
                        }
                    }
                }  
            } 
                 
            $row['owner']		= $owner_tree;
			$row['update']		= $action_flags['update'];
			$row['delete']		= $action_flags['delete']; 
            
            array_push($items, $row);
        }

        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items', 'success', 'totalCount')
        ));
    }

    public function add(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        
        $this->_addOrEdit($user,'add');
        
    }
    
    public function edit(){
    
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $this->_addOrEdit($user,'edit');
        
    }
    
    private function _addOrEdit($user,$type= 'add') {

        //__ Authentication + Authorization __
        
        $user_id    = $user['id'];

        //Get the creator's id
        if(isset($this->request->data['user_id'])){
            if($this->request->data['user_id'] == '0'){ //This is the holder of the token - override '0'
                $this->request->data['user_id'] = $user_id;
            }
        }

        $check_items = array(
			'available_to_siblings',
			'active'
		);
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }
       
        if($type == 'add'){ 
            $this->request->data['token_key'] = Text::uuid();
            $entity = $this->{$this->main_model}->newEntity($this->request->data());
        }
       
        if($type == 'edit'){
            $entity = $this->{$this->main_model}->get($this->request->data['id']);
            $this->{$this->main_model}->patchEntity($entity, $this->request->data());
        }
              
        if ($this->{$this->main_model}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
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
        
        $menu = [
            'xtype' => 'buttongroup',
            'title' => 'Action',
            'items' => [
                [
                    'xtype'     => 'button',
                    'glyph'     => Configure::read('icnReload'),
                    'scale'     => 'large',
                    'itemId'    => 'reload',
                    'tooltip'   => 'Reload',
					'handler'	=> 'onReloadClick'
                ],
                [
                    'xtype'     => 'button',
                    'glyph'     => Configure::read('icnAdd'),
                    'scale'     => 'large',
                    'itemId'    => 'add',
                    'tooltip'   => __('Add'),
					'handler'	=> 'onAddClick'
                ],
                [
                    'xtype'     => 'button',
                    'glyph'     => Configure::read('icnQrcode'),
                    'scale'     => 'large',
                    'itemId'    => 'code',
                    'disabled'  => true,
                    'tooltip'   => 'Generate Code',
					'handler'	=> 'onCodeClick'
                ],
                 [
                    'xtype'     => 'button',
                    'glyph'     => Configure::read('icnEmail'),
                    'scale'     => 'large',
                    'itemId'    => 'email',
                    'disabled'  => true,
                    'tooltip'   => 'Send/Re-send Email',
					'handler'	=> 'onEmailClick'
                ],
                [
                    'xtype'     => 'button',
                    'glyph'     => Configure::read('icnDelete'),
                    'scale'     => 'large',
                    'itemId'    => 'delete',
                    'tooltip'   => __('Delete'),
					'handler'	=> 'onDeleteClick'
                ]     
            ]
        ];
        
        $this->set(array(
            'items' => $menu,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
    
    private function _test_email($email){
    
        //Do some validity test for email
        $pieces = explode("@", $email);
        $domain = $pieces[1]; 
        if(!checkdnsrr($domain)){
            $this->set(array(
                'errors'    => ['email' => "Domain $domain is not valid"],
                'success'   => false,
                'message'   => "Domain $domain is not valid",
                '_serialize' => array('errors','success','message')
            ));
            return false;
        }     
        return true;  
    }
    
    
    private function _add_access_provider(){
    
        $check_items = array(
			'notif_threshold'
		);
        foreach($check_items as $i){
            if(isset($this->request->data[$i])){
                $this->request->data[$i] = 1;
            }else{
                $this->request->data[$i] = 0;
            }
        }    
        //These are hardcoded hacks
        $this->request->data['language_id'] = 4;
        $this->request->data['country_id']  = 4;
        $this->request->data['parent_id']   = 44;
        $this->request->data['group_id']    = 9;
        $this->request->data['token']       = '';
        $this->request->data['username']    = $this->request->data['rusername'];
        $this->request->data['password']    = $this->request->data['rpassword'];
 
        //The rest of the attributes should be same as the form..
        $entity = $this->{'Users'}->newEntity($this->request->data()); 
        if($this->{'Users'}->save($entity)){
			$new_id = $entity->id; // The new id
			// Now set the notification threshold and frequency
            //$this->UserSettings->deleteAll(['user_id' => $new_id,'name' => 'notif_threshold']);
			$us_entity = $this->UserSettings->newEntity();
			$us_entity->user_id    = $new_id;
			$us_entity->name       = 'notif_threshold';
			//$us_entity->value      = $this->request->data['notif_threshold'];
			$us_entity->value      = 0;
			$this->UserSettings->save($us_entity);
			$us_entity = $this->UserSettings->newEntity();
			$us_entity->user_id    = $new_id;
			$us_entity->name       = 'notif_frequency';
			//$us_entity->value      = $this->request->data['notif_frequency'];
			$us_entity->value      = 1;
			$this->UserSettings->save($us_entity);
        }else{
            $message = 'Error';
            $errors = $entity->errors();
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
                'message'   => array('message' => __('Could not create item')),
                '_serialize' => array('errors','success','message')
            ));
        }      
    }
    
}
