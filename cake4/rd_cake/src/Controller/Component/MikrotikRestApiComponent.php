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
      
    public function test($settings): array {
    
        $this->http = new Client([
            'host'      => $settings['host'],
            'scheme'    => $settings['proto'],
            'port'      => $settings['port'],
            'timeout'   => 5,
            'auth'      => [
                'username'  => $settings['user'],
                'password'  => $settings['pass'],
                'type'      => 'basic'
            ]
        ]);

        $response = $this->http->get('/rest/system/resource');
               
        if (!$response->isOk()) {
            throw new \RuntimeException(
                'Mikrotik API error: ' . $response->getStatusCode()
            );
        }
        return $response->getJson();
    }
    

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
    public function deleteLease(string $leaseId): bool {
        $response = $this->http->delete(
            '/rest/ip/dhcp-server/lease/' . rawurlencode($leaseId)
        );

        return $response->isOk();
    }

    /**
     * Convenience method: remove lease by MAC
     */
    public function releaseLeaseByMac(string $mac): bool {
        $leaseId = $this->getLeaseIdByMac($mac);

        if (!$leaseId) {
            return false;
        }

        return $this->deleteLease($leaseId);
    }
}

