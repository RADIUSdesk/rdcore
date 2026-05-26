<?php

namespace App\Command;

//as www-data
//cd /var/www/rdcore/cake4/rd_cake && bin/cake interface:changes >> /dev/null 2>&1

use Cake\Command\Command;
use Cake\Console\Arguments;
use Cake\Console\ConsoleIo;
use Cake\I18n\FrozenTime;
use DateTimeZone;
use Cake\ORM\TableRegistry;


class InterfaceChangesCommand extends Command {

    public static function defaultName(): string{
        return 'interface:changes';
    }

    public function initialize(): void {

        parent::initialize();
        $this->WanMwan3Status        = TableRegistry::getTableLocator()->get('WanMwan3Status');
        $this->MwanInterfaceChanges  = TableRegistry::getTableLocator()->get('MwanInterfaceChanges');
    }

    public function execute(Arguments $args, ConsoleIo $io){
    

        $qr = $this->WanMwan3Status->find()->all();
        foreach($qr as $i){
            $mwanStatusData = json_decode($i->mwan3_status);
            if (isset($mwanStatusData->interfaces)){
            
                // Assuming your data is in $mwan3_data
                $interfaces = $mwanStatusData->interfaces;

                foreach (get_object_vars($interfaces) as $interface_name => $interface_data) {
                    echo "Interface: " . $interface_name . "\n";
                    echo "Status: " . $interface_data->status . "\n";
                    echo "Tracking: " . $interface_data->tracking . "\n";
                    echo "Score: " . $interface_data->score . "\n";
                    echo "--------------------------------\n";
                }      
            }            
        }
        $io->out("====================");
    }
}

