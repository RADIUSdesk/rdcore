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
                    if(isset($_POST['flows'])){
                        _addSoftflowLogs($node);
                    }
                    if(isset($_POST['qmi_info'])){
                        _addQmiInfo($node->id);
                    }
                    if(isset($_POST['vpn_info'])){
                        $vpn_info = $_POST['vpn_info'];
                        _addOpenVpn($vpn_info,$node);
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
    } 
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

function _addSoftflowLogs($node){

	global $conn,$mode;
    $flows = $_POST['flows'];   
    foreach ($flows as $fl){ 

		if($mode == 'mesh'){
		    $stmt = $conn->prepare("INSERT into temp_flow_logs (node_id,mesh_id,username,proto,src_mac,src_ip,src_port,dst_ip,dst_port,oct_in,pckt_in,oct_out,pckt_out,start,finish) VALUES(:node_id,:mesh_id,:username,:proto,:src_mac,:src_ip,:src_port,:dst_ip,:dst_port,:oct_in,:pckt_in,:oct_out,:pckt_out,:start,:finish)");
		    $stmt->execute([
		        'node_id'   => $node->id,
		        'mesh_id'   => $node->mesh_id,
		        'username'  => $fl['username'],
		        'proto'     => $fl['proto'],
		        'src_mac'   => $fl['src_mac'],
		        'src_ip'    => $fl['src_ip'],
		        'src_port'  => $fl['src_port'],
		        'dst_ip'    => $fl['dst_ip'],
		        'dst_port'  => $fl['dst_port'],
		        'oct_in'    => $fl['oct_in'],
		        'pckt_in'   => $fl['pckt_in'],
		        'oct_out'   => $fl['oct_out'],
		        'pckt_out'  => $fl['pckt_out'],
		        'start'     => $fl['start'],
		        'finish'    => $fl['finish'],
		    ]);      
		}
		
		if($mode == 'ap'){
		    $stmt = $conn->prepare("INSERT into temp_flow_logs (ap_id,ap_profile_id,username,proto,src_mac,src_ip,src_port,dst_ip,dst_port,oct_in,pckt_in,oct_out,pckt_out,start,finish) VALUES(:ap_id,:ap_profile_id,:username,:proto,:src_mac,:src_ip,:src_port,:dst_ip,:dst_port,:oct_in,:pckt_in,:oct_out,:pckt_out,:start,:finish)");
		    $stmt->execute([
		        'ap_id'   		=> $node->id,
		        'ap_profile_id' => $node->ap_profile_id,
		        'username'  	=> $fl['username'],
		        'proto'     	=> $fl['proto'],
		        'src_mac'   	=> $fl['src_mac'],
		        'src_ip'    	=> $fl['src_ip'],
		        'src_port'  	=> $fl['src_port'],
		        'dst_ip'    	=> $fl['dst_ip'],
		        'dst_port'  	=> $fl['dst_port'],
		        'oct_in'    	=> $fl['oct_in'],
		        'pckt_in'   	=> $fl['pckt_in'],
		        'oct_out'   	=> $fl['oct_out'],
		        'pckt_out'  	=> $fl['pckt_out'],
		        'start'     	=> $fl['start'],
		        'finish'    	=> $fl['finish'],
		    ]);       
		}        
    } 
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
