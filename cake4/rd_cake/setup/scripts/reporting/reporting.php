<?php
//Some global variables
$servername = "localhost";
$username   = "rd";
$password   = "rd";
$conn       = false;
$conn2      = false;

$rebootFlag = false;
$logFlag    = false;
$mode       = 'mesh';

//Some defaults
$repSettings                        = [];
$repSettings['report_adv_enable']   = true;
$repSettings['report_adv_proto']    = 'http';
$repSettings['report_adv_light']    = 60;
$repSettings['report_adv_full']     = 600;
$repSettings['report_adv_sampling'] = 60;

main();

function main(){
    global $conn,$rebootFlag,$repSettings,$mode;
    doConnection();
    $commands = [];
    
    //Because we do JSON
    $_POST = json_decode(file_get_contents('php://input'), true);
      
    if(isset($_POST["mac"])){
        $mac = $_POST["mac"];
        logger("Doing Report for $mac");
        if(isset($_POST["mode"])){
            $mode = $_POST["mode"];
        }    
        
        $node = _getIdForMac($mac);
        if($node){
            logger("ID for MAC $mac is $node->id");
            if(isset($_POST["report_type"])){
                $report_type = $_POST["report_type"];
                if($report_type == 'light'){
                    if(isset($_POST['wbw_info'])){
                        _addWbwInfo($node->id);
                    }
                    if(isset($_POST['qmi_info'])){
                        _addQmiInfo($node->id);
                    }
                    if(isset($_POST['vpn_info'])){
                        $vpn_info = $_POST['vpn_info'];
                        _addOpenVpn($vpn_info,$node);
                    }
                    
                    if(isset($_POST['wan_stats'])){
                        $wan_stats = $_POST['wan_stats'];
                        _addWanStats($wan_stats,$node);
                    }
                                        
                    _doLightReport($node);                   
                }
                if($report_type == 'full'){
                    _doFullReport($node);
                }
                
                if($mode == 'mesh'){
                    $id_setting = $node->mesh_id;
                }
                if($mode == 'ap'){
                    $id_setting = $node->ap_profile_id;
                }
                _fetchReportSettings($id_setting);
                $commands = _getAwaitingCommands($node->id);
            }
        }else{
            //We do the unknown nodes thing :-)
            _rebootFlagTest($mac);
        }       
    }
    
    $data                   = [];
    $data['success']        = true;
    $data['reboot_flag']    = $rebootFlag;
    $data['items']          = $commands;
    $data['reporting']      = $repSettings; 
    //Cleanup
    $conn = null;
      
    header('Content-type: application/json');
    echo json_encode($data);
}

//==== FOR Postgresql =====
/*
function doConnection(){
    global $servername,$username,$password,$conn;
    try {
        $conn = new PDO("pgsql:host=$servername;dbname=rd", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    } catch(PDOException $e){
        echo "Connection failed: " . $e->getMessage();
    }
}
*/
 
