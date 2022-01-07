<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 29-05-2013
//------------------------------------------------------------

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\Core\Configure;
use Cake\ORM\TableRegistry;

class KickerComponent extends Component {

    protected $radclient;
    protected $pod_command = '/etc/MESHdesk/pod.lua';
    
    public function initialize(array $config){
        //Please Note that we assume the Controller has a JsonErrors Component Included which we can access.
        $this->DynamicClients           = TableRegistry::get('DynamicClients');
        $this->MeshExitCaptivePortals   = TableRegistry::get('MeshExitCaptivePortals'); 
        $this->MeshExits                = TableRegistry::get('MeshExits'); 
        $this->Nodes                    = TableRegistry::get('Nodes');
        $this->NodeActions              = TableRegistry::get('NodeActions'); 
    }

    function kick($ent){
        //---Location of radclient----
        $nasidentifier  = $ent->nasidentifier;
        $radacctid      = $ent->radacctid;
        $cp = $this->MeshExitCaptivePortals->find()->where(['MeshExitCaptivePortals.radius_nasid' => $nasidentifier])->first();
        if($cp){
            $exit_id = $cp->mesh_exit_id;
            $exit = $this->MeshExits->find()->where(['MeshExits.id' => $exit_id])->first();
            if($exit){
                $mesh_id    = $exit->mesh_id;
                $gw_nodes   = $this->Nodes->find()->where(['Nodes.gateway !=' => 'none','Nodes.mesh_id' => $mesh_id])->all();
                foreach($gw_nodes as $node){
                    $node_id = $node->id;
                    $command = $this->pod_command.' '.$radacctid;
                    $a_data = ['node_id' => $node_id,'command' => $command, 'status' => 'awaiting'];
                    $already_set = $this->NodeActions->find()->where($a_data)->first();
                    if(!($already_set)){
                        $entity = $this->{'NodeActions'}->newEntity($a_data);
                        if ($this->{'NodeActions'}->save($entity)){
                        
                        }
                    }else{
                    
                    }
                }
            }              
        }    
        return $data = [];       
    }
}
