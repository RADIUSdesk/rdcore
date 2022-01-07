<?php
namespace App\Shell\Task;

use Cake\Console\Shell;
use Cake\Core\Configure;

class LegacyFirmwarePatchTask extends Shell{

    public function initialize(){
        parent::initialize();
        $this->loadModel('Nodes');
        $this->loadModel('UserSettings');
    }
    
    public function main(){    
        $this->_patchNodes();  
    }
    
    private function _patchNodes(){
        $this->out("Patch Nodes");
        
        $q_s = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => '-1','UserSettings.name' => 'mesh_nodes_patch'])->first();
        $setting_found = false;
        if($q_s){
            $setting_found = true;
            $setting_modified = $q_s->modified;
        }
        
        if($setting_found){
            $this->out("Found Existing Setting");
            $q_r = $this->Nodes->find()->contain(['NodeWifiSettings'])->where(['Nodes.modified >' => $setting_modified])->all();
            $this->{'UserSettings'}->touch($q_s);
            $this->{'UserSettings'}->save($q_s);//Update the timestamp   
        }else{
            $this->out("Create NEW Setting");
            $q_r = $this->Nodes->find()->contain(['NodeWifiSettings'])->all();
            $ent_setting = $this->{'UserSettings'}->newEntity(['user_id' => '-1','name' => 'mesh_nodes_patch', 'value' => 'mesh_nodes_patch']);
            $this->{'UserSettings'}->save($ent_setting);//Create the first entry
        } 
            
        foreach($q_r as $e){
            $this->out("Patch Node ".$e->name);
            $data = []; 
            $r_0_mesh_found     = false;
            $r_0_ap_found       = false;
            $r_1_mesh_found     = false;
            $r_1_ap_found       = false;
            $two_radio          = false;
            foreach($e->node_wifi_settings as $e_w){
            
                //== Radio 0 ====
            
                //Disabled
                if($e_w->name == 'radio0_disabled'){
                    if($e_w->value == 'false'){
                        $data['radio0_enable'] = 1;
                    }else{
                        $data['radio0_enable'] = 0;
                    }
                }
                //Mesh
                if($e_w->name == 'radio0_mesh'){
                    $r_0_mesh_found = true;
                    if($e_w->value == 'on'){
                        $data['radio0_mesh'] = 1;
                    }else{
                        $data['radio0_mesh'] = 0;
                    }
                }
                
                //AP/Entry
                if($e_w->name == 'radio0_ap'){
                    $r_0_ap_found = true;
                    if($e_w->value == 'on'){
                        $data['radio0_entry'] = 1;
                    }else{
                        $data['radio0_entry'] = 0;
                    }
                }
                
                //Band
                if($e_w->name == 'radio0_hwmode'){
                    if(($e_w->value == '11a_ac')||($e_w->value == '11a')){
                        $data['radio0_band'] = 5;
                    }
                    if($e_w->value == '11g'){
                        $data['radio0_band'] = 24;
                    }
                }
                
                //== Radio 1 ====
            
                //Disabled
                if($e_w->name == 'radio1_disabled'){
                
                    $two_radio = true;
                
                    if($e_w->value == 'false'){
                        $data['radio1_enable'] = 1;
                    }else{
                        $data['radio1_enable'] = 0;
                    }
                }
                //Mesh
                if($e_w->name == 'radio1_mesh'){
                    $r_1_mesh_found = true;
                    if($e_w->value == 'on'){
                        $data['radio1_mesh'] = 1;
                    }else{
                        $data['radio1_mesh'] = 0;
                    }
                }
                
                //AP/Entry
                if($e_w->name == 'radio1_ap'){
                    $r_1_ap_found = true;
                    if($e_w->value == 'on'){
                        $data['radio1_entry'] = 1;
                    }else{
                        $data['radio1_entry'] = 0;
                    }
                }
                
                //Band
                if($e_w->name == 'radio1_hwmode'){
                    if(($e_w->value == '11a_ac')||($e_w->value == '11a')){
                        $data['radio1_band'] = 5;
                    }
                    if($e_w->value == '11g'){
                        $data['radio1_band'] = 24;
                    }
                }
            }
            
            if($r_0_mesh_found == false){
                $data['radio0_mesh'] = 0;
            }
            if($r_0_ap_found == false){
                $data['radio0_entry'] = 0;
            }
            if($two_radio){
                if($r_1_mesh_found == false){
                    $data['radio1_mesh'] = 0;
                }
                if($r_1_ap_found == false){
                    $data['radio1_entry'] = 0;
                }
            }
             
            $this->{'Nodes'}->patchEntity($e,$data);
            $this->{'Nodes'}->save($e);
            $this->out("Node Patched OK"); 
        }
    }   
}
