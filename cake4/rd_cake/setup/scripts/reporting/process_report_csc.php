<?php

#Improved reporting for meshes (also modify the Nginx config file accordingly)
#Every five minutes, process any reports from the temp_reports table (also check the syslog file there will be a report from this script saying how long it took ... should be under 5 min!!)
#*/5 * * * * www-data php /var/www/html/cake3/rd_cake/setup/scripts/reporting/process_report.php >> /dev/null 2>&1


//Some global variables
$servername = "10.139.176.149";
$username   = "rd";
$password   = "rd";
$conn       = false;
$conn2      = false;

$rebootFlag = false;
$logFlag    = false;

//Some defaults
$MeshMacLookup    = [];
$counter    = 0;

$start_time = microtime(true);

//Statements
//Uptime Histories

doConnection();

//Node Uptimes
$stmt_uth_C    = $conn->prepare("INSERT into node_uptm_histories (node_id,node_state,state_datetime,report_datetime,created,modified) VALUES(:node_id,'1',NOW(),NOW(),NOW(),NOW())");
$stmt_uth_R    = $conn->prepare("SELECT * FROM node_uptm_histories WHERE node_id = :node_id ORDER BY report_datetime DESC");
$stmt_uth_U    = $conn->prepare("UPDATE node_uptm_histories SET modified = NOW(),report_datetime = NOW() WHERE id = :id");

$stmt_ns_C  = $conn->prepare("INSERT into node_stations(vendor,mac,tx_bytes,rx_bytes,tx_packets,rx_packets,tx_bitrate,rx_bitrate,tx_extra_info,rx_extra_info,authorized,authenticated,tdls_peer,preamble,tx_failed,inactive_time,WMM_WME,tx_retries,MFP, signal_now,signal_avg,mesh_entry_id,node_id,created,modified) VALUES(:vendor,:mac,:tx_bytes,:rx_bytes,:tx_packets,:rx_packets,:tx_bitrate,:rx_bitrate,:tx_extra_info,:rx_extra_info,:authorized,:authenticated,:tdls_peer,:preamble,:tx_failed,:inactive_time,:WMM_WME,:tx_retries,:MFP, :signal_now,:signal_avg,:mesh_entry_id,:node_id,NOW(),NOW())");


$stmt_ns_U  = $conn->prepare("UPDATE node_stations SET tx_bytes=:tx_bytes,rx_bytes=:rx_bytes,tx_packets=:tx_packets,rx_packets=:rx_packets,tx_bitrate=:tx_bitrate, rx_bitrate=:rx_bitrate,tx_failed=:tx_failed,inactive_time=:inactive_time,tx_retries=:tx_retries,signal_now=:signal_now,signal_avg=:signal_avg,modified = NOW() WHERE id = :id");

$remove_fields = ['vendor','mac','tx_extra_info','rx_extra_info','authorized', 'authenticated','tdls_peer','preamble','WMM_WME','MFP','mesh_entry_id','node_id'];


$stmt_nibss_C  = $conn->prepare("INSERT into node_ibss_connections(vendor,mac,tx_bytes,rx_bytes,tx_packets,rx_packets,tx_bitrate,rx_bitrate,tx_extra_info,rx_extra_info,authorized,authenticated,tdls_peer,preamble,tx_failed,inactive_time,WMM_WME,tx_retries,MFP, signal_now,signal_avg,station_node_id,node_id,created,modified) VALUES(:vendor,:mac,:tx_bytes,:rx_bytes,:tx_packets,:rx_packets,:tx_bitrate,:rx_bitrate,:tx_extra_info,:rx_extra_info,:authorized,:authenticated,:tdls_peer,:preamble,:tx_failed,:inactive_time,:WMM_WME,:tx_retries,:MFP, :signal_now,:signal_avg,:station_node_id,:node_id,NOW(),NOW())");


$stmt_nibss_U  = $conn->prepare("UPDATE node_ibss_connections SET tx_bytes=:tx_bytes,rx_bytes=:rx_bytes,tx_packets=:tx_packets,rx_packets=:rx_packets,tx_bitrate=:tx_bitrate, rx_bitrate=:rx_bitrate,tx_failed=:tx_failed,inactive_time=:inactive_time,tx_retries=:tx_retries,signal_now=:signal_now,signal_avg=:signal_avg,modified = NOW() WHERE id = :id");

