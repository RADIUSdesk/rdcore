<?php 

namespace App\Model\Entity;

use Cake\ORM\Entity;
use Cake\Utility\Text;

/**
 * Device Entity.
 */
class Device extends Entity
{

    protected function _setAlwaysActive($value){
        if($value == 'always_active'){ //If this is set, we set the to and from values to null
            $this->set('from_date', null); 
            $this->set('to_date', null);
        }
    } 
        
}
