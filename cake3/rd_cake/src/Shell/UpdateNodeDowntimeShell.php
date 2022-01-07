<?php

//Call this the following way
// */5  *    *    *    * cd /var/www/html/cake3/rd_cake && bin/cake update_node_downtime 

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Datasource\ConnectionManager;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

class UpdateNodeDowntimeShell extends Shell{

    public function initialize(){
        parent::initialize();
        $this->loadModel('UserSettings');
        $this->loadModel('Meshes');
        $this->loadModel('ApProfiles');
        $this->loadModel('NodeUptmHistories');
        $this->loadModel('ApUptmHistories');      
	    $this->loadModel('Alerts');
    }

    public function main(){
        $this->out("Updating Node Downtime");
        //-- Figure out the dead_after time --
        $dead_after = 900; //15Min default
        $q_r        = $this->{'UserSettings'}->find()->where(['user_id' => '-1', 'name' => 'heartbeat_dead_after'])->first();
        if($q_r){ 
            $dead_after = $q_r->value;
        }
        $this->out("MESHES Default Dead After Is $dead_after");
        
        //Do ALL the meshes
        $meshes = $this->{'Meshes'}->find()->contain(['Nodes','NodeSettings'])->all();
        foreach($meshes as $m){
            if($m->node_setting){
                if($m->node_setting->heartbeat_dead_after){
                    $dead_after = $m->node_setting->heartbeat_dead_after;
                }
            }
            foreach($m->nodes as $n){
                 $this->out("$m->name Check Node with MAC $n->mac $dead_after");
                 $node_data = [
                    'node_id'       => $n->id,
                    'mesh_id'       => $m->id,
                    'dead_after'    => $dead_after,
                    'enable_alerts' => $n->enable_alerts
                 ];
                 $this->_do_node_uptm_history($node_data);
            }               
        }
        
        //====RESET IT FOR AP PROFILES====
        $dead_after = 900; //15Min default
        $q_r        = $this->{'UserSettings'}->find()->where(['user_id' => '-1', 'name' => 'heartbeat_dead_after'])->first();
        if($q_r){ 
            $dead_after = $q_r->value;
        }
        $this->out("AP PROFILES Default Dead After Is $dead_after");
        
        $ap_profiles = $this->{'ApProfiles'}->find()->contain(['Aps'])->all();
        foreach($ap_profiles as $ap_profile){    
            $this->out("Doing AP Profile ".$ap_profile->name);
            if($ap_profile->ap_profile_setting){
                if($ap_profile->ap_profile_setting->heartbeat_dead_after){
                    $dead_after = $m->node_setting->heartbeat_dead_after;
                }
            }
            
            foreach($ap_profile->aps as $a){
                 $this->out("$ap_profile->name Check Node with MAC $a->mac $dead_after");
                 $ap_data = [
                    'ap_id'         => $a->id,
                    'ap_profile_id' => $ap_profile->id,
                    'dead_after'    => $dead_after,
                    'enable_alerts' => $a->enable_alerts
                 ];
                 $this->_do_ap_uptm_history($ap_data);
            }             
        }      
        
		/*Configure::load('MESHdesk');
		$data 		= Configure::read('common_node_settings'); //Read the defaults
		$dead_after	= $data['heartbeat_dead_after'];
        $this->connection = ConnectionManager::get('default');
		// Get Nodes
        $this->connection->execute("set @dead_seconds = ".$dead_after);
        $this->connection->execute("set @nds = 0");
        $this->connection->execute("call sp_update_node_downtime(@dead_seconds,@nds)");
        $nresults = $this->connection->execute("select @nds;")->fetchAll('assoc');
        $ncount = $nresults[0]['@nds'];
		// Get Aps
        $this->connection->execute("set @dead_seconds = ".$dead_after);
        $this->connection->execute("set @ads = 0");
        $this->connection->execute("call sp_update_ap_downtime(@dead_seconds,@ads)");
        $aresults = $this->connection->execute("select @ads;")->fetchAll('assoc');
        $acount = $aresults[0]['@ads'];
        $this->out("$ncount nodes were updated, $acount aps were updated");*/
    }
    
