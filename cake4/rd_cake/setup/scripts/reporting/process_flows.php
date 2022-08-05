<?php


//Some global variables
$servername = "localhost";
$username   = "rd";
$password   = "rd";
$conn       = false;
$conn2      = false;

$metaInfo   = [];
$fqdns      = [];
$tzDefault  = "Asia/Kolkata";
$network    = "Unknown";
$component  = "WEB-TRAFFIC";
$program    = "wifichoupal";
$host_fqdn  = 'wifichoupal.mesh-manager.com';

main();

function main(){
    global $conn,$metaInfo,$fqdns,$component,$program,$host_fqdn;
    
    doConnection();  
    $stmt = $conn->prepare("SELECT node_id,mesh_id,username,proto,src_mac,src_ip,src_port,dst_ip,dst_port,start,finish FROM temp_flow_logs");
    $stmt->execute([]);
       
    print("Sending Flows Logs to Syslog\n"); 
     
    while($row= $stmt->fetch(PDO::FETCH_OBJ)){

        //Building a cache
        $meta_info = getMetaInfo($row->mesh_id,$row->node_id);
        getFqdn($row->dst_ip);
                
        if(isset($metaInfo[$row->node_id])){
            //start time (in terms of timezone)
            $start  = new DateTime($row->start);
            $start->setTimezone(new DateTimeZone($metaInfo[$row->node_id]['timezone']));
            
            //end time (in terms of timezone)
            $finish = new DateTime($row->finish);
            $finish->setTimezone(new DateTimeZone($metaInfo[$row->node_id]['timezone']));

            $prefix = $host_fqdn.' '.$metaInfo[$row->node_id]['network'].' '.$metaInfo[$row->node_id]['name'].' '.$metaInfo[$row->node_id]['public_ip'];
            
            if(isset($fqdns[$row->dst_ip])){
                $fqdn = $fqdns[$row->dst_ip];
            }else{
                $fqdn = $row->dst_ip;
            };
            
            $proto = 'TCP';
            if($row->proto == 17){
                $proto = 'UDP';
            }
            
            $info_prim  = $row->src_mac.' '.$row->username.' '.$proto.' '.$row->dst_ip.' '.$row->dst_port.' '.$fqdn.' - '; //We add - for the url since it is https and we dont know it
            $info_sec   = $row->src_ip.' '.$row->src_port.' '.$start->format('Y-m-d_H:i:s').' '.$finish->format('Y-m-d_H:i:s');  
            $line       = $prefix.' '.$info_prim.' '.$info_sec;
            
            //mesh_name node_name public_ip src_mac username proto dest_ip dest_port dest_fqdn target src_ip src_port start finish
            //Core-Eynsham-909 MAK3 41.112.169.115 A8-9C-ED-76-1D-91 909_eynsham@909_eynsham_road 44.239.250.14 443 ec2-44-239-250-14.us-west-2.compute.amazonaws.com 10.1.1.4 41398 2021-02-24_23:58:29 2021-02-24_23:58:30

            print("$line\n");
            send_remote_syslog($line,$component,$program,$start); //We make the date of the log entry the same date as the start date of the flow           
        }  
    }
    
    $stmt   = $conn->prepare("DELETE FROM temp_flow_logs");
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
  print("Sent Syslog\n");
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

function getFqdn($ip){
    global $conn,$fqdns;
    if(!isset($fqdns[$ip])){   
        $stmt_fqdn = $conn->prepare("SELECT fqdn FROM reverse_lookups WHERE ip=:ip LIMIT 1");
        $stmt_fqdn->execute(['ip' => $ip]);
        $result_fqdn = $stmt_fqdn->fetch(PDO::FETCH_OBJ);
        if(isset($result_fqdn->fqdn)){
            $fqdns[$ip]=$result_fqdn->fqdn;
        }else{
            //Add it and set it
            $hostname = gethostbyaddr($ip);
            $fqdns[$ip]=$hostname;
            $stmt_fqdn = $conn->prepare("INSERT into reverse_lookups (ip,fqdn,created,modified) VALUES(:ip,:fqdn,NOW(),NOW())");
            $stmt_fqdn->execute(['ip' => $ip,'fqdn' => $hostname]);
        
        }    
    }
}

?>

