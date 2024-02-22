<?php

namespace App\Model\Behavior;

use Cake\ORM\Behavior;
use Cake\ORM\TableRegistry;
use Cake\Routing\Router;


class FreeRadiusHomeServersBehavior extends Behavior {

    //protected $fr_proxy_file = '/tmp/proxy.conf';
    protected $fr_proxy_file = '/etc/freeradius/3.0/proxy.conf';
    protected $n_proxy_file  = '/tmp/new_proxy.conf';
    protected $radmin_wrapper= '/var/www/html/cake4/rd_cake/setup/scripts/radmin_wrapper.pl';
    protected $short_name    = 'home_server_';
    
    public function checkConfigFileRedo($entity){     
 
        if($entity->getRedoConfigFile()){
            $s          = TableRegistry::get('HomeServerPools');
            $current    = $s->find()->where(['HomeServerPools.id' => $entity->id])->contain(['HomeServers'])->first();
            $pool_id    = $current->id;
            $arr_new_file   = $this->_proxy_remove_hs_pool($pool_id);
            $arr_to_add     = $this->_proxy_add_hs_pool($pool_id);
            $arr_new_file   = array_merge($arr_new_file,$arr_to_add);
            file_put_contents($this->n_proxy_file,$arr_new_file); 
            copy($this->n_proxy_file ,$this->fr_proxy_file );
            unlink($this->n_proxy_file);
            exec("sudo " . $this->radmin_wrapper . " reload freeradius"); 
        }
    }
    
    public function removeHsPool($entity){
        $pool_id        = $entity->id;
        $s              = TableRegistry::get('HomeServerPools');
        
        //Remove any NAS entries should there be any (for COA)
        $n              = TableRegistry::get('Nas');
        $current        = $s->find()->where(['HomeServerPools.id' => $entity->id])->contain(['HomeServers'])->first();
        if($current){
            foreach($current->home_servers as $hs){
                $shortname = $this->short_name.$hs->id;
                print_r($shortname);
                $e_n = $n->find()->where(['Nas.shortname' =>$shortname])->first();
                if($e_n){
                    $n->delete($e_n);
                }   
            }      
        }
        
        $arr_new_file   = $this->_proxy_remove_hs_pool($pool_id);
        file_put_contents($this->n_proxy_file,$arr_new_file);
        copy($this->n_proxy_file ,$this->fr_proxy_file );
        unlink($this->n_proxy_file);
        exec("sudo " . $this->radmin_wrapper . " reload freeradius"); 
    }
    
    private function _proxy_add_hs_pool($hsp_id){
    
        $arr_to_add = [];
    
        $s          = TableRegistry::get('HomeServerPools');
        $current    = $s->find()->where(['HomeServerPools.id' => $hsp_id])->contain(['HomeServers'])->first();
        if($current){
        
                array_push($arr_to_add,"home_server_pool $current->id {\n");
                array_push($arr_to_add,"\ttype = $current->type\n");
                foreach($current->home_servers as $hs){
                    array_push($arr_to_add,"\thome_server = $hs->id\n");
                }
                array_push($arr_to_add,"}\n");
                
                $want_these = ['type','ipaddr','port','secret','response_window','zombie_period','revive_interval'];
                
                foreach($current->home_servers as $hs){
                    array_push($arr_to_add,"home_server $hs->id {\n");
                    foreach($want_these as $want){
                        $w = $hs->{$want};
                        array_push($arr_to_add,"\t$want = $w\n");
                    }
                    array_push($arr_to_add,"}\n");
                }
                
                array_push($arr_to_add,"realm $current->id {\n");
                array_push($arr_to_add,"\tpool = $current->id\n");
                array_push($arr_to_add,"\tnostrip\n");
                array_push($arr_to_add,"}\n");
        
        }
        return $arr_to_add;
    } 
    
    private function _proxy_remove_hs_pool($pool_id){
    
        $arr_proxy = explode("\n", file_get_contents($this->fr_proxy_file));
        //look for  home_server_pool 15 { and record the number to start...
        
        $item       = 0;
        $hsp_start  = false;
        $hsp_end    = false;
        $hs_list    = [];
        
        $block_outs = [];
        //$p_ = PATTERN
        $start_recording    = false;        
        $p_hsp_start        = "/^\s*home_server_pool\s+$pool_id\s+{/";
        $p_hsp_end          = "/^\s*}/";
        $p_hsp_hs           = "/^\s*home_server\s*=/";
        $p_r_start          = "/^\s*realm\s+$pool_id\s+{/";
        
        
        //First we get the start and finish of the home_server_pool
        foreach($arr_proxy as $line){          
            if(preg_match($p_hsp_start , $line)){
                //print_r("Match $p_hsp_start on item $item");
                $hsp_start =$item;
                $start_recording = true;
            }
            if(($start_recording)&&(preg_match($p_hsp_hs , $line))){               
                $home_server = preg_replace($p_hsp_hs,'',$line);
                $home_server = preg_replace('/^\s*/','',$home_server);
                array_push($hs_list,$home_server);
            }
                       
            if(($start_recording)&&(preg_match($p_hsp_end , $line))){
                $hsp_end =$item;
                $start_recording = false;
            }            
            $item++;        
        }
        
        //Next we can look for EACH of the home_server's start and finish
        if(($hsp_start > 0)&&($hsp_end > $hsp_start)){ 
         
            array_push($block_outs,['start' => $hsp_start, 'end' => $hsp_end]); //Add it to the block out list
            
            //Found a hit now lets see the list of home_servers
            foreach($hs_list as $hs_name){
            
               // print("Looking for Home Server $hs_name\n");
                $p_hs_start         = "/^\s*home_server\s+$hs_name\s+{/";
                $start_recording    = false;
                $item               = 0;
                $hs_start           = false;
                $hs_end             = false;
                
                foreach($arr_proxy as $line){
                    if(preg_match($p_hs_start , $line)){
                        $hs_start = $item;
                        $start_recording = true;
                    }            
                    if(($start_recording)&&(preg_match($p_hsp_end , $line))){
                        $hs_end =$item;
                        $start_recording = false;
                    }            
                    $item++;       
                }
                
                if(($hs_start > 0)&&($hs_end > $hs_start)){
                    array_push($block_outs,['start' => $hs_start, 'end' => $hs_end]); //Add it to the block out list
                } 
            }
            
            //Finally we look for a realm with the same name (id) as the pool 
            $item       = 0;
            $r_start    = false;
            $r_end      = false;
            foreach($arr_proxy as $line){
                if(preg_match($p_r_start , $line)){
                    $r_start = $item;
                    $start_recording = true;
                }            
                if(($start_recording)&&(preg_match($p_hsp_end , $line))){
                    $r_end =$item;
                    $start_recording = false;
                }            
                $item++; 
            }
            
            if(($r_start > 0)&&($r_end > $r_start)){
                array_push($block_outs,['start' => $r_start, 'end' => $r_end]); //Add it to the block out list
            }             
        }
        
        $item   = 0;
        $arr_new_file = [];
        foreach($arr_proxy as $line){
        
            $keep_line = true;
            foreach($block_outs as $block_out){
                $start  = $block_out['start'];
                $end    = $block_out['end'];
                if(($item >= $start)&&($item <= $end)){
                    //print("$line\n");
                    $keep_line = false;
                }
            }
            if($keep_line){
                if($line !==''){
                    array_push($arr_new_file,"$line\n");
                }
            }
            $item++;
        }    
        return($arr_new_file);
    }
    
}


