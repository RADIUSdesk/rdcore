<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;
use Cake\Auth\DefaultPasswordHasher;
use Cake\Utility\Text;

class Client extends Entity {

    // Add this method
    protected function _setPassword(string $password): ?string
    {
        if (mb_strlen($password) > 0) {
            return (new DefaultPasswordHasher())->hash($password);
        }
        return null;
    }
    
    protected function _setToken($value){
        if(($value == '')||($value == null)){  //'' is a 'special' value that is suppose to generate a new token
            return Text::uuid();
        }
    }
    
}
