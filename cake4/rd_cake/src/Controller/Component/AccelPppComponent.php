<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\I18n\FrozenTime;

class AccelPppComponent extends Component {


	public function initialize(array $config):void{
        $this->AccelProfiles= TableRegistry::get('AccelProfiles');
        $this->AccelServers = TableRegistry::get('AccelServers');
    }
    
    public function JsonConfig($info){        
        /*Info should look like this:
        [
            'server_type' => 'mesh' / 'ap_profile',
            'mac' => 'AA-BB-CC-DD-EE-FF',
            'cloud_id'  => int val,
            'accel_profile_id'  => int val,
            'name'  => string
            'nas_identifier'    => string,
            'pppoe_interface'   => string    
        ]
        */
        
        $e_srv  = $this->_addOrUpdate($info);
        $config = $this->_return_config($e_srv);   
        return $config;
    }
    
    private function _addOrUpdate($info){    
        $e_srv = $this->{'AccelServers'}->find()->where([
            'AccelServers.nas_identifier' => $info['nas_identifier']
        ])->first();
        
        $info['config_fetched']         = FrozenTime::now();
		$info['last_contact_from_ip']   = $this->getController()->getRequest()->clientIp();
        
        if(!$e_srv){
            $e_srv = $this->{'AccelServers'}->newEntity($info);       
        }else{
            $this->{'AccelServers'}->patchEntity($e_srv, $info);
        }
        $this->{'AccelServers'}->save($e_srv);
        
        //Re-fetch it with all the extra info
        $e_srv = $this->{'AccelServers'}->find()->where([
            'AccelServers.nas_identifier' => $info['nas_identifier']
        ])
        ->contain(['AccelProfiles'=> ['AccelProfileEntries']])
        ->first();       
        return $e_srv;    
    }
    
    private function _return_config($ent_srv){
    
        $config = [];
    
        $base_config  = $ent_srv->accel_profile->base_config;
        Configure::load('AccelPresets');
        $config    = Configure::read('AccelPresets.'.$base_config); //Read the defaults
        
        $config['ip-pool']['pools'] = implode("\n",$config['ip-pool']['pools']); //This will actually be overwritten by one of the entries
        
        //===These two overrides comes from the server's entitiy===
        $config['radius']['nas-identifier'] = $ent_srv->nas_identifier;
        $config['pppoe']['interface']       = $ent_srv->pppoe_interface;
        //----------------------------------------------------------
        
        $radius = [];                           
        foreach($ent_srv->accel_profile->accel_profile_entries as $entry){                    
            if(($entry->section != 'radius1')&&($entry->section != 'radius2')){
                $config[$entry->section][$entry->item] = $entry->value;                      
            }else{
                 $radius[$entry->section][$entry->item] = $entry->value;                   
            }
        }
        
        //Unset $config['radius']['server']
        unset($config['radius']['server']);
        
        $want_these = ['auth-port','acct-port','req-limit','fail-timeout','max-fail','weight'];
        
        if(isset($radius['radius1'])){
            $radius1_string         = 'server='.$radius['radius1']['ip'].','.$radius['radius1']['secret'];
            $radius1_rest_string    = '';
            foreach (array_keys($radius['radius1']) as $key){                     
                 if(in_array($key, $want_these)){
                    $radius1_rest_string=$radius1_rest_string.$key.'='.$radius['radius1'][$key].',';                    
                 }                   
            }
            $radius1_rest_string = rtrim($radius1_rest_string, ',');
            $radius1_string = $radius1_string.','.$radius1_rest_string; 
            $config['radius']['server'] = $radius1_string;
            $config['radius']['server'] = $radius1_string;         
        }
        if(isset($radius['radius2'])){
            $radius2_string         = 'server='.$radius['radius2']['ip'].','.$radius['radius2']['secret'];
            $radius2_rest_string    = '';
            foreach (array_keys($radius['radius2']) as $key){                     
                 if(in_array($key, $want_these)){
                    $radius2_rest_string=$radius2_rest_string.$key.'='.$radius['radius1'][$key].',';                    
                 }                   
            }
            $radius2_rest_string = rtrim($radius2_rest_string, ',');
            $radius2_string = $radius2_string.','.$radius2_rest_string; 
            $config['radius']['server'] = $radius1_string."\n".$radius2_string;      //Combine them with newline     
        }   
        return $config;   
    }

}
