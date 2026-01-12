<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class VpnComponent extends Component {

    protected $ipsec    = 1;
    protected $ovpn     = 1;
    protected $zt       = 1;
    protected $wg       = 1;
    protected $metaVpn  = [];
    protected $vpnDetail= [];
    protected $downMin  = 25; //Older than 25 min last VPN contact  = mark down

	public function initialize(array $config):void{
        $this->ApVpnConnections = TableRegistry::get('ApVpnConnections');
    }
    
    public function StatusForAp($vpnConnections){

        $currentTime    = FrozenTime::now();
        $ApVpnSessions  = TableRegistry::get('ApVpnSessions');

        // If there are no connections, consider overall status 'down'
        if (empty($vpnConnections)) {
            return 'down';
        }

        foreach ($vpnConnections as $vpnConnection) {
            $conn_id = $vpnConnection->id;

            $open_session = $ApVpnSessions->find()
                ->where([
                    'ApVpnSessions.ap_vpn_connection_id' => $conn_id,
                    'ApVpnSessions.stoptime IS NULL'
                ])
                ->first();

            // No open session for this connection → fail immediately
            if (!$open_session) {
                return 'down';
            }

            $starttime   = $open_session->starttime;
            $last_update = $starttime->addSeconds($open_session->sessiontime);

            // Session too old → fail immediately
            if ($currentTime->diffInMinutes($last_update) >= $this->downMin) {
                return 'down';
            }
        }

        // If we got through all connections without failing, everything is up
        return 'up';
    }
   
    public function NetworkForAp($ap_id){
    
        $vpnConnections = $this->ApVpnConnections->find()
            ->where(['ApVpnConnections.ap_id' => $ap_id])
            ->contain(['ApVpnConnectionApProfileExits','ApVpnConnectionMacAddresses' => ['MacAddresses']])
            ->all();
        $network    = [];
        foreach($vpnConnections as $vpnConnection){
            if($vpnConnection->vpn_type === 'wg'){                
                $network = array_merge($network,$this->_makeWireguard($vpnConnection));           
            }
            if($vpnConnection->vpn_type === 'ovpn'){                
                $network = array_merge($network,$this->_makeOpenvpn($vpnConnection));           
            } 
            
            if($vpnConnection->vpn_type === 'ipsec'){                
                $network = array_merge($network,$this->_makeIpsec($vpnConnection));           
            } 
            
            if($vpnConnection->vpn_type === 'zt'){                
                $network = array_merge($network,$this->_makeZeroTier($vpnConnection));           
            } 
                 
        }    	 	  
    	return [ $network, $this->metaVpn, $this->vpnDetail ];
    }
    
   
    private function _makeOpenvpn($vpnConnection){
    
        $ifname   = 'ovpn0'.$this->ovpn;
        $ret_ovpn = [
            [
                'interface' => $ifname,
                'options'   => [
                    'proto'     => 'none',
                    'ifname'    => $ifname
                
                ]  
            ]
        ];
       
        $exit_points = [];
        $macs        = [];
        foreach($vpnConnection->ap_vpn_connection_ap_profile_exits as $exit){
            $exit_points[] =  $exit->ap_profile_exit_id;   
        }
        foreach($vpnConnection->ap_vpn_connection_mac_addresses as $mac){
            $macs[] =  $mac->mac_addresses->mac;   
        }
        
        $this->metaVpn[] = [
            'id'        => $vpnConnection->id,
            'interface' => $ifname,
            'type'      => $vpnConnection->vpn_type,
            'stats'     => true,
            'routing'   => [
                'exit_points'   => $exit_points,
                'macs'          => $macs
            ]   
        ];
        
        $this->ovpn = $this->ovpn+1; //increment the OpenVPN items 
        
        $config_file = $this->_makeOpenvpnConfig($vpnConnection,$ifname);
        
        if(array_key_exists('ovpn',$this->vpnDetail)){          
            array_push($this->vpnDetail['ovpn'],[ 'name' => $ifname, 'config' => $config_file ]);            
        }else{
            $this->vpnDetail['ovpn'] = [[ 'name' => $ifname, 'config' => $config_file ]];   
        }            
        return $ret_ovpn; 
    }
    
    private function _makeOpenvpnConfig($vpnConnection,$ifname){
    
        $ca     = $vpnConnection->ovpn_ca;
        $cert   = $vpnConnection->ovpn_cert;
        $key    = $vpnConnection->ovpn_key;
        $srv    = $vpnConnection->ovpn_server;
        $port   = $vpnConnection->ovpn_port;
 
$config = <<<EOT
client
dev $ifname
dev-type tun
proto udp
remote $srv $port

# Retry settings
resolv-retry infinite
nobind

persist-key
persist-tun

# Modern data channel ciphers (matches a typical modern server)
data-ciphers AES-256-GCM:CHACHA20-POLY1305
data-ciphers-fallback AES-256-GCM

remote-cert-eku "TLS Web Server Authentication"

verb 3

#We do our own split tunnel routing
pull-filter ignore "redirect-gateway"
route-nopull


<ca>
$ca
</ca>
<cert>
$cert
</cert>
<key>
$key
</key>

EOT;

        return $config;
          
    }
    
    private function _makeIpsec($vpnConnection){
    
        $ifname   = 'xfrm0'.$this->ipsec;
        $ret_ipsec = [
            [
                'interface' => $ifname,
                'options'   => [
                    'proto'     => 'none',
                    'ifname'    => $ifname
                
                ]  
            ]
        ];
        
        $exit_points = [];
        $macs        = [];
        foreach($vpnConnection->ap_vpn_connection_ap_profile_exits as $exit){
            $exit_points[] =  $exit->ap_profile_exit_id;   
        }
        foreach($vpnConnection->ap_vpn_connection_mac_addresses as $mac){
            $macs[] =  $mac->mac_addresses->mac;   
        }
        
        $this->metaVpn[] = [
            'id'        => $vpnConnection->id,
            'interface' => $ifname,
            'type'      => $vpnConnection->vpn_type,
            'stats'     => true,
            'routing'   => [
                'exit_points'   => $exit_points,
                'macs'          => $macs
            ]   
        ];
        
        $this->ipsec = $this->ipsec+1; //increment the IPsec items
        
        $ipsecData  = [];
        $vpnArray   = $vpnConnection->toArray(); 
               
        foreach(array_keys($vpnArray) as $field){
            if(str_starts_with($field,'ipsec_')){            
                $ipsecData[$field] = $vpnArray[$field];
            }
        }
                 
        if(array_key_exists('ipsec',$this->vpnDetail)){          
            array_push($this->vpnDetail['ipsec'],[ 'name' => $ifname, 'config' => $ipsecData ]);            
        }else{
            $this->vpnDetail['ipsec'] = [[ 'name' => $ifname, 'config' => $ipsecData ]];   
        }            
        
             
        return $ret_ipsec;
    }
    
    
    private function _makeWireguard($vpnConnection){
    /*
   config interface 'wg01'
	    option proto 'wireguard'
	    option private_key 'sN2buzXTz0ebysgQG73Mqk+ftbRwO6K5UHbBUpf480U='
	    list addresses '10.5.0.4/32'
	    list addresses 'fd00:12::4/64'

    config wireguard_wg01
	    option description 'Imported peer configuration'
	    option public_key 'hxwdhRA4JqtmF1Jz1tc8C6cFUh8aUzRHBkJ1tuQQEmU='
	    list allowed_ips '0.0.0.0/0'
	    list allowed_ips '::/0'
	    option persistent_keepalive '25'
	    option endpoint_host '164.160.89.129'
	    option endpoint_port '51820'
    */       
        
        $ifname     = 'wg0'.$this->wg;
        $conf_name  = 'wireguard_'.$ifname;                
        $wg_addresses = explode(",", $vpnConnection->wg_address);
    
        $ret_wg = [
            [
                'interface' => $ifname,
                'options'   => [
                    'proto'         => 'wireguard',
                    'private_key'   => $vpnConnection->wg_private_key,
                ],
                'lists'     => [
                    'addresses' => $wg_addresses
                ],
            ],
            [
                $conf_name  => $conf_name,
                'options'   => [
                    'description'   => 'id_'.$vpnConnection->id.'_name_'.$vpnConnection->name,
                    'public_key'    => $vpnConnection->wg_public_key,
                    'persistent_keepalive' => 25,
                    'endpoint_host' => $vpnConnection->wg_endpoint,
                    'endpoint_port' => $vpnConnection->wg_port

                ],
                'lists'     => [
                    'allowed_ips' => [
                        '0.0.0.0/0',
                        '::/0'
                    ]
                ],
            ]
        ];
        
        $exit_points = [];
        $macs        = [];
        foreach($vpnConnection->ap_vpn_connection_ap_profile_exits as $exit){
            $exit_points[] =  $exit->ap_profile_exit_id;   
        }
        foreach($vpnConnection->ap_vpn_connection_mac_addresses as $mac){
            $macs[] =  $mac->mac_address->mac;   
        }
        
        $this->metaVpn[] = [
            'id'        => $vpnConnection->id,
            'interface' => $ifname,
            'type'      => $vpnConnection->vpn_type,
            'stats'     => true,
            'routing'   => [
                'exit_points'   => $exit_points,
                'macs'          => $macs
            ]   
        ];
        
        $this->wg = $this->wg+1; //increment the wireguard items        
        return $ret_wg;   
    }
    
    private function _makeZeroTier($vpnConnection){
       
        $ifname   = 'zt0'.$this->zt;
        $zt_ifname= $ifname;
        if($vpnConnection->zt_ifname){
            $zt_ifname = $vpnConnection->zt_ifname;
        }
        $ret_zt = [
            [
                'interface' => $ifname,
                'options'   => [
                    'proto'     => 'none',
                    'ifname'    => $zt_ifname
                
                ]  
            ]
        ];
        
        $exit_points = [];
        $macs        = [];
        foreach($vpnConnection->ap_vpn_connection_ap_profile_exits as $exit){
            $exit_points[] =  $exit->ap_profile_exit_id;   
        }
        foreach($vpnConnection->ap_vpn_connection_mac_addresses as $mac){
            $macs[] =  $mac->mac_addresses->mac;   
        }
        
        $this->metaVpn[] = [
            'id'        => $vpnConnection->id,
            'interface' => $ifname,
            'type'      => $vpnConnection->vpn_type,
            'network_id' => $vpnConnection->zt_network_id,
            'ifname'    => $zt_ifname,
            'stats'     => true,
            'routing'   => [
                'exit_points'   => $exit_points,
                'macs'          => $macs
            ]   
        ];
        
        $this->zt = $this->zt+1; //increment the Zerotier items
        
        $ztData  = [];
        $vpnArray   = $vpnConnection->toArray(); 
               
        foreach(array_keys($vpnArray) as $field){
            if(str_starts_with($field,'zt_')){            
                $ztData[$field] = $vpnArray[$field];
            }
        }
                 
        if(array_key_exists('zt',$this->vpnDetail)){          
            array_push($this->vpnDetail['zt'],[ 'name' => $ifname, 'config' => $ztData ]);            
        }else{
            $this->vpnDetail['zt'] = [[ 'name' => $ifname, 'config' => $ztData ]];   
        }            
                     
        return $ret_zt;
    }
}
