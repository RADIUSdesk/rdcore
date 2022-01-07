<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake auto_add_devices

namespace App\Shell;
use Cake\Console\Shell;
use Cake\Datasource\ConnectionManager;
use Cake\Http\Client;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class AutoAddDevicesShell extends Shell {

   
    public function initialize(){
        parent::initialize();
        $this->loadModel('AutoDevices');
        $this->loadModel('Devices');
        $this->loadModel('Profiles');
        $this->loadModel('PermanentUsers');
        $this->loadModel('Realms');
        $this->loadModel('Users');
    }
     
    public $tasks   = ['FindMac'];

    public function main() {
        $this->out("<comment>Auto Add Devices start ".APP."</comment>");
        $qr = $this->{'AutoDevices'}->find()->all();
        foreach($qr as $i){
            $m = $i->mac;     
            if(
                ($m == 'aa-aa-aa-aa-aa-aa')||
                ($m == 'AA-AA-AA-AA-AA-AA')
            ){
                $this->out("<info>Ignoring RADIUS Auth test entry".$m."</info>");
            }else{
                $this->process_auto_device($i->mac,$i->username);
            }
        }

        //Clear the table for the next lot
        $conn = ConnectionManager::get('default');   
        //$conn->execute('TRUNCATE table auto_devices;');
    }

    private function process_auto_device($mac,$username){
        $this->out("<comment>Checking the following device $mac</comment>");
        
        $count = $this->{'Devices'}->find()->where(['Devices.name' =>$mac])->count();
        if($count == 0){
            $this->out("<info>Device $mac not found - Add it</info>");
            $vendor = $this->FindMac->return_vendor_for_mac($mac);
            
            //Find the Permanent user that this device belongs to:
            $q_r = $this->{'PermanentUsers'}->find()->contain(['Radchecks','Users'])->where(['PermanentUsers.username' => $username])->first();
            if($q_r){

                //Gather the relevant info (We only need the user_id and profile_id
                $profile_id    = false;
                foreach($q_r->radchecks as $rc){
                    if($rc->attribute == 'User-Profile'){
                        $profile    = $rc->value;
                        $q        = $this->Profiles->find()->where(['Profiles.name' => $profile])->first();
                        if($q){
                            $profile_id = $q->id;
                        }
                    }
                    
                    if($rc->attribute == 'Rd-Realm'){
                        $realm    = $rc->value;
                        $q_realm  = $this->Realms->find()->where(['Realms.name' => $realm])->first();
                        if($q_realm){
                            $realm_id = $q_realm->id;
                        }
                    }
                }
                if($profile_id){
                
                    $token  = $q_r->user->token;
                    $d      = [];
                    $d['profile_id']  		    = $profile_id;
                    $d['profile']  		        = $profile;
                    
                    $d['realm_id']              = $realm_id;
                    $d['realm']                 = $realm;
               
                    $d['permanent_user_id']     = $q_r->id;
                    $d['rd_device_owner']       = $username; //NB to have this
                    $d['name']        		    = $mac;
                    $d['description'] 		    = "Auto add ( $vendor )";
                    $d['active']      		    = 1;
                    $d['track_auth']  		    = false;
                    $d['track_acct']  		    = true;
                    
                    $http = new Client();
                    $baseUrl = Configure::read('App.fullBaseUrl');
		            $response = $http->post($baseUrl."/cake3/rd_cake/devices/add.json?token=$token",$d);
		            $this->out("<info>".$response->body."</info>");
                    $this->out("<info>Added device $mac as Auto add ( $vendor )</info>");
                }

            }else{
                $this->out("<warning>User $username not found in Permanent Users</warning>");
            }
            
        }
    }
}

?>
