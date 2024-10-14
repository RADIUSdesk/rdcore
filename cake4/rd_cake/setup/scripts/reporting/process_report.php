<?php

#Improved reporting for meshes (also modify the Nginx config file accordingly)
#Every five minutes, process any reports from the temp_reports table (also check the syslog file there will be a report from this script saying how long it took ... should be under 5 min!!)
#*/5 * * * * www-data php /var/www/html/cake4/rd_cake/setup/scripts/reporting/process_report.php >> /dev/null 2>&1


//Some global variables
$servername = "localhost";
$username   = "rd";
$password   = "rd";
$conn       = false;
$conn2      = false;

$rebootFlag = false;
$logFlag    = false;

//Some defaults
$MeshMacLookup    = [];
$counter    = 0;
$ap_counter = 0;

$start_time = microtime(true);

//Statements
//Uptime Histories

doConnection();

//Node Uptimes
$stmt_uth_C    = $conn->prepare("INSERT into node_uptm_histories (node_id,node_state,state_datetime,report_datetime,created,modified) VALUES(:node_id,'1',NOW(),NOW(),NOW(),NOW())");
$stmt_uth_R    = $conn->prepare("SELECT * FROM node_uptm_histories WHERE node_id = :node_id ORDER BY report_datetime DESC");
$stmt_uth_U    = $conn->prepare("UPDATE node_uptm_histories SET modified = NOW(),report_datetime = NOW() WHERE id = :id");
//Node Alerts (only read and update needed)
$stmt_alert_R  = $conn->prepare("SELECT * FROM alerts WHERE node_id = :node_id AND resolved IS NULL ORDER BY modified DESC");
$stmt_alert_U  = $conn->prepare("UPDATE alerts SET resolved = NOW() WHERE id = :id");


//AP Uptimes
$stmt_ap_uth_C    = $conn->prepare("INSERT into ap_uptm_histories (ap_id,ap_state,state_datetime,report_datetime,created,modified) VALUES(:ap_id,'1',NOW(),NOW(),NOW(),NOW())");
$stmt_ap_uth_R    = $conn->prepare("SELECT * FROM ap_uptm_histories WHERE ap_id = :ap_id ORDER BY report_datetime DESC");
$stmt_ap_uth_U    = $conn->prepare("UPDATE ap_uptm_histories SET modified = NOW(),report_datetime = NOW() WHERE id = :id");
//AP Alerts (only read and update needed)
$stmt_ap_alert_R  = $conn->prepare("SELECT * FROM alerts WHERE ap_id = :ap_id AND resolved IS NULL ORDER BY modified DESC");
$stmt_ap_alert_U  = $conn->prepare("UPDATE alerts SET resolved = NOW() WHERE id = :id"); //Acutuallly the same for AP and Nodes but leave like this for now to keep pattern

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
        $conn->setAttribute( PDO::ATTR_EMULATE_PREPARES, false );
    }
    catch(PDOException $e){
        echo "Connection failed: " . $e->getMessage();
    } 
}

