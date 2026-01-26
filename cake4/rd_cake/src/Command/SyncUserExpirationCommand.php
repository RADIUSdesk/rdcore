<?php

//as www-data
//cd /var/www/rdcore/cake4/rd_cake && bin/cake permanent-users:sync-expiration >> /dev/null 2>&1

namespace App\Command;

use Cake\Command\Command;
use Cake\Console\Arguments;
use Cake\Console\ConsoleIo;
use Cake\I18n\FrozenTime;

class SyncUserExpirationCommand extends Command {

    public static function defaultName(): string{
        return 'permanent-users:sync-expiration';
    }

    public function execute(Arguments $args, ConsoleIo $io){

        $this->loadModel('PermanentUsers');
        $now = FrozenTime::now();

        // Expire users
        $expired = $this->PermanentUsers->updateAll(
            ['admin_state' => 'expired'],
            [
                'to_date <' => $now,
                'admin_state IN' => ['active'],
            ]
        );

        // Reactivate users
        $reactivated = $this->PermanentUsers->updateAll(
            ['admin_state' => 'active'],
            [
                'to_date >=' => $now,
                'admin_state' => 'expired',
            ]
        );
        
        //FIXME Should we reconnect the user if their state change?? (especially disconnecting active users that expired)

        $io->out("Expired users updated: {$expired}");
        $io->out("Reactivated users updated: {$reactivated}");
    }
}
