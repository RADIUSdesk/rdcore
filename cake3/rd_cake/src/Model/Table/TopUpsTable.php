<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;
use Cake\ORM\TableRegistry;

use Cake\I18n\Time;

class TopUpsTable extends Table
{

    public function initialize(array $config){
        $this->addBehavior('Timestamp');     
        $this->belongsTo('PermanentUsers');
        $this->belongsTo('Users');  
        $this->hasMany('TopUpTransactions',['dependent' => false]);
          
        $this->Radchecks    = TableRegistry::get('Radchecks'); 
       // $this->TopUpTransactions    = TableRegistry::get('TopUpTransactions');     
    }
    
    public function beforeDelete($event, $entity){
        $this->_doBeforeDelete($entity);
    }
    
    public function beforeSave($event, $entity){
        return $this->_doBeforeSave($entity);   
    }
     
    private function _doBeforeSave($entity){
    
        if($entity->permanent_user_id){
            $e = $this->PermanentUsers->get($entity->permanent_user_id);
            if($entity){               
                $entity->permanent_user = $e->username;
                return true;
            }else{
                return false;
            }
        }else{
            if($entity->permanent_user){
                $e = $this->PermanentUsers->find()->where(['username' => $entity->permanent_user])->first();
                if($entity){
                    $entity->permanent_user_id = $e->id;
                    return true;
                }else{
                    return false;
                } 
            }
        }
        return false;    
    }
   
    public function afterSave($event, $entity){
        $this->_doAfterSave($entity);   
    }
    
    private function _doBeforeDelete($entity){
        if($entity->permanent_user_id){
        
            $old_value = null;
            $new_value = null;
        
            $e = $this->PermanentUsers->get($entity->permanent_user_id);
            $entity->permanent_user = $e->username;

                   
            if($entity->type == 'data'){
                $attribute  = 'Rd-Total-Data';
                $value      = $entity->data;
            }
            
            if($entity->type == 'time'){
                $attribute  = 'Rd-Total-Time';
                $value      = $entity->time;
            }
            
            if($entity->type == 'days_to_use'){
                $ret_val    = $this->_delete_days_to_use($e,$entity);  
                $attribute  = 'Expiration';
                $this->_add_top_up_transaction($entity,'delete',$attribute,$ret_val['old'],$ret_val['new']);
                return;
            }       
            $ret_val = $this->_update_radchecks($entity->permanent_user,$attribute,$value,'sub');        
            $this->_add_top_up_transaction($entity,'delete',$attribute,$ret_val['old'],$ret_val['new']);      
        }
    }
      
    private function _doAfterSave($entity){
    
        if($entity->type == 'data'){
            $attribute  = 'Rd-Total-Data';
            $value      = $entity->data;
        }

        if($entity->type == 'time'){
            $attribute  = 'Rd-Total-Time';
            $value      = $entity->time;
        }

        if($entity->type == 'days_to_use'){
            $attribute  = 'Expiration';
            $e  = $this->PermanentUsers->get($entity->permanent_user_id);
            if($entity->isNew()){
                $ret_val    = $this->_new_days_to_use($e,$entity);
                $this->_add_top_up_transaction($entity,'create',$attribute,$ret_val['old'],$ret_val['new']);
            }else{
                $ret_val    = $this->_update_days_to_use($e,$entity);
                if($ret_val){
                    $this->_add_top_up_transaction($entity,'update',$attribute,$ret_val['old'],$ret_val['new']);
                }
            }
            return;
        } 
    
        if($entity->isNew()){
            //Data Type of Entries    
            $ret_val = $this->_update_radchecks($entity->permanent_user,$attribute,$value);          
            $this->_add_top_up_transaction($entity,'create',$attribute,$ret_val['old'],$ret_val['new']);           
        }else{ 
            $items = ['data', 'time']; 
            foreach($items as $i){
                if($entity->type == $i){
                    if($entity->dirty($i)){
                        //Get the old value
                        $original   = $entity->getOriginal($i);
                        $new        = $entity->{$i};
                        if($new > $original){
                            $ret_val = $this->_update_radchecks($entity->permanent_user,$attribute,$new);          
                            $this->_add_top_up_transaction($entity,'update',$attribute,$ret_val['old'],$ret_val['new']);    
                        }else{
                            $ret_val = $this->_update_radchecks($entity->permanent_user,$attribute,$new,'sub');          
                            $this->_add_top_up_transaction($entity,'update',$attribute,$ret_val['old'],$ret_val['new']); 
                        }
                    } 
                }
            }   
        }
    }
    
