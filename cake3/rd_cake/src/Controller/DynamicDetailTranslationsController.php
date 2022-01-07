<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 03/09/2018
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;

class DynamicDetailTranslationsController extends AppController {

    public $base            = "Access Providers/Controllers/DynamicDetailTranslations/";
    protected $owner_tree   = [];
    protected $main_model   = 'DynamicDetailTranslations';
    
    protected $tweak_checks = [  
        'facebook_login',   'twitter_login',    'linkedin_login',   'apple_login',  'google_login', 'microsoft_login',
        'share_after_FB_login', 'slideshow_random', 'no_splash',    'no_welcome',   'show_policy',  'only_email_registration',
        'email_registration_add_suffix',    'connect_with_registered',  'email_and_password',   'password_only' 
    ];
    
    protected $tweak_texts = [
        'ssid',     'wifi_caption', 'usage_mb', 'usage_time', 
        'FB_app_id',    'FB_page_to_share',
        'infobar_colour',   'wifi_caption_colour',  'background_colour1', 'background_colour2', 'background_colour3', 
    ];
    
    public function dummy(){
        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);    
    }

    public function initialize(){
        parent::initialize();
        $this->loadComponent('Aa');
        
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'DynamicDetails'
        ]);
        
        $this->loadModel('DynamicDetailTranslations');
        $this->loadModel('DynamicDetailLanguages');
        $this->loadModel('DynamicDetailTransKeys'); 
        $this->loadModel('DynamicDetails');
        $this->loadModel('DynamicPhotoTranslations');
        $this->loadModel('Users');
        $this->loadModel('DynamicPairs');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }
   
    public function getPnlContent(){
    
        $data    = [];
        $body_p  = 10;  
        $w_prim  = 550;
        $w_sec   = 350;
        $w_chk   = 200;
        $labelWidth = 150;
        
        
        $pnlFbOptions = [
            'xtype'     => 'panel',
            'disabled'  => true,
            'bodyStyle' => 'background: #e0ebeb',
            'itemId'    => 'pnlFbOptions',
            'items'     => [     
                [
		            'xtype'     => 'checkbox',
		            'fieldLabel'=> 'Share After FB Login',
		            'name'      => "share_after_FB_login",
		            'width'     => $w_prim,
		            'itemId'    => 'chkShareFbAfterLogin'
	            ],
	            [
		            'xtype'     => 'textfield',
		            'fieldLabel'=> 'FB App ID',
		            'name'      => "FB_app_id",
		            'allowBlank'=> false,
		            'disabled'  => true,
		            'blankText' => 'Supply A Value',
		            'width'     => $w_prim,
		            'itemId'    => 'txtFbAppId'
	            ],
	            [
		            'xtype'     => 'textfield',
		            'fieldLabel'=> 'FB Page To Share',
		            'name'      => "FB_page_to_share",
		            'allowBlank'=> false,
		            'disabled'  => true,
		            'blankText' => 'Supply A Value',
		            'width'     => $w_prim,
		            'itemId'    => 'txtFbPageToShare'
	            ]  
            ]            
        ];
              
        $pnlColors = [
            'xtype'       => 'panel',
            'bodyStyle'   => 'background: #e0ebeb',
            'items'   => [
                [
                    'xtype'         => 'rdColorfield',
                    'fieldLabel'    => 'Infobar Colour',
                    'width'         =>  $w_prim,
                    'name'          => 'infobar_colour'
                ],
                [
                    'xtype'         => 'rdColorfield',
                    'fieldLabel'    => 'WiFi Caption Colour',
                    'width'         =>  $w_prim,
                    'name'          => 'wifi_caption_colour'
                ],
                [
                    'xtype'         => 'rdColorfield',
                    'fieldLabel'    => 'Background 1',
                    'width'         =>  $w_prim,
                    'name'          => 'background_colour1'
                ],
                [
                    'xtype'         => 'rdColorfield',
                    'fieldLabel'    => 'Background 2',
                    'width'         =>  $w_prim,
                    'name'          => 'background_colour2'
                ],
                [
                    'xtype'         => 'rdColorfield',
                    'fieldLabel'    => 'Background 3',
                    'width'         =>  $w_prim,
                    'name'          => 'background_colour3'
                ]
            ]
        ];
        
        $cntTop  = [
            'xtype' => 'container',
            'items' => [                              
                [
			        'xtype'       => 'textfield',
			        'fieldLabel'  => 'SSID',
			        'name'        => "ssid",
			        'allowBlank'  => false,
			        'blankText'   => 'Supply A_value',
			        'width'       => $w_prim
		        ],
		        [
			        'xtype'       => 'textfield',
			        'fieldLabel'  => 'WiFi Caption',
			        'name'        => "wifi_caption",
			        'allowBlank'  => false,
			        'blankText'   => 'Supply A_value',
			        'width'       => $w_prim
		        ],  
		        [
			        'xtype'       => 'textfield',
			        'fieldLabel'  => 'Data Usage',
			        'name'        => 'usage_mb',
			        'allowBlank'  => true,
			        'width'       => $w_prim,
			        'labelClsExtra' => 'lblRd'
		        ],
		        [
			        'xtype'       => 'textfield',
			        'fieldLabel'  => 'Time Usage',
			        'name'        => 'usage_time',
			        'allowBlank'  => true,
			        'width'       => $w_prim,
			        'labelClsExtra' => 'lblRd'
		        ],
		        [
                    'xtype'       => 'checkboxgroup',
                    'vertical'    => false,
                    'fieldLabel'  => 'Options',
                    'labelWidth'  => $labelWidth,
                    'columns'     => 2,
                    'vertical'    => false,
                    'items'       => [
                        [ 
				            'boxLabel'  => 'Random Slideshow',
				            'name'      => 'slideshow_random',
				            'width'     => $w_chk
			            ],
                        [ 
                            'boxLabel'  => 'No Splash Page', 
                            'name'      => 'no_splash',
                            'width'     => $w_chk
                        ],
                        [ 
                            'boxLabel'  => 'No Welcome Page', 
                            'name'      => 'no_welcome',
                            'width'     => $w_chk
                        ],
                        [ 
                            'boxLabel'  => 'Show Policy', 
                            'name'      => 'show_policy',
                            'width'     => $w_chk
                        ],
                        [ 
				            'boxLabel'  => 'Only Email Registartion',
				            'name'      => 'only_email_registration',
				            'width'     => $w_chk
			            ],
                        [ 
                            'boxLabel'  => 'Email Registration And Suffix', 
                            'name'      => 'email_registration_add_suffix',
                            'width'     => $w_chk
                        ], 
                        [ 
				            'boxLabel'  => 'Connect With Registered',
				            'name'      => 'connect_with_registered',
				            'width'     => $w_chk
			            ],
                        [ 
                            'boxLabel'  => 'Email And Password', 
                            'name'      => 'email_and_password',
                            'width'     => $w_chk
                        ],         
                        [ 
				            'boxLabel'  => 'Password Only',
				            'name'      => 'password_only',
				            'width'     => $w_chk
			            ]
                    ]
                ],                
                $pnlColors
            ]
        ];       
        
        
        $pnl_gen = [
            'xtype' => 'panel',
            'title' => 'General',
            'glyph' => Configure::read('icnGears'), 
            'ui'    => 'panel-blue',
            'layout'=> 'fit',
            'bodyPadding' => $body_p,
            'items' => $cntTop
        ];
        
        $pnlLang = [
            'xtype' => 'panel',
            'title' => 'Supported Languages',
            'glyph' => Configure::read('icnGlobe'), 
            'ui'    => 'panel-green',
            'layout'=> [
              'type'    => 'vbox',
              'align'   => 'start',
              'pack'    => 'start'
            ],
            'bodyPadding'   => $body_p,
            'items' => [
                [
                    'fieldLabel'      => 'Default Language',
                    'xtype'           => 'cmbDynamicLanguages',
                    'labelClsExtra'   => 'lblRdReq',
                    'width'           => $w_prim
                ],       
                [
                    'xtype'     => 'tagDynamicLanguages',
                    'width'     => $w_prim
                ],
                [
                    'xtype'     => 'button',
                    'text'      => 'Translations',
                    'glyph'     => Configure::read('icnGlobe'),
                    'scale'     => 'small',
                    'ui'        => 'button-orange',
                    'width'     => $w_prim,
                    'itemId'    =>'translate',
                    'margin'    => 12
                ]
            ]
        ];
        
        $pnlSocial = [
            'xtype' => 'panel',
            'title' => 'Social Login (OAuth)',
            'glyph' => Configure::read('icnFacebook'), 
            'ui'    => 'panel-green',
            'layout'=> [
              'type'    => 'vbox',
              'align'   => 'start',
              'pack'    => 'start'
            ],
            'bodyPadding'   => $body_p,
            'items' => [
                [
                    'xtype'     => 'checkboxgroup',
                    'vertical'  => false,
                    'columns'   => 2,
                    'vertical'  => false,
                    'items' => [
                        [ 
                            'boxLabel'  => '<span style="font-family:FontAwesome;">&#xf09a;</span> Facebook', 
                            'name'      => 'facebook_login',
                            'width'     => $w_sec,
                            'itemId'    => 'chkFacebookLogin'
                        ],
                        [ 
                            'boxLabel'  => '<span style="font-family:FontAwesome;">&#xf099;</span> Twitter', 
                            'name'      => 'twitter_login',
                            'width'     => $w_sec
                        ], 
                        [ 
                            'boxLabel'  => '<span style="font-family:FontAwesome;">&#xf0e1;</span> LinkedIn',
                            'name'      => 'linkedin_login',
                            'width'     => $w_sec
                        ],
                        [ 
                            'boxLabel'  => '<span style="font-family:FontAwesome;">&#xf179;</span> Apple',
                            'name'      => 'apple_login',
                            'width'     => $w_sec
                        ],
                        [ 
                            'boxLabel'  => '<span style="font-family:FontAwesome;">&#xf1a0;</span> Google',
                            'name'      => 'google_login',
                            'width'     => $w_sec
                        ],
                        [ 
                            'boxLabel'  => '<span style="font-family:FontAwesome;">&#xf17a;</span> Microsoft',
                            'name'      => 'microsoft_login',
                            'width'     => $w_sec
                        ]    
                    ]
                ],
                 $pnlFbOptions
            ]
        ];

        $this->set([
            'data' => [$pnl_gen,$pnlLang,$pnlSocial],
            'success' => true,
            '_serialize' => ['data', 'success']
        ]); 
    }
   
    
    public function getTranslations(){
    
        $dd_id  = $this->request->getQuery('dynamic_detail_id');   
        $items  = [];
        
        $temp_table = [];
        
        //First one is global (-1)
        $query  = $this->{$this->main_model}->find()
                    ->contain(['DynamicDetailTransKeys','DynamicDetailLanguages'])
                    ->where(['DynamicDetailTransKeys.dynamic_detail_id' => -1])
                    ->order(['DynamicDetailTransKeys.name']);
        $q_r    = $query->all();
        foreach ($q_r as $i) {
            $value = $i->value;
            $key = $i->dynamic_detail_trans_key->name;
            $iso = $i->dynamic_detail_language->iso_code;
            $temp_table[$key."_".$iso] = $value;
        }
        
        //Override if not global   
        if($dd_id != -1){
            $query  = $this->{$this->main_model}->find()
                        ->contain(['DynamicDetailTransKeys','DynamicDetailLanguages'])
                        ->where(['DynamicDetailTransKeys.dynamic_detail_id' => $dd_id])
                        ->order(['DynamicDetailTransKeys.name']);
            $q_r    = $query->all();
            foreach ($q_r as $i) {
                $value = $i->value;
                $key = $i->dynamic_detail_trans_key->name;
                $iso = $i->dynamic_detail_language->iso_code;
                $temp_table[$key."_".$iso] = $value;
            }
        }

        foreach (array_keys($temp_table) as $key) {
            array_push($items, ['name'  =>  $key,'value'    =>  $temp_table[$key]]);
        }
          
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }

    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
        $dd_id      = $this->request->getQuery('dynamic_detail_id');   
        $query      = $this->{$this->main_model}->find()->contain(['DynamicDetailTransKeys','DynamicDetailLanguages'])->where(['DynamicDetailTransKeys.dynamic_detail_id' => $dd_id])->order(['DynamicDetailTransKeys.name']);
        $q_r        = $query->all();
        $items      = [];
        foreach ($q_r as $i) {           
            $row        = [];
            $fields     = $this->{$this->main_model}->schema()->columns();
            $key        = $i->dynamic_detail_trans_key->name;
            $language   = $i->dynamic_detail_language->name;
            $row['key']         = $key;
            $row['language']    = $language;
            $row['dynamic_detail_id'] = $i->dynamic_detail_trans_key->dynamic_detail_id;
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};        
                if($field == 'created'){
                    $row['created_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }
                if($field == 'modified'){
                    $row['modified_in_words'] = $this->TimeCalculations->time_elapsed_string($i->{"$field"});
                }   
            }           
            array_push($items, $row);
        }
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items', 'success')
        ));
    }
      
    public function languagesList(){  
        $q = $this->{'DynamicDetailLanguages'}->find()->order(['DynamicDetailLanguages.name'])->all();
        $items = [];
        foreach($q as $i){
            array_push($items, $i);
        }
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }
    
    public function pagesList(){
    
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
        $user_id    = $user['id'];
        
        //Fields
		$fields  = ['id','name'];
		
        $query = $this->{'DynamicDetails'}->find();
        $this->CommonQuery->build_common_query($query,$user,['Users']);
        $query->order(['DynamicDetails.name']);
        $q_r   = $query->all();   
        $items = [];
        
        if($this->Aa->admin_check($this)){   //Only for admin users!
            array_push($items,['id' => -1, 'name' => '**COMMON TO ALL**']);
        } 
               
        foreach($q_r as $i){         
            $row = [];
            foreach($fields as $field){
                $row["$field"]= $i->{"$field"};
            }
            array_push($items,$row);
        }
        $this->set(array(
            'items'         => $items,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }
     
    public function keysList(){ 
        $dd_id  = $this->request->getQuery('dynamic_detail_id');
        $q      = $this->{'DynamicDetailTransKeys'}->find()->where(['dynamic_detail_id' => $dd_id])->order(['DynamicDetailTransKeys.name'])->all();
        $items  = [];
        foreach($q as $i){
            array_push($items, $i);
        }
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    } 
    
    public function addLanguage(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
        
        $languageEntity = $this->{'DynamicDetailLanguages'}->newEntity($this->request->getData());
        if ($this->{'DynamicDetailLanguages'}->save($languageEntity)) {
            $this->set(array(
                'id'        => $languageEntity->id,
                'success'   => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could Not Create Item');
            $this->JsonErrors->entityErros($languageEntity,$message);
        }   
    }
    
    public function editLanguage(){
    
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
        $entity = $this->{'DynamicDetailLanguages'}->get($this->request->data['id']);
        $this->{'DynamicDetailLanguages'}->patchEntity($entity, $this->request->data());
        if ($this->{'DynamicDetailLanguages'}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }  
    }
    
    public function delLanguage(){
        if(!$this->request->is('post')){
			throw new MethodNotAllowedException();
		}   
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }        
        $entity    = $this->{'DynamicDetailLanguages'}->get($this->request->data['id']);
        $this->{'DynamicDetailLanguages'}->delete($entity);      
        $this->set([
            'success'       => true,
            '_serialize'    => ['success']
        ]);       
    }
    
    public function addKey(){
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        $keyEntity = $this->{'DynamicDetailTransKeys'}->newEntity($this->request->getData());
        if ($this->{'DynamicDetailTransKeys'}->save($keyEntity)) {
            $this->set(array(
                'id'        => $keyEntity->id,
                'success'   => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could Not Create Item');
            $this->JsonErrors->entityErros($keyEntity,$message);
        }       
    }
    
    public function editKey(){
    
        if(!$this->request->is('post')){
			throw new MethodNotAllowedException();
		}
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }    
        $entity = $this->{'DynamicDetailTransKeys'}->get($this->request->data['id']);
        $this->{'DynamicDetailTransKeys'}->patchEntity($entity, $this->request->data());
        if ($this->{'DynamicDetailTransKeys'}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }       
    }
    
    public function delKey(){
    
        if(!$this->request->is('post')){
			throw new MethodNotAllowedException();
		}
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        
        $entity    = $this->{'DynamicDetailTransKeys'}->get($this->request->data['id']);
        $this->{'DynamicDetailTransKeys'}->delete($entity);      
        $this->set([
            'success'       => true,
            '_serialize'    => ['success']
        ]);      
    }
    
    public function addPhrase(){
  
        if(!$this->request->is('post')){
			throw new MethodNotAllowedException();
		}
		
		$user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
		
		$ent = $this->{'DynamicDetailTranslations'}->newEntity($this->request->getData());		  
        if ($this->{'DynamicDetailTranslations'}->save($ent)) {
            $this->set(array(
                'id'        => $ent->id,
                'success'   => true,
                '_serialize' => array('success')
            ));
        }else {
            $message = 'Error';
            $this->set(array(
                'errors' => $this->JsonErrors->entityErros($ent, $message),
                'success' => false,
                '_serialize' => array('errors','success')
            ));
        }           
    }
    
    public function delPhrase(){
    
        if(!$this->request->is('post')){
			throw new MethodNotAllowedException();
		}
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        
        $fail_flag = false;
	    if(isset($this->request->data['id'])){   //Single item delete
            $message = "Single item ".$this->request->data['id'];        
            $entity  = $this->{'DynamicDetailTranslations'}->get($this->request->data['id']);   
            $this->{'DynamicDetailTranslations'}->delete($entity);
   
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity     = $this->{'DynamicDetailTranslations'}->get($d['id']);  
                $owner_id   = $entity->user_id;
                $this->{'DynamicDetailTranslations'}->delete($entity);
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
    
    public function existingCheck(){
    
        $dd_l_id    = $this->request->getQuery('dynamic_detail_language_id');
        $dd_t_k_id  = $this->request->getQuery('dynamic_detail_trans_key_id'); 
        
        $ent = $this->{'DynamicDetailTranslations'}->find()->where(['dynamic_detail_language_id' => $dd_l_id,'dynamic_detail_trans_key_id' => $dd_t_k_id ])->first();
        
        if($ent){
            $data = $ent;   
            $this->set([
                'data'      => $data,
                'success'   => true,
                '_serialize' => ['success','data']
            ]); 
        
        }else{
      
            $this->set([
                'success' => false,
                '_serialize' => ['success']
            ]);
        }      
    }
    
    public function viewTweaks(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        $dd_id      = $this->request->getQuery('dynamic_detail_id');  
        $ent_list   = $this->{'DynamicPairs'}->find()->where(['DynamicPairs.dynamic_detail_id' => $dd_id])->all();
        $data       = [];
        
        
        //---- CHECKS ----
        //Set ALL the checks to 0 by default
        foreach($this->tweak_checks as $chk){
            $data[$chk] = 0; 
        }
        
        $avail_lang_iso_list = [];
            
        foreach($ent_list as $ent){
            $name = $ent->name;            
            //First we do the checks
            if(in_array($name,$this->tweak_checks)){
                $data[$name] = $ent->value;
            }
            
            //Now the strings
            if(in_array($name,$this->tweak_texts)){
                $data[$name] = $ent->value;
            }
            
            //Languages is different
            if($name == 'default_lang'){
                $data['dynamic_detail_language_id'] = $this->_get_lang_from_iso($ent->value);
            }
            
            if(preg_match('/^lang_\w{2}$/',$name)){
                if($ent->value == "1"){
                    $iso = preg_replace('/^lang_/', '', $name);
                    $lang_id = $this->_get_lang_from_iso($iso);
                    if($lang_id){
                        array_push($avail_lang_iso_list,$lang_id);
                    }
                }
            }                     
        }
        $data['available_languages[]'] = $avail_lang_iso_list; 
            
        $this->set([
            'data'      => $data,
            'success'   => true,
            '_serialize' => ['success','data']
        ]);     
    }
       
    public function saveTweaks(){
    
        if(!$this->request->is('post')){
			throw new MethodNotAllowedException();
		}
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        $dd_id      = $this->request->getData('dynamic_detail_id');
        $post_data  = $this->request->getData();
        $ent_list   = $this->{'DynamicPairs'}->find()->where(['DynamicPairs.dynamic_detail_id' => $dd_id])->all();
        $data       = [];
        
        //Set ALL the checks to FALSE by default
        foreach($this->tweak_checks as $chk){
            if(isset($post_data[$chk])){
                //--ADD OR SET TO "1"
                $this->_add_or_edit_piar($dd_id,$chk,"1");
            }else{
                //--ADD OR SET TO "0"
                $this->_add_or_edit_piar($dd_id,$chk,"0");
            }
        }
                     
        foreach(array_keys($post_data) as $post_item){
            if(in_array($post_item,$this->tweak_texts)){
                //IF value is empty -> Remove item
                if($post_data[$post_item] == ''){
                    $this->_remove_pair_item($dd_id,$post_item);
                }else{
                    //IF $post_item contains the word *colour* and the value is a colur value; add a '#' to the value
                    $value = $post_data[$post_item];
                    //must be a color and contain '_colour' in the name
                    if((preg_match('/([[:xdigit:]]{3}){1,2}\b/',$value))&&(preg_match('/_colour/',$post_item))){ 
                        $value = '#'.$value; //Add a # symbol for the color items
                    }                       
                    $this->_add_or_edit_piar($dd_id,$post_item,$value);
                }
            }   
        }
        
        //Set all the languages to zero (it is specified as lang_<iso code> = 1)
        foreach($ent_list as $entity){
            if(preg_match('/^lang_\w{2}$/',$entity->name)){
                $this->{'DynamicPairs'}->patchEntity($entity, ['value' => "0"]);
                $this->{'DynamicPairs'}->save($entity);
            }
        }
        
        $default_l      = $this->request->getData('dynamic_detail_language_id');
        $found_default  = false;
        $default_iso_code = '';
        
        if (array_key_exists('available_languages', $this->request->data)) {                   
            foreach($this->request->data['available_languages']as $lang_id){
                if($lang_id !== 'Just The Default Language'){         
                    $ent_lang = $this->{'DynamicDetailLanguages'}->find()->where(['id' => $lang_id])->first();
                    if($ent_lang){
                        $l = 'lang_'.$ent_lang->iso_code;
                        if($ent_lang->id == $default_l){
                            $found_default = true;
                            $default_iso_code = $ent_lang->iso_code;
                        }
                        $this->_add_or_edit_piar($dd_id,$l,'1');
                    }
                }
            }
            if(!$found_default){
                $ent_default = $this->{'DynamicDetailLanguages'}->find()->where(['id' => $default_l])->first();
                if($ent_default){
                    $l = 'lang_'.$ent_default->iso_code;
                    $default_iso_code = $ent_default->iso_code;
                    $this->_add_or_edit_piar($dd_id,$l,'1');
                }   
            }                       
        }
        //default_iso_code should by now be set
        $this->_add_or_edit_piar($dd_id,'default_lang',$default_iso_code); 
                            
        $this->set([
            'success'   => true,
            '_serialize' => ['success']
        ]);     
    }
    
    public function viewPhotoTranslation(){
         $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
                
        $data       = [];
        $data['title'] = '';
        $data['description'] = ''; //To clear previous entries
        $data['id'] = ''; //To clear previous entries
        $dd_l_id    = $this->request->getQuery('dynamic_detail_language_id');
        $d_p_id     = $this->request->getQuery('dynamic_photo_id');
        
        if($dd_l_id !== ''){  
            $qr = $this->{'DynamicPhotoTranslations'}->find()
                ->where(['dynamic_detail_language_id'=>$dd_l_id,'dynamic_photo_id'=>$d_p_id])
                ->first();
            if($qr){            
                $data = $qr;
            }
        } 
         
        $this->set([
            'data'      => $data,
            'success'   => true,
            '_serialize' => ['success','data']
        ]);  
    }
    
    public function savePhotoTranslation(){
    
        if(!$this->request->is('post')){
			throw new MethodNotAllowedException();
		}
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        
        $post_data  = $this->request->getData();
        $entity     = false;
        
        if($post_data['id'] == ''){
            //New entry
            unset($post_data['id']);
            $entity = $this->{'DynamicPhotoTranslations'}->newEntity($post_data);
        }else{
            $entity   = $this->{'DynamicPhotoTranslations'}->find()
                ->where(['id' => $post_data['id']])
                ->first();         
            if($entity){
                //Check for delete flag
                if(isset($post_data['delete_translation'])){ 
                    //Delete and return           
                    $this->{'DynamicPhotoTranslations'}->delete($entity);
                    $this->set(array(
                        'success' => true,
                        '_serialize' => array('success')
                    ));
                    return;
                }else{                         
                    $this->{'DynamicPhotoTranslations'}->patchEntity($entity,$post_data);
                }
            }        
        }
        
        if($entity){
             
            if ($this->{'DynamicPhotoTranslations'}->save($entity)) {
                $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            } else {
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($entity,$message);
            }
        }else{
            $this->set([
                'success' => false,
                '_serialize' => array('success')
            ]);
        }
    }
    
    private function _add_or_edit_piar($dd_id,$name,$value){

        $entity   = $this->{'DynamicPairs'}->find()
            ->where(['DynamicPairs.dynamic_detail_id' => $dd_id,'DynamicPairs.name' => $name])
            ->first();
        if($entity){
            $this->{'DynamicPairs'}->patchEntity($entity, ['value' => $value]);
        }else{    
            $entity = $this->{'DynamicPairs'}->newEntity(['dynamic_detail_id' =>$dd_id,'name' =>$name,'value' =>$value]);
        }
        
        if ($this->{'DynamicPairs'}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
    }
    
    private function _remove_pair_item($dd_id,$name){ 
        $entity   = $this->{'DynamicPairs'}->find()
            ->where(['DynamicPairs.dynamic_detail_id' => $dd_id,'DynamicPairs.name' => $name])
            ->first();
        if($entity){    
            $this->{'DynamicPairs'}->delete($entity);
        }
    }
    
    private function _get_lang_from_iso($iso_code){
        $id = null;
         $entity   = $this->{'DynamicDetailLanguages'}->find()
            ->where(['DynamicDetailLanguages.iso_code' => $iso_code])
            ->first();
        if($entity){
            $id = $entity->id;
        }    
        return $id;
    }   
}
