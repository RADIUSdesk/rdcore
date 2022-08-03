<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 20-11-2012
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class FormatterComponent extends Component {

    public function start_of_month(){

        Configure::load('yfi');
        $reset_date = Configure::read('permanent_users.reset_day');
        $dates      = array();

        $unix_stamp = strtotime("now");     //Get the unix stamp for given date

        $l_assoc = localtime($unix_stamp, true);    //Get the components for this date
        //Start of month will be:
        if($l_assoc['tm_mday'] >= $reset_date){   
            $m = $l_assoc['tm_mon']+1;  //Use current month
        }else{
            $m = $l_assoc['tm_mon'];    //Use previous month
        }

        $date_start     =  date("Y-m-d H:i:s",mktime(0,0,0,$m,$reset_date,($l_assoc['tm_year']+1900)));          //Start of month
        return $date_start;
    }

    public function end_of_month(){

        Configure::load('yfi');
        $reset_date = Configure::read('permanent_users.reset_day');
        $dates      = array();

        $unix_stamp = strtotime("now");     //Get the unix stamp for given date

        $l_assoc = localtime($unix_stamp, true);    //Get the components for this date
        //Start of month will be:
        if($l_assoc['tm_mday'] >= $reset_date){   
            $m = $l_assoc['tm_mon']+1;  //Use current month
        }else{
            $m = $l_assoc['tm_mon'];    //Use previous month
        }

        $date_end   = date("Y-m-d H:i:s",mktime(23,59,59,$m+1,$reset_date-1,($l_assoc['tm_year']+1900)));  //End of month
        return $date_end;
    }


    public function diff_in_time($date_start,$date_end=''){

        if($date_end == ''){

            $dateTime       = new DateTime("now");
            $date_end       = $dateTime->format("Y-m-d H:i:s");
        }

        //Get the difference between it:
        $diff = abs(strtotime($date_end)-strtotime($date_start));
        return $this->_sec2hms($diff,true);

    }

    public function formatted_seconds($seconds){

        return $this->_sec2hms($seconds,true);
    }

    public function formatted_bytes($bytes){

        $ret_val=$bytes;
        if($bytes >= 1024){
            $ret_val = round($bytes/1024,2)."K";
        }
        if($bytes >= (1024*1024)){
            $ret_val = round($bytes/1024/1024,2)."M";
        }
        if($bytes >= (1024*1024*1204)){
            $ret_val = round($bytes/1024/1024/1024,2)."G";
        }
        if($bytes >= (1024*1024*1204*1204)){
            $ret_val = round($bytes/1024/1024/1024,2)."T";
        } 
        return $ret_val;
    }

    private function _sec2hms ($sec, $padHours = false){

        $negative = '';
        if($sec < 0){

            $sec = abs($sec);
            $negative = ' '.gettext('(Negative)');
        }

        // holds formatted string
        $hms = "";
    
        // there are 3600 seconds in an hour, so if we
        // divide total seconds by 3600 and throw away
        // the remainder, we've got the number of hours
        $hours = intval(intval($sec) / 3600); 

        // add to $hms, with a leading 0 if asked for
        $hms .= ($padHours) 
              ? str_pad($hours, 2, "0", STR_PAD_LEFT). ':'
            : $hours. ':';
     
        // dividing the total seconds by 60 will give us
        // the number of minutes, but we're interested in 
        // minutes past the hour: to get that, we need to 
        // divide by 60 again and keep the remainder
        $minutes = intval(($sec / 60) % 60); 

        // then add to $hms (with a leading 0 if needed)
        $hms .= str_pad($minutes, 2, "0", STR_PAD_LEFT). ':';

        // seconds are simple - just divide the total
        // seconds by 60 and keep the remainder
        $seconds = intval($sec % 60); 

        // add to $hms, again with a leading 0 if needed
        $hms .= str_pad($seconds, 2, "0", STR_PAD_LEFT);

        // done!
        return $hms.$negative;
    }


}

