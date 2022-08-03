<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component that is used to format time to a nice readable human format
//---- Date: 11-05-2017
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class TimeCalculationsComponent extends Component {

    public function time_if($timespan='hour'){
        $hour   = (60*60);
        $day    = $hour*24;
        $week   = $day*7;
        $month  = $week*30;
        
        if($timespan == 'hour'){
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$hour);
        }

        if($timespan == 'day'){
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$day);
        }

        if($timespan == 'week'){
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$week);
        }
        
        if($timespan == 'month'){
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$week);
        }
        
		return $modified;
    }
    
    function time_elapsed_string($datetime, $full = false,$no_suffix = false) {
        if($datetime !== null){
            $now        = new FrozenTime();
            $diff       = (array) $now->diff($datetime);
            $diff['w']  = floor( $diff['d'] / 7 );
            $diff['d'] -= $diff['w'] * 7;
            
            $future_flag = false;
            if($now->i18nFormat(Time::UNIX_TIMESTAMP_FORMAT) < $datetime->i18nFormat(Time::UNIX_TIMESTAMP_FORMAT)){
                $future_flag = true;
            }

            $string = array(
                'y' => 'year',
                'm' => 'month',
                'w' => 'week',
                'd' => 'day',
                'h' => 'hour',
                'i' => 'minute',
                's' => 'second',
            );

            foreach( $string as $k => & $v )
            {
                if ( $diff[$k] )
                {
                    $v = $diff[$k] . ' ' . $v .( $diff[$k] > 1 ? 's' : '' );
                }
                else
                {
                    unset( $string[$k] );
                }
            }

            if ( ! $full ) $string = array_slice( $string, 0, 1 );
            if($no_suffix){
                return implode( ', ', $string );
            }else{
                if($future_flag){
                    return $string ? implode( ', ', $string ) . ' from now' : 'just now';
                }else{
                    return $string ? implode( ', ', $string ) . ' ago' : 'just now';    
                }
            }
        }
    }
}
