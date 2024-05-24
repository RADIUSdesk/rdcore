<?php

namespace App\Model\Behavior;

use Cake\ORM\Behavior;
use Cake\ORM\TableRegistry;
use Cake\Routing\Router;


class PpskBehavior extends Behavior {

    protected $RealmPmks;
    
    public function initialize(array $config):void{
         
    }

   public function beforeSave($event, $entity){
        $this->_doBeforeSave($entity);   
    }

    public function afterSave($event, $entity){
        $this->_doAfterSave($entity);   
    }

    public function afterDelete($event, $entity){
        $this->_doAfterDelete($entity);
    }

    private function _doBeforeSave($entity){
          
    }
    
    private function _doAfterSave($entity){
           
        $realm_id   = $entity->realm_id;
        $new_ppsk   = $entity->ppsk;
     
        if($entity->isDirty('ppsk')){  
                     
            $old_ppsk = $entity->getOriginal('ppsk');
                                    
            if(($old_ppsk == '')&&(strlen($new_ppsk)>7)){ //Added
                $this->_addNewEntries($realm_id,$new_ppsk);
            }
            if(($new_ppsk == '')&&(strlen($old_ppsk)>7)){ //Removed
                $this->_removeEntries($realm_id,$old_ppsk);
            }
            
            if((strlen($old_ppsk)>7)&&(strlen($new_ppsk)>7)){      //Changed     
                $this->_changeEntries($realm_id,$old_ppsk,$new_ppsk);
            }       
        } 
        
        if(($entity->isNew())&&(strlen($new_ppsk)>7)){         
             $this->_addNewEntries($realm_id,$new_ppsk);
        }    
    }

    private function _doAfterDelete($entity){ 
        $realm_id   = $entity->realm_id;
        $ppsk       = $entity->ppsk;   
        if(strlen($entity->ppsk)>7){
            $this->_removeEntries($realm_id,$ppsk);
        }        
    }
    
    private function _addNewEntries($realm_id,$ppsk){
    
        //We add an entry for each defined realm_ssid
        $realmSsids    = TableRegistry::get('RealmSsids');
        $realmPmks      = TableRegistry::get('RealmPmks'); 
        $e_realm_ssids = $realmSsids->find()->where(['RealmSsids.realm_id' => $realm_id])->all();
        
        foreach($e_realm_ssids as $ent_ssid){
            $pmk    = $this->pbkdf2('sha1',$ppsk,$ent_ssid->name,4096,32);
            $d      = [
                'realm_id'          => $realm_id,
                'ppsk'              => $ppsk,
                'pmk'               => $pmk,
                'realm_ssid_id'     => $ent_ssid->id
            ];   
            $e = $realmPmks->newEntity($d);
            $realmPmks->save($e);       
        }
    }
    
    private function _changeEntries($realm_id,$old_ppsk,$new_ppsk){
    
        $realmPmks  = TableRegistry::get('RealmPmks');   
        $e_list     = $realmPmks->find()->where(['RealmPmks.realm_id' => $realm_id,'RealmPmks.ppsk' => $old_ppsk])->contain(['RealmSsids'])->all();
        foreach($e_list as $e){
            //Get the SSIDs
            $ssid   = $e->realm_ssid->name;
            $pmk    = $this->pbkdf2('sha1',$new_ppsk,$ssid,4096,32);
            $realmPmks->patchEntity($e, ['ppsk' => $new_ppsk,'pmk' => $pmk]);
            $realmPmks->save($e);
        }       
    }
    
    private function _removeEntries($realm_id,$ppsk){
        $this->RealmPmks    = TableRegistry::get('RealmPmks');
        $this->RealmPmks->deleteAll(['RealmPmks.realm_id' => $realm_id,'RealmPmks.ppsk' => $ppsk]);   
    }
    
    private function pbkdf2($algorithm, $password, $salt, $count, $key_length, $raw_output = false){
        $algorithm = strtolower($algorithm);
        if(!in_array($algorithm, hash_algos(), true))
            die('PBKDF2 ERROR: Invalid hash algorithm.');
        if($count <= 0 || $key_length <= 0)
            die('PBKDF2 ERROR: Invalid parameters.');

        $hash_length = strlen(hash($algorithm, "", true));
        $block_count = ceil($key_length / $hash_length);

        $output = "";
        for($i = 1; $i <= $block_count; $i++) {
            // $i encoded as 4 bytes, big endian.
            $last = $salt . pack("N", $i);
            // first iteration
            $last = $xorsum = hash_hmac($algorithm, $last, $password, true);
            // perform the other $count - 1 iterations
            for ($j = 1; $j < $count; $j++) {
                $xorsum ^= ($last = hash_hmac($algorithm, $last, $password, true));
            }
            $output .= $xorsum;
        }

        if($raw_output)
            return substr($output, 0, $key_length);
        else
            return bin2hex(substr($output, 0, $key_length));
    }
 
}

?>