$remove_fields_ibss = ['vendor','mac','tx_extra_info','rx_extra_info','authorized', 'authenticated','tdls_peer','preamble','WMM_WME','MFP','station_node_id','node_id'];



main();

// End clock time in seconds 
$end_time = microtime(true);   
// Calculate script execution time 
$execution_time = ($end_time - $start_time);

$log_message = " $counter reports processed in: ".$execution_time." sec";
echo $log_message."\n";
openlog('radiusdesk', LOG_CONS | LOG_NDELAY | LOG_PID, LOG_USER | LOG_PERROR);
syslog(LOG_INFO, $log_message);
closelog();  

function main(){
    global $conn,$rebootFlag,$repSettings;
    _doReports();  
}
 
function doConnection(){

    global $servername,$username,$password,$conn;
    try {
        $conn = new PDO("mysql:host=$servername;dbname=rd", $username, $password,[PDO::ATTR_PERSISTENT => true]);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);   
        $conn->setAttribute( PDO::ATTR_EMULATE_PREPARES, false );
    }
    catch(PDOException $e){
        echo "Connection failed: " . $e->getMessage();
    } 
}

function _doReports(){
    global $conn,$MeshMacLookup,$counter;
    print("Do Reports");
    $completed = [];
    $conclusion = [];
    $stmt = $conn->prepare("SELECT * FROM temp_reports");
    $stmt->execute();  
    while ($row = $stmt->fetch(PDO::FETCH_OBJ)){
        $node_id = $row->node_id;
        print("Now Doing ID $row->id\n");
        $counter++;
        array_push($completed,$row->id);
        //Make sure the node is still in the nodes table (if it was deleted we don't care)
        $node = _get_node($row->node_id);
        if(!(isset($node->id))){
            array_push($completed,$row->id);
             print("WARNING -> NODE $row->node_id IS MISSING (Skipping $row->id)\n");
            continue;//Skip firther execution of this iteration
        }
       
        $report = json_decode($row->report,true);
           
        _new_do_uptm_history($row);
        //Build a lookup for the meshes
        _doMeshMacLookup($row->mesh_id);
        
        
        //Auto captive portal sometimes then does not have this item
        if (array_key_exists(0, $report['network_info']['radios'])) {
            $r0 = $report['network_info']['radios'][0]['interfaces'];
            _do_radio_interfaces($node, $r0);
        }

        //If it is a dual radio --- report on it also ----
        if (array_key_exists(1, $report['network_info']['radios'])) {
            $r1 = $report['network_info']['radios'][1]['interfaces'];
            _do_radio_interfaces($node, $r1);
        }
                
               
        //Spider web
        _do_vis($row->mesh_id,$report); 
               
        //Update the Loads
        _do_node_load($node_id,$report['system_info']['sys']);
        //Update system info (if required)
        _do_node_system_info($node_id,$report['system_info']['sys']);
        
       
        
        //------------
        //--- Check if there are any lan_info items here
        $gateway    = 'none';
        $lan_proto  = '';
        $lan_gw     = '';
        $lan_ip     = '';
        
        if (array_key_exists('lan_info', $report)) {
            $lan_proto  = $report['lan_info']['lan_proto'];
            $lan_gw     = $report['lan_info']['lan_gw'];
            $lan_ip     = $report['lan_info']['lan_ip'];
        }
        //--Check if we need to update the gateway field
        if (array_key_exists('gateway', $report)){
            $gateway = $report['gateway']; 
        }
        $c_data = ['gateway' => $gateway, 'lan_proto' => $lan_proto, 'lan_gw' => $lan_gw, 'lan_ip' => $lan_ip,'id' => $row->node_id];
         
        if(array_key_exists($row->mesh_id,$conclusion)){
            if(array_key_exists($row->node_id,$conclusion[$row->mesh_id])){
                $conclusion[$row->mesh_id][$row->node_id] = $c_data;
            }else{
                $conclusion[$row->mesh_id][$row->node_id] = [];
                $conclusion[$row->mesh_id][$row->node_id] = $c_data;
            }
        }else{
            $conclusion[$row->mesh_id] = [];
            $conclusion[$row->mesh_id][$row->node_id] = [];
            $conclusion[$row->mesh_id][$row->node_id] = $c_data;
        }
        //--------------
                          
    }
    
    $stmt_update_mesh = $conn->prepare("UPDATE meshes SET last_contact = NOW() WHERE id = :mesh_id");
    $stmt_update_node = $conn->prepare("UPDATE nodes SET gateway = :gateway, lan_proto = :lan_proto, lan_gw = :lan_gw, lan_ip = :lan_ip  WHERE id = :id");
    foreach(array_keys($conclusion) as $m){
        $stmt_update_mesh->execute(['mesh_id' => $m]);
        foreach(array_keys($conclusion[$m]) as $n){
            $node_data = $conclusion[$m][$n];
            $stmt_update_node->execute($node_data);
        }   
    }
        
    $stmt_del_nodes   = $conn->prepare("DELETE FROM temp_reports WHERE id = :id");
    foreach($completed as $i){
        $stmt_del_nodes->execute(['id' => $i]);  
    }
}

