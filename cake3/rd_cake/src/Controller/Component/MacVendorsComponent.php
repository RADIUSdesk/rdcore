<?php

namespace App\Controller\Component;

use Cake\Controller\Component;

class MacVendorsComponent extends Component {


   // private $vendor_file     = APP.DS."Setup".DS."Scripts".DS."mac_lookup.txt";
   // private $vendor_list     = file($vendor_file);
    

    public function vendorFor($mac){

        //Convert the MAC to be in the same format as the file 
        $mac    = strtoupper($mac);
        $mac    = str_replace(":","-",$mac); //Change the mac addy to be seperated with "-"
        $pieces = explode("-", $mac);
        
		$vendor_file    = APP."..".DS."setup".DS."scripts".DS."mac_lookup.txt";
		
		
        $this->vendor_list  = file($vendor_file);

        $big_match      = $pieces[0].":".$pieces[1].":".$pieces[2].":".$pieces[3].":".$pieces[4];
        $small_match    = $pieces[0].":".$pieces[1].":".$pieces[2];
        $lines          = $this->vendor_list;

        $big_match_found = false;
        foreach($lines as $i){
            if(preg_match("/^$big_match/",$i)){
                $big_match_found = true;
                //Transform this line
                $vendor = preg_replace("/$big_match\s?/","",$i);
                $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                $vendor = rtrim($vendor);
                return $vendor;   
            }
        }
       
        if(!$big_match_found){
            foreach($lines as $i){
                if(preg_match("/^$small_match/",$i)){
                    //Transform this line
                    $vendor = preg_replace("/$small_match\s?/","",$i);
                    $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                    $vendor = rtrim($vendor);
                    return $vendor;
                }
            }
        }
        $vendor = "Unknown";
    } 
}
