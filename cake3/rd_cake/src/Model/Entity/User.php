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
    
}