function _get_node($node_id){
    global $conn;
    $node_missing = true;
    $stmt = $conn->prepare("SELECT * FROM nodes WHERE id = :id");
    $stmt->execute(['id' => $node_id]);
    $node = $stmt->fetch(PDO::FETCH_OBJ);
    if(isset($node->id)){
        return $node;
    }
    return false;
}

function _new_do_uptm_history($entity){
    global $stmt_uth_C,$stmt_uth_U,$stmt_uth_R;
    $node_id    = $entity->node_id;         
    $stmt_uth_R->execute(['node_id' => $node_id]);
    $result     = $stmt_uth_R->fetch(PDO::FETCH_OBJ);  
    if(isset($result->id)){
        if ($result->node_state == 1){
            $stmt_uth_U->execute(['id' => $result->id]);    
        }else{       
            $stmt_uth_C->execute(['node_id' => $node_id]);      
        } 
    }else{
         $stmt_uth_C->execute(['node_id' => $node_id]);     
    } 
}

function _do_radio_interfaces($node,$interfaces){
    global $conn,$stmt_ns_C,$stmt_ns_U,$remove_fields,$MeshMacLookup,$stmt_nibss_C,$stmt_nibss_U,$remove_fields_ibss;
   
    $node_id = $node->id;
    $mesh_id = $node->mesh_id;
   
    foreach ($interfaces as $i) {
        if (count($i['stations']) > 0) {
           //Try to find (if type=AP)the Entry ID of the Mesh   
           //=== 
                
            if ($i['type'] == 'AP') {
            
                $stmt = $conn->prepare("SELECT * FROM mesh_entries WHERE name = :name AND mesh_id = :mesh_id"); //Only first one 
                $stmt->execute(['name' => $i['ssid'],'mesh_id' => $mesh_id]);
                $entity = $stmt->fetch(PDO::FETCH_OBJ);
                    
                if(isset($entity->id)) {
                    $entry_id = $entity->id;
                    foreach ($i['stations'] as $s) {
                        $data = _prep_station_data($s);
                        $data['mesh_entry_id']  = $entry_id;
                        $data['node_id']        = $node_id;
                        $entity_mac = false;
                   
                        //--Check the last entry for this MAC
                        $stmt = $conn->prepare("SELECT * FROM node_stations WHERE mesh_entry_id = :mesh_entry_id AND node_id = :node_id AND mac = :mac ORDER BY created DESC LIMIT 1"); // Get the most recent one
                        $stmt->execute([   
                            'mesh_entry_id'=> $entry_id,
                            'node_id'      => $node_id,
                            'mac'          => $data['mac']
                        ]);
                        $entity_mac = $stmt->fetch(PDO::FETCH_OBJ);
     
                        $new_flag = true;
                        
                        if(isset($entity_mac->id)) {
                            $old_tx = $entity_mac->tx_bytes;
                            $old_rx = $entity_mac->rx_bytes;
                            if (($data['tx_bytes'] >= $old_tx)&($data['rx_bytes'] >= $old_rx)) {
                                $new_flag = false;
                            }
                        }                                      
                        
                        if ($new_flag) {
                            $stmt_ns_C->execute($data);
                        }else{
                            $data['id'] = $entity_mac->id;
                            foreach($remove_fields as $field){
                                unset($data[$field]);
                            }
                            $stmt_ns_U->execute($data);
                        }                              
                    }
                }
            }      
            //===
            
            //===

            //If the type is IBSS we will try to determine which nodes are connected
            //April 2016 - We now also include support for mesh node (802.11s)
            if (($i['type'] == 'IBSS')||($i['type'] == 'mesh point')) {
            
                //Record the MAC
                $name   = $i['name'];
                $m_mac  = $i['mac'];
                
                //Update the mesh colunm with the latest mac
                if($node->{"$name"} !== $m_mac){
                    $node->{"$name"} = $m_mac;
                    if($name=='mesh0'){
                        $stmt_update = $conn->prepare("UPDATE nodes SET mesh0=:m_mac WHERE id = :id");                                   
                    }
                    if($name=='mesh1'){
                        $stmt_update = $conn->prepare("UPDATE nodes SET mesh1=:m_mac WHERE id = :id");
                    } 
                    if($name=='mesh2'){
                        $stmt_update = $conn->prepare("UPDATE nodes SET mesh2= :m_mac WHERE id = :id");
                    }
                    $stmt_update->execute(['id' => $node_id, 'm_mac'=> $m_mac]);
                }
                           
                foreach ($i['stations'] as $s) {
                    $data               = _prep_station_data($s);
                    $data['node_id']    = $node_id;
                    $m                  = $s['mac'];
                    $data['station_node_id'] = ''; //default is empty
                    
                    //Jan 2018 Also see if we can find the station node id
                    if (array_key_exists($m, $MeshMacLookup[$mesh_id])){
                        $data['station_node_id'] = $MeshMacLookup[$mesh_id][$m]['id'];
                    }
                    
                    $stmt = $conn->prepare("SELECT * FROM node_ibss_connections WHERE node_id = :node_id AND mac = :mac ORDER BY created DESC LIMIT 1"); // Get the most recent one
                    $stmt->execute([   
                        'node_id'      => $node_id,
                        'mac'          => $data['mac']
                    ]);
                    $entity_mac = $stmt->fetch(PDO::FETCH_OBJ);
                      
                    $new_flag = true;
                    if ($entity_mac) {
                        $old_tx = $entity_mac->tx_bytes;
                        $old_rx = $entity_mac->rx_bytes;     
                        if (($data['tx_bytes'] >= $old_tx)&($data['rx_bytes'] >= $old_rx)) {
                            $new_flag   = false;
                        }
                    }                   
                    if ($new_flag) {
                         $stmt_nibss_C->execute($data);
                    }else{
                        $data['id'] = $entity_mac->id;
                        foreach($remove_fields_ibss as $field){
                            unset($data[$field]);
                        }
                        $stmt_nibss_U->execute($data);
                    }
                }
            }
            
        }
    }
}

