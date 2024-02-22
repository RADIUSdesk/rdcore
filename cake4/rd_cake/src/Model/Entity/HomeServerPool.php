<?php 

namespace App\Model\Entity;

use Cake\ORM\Entity;
use Cake\Utility\Text;

/**
 * Home Server Pool Entity.
 */
class HomeServerPool extends Entity{
      
    protected $RedoConfigFile   = false;

    public function getRedoConfigFile() {
           return $this->RedoConfigFile;
    }
    
    public function setRedoConfigFile() {
           $this->RedoConfigFile = true;
    }
     
}
