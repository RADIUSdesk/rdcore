<?php

namespace App\Command;

//as www-data
//cd /var/www/rdcore/cake4/rd_cake && bin/cake permanent-users:sync-expiration >> /dev/null 2>&1

use Cake\Command\Command;
use Cake\Console\Arguments;
use Cake\Console\ConsoleIo;
use Cake\I18n\FrozenTime;
use DateTimeZone;

use Cake\Controller\ComponentRegistry;
use App\Controller\Component\IspPlumbingComponent;

class SyncUserExpirationCommand extends Command {

    protected $IspPlumbing;

    public static function defaultName(): string{
        return 'permanent-users:sync-expiration';
    }

    public function initialize(): void {

        parent::initialize();

        $registry = new ComponentRegistry();
        $this->IspPlumbing = new IspPlumbingComponent($registry);

        $this->loadModel('PermanentUsers');
    }

    public function execute(Arguments $args, ConsoleIo $io){
    
        //== FIXME Change to match your timezone ===
        $tz  = new \DateTimeZone('Africa/Lagos');
        $now = FrozenTime::now($tz);

        $expiredCount     = 0;
        $reactivatedCount = 0;

        /*
        * Expire users
        */
         
        $qExpire = $this->PermanentUsers->find()
            ->where([
                'to_date <' => $now,
                'admin_state' => 'active'
            ]);

        foreach ($qExpire->chunk(200) as $users) {       
             foreach ($users as $user) {            
                $user->admin_state = 'expired';
                if ($this->PermanentUsers->save($user)) {
                    $this->IspPlumbing->disconnectIfActive($user);
                    $expiredCount++;
                }
            }     
        }

        /*
         * Reactivate users
         */
        $qReactivate = $this->PermanentUsers->find()
            ->where([
                'to_date >=' => $now,
                'admin_state' => 'expired'
            ]);

        foreach($qReactivate->chunk(200) as $users) {       
             foreach ($users as $user) {            
                $user->admin_state = 'active';
                if ($this->PermanentUsers->save($user)) {                    
                    $this->IspPlumbing->disconnectIfActive($user); 
                    $reactivatedCount++;
                }
            }     
        }

        $io->out("Expired users updated: {$expiredCount}");
        $io->out("Reactivated users updated: {$reactivatedCount}");
    }
}