function _node_stations($d,$node_id){
    global $conn;
    foreach(array_keys($d['radios']) as $radio) {
        if (array_key_exists('interfaces',$d['radios'][$radio])){
            foreach($d['radios'][$radio]['interfaces'] as $interface){ 
                if(!empty($interface['stations'])){
                    if (($interface['type'] == 'AP')&&($interface['mesh_entry_id'] !== 0)) {              
                        foreach(array_keys($interface['stations']) as $s_mac){ //Only if there are any stations listed
                            $s_data                     = $interface;
                            $s_data['radio_number']     = $radio;
                            unset($s_data['mac']);
                            unset($s_data['stations']);   
                            
                            $s_data                     = array_merge($s_data, $interface['stations'][$s_mac]);                             
                            $s_data['created']          = date("Y-m-d H:i:s", $s_data['first_timestamp']);
                            $s_data['modified']         = date("Y-m-d H:i:s", $s_data['unix_timestamp']);
                            
                            $ns_array   = [
                                'node_id'           => $s_data['node_id'],//1
                                'radio_number'      => $s_data['radio_number'],//2
                                'frequency_band'    => $s_data['frequency_band'],//3
                                'mesh_entry_id'     => $s_data['mesh_entry_id'],//4
                                'mac'               => $s_data['mac'],//5
                                'rx_bytes'          => $s_data['rx_bytes'],//6
                                'tx_bytes'          => $s_data['tx_bytes'],//7
                                'rx_bitrate'        => $s_data['rx_bitrate'],//8
                                'tx_bitrate'        => $s_data['tx_bitrate'],//9
                                'rx_packets'        => $s_data['rx_packets'],//10
                                'tx_packets'        => $s_data['tx_packets'],//11
                                'authenticated'     => $s_data['authenticated'],//12
                                'authorized'        => $s_data['authorized'],//13
                                'tdls_peer'         => $s_data['tdls_peer'],//14
                                'preamble'          => $s_data['preamble'],//15
                                'tx_failed'         => $s_data['tx_failed'],//16
                                'wmm_wme'           => $s_data['wmm_wme'],//17
                                'tx_retries'        => $s_data['tx_retries'],//18
                                'mfp'               => $s_data['mpf'],//Dislectic FIXME//19
                                'signal_now'        => $s_data['signal_now'],//20
                                'signal_avg'        => $s_data['signal_avg'],//21,
                                'created'           => $s_data['created'],//22
                                'modified'          => $s_data['modified']//23          
                            ];                            
                            
                            $stmt = $conn->prepare("INSERT into node_stations (node_id,radio_number,frequency_band,mesh_entry_id,mac,tx_bytes,rx_bytes,tx_bitrate,rx_bitrate,tx_packets,rx_packets,authenticated,authorized,tdls_peer,preamble,tx_failed,wmm_wme,tx_retries,mfp,signal_now,signal_avg,created,modified)VALUES(:node_id,:radio_number,:frequency_band,:mesh_entry_id,:mac,:tx_bytes,:rx_bytes,:tx_packets,:rx_packets,:tx_bitrate,:rx_bitrate,:authenticated,:authorized,:tdls_peer,:preamble,:tx_failed,:wmm_wme,:tx_retries,:mfp,:signal_now,:signal_avg,:created,:modified)");
                            //$stmt->execute($ns_array); 
                        }
                    }  
                    if (($interface['type'] == 'IBSS')||($interface['type'] == 'mesh point')) {
                    
                        //Record the MAC
                        $name   = $interface['name'];
                        $m_mac  = $interface['mac']; 
                        
                        $f_band = $interface['frequency_band'];
                        $power  = $interface['txpower'];
                        $channel= $interface['channel'];    
                        
                        //Update the mesh colunm with the latest mac (only if there were a change)
                        $stmt = $conn->prepare("SELECT * FROM nodes WHERE id = :id");
                        $stmt->execute(['id' => $node_id]);
                        $node = $stmt->fetch(PDO::FETCH_OBJ);
                        if(isset($node->id)){
                            if($node->{"$name"} !== $m_mac){
                                if($name=='mesh0'){
                                    $stmt_update = $conn->prepare("UPDATE nodes SET mesh0= :m_mac, mesh0_frequency_band= :f_band, mesh0_txpower= :power, mesh0_channel= :channel WHERE id = :id");
                                    
                                }
                                if($name=='mesh1'){
                                    $stmt_update = $conn->prepare("UPDATE nodes SET mesh1= :m_mac, mesh1_frequency_band= :f_band, mesh1_txpower= :power, mesh1_channel= :channel WHERE id = :id");
                                } 
                                if($name=='mesh2'){
                                      $stmt_update = $conn->prepare("UPDATE nodes SET mesh2= :m_mac, mesh2_frequency_band= :f_band, mesh2_txpower= :power, mesh2_channel= :channel WHERE id = :id");
                                }
                                $stmt_update->execute([
                                    'id'        => $node_id,    'm_mac'=> $m_mac,
                                    'f_band'    => $f_band,     'power'=>$power,
                                    'channel'   =>$channel
                                ]);                                
                            }
                        }
                                                    
                        foreach(array_keys($interface['stations']) as $s_mac){ //Only if there are any stations listed
                            $s_data                     = $interface;
                            $s_data['radio_number']     = $radio;
                            $s_data['if_mac']           = $s_data['mac'];
                            unset($s_data['mac']);
                            unset($s_data['stations']);                    
                            $s_data                     = array_merge($s_data, $interface['stations'][$s_mac]);
                            $s_data['created']          = date("Y-m-d H:i:s", $s_data['first_timestamp']);
                            $s_data['modified']         = date("Y-m-d H:i:s", $s_data['unix_timestamp']);
                            
                            $s_array =  [
                                'node_id'           => $s_data['node_id'],//1
                                'radio_number'      => $s_data['radio_number'],//2
                                'frequency_band'    => $s_data['frequency_band'],//3
                                'if_mac'            => $s_data['if_mac'],//4
                                'mac'               => $s_data['mac'],//5
                                'rx_bytes'          => $s_data['rx_bytes'],//6
                                'tx_bytes'          => $s_data['tx_bytes'],//7
                                'rx_bitrate'        => $s_data['rx_bitrate'],//8
                                'tx_bitrate'        => $s_data['tx_bitrate'],//9
                                'rx_packets'        => $s_data['rx_packets'],//10
                                'tx_packets'        => $s_data['tx_packets'],//11
                                'authenticated'     => $s_data['authenticated'],//12
                                'authorized'        => $s_data['authorized'],//13
                                'tdls_peer'         => $s_data['tdls_peer'],//14
                                'preamble'          => $s_data['preamble'],//15
                                'tx_failed'         => $s_data['tx_failed'],//16
                                'tx_retries'        => $s_data['tx_retries'],//17
                                'mfp'               => $s_data['mpf'],//Dislectic FIXME//18
                                'signal_now'        => $s_data['signal_now'],//19
                                'signal_avg'        => $s_data['signal_avg'],//20,
                                'created'           => $s_data['created'],//21
                                'modified'          => $s_data['modified']//22 
                            ];
                                                      
                            $stmt = $conn->prepare("INSERT into node_ibss_connections (node_id,radio_number,frequency_band,if_mac,mac,tx_bytes,rx_bytes,tx_packets,rx_packets,tx_bitrate,rx_bitrate,authenticated,authorized,tdls_peer,preamble,tx_failed,tx_retries,mfp,signal_now,signal_avg,created,modified) VALUES(:node_id,:radio_number,:frequency_band,:if_mac,:mac,:tx_bytes,:rx_bytes,:tx_packets,:rx_packets,:tx_bitrate,:rx_bitrate,:authenticated,:authorized,:tdls_peer,:preamble,:tx_failed,:tx_retries,:mfp,:signal_now,:signal_avg,:created,:modified)");
                            //$stmt->execute($s_array); 
                        }
                    }     
                }
            }
        } 
    }
}

