<?php

//Call this the following way (every hour at 11 mins after the hour)
// 11  *    *    *    * cd /var/www/html/cake3/rd_cake && bin/cake send_notification_emails

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Datasource\ConnectionManager;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Mailer\Email;
use Cake\Http\Client;


class SendNotificationEmailShell extends Shell{

    public function main(){
		$http = new Client();

		// Simple get
		//$baseUrl = Configure::read('App.fullBaseUrl');
		//$response = $http->get(''.$baseUrl.'/cake3/rd_cake/notification-lists/send_notifications.json');
		//print_r($response->body);
		
		$baseUrl = Configure::read('App.fullBaseUrl');
		$response = $http->get(''.$baseUrl.'/cake3/rd_cake/alerts/send_notifications.json');
		print_r($response->body);
		
	}
/*
    public function initialize(){
        $this->loadModel('Users');
        $this->loadModel('UserSettings');
        $this->loadModel('ViewNotifications'); 
        $this->loadModel('Meshes'); 
        $this->loadModel('ApProfiles'); 
        $this->loadModel('Nodes'); 
        $this->loadModel('Aps');
        $this->loadModel('NodeUptmHistories');
        $this->loadModel('ApUptmHistories');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'ViewNotifications'
        ]);
                
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
	}
	
    public function main(){
        // First, Update the used MACs
		$query      = 	$this->Users->find()->where(['Users.email <>' => '']);
		$query	->contain([
					"UserSettings" => function ($q) {
						return $q->where(["name" => "notif_threshold"]);
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
			$u_notifications = $this->ViewNotifications->find()->where(['severity < ' => $user_severity_threshold]);
			$this->CommonQuery->build_common_query($u_notifications,$user,[],'ViewNotifications',true,'parent_name');
			$total  = $u_notifications->count();
 			$q_r  = $u_notifications->all();
			foreach ($q_r as $row) {
				if($row['object_type'] == 'nodes'){
					array_push($nd_rows,$row);
				}
				if($row['object_type'] == 'aps'){
					array_push($ap_rows,$row);
				}
				array_push($items,$row);
			}
			// testing
			print_r("hour match:".$hour_match." date_hour:".(int)$date_hour);
			if($hour_match == 0){
				$user_email = 'system@radiusdesk.com';
				$to = str_replace(";",",",$user_email);
				$to_array = explode(",",$to);
				$u_total = count($nd_rows)+count($ap_rows);
				if($u_total != 0){
				  $email = new Email([
					'transport'   =>  'sendgrid',
					'template'    =>  'notification_alerts',
					'emailFormat' =>  'html',
					'from'        =>  'system@radiusdesk.com',
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
	*/
}
?>
