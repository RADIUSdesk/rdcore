<?php

namespace App\Controller\Component;


use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class PasspointComponent extends Component {

    private $baseOptions = [
        'iw_enabled'    => 1,   //By Default always if enabled
        'iw_interworking' => 1, //By Default always if enabled
        
      // 'iw_access_network_type' => 3, //Override by passpoint_network_type_id
      
        'iw_internet' => 1, 
        'iw_disable_dgaf' => 1,
        'iw_asra' => 0,
        'iw_esr' => 0,
        'iw_uesa' => 0,
        
     //   'iw_venue_group' => 2, //Override by ->passpoint_venue_group_type->passpoint_venue_group_id
    //    'iw_venue_type' => 8, //Override by ->passpoint_venue_group_type->venue_type_value
        
        'iw_hessid' => '00:00:00:01:02:03',
        'iw_network_auth_type' => '00',
        'iw_ipaddr_type_availability' => '0c',
        'hs20' => 1,
        'hs20_oper_friendly_name' => 'eng:RADIUSdeskHotspot2',
        'hs20_operating_class' => '517C',   
    ];
    
    private $baseLists = [
      //  [ 'name' =>  'iw_domain_name',      'value' => 'mesh-manager.com'],
        [ 'name' =>  'iw_venue_name',       'value' => 'eng:RADIUSdesk Hotel'],
        [ 'name' =>  'iw_venue_url',        'value' => '1:http://www.radiusdesk.com'],
    //    [ 'name' =>  'iw_nai_realm',        'value' => '0,mesh-manager.com, 21[2:4][5:7],25[2:4][5:7]'],
    //    [ 'name' =>  'iw_roaming_consortium', 'value' => 'ABCD1234'],  
    ];

   
    public function initialize(array $config): void{        
        $this->PasspointProfiles = TableRegistry::get('PasspointProfiles');       
    }

    public function getOptions($id){
    
        //print_r($id);
        $passpointProfile = $this->PasspointProfiles->find()
            ->where(['PasspointProfiles.id' => $id])
            ->contain(['PasspointVenueGroupTypes'])
            ->first();
       // print_r($passpointProfile);
        
        if($passpointProfile){
           $this->baseOptions['iw_access_network_type'] = $passpointProfile->passpoint_network_type_id;
        }
        if($passpointProfile->passpoint_venue_group_type){
            $this->baseOptions['iw_venue_group']  = $passpointProfile->passpoint_venue_group_id;
            $this->baseOptions['iw_venue_type']   = $passpointProfile->passpoint_venue_group_type->venue_type_value;
        }
        
        return $this->baseOptions;
    }
    
    public function getLists($id){
    
        $passpointProfile = $this->PasspointProfiles->find()
            ->where(['PasspointProfiles.id' => $id])
            ->contain(['PasspointRcois','PasspointDomains','PasspointNaiRealms' => ['PasspointNaiRealmPasspointEapMethods' => 'PasspointEapMethods']])
            ->first();
            
        if($passpointProfile){
            foreach($passpointProfile->passpoint_rcois as $rcoi){
                $this->baseLists[] = [ 'name' =>  'iw_roaming_consortium', 'value' => $rcoi->rcoi_id];
            }
            foreach($passpointProfile->passpoint_domains as $domain){
                $this->baseLists[] = [ 'name' =>  'iw_domain_name', 'value' => $domain->name];
            }
            
            foreach($passpointProfile->passpoint_nai_realms as $nai_realm){
                //nai_realm=0,example.org,13[5:6],21[2:4][5:7] (4 = MSCHAPv2 1 = PAP)
                $methods = [];
                $realm   = $nai_realm->name;
                foreach($nai_realm->passpoint_nai_realm_passpoint_eap_methods as $item){
                    $methods[] = $item->passpoint_eap_method->hostapd_string;             
                }
                if($methods){
                    $methods = implode(',', $methods);
                    $realm = $realm.",".$methods;
                }              
                $this->baseLists[] = [ 'name' =>  'iw_nai_realm', 'value' => '0,'.$realm];
            }
        }
        //print_r($passpointProfile);   
        return $this->baseLists;
    }
}

