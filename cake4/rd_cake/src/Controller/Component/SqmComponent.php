<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class SqmComponent extends Component {

    private $Nodes;
    private $Aps;
    private $SqmProfiles;
    private $stp_dflt = 0;
    
    protected $addOnItems = ['enabled' => 1, 'debug_logging' => 0, 'verbosity' => 5];
    protected $usedItems  = ['download','upload','qdisc','script','linklayer'];

    public function initialize(array $config): void{
    
        $this->Nodes = TableRegistry::get('Nodes');
        $this->Aps = TableRegistry::get('Aps');
        $this->SqmProfiles = TableRegistry::get('SqmProfiles');
    }

    public function jsonForMac($mac){

        $sqmList = [];
        
        //=== We first try and a normal AP ===
        $eAp     = $this->Aps->find()
            ->where(['Aps.mac' => $mac])
            ->contain(['ApProfiles'])
            ->first();

        if ($eAp) {           
            $ap_profile = $this->{'Aps'}->find()
                ->contain([
                    'ApProfiles' => [
                        'ApProfileExits' => [
                            'ApProfileExitApProfileEntries'
                        ]
                    ]
                ])
                ->where(['ApProfiles.id' => $eAp->ap_profile_id,'Aps.mac' =>$mac])
                ->first();                         
            $sqmList    = $this->buildApProfileJson($ap_profile);            
        } else {
            $eNode = $this->Nodes->find()
                ->where(['Nodes.mac' => $mac])
                ->contain(['Meshes'])
                ->first();

            if ($eNode) {
                // Handle Node case
            }
        }
        
        //=== Next We try as a mesh node ===
        $eNode     = $this->Nodes->find()
            ->where(['Nodes.mac' => $mac])
            ->contain(['Meshes'])
            ->first();
        if ($eNode) {
        
            $node = $this->{'Nodes'}->find()
                ->contain([
                    'Meshes' => [
                        'MeshExits' => [
                            'MeshExitMeshEntries'
                        ]
                    ]
                ])
                ->where(['Meshes.id' => $eNode->mesh_id,'Nodes.mac' =>$mac])
                ->first();                         
            $sqmList    = $this->buildMeshJson($node);        
        } 
        
        return $sqmList;
    }
    
    private function buildApProfileJson($ap_profile){
        
        $bridges        = [];
        $ifCounter      = 0;
        $loopCounter    = 0;        

        foreach ($ap_profile->ap_profile->ap_profile_exits as $apProfileExit) {
        
            $hasEntriesAttached = false;
            $type               = $apProfileExit->type;
            $notVlan            = true;

            if (($apProfileExit->vlan > 0) && ($apProfileExit->type === 'nat')) {
                $ifName     = 'ex_v' . $apProfileExit->vlan;
                $notVlan    = false;
            } else {
                $ifName = 'ex_' . $this->_number_to_word($ifCounter);
            }

            if (count($apProfileExit->ap_profile_exit_ap_profile_entries) > 0) {
                $hasEntriesAttached = true;
                
                //-- Look for internal VLANs --
                foreach($apProfileExit->ap_profile_exit_ap_profile_entries as $entry){                
                    if(preg_match('/^-9/',$entry->ap_profile_entry_id)){ 	
		            	$dynamicVlan    = $entry->ap_profile_entry_id;
		            	$dynamicVlan    = str_replace("-9","",$dynamicVlan);
		            	$ifName         = 'ex_v'.$dynamicVlan; 
		            	$notVlan        = false;           
		            }		            		                                             
                }                             
            }

            if ($hasEntriesAttached || (($apProfileExit->vlan > 0) && ($apProfileExit->type === 'nat'))) {
            
                switch ($type) {
                    case 'tagged_bridge':
                    case 'nat':
                    case 'captive_portal':
                    case 'openvpn_bridge':
                    case 'pppoe_server':
                        array_push($bridges, [
                            'name'              => "br-$ifName", 
                            'sqm_profile_id'    => $apProfileExit->sqm_profile_id
                        ]);
                        if($notVlan){
                            $ifCounter ++;
                        }
                        $loopCounter++;
                        continue 2;
                }
            }         
        }
                
        //-- Build the Lookup --
        $sqmLookup  = [];
        $sqmIfs     = [];
        $sqmFinal   = [];

        foreach ($bridges as $bridge) {
            $sqmProfileId   = $bridge['sqm_profile_id'];
            $sqmIfname      = $bridge['name'];

            if ($sqmProfileId !== 0) {
                if (!isset($sqmLookup[$sqmProfileId])) {
                    $sqmEntity = $this->SqmProfiles->find()->where(['id' => $sqmProfileId])->first();
                    if ($sqmEntity) {
                        $detail = array_merge(
                            array_intersect_key($sqmEntity->toArray(), array_flip($this->usedItems)),
                            $this->addOnItems
                        );
                        $sqmLookup[$sqmProfileId] = $detail;
                    }
                }

                $sqmIfs[$sqmProfileId][] = $sqmIfname;
            }
        }

        foreach (array_keys($sqmLookup) as $key) {
            $sqmFinal[] = [
                'detail'        => $sqmLookup[$key],
                'interfaces'    => $sqmIfs[$key],
            ];
        }  
          
        return $sqmFinal;
    } 
    
     private function buildMeshJson($node){
        
        $bridges        = [];
        $ifCounter      = 2; //With the mesh we start at two since zero (zro) and one is used for the mesh and info network
        $loopCounter    = 0;        

        foreach ($node->mesh->mesh_exits as $meshExit) {
        
            $hasEntriesAttached = false;
            $type               = $meshExit->type;
            $notVlan            = true;

            if (($meshExit->vlan > 0) && ($meshExit->type === 'nat')) {
                $ifName     = 'ex_v' . $meshExit->vlan;
                $notVlan    = false;
            } else {
                $ifName = 'ex_' . $this->_number_to_word($ifCounter);
            }

            if (count($meshExit->mesh_exit_mesh_entries) > 0) {
                $hasEntriesAttached = true;
                
                //-- Look for internal VLANs --
                foreach($meshExit->mesh_exit_mesh_entries as $entry){                
                    if(preg_match('/^-9/',$entry->mesh_entry_id)){ 	
		            	$dynamicVlan    = $entry->mesh_entry_id;
		            	$dynamicVlan    = str_replace("-9","",$dynamicVlan);
		            	$ifName         = 'ex_v'.$dynamicVlan;
		            	$notVlan        = false;            
		            }		            		                                             
                }                             
            }

            if ($hasEntriesAttached || (($meshExit->vlan > 0) && ($meshExit->type === 'nat'))) {
            
                switch ($type) {
                    case 'tagged_bridge':
                    case 'nat':
                    case 'captive_portal':
                    case 'openvpn_bridge':
                    case 'pppoe_server':
                        array_push($bridges, [
                            'name'              => "br-$ifName", 
                            'sqm_profile_id'    => $meshExit->sqm_profile_id
                        ]);
                        if($notVlan){
                            $ifCounter ++;
                        }
                        $loopCounter++;
                        continue 2;
                }
            }         
        }
                
        //-- Build the Lookup --
        $sqmLookup  = [];
        $sqmIfs     = [];
        $sqmFinal   = [];

        foreach ($bridges as $bridge) {
            $sqmProfileId   = $bridge['sqm_profile_id'];
            $sqmIfname      = $bridge['name'];

            if ($sqmProfileId !== 0) {
                if (!isset($sqmLookup[$sqmProfileId])) {
                    $sqmEntity = $this->SqmProfiles->find()->where(['id' => $sqmProfileId])->first();
                    if ($sqmEntity) {
                        $detail = array_merge(
                            array_intersect_key($sqmEntity->toArray(), array_flip($this->usedItems)),
                            $this->addOnItems
                        );
                        $sqmLookup[$sqmProfileId] = $detail;
                    }
                }

                $sqmIfs[$sqmProfileId][] = $sqmIfname;
            }
        }

        foreach (array_keys($sqmLookup) as $key) {
            $sqmFinal[] = [
                'detail'        => $sqmLookup[$key],
                'interfaces'    => $sqmIfs[$key],
            ];
        }  
          
        return $sqmFinal;
    }   
   
    //We shorten this to work with the SQM script (if its to long it truncates and breaks)
    private function _number_to_word($number) {
        $dictionary  = [
            0                   => 'zro',
            1                   => 'one',
            2                   => 'two',
            3                   => 'thr',
            4                   => 'for',
            5                   => 'fve',
            6                   => 'six',
            7                   => 'svn',
            8                   => 'egt',
            9                   => 'nne',
            10                  => 'ten',
            11                  => 'elv',
            12                  => 'tve',
            13                  => 'trt',
            14                  => 'frt',
            15                  => 'fft',
            16                  => 'sxt',
            17                  => 'svt',
            18                  => 'eit',
            19                  => 'nnt',
            20                  => 'twt'
        ];
        return($dictionary[$number]);
    }     
}

