<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake update_mesh_dailies 

/*--==== UpdateUserStatsDailies Shell ===
Our daily graphs are taken from user_stats and has a minimum interval of 60 minutes (1 Hour). 
This means that any number of entries for a realm/nasidentifier/username/callingstationid can be consolidated in that slot to ONLY ONE.
The other entries can be removed, making out table more compact, thus the name of this CakePHP Shell Script

We recommend that you run this through Cron around 3AM (UTC) 
The script will stop at the start of the current day (e.g. if it start at 03:00 it will actually only compress entries up to 00:00 of the current day (now))
The script will also record which where it last stopped so it does not need to start from the first entry.
*/

namespace App\Shell;

namespace App\Shell;

use Cake\Console\Shell;
use Cake\I18n\Time;
use Cake\Datasource\ConnectionManager;
use Cake\I18n\FrozenTime;

class UpdateMeshDailiesShell extends Shell{

    protected $start_date  = false;
    protected $end_date    = false;
    protected $counter     = 0;
    
    public function initialize(){
        parent::initialize();
        $this->loadModel('NodeStations');
        $this->loadModel('NodeStationsDailies');
        $this->loadModel('NodeIbssConnections');
        $this->loadModel('UserSettings');
    }
    
    public function main(){
        $this->out("<info>Start Porting of the NodeStations and NodeIbssConnections table's data to *_dailies table</info>");
        $start_at = $this->_getStartAt();
        if($start_at){
            $start_of_today = FrozenTime::now()->startOfDay();
            if($start_at == $start_of_today){
                $this->out("<info>Porting up to date - Bye (".$start_at->toCookieString().")</info>");
            }else{
                $this->start_date = $start_at;
                $this->end_date   = $start_of_today;
                $this->out("<info>Start at ".$this->start_date->toCookieString()."</info>");
                $this->out("<info>END at ".$this->end_date->toCookieString()."</info>");   
                $this->_doWork();    
                //Update to the start of today
                $this->_updateStartAt();
            }
        }else{
            $this->out("<info>node_stations table seems empty - nothing to port</info>");
        }
    }
       