    private function _add_top_up_transaction($entity,$action,$attribute,$old_value,$new_value){
    
        $d_t = [
            'user_id'           => $entity->user_id,
            'permanent_user_id' => $entity->permanent_user_id,
            'permanent_user'    => $entity->permanent_user,
            'top_up_id'         => $entity->id,
            'type'              => $entity->type,
            'action'            => $action,
            'radius_attribute'  => $attribute,
            'old_value'         => $old_value,
            'new_value'         => $new_value
        ];
        $e_t  = $this->TopUpTransactions->newEntity($d_t);
        $this->TopUpTransactions->save($e_t);
    }
    
    private function _update_radchecks($username,$attribute,$value,$action='add'){ 
        $q_e = $this->Radchecks->find()->where(['username' => $username, 'attribute' => $attribute])->first();
        if($q_e){
            $old_value  = $q_e->value; 
            if($action == 'sub'){
                $q_e->value = $q_e->value - $value;
            } 
            if($action == 'add'){
                $q_e->value = $q_e->value + $value;
            }         
            $new_value  = $q_e->value;
            $this->Radchecks->save($q_e);
            $top_up_id  = $q_e->id;  
        }else{
            $old_value      = null;
            //Hopefully we would never have to $action=='sub' from nothing...
            $d = [];
            $d['username']  = $username;
            $d['attribute'] = $attribute;
            $d['op']        = ':=';
            $d['value']     = $value;
            $new_value      = $d['value'];
            $n_e            = $this->Radchecks->newEntity($d);
            $this->Radchecks->save($n_e);
            $top_up_id      = $n_e->id;
        }                 
        return ['old' => $old_value, 'new' => $new_value ];
    }
    
    private function _new_days_to_use($e,$entity){
    
        $value = $entity->days_to_use;    
        if($e->to_date == null){ //Looks fresh
            $old_value = null;
            $from_date = new Time();
            $to_date   = new Time();
            $to_date->modify('+ '.$value.' days');  
            $e->from_date = $from_date;
            $e->to_date   = $to_date;
            $this->PermanentUsers->save($e);
        }else{
            $now_time           = new Time();
            $now_seconds        = $now_time->toUnixString();
            $to_date_seconds    = $e->to_date->toUnixString();
            $old_value          = 'Not available';
            $q_o = $this->Radchecks->find()->where(['username' => $e->username, 'attribute' => 'Expiration'])->first();
            if($q_o){
                $old_value = $q_o->value;
            }
            
            //We use this if for instance the user had some expiry in the past and then bought a top-up
            if($to_date_seconds > $now_seconds){
                $updated_val = $to_date_seconds + ($value * 86400);
            }else{
                $updated_val = $now_seconds + ($value * 86400);
            }    
            $e->to_date = Time::createFromTimestamp($updated_val);
            $this->PermanentUsers->save($e);
        } 
        $q_n = $this->Radchecks->find()->where(['username' => $e->username, 'attribute' => 'Expiration'])->first();
        if($q_n){
            $new_value = $q_n->value;
        }         
        return ['old' => $old_value, 'new' => $new_value ];
    }          
    
    private function _delete_days_to_use($e,$entity){
    
        $value              = $entity->days_to_use;
        $to_date_seconds    = $e->to_date->toUnixString();
        $updated_val        = $to_date_seconds - ($value * 86400);
               
        $q_o = $this->Radchecks->find()->where(['username' => $e->username, 'attribute' => 'Expiration'])->first();
        if($q_o){
            $old_value = $q_o->value;
        }
       
        $e->to_date = Time::createFromTimestamp($updated_val);
        $this->PermanentUsers->save($e);
        
        $q_n = $this->Radchecks->find()->where(['username' => $e->username, 'attribute' => 'Expiration'])->first();
        if($q_n){
            $new_value = $q_n->value;
        }         
        return ['old' => $old_value, 'new' => $new_value ];   
    }
    
    private function _update_days_to_use($e,$entity){
    
        if($entity->dirty('days_to_use')){
            $value              = $entity->days_to_use;
            $original           = $entity->getOriginal('days_to_use');
            $to_date_seconds    = $e->to_date->toUnixString();
            if($value > $original){
                $updated_val  = $to_date_seconds + ($value * 86400);
            }else{
                $updated_val  = $to_date_seconds - ($value * 86400);
            }
        
            $q_o = $this->Radchecks->find()->where(['username' => $e->username, 'attribute' => 'Expiration'])->first();
            if($q_o){
                $old_value = $q_o->value;
            }
            
            $e->to_date = Time::createFromTimestamp($updated_val);
            $this->PermanentUsers->save($e);

            $q_n = $this->Radchecks->find()->where(['username' => $e->username, 'attribute' => 'Expiration'])->first();
            if($q_n){
                $new_value = $q_n->value;
            }         
            return ['old' => $old_value, 'new' => $new_value ]; 
        }
        return false; //return false is nothing changed
        
    }          
}
