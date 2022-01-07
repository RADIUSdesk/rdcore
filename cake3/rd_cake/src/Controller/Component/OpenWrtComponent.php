<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class OpenWrtComponent extends Component {

    private $includes = [];
    
    public function getEntries($mesh_name){

        $commands = [];

        $mesh = TableRegistry::get('Meshes');

        $q_r = $mesh->find()->where(['name' => $mesh_name])->first();

        //Is it a valid mesh?
        if($q_r){
            $mesh_id    = $q_r->id;
            $m_ssid     = $q_r->ssid;
            $m_bssid    = $q_r->bssid;
            //Remove the wmesh entry; add it again
            array_push($commands, ["action" => "execute", "data" => "uci delete wireless.wmesh"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wmesh=wifi-iface"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wmesh.device='radio0'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wmesh.ifname='adhoc0'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wmesh.network='mesh'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wmesh.mode='adhoc'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wmesh.ssid='$m_ssid'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wmesh.bssid='$m_bssid'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wmesh.hidden='1'"]);
            
            //Remove the wconf entry; add it again
            array_push($commands, ["action" => "execute", "data" => "uci delete wireless.wconf"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wconf=wifi-iface"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wconf.device='radio0'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wconf.network='conf'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wconf.mode='ap'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wconf.ssid='meshadmin'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wconf.encryption='psk2'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wconf.key='veryvery'"]);
            array_push($commands, ["action" => "execute", "data" => "uci set wireless.wconf.hidden='1'"]);

            array_push($commands, ["action" => "execute", "data" => "uci commit wireless"]);

        }

        return $commands;

//        $entry = TableRegistry::get('MeshEntries');
//        $q_r = $entry->find()->where(['MeshEntry.mesh_id' => $mesh_id])->all();
//
//        foreach($q_r as $i){
///*
//            //Remove the wconf entry; add it again
//            array_push($commands,array("action" => "execute", "data" => "uci delete wireless.wconf"));
//            array_push($commands,array("action" => "execute", "data" => "uci set wireless.wconf=wifi-iface"));
//            array_push($commands,array("action" => "execute", "data" => "uci set wireless.wconf.device='radio0'"));
//            array_push($commands,array("action" => "execute", "data" => "uci set wireless.wconf.network='conf'"));
//            array_push($commands,array("action" => "execute", "data" => "uci set wireless.wconf.mode='ap'"));
//            array_push($commands,array("action" => "execute", "data" => "uci set wireless.wconf.ssid='meshadmin'"));
//            array_push($commands,array("action" => "execute", "data" => "uci set wireless.wconf.encryption='psk2'"));
//            array_push($commands,array("action" => "execute", "data" => "uci set wireless.wconf.key='veryvery'"));
//            array_push($commands,array("action" => "execute", "data" => "uci set wireless.wconf.hidden='1'"));
//
//            print_r($i);
//*/
//
//        }
    }

}