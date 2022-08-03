<?php 

namespace App\Model\Entity;

use Cake\Auth\WeakPasswordHasher;
use Cake\ORM\Entity;
use Cake\Utility\Text;

/**
 * PermanentUser Entity.
 */
class PermanentUser extends Entity
{
    protected function _setPassword($value){
        $hasher = new WeakPasswordHasher();
        //Set the cleartext password so we can use it inside the behaviour
        $this->set('cleartext_password', $value); 
        return $hasher->hash($value);
    }
    
    protected function _setToken($value){
        if($value == ''){  //'' is a 'special' value that is suppose to generate a new token
            return Text::uuid();
        }
    }

    protected function _setAlwaysActive($value){
        if($value == 'always_active'){ //If this is set, we set the to and from values to null
            $this->set('from_date', null); 
            $this->set('to_date', null);
        }
    }

      
}
