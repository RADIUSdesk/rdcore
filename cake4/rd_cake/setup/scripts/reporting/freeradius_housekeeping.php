<?php


//Some global variables
$servername = "localhost";
$username   = "rd";
$password   = "rd";
$dbname     = "rd";
$conn       = false;
$conn2      = false;

$logFlag    = true;
$daysBack   = 365; //Deleting a year back

doConnection();

main();

function main(){
    global $conn,$daysBack;
    logger("Do MAIN PART");
    _trim_tables($daysBack);  
}
 
  
function doConnection(){

    global $servername,$username,$password,$conn,$dbname;
    try {
        $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password,[PDO::ATTR_PERSISTENT => true]);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch(PDOException $e){
        echo "Connection failed: " . $e->getMessage();
    } 
}

function _trim_tables($daysBack){
    global $conn;
        
    $stmt_post_auth = $conn->prepare("DELETE FROM radpostauth WHERE authdate <= CURRENT_DATE - INTERVAL :days_back DAY");
    $stmt_post_auth->execute(['days_back' => $daysBack]);
    
    $stmt_radacct   = $conn->prepare("DELETE from radacct where acctstarttime <= CURRENT_DATE - INTERVAL :days_back DAY;");
    $stmt_radacct->execute(['days_back' => $daysBack]);
}


function logger($message){
    global $logFlag;
    if($logFlag===true){
        print($message."\n");
    }
}


?>
