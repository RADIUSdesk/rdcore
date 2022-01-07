<?php


//Some global variables
$servername = "localhost";
$username   = "rd";
$password   = "rd";
$conn       = false;
$conn2      = false;

$metaInfo   = [];
$ips        = [];
$tzDefault  = "Asia/Kolkata";
$network    = "Unknown";
$component  = "WEB-TRAFFIC";
$program    = "wifichoupal";
$host_fqdn  = 'wifichoupal.mesh-manager.com';

main();

function main(){
    global $conn,$metaInfo,$ips,$component,$program,$host_fqdn;
    doConnection();  
    $stmt = $conn->prepare("SELECT node_id,mesh_id,username,host,source_ip,mac,full_string,full_url FROM temp_proxy_logs");
    $stmt->execute([]);
      
    print("Doing Proxy Log to Syslog");
    while($row= $stmt->fetch(PDO::FETCH_OBJ)){
    
        //Building a cache
        $meta_info = getMetaInfo($row->mesh_id,$row->node_id);
        getIp($row->host);
        
        if(isset($metaInfo[$row->node_id])){
        
            //mesh_name node_name public_ip
            $prefix     = $host_fqdn.' '.$metaInfo[$row->node_id]['network'].' '.$metaInfo[$row->node_id]['name'].' '.$metaInfo[$row->node_id]['public_ip'];
            
            if(isset($ips[$row->host])){
                $dst_ip = $ips[$row->host];
            }else{
                $dst_ip = $row->host;
            };
            
            //These logs are already on the timezone that the device is set in so we only get the 'real' (accrding to TZ) time
            $date_string    = $row->full_string;
            $date_string    = preg_replace('/^.*- - \[/','',$date_string);
            $date_string    = preg_replace('/\s+.*\].*/','',$date_string);
            $format         = "d/M/Y:H:i:s";               
            $start          = DateTime::createFromFormat($format, $date_string);
            
                             
            $target = str_replace($row->host,'',$row->full_url);
            if($target == '/'){
                $target = '-';
            }
            //src_mac username dest_ip dest_port dest_fqdn target
            $proto = 'TCP';
            $info_prim  = $row->mac.' '.$row->username.' '.$proto.' '.$dst_ip.' 80 '.$row->host.' '.$target;
            
            //src_ip src_port time 
            $info_sec   = $row->source_ip.' 0 '.$start->format('Y-m-d_H:i:s'); 
        
            //mesh_name node_name public_ip src_mac username proto dest_ip dest_port dest_fqdn target src_ip src_port time 
            $line  = $prefix.' '.$info_prim.' '.$info_sec;
            print("$line\n");
            send_remote_syslog($line,$component,$program,$start);  
        }          
    }
    $stmt   = $conn->prepare("DELETE FROM temp_proxy_logs");
    $stmt->execute([]);  
    
    //Cleanup
    $conn = null;
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

function send_remote_syslog($message, $component = "WEB-TRAFFIC", $program = "wifichoupal",$date = '') {

    if($date == ''){
        $date_string = date('M j H:i:s ');
    }else{
        $date_string = $date->format('M j H:i:s ');
    }
    $msg = "<30>" . $date_string . $program . ' ' . $component . ': ' . $message;

    $sock = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
    # replace these with settings provided by Papertrail
    //socket_sendto($sock, $msg, strlen($msg), 0, '192.168.8.101',514);
    socket_sendto($sock, $msg, strlen($msg), 0, 'cloud.smartwires.net',514);
    //socket_sendto($sock, $msg, strlen($msg), 0, 'logs.wifichoupal.in',514);
    socket_close($sock);
}

function getMetaInfo($mesh_id,$node_id){
    global $conn,$metaInfo,$tzDefault,$network;

    if(!isset($metaInfo[$node_id])){
        print("Need to find Meta Info");
        $stmt = $conn->prepare("SELECT name,last_contact_from_ip FROM nodes WHERE id=:node_id");
        $stmt->execute(['node_id' =>$node_id]);
        $result = $stmt->fetch(PDO::FETCH_OBJ);

        if(isset($result->name)){
            //Get the timezone for this node 
            $stmt_ns = $conn->prepare("SELECT tz_name FROM node_settings WHERE mesh_id=:mesh_id");
            $stmt_ns->execute(['mesh_id' => $mesh_id]);
            $result_ns = $stmt_ns->fetch(PDO::FETCH_OBJ);
            if(isset($result_ns->tz_name)){
                $timezone = $result_ns->tz_name;
            }else{
                $timezone = $tzDefault;
            }
            
            $stmt_m = $conn->prepare("SELECT name FROM meshes WHERE id=:mesh_id");
            $stmt_m->execute(['mesh_id' => $mesh_id]);
            $result_m = $stmt_m->fetch(PDO::FETCH_OBJ);
            if(isset($result_m->name)){
                $mesh = $result_m->name;
            }else{
                $mesh = $network;
            }
            
            $metaInfo[$node_id] = [
                'name'      => $result->name,
                'public_ip' => $result->last_contact_from_ip,
                'timezone'  => $timezone,
                'network'   => $mesh
            ];                     
            //print_r($metaInfo);           
        }   
    }
}

function getIp($fqdn){
    global $conn,$ips;
    if(!isset($ips[$fqdn])){   
        $stmt_ip = $conn->prepare("SELECT ip FROM forward_lookups WHERE fqdn=:fqdn LIMIT 1");
        $stmt_ip->execute(['fqdn' => $fqdn]);
        $result_ip = $stmt_ip->fetch(PDO::FETCH_OBJ);
        if(isset($result_ip->ip)){
            $ips[$fqdn]=$result_ip->ip;
        }else{
            //Add it and set it
            $ip = gethostbyname($fqdn);
            $ips[$fqdn]= $ip;
            $stmt_fqdn = $conn->prepare("INSERT into forward_lookups (fqdn,ip,created,modified) VALUES(:fqdn,:ip,NOW(),NOW())");
            $stmt_fqdn->execute(['fqdn' => $fqdn, 'ip' => $ip]);    
        }    
    }
}

?>

