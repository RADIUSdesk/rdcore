<?php
//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake add_account_user

namespace App\Shell;

use Cake\Console\Shell;
use Cake\I18n\Time;
use Cake\Datasource\ConnectionManager;


class AddAccountUserShell extends Shell{

    public function initialize(){
        parent::initialize();
        $this->loadModel('AccountUsers');
    }

    public function main(){
        $this->out("Adding the initial SuperAdmin");
        $this->_add_super_admin();
    }
    
    private function _add_super_admin(){
    
        $data = ['id' => -1,'username' => 'superadmin','password' => 'admin','can_invite' => 1,'active' => 1,'verified'=>1,'token' => ''];
        $ent_au = $this->{'AccountUsers'}->newEntity($data);
        $this->{'AccountUsers'}->save($ent_au);
    
    }
}

?>