function _doReports(){
    global $conn,$MeshMacLookup,$counter,$ap_counter;
    //===== MESH Reports =====
    print("Do MESH Reports");
    $completed = [];
    $conclusion = [];
    $stmt = $conn->prepare("SELECT * FROM temp_reports where ap_profile_id=0"); //ap_profile_id = 0 for mesh reports
    $stmt->execute();  
    while ($row = $stmt->fetch(PDO::FETCH_OBJ)){
        $node_id = $row->node_id;
        print("Now Doing ID $row->id\n");
        $counter++;
        array_push($completed,$row->id);
        //Make sure the node is still in the nodes table (if it was deleted we don't care)
        if(_is_node_missing($row->node_id)==true){
            print("WARNING -> NODE $row->node_id IS MISSING (Skipping $row->id)\n");
            continue;//Skip firther execution of this iteration
        }
             
        $report = json_decode($row->report,true);
        //--Sept 2023 -- 
        if(!is_array($report)){ //Skip if the report is corrupted
        	continue;
        }
           
        _new_do_uptm_history($row);
        _resolve_alert($row);
         
        //Add node_stations and node_ibss_connections
        if (array_key_exists('network_info', $report)){
            _node_stations($report['network_info'],$node_id); //We send the entity along in case the mesh0/1/2 changed and it needs updating
        }     
        //Build a lookup for the meshes
        _doMeshMacLookup($row->mesh_id);
        //Spider web
        _do_vis($report);        
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
    
    //Clean up
    $stmt_del_nodes   = $conn->prepare("DELETE FROM temp_reports WHERE id = :id");
    foreach($completed as $i){
        $stmt_del_nodes->execute(['id' => $i]);  
    }
    //==== END MESH REPORTS====
    
    //=== AP REPORTS ====
    $ap_completed 	= [];
    $stmt_update_ap = $conn->prepare("UPDATE aps SET gateway = :gateway, lan_proto = :lan_proto, lan_gw = :lan_gw, lan_ip = :lan_ip  WHERE id = :id");
    $ap_stmt 		= $conn->prepare("SELECT * FROM temp_reports where mesh_id=0"); //mesh_id = 0 for ap reports
    $ap_stmt->execute();  
    while ($row = $ap_stmt->fetch(PDO::FETCH_OBJ)){
        $ap_id = $row->ap_id;
        print("Now Doing ID $row->id\n");
        $ap_counter++;
        array_push($ap_completed,$row->id);
        //Make sure the node is still in the nodes table (if it was deleted we don't care)
        if(_is_ap_missing($row->ap_id)==true){
            print("WARNING -> AP $row->ap_id IS MISSING (Skipping $row->id)\n");
            continue;//Skip further execution of this iteration
        }
        
        $report = json_decode($row->report,true);      
        //--Sept 2023 -- 
        if(!is_array($report)){ //Skip if the report is corrupted
        	continue;
        }
               
        _new_do_ap_uptm_history($row);
        _resolve_ap_alert($row);
        
        //Add node_stations 
        if (array_key_exists('network_info', $report)){
            _ap_stations($report['network_info'],$ap_id);
        }  
          
        //Update the Loads
        _do_ap_load($ap_id,$report['system_info']['sys']);
        //Update system info (if required)
        _do_ap_system_info($ap_id,$report['system_info']['sys']);
             
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
        
        //SQM Stats
        if (array_key_exists('sqm', $report)) {
            _do_sqm_stats($report['sqm'],'ap');
        }
        
        $c_data = ['gateway' => $gateway, 'lan_proto' => $lan_proto, 'lan_gw' => $lan_gw, 'lan_ip' => $lan_ip,'id' => $ap_id];
        $stmt_update_ap->execute($c_data);   
        //--------------                  
    
    }
          
    //Clean up
    $ap_stmt_del_nodes   = $conn->prepare("DELETE FROM temp_reports WHERE id = :id");
    foreach($ap_completed as $i){
        $ap_stmt_del_nodes->execute(['id' => $i]);  
    }      
    //==== END AP REPORTS ====
}

function _is_node_missing($node_id){
    global $conn;
    $node_missing = true;
    $stmt = $conn->prepare("SELECT * FROM nodes WHERE id = :id");
    $stmt->execute(['id' => $node_id]);
    $node = $stmt->fetch(PDO::FETCH_OBJ);
    if(isset($node->id)){
        $node_missing = false;
    }
    return $node_missing;
}

function _is_ap_missing($ap_id){
    global $conn;
    $ap_missing = true;
    $stmt = $conn->prepare("SELECT * FROM aps WHERE id = :id");
    $stmt->execute(['id' => $ap_id]);
    $ap = $stmt->fetch(PDO::FETCH_OBJ);
    if(isset($ap->id)){
        $ap_missing = false;
    }
    return $ap_missing;
}

function _new_do_uptm_history($entity){
    global $stmt_uth_C,$stmt_uth_U,$stmt_uth_R;
    $node_id    = $entity->node_id;  
    
    //If enable_alerts is set to '1' then we should look for any alerts for this device that have 'resolved' as NULL and update it (if found)
           
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

function _resolve_alert($entity){
    global $stmt_alert_R, $stmt_alert_U;
    $node_id    = $entity->node_id;
    $stmt_alert_R->execute(['node_id' => $node_id]);
    $result     = $stmt_alert_R->fetch(PDO::FETCH_OBJ);  
    if(isset($result->id)){        
        $stmt_alert_U->execute(['id' => $result->id]);         
    }
}

function _new_do_ap_uptm_history($entity){
    global $stmt_ap_uth_C,$stmt_ap_uth_U,$stmt_ap_uth_R;
    $ap_id    = $entity->ap_id;         
    $stmt_ap_uth_R->execute(['ap_id' => $ap_id]);
    $result     = $stmt_ap_uth_R->fetch(PDO::FETCH_OBJ);  
    if(isset($result->id)){
        if ($result->ap_state == 1){
            $stmt_ap_uth_U->execute(['id' => $result->id]);    
        }else{       
            $stmt_ap_uth_C->execute(['ap_id' => $ap_id]);      
        } 
    }else{
         $stmt_ap_uth_C->execute(['ap_id' => $ap_id]);     
    } 
}

function _resolve_ap_alert($entity){
    global $stmt_ap_alert_R, $stmt_ap_alert_U;
    $ap_id    = $entity->ap_id;
    $stmt_ap_alert_R->execute(['ap_id' => $ap_id]);
    $result   = $stmt_ap_alert_R->fetch(PDO::FETCH_OBJ);  
    if(isset($result->id)){        
        $stmt_ap_alert_U->execute(['id' => $result->id]);         
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
                            $mac_address_id             = getOrCreateMacAddressId($s_data['mac']); 
                            $s_data['mac_address_id']   = $mac_address_id;
                            unset($s_data['mac']);
                                                         
                            $s_data['created']          = date("Y-m-d H:i:s", $s_data['first_timestamp']);
                            $s_data['modified']         = date("Y-m-d H:i:s", $s_data['unix_timestamp']);
                            
                            print_r($s_data);

                            $stmt = $conn->prepare("INSERT into node_stations (node_id,radio_number,frequency_band,mesh_entry_id,mac_address_id,tx_bytes,rx_bytes,tx_packets,rx_packets,tx_bitrate,rx_bitrate,tx_failed,tx_retries,signal_now,signal_avg,created,modified)VALUES(:node_id,:radio_number,:frequency_band,:mesh_entry_id,:mac_address_id,:tx_bytes,:rx_bytes,:tx_packets,:rx_packets,:tx_bitrate,:rx_bitrate,:tx_failed,:tx_retries,:signal_now,:signal_avg,:created,:modified)");
                            $stmt->execute([
                                'node_id'           => $s_data['node_id'],//1
                                'radio_number'      => $s_data['radio_number'],//2
                                'frequency_band'    => $s_data['frequency_band'],//3
                                'mesh_entry_id'     => $s_data['mesh_entry_id'],//4
                                'mac_address_id'    => $s_data['mac_address_id'],//5
                                'rx_bytes'          => $s_data['rx_bytes'],//6
                                'tx_bytes'          => $s_data['tx_bytes'],//7
                                'rx_bitrate'        => $s_data['rx_bitrate'],//8
                                'tx_bitrate'        => $s_data['tx_bitrate'],//9
                                'rx_packets'        => $s_data['rx_packets'],//10
                                'tx_packets'        => $s_data['tx_packets'],//11
                                'tx_failed'         => $s_data['tx_failed'],//16
                                'tx_retries'        => $s_data['tx_retries'],//18
                                'signal_now'        => $s_data['signal_now'],//20
                                'signal_avg'        => $s_data['signal_avg'],//21,
                                'created'           => $s_data['created'],//22
                                'modified'          => $s_data['modified']//23
                            ]); 
                        }
                    }  
                    if (($interface['type'] == 'IBSS')||($interface['type'] == 'mesh point')) {
                    
                        //Record the MAC
                        $name   = $interface['name'];
                        $m_mac  = $interface['mac']; 
                        
                        $f_band = $interface['frequency_band'];
                        $power  = $interface['txpower'];
                        $channel= $interface['channel'];    
                        
                        //print_r($interface);
                                          
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
                                    'channel' =>$channel
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
                            
                            //Sometime this is not included with the report so we fill it in if it is missing
                            if(isset($s_data['rx_bitrate'])){
                                if($s_data['rx_bitrate'] == null){
                                    $s_data['rx_bitrate'] = 0;
                                }
                            }else{
                                $s_data['rx_bitrate'] = 0;
                            }
                            $s_data['rx_bitrate'] = str_replace(" MBit/s","",$s_data['rx_bitrate']);
                            //--End rx_bitrate missing--
                                                      
                            $stmt = $conn->prepare("INSERT into node_ibss_connections (node_id,radio_number,frequency_band,if_mac,mac,tx_bytes,rx_bytes,tx_packets,rx_packets,tx_bitrate,rx_bitrate,authenticated,authorized,tdls_peer,preamble,tx_failed,tx_retries,mfp,signal_now,signal_avg,created,modified) VALUES(:node_id,:radio_number,:frequency_band,:if_mac,:mac,:tx_bytes,:rx_bytes,:tx_packets,:rx_packets,:tx_bitrate,:rx_bitrate,:authenticated,:authorized,:tdls_peer,:preamble,:tx_failed,:tx_retries,:mfp,:signal_now,:signal_avg,:created,:modified)");
                            $stmt->execute([
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
                            ]); 
                            //print_r($s_data);
                        }
                    }     
                }
            }
        } 
    }
}