    private function _doWork(){    
        while($this->start_date < $this->end_date){        
            $day_start = $this->start_date;
            $day_end   = $this->start_date->addDays(1)->subSeconds(1);
            $this->out("<info>Section Starts ".$day_start->toCookieString()."</info>");
            $this->out("<info>Section Ends ".$day_end ->toCookieString()."</info>");         
            $this->start_date = $this->start_date->addDays(1);
            
            $ent_list = $this->{'NodeStations'}->find()
                ->where(['NodeStations.modified >=' => $day_start,'NodeStations.modified <=' => $day_end])
                ->contain(['Nodes' => ['Meshes']])
                ->all();
                
            $data_workbench = [];
                
            foreach($ent_list as $ent){
            
                $mesh_id = $ent->node->mesh->id;
            
                if(!array_key_exists($mesh_id,$data_workbench)){
                    $data_workbench[$mesh_id]  = [];   
                    $data_workbench[$mesh_id][$ent->node_id]  = [];
                    $data_workbench[$mesh_id][$ent->node_id][$ent->mac] = [];
                    $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number] = [];
                    $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id] = [];
                    $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id][$ent->frequency_band] = [];
                }else{
                    
                    if(!array_key_exists($ent->node_id,$data_workbench[$mesh_id])){
                        $data_workbench[$mesh_id][$ent->node_id] = [];
                        $data_workbench[$mesh_id][$ent->node_id][$ent->mac] = [];
                        $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number] = [];
                        $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id] = [];
                        $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id][$ent->frequency_band] = [];
                    }else{
                    
                        if(!array_key_exists($ent->mac,$data_workbench[$mesh_id][$ent->node_id])){
                            $data_workbench[$mesh_id][$ent->node_id][$ent->mac] = [];
                            $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number] = [];
                            $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id] = [];
                            $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id][$ent->frequency_band] = [];
                        }else{  
                            if(!array_key_exists($ent->radio_number,$data_workbench[$mesh_id][$ent->node_id][$ent->mac])){
                                $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number] = [];
                                $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id] = [];
                                $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id][$ent->frequency_band] = [];
                            }else{
                                if(!array_key_exists($ent->mesh_entry_id,$data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number])){
                                    $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id] = [];
                                    $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id][$ent->frequency_band] = [];
                                }else{
                                     if(!array_key_exists($ent->frequency_band,$data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id])){
                                        $data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id][$ent->frequency_band] = [];
                                    } 
                                }
                            }                
                        }                    
                    }                                 
                }
                $info_array = [
                    'id'               => $ent->id,
                    'tx_bytes'         => $ent->tx_bytes,
                    'rx_bytes'         => $ent->rx_bytes,
                    'tx_bitrate'       => $ent->rx_bitrate,
                    'rx_bitrate'       => $ent->rx_bitrate,
                    'signal_avg'       => $ent->signal_avg,
                    'timestamp'        => $ent->modified
                ];
                array_push($data_workbench[$mesh_id][$ent->node_id][$ent->mac][$ent->radio_number][$ent->mesh_entry_id][$ent->frequency_band],$info_array);
            }
            //print_r($data_workbench);
            $this->_add_to_dailies($data_workbench);       
        }   
    }
    
    private function _add_to_dailies($data_workbench){
    
        foreach(array_keys($data_workbench) as $mesh_id){ 
            foreach(array_keys($data_workbench[$mesh_id]) as $node_id){
                foreach(array_keys($data_workbench[$mesh_id][$node_id]) as $mac){
                    foreach(array_keys($data_workbench[$mesh_id][$node_id][$mac]) as $radio_number){
                        foreach(array_keys($data_workbench[$mesh_id][$node_id][$mac][$radio_number]) as $mesh_entry_id){
                            foreach(array_keys($data_workbench[$mesh_id][$node_id][$mac][$radio_number][$mesh_entry_id]) as $frequency_band){                           
                                $working_set        = $data_workbench[$mesh_id][$node_id][$mac][$radio_number][$mesh_entry_id][$frequency_band];
                                $first_id           = $working_set[0]['id'];
                                $first_timestamp    = $working_set[0]['timestamp'];
                                $tx_bytes           = 0;
                                $rx_bytes           = 0; 
                                $tx_bitrate         = 0;
                                $rx_bitrate         = 0;
                                $signal_avg         = 0;
                                $items              = 0;                         
                                foreach($working_set as $row){
                                    $rx_bytes   = $rx_bytes + $row['rx_bytes'];    
                                    $tx_bytes   = $tx_bytes + $row['tx_bytes'];
                                    $rx_bitrate = $rx_bitrate + $row['rx_bitrate'];    
                                    $tx_bitrate = $tx_bitrate + $row['tx_bitrate'];
                                    $signal_avg = $signal_avg + abs($row['signal_avg']);
                                    $items = $items + 1;        
                                }   
                                $signal_avg = ceil(-1 * ($signal_avg/$items)); //Make it negative and round it up                          
                                $this->counter = $this->counter+1;
                                $this->out("<info>$this->counter )Add MESH ID $mesh_id NODE ID $node_id MAC $mac $signal_avg</info>");                             
                                $data = [
                                    'mac'               => $mac,
                                    'node_station_id'   => $first_id,
                                    'mesh_id'           => $mesh_id,
                                    'mesh_entry_id'     => $mesh_entry_id,
                                    'node_id'           => $node_id,
                                    'radio_number'      => $radio_number,
                                    'frequency_band'    => $frequency_band,
                                    'tx_bytes'          => $tx_bytes,
                                    'rx_bytes'          => $rx_bytes,
                                    'tx_bitrate'        => ceil($tx_bitrate/$items),
                                    'rx_bitrate'        => ceil($rx_bitrate/$items),
                                    'signal_avg'        => $signal_avg,
                                    'timestamp'         => $first_timestamp
                                ];
                                
                                if($signal_avg != 0){                                                        
                                    $ent_exists = $this->{'NodeStationsDailies'}->find()->where(['NodeStationsDailies.node_station_id'=> $first_id])->first();
                                    if($ent_exists){
                                        $this->out("<info>Skipping Double Entry for $mac in NodeStationsDailies.node_station_id of $first_id</info>");
                                    }else{
                                        $this->out("<info>Adding Entry for $mac in NodeStationsDailies of $first_id</info>");
                                        $entity = $this->{'NodeStationsDailies'}->newEntity($data);
                                        $this->{'NodeStationsDailies'}->save($entity);
                                    }
                                }                                                              
                            }
                        }
                    }
                }
            }
        }  
    }
    
   //Determine where we need to start from 
   private function _getStartAt(){ 
        $frozen_t = false;    
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'NodeStationsDailiesStoppedAt'])->first(); 
        if($e_us){
            $frozen_t = FrozenTime::createFromTimestamp($e_us->value)->startOfDay();
        }else{
            //Get the first entry
            $ent_us = $this->NodeStations->find()->order(['NodeStations.created' => 'ASC'])->first();
            if($ent_us){
                $time = new FrozenTime($ent_us->created);
                $frozen_t   = $time->startOfDay();
            }
        }
        return $frozen_t;  
    }
    
    private function _updateStartAt(){
        $start_of_day = FrozenTime::now()->startOfDay();
        $start_of_day_timestamp = $start_of_day->toUnixString();
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'NodeStationsDailiesStoppedAt'])->first();
        if($e_us){
            $this->{'UserSettings'}->patchEntity($e_us,['value' => $start_of_day_timestamp]);
        }else{
            $e_us = $this->{'UserSettings'}->newEntity(['user_id' => -1,'name' => 'NodeStationsDailiesStoppedAt','value' => $start_of_day_timestamp]);
        }
        $this->{'UserSettings'}->save($e_us);
    }        
}

?>
