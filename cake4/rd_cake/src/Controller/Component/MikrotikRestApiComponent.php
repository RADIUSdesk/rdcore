<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component interacts with the Mikrotik Router using the Rest API
//---- Date: 11-Feb-2026
//------------------------------------------------------------

    declare(strict_types=1);
    namespace App\Controller\Component;
    use Cake\Controller\Component;
    use Cake\Http\Client;
    use Cake\Core\Configure;

class MikrotikRestApiComponent extends Component{

    protected Client $http;
    protected array $settings;
      
    public function test($settings): array {
          
        $this->_newClient($settings);

        $response = $this->http->get('/rest/system/resource');
               
        if (!$response->isOk()) {
            throw new \RuntimeException(
                'Mikrotik API error: ' . $response->getStatusCode()
            );
        }
        return $response->getJson();
    }
    
    public function kickRadius($ent,$config){
    
        $this->_newClient($config);
                  
        //We need to guess what connection the user used based on cetrain fields in the $ent record
    	$called_station_id 	= $ent->calledstationid;
    	$mac_minus			= strtoupper($ent->callingstationid);
    	$mac_colon			= str_replace("-",":",$mac_minus);
    	$servicetype		= $ent->servicetype;
    	$framedprotocol		= $ent->framedprotocol;
    	$nasporttype        = $ent->nasporttype;
    	
    	
    	//=== If they connected using the PPPoE server the following should be in the accounting record
    	if(($servicetype == 'Framed-User' )&&($framedprotocol == 'PPP' )){    	
    	    $this->removeActivePpp($mac_colon);    	
    	}
    	
    	//-- DHCP does not have a framedprotocol on the Mikrotik --	
        if(($nasporttype == 'Ethernet')&&($servicetype == 'Framed-User' )&&($framedprotocol == '')){
            $this->releaseLeaseByMac($mac_colon);       
        }       
              
    }
    
    //---------------------------------------------------------------
    
    //----------------- PPP ----------------------------
     /**
     * Get PPP session .id by Caller Id
     */
    public function getPppIdByCallerId(string $mac): ?string {

        $response = $this->http->get(
            '/rest/ppp/active',
            [
                '.proplist'  => '.id,name,caller-id,address,service',
                 'caller-id' => $mac
            ]
        );

        if (!$response->isOk()) {
            throw new \RuntimeException(
                'Mikrotik API error: ' . $response->getStatusCode()
            );
        }

	    $data = $response->getJson();
        return $data[0]['.id'] ?? null;
            
    }
    
    /**
     * Delete PPP session by .id
     */   
    public function deletePppShell(string $pppId): bool{

        $host  = $this->settings['host'];
        $proto = $this->settings['proto'];
        $port  = $this->settings['port'];
        $user  = $this->settings['user'];
        $pass  = $this->settings['pass'];
        $url   = $proto.'://'.$host.':'.$port."/rest/ppp/active/$pppId";

        $command = sprintf(
            'curl -k -s -w "HTTPSTATUS:%%{http_code}" -u %s:%s -X DELETE "%s"',
            escapeshellarg($user),
            escapeshellarg($pass),
            $url
        );

        $output = shell_exec($command);

        if ($output === null) {
            throw new \RuntimeException('Shell execution failed');
        }

        // Separate body from status
        preg_match('/HTTPSTATUS:(\d+)$/', $output, $matches);
        $status = $matches[1] ?? null;
        $body = preg_replace('/HTTPSTATUS:\d+$/', '', $output);
        
        if($status == 204){
            return true;
        }
        return false;
    }
    
    /**
     * Convenience method: remove PPP session by MAC
     */
    public function removeActivePpp($mac): bool {
        $pppId = $this->getPppIdByCallerId($mac);
        if (!$pppId) {
            return false;
        }
        return $this->deletePppShell($pppId);
    }
    //----------------- END  PPP ----------------------------
    
    //----------------- DHCP ----------------------------
    /**
     * Get DHCP lease .id by MAC address
     */
    public function getLeaseIdByMac(string $mac): ?string {

        $response = $this->http->get(
            '/rest/ip/dhcp-server/lease',
            [
                '.proplist' => '.id',
                'mac-address' => $mac
            ]
        );

        if (!$response->isOk()) {
            throw new \RuntimeException(
                'Mikrotik API error: ' . $response->getStatusCode()
            );
        }

	    $data = $response->getJson();
        return $data[0]['.id'] ?? null;
    }

    
    
    /**
     * Delete lease by .id
     */   
    public function deleteLeaseShell(string $leaseId): bool{

        $host  = $this->settings['host'];
        $proto = $this->settings['proto'];
        $port  = $this->settings['port'];
        $user  = $this->settings['user'];
        $pass  = $this->settings['pass'];
        $url   = $proto.'://'.$host.':'.$port."/rest/ip/dhcp-server/lease/$leaseId";

        $command = sprintf(
            'curl -k -s -w "HTTPSTATUS:%%{http_code}" -u %s:%s -X DELETE "%s"',
            escapeshellarg($user),
            escapeshellarg($pass),
            $url
        );

        $output = shell_exec($command);

        if ($output === null) {
            throw new \RuntimeException('Shell execution failed');
        }

        // Separate body from status
        preg_match('/HTTPSTATUS:(\d+)$/', $output, $matches);
        $status = $matches[1] ?? null;
        $body = preg_replace('/HTTPSTATUS:\d+$/', '', $output);
        
        if($status == 204){
            return true;
        }

        /*return [
            'status' => (int)$status,
            'body'   => $body
        ];*/
        return false;
    }
    
    /**
     * Convenience method: remove lease by MAC
     */
    public function releaseLeaseByMac($mac): bool {
        $leaseId = $this->getLeaseIdByMac($mac);
        if (!$leaseId) {
            return false;
        }
        return $this->deleteLeaseShell($leaseId);
    }
    
    //----------------- END DHCP ----------------------------
       
    private function _newClient($settings){
    
        $this->settings = $settings;
        $this->http = new Client([
            'host'      => $settings['host'],
            'scheme'    => $settings['proto'],
            'port'      => $settings['port'],
	    'timeout'   => 5,
	    'ssl_verify_peer' => false,
            'ssl_verify_host' => false,
            'auth'      => [
                'username'  => $settings['user'],
                'password'  => $settings['pass'],
                'type'      => 'basic'
            ]
        ]);  
    }    
}