function _ap_stations($d,$ap_id){
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
                            $s_data['mac_address_id']   = getOrCreateMacAddressId($s_data['mac']);
                            unset($s_data['mac']);
                            
                            $stmt = $conn->prepare("INSERT into ap_stations (ap_id,radio_number,frequency_band,ap_profile_entry_id,mac_address_id,tx_bytes,rx_bytes,tx_bitrate,rx_bitrate,tx_packets,rx_packets,tx_failed,tx_retries,signal_now,signal_avg,created,modified)VALUES(:ap_id,:radio_number,:frequency_band,:ap_profile_entry_id,:mac_address_id,:tx_bytes,:rx_bytes,:tx_bitrate,:rx_bitrate,:tx_packets,:rx_packets,:tx_failed,:tx_retries,:signal_now,:signal_avg,:created,:modified)");
                            $stmt->execute([
                                'ap_id'             => $s_data['node_id'],//1
                                'radio_number'      => $s_data['radio_number'],//2
                                'frequency_band'    => $s_data['frequency_band'],//3
                                'ap_profile_entry_id'     => $s_data['mesh_entry_id'],//4
                                'mac_address_id'    => $s_data['mac_address_id'],//5
                                'rx_bytes'          => $s_data['rx_bytes'],//6
                                'tx_bytes'          => $s_data['tx_bytes'],//7
                                'rx_bitrate'        => $s_data['rx_bitrate'],//8
                                'tx_bitrate'        => $s_data['tx_bitrate'],//9
                                'rx_packets'        => $s_data['rx_packets'],//10
                                'tx_packets'        => $s_data['tx_packets'],//11
                                'tx_failed'         => $s_data['tx_failed'],//12
                                'tx_retries'        => $s_data['tx_retries'],//13
                                'signal_now'        => $s_data['signal_now'],//14
                                'signal_avg'        => $s_data['signal_avg'],//15
                                'created'           => $s_data['created'],//16
                                'modified'          => $s_data['modified']//17
                            ]); 
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
    $stmt = $conn->prepare("SELECT * FROM nodes WHERE mesh_id = :mesh_id");
    $stmt->execute(['mesh_id' => $mesh_id]);

    while ($i = $stmt->fetch(PDO::FETCH_OBJ)){
        $gateway    = 'no';
        if($i->gateway !== 'none'){
            $gateway = 'yes';
        }       
        if($i->{'mesh0'} !== ''){   
            $MeshMacLookup[strtolower($i->{'mesh0'})] = [
                'id'        => $i->{'id'},
                'gateway'   => $gateway, 
                'channel'   => $i->{'mesh0_channel'},
                'txpower'   => $i->{'mesh0_txpower'},
                'frequency_band' => $i->{'mesh0_frequency_band'}, 
            ];
        }
        if($i->{'mesh1'} !== ''){
            $MeshMacLookup[strtolower($i->{'mesh1'})] = [
                'id'        => $i->{'id'},
                'gateway'   => $gateway, 
                'channel'   => $i->{'mesh1_channel'},
                'txpower'   => $i->{'mesh1_txpower'},
                'frequency_band' => $i->{'mesh1_frequency_band'}, 
            ];
        }
        if($i->{'mesh2'} !== ''){ //For future
            $MeshMacLookup[strtolower($i->{'mesh2'})] = [
                'id'        => $i->{'id'},
                'gateway'   => $gateway, 
                'channel'   => $i->{'mesh2_channel'},
                'txpower'   => $i->{'mesh2_txpower'},
                'frequency_band' => $i->{'mesh2_frequency_band'}, 
            ];
        }
    }
}

