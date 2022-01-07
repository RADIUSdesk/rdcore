<?php 

namespace App\Model\Entity;

use Cake\Auth\WeakPasswordHasher;
use Cake\ORM\Entity;
use Cake\Utility\Text;
use Cake\ORM\TableRegistry;

/**
 * User Entity.
 */
class User extends Entity
{
 
    protected function _setPassword($value){  
        $hasher = new WeakPasswordHasher();
        return $hasher->hash($value);
    }
    
    protected function _setToken($value){
        if($value == ''){  //'' is a 'special' value that is suppose to generate a new token
            return Text::uuid();
        }
    }
    
    public function parentNode(){
        if (!$this->id) {
            return null;
        }
        if (isset($this->group_id)) {
            $groupId = $this->group_id;
        } else {
            $Users = TableRegistry::get('Users');
            $user = $Users->find('all', ['fields' => ['group_id']])->where(['id' => $this->id])->first();
            $groupId = $user->group_id;
        }
        if (!$groupId) {
            return null;
        }
        return ['Groups' => ['id' => $groupId]]; //Change to 'Group'
    }     
}
