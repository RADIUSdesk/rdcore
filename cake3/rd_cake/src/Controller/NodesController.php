<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 06/09/2018
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;

use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;

use Cake\Http\Client;
use Cake\Http\ServerRequest;

class NodesController extends AppController {

    public $base            = "Access Providers/Controllers/Nodes/";
    protected $owner_tree   = [];
    protected $main_model   = 'Nodes';
    protected $release_owner  = '/cake3/rd_cake/unknown-nodes/release-ownership.json';
    //protected $base_server  = "http://127.0.0.1";
    protected $base_server  = "https://base.wifi-dashboard.com";
    

    public function initialize(){
        parent::initialize();
        $this->loadModel('Nodes');
        $this->loadModel('Users');
       
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
             
        $this->loadComponent('Unknowns');
        $this->loadComponent('MeshHelper'); 
        $this->loadComponent('ApHelper');
    }
    
    public function GetConfigForNode(){
         if(null !== $this->request->getQuery('mac')){
            $mac        = $this->request->getQuery('mac');
            
            //--Update the Hardware Owners is needed
            if(Configure::read('extensions.active') == true){
                $this->loadModel('HardwareOwners');
                $ent_ho = $this->{'HardwareOwners'}->find()->where([
                    'HardwareOwners.name' => $mac
                ])->first();
                if($ent_ho){
                    if(($ent_ho->status == 'awaiting-check-in')||($ent_ho->status == 'checked-in')){
                        $this->{'HardwareOwners'}->patchEntity($ent_ho,['status'=>'checked-in']);
                        $this->{'HardwareOwners'}->touch($ent_ho);
                        $this->{'HardwareOwners'}->save($ent_ho);
                    }
                    if(($ent_ho->status == 'awaiting-check-out')||($ent_ho->status == 'checked-out')){
                        $this->_completeCheckout($ent_ho);
                        return; //No need to do the rest instruct the firmware to reboot in order to go to base server
                    }              
                }
            }
            
            //-Mar 2021- We add a function to first look if this device is not under APdesk
            $json = $this->ApHelper->JsonForAp($mac);
            if(isset($json['config_settings'])){
                $this->set([
                    'config_settings'   => $json['config_settings'],
                    'timestamp'         => $json['timestamp'],
                    'mode'              => 'ap',
                    'meta_data'         => $json['meta_data'],
                    'success'           => true,
                    '_serialize'        => ['config_settings','success','timestamp','meta_data','mode']
                ]);
                return;
            }           
            
            $ent_node   = $this->{$this->main_model}->find()->where([$this->main_model.'.mac' => $mac])->first();
            if($ent_node){
                $gw = false;
                if(null !== $this->request->getQuery('gateway')){
                    if($this->request->getQuery('gateway') == 'true'){
                        $gw = true;
                    }
                }
                $json = $this->MeshHelper->JsonForMeshNode($ent_node,$gw);
                $this->set([
                    'config_settings'   => $json['config_settings'],
                    'timestamp'         => $json['timestamp'],
                    'mode'              => 'mesh',
                    'meta_data'         => $json['meta_data'],
                    'success'           => true,
                    '_serialize'        => ['config_settings','success','timestamp','meta_data','mode']
                ]);
                  
            }else{
                $this->Unknowns->RecordUnknownNode();
            }   
            
         }else{
            $this->JsonErrors->errorMessage("MAC Address of node not specified",'error');
         }  
    }
     
    public function attach(){
    
        if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}
    
        //__ Authentication + Authorization __
        $user = $this->Aa->user_for_token($this); //FIXME For now we just check for a valid user
        if(!$user){   //If not a valid user
            return;
        }
        
        if(isset($this->request->data['hw'])){
            $fw_id = $this->request->data['hw'];
            $this->loadModel('Hardwares');
            
            $q_hw = $this->Hardwares->find()->where(['Hardwares.fw_id' => $fw_id])->contain(['HardwareRadios'])->first();
            
            if($q_hw){
            
            
            }
        } 

        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
    }

    public function index(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
//        $user_id    = $user['id'];
//        $query      = $this->{$this->main_model}->find();
       
        //___ FINAL PART ___
        $this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
    }

    public function redirectUnknown(){
        $this->loadModel('UnknownNodes');
        $cdata = $this->request->getData();
        $cdata['new_server_status'] = 'awaiting';

        $unknownEntity = $this->{'UnknownNodes'}->newEntity($cdata);

        if ($this->{'UnknownNodes'}->save($unknownEntity)) {
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
            
        }else{
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($unknownEntity,$message);
        }
    }

    public function changeNodeMode(){
        $this->loadModel('UnknownNodes');
        $cdata = $this->request->getData();
        $cdata['new_mode_status'] = 'awaiting';

        $unknownEntity = $this->{'UnknownNodes'}->newEntity($cdata);

        if ($this->{'UnknownNodes'}->save($unknownEntity)) {
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }else{
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($unknownEntity,$message);
        }
    }
    
    private function _completeCheckout($ent){
    
        //First try to update the base server before adding it here
        $http = new Client();
        //$data = $this->request->getData();
        
        //Specify to the base server where we are from man
        $host = $this->request->host();
        $proto= 'http';
        if($this->request->is('ssl')){
            $proto = 'https';
        }
        $data['mac']    = $ent->name;//Name and not mac
            
        try{
            $response = $http->post(
                $this->base_server.$this->release_owner,
                json_encode($data),
                ['type' => 'json','timeout' => 5]
            );
            
            if($response->isOk()){
                $feedback = $response->getJson();
                if($feedback['success'] == true){
                    //Now we can add it locally
                    //print_r($response->getJson());
                    $this->{'HardwareOwners'}->patchEntity($ent,['status'=>'checked-out']);
                    $this->{'HardwareOwners'}->touch($ent);
                    if ($this->{'HardwareOwners'}->save($ent)) {
                       $this->set(array(
                            'success' => false,
                            'return_to_base' => true,
                            '_serialize' => array('success','return_to_base')
                        ));
                    } else {
                        $message = __('Could not update item');
                        $this->JsonErrors->entityErros($entity,$message);
                    }
                }else{
                     $this->set([
                        'success' => false,
                        '_serialize' => ['success']
                    ]);
                }
                return;
            }
        }catch (\Exception $e) {         
             $this->set([
                'success'       => false,
                'message'       => $e->getMessage(),
                '_serialize'    => ['success','message']
            ]);
            return;
        }   
    }
}