    private function _do_node_uptm_history($d){
    
        $node_id        = $d['node_id'];
        $mesh_id        = $d['mesh_id'];
        $dead_after     = $d['dead_after'];
        $enable_alerts  = $d['enable_alerts'];
        $new_alert      = false;

        $q_r = $this->NodeUptmHistories->find()
            ->where(['node_id' => $node_id])
            ->order(['NodeUptmHistories.report_datetime' => 'desc'])
            ->first();           

            
        if($q_r){
            $time       = FrozenTime::now();
            $cut_off    = $time->subSeconds($dead_after);
            if($q_r->report_datetime < $cut_off){
                if($q_r->node_state == 0){ //Down Update the down state
                    $q_r->report_datetime = FrozenTime::now();
                    $this->{'NodeUptmHistories'}->save($q_r);
                    if($enable_alerts == 1){ //We also add it here IN CASE the device was down and someone ENABLED alerts (while device was down)
                        $new_alert = true;
                    } 
                }else{
                    //NOT down ... Create a New one Marking it DOWN              
                    $data                   = [];
                    $data['node_state']     = 0;
                    $data['node_id']        = $node_id; 
                    $data['state_datetime'] = FrozenTime::now();
                    $data['report_datetime']= FrozenTime::now();   
                    $e_new                  = $this->{'NodeUptmHistories'}->newEntity($data);    
                    $this->{'NodeUptmHistories'}->save($e_new);    
                    if($enable_alerts == 1){
                        $new_alert = true;
                    }                                
                } 
            }
        }else{
            //Empty -> Prime it
            $data                   = [];
            $data['node_state']     = 0;
            $data['node_id']        = $node_id; 
            $data['state_datetime'] = FrozenTime::now();
            $data['report_datetime']= FrozenTime::now();   
            $e_new                  = $this->{'NodeUptmHistories'}->newEntity($data);    
            $this->{'NodeUptmHistories'}->save($e_new);
            if($enable_alerts == 1){
                $new_alert = true;
            }          
        }
        
        if($new_alert == true){
            $a_d = [];
            $a_d['mesh_id']   = $mesh_id;
            $a_d['node_id']   = $node_id;
            $this->_do_alert($a_d);
        }       
    }
   
    private function _do_ap_uptm_history($d){
    
        $ap_id          = $d['ap_id'];
        $ap_profile_id  = $d['ap_profile_id'];
        $dead_after     = $d['dead_after'];
        $enable_alerts  = $d['enable_alerts'];      
        $new_alert      = false;
    
        $q_r = $this->ApUptmHistories->find()
            ->where(['ap_id' => $ap_id])
            ->order(['ApUptmHistories.report_datetime' => 'desc'])
            ->first();
            
        if($q_r){
            $time       = FrozenTime::now();
            $cut_off    = $time->subSeconds($dead_after);
            if($q_r->report_datetime < $cut_off){
                if($q_r->ap_state == 0){ //Down Update the down state
                    $q_r->report_datetime = FrozenTime::now();
                    $this->{'ApUptmHistories'}->save($q_r);
                    if($enable_alerts == 1){ //We also add it here IN CASE the device was down and someone ENABLED alerts (while device was down)
                        $new_alert = true;
                    } 
                }else{
                    //NOT down ... Create a New one Marking it DOWN              
                    $data                   = [];
                    $data['ap_state']       = 0;
                    $data['ap_id']          = $ap_id; 
                    $data['state_datetime'] = FrozenTime::now();
                    $data['report_datetime']= FrozenTime::now();   
                    $e_new                  = $this->{'ApUptmHistories'}->newEntity($data);    
                    $this->{'ApUptmHistories'}->save($e_new);
                    if($enable_alerts == 1){
                        $new_alert = true;
                    }                
                } 
            }
        }else{
            //Empty -> Prime it
            $data                   = [];
            $data['ap_state']       = 0;
            $data['ap_id']          = $ap_id; 
            $data['state_datetime'] = FrozenTime::now();
            $data['report_datetime']= FrozenTime::now();   
            $e_new                  = $this->{'ApUptmHistories'}->newEntity($data);    
            $this->{'ApUptmHistories'}->save($e_new);
            if($enable_alerts == 1){
                $new_alert = true;
            }           
        }
        
        if($new_alert == true){
            $a_d = [];
            $a_d['ap_profile_id']   = $ap_profile_id;
            $a_d['ap_id']           = $ap_id;
            $this->_do_alert($a_d);
        }  
    }
    
    private function _do_alert($d){ 
        $d['description'] = 'Device Unreachable'; 
        if(isset($d['ap_profile_id'])){
            $this->out("Add Alert for AP with ID ".$d['ap_id']);
            //$count = $this->{'Alerts'}->find()->where(['Alerts.acknowledged IS NULL','Alerts.resolved IS NULL','Alerts.ap_id' => $d['ap_id']])->count();
            $count = $this->{'Alerts'}->find()->where(['Alerts.resolved IS NULL','Alerts.ap_id' => $d['ap_id']])->count();
            if($count == 0){
                $a_new  = $this->{'Alerts'}->newEntity($d);    
                $this->{'Alerts'}->save($a_new);
            }       
        }
        
        if(isset($d['mesh_id'])){
            $this->out("Add Alert for Node with ID ".$d['node_id']);
            //$count = $this->{'Alerts'}->find()->where(['Alerts.acknowledged IS NULL','Alerts.resolved IS NULL','Alerts.node_id' => $d['node_id']])->count();
            $count = $this->{'Alerts'}->find()->where(['Alerts.resolved IS NULL','Alerts.node_id' => $d['node_id']])->count();
            if($count == 0){
                $a_new  = $this->{'Alerts'}->newEntity($d);    
                $this->{'Alerts'}->save($a_new);
            } 
        } 
    }   
}

?>
