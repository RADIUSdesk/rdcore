<?php 

namespace App\Model\Entity;

use Cake\Auth\WeakPasswordHasher;
use Cake\ORM\Entity;

class Group extends Entity{
   
    public function parentNode(){
        return null;
    }
    
      
}
