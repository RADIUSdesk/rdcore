<?php

namespace App\Controller;

class FreeRadiusController extends AppController {

    public $name                = 'PhpPhrases';
    public $base                = "Access Providers/Controllers/FreeRadius/"; //Required for AP Rights
    protected $radmin_wrapper   = '/var/www/html/cake3/rd_cake/setup/scripts/radmin_wrapper.pl';
    protected $radscenario      = '/var/www/html/cake3/rd_cake/setup/scripts/radscenario.pl';

    public function initialize()
    {
        parent::initialize();
        $this->loadComponent('Aa');
    }
    public function index(){
    //== AP + Root ==

        //First the auth
        $type = 'auth';
        exec("sudo " . $this->radmin_wrapper . " stats $type",$output_auth);

        $items = [];
        $items['auth_basic']  = [];
        $items['auth_detail'] = [];

        if (preg_match("/requests/i", $output_auth[0])) {
            foreach($output_auth as $i){
                $clean = trim($i);
                $clean = preg_replace("/\s+/", ";", $clean);
                $e = explode(';',$clean);
                
                //First the basics
                if(($e[0] == 'accepts') && (intval($e[1]) != 0)){
                    array_push($items['auth_basic'], ['name' => __("Accepted"), 'data' => intval($e[1])]);
                }
                if(($e[0] == 'rejects') && (intval($e[1]) != 0)){
                    array_push($items['auth_basic'], ['name' => __("Rejected"), 'data' => intval($e[1])]);
                }
                
                //Then the detail
                if(($e[0] == 'responses') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Responses"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'challenges') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Challenges"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'dup') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Duplicates"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'invalid') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Invalid"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'malformed') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Malformed"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'bad_signature') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Bad Signature"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'dropped') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Dropped"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'unknown_types') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Unknown types"), 'data' => intval($e[1])]);
                }
                
                if(($e[0] == 'bad_authenticator') && (intval($e[1]) != 0)){
                    array_push($items['auth_detail'], ['name' => __("Bad Authenticator"), 'data' => intval($e[1])]);
                }
            }
        }

        $type = 'acct';
        exec("sudo " . $this->radmin_wrapper . " stats $type",$output_acct);

        $items['acct_detail'] = [];

        if (preg_match("/requests/i", $output_acct[0])) {
            foreach($output_acct as $i){
                $clean = trim($i);
                $clean = preg_replace("/\s+/", ";", $clean);
                $e = explode(';',$clean);
              
                //Then the detail
                if(($e[0] == 'responses') && (intval($e[1]) != 0)){
                    array_push($items['acct_detail'], ['name' => __("Responses"), 'data' => intval($e[1])]);
                }
                if(($e[0] == 'dup') && (intval($e[1]) != 0)){
                    array_push($items['acct_detail'], ['name' => __("Duplicates"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'invalid') && (intval($e[1]) != 0)){
                    array_push($items['acct_detail'], ['name' => __("Invalid"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'malformed') && (intval($e[1]) != 0)){
                    array_push($items['acct_detail'], ['name' => __("Malformed"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'bad_signature') && (intval($e[1]) != 0)){
                    array_push($items['acct_detail'], ['name' => __("Bad Signature"), 'data' => intval($e[1])]);
                }

                if(($e[0] == 'dropped') && (intval($e[1]) != 0)){
                    array_push($items['acct_detail'], ['name' => __("Dropped"), 'data' => intval($e[1])]);
                }

                 if(($e[0] == 'unknown_types') && (intval($e[1]) != 0)){
                    array_push($items['acct_detail'], ['name' => __("Unknown types"), 'data' => intval($e[1])]);
                }
            }
        }

        $this->set([
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['success', 'items']
        ]);
    }

    public function status(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $pid = exec('pidof freeradius');
        $items = array();
        $items['pid'] = intval($pid);
        if($pid == ''){
            $items['running'] = false; 
        }else{
            $items['running'] = true; 
        }

        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }

    public function start(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        exec("sudo " . $this->radmin_wrapper . " start freeradius");
        $items = [];
        
        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }

    public function stop(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        exec("sudo " . $this->radmin_wrapper . " stop freeradius");
        $items = [];
        
        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }

    public function info(){
    
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items = [];

        exec("sudo " . $this->radmin_wrapper . " uptime freeradius",$output);
        if(count($output)>0){
            $uptime = $output[0];
            $items['uptime'] = $uptime;
        }else{
            $this->set([
                'success'       => false,
                '_serialize'    => ['success']
            ]);
            return;
        }
        
        unset($output);
        exec("sudo " . $this->radmin_wrapper . " version freeradius",$output);
        if(count($output)>0){
            $version = $output[0];
            $items['version'] = $version;
        }

        unset($output);
        exec("sudo " . $this->radmin_wrapper . " clients freeradius",$output);
        if(count($output)>0){
            $clients = [];
            $id = 1;
            foreach($output as $i){
                $t_val = trim($i, " \t.");
                array_push($clients, ['id' => $id, 'name' => $t_val]);
                $id++;
            }
            $items['clients'] = $clients;
        }
        
        unset($output);
        exec("sudo " . $this->radmin_wrapper . " modules freeradius",$output);
        if(count($output)>0){
            $modules = [];
            $id = 1;
            foreach($output as $i){
                $t_val = trim($i, " \t.");
                array_push($modules, ['id' => $id, 'name' => $t_val]);
                $id++;
            }
            $items['modules'] = $modules;
        }
         
        
        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }

    public function statusDebug(){
    //== Only Root ==
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items = [];
        exec("sudo " . $this->radmin_wrapper . " debug level",$output);
        if(count($output) > 0){
            $level = $output[0];
            $items['level'] = intval($level);
            if($items['level'] > 0){
                $this->loadModel('Checks');
                //Check for a timeout value (there should be one)
                //Check for existing ones
                $q_r        = $this->Checks->find(['Checks.name' => 'debug_timeout'])->where()->first();
                if($q_r){
                    $time_added = $q_r->value - time();
                    if($time_added > 0){
                        $items['time_added'] = $time_added;
                    }    
                }
            }
        }

        unset($output);
        exec("sudo " . $this->radmin_wrapper . " debug condition",$output);
        if(count($output)>0){
            $condition = $output[0];
            $items['condition'] = $condition;
        }      
        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }

    public function startDebug(){
    //== Only Root ==

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items = [];
        exec("sudo " . $this->radmin_wrapper . " debug start",$output);

        //Check for filters
        $cdata = $this->request->getQuery();

        if((isset($cdata['nas_id'])) && (null !== $this->request->getQuery('username'))){

            $this->loadModel('Nas');

            $q = $this->Nas->find()->where(['Nas.id' => $cdata['nas_id']])->first();
            $ip = $q->nasname;
            exec("sudo " . $this->radmin_wrapper . " debug condition '(Packet-Src-IP-Address == $ip)'",$output);
        }

        if(($cdata['username']) && (null !== $this->request->getQuery('nas_id'))){
            $username = $cdata['username'];
            exec("sudo " . $this->radmin_wrapper . " debug condition '(User-Name == $username)'",$output);
        }

        if((isset($this->request->query['username'])) && (isset($this->request->query['nas_id']))){

            $this->loadModel('Nas');

            $q = $this->Nas->find()->where(['Nas.id' => $cdata['nas_id']])->first();
            $ip = $q->nasname;

            $username = $cdata['username'];
            $condition = "((User-Name == $username) && (Packet-Src-IP-Address == $ip))";
            exec("sudo " . $this->radmin_wrapper . " debug condition '$condition'",$output);
        }

        //Start the timeout
        $this->loadModel('Checks');

        $d          = [];
        //Check for existing ones
        $q_r        = $this->Checks->find()->where(['Checks.name' => 'debug_timeout'])->first();

        if($q_r){
            $d['id'] = $q_r->id;
        }

        $timeout = time()+360;
        $d['name']  = 'debug_timeout';
        $d['value'] = $timeout;

        $checkEntity = $this->Checks->newEntity($d);

        $this->Checks->save($checkEntity);

        $items['timeout']   = $timeout;
        $items['time_added']= 360;
    
        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }

    public function stopDebug(){
    //== Only Root ==

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items = [];
        exec("sudo " . $this->radmin_wrapper . " debug stop",$output);

        //Clear the timeout
        $this->loadModel('Checks');

        $this->Checks->query()->delete()->where(['Checks.name' => 'debug_timeout'])->execute();

        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }

    public function timeDebug(){
    //== Only Root ==
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        $items = [];

        //Clear the timeout
        $this->loadModel('Checks');

        //Check for existing ones
        $q_r        = $this->Checks->find()->where(['Checks.name' => 'debug_timeout'])->first();

        if($q_r){
            $id     = $q_r->id;
            $value  = $q_r->value + 360;
            $time_added = $value - time();

            $checkEntity = $this->Checks->newEntity(['id' => $id, 'value' => $value]);

            $this->Checks->save($checkEntity);

            $items['time_added'] = $time_added;    
        }

        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }

    public function testRadius(){

        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        if(null !== $this->request->getData('user_type')){

            if($this->request->getData('user_type') == 'permanent'){
                $this->loadModel('PermanentUsers');
                $this->loadModel('Radchecks');

                $q_r        = $this->PermanentUsers->find()->where(['PermanentUsers.id' => $this->request->getData('user_id')])->first();
                $username   = $q_r->username;

                $q_r        = $this->Radchecks->find()->where(['Radchecks.username' => $username,'Radchecks.attribute' => 'Cleartext-Password'])->first();

                $pwd        = $q_r->value;
            }

            if($this->request->getData('user_type') == 'device'){
                $this->loadModel('Devices');

                $q_r        = $this->Devices->find()->where(['Devices.id' => $this->request->getData('device_id')])->first();
                $username   = $q_r->name;
                $pwd        = $username;
            }

            if($this->request->getData('user_type') == 'voucher'){
                $this->loadModel('Vouchers');

                $q_r        = $this->Vouchers->find()->where(['Vouchers.id' => $this->request->getData('voucher_id')])->first();
                $username   = $q_r->name;
                $pwd        = $q_r->password;
            }

        }

        $items = [];

        $items['request']['username']   = $username;
        $items['request']['password']   = $pwd;
        exec("perl " . $this->radscenario . " $username $pwd",$output);

        $send_flag      = false;
        $receive_flag   = false;
        $fail_flag      = true;

        $send_data      = [];
        $receive_data   = [];

        $line           = 0;

        foreach($output as $i){
            $i = trim($i);
            if (preg_match("/Sent Access-Request/", $i)) {
                $send_flag  = true;
                $send_line  = $line;
            }

            if (preg_match("/^Received/", $i)) { //Failure
                $send_flag      = false;
                $receive_flag   = true;
                $receive_line   = $line;
            }

            if (preg_match("/^Received Access-Accept/", $i)) { //Failure
                $fail_flag      = false;
            }

            if(($send_flag == true) && ($line > $send_line)){
                if($i !=''){
                    array_push($send_data,$i);
                }   
            }

            if(($receive_flag == true) && ($line > $receive_line)){
                if($i !=''){
                    array_push($receive_data,$i);
                }    
            }

            $line++;
        }

        $items['send']      = $send_data;
        $items['received']  = $receive_data;
        $items['failed']    = $fail_flag;

        $this->set([
            'data'          => $items,
            'success'       => true,
            '_serialize'    => ['success', 'data']
        ]);
    }
}