//==== For Mysql / MariaDB =====
function doConnection(){

    global $servername,$username,$password,$conn;
    try {
        $conn = new PDO("mysql:host=$servername;dbname=rd", $username, $password,[PDO::ATTR_PERSISTENT => true]);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch(PDOException $e){
        echo "Connection failed: " . $e->getMessage();
    }
}


function _getIdForMac($mac){
    global $conn,$mode;
    $id = false;
    $qs = "SELECT id,mesh_id,reboot_flag FROM nodes WHERE mac = :mac";
    
    if($mode == 'ap'){
        $qs = "SELECT id,ap_profile_id,reboot_flag FROM aps WHERE mac = :mac";
    }
     
    $stmt = $conn->prepare($qs);
    $stmt->execute(['mac' => $mac]);
    $node = $stmt->fetch(PDO::FETCH_OBJ);
    if(isset($node->id)){  
        $id= $node;
     
    //-- JAN 2026 --  
    }else{ 
        //Do another check if it is perhaps not in aps (first time the mode will still be mesh and only change there-after to 'ap')
        $stmt = $conn->prepare("SELECT id,ap_profile_id,reboot_flag FROM aps WHERE mac = :mac");
        $stmt->execute(['mac' => $mac]);
        $ap = $stmt->fetch(PDO::FETCH_OBJ);
        if(isset($ap->id)){
            $mode = 'ap'; //set the mode to 'ap' since we found a match under aps
            $id = $ap;
        }    
    }
    //-- END JAN 2026 --
    
    return $id;
}

function _doLightReport($node){
    global $rebootFlag;
    _update_last_contact($node);
    if($node->reboot_flag == 1){
        $rebootFlag = true;
        _clear_reboot_flag($node);
    }    
}

function _getUserIpAddr(){
    if(!empty($_SERVER['HTTP_CLIENT_IP'])){
        //ip from share internet
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    }elseif(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
        //ip pass from proxy
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }else{
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

function _rebootFlagTest($mac){
    global $conn,$rebootFlag;
    //If the devic is not under unknown nodes; flag it to be rebooted 
    $stmt = $conn->prepare("SELECT id FROM unknown_nodes WHERE mac = :mac");
    $stmt->execute(['mac' => $mac]);
    $node = $stmt->fetch(PDO::FETCH_OBJ);
    if(!isset($node->id)){
        $rebootFlag = true; //Not yet in unknown nodes; set the reboot flag
    }
}

function _fetchReportSettings($id){
    global $conn,$mode,$repSettings;
   
    $query = "SELECT report_adv_proto,report_adv_light,report_adv_full,report_adv_sampling FROM node_settings WHERE mesh_id = :id";
    if($mode == 'ap'){
        $query = "SELECT report_adv_proto,report_adv_light,report_adv_full,report_adv_sampling FROM ap_profile_settings WHERE ap_profile_id = :id";
    }    
    //Get the common node settings for the timing
    $stmt = $conn->prepare($query);
    $stmt->execute(['id' => $id]);
    $ms = $stmt->fetch(PDO::FETCH_OBJ);
    if($ms){        
        $repSettings['report_adv_enable']   = true;
        $repSettings['report_adv_proto']    = $ms->report_adv_proto;
        $repSettings['report_adv_light']    = $ms->report_adv_light;
        $repSettings['report_adv_full']     = $ms->report_adv_full;
        $repSettings['report_adv_sampling'] = $ms->report_adv_sampling;
    }//Default is already set if not found    
}

function _getAwaitingCommands($id){
    global $conn,$mode;
    $items = [];
    $query = "SELECT id FROM node_actions WHERE node_id = :id AND status='awaiting'";
    if($mode == 'ap'){
        $query = "SELECT id FROM ap_actions WHERE ap_id = :id AND status='awaiting'";
    } 
    $stmt = $conn->prepare($query);   
    $stmt->execute(['id' => $id]);  
    while ($row = $stmt->fetch(PDO::FETCH_OBJ)){
         array_push($items,$row->id);
    }
    return $items;
}


function _addWbwInfo($id){

    global $conn,$mode;
    $wbw_info = $_POST['wbw_info'];
    
    $query  = "SELECT id FROM node_connection_settings WHERE node_id = :id AND grouping='wbw_info' AND name=:key";
    $update = "UPDATE node_connection_settings SET modified = NOW(), value = :value WHERE id = :id";
    $insert = "INSERT into node_connection_settings (node_id,grouping,name,value,created,modified) VALUES(:id,'wbw_info',:key,:value,NOW(),NOW())";
    if($mode == 'ap'){
        $query  = "SELECT id FROM ap_connection_settings WHERE ap_id = :id AND grouping='wbw_info' AND name=:key";
        $update = "UPDATE ap_connection_settings SET modified = NOW(), value = :value WHERE id = :id";
        $insert = "INSERT into ap_connection_settings (ap_id,grouping,name,value,created,modified) VALUES(:id,'wbw_info',:key,:value,NOW(),NOW())";
    }
        
    foreach (array_keys($wbw_info) as $key){
        $value  = $wbw_info[$key];
        $stmt   = $conn->prepare($query);
        $stmt->execute(['id' => $id,'key' =>$key]);   
        $result = $stmt->fetch(PDO::FETCH_OBJ);

        if(isset($result->id)){
            $stmt = $conn->prepare($update);
            $stmt->execute(['id' => $result->id,'value' =>$value]);   
        }else{
            $stmt = $conn->prepare($insert);
            $stmt->execute(['id' => $id,'key' =>$key,'value'=>$value]);   
        }
    } 
}

function _addQmiInfo($id){

    global $conn,$mode;
    $qmi_info 		= $_POST['qmi_info'];
    $qmi_signal		= $qmi_info['signal'];
    $qmi_system		= $qmi_info['system'];
      
    $query_signal   = "SELECT id FROM node_connection_settings WHERE node_id = :id AND grouping='qmi_info_signal' AND name=:key";
    $query_system   = "SELECT id FROM node_connection_settings WHERE node_id = :id AND grouping='qmi_info_system' AND name=:key";
    
    $update 	    = "UPDATE node_connection_settings SET modified = NOW(), value = :value WHERE id = :id";
    $insert_signal 	= "INSERT into node_connection_settings (node_id,grouping,name,value,created,modified) VALUES(:id,'qmi_info_signal',:key,:value,NOW(),NOW())";
    $insert_system 	= "INSERT into node_connection_settings (node_id,grouping,name,value,created,modified) VALUES(:id,'qmi_info_system',:key,:value,NOW(),NOW())";
    if($mode == 'ap'){
        $query_signal  = "SELECT id FROM ap_connection_settings WHERE ap_id = :id AND grouping='qmi_info_signal' AND name=:key";
        $query_system  = "SELECT id FROM ap_connection_settings WHERE ap_id = :id AND grouping='qmi_info_system' AND name=:key";
        $update = "UPDATE ap_connection_settings SET modified = NOW(), value = :value WHERE id = :id";
        $insert_signal = "INSERT into ap_connection_settings (ap_id,grouping,name,value,created,modified) VALUES(:id,'qmi_info_signal',:key,:value,NOW(),NOW())";
        $insert_system = "INSERT into ap_connection_settings (ap_id,grouping,name,value,created,modified) VALUES(:id,'qmi_info_system',:key,:value,NOW(),NOW())";
    }
    
    //Signal    
    foreach (array_keys($qmi_signal) as $key){
        $value  = $qmi_signal[$key];
        $stmt   = $conn->prepare($query_signal);
        $stmt->execute(['id' => $id,'key' =>$key]);   
        $result = $stmt->fetch(PDO::FETCH_OBJ);

        if(isset($result->id)){
            $stmt = $conn->prepare($update);
            $stmt->execute(['id' => $result->id,'value' =>$value]);   
        }else{
            $stmt = $conn->prepare($insert_signal);
            $stmt->execute(['id' => $id,'key' =>$key,'value'=>$value]);   
        }
    } 
    
    //System (is a bit different it has sub items which we'll do with item:sub_item as key
    foreach (array_keys($qmi_system) as $key){
        $value  = $qmi_system[$key];
        if(is_array($value)){
        	foreach(array_keys($value) as $two_key){
        		$k		= $key.":".$two_key;
        		
        		//Skip over values longer than 25 characters (name     | varchar(25))
        		if(strlen($k)>25){
        			continue;
        		}
        		       		
        		$v 		= $qmi_system[$key][$two_key];
		    	$stmt   = $conn->prepare($query_system);
				$stmt->execute(['id' => $id,'key' =>$k]);   
				$result = $stmt->fetch(PDO::FETCH_OBJ);
				if(isset($result->id)){
				    $stmt = $conn->prepare($update);
				    $stmt->execute(['id' => $result->id,'value' =>$v]);   
				}else{
				    $stmt = $conn->prepare($insert_system);
				    $stmt->execute(['id' => $id,'key' =>$k,'value'=>$v]);   
				}      	          	
        	}       
        }else{
		    		    
		    $stmt   = $conn->prepare($query_system);
		    $stmt->execute(['id' => $id,'key' =>$key]);   
		    $result = $stmt->fetch(PDO::FETCH_OBJ);
		    if(isset($result->id)){
		        $stmt = $conn->prepare($update);
		        $stmt->execute(['id' => $result->id,'value' =>$value]);   
		    }else{
		        $stmt = $conn->prepare($insert_system);
		        $stmt->execute(['id' => $id,'key' =>$key,'value'=>$value]);   
		    }
		}
    }   
}

function _addOpenVpn($vpn_info,$node){

    global $conn,$mode;
    
    $query  = "SELECT id FROM openvpn_server_clients WHERE id = :id";
    $update = "UPDATE openvpn_server_clients SET modified = NOW(), last_contact_to_server = :last_contact_to_server, state = :state WHERE id = :id";

    $vpn_gw_list = $vpn_info['vpn_gateways'];  
    foreach ($vpn_gw_list as $gw) {
        $vpn_client_id  = $gw['vpn_client_id'];
        $vpn_state      = $gw['state'];
        $timestamp      = $gw['timestamp'];
        $date           = date('Y-m-d H:i:s', $timestamp);          
        $stmt   = $conn->prepare($query);
        $stmt->execute(['id' => $vpn_client_id]);   
        $result = $stmt->fetch(PDO::FETCH_OBJ);
        if(isset($result->id)){
            $stmt = $conn->prepare($update);
            $stmt->execute(['id' => $result->id,'last_contact_to_server' =>$date, 'state'=> $vpn_state]);   
        }
    }
}

function _addWanStats($wan_stats,$node){

    global $conn,$mode;
    
    $ap_id      = null;
    $node_id    = $node->id;
     
    if($mode == 'ap'){
        $node_id    = null;
        $ap_id      = $node->id;
    }
     
     //--First the usage stats--
     if(isset($wan_stats['usage'])){
        foreach($wan_stats['usage'] as $usageEntry){
        
            $stats      = $usageEntry['statistics'];
            $interface  = $usageEntry['interface'];
            if($interface == 'lan'){
                $interface = 0;
            }
            $interface  = str_replace('mw','',$interface);
            
            $stats = array_merge(
                ['node_id' => $node_id, 'ap_id' => $ap_id,'mwan_interface_id' => $interface], 
                $stats
            );
            
            $ipv4_mask = null;
            $ipv4_address = null;
            $ipv6_mask = null;
            $ipv6_address = null;
            
            if (!empty($usageEntry['ipv4_address'])) {
                foreach ($usageEntry['ipv4_address'] as $entry) {
                    $ipv4_mask      = isset($entry['mask']) ? $entry['mask'] : NULL; // Default to NULL
                    $ipv4_address   = isset($entry['address']) ? $entry['address'] : NULL; // Default to NUL
                }
            } 
            if (!empty($usageEntry['ipv6_address'])) {
                foreach ($usageEntry['ipv6_address'] as $entry) {
                    $ipv6_mask      = isset($entry['mask']) ? $entry['mask'] : NULL; // Default to NULL
                    $ipv6_address   = isset($entry['address']) ? $entry['address'] : NULL; // Default to NUL
                }
            }             
            
            $stmt = $conn->prepare("CALL InsertWanTrafficStats(:ap_id, :node_id, :mwan_interface_id, :ipv4_mask, :ipv4_address, :ipv6_mask, :ipv6_address, :tx_bytes, :rx_bytes, :tx_packets, :rx_packets)");
            $stmt->bindParam(':ap_id', $ap_id);
            $stmt->bindParam(':node_id', $node_id);
            $stmt->bindParam(':mwan_interface_id', $interface);
            $stmt->bindParam(':ipv4_mask', $ipv4_mask);
            $stmt->bindParam(':ipv4_address',$ipv4_address  );
            $stmt->bindParam(':ipv6_mask', $ipv6_mask);
            $stmt->bindParam(':ipv6_address', $ipv6_address);
            $stmt->bindParam(':tx_bytes', $stats['tx_bytes']);
            $stmt->bindParam(':rx_bytes', $stats['rx_bytes']);
            $stmt->bindParam(':tx_packets', $stats['tx_packets']);
            $stmt->bindParam(':rx_packets', $stats['rx_packets']);
            $stmt->execute();
                 
        }
        
        //--LTE report (if present)
        if(isset($wan_stats['lteSignal'])){
             foreach($wan_stats['lteSignal'] as $lteEntry){
        
                $interface  = $lteEntry['interface'];
                $interface  = str_replace('mw','',$interface);
                 
                if (!isset($lteEntry['system']['lte']) || !isset($lteEntry['signal']['type'])) { //Sometimes the modem hangs
                    continue;
                }
                                           
                $stmt       = $conn->prepare("INSERT INTO wan_lte_stats (ap_id, node_id, mwan_interface_id,mcc,mnc,rsrp,rsrq,rssi,snr,type)  VALUES(:ap_id, :node_id, :interface, :mcc, :mnc, :rsrp, :rsrq, :rssi, :snr, :type)");             
                $lteData    = [
                    'ap_id'     => $ap_id,
                    'node_id'   => $node_id,
                    'interface' => $interface,
                    'mcc'       => $lteEntry['system']['lte']['mcc'],
                    'mnc'       => $lteEntry['system']['lte']['mnc'],
                    'rsrp'      => $lteEntry['signal']['rsrp'],
                    'rsrq'      => $lteEntry['signal']['rsrq'],
                    'rssi'      => $lteEntry['signal']['rssi'],
                    'snr'       => $lteEntry['signal']['snr'],
                    'type'      => $lteEntry['signal']['type']              
                ];
                $stmt->execute($lteData);       
            }
        
        } 
        
        //--WIFI report (if present)
        if(isset($wan_stats['wifiSignal'][0]['signal'])) {
             foreach($wan_stats['wifiSignal'] as $wifiEntry){     
                $interface  = $wifiEntry['interface'];
                $wifiEntry['interface'] = str_replace('mw','',$interface);
                $wifiEntry['ap_id']     = $ap_id;
                $wifiEntry['node_id']   = $node_id;
                
                if(isset($wifiEntry['expected_throughput'])){
                     unset($wifiEntry['expected_throughput']);
                } 
                                                           
                $stmt       = $conn->prepare("INSERT INTO wan_wifi_stats (ap_id, node_id, mwan_interface_id, noise ,ssid ,rx_packets ,tx_packets ,`signal` ,bitrate ,txpower ,tx_rate ,channel ,quality ,rx_rate)  VALUES(:ap_id ,:node_id ,:interface ,:noise ,:ssid ,:rx_packets ,:tx_packets ,:signal ,:bitrate ,:txpower ,:tx_rate ,:channel ,:quality ,:rx_rate)");             
                
                $stmt->execute($wifiEntry);       
            }
        }
        
        //--MWAN3 entry (if present)
        if(isset($wan_stats['mwanStatus'])){
        
            
            $mwanData = [
                'ap_id'    => $ap_id,
                'node_id'  => $node_id,
                'mwan3_status' =>  json_encode($wan_stats['mwanStatus'])
            ];
        
            // Check if the record exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM wan_mwan3_status WHERE ap_id = :ap_id OR node_id = :node_id");
            $stmt->execute(['ap_id' => $ap_id, 'node_id' => $node_id]);
            $exists = $stmt->fetchColumn() > 0;

            if ($exists) {
                // Update the existing record
                $stmt = $conn->prepare("
                    UPDATE wan_mwan3_status
                    SET mwan3_status = :mwan3_status,
                    modified = now()
                    WHERE ap_id = :ap_id OR node_id = :node_id
                ");
            } else {
                // Insert a new record
                $stmt = $conn->prepare("
                    INSERT INTO wan_mwan3_status (ap_id, node_id, mwan3_status)
                    VALUES (:ap_id, :node_id, :mwan3_status)
                ");
            }

            $stmt->execute($mwanData);     
        }                       
     }
}


function _doFullReport($node){

    global $conn,$mode,$rebootFlag; 
    _update_last_contact($node);
    $report = json_encode($_POST);
    if($node->reboot_flag == 1){
        $rebootFlag = true;
        _clear_reboot_flag($node);
    } 
    
    if($mode == 'mesh'){
        $stmt = $conn->prepare("INSERT into temp_reports (ap_id,ap_profile_id,node_id,mesh_id,report) VALUES(0,0,:node_id,:mesh_id,:report)");
        $stmt->execute(['node_id' => $node->id,'mesh_id' => $node->mesh_id,'report'=>$report]);  
    }
    
    if($mode == 'ap'){
        $stmt = $conn->prepare("INSERT into temp_reports (node_id,mesh_id,ap_id,ap_profile_id,report) VALUES(0,0,:ap_id,:ap_profile_id,:report)");
        $stmt->execute(['ap_id' => $node->id,'ap_profile_id' => $node->ap_profile_id,'report'=>$report]); 
    }
}

function _update_last_contact($node){
    global $conn,$mode;
    $table = 'nodes';
    if($mode == 'ap'){
        $table = 'aps';
    }
    
    $data = [
        'last_contact_from_ip'  => _getUserIpAddr(),
        'id'                    => $node->id
    ];  
    $stmt = $conn->prepare("UPDATE $table SET last_contact = NOW(), last_contact_from_ip = :last_contact_from_ip WHERE id = :id");
    $stmt->execute($data);
}

function _clear_reboot_flag($node){
    global $conn,$mode;
    $table = 'nodes';
    if($mode == 'ap'){
        $table = 'aps';
    }
      
    $data = [
        'reboot_flag'  => 0,
        'id'           => $node->id
    ];  
    $stmt = $conn->prepare("UPDATE $table SET reboot_flag = :reboot_flag WHERE id = :id");
    $stmt->execute($data);
}


function logger($message){
    global $logFlag;
    if($logFlag===true){
        print($message);
    }
}

/*
var resp_json  = {
    "items": [],
    "success": true,
    "reboot_flag": false,
    "reporting": {
        "report_adv_enable": true,
        "report_adv_proto": "http",
        "report_adv_light": 60,
        "report_adv_full": 600,
        "report_adv_sampling": 60
    }
};
*/

?>
