<?php
    $uamsecret = 'greatsecret';                         //Shared secret between chilli and uam json service


    //We need 3 things
    $callback = false;
    if(array_key_exists('callback',$_GET)){
    	$callback   = $_GET["callback"];
    }
    $password   = $_GET["password"];
    $challenge  = $_GET["challenge"];
    
    $pappassword = return_new_pwd($password,$challenge,$uamsecret);

    if($callback != false){
        header('Content-type: application/javascript');     //Output as JavaScript
        print $callback."({'response':'".$pappassword."'})";
    }else{
	header('Content-type: application/json');
	print(json_encode(array("response" => $pappassword)));
    }

    //Function to do the encryption thing of the password
    function return_new_pwd($pwd,$challenge,$uamsecret){

        $hex_chal   = pack('H32', $challenge);                  //Hex the challenge
        $newchal    = pack('H*', md5($hex_chal.$uamsecret));    //Add it to with $uamsecret (shared between chilli an this script)
        $response   = md5("\0" . $pwd . $newchal);              //md5 the lot
        $newpwd     = pack('a32', $pwd);                        //pack again
        $md5pwd     = implode ('', unpack('H32', ($newpwd ^ $newchal))); //unpack again
        return $md5pwd;
    }
  
?>

