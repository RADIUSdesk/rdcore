<?php

namespace App\Controller;

use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Datasource\ConnectionManager;
use \Datetime;
use \DateTimeZone;

class AnalyticsController extends AppController
{
  
    public $base  = "Analytics/Controllers/Analytics/";
    
    protected $owner_tree = array();
  
    public function initialize()
    {
        parent::initialize();
        $this->loadModel('Ssids');
        $this->loadModel('Users');
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'Ssids'
        ]);
    }
    
    function get_timezone_offset($remote_tz, $origin_tz = null)
    {
        if ($origin_tz === null) {
            if (!is_string($origin_tz = date_default_timezone_get())) {
                return false; // A UTC timestamp was returned -- bail out!
            }
        }
        $origin_dtz = new DateTimeZone($origin_tz);
        $remote_dtz = new DateTimeZone($remote_tz);
        $origin_dt = new DateTime("now", $origin_dtz);
        $remote_dt = new DateTime("now", $remote_dtz);
        $offset = ($origin_dtz->getOffset($origin_dt) - $remote_dtz->getOffset($remote_dt))/60/60;
        return $offset;
    }

     //____ BASIC CRUD Manager ________
    public function index()
    {

        //__ Authentication + Authorization __l
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];
 
        date_default_timezone_set("UTC");

        $connection = ConnectionManager::get('default');

        $now = date_create();

        $mysqlTimeZone = $connection->execute('SELECT @@system_time_zone as zone')->fetch('assoc')["zone"];

        $timediff =$this->get_timezone_offset("UTC", $mysqlTimeZone);

        $mysqlNow =date_create(date("Y-m-d 00:00:00"));
       
        $mysqlNow->add(date_interval_create_from_date_string(sprintf('%d hours', $timediff * -1)));


        $resultsMeshes = $connection->execute('select count(id) as apsTotal  from meshes')->fetch('assoc');

        $resultsApProfiles = $connection->execute('select count(id) as apsTotal  from ap_profiles')->fetch('assoc');

        $resultsNodes = $connection->execute('select count(id) as totalM FROM nodes')->fetch('assoc');

        $resultsAp = $connection->execute('select count(id) as apsTotal  from aps')->fetch('assoc');

        $resultsNodes = $connection->execute('select count(id) as totalM FROM nodes')->fetch('assoc');


        $resultsUnknownAP = $connection->execute('select count(id) as apsTotal  from unknown_aps')->fetch('assoc');

        $resultsUnKnownNodes = $connection->execute('select count(id) as totalM FROM unknown_nodes')->fetch('assoc');
       

        $hourago = date_create()->add(date_interval_create_from_date_string('-1 hour'));

        $resultsOfflineAP = $connection->execute("select * FROM aps where last_contact is null or last_contact <'".$hourago ->format('Y-m-d H:i:s')."'")->fetch('assoc');

        $resultsOfflineNodes = $connection->execute("select count(id) FROM nodes where last_contact is null or last_contact <'".$hourago->format('Y-m-d H:i:s')."'")->fetch('assoc');
        
        $resultsPermanentUsers= $connection->execute("select count(id) FROM permanent_users")->fetch('assoc');

        $resultsSocialUsers= $connection->execute("select count(id) FROM social_login_users")->fetch('assoc');

        $today = date_create();
        
        $last7Days = date_create()->add(date_interval_create_from_date_string('-7 days'));

        $now->add(date_interval_create_from_date_string('7 days'));

        $dataUsedTodayDown = $connection->execute("SELECT sum(acctinputoctets) as total FROM rd.user_stats where timestamp >= '".$mysqlNow->format('Y-m-d 00:00:00')."'")->fetch('assoc');

        $dataUsedTodayUp = $connection->execute("SELECT sum(acctoutputoctets) as total FROM rd.user_stats where timestamp >= '".$mysqlNow->format('Y-m-d 00:00:00')."'")->fetch('assoc');

        $dataUsed7daysPriorDown = $connection->execute("SELECT sum(acctinputoctets) as total  FROM rd.user_stats where timestamp < '".$today->format('Y-m-d H:i:s')."' and timestamp >= '".date_create()->add(date_interval_create_from_date_string('-7 days'))->format('Y-m-d H:i:s')."'" )->fetch('assoc');
        
        $dataUsed7daysPriorUp = $connection->execute("SELECT sum(acctoutputoctets) as total  FROM rd.user_stats where timestamp < '".$today->format('Y-m-d H:i:s')."' and timestamp >= '".date_create()->add(date_interval_create_from_date_string('-7 days'))->format('Y-m-d H:i:s')."'" )->fetch('assoc');
       
        $month = date('Y-m-01 00:00:00');
        $lastMonth = date("Y-m-d", strtotime("first day of last month"));
  
        $dataUsedThisMonthDown = $connection->execute("SELECT sum(acctinputoctets) as total FROM rd.user_stats where timestamp >= '".$month."'" )->fetch('assoc');

        $dataUsedThisMonthUp = $connection->execute("SELECT sum(acctoutputoctets) as total FROM rd.user_stats where timestamp >= '".$month."'" )->fetch('assoc');

        $dataUsedLastMonthDown = $connection->execute("SELECT sum(acctinputoctets) as total FROM rd.user_stats where timestamp < '".$month."' and timestamp >= '".$lastMonth ."'" )->fetch('assoc');

        $dataUsedLastMonthUp = $connection->execute("SELECT sum(acctoutputoctets) as total FROM rd.user_stats where timestamp < '".$month."' and timestamp >= '".$lastMonth ."'" )->fetch('assoc');


 
        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        $total  = 100;
   
        $items      = array();

          array_push($items, array(
                'totalMeshes'                 => $resultsMeshes? reset($resultsMeshes):0,
                'totalApProfiles'             => $resultsApProfiles?reset($resultsApProfiles):0,
                'totalAp'                     => $resultsAp?reset($resultsAp):0,
                'totalNodes'                  => $resultsNodes?reset($resultsNodes):0,
                'totalOfflineAP'              => $resultsOfflineAP?reset($resultsOfflineAP):0,
                'totalOfflineNodes'           => $resultsOfflineNodes?reset($resultsOfflineNodes):0,
                'totalUnknownAP'              => $resultsUnknownAP?reset($resultsUnknownAP):0,
                'totalUnknownNodes'           => $resultsUnKnownNodes?reset($resultsUnKnownNodes):0,
                'totalUsers'                  => $resultsPermanentUsers?reset($resultsPermanentUsers):0,
                'totalSocialUsers'            => $resultsSocialUsers?reset($resultsSocialUsers):0,
                'dataUsedTodayDown'           => $dataUsedTodayDown["total"] == null?0:$dataUsedTodayDown["total"],
                'dataUsed7daysPriorDown'      => $dataUsed7daysPriorDown["total"] == null?0:$dataUsed7daysPriorDown["total"],
                'dataUsedThisMonthDown'       => $dataUsedThisMonthDown["total"] == null?0:$dataUsedThisMonthDown["total"],
                'dataUsedTodayUp'             => $dataUsedTodayUp["total"] == null?0:$dataUsedTodayUp["total"],
                'dataUsed7daysPriorUp'        => $dataUsed7daysPriorUp["total"] == null?0:$dataUsed7daysPriorUp["total"],
                'dataUsedThisMonthUp'         => $dataUsedThisMonthUp["total"] == null?0:$dataUsedThisMonthUp["total"],
                'dataUsedLastMonthDown'       => $dataUsedLastMonthDown["total"] == null?0:$dataUsedLastMonthDown["total"],
                'dataUsedLastMonthUp'         => $dataUsedLastMonthUp["total"] == null?0:$dataUsedLastMonthUp["total"],
             
            ));
        
       
        //___ FINAL PART ___
        $this->set(array(
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => array('items','success','totalCount','test')
        ));
    }

    public function onlineUsers()
    {
        $startDate = $this->request->query['start'];
        $endDate = $this->request->query['end'];
       
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        $user_id    = $user['id'];

       
  
        $connection = ConnectionManager::get('default');
        $onlineUsers = $connection->execute("select CONCAT(DATE_FORMAT(timestamp, '%a'),' ',DAY(timestamp),' ',DATE_FORMAT(timestamp, '%b')) as Day,count(distinct(Username)) as Users,timestamp,(sum(acctinputoctets) + sum(acctoutputoctets)) as DataUsage,sum(acctinputoctets) as DataIn,sum(acctoutputoctets) as DataOut from user_stats where timestamp >= '".$startDate."' and timestamp <= '". $endDate ."'  group by  Day order by timestamp")->fetchAll('assoc');

       
    //___ FINAL PART ___
        $this->set(array(
        'items' => $onlineUsers,
        'success' => true,
        'totalCount' =>count($onlineUsers),
        '_serialize' => array('items','success','totalCount','test')
        ));
    }
}

