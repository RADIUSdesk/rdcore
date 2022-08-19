<?php
namespace App\Shell\Task;

use Cake\Console\Shell;
use Cake\Core\Configure;

class MigrateHardwareTask extends Shell{

    public function initialize(){
        parent::initialize();
        
        Configure::load('MESHdesk'); 
        $hw_temp   = Configure::read('hardware');
        
        $this->MeshHardware = [];
        foreach($hw_temp as $hw){  
            $this->MeshHardware[$hw['id']] = $hw;
        }
        
        Configure::load('ApProfiles'); 
        $ap_hw_temp   = Configure::read('ApProfiles.hardware');
        
        $this->ApProfilesHardware = [];
        foreach($ap_hw_temp as $hw){  
            $this->ApProfilesHardware[$hw['id']] = $hw;
        }
        
        $this->loadModel('Nodes');
        $this->loadModel('NodeWifiSettings');
        $this->loadModel('Aps');
        $this->loadModel('ApWifiSettings');
    }
    
    public function main(){    
        $this->_addNewConventionMesh();
        $this->_removeOldConventionMesh();       
        $this->_addNewConventionAp();
        $this->_removeOldConventionAp();
    }
    
    private function _removeOldConventionAp(){
    
        $this->out("Remove old convention for AP");
        
        $this->ApWifiSettings->deleteAll(['ApWifiSettings.name' => 'radio0_band']);
        $this->ApWifiSettings->deleteAll(['ApWifiSettings.name' => 'radio1_band']);
    }
    
