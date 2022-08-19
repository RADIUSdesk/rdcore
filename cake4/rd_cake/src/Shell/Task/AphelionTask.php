<?php
namespace App\Shell\Task;

use Cake\Console\Shell;

class AphelionTask extends Shell{

    private $aro_ap_id = 3116;
    
    public function initialize(){
        parent::initialize();
        $this->loadModel('Acos');
        $this->loadModel('ArosAcos');
    }
    
    public function main(){
       
        $this->_addFirmwareKeys();
        $this->_addUnknownAps();
        $this->_addUnknownNodes();  
    }
    
    private function _addFirmwareKeys(){
    
        $this->out("Adding Rights for FirmwareKeys");
        //Find the id of 'Access Providers'
        $q_ap   = $this->Acos->find()->where(['alias' => 'Access Providers'])->first();
        $ap_id  = $q_ap->id;
        $this->out("AccessProviders id is ".$ap_id);
        $q_ap_c = $this->Acos->find()->where(['alias' => 'Controllers','parent_id' => $ap_id])->first();
        $c_id   = $q_ap_c->id;
        $this->out("Controllers ID is ".$c_id);
        
        //Check if it exists perhaps already
        $q_a = $this->Acos->find()->where(['alias' => 'FirmwareKeys','parent_id' => $c_id])->first();
        if($q_a){
           $this->out("FirmwareKeys already added it has an ID of ".$q_a->id); 
        
        }else{
            $this->out("FirmwareKeys NOT added YET adding it");
            $output = shell_exec("bin/cake acl create aco $c_id FirmwareKeys");
            print($output);
        }
        
        //Now we can loop through the items and see if they are not created
        $fk_methods = [
            'index'
        ];
        
        //Get the firmware keys id
        $this->out("Finding the ID of the FirmwareKey entry");
        $q_a = $this->Acos->find()->where(['alias' => 'FirmwareKeys','parent_id' => $c_id])->first();
        $firmware_key_id = $q_a->id;
        foreach($fk_methods as $i){
            $this->out("Checking and / or adding $i");
            $q_b = $this->Acos->find()->where(['alias' => $i,'parent_id' => $firmware_key_id])->first();
            if($q_b){
                $this->out("$i is already present");
            }else{
                $this->out("$i is NOT present");
                $output = shell_exec("bin/cake acl create aco $firmware_key_id $i");
                print($output);
            }
        }
        
        //Set the firmware_key's righs
        foreach($fk_methods as $i){
            $this->out("Setting FirmwareKeys right for $i");
            $q_b        = $this->Acos->find()->where(['alias' => $i,'parent_id' => $firmware_key_id])->first();
            $m_id       = $q_b->id;
            $aros_id    = $this->aro_ap_id;
            $output     = shell_exec("bin/cake acl grant $aros_id $m_id");
            print($output);
        }    
    }
    
    private function _addUnknownAps(){
    
        $this->out("Adding Rights for UnknownAps");
        //Find the id of 'Access Providers'
        $q_ap   = $this->Acos->find()->where(['alias' => 'Access Providers'])->first();
        $ap_id  = $q_ap->id;
        $this->out("AccessProviders id is ".$ap_id);
        $q_ap_c = $this->Acos->find()->where(['alias' => 'Controllers','parent_id' => $ap_id])->first();
        $c_id   = $q_ap_c->id;
        $this->out("Controllers ID is ".$c_id);
        
        //Check if it exists perhaps already
        $q_a = $this->Acos->find()->where(['alias' => 'UnknownAps','parent_id' => $c_id])->first();
        if($q_a){
           $this->out("UnknownAps already added it has an ID of ".$q_a->id); 
        
        }else{
            $this->out("UnknownAps NOT added YET adding it");
            $output = shell_exec("bin/cake acl create aco $c_id UnknownAps");
            print($output);
        }
        
        //Now we can loop through the items and see if they are not created
        $fk_methods = [
            'index'
        ];
        
        //Get the firmware keys id
        $this->out("Finding the ID of the UnknownAps entry");
        $q_a = $this->Acos->find()->where(['alias' => 'UnknownAps','parent_id' => $c_id])->first();
        $firmware_key_id = $q_a->id;
        foreach($fk_methods as $i){
            $this->out("Checking and / or adding $i");
            $q_b = $this->Acos->find()->where(['alias' => $i,'parent_id' => $firmware_key_id])->first();
            if($q_b){
                $this->out("$i is already present");
            }else{
                $this->out("$i is NOT present");
                $output = shell_exec("bin/cake acl create aco $firmware_key_id $i");
                print($output);
            }
        }
        
        //Set the firmware_key's righs
        foreach($fk_methods as $i){
            $this->out("Setting UnknownAps right for $i");
            $q_b        = $this->Acos->find()->where(['alias' => $i,'parent_id' => $firmware_key_id])->first();
            $m_id       = $q_b->id;
            $aros_id    = $this->aro_ap_id;
            $output     = shell_exec("bin/cake acl grant $aros_id $m_id");
            print($output);
        }    
    }
   
     private function _addUnknownNodes(){
    
        $this->out("Adding Rights for UnknownNodes");
        //Find the id of 'Access Providers'
        $q_ap   = $this->Acos->find()->where(['alias' => 'Access Providers'])->first();
        $ap_id  = $q_ap->id;
        $this->out("AccessProviders id is ".$ap_id);
        $q_ap_c = $this->Acos->find()->where(['alias' => 'Controllers','parent_id' => $ap_id])->first();
        $c_id   = $q_ap_c->id;
        $this->out("Controllers ID is ".$c_id);
        
        //Check if it exists perhaps already
        $q_a = $this->Acos->find()->where(['alias' => 'UnknownNodes','parent_id' => $c_id])->first();
        if($q_a){
           $this->out("UnknownNodes already added it has an ID of ".$q_a->id); 
        
        }else{
            $this->out("UnknownNodes NOT added YET adding it");
            $output = shell_exec("bin/cake acl create aco $c_id UnknownNodes");
            print($output);
        }
        
        //Now we can loop through the items and see if they are not created
        $fk_methods = [
            'index'
        ];
        
        //Get the firmware keys id
        $this->out("Finding the ID of the UnknownNodes entry");
        $q_a = $this->Acos->find()->where(['alias' => 'UnknownNodes','parent_id' => $c_id])->first();
        $firmware_key_id = $q_a->id;
        foreach($fk_methods as $i){
            $this->out("Checking and / or adding $i");
            $q_b = $this->Acos->find()->where(['alias' => $i,'parent_id' => $firmware_key_id])->first();
            if($q_b){
                $this->out("$i is already present");
            }else{
                $this->out("$i is NOT present");
                $output = shell_exec("bin/cake acl create aco $firmware_key_id $i");
                print($output);
            }
        }
        
        //Set the firmware_key's righs
        foreach($fk_methods as $i){
            $this->out("Setting UnknownNodes right for $i");
            $q_b        = $this->Acos->find()->where(['alias' => $i,'parent_id' => $firmware_key_id])->first();
            $m_id       = $q_b->id;
            $aros_id    = $this->aro_ap_id;
            $output     = shell_exec("bin/cake acl grant $aros_id $m_id");
            print($output);
        }    
    }
}
