<?php
//Some global variables
$servername = "localhost";
$username   = "rd";
$password   = "rd";
$conn       = false;
$conn2      = false;

$rebootFlag = false;
$logFlag    = true;

//Some defaults
$repSettings                        = [];
$repSettings['report_adv_enable']   = true;
$repSettings['report_adv_proto']    = 'http';
$repSettings['report_adv_light']    = 60;
$repSettings['report_adv_full']     = 600;
$repSettings['report_adv_sampling'] = 60;

//SAMPLE TEXT
$sample_report = '{"report_type":"light","mac":"00-25-82-00-92-32","proxy_logs":[],"flows":[{"dst_port":"443","id":1,"oct_out":"2307","oct_in":"1516","username":"909_eynsham@909_eynsham_road","finish":"2021-02-24T07:28:53.069","pckt_in":"30","pckt_out":"10","src_ip":"10.1.1.2","start":"2021-02-24T07:28:52.396","dst_ip":"69.171.250.60","src_port":"37664","src_mac":"A8-9C-ED-76-1D-91"},{"dst_port":"443","id":2,"oct_out":"901","oct_in":"2899","username":"909_eynsham@909_eynsham_road","finish":"2021-02-24T07:29:47.773","pckt_in":"30","pckt_out":"6","src_ip":"10.1.1.2","start":"2021-02-24T07:29:47.413","dst_ip":"172.217.170.36","src_port":"46062","src_mac":"A8-9C-ED-76-1D-91"}]}';

//main();


wip();

function wip(){
    global $sample_report;
    global $conn;
    doConnection();
    
    logger("Doing WIP\n");
    $_POST = json_decode($sample_report,true);
    
    if($_POST["mac"]){
        $mac = $_POST["mac"];
        logger("Doing Report for $mac");
        $node = _getIdForMac($mac);
        if($node){
            if(isset($_POST['flows'])){
                _addSoftflowLogs($node->id,$node->mesh_id);
            }
        }
    }  
}