    private function _removeOldConventionMesh(){
    
        $this->out("Remove old convention for MESH");
        
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio0_disable_b']);
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio1_disable_b']);
        
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio0_diversity']);
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio1_diversity']);
        
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio0_ldpc']);
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio1_ldpc']);
        
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio0_beacon_int']);
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio1_beacon_int']);
        
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio0_ht_capab']);
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio1_ht_capab']);
        
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio0_distance']);
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'radio1_distance']); 
        $this->NodeWifiSettings->deleteAll(['NodeWifiSettings.name' => 'device_type']);
    }
    
    private function _addNewConventionMesh(){
    
        $this->out("Migrate MESH hardware to new convention");
        $q_r = $this->Nodes->find()->all();
        foreach($q_r as $e){
            
            $node_id = $e->id;
            $hardware = $e->hardware;
            //We need to confirm the hardware detail
            if(isset($this->MeshHardware[$hardware])){
                    
                $radios = $this->MeshHardware[$hardware]['radios'];
                
                if(($radios == 1)||($radios == 2)){
                    if($e->radio0_enable){
                        $radio0_disabled_value = 'false';
                        $this->_addIfMissing(['name' => 'radio0_disabled', 'value' => $radio0_disabled_value, 'node_id' => $node_id]);   
                    }else{
                        $radio0_disabled_value = 'true';
                        $this->_addIfMissing(['name' => 'radio0_disabled', 'value' => $radio0_disabled_value, 'node_id' => $node_id]);
                    }
                    
                    if($e->radio0_band == 5){
                        $this->_addIfMissing(['name' => 'radio0_hwmode', 'value' => '11a_ac', 'node_id' => $node_id]);
                        $channel = $e->radio0_five_chan;
                        $this->_addIfMissing(['name' => 'radio0_channel_five', 'value' => $channel, 'node_id' => $node_id]);
                    }
                    
                    if($e->radio0_band == 24){
                        $this->_addIfMissing(['name' => 'radio0_hwmode', 'value' => '11g', 'node_id' => $node_id]);
                        $channel = $e->radio0_two_chan;
                        $this->_addIfMissing(['name' => 'radio0_channel_two', 'value' => $channel, 'node_id' => $node_id]);
                    }
                    
                    if($e->radio0_mesh == 1){
                        $this->_addIfMissing(['name' => 'radio0_mesh', 'value' => 'on', 'node_id' => $node_id]);
                    }
                    
                    if($e->radio0_entry == 1){
                        $this->_addIfMissing(['name' => 'radio0_ap', 'value' => 'on', 'node_id' => $node_id]);
                    }      
                }
                
                if($radios == 2){
                    if($e->radio1_enable){
                        $radio1_disabled_value = 'false';
                        $this->_addIfMissing(['name' => 'radio1_disabled', 'value' => $radio1_disabled_value, 'node_id' => $node_id]);   
                    }else{
                        $radio1_disabled_value = 'true';
                        $this->_addIfMissing(['name' => 'radio1_disabled', 'value' => $radio1_disabled_value, 'node_id' => $node_id]);
                    }
                    
                    if($e->radio1_band == 5){
                        $this->_addIfMissing(['name' => 'radio1_hwmode', 'value' => '11a_ac', 'node_id' => $node_id]);
                        $channel = $e->radio1_five_chan;
                        $this->_addIfMissing(['name' => 'radio1_channel_five', 'value' => $channel, 'node_id' => $node_id]);
                    }
                    
                    if($e->radio1_band == 24){
                        $this->_addIfMissing(['name' => 'radio1_hwmode', 'value' => '11g', 'node_id' => $node_id]);
                        $channel = $e->radio1_two_chan;
                        $this->_addIfMissing(['name' => 'radio1_channel_two', 'value' => $channel, 'node_id' => $node_id]);
                    }
                    
                    if($e->radio1_mesh == 1){
                        $this->_addIfMissing(['name' => 'radio1_mesh', 'value' => 'on', 'node_id' => $node_id]);    
                    }
                    
                    if($e->radio1_entry == 1){
                        $this->_addIfMissing(['name' => 'radio1_ap', 'value' => 'on', 'node_id' => $node_id]);
                    }    
                } 
            }
        }       
    }
    
    private function _addNewConventionAp(){
   
        $this->out("Migrate AP hardware to new convention");
        $q_r = $this->Aps->find()->all();
        foreach($q_r as $e){
            $ap_id = $e->id;
            $hardware = $e->hardware;
            //We need to confirm the hardware detail
            if(isset($this->ApProfilesHardware[$hardware])){
                $radios     = $this->ApProfilesHardware[$hardware]['radios'];
                $band_0     = $this->ApProfilesHardware[$hardware]['radio0_band'];
                $band_1     = $this->ApProfilesHardware[$hardware]['radio1_band'];
                if(($radios == 1)||($radios == 2)){ 
                
                    $this->_addIfMissing(['name' => 'radio0_disabled', 'value' => 'false', 'ap_id' => $ap_id]);
                     
                    if($band_0 == 24){
                        $this->_addIfMissing(['name' => 'radio0_hwmode', 'value' => '11g', 'ap_id' => $ap_id]);
                    }  
                    if($band_0 == 5){
                        $this->_addIfMissing(['name' => 'radio0_hwmode', 'value' => '11a_ac', 'ap_id' => $ap_id]);
                    }   
                }
            
                if($radios == 2){
                
                    $this->_addIfMissing(['name' => 'radio1_disabled', 'value' => 'false', 'ap_id' => $ap_id]);
                
                    if($band_1 == 24){
                        $this->_addIfMissing(['name' => 'radio1_hwmode', 'value' => '11g',      'ap_id' => $ap_id]);
                    }  
                    if($band_1 == 5){
                        $this->_addIfMissing(['name' => 'radio1_hwmode', 'value' => '11a_ac',   'ap_id' => $ap_id]);
                    }   
                }          
            }  
        }
    }
       
    private function _addIfMissing($data){
        
        //Data needs to contain ['name' => 'radio0_disabled', 'value' => false, 'node_id' => 200]
        //or ['name' => 'radio0_disabled', 'value' => false, 'ap_id' => 200]   
        if(isset($data['node_id'])){ 
            $q_r = $this->{'NodeWifiSettings'}->find()->where($data)->first();
            if(!$q_r){
                $ent_setting = $this->{'NodeWifiSettings'}->newEntity($data);
                $this->{'NodeWifiSettings'}->save($ent_setting);
            }
        
        } 
        
        if(isset($data['ap_id'])){
            $q_r = $this->{'ApWifiSettings'}->find()->where($data)->first();
            if(!$q_r){
                $ent_setting = $this->{'ApWifiSettings'}->newEntity($data);
                $this->{'ApWifiSettings'}->save($ent_setting);
            }else{
                if(($data['name'] == 'radio0_disabled')||($data['name'] == 'radio1_disabled')){
                    //Patch it so it is enabled ('false')
                    $this->{'ApWifiSettings'}->patchEntity($q_r,$data);
                    $this->{'ApWifiSettings'}->save($ent_setting);
                }
            }  
        } 
    }
    
}
