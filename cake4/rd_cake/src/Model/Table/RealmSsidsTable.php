<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;
use Cake\ORM\TableRegistry;

class RealmSsidsTable extends Table{

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');  
        $this->belongsTo('Realms');
        $this->RealmPmks = TableRegistry::get('RealmPmks');
        $this->hasMany('RealmPmks',['dependent' => true]);   
    }
   
     public function validationDefault(Validator $validator): Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message' => 'The SSID name you provided is already taken. Please provide another one.',
                    'rule'    => ['validateUnique', ['scope' => 'realm_id']],
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
       
    public function afterSave($event, $entity){
        return $this->_doAfterSave($entity);   
    }
       
    private function _doAfterSave($entity){
    
        if($entity->isDirty('name')){
            $pmks = $this->{'RealmPmks'}->find()->where(['RealmPmks.realm_ssid_id' => $entity->id])->all();
            foreach($pmks as $e_pmk){
                $pmk = $this->pbkdf2('sha1',$e_pmk->ppsk,$entity->name,4096,32); 
                $this->{'RealmPmks'}->patchEntity($e_pmk, ['pmk' => $pmk]);
                $this->{'RealmPmks'}->save($e_pmk);  
            } 
        }
        
        if($entity->isDirty('id')){
            $this->_addNewEntries($entity);
        }              
         
        if($entity->isNew()){ 
             $this->_addNewEntries($entity);
        }  
    }
    
    
    private function _addNewEntries($ent_ssid){	

        //Find all the permanent users beloing to this realm with a ppsk bigger than 7 chars
        $realm_id       = $ent_ssid->realm_id;
        $permanentUsers = TableRegistry::get('PermanentUsers');      
        $e_perm_users   = $permanentUsers->find()->where(['PermanentUsers.realm_id' => $realm_id,'PermanentUsers.ppsk IS NOT' => null,'PermanentUsers.ppsk !=' => ''])->all();        
	    foreach($e_perm_users as $pu){	    
	        $pmk = $this->pbkdf2('sha1',$pu->ppsk,$ent_ssid->name,4096,32);	        
	        $d = [
                'realm_id'      => $realm_id,
                'ppsk'          => $pu->ppsk,
                'pmk'           => $pmk,
                'realm_ssid_id' => $ent_ssid->id
            ];    
            $e = $this->RealmPmks->newEntity($d);
            $this->{'RealmPmks'}->save($e);	    
	    }		
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