function main(){
    global $conn,$rebootFlag,$repSettings;
    doConnection();
    $commands = [];
    //Because we do JSON
    $_POST = json_decode(file_get_contents('php://input'), true);
      
    if($_POST["mac"]){
        $mac = $_POST["mac"];
        logger("Doing Report for $mac");
        $node = _getIdForMac($mac);
        if($node){
            logger("ID for MAC $mac is $node->id");
            if($_POST["report_type"]){
                $report_type = $_POST["report_type"];
                if($report_type == 'light'){
                    if(isset($_POST['wbw_info'])){
                        _addWbwInfo($node->id);
                    }
                    if(isset($_POST['proxy_logs'])){
                        _addProxyLogs($node->id,$node->mesh_id);
                    }
                    _doLightReport($node);                   
                }
                if($report_type == 'full'){
                    _doFullReport($node);
                }
                _fetchReportSettings($node->mesh_id);
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
    global $conn;
    $id = false;
    $stmt = $conn->prepare("SELECT id,mesh_id,reboot_flag FROM nodes WHERE mac = :mac");
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

function _fetchReportSettings($mesh_id){
    global $conn,$repSettings;
    //Get the common node settings for the timing
    $stmt = $conn->prepare("SELECT report_adv_proto,report_adv_light,report_adv_full,report_adv_sampling FROM node_settings WHERE mesh_id = :mesh_id");
    $stmt->execute(['mesh_id' => $mesh_id]);
    $ms = $stmt->fetch(PDO::FETCH_OBJ);
    if($ms){        
        $repSettings['report_adv_enable']   = true;
        $repSettings['report_adv_proto']    = $ms->report_adv_proto;
        $repSettings['report_adv_light']    = $ms->report_adv_light;
        $repSettings['report_adv_full']     = $ms->report_adv_full;
        $repSettings['report_adv_sampling'] = $ms->report_adv_sampling;
    }//Default is already set if not found    
}

function _getAwaitingCommands($node_id){
    global $conn;
    $items = [];
    $stmt = $conn->prepare("SELECT id FROM node_actions WHERE node_id = :node_id AND status='awaiting'");
    $stmt->execute(['node_id' => $node_id]);  
    while ($row = $stmt->fetch(PDO::FETCH_OBJ)){
         array_push($items,$row->id);
    }
    return $items;
}

function _addProxyLogs($node_id,$mesh_id){

    global $conn;
    $proxy_logs = $_POST['proxy_logs'];
    
    foreach ($proxy_logs as $pl){
    
        $stmt = $conn->prepare("INSERT into temp_proxy_logs (node_id,mesh_id,username,host,source_ip,mac,full_string,full_url) VALUES(:node_id,:mesh_id,:username,:host,:source_ip,:mac,:full_string,:full_url)");
        $stmt->execute([
            'node_id'       => $node_id,
            'mesh_id'       => $mesh_id,
            'username'      => $pl['username'],
            'host'          => $pl['host'],
            'source_ip'     => $pl['source_ip'],
            'mac'           => $pl['mac'],
            'full_string'   => $pl['full_string'],
            'full_url'      => $pl['full_url'],
            ]);
      
    } 
}

function _addSoftflowLogs($node_id,$mesh_id){

    global $conn;
    $flows = $_POST['flows'];
    
    foreach ($flows as $fl){      
        $stmt = $conn->prepare("INSERT into temp_flow_logs (node_id,mesh_id,username,src_mac,src_ip,src_port,dst_ip,dst_port,oct_in,pckt_in,oct_out,pckt_out,start,finish) VALUES(:node_id,:mesh_id,:username,:src_mac,:src_ip,:src_port,:dst_ip,:dst_port,:oct_in,:pckt_in,:oct_out,:pckt_out,:start,:finish)");
        $stmt->execute([
            'node_id'   => $node_id,
            'mesh_id'   => $mesh_id,
            'username'  => $fl['username'],
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
}


function _addWbwInfo($node_id){

    global $conn;
    $wbw_info = $_POST['wbw_info'];
    
    foreach (array_keys($wbw_info) as $key){
        $value  = $wbw_info[$key];
        $stmt   = $conn->prepare("SELECT id FROM node_connection_settings WHERE node_id = :node_id AND grouping='wbw_info' AND name=:key");
        $stmt->execute(['node_id' => $node_id,'key' =>$key]);   
        $result = $stmt->fetch(PDO::FETCH_OBJ);

        if(isset($result->id)){
            $stmt = $conn->prepare("UPDATE node_connection_settings SET modified = NOW(), value = :value WHERE id = :id");
            $stmt->execute(['id' => $result->id,'value' =>$value]);   
        }else{
            $stmt = $conn->prepare("INSERT into node_connection_settings (node_id,grouping,name,value,created,modified) VALUES(:node_id,'wbw_info',:key,:value,NOW(),NOW())");
            $stmt->execute(['node_id' => $node_id,'key' =>$key,'value'=>$value]);   
        }
    } 
}

function _doFullReport($node){

    global $conn,$rebootFlag; 
    _update_last_contact($node);
    if($node->reboot_flag == 1){
        $rebootFlag = true;
        _clear_reboot_flag($node);
    }   
    
    $report = json_encode($_POST);   
    $stmt = $conn->prepare("INSERT into temp_reports (node_id,mesh_id,report) VALUES(:node_id,:mesh_id,:report)");
    $stmt->execute(['node_id' => $node->id,'mesh_id' => $node->mesh_id,'report'=>$report]);
}

function _update_last_contact($node){
    global $conn;  
    $data = [
        'last_contact_from_ip'  => _getUserIpAddr(),
        'id'                    => $node->id
    ];  
    $stmt = $conn->prepare("UPDATE nodes SET last_contact = NOW(), last_contact_from_ip = :last_contact_from_ip WHERE id = :id");
    $stmt->execute($data);
}

function _clear_reboot_flag($node){
    global $conn;  
    $data = [
        'reboot_flag'  => 0,
        'id'           => $node->id
    ];  
    $stmt = $conn->prepare("UPDATE nodes SET reboot_flag = :reboot_flag WHERE id = :id");
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
