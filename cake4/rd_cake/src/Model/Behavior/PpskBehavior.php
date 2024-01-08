<?php

namespace App\Model\Behavior;

use Cake\ORM\Behavior;
use Cake\ORM\TableRegistry;
use Cake\Routing\Router;


class PpskBehavior extends Behavior {

    protected $RealmPmks;
    
    protected $SsidList = ['Koos', 'Ooog'];
   

    public function initialize(array $config):void{
        // Some initialization code here
        $this->RealmPmks    = TableRegistry::get('RealmPmks');   
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
            if($old_ppsk == ''){ //Added
                $this->_addNewEntries($realm_id,$new_ppsk);
            }
            if($new_ppsk == ''){ //Removed
                $this->_removeEntries($realm_id,$old_ppsk);
            }
            
            if((strlen($old_ppsk)>7)&&(strlen($new_ppsk)>7)){      //Changed     
                $this->_changeEntries($realm_id,$old_ppsk,$new_ppsk);
            }       
        } 
        
        if($entity->isNew()){ 
             $this->_addNewEntries($realm_id,$new_ppsk);
        }    
    }


    private function _doAfterDelete($entity){
        
    }
    
    private function _addNewEntries($realm_id,$ppsk){
    
        $d = [
            'realm_id'  => $realm_id,
            'ppsk'      => $ppsk,
            'pmk'       => $ppsk,
            'ssid'      => 'Dagga'
        ];
    
        $e = $this->RealmPmks->newEntity($d);
        $this->{'RealmPmks'}->save($e);     
    }
    
    private function _changeEntries($realm_id,$old_ppsk,$new_ppsk){
    
        $e_list = $this->{'RealmPmks'}->find()->where(['RealmPmks.realm_id' => $realm_id,'RealmPmks.ppsk' => $old_ppsk])->all();
        foreach($e_list as $e){
            $this->{'RealmPmks'}->patchEntity($e, ['ppsk' => $new_ppsk,'pmk' => $new_ppsk]);
            $this->{'RealmPmks'}->save($e);
        }       
    }
    
    private function _removeEntries($realm_id,$old_ppsk){ 
        $this->RealmPmks->deleteAll(['RealmPmks.realm_id' => $realm_id,'RealmPmks.ppsk' => $old_ppsk]);   
    }
 
}

?>
