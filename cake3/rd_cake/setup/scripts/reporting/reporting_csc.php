<?php
//Some global variables
$servername = "10.139.176.149";
$username   = "rd";
$password   = "rd";
$conn       = false;
$conn2      = false;

$rebootFlag = false;
$logFlag    = false;

//Some defaults
$repSettings                        = [];
$repSettings['report_adv_enable']   = true;
$repSettings['report_adv_proto']    = 'http';
$repSettings['report_adv_light']    = 60;
$repSettings['report_adv_full']     = 600;
$repSettings['report_adv_sampling'] = 60;

main();

function main(){
    global $conn,$rebootFlag,$repSettings;
    doConnection();
    $commands = [];
    //Because we do JSON
    $_POST = json_decode(file_get_contents('php://input'), true);
    
    //--OLD FIRMWARE STYLE--
    if($_POST["network_info"]){
        if($_POST["network_info"]['eth0']){
            $mac = $_POST["network_info"]["eth0"];
            logger("Doing Report for $mac");
            $node = _getIdForMacOld($mac);
            if($node){
                logger("ID for MAC $mac is $node->id");
                _update_last_contact_old($node);
                _write_temp_old($node);                   
                $commands = _getAwaitingCommands($node->id);       
            }        
        }  
    }
       
    //--NEW FIRMWARE STYLE--  
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

function _getIdForMacOld($mac){
    global $conn;
    $id = false;
    $stmt = $conn->prepare("SELECT id,mesh_id FROM nodes WHERE mac = :mac");
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

function _write_temp_old($node){
    global $conn,$rebootFlag;
    error_log ("Writing Payload to temp table\n", 3, '/tmp/report_debug.log');
    $report = json_encode($_POST);   
    $stmt   = $conn->prepare("INSERT into temp_reports (node_id,mesh_id,report) VALUES(:node_id,:mesh_id,:report)");
    $stmt->execute(['node_id' => $node->id,'mesh_id' => $node->mesh_id,'report'=>$report]);
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
        
/*            
            $this->_new_do_uptm_history($entity);
            
            //Add node_stations and node_ibss_connections
            if (array_key_exists('network_info', $this->request->data)){ 
                $this->_node_stations($entity); //We send the entity along in case the mesh0/1/2 changed and it needs updating
            }
            
            //Build a lookup for the meshes
            $this->_doMeshMacLookup($entity->mesh_id);
            //Spider web
            $this->_do_vis();          
            
            //Update the Loads
            $this->_do_node_load($entity->id,$this->request->data['system_info']['sys']);
            //Update system info (if required)
            $this->_do_node_system_info($entity->id,$this->request->data['system_info']['sys']);
            
            
            $this->_fetchReportSettings($entity->mesh_id);
              
            //Fetch commands awaiting for unit  
            $commands = $this->{'NodeActions'}->find()
                ->where([
                    'NodeActions.status'    => 'awaiting',
                    'NodeActions.node_id'   => $entity->id
                ])->all();
            foreach($commands as $c){
                array_push($items,$c->id);
            }    
            
        }else{
            $this->_rebootFlagTest($mac);
        }
        return $items;
*/
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

function _update_last_contact_old($node){
    global $conn;  
    $data = [
        'last_contact_from_ip'  => _getUserIpAddr(),
        'id'                    => $node->id
    ];  
    $stmt = $conn->prepare("UPDATE nodes SET last_contact = NOW(), last_contact_from_ip = :last_contact_from_ip WHERE id = :id");
    $stmt->execute($data);
    
    $mesh_id = $node->mesh_id;
    $stmt = $conn->prepare("UPDATE meshes SET last_contact = NOW() WHERE id = :mesh_id");
    $stmt->execute(['mesh_id' => $mesh_id]);
    
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
        //print($message);
        error_log ($message, 3, '/tmp/report_debug.log');

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
