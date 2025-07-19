<?php 

namespace App\Model\Entity;

use Cake\ORM\Entity;
use Cake\Auth\DefaultPasswordHasher;
use Cake\Utility\Text;
/**
 * PermanentUser Entity.
 */
class PermanentUser extends Entity {

    // Hash the user's password before saving it to the database.
    protected function _setPassword(string $password): ?string {
        $this->set('cleartext_password', $password);
        if (strlen($password) > 0) {
            return (new DefaultPasswordHasher())->hash($password);
        }
        return null;
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
