<?php
namespace App\Shell;

use Cake\Console\Shell;

class AddMeshLastContactShell extends Shell{

    public function initialize(){
        parent::initialize();
        $this->loadModel('Meshes');
    }

    public function main(){
        $this->out('Refreshing Last Contact');  
        $query = $this->{'Meshes'}->find();
        
        $query->contain(['Nodes' => [
            'sort' => ['Nodes.last_contact' => 'DESC']
        ]]);    
        $q_r = $query->all();
        foreach($q_r as $m){
            $this->out("Doing Mesh: ".$m->name);
            $found_flag = false;
            foreach($m->nodes as $n){
                if($found_flag){
                    continue;
                }  
                if($n->last_contact){  
                    $this->out("Doing Node: ".$n->last_contact);
                    $found_flag = true;
                    $data = [];
                    $data['last_contact'] = $n->last_contact;
                    $this->{'Meshes'}->patchEntity($m, $data);
                    $this->{'Meshes'}->save($m);
                } 
            }
        }
    }
}
