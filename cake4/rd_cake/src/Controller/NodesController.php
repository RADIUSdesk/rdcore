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
    protected $release_owner  = '/cake4/rd_cake/unknown-nodes/release-ownership.json';
    //protected $base_server  = "http://127.0.0.1";
    protected $base_server  = "https://base.wifi-dashboard.com";
    

    public function initialize():void{
        parent::initialize();
        $this->loadModel('Nodes');
        $this->loadComponent('Aa');    
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');            
        $this->loadComponent('Unknowns');
    }
    
    public function getConfigForNode(){
         if(null !== $this->request->getQuery('mac')){
            $mac        = $this->request->getQuery('mac');
            $version    = $this->request->getQuery('version');
            $ap_helper	= 'ApHelper';
            $mesh_helper= 'MeshHelper';
            
            //Sept 2022 We use a version specific helper for the new convention in newer versions of OpenWrt
            if(($version == 22.03)||($version == 21.02)){
            	$ap_helper	= 'ApHelper22';
            	$mesh_helper= 'MeshHelper22';
            }
            
            $this->loadComponent($ap_helper);
            $this->loadComponent($mesh_helper);
                       
            //-Mar 2021- We add a function to first look if this device is not under APdesk
            $json = $this->{$ap_helper}->JsonForAp($mac);
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
                $json = $this->{$mesh_helper}->JsonForMeshNode($ent_node,$gw);
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
        
        $req_d = $this->request->getData();      
        if(isset($req_d['hw'])){
            $fw_id = $req_d['hw'];
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
}
