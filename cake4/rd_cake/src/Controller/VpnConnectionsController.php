<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 10/November/2025
 * Time: 00:00
 */

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;

class VpnConnectionsController extends AppController{

    protected $main_model  = 'ApVpnConnections';
         
    public function initialize():void{  
        parent::initialize();
        $this->loadModel('ApVpnConnections'); 
        $this->loadModel('WireguardInstances');
        
        $this->loadModel('Aps');
        $this->loadModel('ApProfileExits');
        $this->loadModel('ApVpnConnectionApProfileExits');
        $this->loadModel('ApVpnConnectionMacAddresses');
        $this->loadModel('MacAddresses');
        
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtonsFlat');         
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
       // $this->Authentication->allowUnauthenticated([]);              
    }
         
	public function apIndex(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
    	$req_q  = $this->request->getQuery(); //q_data is the query data
        $ap_id  = $req_q['ap_id'];
        $query 	= $this->ApVpnConnections->find()
                    ->where(['ApVpnConnections.ap_id' => $ap_id])
                    ->contain(['ApVpnConnectionApProfileExits','ApVpnConnectionMacAddresses'])
                    ->order(['ApVpnConnections.name DESC']); // The sort order is the opposite or VpnReportsController

        $total  = $query->count();       
        $q_r    = $query->all();
        $items  = [];

        foreach($q_r as $i){		
			$i->modified_in_words= $this->TimeCalculations->time_elapsed_string($i->modified);
			$i->created_in_words = $this->TimeCalculations->time_elapsed_string($i->created);		
			$exits = [];		
			foreach($i->ap_vpn_connection_ap_profile_exits as $exit){
			    $exits[] = $exit->ap_profile_exit_id;
			}					
			$i->ap_vpn_exits = $exits;
			
			$mac_list = '';
			foreach($i->ap_vpn_connection_mac_addresses as $mac){
			    $mac      = $this->macForId($mac->mac_address_id);
			    $mac_list = $mac."\n".$mac_list;
			}
			$i->ap_vpn_macs = $mac_list;
						
			unset($i->ap_vpn_connection_ap_profile_exits);
			unset($i->ap_vpn_connection_mac_addresses);
							
            array_push($items,$i);
        }
        
        $data = [
            'ap_id'         => $ap_id,
            'connections'   => $items       
        ];
        
        $this->set([
            'data'          => $data,
            'success'       => true,
            'totalCount'    => $total,
            'metaData'		=> [
            	'count'	    => $total
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
    
    public function apSave(){
	
		$user = $this->_ap_right_check();
        if (!$user) {
            return;
        } 
        
        $req_d		= $this->request->getData();
        $ap_id      = $this->request->getData('ap_id');
        
        [$meta, $createRows, $updateRows] = $this->splitFlatRows($req_d);
                
        // --- (1) DELETE missing ---
        $submittedIds = array_map('intval', array_keys($updateRows));

        $existingIds = $this->ApVpnConnections->find()
            ->select(['id'])
            ->where(['ap_id' => $ap_id])
            ->enableHydration(false)
            ->all()
            ->extract('id')
            ->toList();

        $toDelete = array_values(array_diff($existingIds, $submittedIds));
        if (!empty($toDelete)) {
            $deleted = $this->ApVpnConnections->deleteAll([
                'ap_id' => $ap_id,
                'id IN' => $toDelete,
            ]);
        }
                
        foreach($createRows as $item){
        
            $item['ap_id']  = $ap_id;
            $form_id        = $item['form_id'];
            $entity         = $this->ApVpnConnections->newEntity($item);
            
            if (!$this->ApVpnConnections->save($entity)) {           
                $message    = 'Error';           
                $errors     = $entity->getErrors();
                $a          = [];
                foreach(array_keys($errors) as $field){
                    $detail_string = '';
                    $error_detail =  $errors[$field];
                    foreach(array_keys($error_detail) as $error){
                        $detail_string = $detail_string." ".$error_detail[$error];   
                    }
                    $add_field      = '0'.$form_id.'_'.$field;
                    $a[$add_field]  = $detail_string;
                }                
                $this->set([
                    'errors'    => $a,
                    'success'   => false,
                    'message'   => __('Could not create item'),
                ]);
                $this->viewBuilder()->setOption('serialize', true);
                return;
            }else{          
                $new_id = $entity->id;       
                foreach($req_d['0'.$form_id.'_ap_vpn_exits'] as $e){      
                    $dExit = [
                        'ap_vpn_connection_id'  => $new_id,
                        'ap_profile_exit_id'    => $e
                    ];
	                $eExit = $this->ApVpnConnectionApProfileExits->newEntity($dExit);
                    $this->ApVpnConnectionApProfileExits->save($eExit);
	            }
	            
	            $ap_vpn_macs = explode("\n",$req_d['0'.$form_id.'_ap_vpn_macs']);         
                foreach($ap_vpn_macs as $mac){                   
                    $macId  = $this->getMacId($mac);
                    if($macId){     
                        $dMac = [
                            'ap_vpn_connection_id'  => $new_id ,
                            'mac_address_id'        => $macId
                        ];
                        $eMac = $this->ApVpnConnectionMacAddresses->newEntity($dMac);
                        $this->ApVpnConnectionMacAddresses->save($eMac);
                    }
                }	                        
            }                
        }
        
        foreach($updateRows as $item){
        
            $item['ap_id']  = $ap_id;
            $id             = $item['form_id'];          
            $form_id        = $item['form_id'];
            $entity         = $this->ApVpnConnections->find()->where(['ApVpnConnections.id' => $id])->first();          
            if($entity){
                $this->ApVpnConnections->patchEntity($entity,$item);
                if (!$this->ApVpnConnections->save($entity)) {           
                    $message    = 'Error';           
                    $errors     = $entity->getErrors();
                    $a          = [];
                    foreach(array_keys($errors) as $field){
                        $detail_string = '';
                        $error_detail =  $errors[$field];
                        foreach(array_keys($error_detail) as $error){
                            $detail_string = $detail_string." ".$error_detail[$error];   
                        }
                        $add_field      = $form_id.'_'.$field;
                        $a[$add_field]  = $detail_string;
                    }                
                    $this->set([
                        'errors'    => $a,
                        'success'   => false,
                        'message'   => __('Could not create item'),
                    ]);
                    $this->viewBuilder()->setOption('serialize', true);
                    return;
                }else{
                    $this->ApVpnConnectionApProfileExits->deleteAll(['ApVpnConnectionApProfileExits.ap_vpn_connection_id' => $id]);
                    foreach($req_d[$form_id.'_ap_vpn_exits'] as $e){      
                        $dExit = [
                            'ap_vpn_connection_id'  => $id,
                            'ap_profile_exit_id'    => $e
                        ];
	                    $eExit = $this->ApVpnConnectionApProfileExits->newEntity($dExit);
                        $this->ApVpnConnectionApProfileExits->save($eExit);
	                }
	                
	                $this->ApVpnConnectionMacAddresses->deleteAll(['ApVpnConnectionMacAddresses.ap_vpn_connection_id' => $id]);
	                $ap_vpn_macs = explode("\n",$req_d[$form_id.'_ap_vpn_macs']);            
	                
                    foreach($ap_vpn_macs as $mac){                   
                        $macId  = $this->getMacId($mac);
                        if($macId){     
                            $dMac = [
                                'ap_vpn_connection_id'  => $id,
                                'mac_address_id'        => $macId
                            ];
	                        $eMac = $this->ApVpnConnectionMacAddresses->newEntity($dMac);
                            $this->ApVpnConnectionMacAddresses->save($eMac);
                        }
	                }	                                              
                }            
            }                              
        }
              	       
        $this->set(
            [
                'data'     => [$meta, $createRows, $updateRows],
                'success'  => true
            ]
        );
        $this->viewBuilder()->setOption('serialize', true);
    }
        
    public function apVpnExits(){
    
        $req_q  = $this->request->getQuery(); //q_data is the query data
        $ap_id  = $req_q['ap_id'];
        $items  = [];
        
        $ap = $this->Aps->find()->where(['Aps.id' => $ap_id])->first();
        if($ap){
            $ap_profile_id = $ap->ap_profile_id;
            $exits  = $this->ApProfileExits->find()
                        ->where([
                            'ApProfileExits.ap_profile_id'  => $ap_profile_id,
                            'ApProfileExits.admin_state'    => 'active',
                            'ApProfileExits.type'           => 'nat',
                        ])
                        ->contain(['ApProfileExitApProfileEntries' => ['ApProfileEntries']])
                        ->all();
            
            foreach($exits as $exit){
                $e_d        = [];
                $e_d['id']  = $exit->id;
                $e_d['type']= $exit->type;
                $name       = '';
                foreach($exit->ap_profile_exit_ap_profile_entries as $conn){
                    if(preg_match('/^-9/',$conn->ap_profile_entry_id)){ 	
                    	$dynamic_vlan = $conn->ap_profile_entry_id;
                    	$dynamic_vlan = str_replace("-9","",$dynamic_vlan);
                    	$name = $name."(Dynamic VLAN ".$dynamic_vlan.") ";          
                    }else{
                        if($conn->ap_profile_entry_id == 0){
                            $name = $name."(LAN) ";
                        }else{
                            $name = $name."(".$conn->ap_profile_entry->name.") ";
                        }
                    }
                }
                $e_d['name'] = $name;
            
                $items[]  = $e_d;
            }
        }
               
        $this->set(
            [
                'items'     => $items,
                'success'  => true
            ]
        );
        $this->viewBuilder()->setOption('serialize', true);   
    }
    
     
    // --- Parse: split flat keys into meta/new/update ---
    private function splitFlatRows(array $data): array{

        $createByIdx = [];  // '1' => [fields...] from 01_, 02_, etc.
        $updateById  = [];  // '148' => [fields...] from 148_, 57_, etc.
        $other       = [];  // ap_id, token, cloud_id, ...

        foreach ($data as $key => $value) {
        
            if (!preg_match('/^(\d+)_(.+)$/', $key, $m)) {
                $other[$key] = $value;
                continue;
            }
            [, $num, $field] = $m;

            // you can skip empties if you want:
            // if ($value === '' || $value === null) continue;

            if ($num[0] === '0') {
                $idx = (int)$num; // '02' -> 2
                $createByIdx[$idx][$field]      = $value;
                $createByIdx[$idx]['form_id']   = $idx;
            } else {
                $id = (int)$num;  // existing DB id
                $updateById[$id][$field]        = $value;
                $updateById[$id]['form_id']     = $id;
            }
        }
        
        ksort($createByIdx, SORT_NUMERIC);
        $create = array_values($createByIdx);
        return [$other, $create, $updateById];
    } 
    
    private function getMacId($mac){
    
        $pattern = '/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/';

        if(!preg_match($pattern, $mac)) {
            return false;
        }
          
        $macAddress = $this->MacAddresses->find()->where(['MacAddresses.mac' => $mac])->first();
        if($macAddress){
            return $macAddress->id;    
        }else{
            $dMac = [
                'mac'   => $mac
            ];
            $eMac = $this->MacAddresses->newEntity($dMac);
            $this->MacAddresses->save($eMac); 
            return $eMac->id;      
        }  
    }
    
    private function macForId($macId){
    
        $mac = $this->MacAddresses->find()->where(['MacAddresses.id' => $macId])->first();
        if($mac){
            return $mac->mac;
        }
    }       
}

?>