function _do_vis($d){
    global $conn,$MeshMacLookup; 
    
    if (array_key_exists('vis',$d)) {     
        foreach ($d['vis'] as $vis) {       
            $algo   = 'BATMAN_IV';
            $tp     = null;
            $tq     = null;
            $metric = 1;
            
            if (array_key_exists('algo_name', $vis)) {
                $algo = $vis['algo_name'];
            }
            
            if (array_key_exists('tq', $vis)) {
                $tq = $vis['tq'];
            }
            
            if (array_key_exists('tp', $vis)) {
                $tp = $vis['tp'];
            }
                       
            if (array_key_exists('metric', $vis)) {
                $metric = $vis['metric'];
            }
            
        
            $neighbor       = $vis['neighbor'];
            $router         = $vis['router'];
                     
            $neighbor_id    = false;
            $node_id        = false;
            if (array_key_exists(strtolower($neighbor), $MeshMacLookup)) {
                $neighbor_id    = $MeshMacLookup["$neighbor"]['id'];
            }
            
            if (array_key_exists(strtolower($router), $MeshMacLookup)) {
                $node_id    = $MeshMacLookup["$router"]['id'];
                $gateway    = $MeshMacLookup["$router"]['gateway'];
                $hwmode     = '11g'; //default
                if($MeshMacLookup["$router"]['frequency_band'] == 'five_lower'){
                    $hwmode = '11a';
                }
                if($MeshMacLookup["$router"]['frequency_band'] == 'five_upper'){
                    $hwmode = '11ac';
                }
            }
            
            if(($neighbor_id)&&($node_id)){   
                $stmt       = $conn->prepare("SELECT * FROM node_neighbors WHERE node_id = :node_id AND neighbor_id = :neighbor_id");
                $stmt->execute(['node_id' => $node_id,'neighbor_id' => $neighbor_id]);
                $result     = $stmt->fetch(PDO::FETCH_OBJ);     
                if(isset($result->id)){
                    $stmt = $conn->prepare("UPDATE node_neighbors SET metric=:metric,gateway=:gateway,hwmode=:hwmode,modified = NOW(),algo=:algo,tq=:tq,tp=:tp WHERE id = :id");
                    $stmt->execute(['metric' => $metric,'gateway' => $gateway,'hwmode' => $hwmode,'algo' => $algo, 'tq' => $tq, 'tp' => $tp, 'id' => $result->id]);                    
                }else{
                    $stmt = $conn->prepare("INSERT into node_neighbors (node_id,neighbor_id,metric,gateway,hwmode,created,modified,algo,tq,tp) VALUES(:node_id,:neighbor_id,:metric,:gateway,:hwmode,NOW(),NOW(),:algo,:tq,:tp)");
                     $stmt->execute(['node_id' => $node_id,'neighbor_id'=>$neighbor_id,'metric'=>$metric,'gateway'=>$gateway,'hwmode'=>$hwmode,'algo' => $algo, 'tq' => $tq, 'tp' => $tp]);     
                } 
            }
        }
    }
}


