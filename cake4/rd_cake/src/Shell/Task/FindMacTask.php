<?php

namespace App\Shell\Task;

use Cake\Console\Shell;
use Cake\I18n\FrozenTime;
use Cake\Datasource\ConnectionManager;

class FindMacTask extends Shell {

    public function return_vendor_for_mac($mac) {
        $this->_show_header($mac);
        return $this->_lookup_vendor($mac);        
    }

    private function _show_header($mac){
        $this->out('<comment>=============================-=</comment>');
        $this->out('<comment>---- Looking up vendor for ----</comment>');
        $this->out("<comment>-------$mac---------</comment>");
        $this->out('<comment>______________________________</comment>');
    }

    private function _lookup_vendor($mac){
        $vendor_file = ROOT.DS."setup".DS."scripts".DS."mac_lookup.txt";
        $this->out("<info>Looking up vendor from file: $vendor_file </info>");

        //Convert the MAC to be in the same format as the file 
        $mac    = strtoupper($mac);
        $pieces = explode("-", $mac);

        $big_match      = $pieces[0].":".$pieces[1].":".$pieces[2].":".$pieces[3].":".$pieces[4];
        $small_match    = $pieces[0].":".$pieces[1].":".$pieces[2];
        $lines          = file($vendor_file);

        $big_match_found = false;
        foreach($lines as $i){
            if(preg_match("/^$big_match/",$i)){
                $big_match_found = true;
                $this->out("<info>Found vendor for $mac -> $i</info>");
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
                    $this->out("<info>Found vendor for $mac -> $i</info>");
                    //Transform this line
                    $vendor = preg_replace("/$small_match\s?/","",$i);
                    $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                    $vendor = rtrim($vendor);
                    return $vendor;
                }
            }
        }
        $vendor = "Unkown";
    }

}

?>
