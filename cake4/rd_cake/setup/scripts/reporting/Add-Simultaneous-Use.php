<?php


//Some global variables
$servername = "localhost";
$username   = "rd";
$password   = "rd";
$dbname     = "rd";
$conn       = false;
$conn2      = false;

$sessionCount = 1;
$logFlag    = true;

doConnection();

main();

function main(){
    global $conn,$sessionCount;
    logger("Do MAIN PART");
    _add_session_limit($sessionCount);    
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

function _doLightReport($node){
    global $rebootFlag;
    _update_last_contact($node); 
}

function _add_session_limit($session_count){
    global $conn,$mode;
    $stmt       = $conn->prepare("SELECT DISTINCT(username) FROM radcheck");
    $stmt_added = $conn->prepare("SELECT id,value FROM radcheck WHERE username= :username and attribute='Simultaneous-Use'");
    $stmt_add   = $conn->prepare("INSERT INTO radcheck (username,attribute,op,value) VALUES(:username,'Simultaneous-Use',':=',:session_count)");
    $stmt_update= $conn->prepare("UPDATE radcheck SET value=:session_count WHERE id=:id");
    
    $stmt->execute();
    
    while ($i = $stmt->fetch(PDO::FETCH_OBJ)){
        logger($i->username); 
        $stmt_added->execute(['username' => $i->username]);
        $result     = $stmt_added->fetch(PDO::FETCH_OBJ);
        if(isset($result->value)){
            logger($result->value);
            if($result->value != $session_count){
                logger("Update Simultaneous-Use from $result->value to $session_count");
                $stmt_update->execute(['id' => $result->id,'session_count' => $session_count]);          
            }else{
                logger("Simultaneous-Use already set to $session_count"); 
            }         
        }else{
            logger("No Simultaneous-Use Found Add It");
            $stmt_add->execute(['username' => $i->username,'session_count' => $session_count]);
        }         
    }       
}


function logger($message){
    global $logFlag;
    if($logFlag===true){
        print($message."\n");
    }
}

?>
