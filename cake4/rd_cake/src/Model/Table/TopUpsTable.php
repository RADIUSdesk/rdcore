<?php

namespace App\Model\Table;

use Cake\Validation\Validator;
use Cake\ORM\Table;
use Cake\ORM\TableRegistry;

class TopUpsTable extends Table{

    public function initialize(array $config): void{
        $this->addBehavior('Timestamp');
        $this->belongsTo('PermanentUsers');
        $this->belongsTo('Users');
        $this->hasMany('TopUpTransactions');
    }

    public function beforeSave($event, $entity){
       
        if ($entity->permanent_user_id) {
            $user = $this->PermanentUsers->get($entity->permanent_user_id);           
            $entity->permanent_user = $user->username;
        }

        return true;
    }
}