function _update_last_contact($e){

    global $conn;

    $entity                         = $this->{$this->main_model}->find()->where(['id' => $e->id])->first();
    $entity->last_contact           = date("Y-m-d H:i:s", time());
    $entity->last_contact_from_ip   = $this->request->clientIp(); 
    
    //--- Check if there are any lan_info items here
    if (array_key_exists('lan_info', $this->request->data)) {
        $lan_proto  = $this->request->data['lan_info']['lan_proto'];
        $lan_gw     = $this->request->data['lan_info']['lan_gw'];
        $lan_ip     = $this->request->data['lan_info']['lan_ip'];
        $entity->lan_gw = $lan_gw;
        $entity->lan_ip = $lan_ip;
        $entity->lan_proto  = $lan_proto;  
    }
   
    if (array_key_exists('bootcycle', $this->request->data)) {
        $entity->bootcycle  = intval($this->request->data['bootcycle']); 
    }
    
    //--Check if we need to update the gateway field
    if (array_key_exists('gateway', $this->request->data)){
        if($e->gateway !== $this->request->data['gateway']){
            $entity->gateway = $this->request->data['gateway']; //Set the gateway only if it is set and different
        }
    }
         
    $this->{$this->main_model}->save($entity);
    
    //Update the mesh last_contact
    $e_m = $this->{'Meshes'}->find()->where(['id' => $e->mesh_id])->first();
    if($e_m){
        $data = [];
        $data['last_contact'] = date("Y-m-d H:i:s", time());
        $this->{'Meshes'}->patchEntity($e_m, $data);
        $this->{'Meshes'}->save($e_m);
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

function _do_ap_load($ap_id, $info){

    global $conn;
    $mem_total  = _mem_kb_to_bytes($info['memory']['total']);
    $mem_free   = _mem_kb_to_bytes($info['memory']['free']);
    $u          = $info['uptime'];
    $time       = preg_replace('/\s+up.*/', "", $u);
    $load       = preg_replace('/.*.\s+load average:\s+/', "", $u);
    $loads      = explode(", ", $load);
    $up         = preg_replace('/.*\s+up\s+/', "", $u);
    $up         = preg_replace('/,\s*.*/', "", $up); 
      
    $stmt       = $conn->prepare("SELECT * FROM ap_loads WHERE ap_id = :ap_id");
    $stmt->execute(['ap_id' => $ap_id]);
    $result     = $stmt->fetch(PDO::FETCH_OBJ);     
    if(isset($result->id)){
        $stmt = $conn->prepare("UPDATE ap_loads SET mem_total=:mem_total,mem_free=:mem_free,uptime=:uptime,system_time=:system_time,load_1=:load_1,load_2=:load_2,load_3=:load_3,modified = NOW() WHERE id = :id");
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
        $stmt = $conn->prepare("INSERT into ap_loads (mem_total,mem_free,uptime,system_time,load_1,load_2,load_3,ap_id,created,modified)VALUES(:mem_total,:mem_free,:uptime,:system_time,:load_1,:load_2,:load_3,:ap_id,NOW(),NOW())");
         $stmt->execute([
            'mem_total'     => $mem_total,
            'mem_free'      => $mem_free,
            'uptime'        => $up,
            'system_time'   => $time,
            'load_1'        => $loads[0],
            'load_2'        => $loads[1],
            'load_3'        => $loads[2],
            'ap_id'         => $ap_id
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


function _do_sqm_stats($sqm_stats, $type = 'ap'){

    global $conn;
    $not_these = ['id','type','device','sqm'];  
    if($type == 'ap'){
	    foreach($sqm_stats as $stat){ 
	    print_r($stat);	    
            foreach($not_these as $remove){
                unset($stat[$remove]);
	    }
	    if(isset($stat['memory_used'])){ 
      	       print_r($stat);	    
               $stmt   = $conn->prepare("INSERT into ap_sqm_stats (ap_id,ap_profile_exit_id,bytes,packets,drops,overlimits,backlog,qlen,memory_used,peak_delay_us,avg_delay_us,base_delay_us,way_misses,way_indirect_hits,created,modified)VALUES(:ap_id,:ap_profile_exit_id,:bytes,:packets,:drops,:overlimits,:backlog,:qlen,:memory_used,:peak_delay_us,:avg_delay_us,:base_delay_us,:way_misses,:way_indirect_hits,NOW(),NOW())");
               $stmt->execute($stat);
	   }       
        }      
    }
}



//FIXME Ensure that the Firmware also includes a 'DISTRIB_BUILD' in the release file    
function _do_ap_system_info($ap_id, $info){

    global $conn;

    $stmt   = $conn->prepare("SELECT * FROM ap_systems WHERE ap_id = :ap_id AND name='DISTRIB_BUILD'");
    $stmt->execute(['ap_id' => $ap_id]);
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
        $stmt   = $conn->prepare("DELETE FROM ap_systems WHERE ap_id = :ap_id");
        $stmt->execute(['ap_id' => $ap_id]);
        //--CPU Info--
         
        if (array_key_exists('cpu', $info)) {
            foreach (array_keys($info['cpu']) as $key) {               
                $stmt = $conn->prepare("INSERT into ap_systems (category,name,value,ap_id,created,modified)VALUES('cpu',:key,:value,:ap_id,NOW(),NOW())");
                $stmt->execute([
                    'key'     => $key,
                    'value'   => $info['cpu']["$key"],
                    'ap_id'   => $ap_id
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
                    $stmt   = $conn->prepare("INSERT into ap_systems (category,name,value,ap_id,created,modified)VALUES('release',:key,:value,:ap_id,NOW(),NOW())");
                    $stmt->execute([
                        'key'     => $r_entry[0],
                        'value'   => $value,
                        'ap_id'   => $ap_id
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

function getOrCreateMacAddressId($mac) {
    global $conn;

    // Check if MAC address already exists
    $stmt = $conn->prepare("SELECT id FROM mac_addresses WHERE mac = :mac");
    $stmt->execute(['mac' => $mac]);
    $existingMac = $stmt->fetch();

    // Create new MAC address if it doesn't exist
    if (!$existingMac) {
        $stmt = $conn->prepare("INSERT INTO mac_addresses (mac,created,modified) VALUES (:mac,NOW(),NOW())");
        $stmt->execute(['mac' => $mac]);
        return $conn->lastInsertId();
    }

    // Return existing MAC address ID
    return $existingMac['id'];
}



?>