function _doMeshMacLookup($mesh_id){
    global $conn,$MeshMacLookup;
    //Build lookup table for mesh mac's
    
    if(isset($MeshMacLookup[$mesh_id])){
        return;
    }else{
        $MeshMacLookup[$mesh_id] = [];
    }
    
    $stmt = $conn->prepare("SELECT * FROM nodes WHERE mesh_id = :mesh_id");
    $stmt->execute(['mesh_id' => $mesh_id]);

    while ($i = $stmt->fetch(PDO::FETCH_OBJ)){
        $gateway    = 'no';
        if($i->gateway !== 'none'){
            $gateway = 'yes';
        }       
        if($i->{'mesh0'} !== ''){  
        
            $hwmode     = '11g'; //default
            $gateway    = 'no';
            if($i->radio0_band == 5){
                $hwmode = '11a';
            }
            
            if($i->gateway == 'lan'){
                $gateway = 'yes';
            }
            $MeshMacLookup[$mesh_id][$i->{'mesh0'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
        }
        if($i->{'mesh1'} !== ''){
            $hwmode     = '11g'; //default
            $gateway    = 'no';
            if($i->radio1_band == 5){
                $hwmode = '11a';
            }
            if($i->gateway == 'lan'){
                $gateway = 'yes';
            }   
            $MeshMacLookup[$mesh_id][$i->{'mesh1'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
        }
        if($i->{'mesh2'} !== ''){ //For future    
            $hwmode     = '11g'; //default
            $gateway    = 'no';
            if($i->radio2_band == 5){
                $hwmode = '11a';
            }
            if($gateway == 'lan'){
                $gateway = 'yes';
            }
            $MeshMacLookup[$mesh_id][$i->{'mesh2'}] = ['id' =>$i->id,'gateway' => $gateway,'hwmode' => $hwmode];
        }
    }
}

function _do_vis($mesh_id,$d){
    global $conn,$MeshMacLookup;   
    if (array_key_exists('vis',$d)) {     
        foreach ($d['vis'] as $vis) {
            $metric         = $vis['metric'];
            $neighbor       = $vis['neighbor'];
            $router         = $vis['router'];
            
            $neighbor_id    = false;
            $node_id        = false;
            if (array_key_exists($neighbor, $MeshMacLookup[$mesh_id])) {
                $neighbor_id    = $MeshMacLookup[$mesh_id]["$neighbor"]['id'];
            }
            
            if (array_key_exists($router, $MeshMacLookup[$mesh_id])) {
                $node_id    = $MeshMacLookup[$mesh_id]["$router"]['id'];
                $gateway    = $MeshMacLookup[$mesh_id]["$router"]['gateway'];
                $hwmode     = $MeshMacLookup[$mesh_id]["$router"]['hwmode'];
            }
            
            if(($neighbor_id)&&($node_id)){  
                $stmt       = $conn->prepare("SELECT * FROM node_neighbors WHERE node_id = :node_id AND neighbor_id = :neighbor_id");
                $stmt->execute(['node_id' => $node_id,'neighbor_id' => $neighbor_id]);
                $result     = $stmt->fetch(PDO::FETCH_OBJ);     
                if(isset($result->id)){
                    $stmt = $conn->prepare("UPDATE node_neighbors SET metric=:metric,gateway=:gateway,hwmode=:hwmode,modified = NOW() WHERE id = :id");
                    $stmt->execute(['metric' => $metric,'gateway' => $gateway,'hwmode' => $hwmode,'id' => $result->id]);                    
                }else{
                    $stmt = $conn->prepare("INSERT into node_neighbors (node_id,neighbor_id,metric,gateway,hwmode,created,modified) VALUES(:node_id,:neighbor_id,:metric,:gateway,:hwmode,NOW(),NOW())");
                     $stmt->execute(['node_id' => $node_id,'neighbor_id'=>$neighbor_id,'metric'=>$metric,'gateway'=>$gateway,'hwmode'=>$hwmode]);     
                } 
            }
        }
    }
}

function _do_node_load($node_id, $info){

    global $conn;
    $mem_total  = _mem_kb_to_bytes($info['memory']['total']);
    $mem_free   = _mem_kb_to_bytes($info['memory']['free']);
    $u          = $info['uptime'];
    $time       = preg_replace('/\s+up.*/', "", $u);
    $load       = preg_replace('/.*.\s+load average:\s+/', "", $u);
    $loads      = explode(", ", $load);
    $up         = preg_replace('/.*\s+up\s+/', "", $u);
    $up         = preg_replace('/,\s*.*/', "", $up); 
      
    $stmt       = $conn->prepare("SELECT * FROM node_loads WHERE node_id = :node_id");
    $stmt->execute(['node_id' => $node_id]);
    $result     = $stmt->fetch(PDO::FETCH_OBJ);     
    if(isset($result->id)){
        $stmt = $conn->prepare("UPDATE node_loads SET mem_total=:mem_total,mem_free=:mem_free,uptime=:uptime,system_time=:system_time,load_1=:load_1,load_2=:load_2,load_3=:load_3,modified = NOW() WHERE id = :id");
        $stmt->execute([
            'mem_total'     => $mem_total,
            'mem_free'      => $mem_free,
            'uptime'        => $up,
            'system_time'   => $time,
            'load_1'        => $loads[0],
            'load_2'        => $loads[1],
            'load_3'        => $loads[2],
            'id'            => $result->id
        ]);    
        
    }else{
        $stmt = $conn->prepare("INSERT into node_loads (mem_total,mem_free,uptime,system_time,load_1,load_2,load_3,node_id,created,modified)VALUES(:mem_total,:mem_free,:uptime,:system_time,:load_1,:load_2,:load_3,:node_id,NOW(),NOW())");
         $stmt->execute([
            'mem_total'     => $mem_total,
            'mem_free'      => $mem_free,
            'uptime'        => $up,
            'system_time'   => $time,
            'load_1'        => $loads[0],
            'load_2'        => $loads[1],
            'load_3'        => $loads[2],
            'node_id'       => $node_id
        ]);   
    }
}

//FIXME Ensure that the Firmware also includes a 'DISTRIB_BUILD' in the release file    
function _do_node_system_info($node_id, $info){

    global $conn;

    $stmt   = $conn->prepare("SELECT * FROM node_systems WHERE node_id = :node_id AND name='DISTRIB_BUILD'");
    $stmt->execute(['node_id' => $node_id]);
    $result = $stmt->fetch(PDO::FETCH_OBJ);     
    $create_flag    = true;
        
    if(isset($result->id)){
        $create_flag   = false; //Unset the create flag first
        //Get the current value
        $current_dist_build = $result->value;
        //Try and check if the value of $dist_build changed.
        $new_dist_build = false;
        if (array_key_exists('release', $info)) {
            $release_array = explode("\n", $info['release']);
            foreach ($release_array as $r) {
                $r_entry    = explode('=', $r);
                $elements   = count($r_entry);
                if ($elements == 2) {
                    $value          = preg_replace('/"|\'/', "", $r_entry[1]);
                    if (preg_match('/DISTRIB_BUILD/', $r_entry[0])) {
                        $new_dist_build = $value;
                        break;
                    }
                }
            }
        }
            
        if($current_dist_build !== $new_dist_build){ //They differ -> Set the flag again
            $create_flag = true;
        }  
    }
   
    if($create_flag){
        //Wipe all the old entries
        $stmt   = $conn->prepare("DELETE FROM node_systems WHERE node_id = :node_id");
        $stmt->execute(['node_id' => $node_id]);
        //--CPU Info--
         
        if (array_key_exists('cpu', $info)) {
            foreach (array_keys($info['cpu']) as $key) {               
                $stmt = $conn->prepare("INSERT into node_systems (category,name,value,node_id,created,modified)VALUES('cpu',:key,:value,:node_id,NOW(),NOW())");
                $stmt->execute([
                    'key'     => $key,
                    'value'   => $info['cpu']["$key"],
                    'node_id' => $node_id
                ]);
            }
        }
        
        //--
        if (array_key_exists('release', $info)) {
            $release_array = explode("\n", $info['release']);
            foreach ($release_array as $r) {
                $r_entry    = explode('=', $r);
                $elements   = count($r_entry);
                if ($elements == 2) {
                    $value  = preg_replace('/"|\'/', "", $r_entry[1]);     
                    $stmt   = $conn->prepare("INSERT into node_systems (category,name,value,node_id,created,modified)VALUES('release',:key,:value,:node_id,NOW(),NOW())");
                    $stmt->execute([
                        'key'     => $r_entry[0],
                        'value'   => $value,
                        'node_id' => $node_id
                    ]);
                }
            }
        }
    }
}

function _mem_kb_to_bytes($kb_val){
    $kb = preg_replace('/\s*kb/i', "", $kb_val);
    return($kb * 1024);
}


function logger($message){
    global $logFlag;
    if($logFlag===true){
        print($message);
    }
}

function _prep_station_data($station_info){
        $data       = [];
        $tx_proc    = $station_info['tx bitrate'];
        $tx_bitrate = preg_replace('/\s+.*/', '', $tx_proc);
        $tx_extra   = preg_replace('/.*\s+/', '', $tx_proc);
        
        $rx_bitrate = 0;
        $rx_extra   = '';
        
        if(isset($station_info['rx bitrate'])){
            $rx_proc    = $station_info['rx bitrate'];
            $rx_bitrate = preg_replace('/\s+.*/', '', $rx_proc);
            $rx_extra   = preg_replace('/.*\s+/', '', $rx_proc);
        }
        $incative   = preg_replace('/\s+ms.*/', '', $station_info['inactive time']);
        $s          = preg_replace('/\s+\[.*/', '', $station_info['signal']);
        $s          = preg_replace('/\s+dBm/', '', $s);
        $a          = preg_replace('/\s+\[.*/', '', $station_info['avg']);
        $a          = preg_replace('/\s+dBm/', '', $a);

        //$data['vendor']        = $this->_lookup_vendor($station_info['mac']); //FIXME Leave for now
        $data['vendor']        = '';
        $data['mac']           = $station_info['mac'];
        $data['tx_bytes']      = $station_info['tx bytes'];
        $data['rx_bytes']      = $station_info['rx bytes'];
        $data['tx_packets']    = $station_info['tx packets'];
        $data['rx_packets']    = $station_info['rx packets'];
        $data['tx_bitrate']    = $tx_bitrate;
        $data['rx_bitrate']    = $rx_bitrate;
        $data['tx_extra_info'] = $tx_extra;
        $data['rx_extra_info'] = $rx_extra;
        $data['authorized']    = $station_info['authorized'];
        $data['authenticated'] = $station_info['authenticated'];
        $data['tdls_peer']     = $station_info['TDLS peer'];
        $data['preamble']      = $station_info['preamble'];
        $data['tx_failed']     = $station_info['tx failed'];
        $data['tx_failed']     = $station_info['tx failed'];
        $data['inactive_time'] = $incative;
        $data['WMM_WME']       = $station_info['WMM/WME'];
        $data['tx_retries']    = $station_info['tx retries'];
        $data['MFP']           = $station_info['MFP'];
        $data['signal_now']    = $s;
        $data['signal_avg']    = $a;
        return $data;
    }

?>
