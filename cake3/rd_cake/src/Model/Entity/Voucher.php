<?php 

namespace App\Model\Entity;

use Cake\ORM\Entity;
use Cake\Utility\Text;

/**
 * Voucher Entity.
 */
class Voucher extends Entity{
    protected function _setNeverExpire($value){
        if($value == '1'){
            $this->set('expire', null);
        }
    }      
}
