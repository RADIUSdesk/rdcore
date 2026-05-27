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
        
            $ap_id      = null;
            $node_id    = null;
            $where_clause = [];
            
            if(isset($i->ap_id)){     
                $ap_id = $i->ap_id;
                $where_clause['ap_id'] = $ap_id;            
                echo "AP ID is : " . $ap_id . "\n";
            }
            
            if(isset($i->node_id)){     
                $node_id = $i->node_id;
                $where_clause['node_id'] = $node_id;             
                echo "NODE ID is : " . $node_id . "\n";
            }
            
               
            $mwanStatusData = json_decode($i->mwan3_status);
            if (isset($mwanStatusData->interfaces)){        
                // Assuming your data is in $mwan3_data
                $interfaces = $mwanStatusData->interfaces;
                foreach (get_object_vars($interfaces) as $interface_name => $interface_data) {
                    echo "Interface: " . $interface_name . "\n";
                    echo "Status: " . $interface_data->status . "\n";
                    echo "Tracking: " . $interface_data->tracking . "\n";
                    echo "Score: " . $interface_data->score . "\n";
                    echo "Up: " . $interface_data->up . "\n";
                    echo "--------------------------------\n";
                    
                    $mwan_interface_id = str_replace("mw", "", $interface_name);
                    
                    $where_clause['mwan_interface_id'] = $mwan_interface_id;
                    
                    $new_data       = $where_clause;
                    $new_data['up'] = $interface_data->up;
                    $new_data['status'] = $interface_data->status;
                    $new_data['tracking'] = $interface_data->tracking;
                                                   
                    $intChange = $this->MwanInterfaceChanges->find()
                        ->where($where_clause)
                        ->order(['created' => 'DESC'])
                        ->first();
                        
                    if($intChange){
                    
                        if(
                            ($intChange->up !== $new_data['up'])||
                            ($intChange->status !== $new_data['status'])||
                            ($intChange->tracking !== $new_data['tracking'])){                      
                                $intChange = $this->MwanInterfaceChanges->newEntity($new_data);
                                $this->MwanInterfaceChanges->save($intChange);
                                //FIXME This is where we send out the email ... :-)                         
                        }else{
                            //We just update the modified field
                            $this->MwanInterfaceChanges->getBehavior('Timestamp')->touch($intChange);
                            $this->MwanInterfaceChanges->save($intChange);                     
                        }
                    
                    }else{ //Not found - First entry
                        $intChange = $this->MwanInterfaceChanges->newEntity($new_data);
                        $this->MwanInterfaceChanges->save($intChange);                  
                    }                   
                }      
            }            
        }
        $io->out("====================");
    }
}

