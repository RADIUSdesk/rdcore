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
                $ifName     = 'ex_vlan' . $apProfileExit->vlan;
                $notVlan    = false;
            } else {
                $ifName = 'ex_' . $this->_number_to_word($ifCounter);
            }

            if (count($apProfileExit->ap_profile_exit_ap_profile_entries) > 0) {
                $hasEntriesAttached = true;
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
    
    private function _number_to_word($number) {
        $dictionary  = [
            0                   => 'zero',
            1                   => 'one',
            2                   => 'two',
            3                   => 'three',
            4                   => 'four',
            5                   => 'five',
            6                   => 'six',
            7                   => 'seven',
            8                   => 'eight',
            9                   => 'nine',
            10                  => 'ten',
            11                  => 'eleven',
            12                  => 'twelve',
            13                  => 'thirteen',
            14                  => 'fourteen',
            15                  => 'fifteen',
            16                  => 'sixteen',
            17                  => 'seventeen',
            18                  => 'eighteen',
            19                  => 'nineteen',
            20                  => 'twenty'
        ];
        return($dictionary[$number]);
    }   
}

