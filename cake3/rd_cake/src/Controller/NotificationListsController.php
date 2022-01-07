<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Hash;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

use Cake\Mailer\Email;

use Cake\Datasource\ConnectionManager;

class NotificationListsController extends AppController{
  
    public $base         = "Access Providers/Controllers/NotificationLists/";   
    protected $owner_tree   = array();
    protected $main_model   = 'ViewNotifications';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Users');
        $this->loadModel('UserSettings');
        $this->loadModel('ViewNotifications'); 
        $this->loadModel('Meshes'); 
        $this->loadModel('ApProfiles'); 
        $this->loadModel('Nodes'); 
        $this->loadModel('Aps');
        $this->loadModel('NodeUptmHistories');
        $this->loadModel('ApUptmHistories');
        //$this->loadModel('OpenvpnClients');
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'ViewNotifications',
            'sort_by' => 'ViewNotifications.notification_datetime'
        ]);
                
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');        
    }

	public function sendNotifications(){
		
		$query      = 	$this->Users->find()->where(['Users.email <>' => '']);
		$query	->contain([
					"UserSettings" => function ($q) {
						return $q->where(["name" => "notif_threshold","value" => 1]);
					}
		]);								 
				//->matching("UserSettings", function($q){
				//	return $q->where(["UserSettings.name" => "notif_threshold"]);
				//})
		$total = 0;
        $q_r = $query->all();
		$items = [];
		foreach ($q_r as $user) {
			$user_id    = $user['id'];
			$user_email = $user['email'];
			$access_user = [];
			$access_user['id'] = $user_id;
			if($user['group_id'] == 8) {
				$access_user['group_name'] = 'Administrators';
			} else {
				$access_user['group_name'] = 'Access Providers';
			}
			$access_user['group_id'] = $user['group_id'];
			$access_user['monitor']  = $user['monitor'];
			
			//print_r($access_user);
			if(count($user->user_settings) != 0){
				$user_severity_threshold = 0; //default to no notifications
				if(intval($user->user_settings[0]['value']) > 0 ){
					$user_severity_threshold = 5;
				}
				$freq = 1;
				$q_freq = $this->UserSettings->find()->where(['UserSettings.user_id' => $user_id,"UserSettings.name" => "notif_frequency"])->first();
				if($q_freq) {
					$freq = $q_freq->value;
				}
				$date_str = date("Y-m-d H:i:s");
				$date_hour = date("h");
				$hour_match = (int)$date_hour%$freq;
				$nd_rows = [];
				$ap_rows = [];
				$u_notifications = $this->ViewNotifications->find()->where(['severity < ' => $user_severity_threshold,
																		'(is_resolved = 0 OR (is_resolved = 1 AND ViewNotifications.modified > DATE_ADD(now(), INTERVAL -1 day)))']);
				$this->CommonQuery->build_common_query($u_notifications,$access_user,['Users']);
				//debug($u_notifications);
				$total  = $u_notifications->count();
				$u_notifications_r  = $u_notifications->all();
				foreach ($u_notifications_r as $row) {
					
					if($row['object_type'] == 'nodes'){
						array_push($nd_rows,$row);
					}
					if($row['object_type'] == 'aps'){
						array_push($ap_rows,$row);
					}
					array_push($items,$row);
				}
				// testing
				//print_r("hour match:".$hour_match." date_hour:".(int)$date_hour);
				if($hour_match == 0){
					//$user_email = $user_email.';
					$to = str_replace(";",",",$user_email);
					$to_array = explode(",",$to);
					$u_total = count($nd_rows)+count($ap_rows);
					if($u_total != 0){
					  $email = new Email([
						'transport'   =>  'sendgrid',
						'template'    =>  'notification_alerts',
						'emailFormat' =>  'html',
						'from'        =>  'info@radiusdesk.com',
						'subject'     =>  'Alert: Devices Unreachable',
						'viewVars'    =>  ['nd_rows' => $nd_rows, 'ap_rows' => $ap_rows],
					  ]);
					  // Add the to's
					  foreach($to_array as $tod){
						$email->addTo($tod);
					  }
					  //$email->transport('sendgrid')
					  $email->send();
					}
				}
			}
        }


        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));

	}
	
    public function index(){
	
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
		//print_r($user);

        $user_id    = $user['id'];
		$mesh_lookup = array();

		$query      = $this->ViewNotifications->find();
		
        $this->CommonQuery->build_common_query($query,$user,['Users']);

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
		

        $items = [];

        foreach ($q_r as $i) {
			array_push($items,$i);
		}
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount')
        ));
			   
    }

    public function view(){
	
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
	}

    //----- Menus ------------------------
    public function menuForGrid(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        //Empty by default
        $menu = [];

        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin

            $menu = array(
                array('xtype' => 'buttongroup','title' => null, 'items' => array(
                    array(
                        'xtype'     =>  'splitbutton',
                        'glyph'     => Configure::read('icnReload'),
                        'scale'     => 'large',
                        'itemId'    => 'reload',
                        'tooltip'   => __('Reload'),
                        'ui'        => 'button-orange',
                        'menu'  => array(
                            'items' => array(
                                '<b class="menu-title">'.__('Reload every').':</b>',
                                array( 'text'  => __('30 seconds'),      'itemId'    => 'mnuRefresh30s', 'group' => 'refresh','checked' => false ),
                                array( 'text'  => __('1 minute'),        'itemId'    => 'mnuRefresh1m', 'group' => 'refresh' ,'checked' => false),
                                array( 'text'  => __('5 minutes'),       'itemId'    => 'mnuRefresh5m', 'group' => 'refresh', 'checked' => false ),
                                array( 'text'  => __('Stop auto reload'),'itemId'    => 'mnuRefreshCancel', 'group' => 'refresh', 'checked' => true )

                            )
                        )
                    ),
                    array('xtype' => 'button', 'ui'  => 'button-orange',   'glyph' => Configure::read('icnView'),'scale' => 'large', 'itemId' => 'view',     'tooltip'=> __('View')),
                ))
            );
        }

        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $action_group   = array();
            $specific_group = array();

            array_push($action_group,array(
                    'xtype'     =>  'splitbutton',
                    'glyph'     => Configure::read('icnReload'),
                    'scale'     => 'large',
                    'itemId'    => 'reload',
                    'tooltip'   => __('Reload'),
                    'ui'        => 'button-orange',
                    'menu'  => array(
                        'items' => array(
                            '<b class="menu-title">'.__('Reload every').':</b>',
                            array( 'text'  => __('30 seconds'),      'itemId'    => 'mnuRefresh30s', 'group' => 'refresh','checked' => false ),
                            array( 'text'  => __('1 minute'),        'itemId'    => 'mnuRefresh1m', 'group' => 'refresh' ,'checked' => false),
                            array( 'text'  => __('5 minutes'),       'itemId'    => 'mnuRefresh5m', 'group' => 'refresh', 'checked' => false ),
                            array( 'text'  => __('Stop auto reload'),'itemId'    => 'mnuRefreshCancel', 'group' => 'refresh', 'checked' => true )

                        )
                    )
                )
            );


            //View
            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->base.'view')){
                array_push($action_group,array(
                    'xtype'     => 'button',
                    'glyph'     => Configure::read('icnView'),
                    'scale'     => 'large',
                    'itemId'    => 'view',
                    'disabled'  => true,
                    'ui'        => 'button-orange',
                    'tooltip'   => __('View')));
                    
            }
            
            $menu = [
                [
                    'xtype' => 'buttongroup',
                    'title' => null,
                    'items' => $action_group
                ]
            ];
        }
        $this->set(array(
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => array('items','success')
        ));
    }
  
}
