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


    protected $MailTransport;
    protected $RdLogger;

    public static function defaultName(): string{
        return 'interface:changes';
    }

    public function initialize(): void {

        parent::initialize();
        
        $this->UserSettings          = TableRegistry::getTableLocator()->get('UserSettings');
        $this->Clouds                = TableRegistry::getTableLocator()->get('Clouds');
        $this->CloudAdmins           = TableRegistry::getTableLocator()->get('CloudAdmins');
        
        $this->WanMwan3Status        = TableRegistry::getTableLocator()->get('WanMwan3Status');
        $this->MwanInterfaceChanges  = TableRegistry::getTableLocator()->get('MwanInterfaceChanges');
        
        $this->Aps                   = TableRegistry::getTableLocator()->get('Aps');
        $this->Nodes                 = TableRegistry::getTableLocator()->get('Nodes');
        $this->MwanInterfaces        = TableRegistry::getTableLocator()->get('MwanInterfaces');
        
        $this->MailTransport         = new \App\Service\MailTransportService();
        $this->RdLogger              = new \App\Service\RdLoggerService();
        
        $this->Alerts                = TableRegistry::getTableLocator()->get('Alerts');      
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
                                if($this->MwanInterfaceChanges->save($intChange)){
                                    //FIXME This is where we send out the email ... :-) 
                                    $this->alertPlusEmail($intChange,$io); 
                                }                       
                        }else{
                            //We just update the modified field
                            $this->MwanInterfaceChanges->getBehavior('Timestamp')->touch($intChange);
                            if($this->MwanInterfaceChanges->save($intChange)){
                                $this->alertPlusEmail($intChange,$io);
                            }                    
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
    
    
    private function alertPlusEmail($intChange,$io){
    
        $cloud_id       = null;
        $change_info    = [];
    
        if(isset($intChange->node_id)){            
            $io->info("Working with a Mesh Node");
            $node = $this->Nodes->find()->where(['Nodes.id' => $intChange->node_id])->contain(['Meshes'=> 'Clouds'])->first();
            if($node){
                if(!$node->enable_alerts){
                    $io->comment("No Alert Active for Mesh Node return");
                    return;
                }
                $cloud_id = $node->mesh->cloud_id;
                $change_info['device_mode']     = 'mesh';
                $change_info['device_name']     = $node->name;
                $change_info['device_mac']      = $node->mac;
                $change_info['device_group']    = $node->mesh->name;
                $change_info['cloud_name']      = $node->mesh->cloud->name;
                $change_info['node_id']         = $node->id;
                $change_info['mesh_id']         = $node->mesh->id;
            }
        }
        
        if(isset($intChange->ap_id)){            
            $io->info("Working with an Access Point");
            $ap = $this->Aps->find()->where(['Aps.id' => $intChange->ap_id])->contain(['ApProfiles' => 'Clouds'])->first(); 
            if($ap){
                if(!$ap->enable_alerts){
                    $io->comment("No Alert Active for AP return");
                    return;
                }
                $cloud_id = $ap->ap_profile->cloud_id;
                $change_info['device_mode']     = 'ap';
                $change_info['device_name']     = $ap->name;
                $change_info['device_mac']      = $ap->mac;
                $change_info['device_group']    = $ap->ap_profile->name;
                $change_info['cloud_name']      = $ap->ap_profile->cloud->name;
                $change_info['ap_id']           = $ap->id;
                $change_info['ap_profile_id']   = $ap->ap_profile->id;
            }           
        }     
        
        //-- Get info about the interface that is affected
        $mwanInterface = $this->MwanInterfaces->find()
            ->where(['MwanInterfaces.id' => $intChange->mwan_interface_id])
            ->first();    
        if($mwanInterface){
            $change_info['interface_name']      = $mwanInterface->name;  
            $change_info['interface_type']      = $mwanInterface->type;          
        }else{
            $io->error("No Mwan Interface found with ID ".$intChange->mwan_interface_id);
            return;
        }
        
        //Interface status 
        $change_info['interface_status'] = $intChange->status;
        $change_info['interface_up'] = $intChange->up;
                        
        //--- Should we record an alert type of event (If we reached here we should) ----
        if($cloud_id){
        
            $change_info['type'] = 'event'; //Type is event (can be alert, event or info)
            
            //Formulate description
            $up = "down";
            if($change_info['interface_up'] == '1'){
                $up = "up";
            }
            $description = "Interface ".$change_info['interface_name']." (".$change_info['interface_type'].") is ".$change_info['interface_status']." and $up";
            
            $change_info['description'] = $description;
            
            $alert = $this->Alerts->newEntity($change_info);
            if($this->Alerts->save($alert)){
                $io->info("Alert event added");
            }           
        }
        
            
        //---- Should we send an email -----    
        if($cloud_id){
            $io->out("Get Access Providers for $cloud_id");
                        
            $email_list = [];
            
            //See if alerts are active for root user
            $root_user = $this->UserSettings->find()
                ->where([
                    'UserSettings.name'     => 'alert_activate',
                    'UserSettings.value'    => '1',
                    'UserSettings.user_id'  => 44,
                ])
                ->contain(['Users'])
                ->first();
                
            if($root_user){
                $root_email = $root_user->user->email;
                $email_list[] = $root_email;
            }
                         
            //Get all the cloud admins for this cloud            
            $cloudAdmins = $this->CloudAdmins->find()
                ->where([
                    'CloudAdmins.cloud_id' => $cloud_id,
                    'CloudAdmins.permissions' => 'admin'
                ])
                ->contain([
                    'Users' => [
                        'UserSettings' => function ($q) {
                            return $q->where([
                                'UserSettings.name'     => 'alert_activate',
                                'UserSettings.value'    => '1'
                            ]);
                        }
                    ]
                ])
                ->all();
                           
            foreach($cloudAdmins as $ca){ 
                //print_r($ca) ;      
                if($ca->user->user_settings){
                    $admin_email = $ca->user->email;
                    $email_list[] = $admin_email;
                }            
            }
            
            //Remove Duplicate email adresses if there might be
            $email_list = array_unique($email_list);
            if($email_list){
                $io->success("Active Alerts List found sent out some emails");
            }  
                                                         
        }       
             
        $io->success("Up to Here");
 
    }
    

}

